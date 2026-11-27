#!/usr/bin/env bash
# Runs the end-to-end suite (e2e/) against the Worker build, served by Wrangler
# on workerd, the runtime Cloudflare uses, so what passes here runs there. The
# same script runs on a laptop, in a cloud session and in CI.
#
#   npm run test:e2e                          everything
#   npm run test:e2e -- e2e/pages.spec.ts     one file (any Playwright arguments)
#   npm run test:e2e:update                   re-render screenshots, for a deliberate design change
#
# Screenshot tests ("looks as approved" in their title) render only in CI, on
# one machine, so every baseline comes from the same browser and fonts; locally
# they are skipped. E2E_SKIP_BUILD=1 reuses the last build.
set -euo pipefail
cd "$(dirname "$0")/.."

source scripts/e2e-env.sh

if [ "${E2E_SKIP_BUILD:-}" != "1" ]; then
  npx opennextjs-cloudflare build
fi

if [ -n "${CI:-}" ]; then
  exec npx playwright test "$@"
fi
exec npx playwright test --grep-invert "looks as approved" "$@"
