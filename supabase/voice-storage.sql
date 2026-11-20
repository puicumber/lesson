-- Speaking answers: one-time setup. Paste into Supabase → SQL Editor → Run.
-- Creates a private "voice" bucket. Students can only upload into a folder named after a real
-- student code; nobody but the signed-in teacher can listen to, list or delete recordings.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('voice', 'voice', false, 15728640,
        array['audio/webm','audio/mp4','audio/ogg','audio/mpeg','audio/aac','audio/x-m4a','audio/wav'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.is_student(p_code text)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.students where code = p_code) $$;
grant execute on function public.is_student(text) to anon, authenticated;

drop policy if exists "voice: students upload" on storage.objects;
create policy "voice: students upload" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'voice' and public.is_student((storage.foldername(name))[1]));

drop policy if exists "voice: teacher reads" on storage.objects;
create policy "voice: teacher reads" on storage.objects for select to authenticated
  using (bucket_id = 'voice');

drop policy if exists "voice: teacher deletes" on storage.objects;
create policy "voice: teacher deletes" on storage.objects for delete to authenticated
  using (bucket_id = 'voice');
