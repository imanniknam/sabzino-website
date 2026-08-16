#!/bin/sh
set -eu

if [ ! -f /tmp/sabzino.service ] || [ ! -f /tmp/Caddyfile.sabzino ]; then
  echo "Required configuration files are missing." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y caddy

install -m 0644 /tmp/sabzino.service /etc/systemd/system/sabzino.service
install -m 0644 /tmp/Caddyfile.sabzino /etc/caddy/Caddyfile

systemctl daemon-reload
systemctl restart sabzino

attempt=0
until curl -fsS --max-time 5 http://127.0.0.1:3000/api/products >/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 20 ]; then
    systemctl status sabzino --no-pager >&2 || true
    journalctl -u sabzino -n 80 --no-pager >&2 || true
    exit 1
  fi
  sleep 1
done

caddy validate --config /etc/caddy/Caddyfile
systemctl enable caddy
systemctl restart caddy

echo "HTTPS proxy configured."
