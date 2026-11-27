# Setting up a client project

Once per project. Most of it is accounts and keys; the factory does the rest. Each
workflow part stays switched off until its settings exist, so a project can start
with none of them and gain them as the client's accounts appear.

## 1. The repository

A new project, from a clone of the template (logged in with `gh auth login`):

```bash
bash scripts/new-client.sh <repo-name> "<Project name>"
```

A repository that already exists, made empty on GitHub: copy the template in, then
name it.

```bash
git clone https://github.com/<you>/client-project-template /tmp/template
rsync -a --exclude .git /tmp/template/ ./
node scripts/rename-project.mjs <repo-name> "<Project name>"
npm install
git add -A && git commit -m "Start from the client project template" && git push origin main
bash scripts/github-setup.sh
```

Then give the Claude GitHub App access to the repository
(github.com/apps/claude, Configure), so `@claude`, the review and cloud sessions
can work in it.

## 2. Accounts, best in the client's name

The client should own their accounts and invite you, so the site stays theirs if
you ever stop working on it.

- **Cloudflare**: the client makes an account (free) and invites you as an
  Administrator. Workers Free allows 100,000 requests a day and 10 ms of CPU per
  request; Workers Paid ($5 a month) if the site outgrows it.
- **Supabase**: the client makes an organisation and invites you as a Developer.
  Make two projects in it, `<name>-preview` and `<name>-production`, in London
  (eu-west-2) for UK users. The Free plan allows two active projects, counted
  across every organisation where you are an Owner or Administrator (one more
  reason to be a Developer in the client's), and pauses a project after a week
  without use. Pro ($25 a month) never pauses and keeps daily backups: right for a
  live site people rely on. The client decides; it is their bill.
- **Domain**: the client's, added to Cloudflare and attached to the live Worker
  (Workers, Settings, Domains & Routes) when the site goes live.

Prices and limits change: check the providers' pricing pages before quoting them
to a client.

## 3. Each Supabase project

- Authentication, URL Configuration: the Site URL is its address (staging or
  live), and the Redirect URLs include `<address>/auth/callback`.
- Authentication, Sign In / Providers: turn off "Allow new users to sign up", so
  only invited people can sign in.
- Production: custom SMTP (Authentication, Emails), so sign-in emails come from
  the client's domain. Supabase's built-in email is for testing only: it is
  heavily rate-limited and may only deliver to your own team's addresses.
- The first admin, once the first release has migrated the database: invite them
  (Authentication, Users, Invite), then in the SQL editor
  `insert into app.members (user_id, role) select id, 'admin' from auth.users where email = '<their email>';`.
  From then on an admin gives roles with `app_set_member`.

## 4. Keys and settings in GitHub

`bash scripts/github-setup.sh secrets` asks for each of these.

| Name | Kind | Where it comes from | Used by |
| --- | --- | --- | --- |
| `CLAUDE_CODE_OAUTH_TOKEN` | secret | `claude setup-token` | `@claude`, the review |
| `CLOUDFLARE_ACCOUNT_ID` | variable | the Cloudflare dashboard, Workers & Pages | preview, release |
| `CLOUDFLARE_API_TOKEN` | secret | My Profile, API Tokens, the "Edit Cloudflare Workers" template, limited to the client's account | preview, release |
| `SUPABASE_ACCESS_TOKEN` | secret | supabase.com/dashboard/account/tokens | release |
| `PREVIEW_SUPABASE_PROJECT_REF`, `PREVIEW_SUPABASE_URL`, `PREVIEW_SUPABASE_ANON_KEY` | variables | the preview project's settings | preview, staging |
| `PREVIEW_SUPABASE_DB_PASSWORD` | secret | the preview project's database password | staging |
| `PREVIEW_SITE_URL` | variable | the staging address, once the first merge has made it | staging's check |
| `PROD_SUPABASE_PROJECT_REF`, `PROD_SUPABASE_URL`, `PROD_SUPABASE_ANON_KEY` | variables | the production project's settings | release |
| `PROD_SUPABASE_DB_PASSWORD` | secret | the production project's database password | release |
| `PROD_SITE_URL` | variable | the live address | release's check |
| `BACKUP_PUBLIC_KEY` | variable | `gpg --armor --export you@example.test \| gh variable set BACKUP_PUBLIC_KEY` | release's backup |

On GitHub Free, a private repository has no rulesets (`github-setup.sh` says it
skipped one) and no environment approvals. Agents still never push to main
(`.claude/settings.json` denies it). With GitHub Pro, rulesets work, and the
`PROD_` secrets can move into an environment named `production` limited to main,
with `environment: production` added to the release job.

Private repositories spend the account's monthly Actions minutes: CI, the review
and the preview take roughly ten to fifteen minutes for each push.

## 5. The first release

1. Merge the first pull request: the Staging job deploys main to the preview
   Worker, with the preview database migrated, and prints its address.
2. Set `PREVIEW_SITE_URL` to that address.
3. When the client accepts what is on staging: Actions, Release, "Run workflow" on
   main, and say what they accepted.
4. Set `PROD_SITE_URL`, then invite the first admin (section 3).

## Backups

- The production release takes a copy of the app's data before each migration,
  encrypted to `BACKUP_PUBLIC_KEY`, kept 90 days as a workflow artifact.
- To restore: download the artifact, `gpg --decrypt data-<date>.sql.gpg > data.sql`,
  then load it into a database with the same migrations applied:
  `psql "<connection string>" -f data.sql`. Try it on the preview project first.
- On Supabase Pro, Supabase keeps daily backups as well.

## On a laptop

`npm ci`, `npm run db:start` (needs Docker), `.env.local` from `.env.example`
with the values `npx supabase status` prints, then `npm run dev`.
