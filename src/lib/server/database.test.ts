import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { FUTURE_SLUGS } from "@/lib/memories/validation";

/**
 * Runs the real migration SQL on PGlite (PostgreSQL compiled to WASM).
 * Supabase's roles and default grants are recreated first so RLS and the
 * revokes are actually exercised. PGlite is single-connection, so these
 * tests verify SQL correctness and semantics, not true parallel contention.
 */

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");

const SUPABASE_BOOTSTRAP = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
`;

let db: PGlite;

async function asRole<T>(role: string, fn: () => Promise<T>): Promise<T> {
  await db.exec(`set role ${role}`);
  try {
    return await fn();
  } finally {
    await db.exec("reset role");
  }
}

async function insertMemory(values: Record<string, string | null>) {
  const cols = Object.keys(values);
  const params = cols.map((_, i) => `$${i + 1}`).join(", ");
  return db.query(`insert into memories (${cols.join(", ")}) values (${params}) returning *`, Object.values(values));
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_BOOTSTRAP);
  for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
  }
}, 60_000);

afterAll(async () => {
  await db?.close();
});

describe("memories table", () => {
  it("defaults new submissions to pending with an id and timestamp", async () => {
    const { rows } = await insertMemory({ visitor_name: "Mia", message: "I want to fly!" });
    const row = rows[0] as { id: string; status: string; created_at: Date; form_slug: string | null };
    expect(row.status).toBe("pending");
    expect(row.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(row.created_at).toBeInstanceOf(Date);
    expect(row.form_slug).toBeNull();
  });

  it("accepts every canonical future slug and rejects others", async () => {
    for (const slug of FUTURE_SLUGS) {
      await expect(insertMemory({ visitor_name: "A", message: "m", form_slug: slug })).resolves.toBeDefined();
    }
    await expect(insertMemory({ visitor_name: "A", message: "m", form_slug: "normal" })).rejects.toThrow();
    await expect(insertMemory({ visitor_name: "A", message: "m", form_slug: "moon" })).rejects.toThrow();
  });

  it("enforces lengths, non-blank text and status values", async () => {
    await expect(insertMemory({ visitor_name: "x".repeat(41), message: "m" })).rejects.toThrow();
    await expect(insertMemory({ visitor_name: "A", message: "x".repeat(281) })).rejects.toThrow();
    await expect(insertMemory({ visitor_name: "   ", message: "m" })).rejects.toThrow();
    await expect(insertMemory({ visitor_name: "A", message: "  " })).rejects.toThrow();
    await expect(insertMemory({ visitor_name: "A", message: "m", status: "published" })).rejects.toThrow();
    await expect(insertMemory({ visitor_name: "x".repeat(40), message: "😀".repeat(280) })).resolves.toBeDefined();
  });
});

describe("row-level security", () => {
  it("is enabled on every public table", async () => {
    const { rows } = await db.query<{ relname: string; relrowsecurity: boolean }>(
      `select relname, relrowsecurity from pg_class
       where relnamespace = 'public'::regnamespace and relkind = 'r'`,
    );
    expect(rows.length).toBeGreaterThanOrEqual(4);
    for (const r of rows) expect({ table: r.relname, rls: r.relrowsecurity }).toEqual({ table: r.relname, rls: true });
  });

  it("lets anonymous visitors read approved memories only", async () => {
    await insertMemory({ visitor_name: "Approved", message: "hello", status: "approved" });
    await insertMemory({ visitor_name: "Rejected", message: "nope", status: "rejected" });
    const { rows } = await asRole("anon", () => db.query<{ status: string }>("select status from memories"));
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((r) => r.status === "approved")).toBe(true);
  });

  it("denies anonymous and authenticated writes", async () => {
    for (const role of ["anon", "authenticated"]) {
      await expect(
        asRole(role, () => db.query("insert into memories (visitor_name, message) values ('x', 'y')")),
      ).rejects.toThrow();
      await expect(asRole(role, () => db.query("update memories set status = 'approved'"))).rejects.toThrow();
      await expect(asRole(role, () => db.query("delete from memories"))).rejects.toThrow();
      await expect(asRole(role, () => db.query("update site_counters set counter_value = 999"))).rejects.toThrow();
      await expect(asRole(role, () => db.query("select * from site_counters"))).rejects.toThrow();
      await expect(asRole(role, () => db.query("select * from rate_limits"))).rejects.toThrow();
    }
  });

  it("only lets the service role call the database functions", async () => {
    await expect(
      asRole("anon", () => db.query("select record_visit(gen_random_uuid())")),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asRole("anon", () => db.query("select consume_rate_limit('x', 1, 60)")),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asRole("service_role", () => db.query("select record_visit(gen_random_uuid())")),
    ).resolves.toBeDefined();
  });
});

describe("visit counter", () => {
  const count = async () =>
    Number((await db.query<{ v: string }>("select counter_value as v from site_counters where counter_key = 'site_visits'")).rows[0].v);
  const record = async (token: string) =>
    Number((await db.query<{ v: string }>("select record_visit($1::uuid) as v", [token])).rows[0].v);

  it("starts initialized and rejects negative values", async () => {
    const { rows } = await db.query("select * from site_counters where counter_key = 'site_visits'");
    expect(rows).toHaveLength(1);
    await expect(db.query("update site_counters set counter_value = -1")).rejects.toThrow();
  });

  it("increments once per token and is idempotent on retries", async () => {
    const before = await count();
    const token = "11111111-1111-4111-8111-111111111111";
    expect(await record(token)).toBe(before + 1);
    expect(await record(token)).toBe(before + 1);
    expect(await record(token)).toBe(before + 1);
    expect(await count()).toBe(before + 1);
  });

  it("counts every distinct token when many requests are issued at once", async () => {
    const before = await count();
    const tokens = Array.from({ length: 25 }, () => crypto.randomUUID());
    const results = await Promise.all([...tokens, ...tokens].map(record));
    expect(await count()).toBe(before + 25);
    expect(new Set(results).size).toBe(25); // each increment returned a distinct value
  });

  it("raises for an unknown counter instead of silently returning null", async () => {
    await expect(db.query("select record_visit(gen_random_uuid(), 'missing')")).rejects.toThrow(/Unknown counter/);
  });
});

describe("shared rate limiter", () => {
  it("allows up to the limit per window, per bucket", async () => {
    const hit = async (bucket: string) =>
      (await db.query<{ ok: boolean }>("select consume_rate_limit($1, 2, 600) as ok", [bucket])).rows[0].ok;
    expect([await hit("a"), await hit("a"), await hit("a")]).toEqual([true, true, false]);
    expect(await hit("b")).toBe(true);
  });

  it("starts a new window once the old one has expired", async () => {
    await db.query("select consume_rate_limit('c', 1, 600)");
    await db.query("update rate_limits set window_start = now() - interval '11 minutes' where bucket = 'c'");
    const { rows } = await db.query<{ ok: boolean }>("select consume_rate_limit('c', 1, 600) as ok");
    expect(rows[0].ok).toBe(true);
  });
});
