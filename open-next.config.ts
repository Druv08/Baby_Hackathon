import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Every story and character page is pre-rendered at build time (no ISR), so the
// pre-rendered HTML is served straight from the static assets. Without this,
// the Worker can't find them and `dynamicParams = false` turns them into 404s.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
