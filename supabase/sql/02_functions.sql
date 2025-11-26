-- increment_plays RPC
create or replace function public.increment_plays(track_id uuid)
returns void
language plpgsql
as $$
begin
  update public.tracks set plays = plays + 1 where id = track_id;
end;
$$;

grant execute on function public.increment_plays(uuid) to anon, authenticated;

-- increment_likes RPC
create or replace function public.increment_likes(track_id uuid)
returns void
language plpgsql
as $$
begin
  update public.tracks set likes = likes + 1 where id = track_id;
end;
$$;

grant execute on function public.increment_likes(uuid) to anon, authenticated;
