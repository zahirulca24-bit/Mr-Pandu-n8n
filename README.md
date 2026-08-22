# Mr. Pandu n8n — Google Cloud $0-Target Self-Hosted Deployment

Deployment repository for the **n8n Community Edition** automation layer used by Mr. Pandu.

This repository does **not** contain the Mr. Pandu Windows desktop application and must never contain Gmail, Google Drive, WhatsApp, Gemini, n8n, DuckDNS, or Google Cloud credentials.

## Locked $0-target architecture

GitHub source of truth → Antigravity on the authenticated desktop → Google Cloud Compute Engine → Docker Compose → Caddy HTTPS → n8n Community Edition.

Public addressing is **IPv6 only**. The VM must have **no external IPv4 address**.

- Compute Engine: `e2-micro`
- Free Tier eligible region: prefer `us-central1`; fallback `us-west1` or `us-east1`
- Disk: maximum `30 GB` `pd-standard`
- OS: Debian 12
- Swap: 2 GB
- VPC: custom dual-stack subnet so the VM keeps an internal IPv4 for IAP administration plus an external IPv6 for the service
- External IPv4: **none**
- External IPv6: static regional IPv6 if available/appropriate; otherwise approved external IPv6 allocation
- DNS: free DuckDNS AAAA record
- HTTPS: Caddy
- Public service ports: TCP 80/443 on IPv6 only
- n8n port `5678`: internal Docker network only
- Admin SSH: Google IAP; never open SSH to the public internet

Google Cloud currently does not charge for an external IPv6 address assigned to a VM. The target therefore avoids the recurring external IPv4 charge. The VM/disk must also remain within the applicable Free Tier allowances. See `COST_GUARDRAILS.md`.

## Important compatibility gate

This $0 plan is intentionally IPv6-only for public access. Before treating it as production-ready, verify that:

1. the office/desktop network used by Mr. Pandu can reach IPv6 sites;
2. the required third-party webhook provider can reach an IPv6-only hostname;
3. the VM can reach every required outbound API over IPv6.

If any required service is IPv4-only, **stop**. Do not add Cloud NAT, a paid external IPv4 address, or a load balancer automatically. A separate owner-approved compatibility plan is required.

## DuckDNS note

DuckDNS supports explicitly setting an IPv6 (`AAAA`) value through its update API. The deployment plan uses the VM's external IPv6 and updates DuckDNS **from the authenticated desktop**, not from the VM. This avoids depending on the VM reaching DuckDNS's update endpoint over IPv6.

## Files

- `docker-compose.yml` — n8n + Caddy
- `Caddyfile` — HTTPS reverse proxy
- `.env.example` — safe template; real `.env` is ignored
- `scripts/bootstrap-vm.sh` — Docker + 2 GB swap setup
- `scripts/init-env.sh` — create secure local n8n environment
- `scripts/deploy.sh` — deploy/update the pinned n8n stack
- `scripts/backup.sh` — back up persistent n8n data
- `scripts/healthcheck.sh` — verify the public HTTPS endpoint specifically over IPv6
- `scripts/check_zero_cost_plan.sh` — print the locked no-paid-network contract
- `scripts/validate_repo.py` — repository safety contract
- `ANTIGRAVITY_DEPLOY_PROMPT.md` — exact zero-cost deployment instructions
- `COST_GUARDRAILS.md` — $0 target / billing safety rules
- `SECURITY.md` — secrets and exposure rules
- `ZERO_COST_IPV6_PLAN.md` — networking and compatibility checklist

## Deployment sequence

1. Confirm the Google Cloud project and current billing/free-tier eligibility.
2. Confirm an unused DuckDNS subdomain owned by the user.
3. Antigravity inspects the project and proposes only the locked $0-target resources.
4. Create the custom dual-stack subnet and an `e2-micro` Debian 12 VM with **internal IPv4 + external IPv6, but no external IPv4**.
5. Use IAP for administration.
6. Transfer the exact repository checkout to `/opt/mr-pandu-n8n`.
7. Bootstrap Docker and 2 GB swap.
8. From the desktop, set the DuckDNS AAAA record to the VM's external IPv6.
9. Initialize `.env`, start n8n + Caddy, and verify HTTPS.
10. Only after network compatibility passes, connect Gmail/Drive and later an official WhatsApp Business/API provider.
11. Point Mr. Pandu's n8n base URL to the HTTPS DuckDNS hostname.

## Local validation

```bash
bash -n scripts/*.sh
python3 scripts/validate_repo.py
```

Do not commit `.env`, OAuth credentials, DuckDNS tokens, API tokens, private keys, backup archives, or n8n persistent data.
