# Client app

A client project made from the owner's client-project template: Next.js 16 on
Cloudflare Workers (OpenNext), Supabase and Tailwind 4, built by a software
factory of agents, rules and checks.

- What it is, for whom, and what was agreed: [`PROJECT.md`](PROJECT.md)
- How the work is done: [`AGENTS.md`](AGENTS.md) and [`docs/FACTORY.md`](docs/FACTORY.md)
- Accounts, keys and the first deploy: [`docs/SETUP.md`](docs/SETUP.md)
- What the client gets at the end: [`docs/HANDOVER.md`](docs/HANDOVER.md)

## Run it

```bash
npm ci
npm run db:start        # the local Supabase stack (Docker), with made-up data
cp .env.example .env.local   # fill in from `npx supabase status`
npm run dev             # http://localhost:3000
```

`npm run check` before every commit; `npm run test:e2e` builds the Worker and runs
the end-to-end suite on it, as Cloudflare will.

## Where it runs

| | Address | Updated |
| --- | --- | --- |
| Pull request previews | `pr-<number>-<name>-preview.<account>.workers.dev` | every push to a pull request |
| Staging | `<name>-preview.<account>.workers.dev` | every merge to main |
| Live | `<name>.<account>.workers.dev`, or the client's domain | when the owner runs the release |
