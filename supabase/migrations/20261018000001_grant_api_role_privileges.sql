-- Explicit table privileges for Supabase API roles.
--
-- Newer Supabase projects no longer auto-grant privileges on tables created
-- via SQL, so without this the server (service_role) gets
-- "permission denied" (42501). Safe to run on projects that do auto-grant.

grant usage on schema public to anon, authenticated, service_role;

-- The Next.js server: full access (it bypasses RLS by design).
grant select, insert, update, delete
  on public.memories, public.site_counters, public.visit_tokens, public.rate_limits
  to service_role;

-- Public: read-only on memories, still filtered by RLS to approved rows.
-- No access to counters, visit tokens or rate limits.
grant select on public.memories to anon, authenticated;
