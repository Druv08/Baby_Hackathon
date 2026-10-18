import { getBackend } from "@/lib/server/backend";
import { createVisitsHandlers } from "@/lib/server/api/visits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { GET, POST } = createVisitsHandlers(getBackend);
