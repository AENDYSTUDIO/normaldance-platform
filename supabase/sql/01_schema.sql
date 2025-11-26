-- Tracks Table
create table if not exists public.tracks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  duration text not null,
  cover_url text not null,
  audio_url text not null,
  plays integer not null default 0,
  likes integer not null default 0,
  is_nft boolean not null default false,
  description text,
  ipfs_hash text,
  user_id uuid,
  created_at timestamp with time zone not null default now()
);

-- Basic index
create index if not exists tracks_created_at_idx on public.tracks(created_at desc);

-- Enable RLS (adjust policies as needed)
alter table public.tracks enable row level security;

-- Simple permissive policies for dev (adjust for prod)
create policy if not exists "tracks_read_all" on public.tracks for select using (true);
create policy if not exists "tracks_insert_any" on public.tracks for insert with check (true);
create policy if not exists "tracks_update_any" on public.tracks for update using (true);
