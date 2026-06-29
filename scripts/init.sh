#!/usr/bin/env bash
# init.sh — Interactive project initialiser for the fullstack template
#
# Usage:
#   ./scripts/init.sh                   Interactive mode (prompts for all values)
#   ./scripts/init.sh --config          Read values from template.config.json (non-interactive)
#   ./scripts/init.sh --dry-run         Print substitutions without applying them
#
# What this script does:
#   1. Asks for (or reads from template.config.json): project name, display name,
#      description, author, package scope, ports, which features to include.
#   2. Replaces all template placeholders across the codebase.
#   3. Optionally removes unused app directories (apps/web or apps/spa).
#   4. Removes the template metadata files (template.config.json, template.schema.json).
#   5. Re-initialises the git repository with a fresh history.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "$ROOT"

# ── Colour helpers ─────────────────────────────────────────────────────────────
BOLD="\033[1m"; RESET="\033[0m"; GREEN="\033[32m"; YELLOW="\033[33m"; RED="\033[31m"; CYAN="\033[36m"
log()   { echo -e "${GREEN}✓${RESET} $*"; }
info()  { echo -e "${CYAN}→${RESET} $*"; }
warn()  { echo -e "${YELLOW}⚠${RESET} $*"; }
err()   { echo -e "${RED}✗${RESET} $*" >&2; }
prompt(){ echo -e "${BOLD}? $1${RESET}"; }
hr()    { echo -e "${BOLD}$(printf '─%.0s' {1..60})${RESET}"; }

DRY_RUN=false
USE_CONFIG=false
for arg in "$@"; do
  case "$arg" in
    --dry-run)   DRY_RUN=true ;;
    --config)    USE_CONFIG=true ;;
    --help|-h)
      echo "Usage: $0 [--config] [--dry-run]"
      echo "  --config    Read values from template.config.json (non-interactive)"
      echo "  --dry-run   Show what would be replaced without touching files"
      exit 0 ;;
  esac
done

# ── Read template.config.json (optional helper) ────────────────────────────────
read_config() {
  local key="$1" default="${2:-}"
  if command -v bun &>/dev/null && [ -f "$ROOT/template.config.json" ]; then
    local val
    val=$(bun -e "
      const c = require('./template.config.json');
      const keys = '$key'.split('.');
      let v = c;
      for (const k of keys) { v = v?.[k]; }
      if (v !== undefined && v !== null) process.stdout.write(String(v));
    " 2>/dev/null || true)
    echo "${val:-$default}"
  else
    echo "$default"
  fi
}

# ── Collect values ─────────────────────────────────────────────────────────────
hr
echo -e "${BOLD}  Fullstack Template — Project Initialiser${RESET}"
hr
echo ""

if [ "$USE_CONFIG" = true ]; then
  PROJECT_NAME=$(read_config "project.name" "my-app")
  DISPLAY_NAME=$(read_config "project.displayName" "My App")
  DESCRIPTION=$(read_config "project.description" "A production-grade TypeScript React fullstack application")
  AUTHOR=$(read_config "project.author" "")
  SCOPE=$(read_config "packages.scope" "myapp")
  WEB_PORT=$(read_config "ports.web" "9000")
  SPA_PORT=$(read_config "ports.spa" "9001")
  INCLUDE_WEB=$(read_config "features.nextjs" "true")
  INCLUDE_SPA=$(read_config "features.vite" "true")
  INCLUDE_DOCKER=$(read_config "features.docker" "true")
  INCLUDE_PLAYWRIGHT=$(read_config "features.playwright" "true")
  info "Reading config from template.config.json"
else
  prompt "Project name (kebab-case, e.g. my-app) [my-app]:"
  read -r PROJECT_NAME; PROJECT_NAME="${PROJECT_NAME:-my-app}"
  # Sanitise
  PROJECT_NAME=$(echo "$PROJECT_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')

  prompt "Display name (e.g. My App) [My App]:"
  read -r DISPLAY_NAME; DISPLAY_NAME="${DISPLAY_NAME:-My App}"

  prompt "Short description [A production-grade TypeScript React fullstack application]:"
  read -r DESCRIPTION; DESCRIPTION="${DESCRIPTION:-A production-grade TypeScript React fullstack application}"

  prompt "Author name []:"
  read -r AUTHOR; AUTHOR="${AUTHOR:-}"

  prompt "Package scope (without @, e.g. myapp → @myapp/ui) [${PROJECT_NAME}]:"
  read -r SCOPE; SCOPE="${SCOPE:-${PROJECT_NAME}}"
  SCOPE=$(echo "$SCOPE" | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-')

  prompt "Port for Next.js web app [9000]:"
  read -r WEB_PORT; WEB_PORT="${WEB_PORT:-9000}"

  prompt "Port for Vite SPA [9001]:"
  read -r SPA_PORT; SPA_PORT="${SPA_PORT:-9001}"

  prompt "Include Next.js app (apps/web)? [Y/n]:"
  read -r yn; INCLUDE_WEB=$([[ "${yn:-y}" =~ ^[Nn]$ ]] && echo "false" || echo "true")

  prompt "Include Vite SPA (apps/spa)? [Y/n]:"
  read -r yn; INCLUDE_SPA=$([[ "${yn:-y}" =~ ^[Nn]$ ]] && echo "false" || echo "true")

  prompt "Include Docker infra (infra/docker/)? [Y/n]:"
  read -r yn; INCLUDE_DOCKER=$([[ "${yn:-y}" =~ ^[Nn]$ ]] && echo "false" || echo "true")

  prompt "Include Playwright E2E tests? [Y/n]:"
  read -r yn; INCLUDE_PLAYWRIGHT=$([[ "${yn:-y}" =~ ^[Nn]$ ]] && echo "false" || echo "true")
fi

echo ""
hr
echo -e "${BOLD}  Applying the following substitutions:${RESET}"
hr
echo -e "  Name          ${CYAN}ts-react-fullstack-template${RESET} → ${GREEN}${PROJECT_NAME}${RESET}"
echo -e "  Display name  ${CYAN}My App / TS React Template${RESET}  → ${GREEN}${DISPLAY_NAME}${RESET}"
echo -e "  Description   → ${GREEN}${DESCRIPTION}${RESET}"
echo -e "  Scope         ${CYAN}@template/${RESET}                  → ${GREEN}@${SCOPE}/${RESET}"
echo -e "  Web port      ${CYAN}9000${RESET}                         → ${GREEN}${WEB_PORT}${RESET}"
echo -e "  SPA port      ${CYAN}9001${RESET}                         → ${GREEN}${SPA_PORT}${RESET}"
[ -n "$AUTHOR" ] && echo -e "  Author        → ${GREEN}${AUTHOR}${RESET}"
echo ""

if [ "$DRY_RUN" = true ]; then
  warn "Dry-run mode — no files will be changed."
  exit 0
fi

# ── File substitution helper ───────────────────────────────────────────────────
replace_in_files() {
  local old="$1" new="$2"
  [ "$old" = "$new" ] && return 0
  # Use find + sed; skips node_modules, .git, binary files, and lock files
  find "$ROOT" \
    -type f \
    \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \
       -o -name "*.json" -o -name "*.toml" -o -name "*.yml" -o -name "*.yaml" \
       -o -name "*.md" -o -name "*.sh" -o -name "*.env*" -o -name "*.html" \
       -o -name "*.css" -o -name "Dockerfile" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/bun.lock*" \
    ! -name "*.lockb" \
    -exec grep -lF "$old" {} \; \
    | while IFS= read -r file; do
        sed -i "s|${old}|${new}|g" "$file"
        info "Updated: ${file#"$ROOT/"}"
      done
}

# ── Apply substitutions ────────────────────────────────────────────────────────
log "Replacing package names and scopes..."
replace_in_files "ts-react-fullstack-template" "$PROJECT_NAME"
replace_in_files "@template/ui"     "@${SCOPE}/ui"
replace_in_files "@template/utils"  "@${SCOPE}/utils"
replace_in_files "@template/config" "@${SCOPE}/config"
replace_in_files "@template/web"    "@${SCOPE}/web"
replace_in_files "@template/spa"    "@${SCOPE}/spa"
replace_in_files "@template/cve-lite"    "@${SCOPE}/cve-lite"
replace_in_files "@template/index-check" "@${SCOPE}/index-check"

log "Replacing display names..."
replace_in_files "TS React Template"                    "$DISPLAY_NAME"
replace_in_files "TS Template"                          "$DISPLAY_NAME"
replace_in_files "TS React SPA Template"                "$DISPLAY_NAME SPA"
replace_in_files "TS React SPA"                         "$DISPLAY_NAME SPA"
replace_in_files "TypeScript React fullstack template"  "$DESCRIPTION"
replace_in_files "TypeScript React Fullstack Template"  "$DISPLAY_NAME"
replace_in_files "Advanced TypeScript React fullstack reusable monorepo template" "$DESCRIPTION"
replace_in_files "A production-grade TypeScript React fullstack application" "$DESCRIPTION"

log "Replacing ports..."
if [ "$WEB_PORT" != "9000" ]; then
  replace_in_files "9000" "$WEB_PORT"
fi
if [ "$SPA_PORT" != "9001" ]; then
  replace_in_files "9001" "$SPA_PORT"
fi

if [ -n "$AUTHOR" ]; then
  log "Replacing author..."
  replace_in_files "Template Author" "$AUTHOR"
  replace_in_files "Your Name"       "$AUTHOR"
fi

# ── Remove optional features ───────────────────────────────────────────────────
if [ "$INCLUDE_WEB" = "false" ]; then
  warn "Removing apps/web (Next.js)..."
  rm -rf "$ROOT/apps/web"
fi

if [ "$INCLUDE_SPA" = "false" ]; then
  warn "Removing apps/spa (Vite SPA)..."
  rm -rf "$ROOT/apps/spa"
fi

if [ "$INCLUDE_DOCKER" = "false" ]; then
  warn "Removing infra/docker/..."
  rm -rf "$ROOT/infra/docker"
fi

if [ "$INCLUDE_PLAYWRIGHT" = "false" ]; then
  warn "Removing Playwright config and E2E tests..."
  rm -f "$ROOT/playwright.config.ts"
  rm -rf "$ROOT/tests/e2e"
fi

# ── Remove template metadata files ────────────────────────────────────────────
log "Removing template metadata files..."
rm -f "$ROOT/template.config.json" "$ROOT/template.schema.json"

# ── Re-initialise git ─────────────────────────────────────────────────────────
echo ""
prompt "Re-initialise git with a clean history? (recommended) [Y/n]:"
read -r yn
if [[ ! "${yn:-y}" =~ ^[Nn]$ ]]; then
  log "Re-initialising git..."
  rm -rf "$ROOT/.git"
  git init "$ROOT" -b main
  git -C "$ROOT" add -A
  git -C "$ROOT" commit -m "chore: initialise ${PROJECT_NAME} from fullstack template"
  log "Fresh git history created."
fi

# ── Final instructions ─────────────────────────────────────────────────────────
echo ""
hr
echo -e "${BOLD}  ${GREEN}✓ Project initialised successfully!${RESET}"
hr
echo ""
echo -e "  Next steps:"
echo -e "  ${CYAN}1.${RESET} cp .env.example .env.local && edit .env.local"
echo -e "  ${CYAN}2.${RESET} bun install"
[ "$INCLUDE_WEB" != "false" ] && echo -e "  ${CYAN}3.${RESET} bun run dev:web   # http://localhost:${WEB_PORT}"
[ "$INCLUDE_SPA" != "false" ] && echo -e "  ${CYAN}4.${RESET} bun run dev:spa   # http://localhost:${SPA_PORT}"
echo -e "  ${CYAN}5.${RESET} bun run test:unit"
echo ""
