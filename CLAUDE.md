@AGENTS.md

# Claude Code

- Skills: `/kickoff` (the client's brief into `PROJECT.md` and the first issues),
  `/ship` (any change), `/design` (UI from the client's design), `/migrate`
  (database), `/debug` (a bug).
- Agents: `verifier` (the full suite) and `debugger`.
- Hooks format each file you edit, and the Stop hook runs the fast checks on your
  changes before you can finish (`.claude/hooks/`).
- When compacting, keep: the task, the files changed, the checks run and their results.
