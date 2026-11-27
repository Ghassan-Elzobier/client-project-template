---
paths:
  - "supabase/**"
  - "src/lib/supabase/**"
---

# Database rules

- Follow the `/migrate` skill. Migrations are append-only once on main; the
  guard fails a pull request that edits one.
- Data lives in the private `app` schema; the API reaches it only through
  `public` RPCs that are `security definer`, `set search_path to ''`, and check
  the caller first (`app.require_role`, `app.has_role`, `app.my_role` or
  `auth.uid()`). Row level security is on for every table.
  `supabase/tests/database/00_every_door_locked.test.sql` proves it for every
  function and table, without naming them.
- Supabase grants anon and authenticated EXECUTE on every new public function:
  revoke and grant each one on purpose, in the migration that adds it.
- Migrations must work with the old and the new code at once (expand, then
  contract): production applies them moments before the new Worker goes live.
- Every migration has pgTAP tests in `supabase/tests/database/`, each file one
  transaction that rolls back and starts from a known state (seed data exists).
- `supabase/seed.sql` is test data for local stacks and CI: made-up names only,
  never the client's records.
- Supabase CLI v3 (pinned in package.json): commands act on the local stack
  unless given `--remote`. The local stack uses the ports in
  `supabase/config.toml`. Never push migrations to a hosted database from a
  session; the release workflow does it.
