#!/usr/bin/env bash
#
# Sync env vars from .env.local to a linked Vercel project.
# Pushes each variable to production, preview, and development envs.
#
# Prereqs:
#   1. Install Node.js (>= 18) and run: npm install -g vercel
#   2. Authenticate: vercel login
#   3. From the project folder: ./scripts/sync-vercel-env.sh
#
# The script will run `vercel link` the first time so you can pick the
# correct project.

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v vercel >/dev/null 2>&1; then
  echo "✗ 'vercel' CLI not found. Install with: npm install -g vercel" >&2
  exit 1
fi

if [ ! -f .env.local ]; then
  echo "✗ .env.local not found in $(pwd)" >&2
  exit 1
fi

if [ ! -f .vercel/project.json ]; then
  echo "→ Linking to Vercel project (pick: devweb3-outlookcoms-projects / current-leads)"
  vercel link
fi

VARS=(DATABASE_URL SESSION_SECRET ADMIN_USERNAME ADMIN_PASSWORD SALES_USERNAME SALES_PASSWORD)
ENVS=(production preview development)

get_var() {
  local key="$1"
  grep -E "^${key}=" .env.local | head -1 | sed -E "s/^${key}=//"
}

for var in "${VARS[@]}"; do
  val="$(get_var "$var" || true)"
  if [ -z "${val:-}" ]; then
    echo "⚠ Skipping $var (empty in .env.local)"
    continue
  fi
  for env in "${ENVS[@]}"; do
    printf "→ %-18s %s\n" "$var" "$env"
    vercel env rm "$var" "$env" --yes >/dev/null 2>&1 || true
    printf '%s' "$val" | vercel env add "$var" "$env" >/dev/null
  done
done

echo
echo "✓ Env vars synced. Now trigger a production deploy:"
echo "    vercel --prod"
