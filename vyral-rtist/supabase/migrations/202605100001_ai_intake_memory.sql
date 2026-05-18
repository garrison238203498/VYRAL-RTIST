-- Server-side AI memory for Vyral intake.
-- The Expo app never writes model keys or raw secrets. Edge Functions insert with the service role key.

create extension if not exists "pgcrypto";

create table if not exists public.ai_intakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  anon_session_id text,
  input_text text default '',
  file_names text[] default '{}',
  output jsonb not null,
  themes text[] default '{}',
  navigation_pattern text[] default '{}',
  request_id text,
  created_at timestamptz default now()
);

create index if not exists ai_intakes_user_created_idx on public.ai_intakes (user_id, created_at desc);
create index if not exists ai_intakes_anon_created_idx on public.ai_intakes (anon_session_id, created_at desc);
create index if not exists ai_intakes_themes_idx on public.ai_intakes using gin (themes);

create table if not exists public.ai_navigation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  anon_session_id text,
  screen text not null,
  event_type text not null default 'view',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists ai_nav_user_created_idx on public.ai_navigation_events (user_id, created_at desc);
create index if not exists ai_nav_anon_created_idx on public.ai_navigation_events (anon_session_id, created_at desc);

alter table public.ai_intakes enable row level security;
alter table public.ai_navigation_events enable row level security;

drop policy if exists "owner_select" on public.ai_intakes;
drop policy if exists "owner_insert" on public.ai_intakes;
drop policy if exists "owner_update" on public.ai_intakes;
drop policy if exists "owner_delete" on public.ai_intakes;

create policy "owner_select" on public.ai_intakes for select using (auth.uid() = user_id);
create policy "owner_insert" on public.ai_intakes for insert with check (auth.uid() = user_id);
create policy "owner_update" on public.ai_intakes for update using (auth.uid() = user_id);
create policy "owner_delete" on public.ai_intakes for delete using (auth.uid() = user_id);

drop policy if exists "owner_select" on public.ai_navigation_events;
drop policy if exists "owner_insert" on public.ai_navigation_events;
drop policy if exists "owner_update" on public.ai_navigation_events;
drop policy if exists "owner_delete" on public.ai_navigation_events;

create policy "owner_select" on public.ai_navigation_events for select using (auth.uid() = user_id);
create policy "owner_insert" on public.ai_navigation_events for insert with check (auth.uid() = user_id);
create policy "owner_update" on public.ai_navigation_events for update using (auth.uid() = user_id);
create policy "owner_delete" on public.ai_navigation_events for delete using (auth.uid() = user_id);
