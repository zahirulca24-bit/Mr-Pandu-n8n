#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "Missing .env" >&2
  exit 1
fi
HOST="$(grep '^N8N_HOST=' .env | cut -d= -f2-)"

if ! getent ahostsv6 "$HOST" >/dev/null 2>&1; then
  echo "IPv6 DNS check FAIL: no AAAA resolution for $HOST" >&2
  exit 1
fi

curl -6 --fail --silent --show-error --max-time 20 "https://${HOST}/healthz"
echo
echo "IPv6 HTTPS health check PASS: https://${HOST}/healthz"
