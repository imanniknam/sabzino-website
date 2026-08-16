#!/bin/sh
set -eu

mkdir -p /data

npx wrangler d1 migrations apply DB \
  --local \
  --persist-to /data \
  --config deploy/wrangler.vps.jsonc

exec npx wrangler dev \
  --local \
  --persist-to /data \
  --ip 0.0.0.0 \
  --port 3000 \
  --show-interactive-dev-session=false \
  --log-level warn \
  --config deploy/wrangler.vps.jsonc

