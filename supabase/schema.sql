-- Notes table
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) default auth.uid(),
  type text not null check (type in ('text', 'image', 'markdown')),
  title text,
  content text,
  file_path text,
  created_at timestamptz not null default now()
);

alter table notes enable row level security;

create policy "owner can read own notes" on notes
  for select using (auth.uid() = user_id);
create policy "owner can insert own notes" on notes
  for insert with check (auth.uid() = user_id);
create policy "owner can update own notes" on notes
  for update using (auth.uid() = user_id);
create policy "owner can delete own notes" on notes
  for delete using (auth.uid() = user_id);

-- Storage bucket for note files
insert into storage.buckets (id, name, public)
values ('note-files', 'note-files', false)
on conflict (id) do nothing;

create policy "owner can read own files"
  on storage.objects for select
  using (auth.uid() = owner);

create policy "owner can upload own files"
  on storage.objects for insert
  with check (auth.uid() = owner and bucket_id = 'note-files');

create policy "owner can delete own files"
  on storage.objects for delete
  using (auth.uid() = owner and bucket_id = 'note-files');
