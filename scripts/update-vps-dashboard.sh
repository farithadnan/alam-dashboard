#!/usr/bin/env bash
# Rebuild the dashboard on the VPS so the live site (app.oh-alam.my) serves the
# latest UI. Run THIS ON THE VPS box — the VPS Fastify serves ./dist straight from
# disk, so a rebuild updates the UI immediately (no API restart needed for the UI).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "-> pulling latest dashboard code"
git pull --ff-only

echo "-> building"
npm run build

echo ""
echo "Dashboard rebuilt. The served UI updates immediately (dist is read from disk)."
echo "Note: web-push only works while app.oh-alam.my is on the Worker (domain-flip.sh worker)."
