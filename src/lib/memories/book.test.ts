import { describe, expect, it } from "vitest";

import type { PublicMemory } from "@/types/api";
import { RECEIVED_MESSAGE, filterByFuture, formatMemoryDate, mergePages, pickFeatured, sendErrorMessage } from "./book";

const memory = (id: string, formSlug: PublicMemory["formSlug"] = null): PublicMemory => ({
  id,
  visitorName: `Friend ${id}`,
  message: `Memory ${id}`,
  formSlug,
  createdAt: "2026-10-12T09:30:00.000Z",
});

describe("Memory Book helpers", () => {
  it("filters lanterns by favorite future, or shows all", () => {
    const list = [memory("1", "luna"), memory("2", "star"), memory("3"), memory("4", "luna")];
    expect(filterByFuture(list, "all").map((m) => m.id)).toEqual(["1", "2", "3", "4"]);
    expect(filterByFuture(list, "luna").map((m) => m.id)).toEqual(["1", "4"]);
    expect(filterByFuture(list, "melody")).toEqual([]);
  });

  it("appends older pages without repeating a lantern", () => {
    const merged = mergePages([memory("1"), memory("2")], [memory("2"), memory("3")]);
    expect(merged.map((m) => m.id)).toEqual(["1", "2", "3"]);
  });

  it("features one already-loaded memory, or none when the lake is empty", () => {
    const list = [memory("1"), memory("2"), memory("3")];
    expect(pickFeatured(list, () => 0)?.id).toBe("1");
    expect(pickFeatured(list, () => 0.99)?.id).toBe("3");
    expect(pickFeatured(list, () => 1)?.id).toBe("3");
    expect(pickFeatured([], () => 0.5)).toBeNull();
  });

  it("explains rate limits, outages and offline sends kindly, otherwise uses the API's message", () => {
    expect(sendErrorMessage(429, "x")).toMatch(/wait a few minutes/);
    expect(sendErrorMessage(503, "x")).toMatch(/resting/);
    expect(sendErrorMessage(0, "x")).toMatch(/offline/);
    expect(sendErrorMessage(400, "Please tell Maria your name.")).toBe("Please tell Maria your name.");
  });

  it("promises review, not instant publication, after a successful send", () => {
    expect(RECEIVED_MESSAGE).toMatch(/Once it's approved/);
  });

  it("formats submission dates and hides unreadable ones", () => {
    expect(formatMemoryDate("2026-10-12T09:30:00.000Z")).toBe("12 October 2026");
    expect(formatMemoryDate("not a date")).toBe("");
  });
});
