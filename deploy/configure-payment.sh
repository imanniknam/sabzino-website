#!/bin/sh
set -eu

APP_DIR=/opt/sabzino-offline/app
SITE_URL=${SABZINO_SITE_URL:-https://sabzinow.ir}

if [ ! -d "$APP_DIR" ]; then
  echo "Sabzino application directory was not found." >&2
  exit 1
fi

if [ -n "${SABZINO_MERCHANT_ID:-}" ]; then
  MERCHANT_ID=$SABZINO_MERCHANT_ID
else
  printf 'Zarinpal merchant ID: '
  IFS= read -r MERCHANT_ID
fi
MERCHANT_ID=$(printf '%s' "$MERCHANT_ID" | tr -d '\r\n')

case "$MERCHANT_ID" in
  ????????-????-????-????-????????????) ;;
  *) echo "Merchant ID must be a 36-character UUID." >&2; exit 1 ;;
esac

umask 077
TEMP_FILE=$(mktemp)
trap 'rm -f "$TEMP_FILE"' EXIT
printf 'ZARINPAL_MERCHANT_ID=%s\nPUBLIC_SITE_URL=%s\n' "$MERCHANT_ID" "$SITE_URL" > "$TEMP_FILE"
install -m 0600 "$TEMP_FILE" "$APP_DIR/.dev.vars"
# Wrangler resolves .dev.vars relative to the directory containing the custom
# config file when --config deploy/wrangler.vps.jsonc is used.
install -m 0600 "$TEMP_FILE" "$APP_DIR/deploy/.dev.vars"
if [ "${SABZINO_SKIP_RESTART:-0}" != "1" ]; then
  systemctl restart sabzino
fi
echo "Zarinpal payment configuration installed for $SITE_URL."
