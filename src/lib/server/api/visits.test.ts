import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ApiErrorResponse, VisitsResponse } from "@/types/api";
import { createTestBackend, jsonRequest } from "./test-backend";
import { createVisitsHandlers } from "./visits";

const URL_BASE = "http://localhost/api/visits";

let t: ReturnType<typeof createTestBackend>;
let api: ReturnType<typeof createVisitsHandlers>;

beforeEach(() => {
  t = createTestBackend();
  api = createVisitsHandlers(() => t.backend);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const visit = (visitId: unknown, headers?: Record<string, string>) =>
  api.POST(jsonRequest(URL_BASE, { visitId }, headers));
const countOf = async (res: Response) => ((await res.json()) as VisitsResponse).count;

describe("GET /api/visits", () => {
  it("returns the initial count", async () => {
    const res = await api.GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ count: 0 });
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("returns 503 without leaking details when the database fails", async () => {
    t.state.fail = true;
    const res = await api.GET();
    expect(res.status).toBe(503);
    expect(((await res.json()) as ApiErrorResponse).error.code).toBe("unavailable");
  });

  it("returns 503 when the database isn't configured", async () => {
    expect((await createVisitsHandlers(() => null).GET()).status).toBe(503);
  });
});

describe("POST /api/visits", () => {
  it("records a visit and returns the updated count", async () => {
    const res = await visit(crypto.randomUUID());
    expect(res.status).toBe(200);
    expect(await countOf(res)).toBe(1);
    expect(await countOf(await api.GET())).toBe(1);
  });

  it("does not double-count retries of the same visitId", async () => {
    const id = crypto.randomUUID();
    expect(await countOf(await visit(id))).toBe(1);
    expect(await countOf(await visit(id))).toBe(1);
    expect(await countOf(await visit(id.toUpperCase()))).toBe(1); // same UUID, different case
    expect(await countOf(await visit(crypto.randomUUID()))).toBe(2);
  });

  it("counts concurrent distinct visits exactly once each", async () => {
    const ids = Array.from({ length: 10 }, () => crypto.randomUUID());
    const ips = ids.map((_, i) => ({ "x-forwarded-for": `198.51.100.${i}` }));
    await Promise.all(ids.map((id, i) => visit(id, ips[i])));
    expect(await countOf(await api.GET())).toBe(10);
  });

  it.each([
    ["missing visitId", {}],
    ["non-UUID visitId", { visitId: "abc" }],
    ["numeric visitId", { visitId: 123 }],
  ])("rejects %s", async (_label, body) => {
    const res = await api.POST(jsonRequest(URL_BASE, body));
    expect(res.status).toBe(400);
    expect(((await res.json()) as ApiErrorResponse).error.code).toBe("validation_failed");
    expect(t.state.visits).toBe(0);
  });

  it("rejects malformed JSON and oversized bodies", async () => {
    expect((await api.POST(jsonRequest(URL_BASE, "{"))).status).toBe(400);
    expect((await api.POST(jsonRequest(URL_BASE, { visitId: crypto.randomUUID(), pad: "x".repeat(500) }))).status).toBe(413);
  });

  it("rate-limits obvious abuse from one client", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 31; i++) statuses.push((await visit(crypto.randomUUID())).status);
    expect(statuses.slice(0, 30).every((s) => s === 200)).toBe(true);
    expect(statuses[30]).toBe(429);
    expect(t.state.visits).toBe(30);
  });

  it("handles database failure safely", async () => {
    t.state.fail = true;
    const res = await visit(crypto.randomUUID());
    expect(res.status).toBe(503);
    expect(await res.text()).not.toMatch(/secret|sk_live|5432/i);
  });
});
