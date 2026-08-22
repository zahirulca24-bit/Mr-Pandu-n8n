#!/usr/bin/env bash
set -euo pipefail

cat <<'PLAN'
Mr. Pandu n8n locked network contract:
- VM: one e2-micro
- Disk: <=30 GB pd-standard
- Region: us-central1/us-west1/us-east1
- External IPv4: NONE
- External IPv6: REQUIRED
- Cloud NAT/NAT64: FORBIDDEN without owner approval
- Load balancer: FORBIDDEN without owner approval
- Public SSH: FORBIDDEN
- Public inbound: IPv6 TCP 80/443 only
PLAN
