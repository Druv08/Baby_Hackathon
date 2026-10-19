import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { createSupabaseStores } from "./stores";

describe("public memory persistence", () => {
  it("explicitly stores pending status even if the database default changes", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ insert });
    const stores = createSupabaseStores({ from } as unknown as SupabaseClient);
    await stores.memories.insertPending({ visitorName: "Mia", message: "A small wish", formSlug: "luna" });
    expect(from).toHaveBeenCalledWith("memories");
    expect(insert).toHaveBeenCalledWith({ visitor_name: "Mia", message: "A small wish", form_slug: "luna", status: "pending" });
  });
});
