import "server-only";

export interface ServerConfig {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  /** HMAC secret for rate-limit buckets; defaults to the service role key. */
  rateLimitSecret: string;
}

/**
 * Reads server-only configuration. Returns `null` when the database isn't
 * configured, so the site still builds and runs (APIs answer 503).
 * Never prefix these variables with NEXT_PUBLIC_.
 */
export function getServerConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig | null {
  const supabaseUrl = env.SUPABASE_URL?.trim();
  const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  return {
    supabaseUrl,
    supabaseServiceRoleKey,
    rateLimitSecret: env.RATE_LIMIT_SECRET?.trim() || supabaseServiceRoleKey,
  };
}
