#!/bin/sh
set -eu

APP_DIR=/opt/sabzino-offline/app

for backup_dir in /opt/sabzino-offline/backups/dist-*; do
  if [ -d "$backup_dir/client/_next/static" ]; then
    cp -an "$backup_dir/client/_next/static/." "$APP_DIR/dist/client/_next/static/"
  fi
done

systemctl restart sabzino

attempt=0
until curl -fsS --max-time 5 http://127.0.0.1:3000/api/products >/dev/null; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 20 ]; then
    exit 1
  fi
  sleep 1
done

find "$APP_DIR/dist/client/_next/static/chunks" -maxdepth 1 -type f \
  \( -name 'page-B4bW30lu.js' -o -name 'index-DqWF_4k-.js' \) \
  -printf '%f %s\n'
