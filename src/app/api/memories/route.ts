import { createMemoriesHandlers } from "@/lib/server/api/memories";
import { getBackend } from "@/lib/server/backend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public endpoints: list approved memories, submit a pending one.
// There is intentionally no endpoint for approving or rejecting memories.
export const { GET, POST } = createMemoriesHandlers(getBackend);
