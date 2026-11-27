# Agent guide

A client project from the owner's software factory: software the owner builds for
someone else. `PROJECT.md` says whose it is, what it is for and what was agreed;
this file is how the work is done, and the details sit in the files it points to.
It applies to every agent, in the terminal, the IDE, the cloud and GitHub (`@claude`).

Stack: Next.js 16 on Cloudflare Workers (through OpenNext), Supabase, Tailwind 4.

## Built for someone else

- **`PROJECT.md` is the brief.** Build what it and the issue ask for, and nothing
  more. Work outside its "Agreed scope" is a change request: say so on the issue or
  pull request and stop, until the owner adds the `scope-approved` label. Never
  invent a requirement; when something is unclear, ask the owner one question.
- **Agents never contact the client.** No messages, comments, emails or invites.
  The owner talks to the client and decides what they see, and when.
- **The client's words and design win.** Copy, terms, languages, colours and layout
  come from `PROJECT.md` and the client's design. Keep their terms as they write
  them, in the languages `PROJECT.md` lists.
- **The client's data is theirs.** Real records never go into the repository,
  tests, seeds, screenshots, issues, pull requests or logs. Use made-up data
  (`example.test`, "Example Ltd"). The client's own files (spreadsheets,
  documents) stay out of git, in `client-files/` or elsewhere; loaders read them
  from a path given when they run.
- **The live site waits for the client's yes.** A merge goes to the staging site
  only. Production is a release the owner starts by hand, once the client has
  accepted what is on staging (`.github/workflows/release.yml`).
- **No third parties by default.** The browser talks to the app and Supabase alone
  (the Content-Security-Policy, `src/lib/security/csp.ts`). An analytics tag, a
  font service or a map needs the client's agreement in `PROJECT.md` ("Data and
  privacy") before the policy changes.

## Rules that never bend

- **No secrets in the repository**, even though it is private: keys live in GitHub's
  secrets and in Cloudflare.
- **No AI attribution.** Never add `Co-Authored-By` or any AI co-author credit to
  commits, nor "Generated with Claude Code" or similar to pull requests.
- **Work on a branch, deliver a pull request.** Branches are `claude/<short-name>`.
  Nobody pushes to main; the owner merges and releases.
- **Migrations are append-only.** Never edit one that is on main. Hosted databases
  get them from the release workflow, never from a laptop or a session.
- **Tests are acceptance checks.** Add freely. Never weaken, delete or re-record an
  existing test or screenshot to get green; if one is truly wrong, say why in the
  pull request (the guard then needs the owner's `approved-test-change` label).

## How work flows

Use the `/ship` skill for any change; it holds the details. In short:

1. Understand: read `PROJECT.md`, the issue, the code it touches and the rules for
   those paths (`.claude/rules/`). Find the scope line the work serves.
2. Plan small: one change per pull request.
3. Build on what exists: components from `src/components/ui.tsx` (shown at
   `/design`), tokens from `src/app/globals.css`.
4. Verify like a user: `npm run check`, then `npm run test:e2e` when a page changed
   (it builds the Worker and runs on it, as Cloudflare will), and look at the page
   at the sizes and in the languages `PROJECT.md` names.
5. Pull request with the template, opened yourself (`gh pr create`), its body ending
   `Closes #N` when it builds an issue. Watch CI (`gh pr checks --watch`) and fix
   it. The preview workflow comments a preview link for the owner.
6. Log friction: if the factory slowed you down or let a mistake through, add one
   line to `docs/factory/friction.md`.

For a bug, use `/debug`: reproduce it as a failing end-to-end test, then fix the app.
A new project starts with `/kickoff`, which turns the client's brief into `PROJECT.md`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run check` | Format, lint, types, unit tests and dead code. Run before every commit. |
| `npm run test:e2e` | Builds the Worker, then pages, accessibility and security checks on it. |
| `npm run test:db` | pgTAP tests on the local database (`npm run db:start` first). |
| `npm run guard` | The CI guard: migrations append-only, protected tests. |
| `npm run dev` | The app on `next dev`, with the Worker's bindings. |
| `npm run worker:build`, `npm run worker:preview` | The Worker build, served locally by workerd. |

The local Supabase stack uses ports 564xx (`supabase/config.toml`), a block of its
own so it runs beside other projects' stacks. CLI v3 commands act on the local
stack unless given `--remote`.

## Map

- `PROJECT.md` the brief: client, users, scope, design, data, accounts, milestones.
- `src/app/` pages, server actions and routes; `src/proxy.ts` runs before every
  request (the security policy and the sign-in session).
- `src/components/ui.tsx` shared UI, shown at `/design` (previews only).
- `src/lib/<domain>/` pure logic with tests beside it; `src/lib/project.ts` the
  project's name and language.
- `supabase/migrations/`, `supabase/tests/` (pgTAP), `supabase/seed.sql` (made-up data).
- `e2e/` Playwright suites; `scripts/` the factory's tools.
- `docs/FACTORY.md` how this factory works; `docs/SETUP.md` accounts and keys;
  `docs/HANDOVER.md` what the client gets at the end.

## Context worth knowing

- The app runs on Cloudflare Workers, not a Node server: no writing files, no work
  after the response, and short requests (the Workers Free plan allows 10 ms of
  CPU per request). `nodejs_compat` covers most of Node; a new dependency is
  proven by `npm run test:e2e`, which runs the Worker build.
- Every page renders per request (the root layout waits for it), because the
  security policy's nonce needs it. Saves call `revalidatePath`; never copy props
  into state.
- Data lives in the private `app` schema, reached only through `public` RPCs that
  check the caller (`.claude/rules/database.md`). Roles: `admin` and `editor`
  (`app.members`); everyone else is a visitor.
- Server code asks the time from `src/lib/dates/clock.ts`, never `new Date()`.
- Accessibility is WCAG 2.2 AA; the end-to-end suite runs axe on every public page.

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all
differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
