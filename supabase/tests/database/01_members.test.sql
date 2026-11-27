-- Suite: members and roles (20261127120000_app_foundation.sql)
--
-- Admins give invited accounts a role and take it away; editors, signed-in
-- visitors and anon cannot. Everyone can ask for their own role, nobody reaches
-- the members table or the app schema directly, and the deploy check answers
-- without signing in.

begin;
create extension if not exists pgtap with schema extensions;

select plan(20);

create function pg_temp.make_user(p_id uuid, p_email text)
returns void
language sql
as $$
  insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at)
  values (p_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', p_email, now(), now());
$$;

create function pg_temp.act_as(p_user uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$;

-- Made-up accounts, apart from the seed's.
select pg_temp.make_user('10000000-0000-4000-8000-00000000000a', 'members-admin@example.test');
select pg_temp.make_user('10000000-0000-4000-8000-00000000000e', 'members-editor@example.test');
select pg_temp.make_user('10000000-0000-4000-8000-00000000000b', 'members-visitor@example.test');
select pg_temp.make_user('10000000-0000-4000-8000-00000000000c', 'Members-New@Example.test');
insert into app.members (user_id, role) values
  ('10000000-0000-4000-8000-00000000000a', 'admin'),
  ('10000000-0000-4000-8000-00000000000e', 'editor');

-- ---------------------------------------------------------------------------
-- Who am I
-- ---------------------------------------------------------------------------

set local role anon;
select is(public.app_my_role(), null, 'Given a visitor who is not signed in, When they ask for their role, Then there is none');
select is(public.app_health(), true, 'Given a visitor who is not signed in, When the deploy check calls app_health, Then the database answers');
reset role;

select pg_temp.act_as('10000000-0000-4000-8000-00000000000b');
select is(public.app_my_role(), null, 'Given a signed-in account without a role, When it asks for its role, Then there is none');
reset role;

select pg_temp.act_as('10000000-0000-4000-8000-00000000000e');
select is(public.app_my_role(), 'editor', 'Given an editor, When they ask for their role, Then it is editor');
reset role;

select pg_temp.act_as('10000000-0000-4000-8000-00000000000a');
select is(public.app_my_role(), 'admin', 'Given an admin, When they ask for their role, Then it is admin');

-- ---------------------------------------------------------------------------
-- An admin manages members
-- ---------------------------------------------------------------------------

select lives_ok(
  $$ select public.app_set_member('  members-new@example.TEST ', 'editor') $$,
  'Given an admin, When they give an invited account a role, Then the call succeeds');
reset role;
select is(
  (select role from app.members where user_id = '10000000-0000-4000-8000-00000000000c'),
  'editor',
  'Given an admin, When they make an invited account an editor (any case, any spaces), Then it is an editor');

select pg_temp.act_as('10000000-0000-4000-8000-00000000000a');
select lives_ok(
  $$ select public.app_set_member('members-new@example.test', 'admin') $$,
  'Given an admin, When they change a member''s role, Then the call succeeds');
reset role;
select is(
  (select role from app.members where user_id = '10000000-0000-4000-8000-00000000000c'),
  'admin',
  'Given an editor, When an admin makes them an admin, Then the role changes in place');

select pg_temp.act_as('10000000-0000-4000-8000-00000000000a');
select lives_ok(
  $$ select public.app_set_member('members-new@example.test', null) $$,
  'Given an admin, When they take a member''s role away, Then the call succeeds');
reset role;
select is(
  (select count(*)::int from app.members where user_id = '10000000-0000-4000-8000-00000000000c'),
  0,
  'Given a member, When an admin takes their role away, Then they are no longer a member');

select pg_temp.act_as('10000000-0000-4000-8000-00000000000a');
select throws_ok(
  $$ select public.app_set_member('nobody@example.test', 'editor') $$,
  'P0002', null,
  'Given an email with no account, When an admin gives it a role, Then they are told to invite it first');
select throws_ok(
  $$ select public.app_set_member('members-visitor@example.test', 'owner') $$,
  '23514', null,
  'Given a role that does not exist, When an admin sets it, Then the database refuses it');
select throws_ok(
  $$ select public.app_set_member('members-admin@example.test', 'editor') $$,
  '42501', null,
  'Given an admin, When they take away their own admin role, Then it is refused, so the app keeps an admin');
reset role;

-- ---------------------------------------------------------------------------
-- Nobody else does
-- ---------------------------------------------------------------------------

select pg_temp.act_as('10000000-0000-4000-8000-00000000000e');
select throws_ok(
  $$ select public.app_set_member('members-visitor@example.test', 'editor') $$,
  '42501', null,
  'Given an editor, When they give someone a role, Then it is refused');
reset role;

select pg_temp.act_as('10000000-0000-4000-8000-00000000000b');
select throws_ok(
  $$ select public.app_set_member('members-visitor@example.test', 'admin') $$,
  '42501', null,
  'Given a signed-in account without a role, When it makes itself an admin, Then it is refused');
select throws_ok(
  $$ select count(*) from app.members $$,
  '42501', null,
  'Given a signed-in account, When it reads the members table directly, Then the app schema is closed to it');
select throws_ok(
  $$ select app.require_role('editor') $$,
  '42501', null,
  'Given a signed-in account, When it calls a function in the app schema directly, Then the schema is closed to it');
reset role;

set local role anon;
select throws_ok(
  $$ select public.app_set_member('members-visitor@example.test', 'admin') $$,
  '42501', null,
  'Given a visitor who is not signed in, When they give someone a role, Then it is refused');
select throws_ok(
  $$ select count(*) from app.members $$,
  '42501', null,
  'Given a visitor who is not signed in, When they read the members table directly, Then the app schema is closed to them');
reset role;

select * from finish();
rollback;
