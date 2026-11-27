#!/usr/bin/env bash
# Starts a client project from this template: a private repository made from it,
# cloned beside this one, named after the project, with the factory's GitHub
# settings. Run it from a clone of the template, logged in with `gh auth login`.
#
#   bash scripts/new-client.sh <repo-name> "<Project name>" [port block 1-9]
#
# For a repository that already exists (made empty on GitHub), copy the template
# in instead: docs/SETUP.md, "A repository that already exists".
# What comes next (accounts, keys, the brief) is in docs/SETUP.md.
set -euo pipefail
cd "$(dirname "$0")/.."

name="${1:?usage: new-client.sh <repo-name> \"<Project name>\" [port block 1-9]}"
title="${2:?usage: new-client.sh <repo-name> \"<Project name>\" [port block 1-9]}"
block="${3:-7}"
[[ "$name" =~ ^[a-z0-9][a-z0-9-]{1,50}$ ]] || {
  echo "The repository name takes lower-case letters, digits and dashes." >&2
  exit 1
}

template=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
owner=${template%%/*}
gh api -X PATCH "repos/$template" --silent -F is_template=true

# Client code is never public: a private repository, made from the template's main.
cd ..
gh repo create "$owner/$name" --private --template "$template" --clone
cd "$name"
# A repository made from a template starts with one commit; the clone can lag it by a moment.
for _ in 1 2 3 4 5; do git pull --quiet origin main 2>/dev/null && break || sleep 3; done

node scripts/rename-project.mjs "$name" "$title" "$block"
npm install --no-audit --no-fund >/dev/null
npx prettier --write package.json >/dev/null
git add -A
git commit --quiet -m "Name the project: $title"
# The one push to main the factory makes: setting up, before main is protected.
git push --quiet origin main

bash scripts/github-setup.sh
echo
echo "Made $owner/$name in $(pwd)."
echo "Next: docs/SETUP.md (accounts and keys), then /kickoff with the client's brief."
