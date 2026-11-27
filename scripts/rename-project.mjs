#!/usr/bin/env node
// Names a project made from the template: the package, the Workers, the local
// Supabase stack and its ports, and the name its pages show. scripts/new-client.sh
// runs it; run it by hand in a repository the template was copied into. Safe to
// run again with a new name.
//
//   node scripts/rename-project.mjs <slug> "<Project name>" [port block 1-9]
//
// The port block moves the local Supabase stack to 5<block>4xx (the template's
// own is 564xx, the portal's 554xx), so client stacks can run side by side.
import { readFileSync, writeFileSync } from "node:fs";

const [slug, title, block = "7"] = process.argv.slice(2);
if (!slug || !/^[a-z0-9][a-z0-9-]{1,50}$/.test(slug) || !title?.trim() || !/^[1-9]$/.test(block)) {
  console.error('usage: node scripts/rename-project.mjs <slug> "<Project name>" [port block 1-9]');
  console.error("  slug: lower-case letters, digits and dashes, as in the repository's name");
  process.exit(1);
}

/** Replaces each pattern in a file, and fails loudly when one no longer matches. */
function edit(path, replacements) {
  let text = readFileSync(path, "utf8");
  for (const [pattern, to] of replacements) {
    if (!pattern.test(text)) throw new Error(`${path}: found nothing like ${pattern}`);
    pattern.lastIndex = 0;
    text = text.replace(pattern, to);
  }
  writeFileSync(path, text);
}

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
pkg.name = slug;
writeFileSync("package.json", `${JSON.stringify(pkg, null, 2)}\n`);

edit("wrangler.jsonc", [[/^  "name": "[^"]*",$/m, `  "name": "${slug}",`]]);
edit("supabase/config.toml", [
  [/^project_id = "[^"]*"$/m, `project_id = "${slug}"`],
  [/\b5\d4(2[0-4])\b/g, `5${block}4$1`],
  [/\b5\d4xx\b/g, `5${block}4xx`],
]);
edit("src/lib/project.ts", [[/^ {2}name: .*,$/m, `  name: ${JSON.stringify(title.trim())},`]]);
edit("AGENTS.md", [[/\b5\d4xx\b/g, `5${block}4xx`]]);
edit("README.md", [[/^# .*$/m, `# ${title.trim()}`]]);
edit("PROJECT.md", [[/^# .*$/m, `# ${title.trim()}: project brief`]]);

console.log(`Named the project "${title.trim()}" (${slug}); local Supabase ports 5${block}4xx.`);
