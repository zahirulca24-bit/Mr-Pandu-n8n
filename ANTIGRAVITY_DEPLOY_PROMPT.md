# Antigravity Deployment Prompt — Mr. Pandu n8n — $0 IPv6 Target

Use this prompt from the desktop where Google Cloud CLI and GitHub access are already authenticated.

---

Act as a careful Google Cloud + Docker deployment engineer.

## Objective
Deploy the private GitHub repository `zahirulca24-bit/Mr-Pandu-n8n` as the self-hosted **n8n Community Edition** automation backend for Mr. Pandu, using a strict `$0/month target` within Google Cloud Free Tier.

The Mr. Pandu Windows desktop application is NOT being deployed to Google Cloud.

## Safety rules — mandatory

1. First inspect the currently selected Google Cloud account, Project ID, billing/free-tier status, existing VPCs/subnets, VMs, disks, external IPs, firewall rules, and quotas.
2. Do NOT delete, stop, resize, replace, or modify any unrelated existing Google Cloud resource.
3. Do NOT create Cloud SQL, load balancers, Cloud NAT/NAT64, Cloud Router for NAT, GKE, GPUs, balanced/SSD disks, paid DNS, or additional paid services.
4. Keep the target inside Compute Engine Free Tier where currently eligible:
   - one `e2-micro`
   - prefer `us-central1`; fallback only to `us-west1` or `us-east1`
   - Debian 12
   - maximum `30 GB` `pd-standard`
5. Networking is locked:
   - custom VPC + custom `IPV4_IPV6` subnet
   - subnet IPv6 access type `EXTERNAL`
   - VM has internal IPv4 for IAP administration
   - VM has external IPv6 for public n8n HTTPS
   - **NO external IPv4 address**
6. Before creating anything, print the exact Project ID, zone, machine type, disk type/size, network/subnet plan, `External IPv4: NONE`, external IPv6 plan, and expected recurring cost target.
7. Check current Google Cloud pricing before create. If this exact configuration no longer fits the $0 target, STOP and report the reason.
8. Stop and request confirmation if the selected project, DuckDNS hostname, or resource plan is ambiguous or outside these guardrails.
9. Never print, commit, upload, or log secrets. Never store a service-account JSON key or DuckDNS token in GitHub.

## Network/security target

- Public inbound: IPv6 TCP 80 and 443 only for Caddy/n8n.
- Do not expose container port 5678 to the public internet.
- No public SSH firewall rule.
- Use Google Cloud IAP for SSH through the VM's internal IPv4.
- Do not add `0.0.0.0/0` or `::/0` access to TCP 22.
- Use a confirmed free DuckDNS hostname such as `<owner-name>.duckdns.org`.
- Caddy terminates HTTPS and reverse-proxies internally to n8n.

## Deployment procedure

1. Confirm/choose the approved Google Cloud project. Enable only the Compute Engine API if needed.
2. Create a new custom VPC dedicated to this deployment unless an existing owner-approved VPC is explicitly selected. Do not alter unrelated networks.
3. Create a custom subnet in the approved Free Tier region with:
   - primary private IPv4 range, e.g. `10.77.0.0/24`
   - `--stack-type=IPV4_IPV6`
   - `--ipv6-access-type=EXTERNAL`
4. Create one `e2-micro` Debian 12 VM with <=30 GB `pd-standard` and a network interface configured as dual-stack with external IPv6 but **no external IPv4**. Use the gcloud network-interface form that explicitly sets `no-address` for IPv4 while enabling `IPV4_IPV6` and Premium-tier IPv6.
5. Create only the IPv6 firewall rule required for TCP 80 and 443. Do not create a public SSH rule.
6. Confirm IAP SSH works using the VM's internal IPv4. If IAP cannot administer the VM without adding a paid/public IPv4, STOP.
7. Use the repository as the source of truth. From the authenticated desktop, transfer the exact checkout to `/opt/mr-pandu-n8n` using IAP-backed `gcloud compute scp`. Do not copy `.git` secrets or any local `.env`.
8. Run `sudo bash scripts/bootstrap-vm.sh` on the VM. Confirm Docker, Docker Compose, and 2 GB swap are active.
9. Confirm the VM has outbound IPv6 connectivity required to pull packages/images and reach the needed APIs. If a required destination is IPv4-only, STOP. Do not create Cloud NAT or an external IPv4 workaround.
10. Obtain/confirm the VM's external IPv6. Prefer a stable regional external IPv6 allocation where supported and still free; otherwise record the assigned external IPv6 and treat VM recreation as requiring a DNS update.
11. Confirm the owner's DuckDNS subdomain. From the authenticated desktop, update the DuckDNS AAAA value to the VM's external IPv6 using DuckDNS's official update API. Do not save or print the DuckDNS token in Git/logs.
12. Verify the DuckDNS hostname returns the expected AAAA value before starting Caddy.
13. On the VM run `scripts/init-env.sh <confirmed-duckdns-hostname>`. Keep `.env` mode 600. The generated `N8N_ENCRYPTION_KEY` must be backed up securely outside GitHub.
14. Run `scripts/deploy.sh`.
15. Verify `docker compose ps`, Caddy logs, n8n logs, and `scripts/healthcheck.sh`.
16. From the owner's office/desktop network, verify the HTTPS endpoint is reachable over IPv6. This is a mandatory compatibility gate.
17. Confirm the n8n setup page loads via HTTPS. Do not create fake credentials or fake test data.
18. Record only non-secret deployment facts: Project ID, VM name, zone, network/subnet, external IPv6, DuckDNS hostname, n8n version, Docker versions, and health result.

## Mandatory compatibility gate before office workflows

Return PASS/FAIL for each:

- office/desktop network can reach the IPv6-only HTTPS hostname
- Mr. Pandu can reach the IPv6-only HTTPS hostname
- n8n can reach Gmail/Google Drive APIs
- selected official WhatsApp provider can deliver a webhook to the IPv6-only hostname

If any required item fails because IPv4 is required, STOP and report exactly that. Do not add paid networking.

## Post-deploy handoff

After the zero-cost network and n8n are healthy:
- create the n8n owner account interactively,
- connect Gmail and Google Drive through n8n's official credential/OAuth flow,
- later connect an official WhatsApp Business/API provider only,
- do not use unofficial personal-WhatsApp automation,
- update Mr. Pandu's n8n Base URL to the new HTTPS DuckDNS hostname,
- run the V5 office live tests one at a time.

## Required final report

Return PASS/FAIL for:
- Free Tier VM shape/disk guardrail
- external IPv4 absent
- external IPv6 present
- no Cloud NAT/load balancer/Cloud SQL
- IAP administration
- Docker install
- 2 GB swap
- n8n container
- Caddy container
- DuckDNS AAAA record
- HTTPS certificate
- `/healthz`
- persistent `n8n_data` volume
- port 5678 not public
- secrets absent from Git
- office IPv6 reachability
- required provider IPv6 compatibility
- expected recurring infrastructure cost target `$0 within current Free Tier allowances`

If any check fails, stop and report the exact failure. Do not weaken security or create paid resources to work around it.
