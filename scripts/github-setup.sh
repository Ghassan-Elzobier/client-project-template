#!/usr/bin/env bash
# One-time GitHub settings for a client project. Safe to run again: each step sets
# the same state. Needs `gh auth login` as the repository's owner.
#
#   bash scripts/github-setup.sh            settings, labels and the main ruleset
#   bash scripts/github-setup.sh secrets    also asks for the keys and settings
#                                           the workflows need (docs/SETUP.md)
#
# Some GitHub features need a paid plan in a private repository (rulesets on
# GitHub Free, for one); a step GitHub refuses is reported and skipped.
set -euo pipefail

repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
visibility=$(gh repo view --json visibility --jq .visibility)
echo "Setting up $repo ($visibility)"
if [ "$visibility" != "PRIVATE" ]; then
  echo "This repository is $visibility. Client code belongs in a private repository:" >&2
  echo "  gh repo edit $repo --visibility private --accept-visibility-change-consequences" >&2
fi

try() {
  local what=$1
  shift
  if ! "$@" >/dev/null 2>&1; then echo "  skipped: $what (GitHub refused it; often a paid-plan feature for private repositories)"; fi
}

# Merging: tidy branches away after merging, and allow "merge when checks pass".
try "merge settings" gh api -X PATCH "repos/$repo" \
  -F allow_auto_merge=true -F delete_branch_on_merge=true -F allow_update_branch=true \
  -F allow_merge_commit=true -F allow_squash_merge=true -F allow_rebase_merge=false

# Dependency alerts and their fixes (free for private repositories too).
try "Dependabot alerts" gh api -X PUT "repos/$repo/vulnerability-alerts"
try "Dependabot security fixes" gh api -X PUT "repos/$repo/automated-security-fixes"

# Labels the workflows and skills use.
label() { gh label create "$1" --color "$2" --description "$3" --force >/dev/null; }
label feature 0e8a16 "Something the agreed scope says the app should do"
label change-request fbca04 "Outside the agreed scope (PROJECT.md): waits for the owner's scope-approved"
label scope-approved 0e8a16 "The owner agreed this change with the client: it may be built"
label bug d73a4a "Works differently from how it should"
label approved-test-change d93f0b "Owner approves changing an existing test or screenshot (the guard checks)"
label skip-review cfd3d7 "No automatic Claude review on this pull request"
label factory 5319e7 "An improvement to the factory itself"
label deps 0366d6 "Dependency updates"
label ci 0366d6 "Workflow and action updates"

# main: changes arrive only through pull requests that pass CI and the guard. The
# owner may still merge a pull request whose checks fail (bypass "pull_request").
ruleset_json=$(
  cat <<'JSON'
{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "bypass_actors": [{ "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "pull_request" }],
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "pull_request", "parameters": {
        "required_approving_review_count": 0, "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false, "require_last_push_approval": false,
        "required_review_thread_resolution": false } },
    { "type": "required_status_checks", "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [{ "context": "Checks" }, { "context": "Integration" }, { "context": "Guard" }] } }
  ]
}
JSON
)
existing=$(gh api "repos/$repo/rulesets" --jq '.[] | select(.name == "main") | .id' 2>/dev/null || true)
if [ -n "$existing" ]; then
  try "the main ruleset" gh api -X PUT "repos/$repo/rulesets/$existing" --input - <<<"$ruleset_json"
else
  try "the main ruleset" gh api -X POST "repos/$repo/rulesets" --input - <<<"$ruleset_json"
fi

if [ "${1:-}" = "secrets" ]; then
  echo
  echo "Each secret prompt hides what you type; nothing is stored outside GitHub."
  echo "Leave a value blank to skip it for now (its workflow step stays off)."
  ask_var() {
    local value
    read -rp "$2: " value
    [ -n "$value" ] && gh variable set "$1" --body "$value"
    return 0
  }
  ask_secret() {
    echo "$2 (blank skips):"
    local value
    read -rsp "> " value
    echo
    [ -n "$value" ] && gh secret set "$1" --body "$value"
    return 0
  }
  ask_secret CLAUDE_CODE_OAUTH_TOKEN "Claude token: run 'claude setup-token' in another terminal and paste it"
  ask_var CLOUDFLARE_ACCOUNT_ID "Cloudflare account id (Workers & Pages, the right-hand column)"
  ask_secret CLOUDFLARE_API_TOKEN "Cloudflare API token (template 'Edit Cloudflare Workers')"
  ask_secret SUPABASE_ACCESS_TOKEN "Supabase access token (supabase.com/dashboard/account/tokens)"
  for stage in PREVIEW PROD; do
    echo
    echo "The $stage Supabase project:"
    ask_var "${stage}_SUPABASE_PROJECT_REF" "  project ref (the id in its dashboard address)"
    ask_var "${stage}_SUPABASE_URL" "  project URL (https://<ref>.supabase.co)"
    ask_var "${stage}_SUPABASE_ANON_KEY" "  anon (public) key"
    ask_secret "${stage}_SUPABASE_DB_PASSWORD" "  database password"
    ask_var "${stage}_SITE_URL" "  the site's address (blank until it has one)"
  done
  echo
  echo "For encrypted backups before each production migration, give GitHub your gpg public key:"
  echo "  gpg --armor --export you@example.test | gh variable set BACKUP_PUBLIC_KEY"
fi

echo "Done. The rest is in the browser: docs/SETUP.md."
