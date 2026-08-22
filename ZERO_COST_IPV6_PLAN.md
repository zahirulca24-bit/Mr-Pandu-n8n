# Zero-Cost IPv6 Plan

## Purpose

Run Mr. Pandu's n8n Community Edition backend on Google Cloud with a `$0/month target` by avoiding the recurring external IPv4 charge.

## Network shape

- Custom VPC
- Custom subnet in a Free Tier eligible US region
- Subnet stack: `IPV4_IPV6`
- IPv6 access type: `EXTERNAL`
- VM stack: `IPV4_IPV6`
- Internal IPv4: yes, for Google IAP administration
- External IPv4: **none**
- External IPv6: yes
- Inbound IPv6 firewall: TCP 80/443 only
- SSH: IAP only using internal IPv4; no public SSH rule

## Why dual-stack instead of IPv6-only VM

The VM keeps an internal IPv4 address so Google IAP administration can remain simple while the public service avoids a paid external IPv4 address. Public traffic still uses only IPv6.

## DNS

Use a free DuckDNS subdomain. Set the DuckDNS AAAA record to the VM's external IPv6 from the authenticated desktop.

Do not store the DuckDNS token in GitHub or on a shared command transcript.

## HTTPS

Caddy listens on IPv6 TCP 80/443 and obtains a public certificate for the DuckDNS hostname. n8n remains behind Caddy on the private Docker network.

## Mandatory live compatibility tests

Before connecting real office workflows:

1. From the office PC, confirm the DuckDNS hostname resolves to AAAA.
2. From the office PC, open `https://<duckdns-host>/healthz`.
3. Confirm Mr. Pandu can reach the same HTTPS URL.
4. Confirm n8n can reach Gmail/Google Drive APIs.
5. For WhatsApp, verify the selected official provider can deliver a webhook to an IPv6-only hostname.

If test 2, 3, or 5 fails because the client/provider is IPv4-only, stop the rollout and report `IPv6 compatibility FAIL`.

## No automatic paid fallback

Do not add an external IPv4, Cloud NAT, load balancer, or other paid networking component to make a failed IPv6 test pass unless the owner explicitly approves a new paid architecture.
