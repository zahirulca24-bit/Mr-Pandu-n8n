#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p backups
chmod 700 backups
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
ARCHIVE="$ROOT_DIR/backups/n8n-data-${STAMP}.tar.gz"

# Keep n8n stopped only for the short volume archive window so SQLite is consistent.
docker compose stop n8n
trap 'docker compose start n8n >/dev/null 2>&1 || true' EXIT

docker run --rm \
  -v "${COMPOSE_PROJECT_NAME:-mr-pandu-n8n}_n8n_data:/data:ro" \
  -v "$ROOT_DIR/backups:/backup" \
  alpine:3.22 \
  sh -c "tar -czf /backup/$(basename "$ARCHIVE") -C /data ."

docker compose start n8n
trap - EXIT
chmod 600 "$ARCHIVE"

find backups -type f -name 'n8n-data-*.tar.gz' -mtime +14 -delete

echo "Backup created: $ARCHIVE"
echo "Store a copy off-VM and keep the N8N_ENCRYPTION_KEY separately and securely."
