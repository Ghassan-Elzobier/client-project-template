# Sourced, not run: the environment the end-to-end suite builds and runs with.
# Points the app at the local Supabase stack (migrations and supabase/seed.sql
# applied), starting it if it is down, and blanks every setting from
# .env.example first, so live values in .env.local never reach the build.
# Without Docker the stack can't start: the suite then runs with no database,
# and says so. Expects to be sourced from the repository root.

while IFS= read -r name; do
  export "$name="
done < <(sed -nE 's/^([A-Z_][A-Z0-9_]*)=.*/\1/p' .env.example)

if ! npx supabase status >/dev/null 2>&1; then
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    npm run db:start
  else
    echo "No Docker: the suite runs without a database (pages that need one say it is not set up)." >&2
  fi
fi

if npx supabase status >/dev/null 2>&1; then
  eval "$(npx supabase status -o env | sed -nE 's/^([A-Z_]+)=(.*)$/export SB_\1=\2/p')"
  export NEXT_PUBLIC_SUPABASE_URL="$SB_API_URL"
  export NEXT_PUBLIC_SUPABASE_ANON_KEY="$SB_ANON_KEY"
fi

export E2E_PORT="${E2E_PORT:-3100}"
export NEXT_PUBLIC_SITE_URL="http://127.0.0.1:$E2E_PORT"
export APP_FIXED_NOW="${APP_FIXED_NOW:-2026-11-16T09:30:00Z}"
export NEXT_TELEMETRY_DISABLED=1
export WRANGLER_SEND_METRICS=false
