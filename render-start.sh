#!/bin/sh
set -eu

if [ -n "${RENDER_EXTERNAL_HOSTNAME:-}" ]; then
  export N8N_HOST="${N8N_HOST:-$RENDER_EXTERNAL_HOSTNAME}"
  export WEBHOOK_URL="${WEBHOOK_URL:-https://${N8N_HOST}/}"
  export N8N_EDITOR_BASE_URL="${N8N_EDITOR_BASE_URL:-https://${N8N_HOST}/}"
fi

export N8N_PORT="${N8N_PORT:-5678}"
export N8N_PROTOCOL="${N8N_PROTOCOL:-https}"
export GENERIC_TIMEZONE="${GENERIC_TIMEZONE:-Asia/Dhaka}"
export TZ="${TZ:-Asia/Dhaka}"
export N8N_DIAGNOSTICS_ENABLED="false"
export N8N_PERSONALIZATION_ENABLED="false"
export EXECUTIONS_DATA_PRUNE="true"
export EXECUTIONS_DATA_MAX_AGE="${EXECUTIONS_DATA_MAX_AGE:-168}"

exec n8n start
