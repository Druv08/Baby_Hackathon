import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ApiErrorResponse, MemoriesResponse } from "@/types/api";
import { createMemoriesHandlers } from "./memories";
import { createTestBackend, jsonRequest } from "./test-backend";

const URL_BASE = "http://localhost/api/memories";

let t: ReturnType<typeof createTestBackend>;
let api: ReturnType<typeof createMemoriesHandlers>;

beforeEach(() => {
  t = createTestBackend();
  api = createMemoriesHandlers(() => t.backend);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

const post = (body: unknown, headers?: Record<string, string>) => api.POST(jsonRequest(URL_BASE, body, headers));
const errorOf = async (res: Response) => ((await res.json()) as ApiErrorResponse).error;

function seedApproved(n: number) {
  for (let i = 0; i < n; i++) {
    t.memories.push({
      id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
      visitorName: `Visitor ${i}`,
      message: `Memory ${i}`,
      formSlug: null,
      createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString(),
      status: "approved",
    });
  }
}

describe("POST /api/memories", () => {
  it("publishes a valid submission as approved and returns a receipt", async () => {
    const res = await post({ visitorName: "Mia", message: "I want to become an astronaut!", formSlug: "star" });
    expect(res.status).toBe(202);
    const body = await res.json();
    expect(body.status).toBe("received");
    expect(body).not.toHaveProperty("memory");
    expect(body).not.toHaveProperty("id");
    expect(t.memories).toHaveLength(1);
    expect(t.memories[0]).toMatchObject({ visitorName: "Mia", formSlug: "star", status: "approved" });
  });

  it("accepts a missing or null formSlug", async () => {
    expect((await post({ visitorName: "Mia", message: "Hi" })).status).toBe(202);
    expect((await post({ visitorName: "Leo", message: "Hi", formSlug: null })).status).toBe(202);
    expect(t.memories.map((m) => m.formSlug)).toEqual([null, null]);
  });

  it("normalizes whitespace before storing", async () => {
    await post({ visitorName: "  Mia   Rose ", message: "  hello\r\n\r\n\r\n\r\nworld  " });
    expect(t.memories[0]).toMatchObject({ visitorName: "Mia Rose", message: "hello\n\nworld" });
  });

  it.each([
    ["missing name", { message: "hi" }, "visitorName"],
    ["missing message", { visitorName: "Mia" }, "message"],
    ["empty message", { visitorName: "Mia", message: "   " }, "message"],
    ["empty name", { visitorName: "", message: "hi" }, "visitorName"],
    ["overlong name", { visitorName: "a".repeat(41), message: "hi" }, "visitorName"],
    ["overlong message", { visitorName: "Mia", message: "a".repeat(281) }, "message"],
    ["name with markup", { visitorName: "<script>", message: "hi" }, "visitorName"],
    ["message with a link", { visitorName: "Mia", message: "visit https://spam.example" }, "message"],
    ["invalid slug", { visitorName: "Mia", message: "hi", formSlug: "moon" }, "formSlug"],
    ["normal is not a future", { visitorName: "Mia", message: "hi", formSlug: "normal" }, "formSlug"],
    ["wrong types", { visitorName: 42, message: ["hi"] }, "visitorName"],
  ])("rejects %s", async (_label, body, field) => {
    const res = await post(body);
    expect(res.status).toBe(400);
    const error = await errorOf(res);
    expect(error.code).toBe("validation_failed");
    expect(error.fields).toHaveProperty(field);
    expect(t.memories).toHaveLength(0);
  });

  it("allows exactly the maximum lengths, counted in characters", async () => {
    const res = await post({ visitorName: "é".repeat(40), message: "🌟".repeat(280) });
    expect(res.status).toBe(202);
  });

  it("rejects non-object JSON bodies", async () => {
    for (const body of ["null", "[]", '"text"', "42"]) {
      expect((await post(body)).status).toBe(400);
    }
  });

  it("rejects malformed JSON", async () => {
    const res = await post("{ visitorName: Mia");
    expect(res.status).toBe(400);
    expect((await errorOf(res)).code).toBe("invalid_json");
  });

  it("rejects a non-JSON content type", async () => {
    const res = await api.POST(
      new Request(URL_BASE, { method: "POST", headers: { "content-type": "text/plain" }, body: "hi" }),
    );
    expect(res.status).toBe(415);
  });

  it("rejects oversized bodies, with or without an honest Content-Length", async () => {
    const big = JSON.stringify({ visitorName: "Mia", message: "a".repeat(5000) });
    const res = await post(big);
    expect(res.status).toBe(413);

    // Streamed body without Content-Length.
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(big));
        controller.close();
      },
    });
    const streamed = await api.POST(
      new Request(URL_BASE, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: stream,
        duplex: "half",
      } as RequestInit),
    );
    expect(streamed.status).toBe(413);
    expect(t.memories).toHaveLength(0);
  });

  it("rate-limits repeated submissions from the same client", async () => {
    const statuses = [];
    for (let i = 0; i < 4; i++) statuses.push((await post({ visitorName: "Mia", message: `hi ${i}` })).status);
    expect(statuses).toEqual([202, 202, 202, 429]);
    const limited = await post({ visitorName: "Mia", message: "again" });
    expect(limited.headers.get("Retry-After")).toBe("600");
    expect(t.memories).toHaveLength(3);
    // A different client is unaffected.
    expect((await post({ visitorName: "Leo", message: "hi" }, { "x-forwarded-for": "198.51.100.1" })).status).toBe(202);
  });

  it("fails closed when the shared rate limiter is unavailable", async () => {
    t.state.failRateLimit = true;
    const res = await post({ visitorName: "Mia", message: "hi" });
    expect(res.status).toBe(503);
    expect(t.memories).toHaveLength(0);
  });

  it("silently drops honeypot submissions", async () => {
    const res = await post({ visitorName: "Bot", message: "hi", website: "http://spam" });
    expect(res.status).toBe(202);
    expect(t.memories).toHaveLength(0);
  });

  it("returns a safe 503 on database errors without leaking details", async () => {
    t.state.fail = true;
    const res = await post({ visitorName: "Mia", message: "hi" });
    expect(res.status).toBe(503);
    const text = await res.text();
    expect(text).not.toMatch(/secret|sk_live|5432|ECONNREFUSED/i);
  });

  it("returns 503 when the database isn't configured", async () => {
    const unconfigured = createMemoriesHandlers(() => null);
    const res = await unconfigured.POST(jsonRequest(URL_BASE, { visitorName: "Mia", message: "hi" }));
    expect(res.status).toBe(503);
    expect((await errorOf(res)).code).toBe("unavailable");
  });
});

describe("GET /api/memories", () => {
  it("returns approved memories only, newest first, with public fields only", async () => {
    seedApproved(2);
    t.memories.push(
      { id: "p", visitorName: "Pending", message: "p", formSlug: null, createdAt: "2026-02-01T00:00:00.000Z", status: "pending" },
      { id: "r", visitorName: "Rejected", message: "r", formSlug: null, createdAt: "2026-02-02T00:00:00.000Z", status: "rejected" },
    );
    const res = await api.GET(new Request(URL_BASE));
    expect(res.status).toBe(200);
    const body = (await res.json()) as MemoriesResponse;
    expect(body.memories.map((m) => m.visitorName)).toEqual(["Visitor 1", "Visitor 0"]);
    for (const m of body.memories) {
      expect(Object.keys(m).sort()).toEqual(["createdAt", "formSlug", "id", "message", "visitorName"]);
    }
    expect(JSON.stringify(body)).not.toMatch(/Pending|Rejected|status/);
    expect(body.nextCursor).toBeNull();
  });

  it("paginates with a capped limit and a cursor", async () => {
    seedApproved(5);
    const first = (await (await api.GET(new Request(`${URL_BASE}?limit=2`))).json()) as MemoriesResponse;
    expect(first.memories.map((m) => m.visitorName)).toEqual(["Visitor 4", "Visitor 3"]);
    expect(first.nextCursor).toBe(first.memories[1].createdAt);

    const second = (await (
      await api.GET(new Request(`${URL_BASE}?limit=2&before=${encodeURIComponent(first.nextCursor!)}`))
    ).json()) as MemoriesResponse;
    expect(second.memories.map((m) => m.visitorName)).toEqual(["Visitor 2", "Visitor 1"]);

    const last = (await (
      await api.GET(new Request(`${URL_BASE}?limit=2&before=${encodeURIComponent(second.nextCursor!)}`))
    ).json()) as MemoriesResponse;
    expect(last.memories.map((m) => m.visitorName)).toEqual(["Visitor 0"]);
    expect(last.nextCursor).toBeNull();
  });

  it("defaults to 20 and accepts the boundaries 1 and 50", async () => {
    seedApproved(60);
    const count = async (q: string) =>
      ((await (await api.GET(new Request(`${URL_BASE}${q}`))).json()) as MemoriesResponse).memories.length;
    expect(await count("")).toBe(20);
    expect(await count("?limit=1")).toBe(1);
    expect(await count("?limit=50")).toBe(50);
  });

  it.each(["?limit=0", "?limit=51", "?limit=-1", "?limit=abc", "?limit=2.5", "?before=yesterday"])(
    "rejects invalid query %s",
    async (q) => {
      const res = await api.GET(new Request(`${URL_BASE}${q}`));
      expect(res.status).toBe(400);
      expect((await errorOf(res)).code).toBe("validation_failed");
    },
  );

  it("handles database errors safely", async () => {
    t.state.fail = true;
    const res = await api.GET(new Request(URL_BASE));
    expect(res.status).toBe(503);
    expect(await res.text()).not.toMatch(/secret|sk_live|5432/i);
  });

  it("returns stored text verbatim as JSON data, not HTML", async () => {
    t.memories.push({
      id: "x",
      visitorName: "Mia",
      message: "<img src=x onerror=alert(1)> <3",
      formSlug: null,
      createdAt: "2026-03-01T00:00:00.000Z",
      status: "approved",
    });
    const res = await api.GET(new Request(URL_BASE));
    expect(res.headers.get("content-type")).toMatch(/^application\/json/);
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    const body = (await res.json()) as MemoriesResponse;
    expect(body.memories[0].message).toBe("<img src=x onerror=alert(1)> <3");
  });
});
