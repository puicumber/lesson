-- Apply before publishing the portal pages. Uses the existing signed-in teacher
-- role and personal student link model.
begin;

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  student_code text not null references public.students(code) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  note text check (char_length(note) <= 1000),
  url text check (char_length(url) <= 2048 and url ~* '^https?://[^[:space:]]+$'),
  created_at timestamptz not null default now(),
  tried_at timestamptz,
  archived_at timestamptz
);

create index recommendations_student_created
  on public.recommendations (student_code, created_at desc);

alter table public.recommendations enable row level security;
revoke all on public.recommendations from public, anon, authenticated;
grant select on public.recommendations to authenticated;
grant insert (student_code, title, note, url) on public.recommendations to authenticated;
grant update (tried_at, archived_at) on public.recommendations to authenticated;

create policy "Teachers read recommendations" on public.recommendations
  for select to authenticated using (exists (select 1 from public.students s where s.code = student_code));
create policy "Teachers add recommendations" on public.recommendations
  for insert to authenticated with check (exists (select 1 from public.students s where s.code = student_code));
create policy "Teachers update recommendations" on public.recommendations
  for update to authenticated
  using (exists (select 1 from public.students s where s.code = student_code))
  with check (exists (select 1 from public.students s where s.code = student_code));

create function public.get_recommendations(p_code text)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'items', coalesce(jsonb_agg(
      jsonb_build_object('id', id, 'title', title, 'note', note, 'url', url, 'tried_at', tried_at)
      order by created_at desc, id
    ) filter (where archived_at is null), '[]'::jsonb),
    'earned', coalesce(bool_or(tried_at is not null), false)
  )
  from public.recommendations
  where student_code = p_code;
$$;

create function public.try_recommendation(p_code text, p_id uuid)
returns boolean language sql security definer set search_path = ''
as $$
  with saved as (
    update public.recommendations
    set tried_at = coalesce(tried_at, now())
    where student_code = p_code and id = p_id and archived_at is null
    returning id
  )
  select exists (select 1 from saved);
$$;

revoke all on function public.get_recommendations(text) from public;
revoke all on function public.try_recommendation(text, uuid) from public;
grant execute on function public.get_recommendations(text) to anon, authenticated;
grant execute on function public.try_recommendation(text, uuid) to anon, authenticated;

commit;
