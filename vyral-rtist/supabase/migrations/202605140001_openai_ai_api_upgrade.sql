-- OpenAI-backed AI API additions for Vyral.
-- Model keys stay in Supabase Edge Function secrets; clients only receive generated metadata.

alter table public.ai_intakes
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists visual_prompt text,
  add column if not exists model text,
  add column if not exists usage jsonb default '{}'::jsonb;

create table if not exists public.ai_space_visuals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  space_id uuid references public.spaces(id) on delete cascade,
  prompt text not null,
  revised_prompt text,
  accent space_accent default 'violet',
  status text not null default 'placeholder',
  image_ref text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists ai_space_visuals_user_created_idx on public.ai_space_visuals (user_id, created_at desc);
create index if not exists ai_space_visuals_space_idx on public.ai_space_visuals (space_id);

alter table public.ai_space_visuals enable row level security;

drop policy if exists "owner_select" on public.ai_space_visuals;
drop policy if exists "owner_insert" on public.ai_space_visuals;
drop policy if exists "owner_update" on public.ai_space_visuals;
drop policy if exists "owner_delete" on public.ai_space_visuals;

create policy "owner_select" on public.ai_space_visuals for select using (auth.uid() = user_id);
create policy "owner_insert" on public.ai_space_visuals for insert with check (auth.uid() = user_id);
create policy "owner_update" on public.ai_space_visuals for update using (auth.uid() = user_id);
create policy "owner_delete" on public.ai_space_visuals for delete using (auth.uid() = user_id);
