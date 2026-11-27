# The client factory

How client projects are built: the owner agrees the work with the client, an agent
builds it inside a harness of rules and checks, the owner reviews a pull request
that has already proved itself, the client tries it on staging, and the owner
releases it. It is the owner's portal factory, adapted for software that belongs
to someone else.

## From a client's request to their live site

| Step | Who | What happens |
| --- | --- | --- |
| Brief | owner and client | The client says what they need; the owner runs `/kickoff` with it. `PROJECT.md` gets the scope, the design, the data rules and the open questions. |
| Issues | owner | Each agreed outcome becomes a Feature issue quoting its scope line. Anything new later is a Change request, built only once the owner adds `scope-approved`. |
| Build | Claude | `@claude` on the issue, or a session: `/ship` builds it on a branch and opens a pull request. |
| Checks | CI | Checks, Integration (database tests, then end-to-end on the Worker build), Guard, and an independent Claude review. |
| Preview | CI | The preview workflow uploads the pull request to Cloudflare and comments its link. The owner looks; the client sees it only if the owner sends it. |
| Merge | owner | Staging (the preview Worker's own address) updates by itself, with the preview database migrated. |
| Acceptance | client | The client tries staging and says yes, best in writing. |
| Release | owner | Actions, Release, "Run workflow" on main, saying what the client accepted. CI must have passed on that commit; the live data is backed up, migrated, and the Worker deployed. |
| Handover | owner | `docs/HANDOVER.md`: what the client owns, and how to keep it running. |

## The same as the portal's factory

- `AGENTS.md` carries the essentials into every session; `.claude/rules/` adds the
  rules for the paths a change touches; skills hold the procedures.
- Hooks format every edit, and the Stop hook runs the fast checks before Claude may
  finish.
- The guard keeps migrations append-only and existing tests and screenshots out of
  an agent's reach (`approved-test-change`).
- The independent Claude review: a fresh, read-only session whose answer a script
  posts, naming the commit it covered (`.claude/commands/review-pr.md`).
- `@claude` opens pull requests, never "Create PR" links.
- The friction log (`docs/factory/friction.md`), one line per snag.

## What is different, and why

| | Portal | Client project | Why |
| --- | --- | --- | --- |
| Who decides what is built | the owner, and R&D proposals | the client, through the owner and `PROJECT.md` | It is their product. Unagreed work costs the client money and the owner trust. |
| R&D sweeps, error triage, weekly refactor runs | yes | no | They file and build work nobody agreed. Ideas go under "Later (not agreed yet)" for the owner to raise. |
| Repository | public | private | Client code and the client's business are not the owner's to publish. |
| Hosting | Vercel | Cloudflare Workers, through OpenNext | The owner's choice for client work: a generous free plan, in an account the client can own. |
| A merge | deploys the live site | deploys staging | The client accepts before their users see it. |
| The live site | updates on merge | the owner runs the release | GitHub's environment approvals need GitHub Enterprise in private repositories, so the gate is a manual run. |
| Third parties | the owner's call | the client's, written in `PROJECT.md` | It is their users' data: under UK GDPR the client is usually the controller and the owner a processor working for them. |
| The owner's claude.ai connectors in Actions | off for the review and R&D | off in every workflow | A client's repository must never reach the owner's mail, calendar or portal. |

## How quality is kept

| When | Check | Catches |
| --- | --- | --- |
| Every edit | Hook: Prettier on the file | Style, so it never costs a review |
| Before Claude may finish | Stop hook: format, lint, types, unit tests on changed code | Broken work handed back as done |
| Every pull request | **Checks**: format, lint (design rules), types, unit tests, dead code | Regressions, one-off styles, unused code |
| Every pull request | **Integration**: pgTAP (every door locked, roles), then every public page at a phone, a small phone and a desktop, accessibility and the security policy, on the Worker build in workerd | Access leaks, broken pages, code that runs on Node but not on Cloudflare |
| Every pull request | **Guard**: migrations append-only, existing tests need the owner's label | An agent getting to green by weakening the checks |
| Every pull request | **Claude review** | Logic problems, scope creep, the client's data or words where they should not be |
| Every pull request | **Preview** on Cloudflare | What the client would see |
| Release | CI green on the commit, a backup, the migrations, the deploy, `/api/health` | A red commit, lost data, a deploy that does not answer |
| Weekly | Dependabot | Vulnerable dependencies |

## Telling the client how it is built

Before work starts, tell the client that the code is written with AI agents and
reviewed, tested and released by you, and say so in your agreement. The commits
carry your name, and the client should hear it from you.

## Starting a project

`docs/SETUP.md`: the repository (`scripts/new-client.sh`), the accounts (best in
the client's name), the keys, and the first release.
