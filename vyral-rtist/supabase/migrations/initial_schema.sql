-- Vyral + ROTIST initial schema
-- Owner-only RLS on every table. Profiles extend auth.users.

create extension if not exists "pgcrypto";

-- ─── ENUMS ─────────────────────────────────────────────────────────────────
do $$ begin
  create type space_kind as enum ('creative','school','writing','social','reset','legacy','build','memory','reflection');
exception when duplicate_object then null; end $$;

do $$ begin
  create type space_status as enum ('active','suggested','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type space_accent as enum ('violet','cyan','pink','lime');
exception when duplicate_object then null; end $$;

do $$ begin
  create type note_source as enum ('rotist','quick','voice');
exception when duplicate_object then null; end $$;

do $$ begin
  create type goal_kind as enum ('draft_words','study_minutes','session_count','task_count','custom');
exception when duplicate_object then null; end $$;

do $$ begin
  create type goal_status as enum ('active','completed','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type insight_tone as enum ('supportive','creative','study','system');
exception when duplicate_object then null; end $$;

do $$ begin
  create type legacy_kind as enum ('milestone','summary','pattern','session','evolution');
exception when duplicate_object then null; end $$;

-- ─── PROFILES ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  pattern text,
  energy text default 'medium',
  streak_days int default 0,
  weekly_focus_blocks int default 0,
  rotist_serial text,
  tagline text default 'your reality as lived',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  insert into public.preferences (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── SPACES ────────────────────────────────────────────────────────────────
create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind space_kind not null default 'writing',
  status space_status not null default 'active',
  accent space_accent not null default 'violet',
  reason text,
  signals text[] default '{}',
  next_action text,
  pinned boolean default false,
  last_activity_at timestamptz default now(),
  evolution jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists spaces_user_idx on public.spaces (user_id);
create index if not exists spaces_status_idx on public.spaces (user_id, status);

-- ─── NOTES ─────────────────────────────────────────────────────────────────
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  text text not null,
  handwritten boolean default false,
  source note_source not null default 'quick',
  captured_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists notes_user_idx on public.notes (user_id);
create index if not exists notes_space_idx on public.notes (space_id);

-- ─── TASKS ─────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  text text not null,
  due_at timestamptz,
  done boolean default false,
  done_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists tasks_user_idx on public.tasks (user_id);
create index if not exists tasks_space_idx on public.tasks (space_id);

-- ─── SESSIONS ──────────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  title text not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  duration_min int,
  strokes int default 0,
  word_count int default 0,
  hesitation_clusters int default 0,
  grip_pressure_change int default 0,
  confidence_drop text,
  fatigue_score numeric(4,2),
  mood_delta numeric(4,2),
  summary jsonb,
  transcript text[] default '{}',
  summary_lifts int default 0,
  tasks_extracted int default 0,
  review_cards_suggested int default 0,
  created_at timestamptz default now()
);

create index if not exists sessions_user_idx on public.sessions (user_id);
create index if not exists sessions_space_idx on public.sessions (space_id);

-- ─── GOALS ─────────────────────────────────────────────────────────────────
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  title text not null,
  kind goal_kind not null default 'draft_words',
  target_value int not null,
  current_value int default 0,
  unit text default 'words',
  deadline date,
  status goal_status not null default 'active',
  created_at timestamptz default now(),
  completed_at timestamptz,
  -- denormalized: how the user described why this matters
  why text
);

create index if not exists goals_user_idx on public.goals (user_id);
create index if not exists goals_status_idx on public.goals (user_id, status);

-- Auto-complete goal when current >= target
create or replace function public.maybe_complete_goal()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'active' and new.current_value >= new.target_value then
    new.status := 'completed';
    new.completed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_goals_autocomplete on public.goals;
create trigger trg_goals_autocomplete
  before update on public.goals
  for each row execute procedure public.maybe_complete_goal();

-- ─── LIFE & LEGACY ─────────────────────────────────────────────────────────
create table if not exists public.life_legacy (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete set null,
  kind legacy_kind not null,
  title text not null,
  body text,
  accent space_accent default 'violet',
  occurred_at timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists legacy_user_idx on public.life_legacy (user_id, occurred_at desc);

-- ─── AI INSIGHTS ───────────────────────────────────────────────────────────
create table if not exists public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tone insight_tone not null,
  title text not null,
  body text,
  cta_label text,
  cta_secondary text,
  dismissed boolean default false,
  acted_on boolean default false,
  created_at timestamptz default now()
);

create index if not exists insights_user_idx on public.ai_insights (user_id, created_at desc);

-- ─── PREFERENCES ───────────────────────────────────────────────────────────
create table if not exists public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  space_automation_level int default 2,
  haptic_intensity int default 60,
  guided_layout boolean default true,
  slow_read_pacing numeric(3,2) default 1.0,
  dyslexia_font boolean default false,
  text_spacing numeric(3,2) default 1.1,
  reduced_motion boolean default false,
  privacy_share_insights boolean default true,
  store_mood_signals boolean default false,
  ai_naming_control text default 'Suggest, I confirm',
  insight_sensitivity int default 2,
  updated_at timestamptz default now()
);

-- ─── PEN STATE ─────────────────────────────────────────────────────────────
create table if not exists public.pen_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  serial text,
  battery int,
  ink_remaining_percent int,
  ink_predicted_days int,
  refill_id text,
  haptic int,
  tip_glow text,
  thermal_avg_c numeric(5,2),
  echo_grip_auth text,
  pressure_signature_lock text,
  cap_orientation text,
  knock_shortcuts jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.spaces enable row level security;
alter table public.notes enable row level security;
alter table public.tasks enable row level security;
alter table public.sessions enable row level security;
alter table public.goals enable row level security;
alter table public.life_legacy enable row level security;
alter table public.ai_insights enable row level security;
alter table public.preferences enable row level security;
alter table public.pen_state enable row level security;

-- Policy helper: rebuild policies idempotently
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'profiles','spaces','notes','tasks','sessions','goals',
    'life_legacy','ai_insights','preferences','pen_state'
  ]) loop
    execute format('drop policy if exists "owner_select" on public.%I', t);
    execute format('drop policy if exists "owner_insert" on public.%I', t);
    execute format('drop policy if exists "owner_update" on public.%I', t);
    execute format('drop policy if exists "owner_delete" on public.%I', t);
  end loop;
end $$;

-- profiles uses id as the owner column
create policy "owner_select" on public.profiles for select using (auth.uid() = id);
create policy "owner_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "owner_update" on public.profiles for update using (auth.uid() = id);
create policy "owner_delete" on public.profiles for delete using (auth.uid() = id);

-- preferences uses user_id as primary key (owner column)
create policy "owner_select" on public.preferences for select using (auth.uid() = user_id);
create policy "owner_insert" on public.preferences for insert with check (auth.uid() = user_id);
create policy "owner_update" on public.preferences for update using (auth.uid() = user_id);
create policy "owner_delete" on public.preferences for delete using (auth.uid() = user_id);

-- pen_state same
create policy "owner_select" on public.pen_state for select using (auth.uid() = user_id);
create policy "owner_insert" on public.pen_state for insert with check (auth.uid() = user_id);
create policy "owner_update" on public.pen_state for update using (auth.uid() = user_id);
create policy "owner_delete" on public.pen_state for delete using (auth.uid() = user_id);

-- All other tables use user_id
do $$
declare t text;
begin
  for t in select unnest(array['spaces','notes','tasks','sessions','goals','life_legacy','ai_insights']) loop
    execute format('create policy "owner_select" on public.%I for select using (auth.uid() = user_id)', t);
    execute format('create policy "owner_insert" on public.%I for insert with check (auth.uid() = user_id)', t);
    execute format('create policy "owner_update" on public.%I for update using (auth.uid() = user_id)', t);
    execute format('create policy "owner_delete" on public.%I for delete using (auth.uid() = user_id)', t);
  end loop;
end $$;

-- ─── HELPER VIEWS ──────────────────────────────────────────────────────────
create or replace view public.active_spaces as
  select * from public.spaces where status = 'active';
