#!/bin/bash
set -euo pipefail

echo "[start] WikiWonder Fly — starting Strapi + Next.js + nginx"

export HOST="${HOST:-0.0.0.0}"
export NODE_ENV="${NODE_ENV:-production}"

cd /app/apps/cms
npm run start &
STRAPI_PID=$!

echo "[start] waiting for Strapi on :1337..."
for i in $(seq 1 90); do
  if curl -sf "http://127.0.0.1:1337/api/health" >/dev/null 2>&1; then
    echo "[start] Strapi is ready"
    break
  fi
  if ! kill -0 "$STRAPI_PID" 2>/dev/null; then
    echo "[start] Strapi process exited unexpectedly"
    exit 1
  fi
  sleep 2
done

cd /app
export HOSTNAME="127.0.0.1"
export PORT="${WEB_PORT:-3000}"
node apps/web/server.js &
NEXT_PID=$!

echo "[start] waiting for Next.js on :${PORT}..."
for i in $(seq 1 60); do
  if curl -sf "http://127.0.0.1:${PORT}/api/health" >/dev/null 2>&1; then
    echo "[start] Next.js is ready"
    break
  fi
  if ! kill -0 "$NEXT_PID" 2>/dev/null; then
    echo "[start] Next.js process exited unexpectedly"
    exit 1
  fi
  sleep 2
done

shutdown() {
  echo "[start] shutting down..."
  kill "$STRAPI_PID" "$NEXT_PID" 2>/dev/null || true
  wait "$STRAPI_PID" "$NEXT_PID" 2>/dev/null || true
  exit 0
}

trap shutdown SIGTERM SIGINT

echo "[start] nginx listening on :8080"
exec nginx -g "daemon off;"
