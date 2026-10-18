-- Maria — Memory Book, visitor counter and shared rate limiting.
--
-- Access model: the Next.js server talks to the database with the service
-- role. Browsers never talk to these tables directly, so anon/authenticated
-- get no write access at all, and can read only approved memories.

-- ─────────────────────────────────────────────────────────────────────────
-- Memories (public guestbook, moderated)
-- ─────────────────────────────────────────────────────────────────────────

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  visitor_name varchar(40) not null
    check (char_length(btrim(visitor_name)) between 1 and 40),
  message varchar(280) not null
    check (char_length(btrim(message)) between 1 and 280),
  form_slug varchar(20)
    check (form_slug in ('blossom', 'star', 'cloud', 'aqua', 'inventor', 'forest', 'melody', 'luna')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- Public listing: approved only, newest first.
create index memories_approved_created_at_idx
  on public.memories (created_at desc, id desc)
  where status = 'approved';

-- Moderation queue.
create index memories_pending_created_at_idx
  on public.memories (created_at)
  where status = 'pending';

alter table public.memories enable row level security;

create policy "Approved memories are publicly readable"
  on public.memories for select
  to anon, authenticated
  using (status = 'approved');

-- No insert/update/delete policies: with RLS on, those are denied for
-- anon/authenticated. Grants are revoked too, as a second layer.
revoke insert, update, delete, truncate on public.memories from anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Site counters
-- ─────────────────────────────────────────────────────────────────────────

create table public.site_counters (
  counter_key text primary key check (char_length(counter_key) between 1 and 64),
  counter_value bigint not null default 0 check (counter_value >= 0)
);

insert into public.site_counters (counter_key, counter_value) values ('site_visits', 0);

-- One row per recorded browser session, so retries of the same visit are
-- idempotent. Rows expire after a day (see record_visit).
create table public.visit_tokens (
  token uuid primary key,
  created_at timestamptz not null default now()
);

create index visit_tokens_created_at_idx on public.visit_tokens (created_at);

alter table public.site_counters enable row level security;
alter table public.visit_tokens enable row level security;
-- No policies: not accessible to anon/authenticated at all.
revoke all on public.site_counters from anon, authenticated;
revoke all on public.visit_tokens from anon, authenticated;

-- Records a visit atomically and returns the counter value.
-- A token seen before (a retry / rerender) returns the current value
-- without incrementing. The unique primary key on visit_tokens makes this
-- safe under concurrent requests with the same token.
create function public.record_visit(p_token uuid, p_counter_key text default 'site_visits')
returns bigint
language plpgsql
set search_path = public
as $$
declare
  v_inserted integer;
  v_value bigint;
begin
  insert into visit_tokens (token) values (p_token) on conflict (token) do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 1 then
    -- Single UPDATE: the row lock serializes concurrent increments.
    update site_counters
      set counter_value = counter_value + 1
      where counter_key = p_counter_key
      returning counter_value into v_value;
  else
    select counter_value into v_value from site_counters where counter_key = p_counter_key;
  end if;

  if v_value is null then
    raise exception 'Unknown counter %', p_counter_key;
  end if;

  -- Occasional cleanup of expired tokens.
  if random() < 0.01 then
    delete from visit_tokens where created_at < now() - interval '1 day';
  end if;

  return v_value;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Rate limiting (shared across serverless instances)
-- ─────────────────────────────────────────────────────────────────────────

-- Buckets are keyed by an HMAC of the client IP, never the raw IP.
create table public.rate_limits (
  bucket text primary key check (char_length(bucket) between 1 and 200),
  window_start timestamptz not null default now(),
  hits integer not null default 0 check (hits >= 0)
);

create index rate_limits_window_start_idx on public.rate_limits (window_start);

alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Fixed-window limiter. Returns true if the hit is allowed. The upsert takes
-- a row lock, so concurrent hits on the same bucket are counted exactly.
create function public.consume_rate_limit(p_bucket text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_hits integer;
  v_expired_before timestamptz := now() - make_interval(secs => p_window_seconds);
begin
  insert into rate_limits as r (bucket, window_start, hits)
    values (p_bucket, now(), 1)
  on conflict (bucket) do update set
    hits = case when r.window_start < v_expired_before then 1 else r.hits + 1 end,
    window_start = case when r.window_start < v_expired_before then now() else r.window_start end
  returning hits into v_hits;

  if random() < 0.01 then
    delete from rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;

-- Functions are callable only by the server (service role).
revoke all on function public.record_visit(uuid, text) from public, anon, authenticated;
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.record_visit(uuid, text) to service_role;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;
