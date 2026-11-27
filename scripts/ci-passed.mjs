#!/usr/bin/env node
// Stops a production release of a commit CI did not pass (release.yml). No AI.
// Needs GH_TOKEN, GITHUB_REPOSITORY and SHA.
import { execFileSync } from "node:child_process";

const REQUIRED = ["Checks", "Integration"];
const { GITHUB_REPOSITORY: repo, SHA: sha } = process.env;
if (!repo || !sha) {
  console.error("ci-passed: GITHUB_REPOSITORY and SHA are needed.");
  process.exit(1);
}

const pages = JSON.parse(
  execFileSync("gh", ["api", "--paginate", "--slurp", `repos/${repo}/commits/${sha}/check-runs?per_page=100`], {
    encoding: "utf8",
  }),
);
const runs = pages.flatMap((page) => page.check_runs ?? []);
const missing = REQUIRED.filter((name) => !runs.some((r) => r.name === name && r.conclusion === "success"));
if (missing.length) {
  console.error(
    `CI has not passed on ${sha} (${missing.join(" and ")} not green). Wait for CI to finish, or fix main, then run the release again.`,
  );
  process.exit(1);
}
console.log(`CI passed on ${sha}: ${REQUIRED.join(" and ")}.`);
