-- Freevid schema — run once in Supabase SQL Editor

-- Videos
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  uploader_name text not null check (char_length(uploader_name) between 1 and 100),
  description text not null default '' check (char_length(description) <= 2000),
  storage_path text not null unique,
  like_count integer not null default 0 check (like_count >= 0),
  dislike_count integer not null default 0 check (dislike_count >= 0),
  created_at timestamptz not null default now()
);

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  author_name text not null check (char_length(author_name) between 1 and 100),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists comments_video_id_idx on public.comments(video_id, created_at desc);

-- Reactions (one vote per session per video)
create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  session_id text not null check (char_length(session_id) between 1 and 100),
  type text not null check (type in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  unique (video_id, session_id)
);

create index if not exists reactions_video_id_idx on public.reactions(video_id);

-- Keep like/dislike counts in sync
create or replace function public.sync_video_reaction_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.type = 'like' then
      update public.videos set like_count = like_count + 1 where id = new.video_id;
    else
      update public.videos set dislike_count = dislike_count + 1 where id = new.video_id;
    end if;
    return new;
  elsif tg_op = 'UPDATE' then
    if old.type = 'like' and new.type = 'dislike' then
      update public.videos
      set like_count = like_count - 1, dislike_count = dislike_count + 1
      where id = new.video_id;
    elsif old.type = 'dislike' and new.type = 'like' then
      update public.videos
      set dislike_count = dislike_count - 1, like_count = like_count + 1
      where id = new.video_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.type = 'like' then
      update public.videos set like_count = like_count - 1 where id = old.video_id;
    else
      update public.videos set dislike_count = dislike_count - 1 where id = old.video_id;
    end if;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists reactions_sync_counts on public.reactions;
create trigger reactions_sync_counts
  after insert or update or delete on public.reactions
  for each row execute function public.sync_video_reaction_counts();

-- Storage bucket for videos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'videos',
  'videos',
  true,
  null,
  array['video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Row Level Security
alter table public.videos enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;

-- Videos: anyone can read and insert
create policy "videos_select" on public.videos for select using (true);
create policy "videos_insert" on public.videos for insert with check (true);

-- Comments: anyone can read and insert
create policy "comments_select" on public.comments for select using (true);
create policy "comments_insert" on public.comments for insert with check (true);

-- Reactions: anyone can read, insert, and update their own session vote
create policy "reactions_select" on public.reactions for select using (true);
create policy "reactions_insert" on public.reactions for insert with check (true);
create policy "reactions_update" on public.reactions for update using (true);

-- Storage: public read, anon upload to videos bucket
create policy "videos_storage_select" on storage.objects
  for select using (bucket_id = 'videos');

create policy "videos_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'videos'
    and (storage.extension(name) = 'mp4' or storage.extension(name) = 'webm')
  );
