#!/usr/bin/env node
// Writes the preview's address on the pull request: one comment, kept up to date
// on every push (.github/workflows/preview.yml). No AI.
//
// Needs GH_TOKEN, GITHUB_REPOSITORY, PR, HEAD, and URL (empty when the upload
// printed no address).
import { execFileSync } from "node:child_process";

const { GITHUB_REPOSITORY: repo, PR: pr, URL: url = "", HEAD: head = "" } = process.env;
if (!repo || !pr) {
  console.error("preview-comment: GITHUB_REPOSITORY and PR are needed.");
  process.exit(1);
}

const MARK = "<!-- preview -->";
const gh = (...args) => execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });

const files = gh("api", "--paginate", `repos/${repo}/pulls/${pr}/files`, "--jq", ".[].filename").split("\n");
const changesDatabase = files.some((f) => f.startsWith("supabase/migrations/"));

const lines = [
  MARK,
  url ? `**Preview:** ${url}` : "**Preview:** the upload printed no address; the workflow's log has the details.",
  "",
  `For ${head.slice(0, 7)}, on the preview database with made-up data. Only the owner shares this link.`,
];
if (changesDatabase)
  lines.push(
    "",
    "This pull request changes the database. The preview database gets the change after the merge, so parts of this preview may not work until then.",
  );
const body = lines.join("\n");

const pages = JSON.parse(gh("api", "--paginate", "--slurp", `repos/${repo}/issues/${pr}/comments?per_page=100`));
const existing = pages.flat().find((c) => c.user?.login === "github-actions[bot]" && c.body?.startsWith(MARK));
if (existing) gh("api", "-X", "PATCH", `repos/${repo}/issues/comments/${existing.id}`, "-f", `body=${body}`);
else gh("api", "-X", "POST", `repos/${repo}/issues/${pr}/comments`, "-f", `body=${body}`);
console.log(existing ? "Updated the preview comment." : "Posted the preview comment.");
