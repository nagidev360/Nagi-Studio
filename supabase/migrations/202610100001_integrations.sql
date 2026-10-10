create extension if not exists pgcrypto;

create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('discord', 'telegram')),
  bot_name text not null,
  platform_id text not null,
  encrypted_token text not null,
  token_iv text not null,
  token_tag text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists integrations_user_id_idx on public.integrations(user_id);
create unique index if not exists integrations_platform_identity_idx
  on public.integrations(user_id, platform, platform_id);

alter table public.integrations enable row level security;

drop policy if exists "Users can read their own integrations" on public.integrations;
create policy "Users can read their own integrations"
  on public.integrations for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users can delete their own integrations" on public.integrations;
create policy "Users can delete their own integrations"
  on public.integrations for delete to authenticated using (auth.uid() = user_id);

-- Writes are performed by the trusted API using the service-role key after
-- validating the caller's Supabase access token. Never expose that key to the browser.
