#!/usr/bin/env bash
# A copy of the client's data before the live database changes (release.yml).
#
# Supabase's Free plan keeps no backups, and a migration that drops the wrong
# rows passes every test (the tests run on made-up data). So the production
# release takes a copy before it migrates, encrypted to the owner's public key,
# and keeps it as a workflow artifact for 90 days.
#
#   scripts/backup.sh pending [--remote]        "true" when migrations are waiting to be applied
#   scripts/backup.sh encrypted <dir> [--remote]
#                                               dump the app's data, and encrypt it to BACKUP_PUBLIC_KEY
#
# A dump holds data only, from the `app` schema. Sign-in accounts (Supabase's own
# `auth` schema) are not in it: people sign in again, or are invited again.
# Restoring: decrypt with the private key, then load it with psql into the
# database (docs/SETUP.md, "Backups").
set -euo pipefail
cd "$(dirname "$0")/.."

fail() {
  echo "backup: $*" >&2
  exit 1
}

# A plain dump only ever exists in here, never where a workflow uploads from.
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

pending() {
  local out
  out="$(npx supabase db push "$@" --dry-run --yes --output-format json --agent no 2>/dev/null || true)"
  # Its last line of JSON says whether the database is up to date. Anything
  # unreadable counts as pending: a backup too many is the safe mistake.
  if printf '%s\n' "$out" | grep '^{' | tail -1 | grep -q '"upToDate":true'; then echo false; else echo true; fi
}

encrypted() {
  local out="${1:?usage: backup.sh encrypted <dir> [--remote]}"
  shift
  [ -n "${BACKUP_PUBLIC_KEY:-}" ] || fail "BACKUP_PUBLIC_KEY is not set (docs/SETUP.md, Backups)"
  mkdir -p "$out"
  npx supabase db dump "$@" --data-only --use-copy --schema app -f "$WORK/data.sql" >&2
  grep -q '^COPY "app"\."members" ' "$WORK/data.sql" || fail "the dump has no members table, so it is not this app's data"

  local home="$WORK/public-key"
  mkdir -m 700 "$home"
  printf '%s\n' "$BACKUP_PUBLIC_KEY" | gpg --homedir "$home" --batch --quiet --import ||
    fail "BACKUP_PUBLIC_KEY is not a public key gpg can read"
  local key
  key="$(gpg --homedir "$home" --batch --with-colons --list-keys | awk -F: '$1 == "fpr" { print $10; exit }')"
  [ -n "$key" ] || fail "BACKUP_PUBLIC_KEY holds no public key"
  local name
  name="data-$(date -u +%Y%m%d-%H%M%S).sql.gpg"
  gpg --homedir "$home" --batch --yes --trust-model always --recipient "$key" \
    --output "$out/$name" --encrypt "$WORK/data.sql"
  rm -f "$WORK/data.sql"

  # The upload folder may hold nothing but files encrypted to a public key.
  if find "$out" -type f ! -name '*.gpg' | grep -q .; then
    fail "$out holds a file that is not encrypted: $(find "$out" -type f ! -name '*.gpg' | head -1)"
  fi
  gpg --batch --list-packets "$out/$name" 2>/dev/null | grep -q '^:pubkey enc packet:' ||
    fail "$out/$name is not encrypted to a public key"
  echo "Encrypted to key ${key: -16}: $out/$name ($(wc -c <"$out/$name") bytes). Only its private key opens it." >&2
}

case "${1:-}" in
  pending)
    shift
    pending "$@"
    ;;
  encrypted)
    shift
    encrypted "$@"
    ;;
  *) fail "usage: backup.sh pending|encrypted ..." ;;
esac
