#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "Missing .env. Run: scripts/init-env.sh n8n.your-domain.com" >&2
  exit 1
fi

chmod 600 .env

HOST="$(grep '^N8N_HOST=' .env | cut -d= -f2-)"
KEY="$(grep '^N8N_ENCRYPTION_KEY=' .env | cut -d= -f2-)"

if [[ -z "$HOST" || "$HOST" == "n8n.example.com" ]]; then
  echo "N8N_HOST is not configured." >&2
  exit 1
fi
if [[ ! "$KEY" =~ ^[A-Fa-f0-9]{64}$ ]]; then
  echo "N8N_ENCRYPTION_KEY must be a generated 64-character hex key." >&2
  exit 1
fi

docker compose config >/dev/null
docker compose pull
docker compose up -d

echo
Docker_PS="$(docker compose ps)"
printf '%s\n' "$Docker_PS"
echo
echo "Deployment started for https://${HOST}"
echo "After DNS resolves, run: scripts/healthcheck.sh"
