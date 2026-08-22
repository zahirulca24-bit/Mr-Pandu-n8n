# Security Rules

1. Never commit `.env`, OAuth client secrets, API tokens, DuckDNS tokens, private keys, service-account keys, n8n credentials, or backup archives.
2. n8n port `5678` must remain internal to Docker; only Caddy exposes 80/443.
3. Under the $0 plan, the VM must have **no external IPv4 address**.
4. Public ingress is IPv6 TCP 80/443 only.
5. Use HTTPS before connecting Mr. Pandu or external webhooks.
6. Use a strong persistent `N8N_ENCRYPTION_KEY`; losing/changing it can make stored credentials unreadable.
7. Use Google Cloud IAP for SSH through the VM's internal IPv4. Do not expose SSH port 22 to `0.0.0.0/0` or `::/0`.
8. Keep Docker and the pinned n8n release updated after testing.
9. Store Gmail/Drive/WhatsApp credentials inside n8n's credential system, not in this Git repository.
10. Backups may contain sensitive workflow data; restrict permissions and copy them to a separate secure location.
11. Do not enable unofficial personal-WhatsApp automation. Use an official WhatsApp Business/API provider.
12. If a required integration cannot work over IPv6, stop and request an architecture decision; never create a paid fallback silently.
