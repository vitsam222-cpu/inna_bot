#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/inna_bot}"
BRANCH="${BRANCH:-main}"
PM2_NAME="${PM2_NAME:-max-bot}"

cd "$APP_DIR"

echo "[1/5] Fetch latest code..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "[2/5] Install dependencies (if changed)..."
npm install --no-audit --no-fund

echo "[3/5] Restart bot..."
if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_NAME"
else
  pm2 start src/index.js --name "$PM2_NAME"
fi

echo "[4/5] Save PM2 process list..."
pm2 save >/dev/null

echo "[5/5] Done. Last logs:"
pm2 logs "$PM2_NAME" --lines 30 --nostream
