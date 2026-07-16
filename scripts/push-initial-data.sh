#!/usr/bin/env bash
# Initial data load: dumps the local SQLite DB and pushes it to the sync API.
# Usage: ./scripts/push-initial-data.sh <API_URL> <SYNC_TOKEN> [DB_PATH]
set -euo pipefail

API_URL="${1:?Usage: push-initial-data.sh <API_URL> <SYNC_TOKEN> [DB_PATH]}"
TOKEN="${2:?Missing SYNC_TOKEN}"
DB="${3:-$HOME/.config/compta-perso/data/compta.db}"

[ -f "$DB" ] || { echo "DB not found: $DB" >&2; exit 1; }

dump() { sqlite3 -json "$DB" "SELECT * FROM $1 ORDER BY id;" 2>/dev/null || echo "[]"; }

ACCOUNTS=$(dump accounts)
CATEGORIES=$(dump categories)
TRANSACTIONS=$(dump transactions)
SESSIONS=$(dump forecast_sessions)

# sqlite3 -json prints nothing for empty result sets
[ -z "$ACCOUNTS" ] && ACCOUNTS="[]"
[ -z "$CATEGORIES" ] && CATEGORIES="[]"
[ -z "$TRANSACTIONS" ] && TRANSACTIONS="[]"
[ -z "$SESSIONS" ] && SESSIONS="[]"

PAYLOAD=$(jq -n \
  --argjson accounts "$ACCOUNTS" \
  --argjson categories "$CATEGORIES" \
  --argjson transactions "$TRANSACTIONS" \
  --argjson forecast_sessions "$SESSIONS" \
  '{device: "pc-initial-load", data: {accounts: $accounts, categories: $categories, transactions: $transactions, forecast_sessions: $forecast_sessions}}')

echo "Pushing $(echo "$TRANSACTIONS" | jq length) transactions, $(echo "$ACCOUNTS" | jq length) accounts..."

curl -sS -X POST "$API_URL/api/push" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$PAYLOAD" | jq .
