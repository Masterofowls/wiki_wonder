#!/usr/bin/env bash
# check-env.sh — Validate required environment variables are set
# Usage: source this file or run directly before starting the app
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${1:-.env.local}"

log()  { echo -e "\033[32m[env-check]\033[0m $*"; }
warn() { echo -e "\033[33m[env-check]\033[0m $*"; }
err()  { echo -e "\033[31m[env-check]\033[0m $*" >&2; }

ENV_PATH="$ROOT_DIR/$ENV_FILE"

if [ ! -f "$ENV_PATH" ]; then
  err "Env file not found: $ENV_PATH"
  err "Run: cp .env.example .env.local"
  exit 1
fi

log "Checking $ENV_FILE..."

REQUIRED_VARS=(
  "NODE_ENV"
  "APP_URL"
)

MISSING=()
REDACTED_VARS=("JWT_SECRET" "REFRESH_TOKEN_SECRET" "DATABASE_URL" "SMTP_PASS" "S3_SECRET_KEY")

# Load the env file
set -a
# shellcheck disable=SC1090
source "$ENV_PATH"
set +a

for VAR in "${REQUIRED_VARS[@]}"; do
  VAL="${!VAR:-}"
  if [ -z "$VAL" ]; then
    MISSING+=("$VAR")
  else
    IS_SECRET=false
    for SECRET in "${REDACTED_VARS[@]}"; do
      if [ "$VAR" = "$SECRET" ]; then
        IS_SECRET=true
        break
      fi
    done
    if [ "$IS_SECRET" = true ]; then
      log "  ✓ $VAR = [REDACTED]"
    else
      log "  ✓ $VAR = $VAL"
    fi
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  err "Missing required environment variables:"
  for VAR in "${MISSING[@]}"; do
    err "  ✗ $VAR"
  done
  exit 1
fi

log "✓ All required environment variables are set."
