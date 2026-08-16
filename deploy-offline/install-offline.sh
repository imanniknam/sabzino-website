#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "اجرا با دسترسی root لازم است."
  exit 1
fi

base="/opt/sabzino-offline"
runtime="$base/runtime/node"
app="$base/app"
data="$base/data"

mkdir -p "$base" "$data"

# نسخه نیمه‌کاره Docker قبلی را متوقف می‌کند تا پورت ۸۰ آزاد باشد.
if command -v docker >/dev/null 2>&1 && [[ -f /opt/sabzino/compose.yaml ]]; then
  (cd /opt/sabzino && docker compose down) || true
fi

if [[ ! -x "$runtime/bin/node" ]]; then
  mkdir -p "$runtime"
  tar -xJf vendor/node-linux-x64.tar.xz --strip-components=1 -C "$runtime"
fi

rm -rf "$app"
mkdir -p "$app"
cp -a app-bundle/. "$app/"

mkdir -p "$app/node_modules/@cloudflare/workerd-linux-64" "$app/node_modules/@esbuild/linux-x64"
tar -xzf vendor/workerd-linux-x64.tgz --strip-components=1 -C "$app/node_modules/@cloudflare/workerd-linux-64"
tar -xzf vendor/esbuild-linux-x64.tgz --strip-components=1 -C "$app/node_modules/@esbuild/linux-x64"
chmod +x "$app/node_modules/@cloudflare/workerd-linux-64/bin/workerd" "$app/node_modules/@esbuild/linux-x64/bin/esbuild"

cat > /etc/systemd/system/sabzino.service <<'UNIT'
[Unit]
Description=Sabzino ecommerce application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/sabzino-offline/app
Environment=NODE_ENV=production
Environment=COOKIE_SECURE=false
Environment=WRANGLER_SEND_METRICS=false
ExecStartPre=/opt/sabzino-offline/runtime/node/bin/node node_modules/wrangler/bin/wrangler.js d1 migrations apply DB --local --persist-to /opt/sabzino-offline/data --config deploy/wrangler.vps.jsonc
ExecStart=/opt/sabzino-offline/runtime/node/bin/node node_modules/wrangler/bin/wrangler.js dev --local --persist-to /opt/sabzino-offline/data --ip 0.0.0.0 --port 80 --show-interactive-dev-session=false --log-level warn --config deploy/wrangler.vps.jsonc
Restart=always
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now sabzino

echo "در انتظار آماده‌شدن سبزینو..."
for _ in {1..60}; do
  if curl -fsS http://127.0.0.1/api/products >/dev/null; then
    break
  fi
  sleep 2
done

if ! curl -fsS http://127.0.0.1/api/products >/dev/null; then
  journalctl -u sabzino --no-pager -n 100
  exit 1
fi

read -rp "نام کاربری مدیر اولیه: " admin_username
read -rsp "رمز مدیر (حداقل ۱۰ نویسه، شامل حرف و عدد): " admin_password
echo

setup_status="$(curl -sS -o /tmp/sabzino-admin-setup.json -w '%{http_code}' \
  -H 'Host: localhost' \
  -H 'Content-Type: application/json' \
  --data "$(ADMIN_USERNAME="$admin_username" ADMIN_PASSWORD="$admin_password" "$runtime/bin/node" -e 'process.stdout.write(JSON.stringify({mode:"setup",username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD}))')" \
  http://127.0.0.1/api/admin/auth)"

if [[ "$setup_status" == "200" ]]; then
  echo "حساب مدیر ساخته شد."
elif [[ "$setup_status" == "409" ]]; then
  echo "حساب مدیر قبلاً ساخته شده و تغییر نکرد."
else
  cat /tmp/sabzino-admin-setup.json
  echo
  exit 1
fi

rm -f /tmp/sabzino-admin-setup.json
echo "سبزینو بدون هیچ دانلود اینترنتی نصب شد: http://$(hostname -I | awk '{print $1}')"
