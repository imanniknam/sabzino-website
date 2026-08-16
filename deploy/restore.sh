#!/usr/bin/env bash
set -euo pipefail

archive="${1:-}"
if [[ -z "$archive" || ! -f "$archive" ]]; then
  echo "روش استفاده: sudo bash deploy/restore.sh backups/نام-فایل.tar.gz"
  exit 1
fi

cd "$(dirname "$0")/.."
docker compose down
if [[ -d data ]]; then
  mv data "data.before-restore-$(date +%Y%m%d-%H%M%S)"
fi
tar -xzf "$archive"
docker compose up -d
echo "بازیابی انجام شد."

