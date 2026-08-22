#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/bootstrap-vm.sh" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl gnupg git openssl

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

. /etc/os-release
cat >/etc/apt/sources.list.d/docker.sources <<DOCKER_REPO
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: ${VERSION_CODENAME}
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
DOCKER_REPO

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

if ! swapon --show=NAME --noheadings | grep -q .; then
  if [[ ! -f /swapfile ]]; then
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  swapon /swapfile
  grep -q '^/swapfile ' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

cat >/etc/sysctl.d/99-mr-pandu-n8n.conf <<'SYSCTL'
vm.swappiness=20
SYSCTL
sysctl --system >/dev/null

mkdir -p /opt/mr-pandu-n8n

echo "Bootstrap complete."
docker --version
docker compose version
free -h
