-- The foundation every client app builds on: a private schema for the data, and
-- the people who run the app, with their roles.
--
-- The access model (.claude/rules/database.md):
--   * Tables live in the private `app` schema. The API roles (anon,
--     authenticated) hold no rights on it, and every table has row level
--     security on as a second lock.
--   * Pages call `public` functions that are security definer, set search_path
--     to '', and check the caller first (app.require_role, app.has_role or
--     app.my_role). supabase/tests/database/00_every_door_locked.test.sql proves
--     that of every function the API can call.
--   * Roles: an admin runs the app and its members; an editor changes content.
--     Everyone else is a visitor (anon, or signed in without a role), and what a
--     visitor may read is decided function by function.

create schema if not exists app;
revoke all on schema app from public, anon, authenticated;

create table app.members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'editor')),
  added_at timestamptz not null default now()
);
alter table app.members enable row level security;
revoke all on table app.members from public, anon, authenticated;

-- The caller's role, or null for a visitor.
create function app.my_role()
returns text
language sql
stable
security definer
set search_path to ''
as $$
  select m.role from app.members m where m.user_id = auth.uid();
$$;

-- Whether the caller holds p_role or a stronger one (admin covers editor).
create function app.has_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select case app.my_role()
    when 'admin' then p_role in ('admin', 'editor')
    when 'editor' then p_role = 'editor'
    else false
  end;
$$;

-- Refuses a caller without p_role: the first line of every function that
-- changes content or members.
create function app.require_role(p_role text)
returns void
language plpgsql
stable
security definer
set search_path to ''
as $$
begin
  if not app.has_role(p_role) then
    raise exception 'This needs the % role.', p_role using errcode = '42501';
  end if;
end;
$$;

revoke all on function app.my_role(), app.has_role(text), app.require_role(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- What the API may call
-- ---------------------------------------------------------------------------

-- The caller's role ('admin', 'editor'), or null for a visitor.
create function public.app_my_role()
returns text
language sql
stable
security definer
set search_path to ''
as $$
  select app.my_role();
$$;

-- An admin gives an invited account a role, or takes it away (p_role null).
-- The account must exist first: invite it from the Supabase dashboard.
create function public.app_set_member(p_email text, p_role text)
returns void
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_user uuid;
begin
  perform app.require_role('admin');
  select u.id into v_user from auth.users u where lower(u.email) = lower(trim(p_email));
  if v_user is null then
    raise exception 'No account has that email. Invite it from the Supabase dashboard first.' using errcode = 'P0002';
  end if;
  if v_user = auth.uid() and p_role is distinct from 'admin' then
    raise exception 'An admin cannot take away their own admin role.' using errcode = '42501';
  end if;
  if p_role is null then
    delete from app.members where user_id = v_user;
  else
    insert into app.members (user_id, role) values (v_user, p_role)
    on conflict (user_id) do update set role = excluded.role;
  end if;
end;
$$;

-- For the check after each deploy (/api/health): the database answers. No data.
create function public.app_health()
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select true;
$$;

-- Supabase grants anon and authenticated EXECUTE on every new public function,
-- so each grant below is said out loud, and app_set_member is taken from anon.
revoke all on function public.app_my_role(), public.app_set_member(text, text), public.app_health() from public;
revoke all on function public.app_set_member(text, text) from anon;
grant execute on function public.app_my_role() to anon, authenticated, service_role;
grant execute on function public.app_set_member(text, text) to authenticated, service_role;
grant execute on function public.app_health() to anon, authenticated, service_role;
