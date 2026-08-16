#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p backups
archive="backups/sabzino-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$archive" data
find backups -type f -name 'sabzino-*.tar.gz' -mtime +14 -delete
echo "$archive"

