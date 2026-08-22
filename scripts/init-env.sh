#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

HOST="${1:-}"
if [[ -z "$HOST" ]]; then
  echo "Usage: scripts/init-env.sh n8n.example.com" >&2
  exit 1
fi

if [[ ! "$HOST" =~ ^[A-Za-z0-9.-]+$ ]] || [[ "$HOST" != *.* ]]; then
  echo "Invalid DNS hostname: $HOST" >&2
  exit 1
fi

if [[ -f .env ]]; then
  echo ".env already exists; refusing to overwrite." >&2
  exit 1
fi

KEY="$(openssl rand -hex 32)"
cp .env.example .env
sed -i "s/^N8N_HOST=.*/N8N_HOST=${HOST}/" .env
sed -i "s/^N8N_ENCRYPTION_KEY=.*/N8N_ENCRYPTION_KEY=${KEY}/" .env
chmod 600 .env

echo "Created .env with a generated encryption key."
echo "Back up the N8N_ENCRYPTION_KEY securely outside this VM."
