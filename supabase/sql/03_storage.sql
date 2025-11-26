-- Create storage buckets
insert into storage.buckets (id, name, public) values
  ('audio-files', 'audio-files', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public) values
  ('cover-images', 'cover-images', true)
  on conflict (id) do nothing;

-- Public read, authenticated write policies (simplified)
create policy if not exists "Public read audio" on storage.objects
for select using (bucket_id = 'audio-files');

create policy if not exists "Public read cover" on storage.objects
for select using (bucket_id = 'cover-images');

create policy if not exists "Authenticated write audio" on storage.objects
for insert to authenticated with check (bucket_id = 'audio-files');

create policy if not exists "Authenticated write cover" on storage.objects
for insert to authenticated with check (bucket_id = 'cover-images');
