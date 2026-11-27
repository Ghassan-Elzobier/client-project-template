---
paths:
  - "**"
---

# Client rules

This software belongs to a client. These hold for every file.

- `PROJECT.md` is the brief. Before building, find the line of its "Agreed scope"
  the work serves, and name it in the pull request. Work that serves none is a
  change request: label the issue `change-request`, say what it adds, and stop
  until the owner adds `scope-approved`.
- Never edit `PROJECT.md`'s "Agreed scope", "Milestones" or "Decisions" unless the
  owner asks in this task. Proposals go in the pull request or the issue.
- The client's words: page text, labels and terms come from `PROJECT.md` and the
  client's design, in the languages it lists. Don't rename their terms, translate
  them into your own, or add marketing copy. A missing word is a question for the
  owner, with a placeholder marked `TODO(copy)` meanwhile.
- The client's data: never in the repository, tests, seeds, screenshots, issues,
  pull requests or logs. Made-up data only (`example.test`, "Example Ltd"). Their
  files stay in `client-files/` (ignored by git) or outside the repository, and
  scripts read them from a path given when they run.
- Nobody outside: agents never message, email, invite or mention the client.
- No new third party (a script, font, analytics, map, API) without a line for it
  in `PROJECT.md` "Data and privacy", which the owner writes with the client.
