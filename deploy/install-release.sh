#!/bin/sh
set -eu

APP_DIR=/opt/sabzino-offline/app
DATA_DIR=/opt/sabzino-offline/data
RELEASE_DIR=/opt/sabzino-offline/releases/current-upload
BACKUP_DIR=/opt/sabzino-offline/backups
ARCHIVE=/tmp/sabzino-complete-release.tar.gz
STAMP=$(date +%Y%m%d-%H%M%S)

if [ ! -d "$APP_DIR/node_modules" ] || [ ! -f "$ARCHIVE" ]; then
  echo "Application runtime or release archive is missing." >&2
  exit 1
fi

mkdir -p /opt/sabzino-offline/releases "$BACKUP_DIR" "$DATA_DIR"
rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR"
tar -xzf "$ARCHIVE" -C "$RELEASE_DIR"

if [ ! -f "$RELEASE_DIR/dist/server/index.js" ] || [ ! -f "$RELEASE_DIR/deploy/wrangler.vps.jsonc" ]; then
  echo "Release archive is incomplete." >&2
  exit 1
fi

systemctl stop sabzino

if [ -d "$APP_DIR/dist" ]; then
  mv "$APP_DIR/dist" "$BACKUP_DIR/dist-$STAMP"
fi

mv "$RELEASE_DIR/dist" "$APP_DIR/dist"

# Keep hashed assets from the previous release so already-open pages can finish
# hydrating after a deployment instead of losing their JavaScript modules.
if [ -d "$BACKUP_DIR/dist-$STAMP/client/_next/static" ]; then
  cp -an "$BACKUP_DIR/dist-$STAMP/client/_next/static/." "$APP_DIR/dist/client/_next/static/"
fi

cp -a "$RELEASE_DIR/drizzle/." "$APP_DIR/drizzle/"
cp "$RELEASE_DIR/deploy/wrangler.vps.jsonc" "$APP_DIR/deploy/wrangler.vps.jsonc"

if command -v caddy >/dev/null 2>&1 && [ -f "$RELEASE_DIR/deploy/Caddyfile.vps" ]; then
  cp "$RELEASE_DIR/deploy/Caddyfile.vps" /etc/caddy/Caddyfile
  caddy validate --config /etc/caddy/Caddyfile
fi

cd "$APP_DIR"
/opt/sabzino-offline/runtime/node/bin/node node_modules/wrangler/bin/wrangler.js d1 migrations apply DB \
  --local \
  --persist-to "$DATA_DIR" \
  --config deploy/wrangler.vps.jsonc

systemctl start sabzino

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

if command -v caddy >/dev/null 2>&1; then
  systemctl reload caddy
fi

rm -rf "$RELEASE_DIR"
rm -f "$ARCHIVE"
echo "Release installed successfully. Backup: $BACKUP_DIR/dist-$STAMP"
