#!/usr/bin/env bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "این فایل را با sudo اجرا کنید: sudo bash deploy/deploy.sh"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  apt-get update
  apt-get install -y docker.io docker-compose-v2 curl
  systemctl enable --now docker
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose روی سرور در دسترس نیست. بسته docker-compose-v2 را نصب کنید."
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.vps.example .env
fi

mkdir -p data backups
chmod 700 data backups

docker compose up -d --build

echo "در انتظار آماده‌شدن سبزینو..."
for _ in {1..60}; do
  if curl -fsS http://127.0.0.1/api/products >/dev/null; then
    break
  fi
  sleep 2
done

if ! curl -fsS http://127.0.0.1/api/products >/dev/null; then
  docker compose logs --tail=100 app
  echo "راه‌اندازی کامل نشد؛ گزارش بالا را بررسی کنید."
  exit 1
fi

read -rp "نام کاربری مدیر اولیه: " admin_username
read -rsp "رمز مدیر (حداقل ۱۰ نویسه، شامل حرف و عدد): " admin_password
echo

setup_result="$(curl -sS -o /tmp/sabzino-admin-setup.json -w '%{http_code}' \
  -H 'Host: localhost:3000' \
  -H 'Content-Type: application/json' \
  --data "$(ADMIN_USERNAME="$admin_username" ADMIN_PASSWORD="$admin_password" node -e 'process.stdout.write(JSON.stringify({mode:"setup",username:process.env.ADMIN_USERNAME,password:process.env.ADMIN_PASSWORD}))')" \
  http://127.0.0.1/api/admin/auth)"

if [[ "$setup_result" == "200" ]]; then
  echo "حساب مدیر ساخته شد."
elif [[ "$setup_result" == "409" ]]; then
  echo "حساب مدیر قبلاً ساخته شده است؛ اطلاعات آن تغییر نکرد."
else
  echo "ساخت حساب مدیر ناموفق بود:"
  cat /tmp/sabzino-admin-setup.json
  echo
  exit 1
fi
rm -f /tmp/sabzino-admin-setup.json

echo "سبزینو آماده است: http://$(hostname -I | awk '{print $1}')"
echo "پنل مدیریت: /admin"
