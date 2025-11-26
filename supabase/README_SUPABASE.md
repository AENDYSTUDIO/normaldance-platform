# Supabase Setup Guide for NORMAL DANCE

This guide helps you bootstrap Supabase (database, storage, and RPC) for the project.

Prerequisites:
- Supabase project (https://app.supabase.com)
- Supabase CLI (optional) or SQL editor in dashboard

## 1) Environment variables
Create `.env.local` in project root:

VITE_SUPABASE_URL=https://<PROJECT>.supabase.co
VITE_SUPABASE_ANON_KEY=<ANON_KEY>

## 2) Run migrations
Use Supabase SQL editor and run the files in `supabase/sql` in order:
- 01_schema.sql
- 02_functions.sql
- 03_storage.sql

Alternatively, with Supabase CLI:
- supabase db connect --project-ref <ref>
- Apply each SQL file's content via `supabase db query < supabase/sql/01_schema.sql` etc.

## 3) Buckets
We create two buckets:
- audio-files (public)
- cover-images (public)

Make sure public access is enabled, or adjust storage policies accordingly.

## 4) Usage in code
- Tracks CRUD: services/supabase.ts (tracksService)
- Uploads: `uploadAudioFile`, `uploadCoverImage` will put files into buckets and return public URLs.
- RPC `increment_plays` and `increment_likes` used for counters.

## 5) Optional: Row Level Security (RLS)
By default examples are permissive for simplicity. For production, restrict by user_id and enable proper auth policies.

## 6) Troubleshooting
- If RPCs fail: ensure functions exist and you granted execute to `anon` and `authenticated` roles.
- If public URLs are empty: check bucket public access and Storage public URL config.
