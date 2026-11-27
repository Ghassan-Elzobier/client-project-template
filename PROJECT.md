# Client app: project brief

The source of truth for what this project is and what was agreed. The owner keeps
it current; agents read it before every change, and change "Agreed scope",
"Milestones" or "Decisions" only when the owner asks. `/kickoff` fills it in from
the client's brief. Gaps are marked `TODO(ask):`.

Personal details stay out: a first name or an organisation is enough. Prices,
invoices and terms live in the owner's portal (Clients), not in this repository.

## Client

- Who: TODO(ask): first name or organisation
- How the owner and the client talk: TODO(ask): WhatsApp, email, calls (agents never contact the client)
- Time zone: Europe/London
- Terms: TODO(ask): fixed price, day rate or unpaid; the details are in the owner's portal

## What it is for

TODO(ask): the problem, in the client's own words. One paragraph.

## Who uses it

- TODO(ask): who, what they do with it, on which devices

## Languages and words

- Interface languages: TODO(ask)
- Right to left: no
- The client's own terms (never renamed):
  - TODO(ask): term, and what it means to them

## Agreed scope

### First version

- [ ] TODO(ask): an outcome a test can check

### Later (not agreed yet)

Ideas worth raising with the client. Nothing here is built until it moves up.

- TODO: idea, and why it might help

### Not doing

- TODO: what was ruled out, so nobody builds it by accident

## Design

- Source: TODO(ask): a Figma link, images, or "build from this brief"
- Brand: TODO(ask): colours, typeface (self-hosted), logo. Tokens go in `src/app/globals.css`.
- Devices: phone first (360 to 412 px) and desktop, unless the client says otherwise

## Data and privacy

- What the app stores: TODO
- Personal data: TODO(ask): none, or whose (editors' emails, visitors' names), why it is needed, and how long it is kept
- Where the client's existing data comes from: TODO(ask): a spreadsheet, documents; kept in `client-files/`, never committed
- Rights in that content: TODO(ask): is it all the client's own work? Material copied from published sources (a glossary, a dictionary, a report) can be protected as a text or as a database, so it stays private to the client until its licence is checked
- Third parties the browser may contact: none (the security policy blocks everything else)
- Cookies: sign-in only, for the people who run the site

## Accounts and hosting

| Service | Account owner | Notes |
| --- | --- | --- |
| Cloudflare (Workers) | TODO(ask): best the client, with the owner invited | Free plan to start; Workers Paid if the CPU limit bites |
| Supabase (database, sign-in) | TODO(ask): best the client, with the owner as Developer | Two projects: preview and production |
| Domain | TODO(ask) | |
| GitHub | the owner (private repository) | |

## Milestones and sign-off

| Milestone | What the client accepts | Status |
| --- | --- | --- |
| First version | TODO | not started |

## Decisions

- YYYY-MM-DD: TODO: what was decided, and who decided it

## Questions for the client

- TODO(ask): plain questions the owner can paste into a message
