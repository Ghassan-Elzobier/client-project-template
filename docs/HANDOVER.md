# Handover

What the client gets when the work is done, and what they need to keep it
running. Keep it current as the project goes; at handover, fill in the gaps and
walk the client through it, or send them a copy.

## What they own

| Thing | Where | Owner |
| --- | --- | --- |
| The live site | TODO: address | the client |
| Cloudflare account (the site's Workers) | TODO | the client |
| Supabase organisation (the data, sign-in) | TODO | the client |
| Domain | TODO | the client |
| The code | TODO: this repository, transferred or copied | as the agreement says |

## Day to day

- Giving someone editing rights: TODO (invite in Supabase, then a role)
- What costs money, and when it would start to: TODO
- If the site seems down: open `<address>/api/health`. `"database": "unreachable"`
  on Supabase's Free plan usually means the project paused after a quiet week;
  restore it from the Supabase dashboard.

## Their data

- Where it lives: the Supabase production project, region TODO.
- Exporting it: TODO (a CSV export from the admin area, or the Supabase dashboard)
- Backups: TODO (Supabase Pro daily backups, and the copies taken before each release)

## After handover

- Asking for a change: TODO (how, and the terms)
- Support: TODO (what is included, for how long)
