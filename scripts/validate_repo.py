from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
required = [
    "README.md", "docker-compose.yml", "Caddyfile", ".env.example",
    ".gitignore", "COST_GUARDRAILS.md", "SECURITY.md",
    "ZERO_COST_IPV6_PLAN.md", "ANTIGRAVITY_DEPLOY_PROMPT.md",
    "scripts/bootstrap-vm.sh", "scripts/init-env.sh", "scripts/deploy.sh",
    "scripts/backup.sh", "scripts/healthcheck.sh", "scripts/check_zero_cost_plan.sh",
]
missing = [name for name in required if not (root / name).exists()]
if missing:
    raise SystemExit(f"Missing required files: {missing}")

compose = (root / "docker-compose.yml").read_text(encoding="utf-8")
for marker in [
    "n8nio/n8n", "N8N_ENCRYPTION_KEY", "WEBHOOK_URL",
    "N8N_EDITOR_BASE_URL", "caddy", "n8n_data", "no-new-privileges:true",
]:
    if marker not in compose:
        raise SystemExit(f"Missing compose marker: {marker}")

if re.search(r'(^|\s)5678:5678($|\s)', compose):
    raise SystemExit("n8n port 5678 must not be published to the host")

prompt = (root / "ANTIGRAVITY_DEPLOY_PROMPT.md").read_text(encoding="utf-8")
for marker in [
    "NO external IPv4", "no-address", "IPV4_IPV6", "ipv6-access-type=EXTERNAL",
    "Cloud NAT/NAT64", "DuckDNS", "$0/month target",
]:
    if marker not in prompt:
        raise SystemExit(f"Missing zero-cost deployment marker: {marker}")

cost = (root / "COST_GUARDRAILS.md").read_text(encoding="utf-8")
for marker in ["no external IPv4 address", "external IPv6", "Cloud NAT / NAT64"]:
    if marker not in cost:
        raise SystemExit(f"Missing cost guardrail marker: {marker}")

secret_markers = ["AI" + "za", "sk-" + "proj-", "gh" + "p_", "xo" + "xb-", "BEGIN " + "PRIVATE KEY"]
for forbidden in secret_markers:
    for path in root.rglob("*"):
        if path.is_file() and ".git" not in path.parts and path.name != "validate_repo.py":
            text = path.read_text(encoding="utf-8", errors="ignore")
            if forbidden in text:
                raise SystemExit(f"Possible secret marker {forbidden!r} in {path.relative_to(root)}")

example = (root / ".env.example").read_text(encoding="utf-8")
if "REPLACE_WITH_RANDOM_64_HEX_CHAR_KEY" not in example:
    raise SystemExit(".env.example must contain a placeholder, never a real encryption key")

for forbidden_name in ["duckdns-token.txt", "service-account.json"]:
    if (root / forbidden_name).exists():
        raise SystemExit(f"Forbidden secret file present: {forbidden_name}")

print("Mr-Pandu-n8n $0 IPv6 repository contract: PASS")
