import { afterAll, describe, expect, it } from "vitest";

import { createSupabaseClient, createSupabaseStores } from "./stores";

/**
 * LIVE tests against a real Supabase project. Skipped unless
 * SUPABASE_INTEGRATION_TESTS=1 and SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 * are set. Point them at a non-production project: rows are written.
 * The concurrency check uses its own counter key, never `site_visits`.
 */
const enabled =
  process.env.SUPABASE_INTEGRATION_TESTS === "1" &&
  !!process.env.SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;

describe.skipIf(!enabled)("Supabase live integration", () => {
  const db = enabled ? createSupabaseClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!) : null!;
  const stores = enabled ? createSupabaseStores(db) : null!;
  const TEST_COUNTER = "integration_test";
  const marker = `itest-${crypto.randomUUID().slice(0, 8)}`;

  afterAll(async () => {
    if (!enabled) return;
    await db.from("memories").delete().like("message", `${marker}%`);
    await db.from("site_counters").delete().eq("counter_key", TEST_COUNTER);
  });

  it("increments atomically under truly concurrent requests", async () => {
    await db.from("site_counters").upsert({ counter_key: TEST_COUNTER, counter_value: 0 });
    const tokens = Array.from({ length: 40 }, () => crypto.randomUUID());
    // Each token sent twice, all at once: 40 increments expected.
    await Promise.all(
      [...tokens, ...tokens].map((t) => db.rpc("record_visit", { p_token: t, p_counter_key: TEST_COUNTER })),
    );
    const { data } = await db.from("site_counters").select("counter_value").eq("counter_key", TEST_COUNTER).single();
    expect(Number(data!.counter_value)).toBe(40);
  });

  it("stores submissions as pending and hides them from the public list", async () => {
    await stores.memories.insertPending({ visitorName: "Integration", message: `${marker} hello`, formSlug: "star" });
    const listed = await stores.memories.listApproved({ limit: 50 });
    expect(listed.some((m) => m.message.startsWith(marker))).toBe(false);
  });

  it("reads the site visit counter", async () => {
    expect(await stores.counters.getVisits()).toBeGreaterThanOrEqual(0);
  });
});
