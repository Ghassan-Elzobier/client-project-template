---
name: migrate
description: Change the database safely - a new table, column, RPC or policy in Supabase, with its pgTAP test, released before the code that needs it. Use for any change under supabase/.
argument-hint: "[what the database needs]"
---

# Change the database

Change: $ARGUMENTS

1. **New file, never an edit.** `npx supabase migration new <snake_name>`. Files
   on main are applied to the client's live database and must not change (the
   guard enforces it).
2. **Keep the access model.** Tables live in the private `app` schema, which the
   API roles cannot reach. Pages call `public` RPCs that check the caller first
   (`security definer`, `set search_path to ''`, then `app.require_role` or
   `app.has_role`, or a read scoped by `auth.uid()`). Row level security on every
   table. Revoke and grant each new function on purpose. Read
   `supabase/migrations/20261127120000_app_foundation.sql` for the pattern.
3. **The client's data lasts longer than the code.** Name tables and columns in the
   client's terms (`PROJECT.md`), keep their source's identifiers when importing
   (a row number, a code) so a reload can match rows, and never drop or rewrite
   data in a migration without a backup path the owner has agreed.
4. **Expand, then contract.** The live database gets the migration moments before
   the new Worker, and the old one may still be serving. So it must work with both:
   add columns nullable or with defaults, add new RPCs beside old ones, and remove
   old ones in a later pull request once nothing calls them.
5. **Test it.** Add a file in `supabase/tests/database/` (pgTAP, one transaction
   that rolls back, Given/When/Then descriptions, made-up emails): what each role
   may and may not do. `npm run db:start` (or `npx supabase db reset` after
   editing), then `npm run test:db`.
6. **Seed if pages need it.** Test data goes in `supabase/seed.sql`, made up.
7. **Ship it with `/ship`.** On merge, `.github/workflows/release.yml` applies it
   to the staging database; the owner's production release applies it to the live
   one after a backup. Never run `supabase db push` against a hosted database
   from a session.
