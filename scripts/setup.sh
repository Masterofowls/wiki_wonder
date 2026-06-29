#!/usr/bin/env bash
# setup.sh — Idempotent workspace setup script
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

log()  { echo -e "\033[32m[setup]\033[0m $*"; }
warn() { echo -e "\033[33m[setup]\033[0m $*"; }
err()  { echo -e "\033[31m[setup]\033[0m $*" >&2; }

# ── Check required tools ────────────────────────────────────────
check_tool() {
  if ! command -v "$1" &>/dev/null; then
    err "Required tool not found: $1. Install it and re-run."
    exit 1
  fi
  log "Found $1 $(command "$1" --version 2>&1 | head -1)"
}

check_tool bun
check_tool node
check_tool git

# ── Verify Bun version ──────────────────────────────────────────
BUN_VERSION=$(bun --version)
REQUIRED_MAJOR=1
ACTUAL_MAJOR=$(echo "$BUN_VERSION" | cut -d. -f1)
if [ "$ACTUAL_MAJOR" -lt "$REQUIRED_MAJOR" ]; then
  err "Bun >= 1.1.0 required. Found: $BUN_VERSION"
  exit 1
fi

# ── Copy .env.example if no .env.local exists ───────────────────
cd "$ROOT_DIR"
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  warn ".env.local created from .env.example — edit it with your values."
else
  log ".env.local already exists — skipping."
fi

# ── Install dependencies ────────────────────────────────────────
log "Installing workspace dependencies..."
bun install

# ── Create session log directory ────────────────────────────────
mkdir -p ~/.session-logs
log "Session logs directory: ~/.session-logs"

log "✓ Setup complete. Run 'bun run dev:web' to start the Next.js app."
