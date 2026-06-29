# ──────────────────────────────────────────────────────────────────────────────
# Makefile — Cross-platform task runner for the fullstack monorepo template
#
# Works on:  Linux · macOS · Windows (Git Bash, WSL, or make from Chocolatey)
#
# Usage:
#   make                 Show this help
#   make install         Install all workspace dependencies
#   make dev             Start both apps in parallel
#   make dev-web         Start Next.js dev server only
#   make dev-spa         Start Vite SPA dev server only
#   make build           Build all apps for production
#   make test            Run unit + integration tests
#   make test-unit       Run unit tests only
#   make test-e2e        Run Playwright E2E tests
#   make lint            Biome lint check
#   make format          Biome format check
#   make check           Biome lint + format check (no write)
#   make fix             Biome lint + format auto-fix
#   make typecheck       TypeScript type check across all workspaces
#   make cve             Run CVE Lite vulnerability scan
#   make index-check     Run Index Check barrel file validator
#   make setup           Run the setup script (installs deps, copies .env)
#   make init            Interactive project initialiser (Unix)
#   make init-ps         Interactive project initialiser (PowerShell/Windows)
#   make docker-up       Start Docker Compose stack
#   make docker-down     Stop Docker Compose stack
#   make docker-build    Build Docker image
#   make clean           Remove all node_modules and build artefacts
#   make clean-build     Remove only build artefacts (.next, dist, coverage)
#   make env-check       Validate required environment variables
#   make rollback        Interactive git rollback helper (Unix)
#   make ci              Run the full CI pipeline locally
# ──────────────────────────────────────────────────────────────────────────────

# ── OS detection ──────────────────────────────────────────────────────────────
ifeq ($(OS),Windows_NT)
  DETECTED_OS  := Windows
  SHELL_CMD    := powershell.exe -NonInteractive -Command
  RM_RF        := Remove-Item -Recurse -Force
  MKDIR_P      := New-Item -ItemType Directory -Force
  ENV_SEP      := ;
else
  DETECTED_OS  := $(shell uname -s)
  SHELL_CMD    := bash -c
  RM_RF        := rm -rf
  MKDIR_P      := mkdir -p
  ENV_SEP      := :
endif

# ── Bun binary ────────────────────────────────────────────────────────────────
BUN := bun

# ── Colours (suppressed on Windows cmd) ──────────────────────────────────────
ifneq ($(DETECTED_OS),Windows)
  BOLD  := \033[1m
  RESET := \033[0m
  GREEN := \033[32m
  CYAN  := \033[36m
  YELLOW:= \033[33m
else
  BOLD  :=
  RESET :=
  GREEN :=
  CYAN  :=
  YELLOW:=
endif

.DEFAULT_GOAL := help

.PHONY: help install dev dev-web dev-spa build build-web build-spa \
        test test-unit test-integration test-e2e test-watch test-coverage \
        lint lint-css lint-css-fix format check fix typecheck \
        knip knip-fix \
        deps-check deps-update deps-taze deps-taze-write \
        cve cve-ci index-check index-fix \
        setup init init-ps init-config \
        docker-up docker-down docker-build docker-logs \
        clean clean-build env-check rollback ci

# ── Help ──────────────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "$(BOLD)Fullstack Template — Available Make Targets$(RESET)"
	@echo "$(CYAN)────────────────────────────────────────────────────$(RESET)"
	@echo ""
	@echo "$(BOLD)Setup$(RESET)"
	@echo "  make install        Install all Bun workspace dependencies"
	@echo "  make setup          Install deps + copy .env.example to .env.local"
	@echo "  make init           Interactive project initialiser (Unix/macOS/WSL)"
	@echo "  make init-ps        Interactive project initialiser (Windows PowerShell)"
	@echo "  make init-config    Non-interactive init reading template.config.json"
	@echo ""
	@echo "$(BOLD)Development$(RESET)"
	@echo "  make dev            Start all dev servers"
	@echo "  make dev-web        Start Next.js app on port 9000"
	@echo "  make dev-spa        Start Vite SPA on port 9001"
	@echo ""
	@echo "$(BOLD)Build$(RESET)"
	@echo "  make build          Build all apps for production"
	@echo "  make build-web      Build Next.js app"
	@echo "  make build-spa      Build Vite SPA"
	@echo ""
	@echo "$(BOLD)Testing$(RESET)"
	@echo "  make test           Unit + integration tests"
	@echo "  make test-unit      Unit tests only (Jest)"
	@echo "  make test-e2e       Playwright E2E tests"
	@echo "  make test-watch     Jest in watch mode"
	@echo "  make test-coverage  Tests with coverage report"
	@echo ""
	@echo "$(BOLD)Code Quality$(RESET)"
	@echo "  make typecheck      TypeScript type check (all workspaces)"
	@echo "  make lint           Biome lint (TS/JS/JSX)"
	@echo "  make lint-css       Stylelint CSS check"
	@echo "  make lint-css-fix   Stylelint CSS auto-fix"
	@echo "  make format         Biome format check"
	@echo "  make check          Biome lint + format (no write)"
	@echo "  make fix            Biome auto-fix (lint + format)"
	@echo "  make knip           Knip dead-code / unused deps scan"
	@echo "  make knip-fix       Knip with auto-fix"
	@echo ""
	@echo "$(BOLD)Dependency Updates$(RESET)"
	@echo "  make deps-check     Check outdated deps (ncu, read-only)"
	@echo "  make deps-update    Upgrade deps in package.json (ncu --upgrade)"
	@echo "  make deps-taze      Check outdated deps (taze, read-only)"
	@echo "  make deps-taze-write  Upgrade deps in package.json (taze --write)"
	@echo ""
	@echo "$(BOLD)Security & Validation$(RESET)"
	@echo "  make cve            CVE Lite scan (OSV.dev)"
	@echo "  make cve-ci         CVE scan in CI mode (exit 1 on HIGH/CRITICAL)"
	@echo "  make index-check    Barrel file completeness check"
	@echo "  make env-check      Validate required environment variables"
	@echo ""
	@echo "$(BOLD)Docker$(RESET)"
	@echo "  make docker-up      Start Docker Compose stack"
	@echo "  make docker-down    Stop Docker Compose stack"
	@echo "  make docker-build   Build Docker image"
	@echo "  make docker-logs    Tail Docker Compose logs"
	@echo ""
	@echo "$(BOLD)Maintenance$(RESET)"
	@echo "  make clean          Remove node_modules + all build artefacts"
	@echo "  make clean-build    Remove only build artefacts"
	@echo "  make rollback       Interactive git rollback (Unix)"
	@echo "  make ci             Full CI pipeline (typecheck+lint+test+build+cve)"
	@echo ""

# ── Setup ─────────────────────────────────────────────────────────────────────
install:
	@echo "$(GREEN)Installing dependencies...$(RESET)"
	$(BUN) install

setup:
	@echo "$(GREEN)Running setup...$(RESET)"
	bash scripts/setup.sh

init:
	@echo "$(GREEN)Starting interactive project initialiser...$(RESET)"
	bash scripts/init.sh

init-ps:
	@echo "$(GREEN)Starting interactive project initialiser (PowerShell)...$(RESET)"
	powershell.exe -ExecutionPolicy Bypass -File scripts/init.ps1

init-config:
	@echo "$(GREEN)Running non-interactive init from template.config.json...$(RESET)"
	bash scripts/init.sh --config

# ── Development ───────────────────────────────────────────────────────────────
dev:
	@echo "$(GREEN)Starting all dev servers...$(RESET)"
	$(BUN) run dev

dev-web:
	@echo "$(GREEN)Starting Next.js app (port 9000)...$(RESET)"
	$(BUN) run dev:web

dev-spa:
	@echo "$(GREEN)Starting Vite SPA (port 9001)...$(RESET)"
	$(BUN) run dev:spa

# ── Build ─────────────────────────────────────────────────────────────────────
build: build-web build-spa

build-web:
	@echo "$(GREEN)Building Next.js app...$(RESET)"
	$(BUN) run build:web

build-spa:
	@echo "$(GREEN)Building Vite SPA...$(RESET)"
	$(BUN) run build:spa

# ── Testing ───────────────────────────────────────────────────────────────────
# Jest must run under Node.js (not Bun) to avoid readonly-property errors.
# We invoke node directly rather than via `bun run` for all test targets.
JEST := node node_modules/.bin/jest

test:
	@echo "$(GREEN)Running unit + integration tests...$(RESET)"
	$(JEST) --passWithNoTests

test-unit:
	@echo "$(GREEN)Running unit tests...$(RESET)"
	$(JEST) tests/unit --passWithNoTests

test-integration:
	@echo "$(GREEN)Running integration tests...$(RESET)"
	$(JEST) tests/integration --passWithNoTests

test-e2e:
	@echo "$(GREEN)Running Playwright E2E tests...$(RESET)"
	$(BUN) run test:e2e

test-watch:
	$(JEST) --watch

test-coverage:
	@echo "$(GREEN)Running tests with coverage...$(RESET)"
	$(JEST) --coverage --passWithNoTests

# ── Code Quality ──────────────────────────────────────────────────────────────
typecheck:
	@echo "$(GREEN)Type checking all workspaces...$(RESET)"
	$(BUN) run typecheck

lint:
	@echo "$(GREEN)Linting TypeScript/JSX (Biome)...$(RESET)"
	$(BUN) run lint

lint-css:
	@echo "$(GREEN)Linting CSS (Stylelint)...$(RESET)"
	$(BUN) run lint:css

lint-css-fix:
	@echo "$(YELLOW)Auto-fixing CSS (Stylelint)...$(RESET)"
	$(BUN) run lint:css:fix

format:
	@echo "$(GREEN)Format check (Biome)...$(RESET)"
	$(BUN) run format

check:
	@echo "$(GREEN)Biome lint + format check...$(RESET)"
	$(BUN) run check

fix:
	@echo "$(YELLOW)Applying Biome auto-fix...$(RESET)"
	$(BUN) run check:fix

# ── Dead code & unused deps (Knip) ───────────────────────────────────────────
knip:
	@echo "$(GREEN)Running Knip dead-code scan...$(RESET)"
	$(BUN) run knip

knip-fix:
	@echo "$(YELLOW)Running Knip with auto-fix...$(RESET)"
	$(BUN) run knip:fix

# ── Dependency updates ────────────────────────────────────────────────────────
deps-check:
	@echo "$(GREEN)Checking for outdated dependencies (ncu)...$(RESET)"
	$(BUN) run deps:check

deps-update:
	@echo "$(YELLOW)Writing dependency updates (ncu --upgrade)...$(RESET)"
	$(BUN) run deps:update

deps-taze:
	@echo "$(GREEN)Checking for outdated dependencies (taze)...$(RESET)"
	$(BUN) run deps:taze

deps-taze-write:
	@echo "$(YELLOW)Writing dependency updates (taze --write)...$(RESET)"
	$(BUN) run deps:taze:write

# ── Security & Validation ─────────────────────────────────────────────────────
cve:
	@echo "$(GREEN)Running CVE Lite scan...$(RESET)"
	$(BUN) run cve

cve-ci:
	@echo "$(GREEN)Running CVE Lite scan (CI mode — fails on HIGH/CRITICAL)...$(RESET)"
	$(BUN) run cve -- --fail-on-high

index-check:
	@echo "$(GREEN)Checking barrel file completeness...$(RESET)"
	$(BUN) run index-check -- --path packages

index-fix:
	@echo "$(YELLOW)Auto-fixing missing index files...$(RESET)"
	$(BUN) run index-check -- --path packages --auto-fix

env-check:
	@echo "$(GREEN)Checking environment variables...$(RESET)"
	bash scripts/check-env.sh

# ── Docker ────────────────────────────────────────────────────────────────────
docker-up:
	@echo "$(GREEN)Starting Docker Compose stack...$(RESET)"
	docker compose -f infra/docker/docker-compose.yml up -d

docker-down:
	@echo "$(YELLOW)Stopping Docker Compose stack...$(RESET)"
	docker compose -f infra/docker/docker-compose.yml down

docker-build:
	@echo "$(GREEN)Building Docker image...$(RESET)"
	docker compose -f infra/docker/docker-compose.yml build

docker-logs:
	docker compose -f infra/docker/docker-compose.yml logs -f

# ── Maintenance ───────────────────────────────────────────────────────────────
clean:
	@echo "$(YELLOW)Removing node_modules and build artefacts...$(RESET)"
	$(BUN) run clean

clean-build:
	@echo "$(YELLOW)Removing build artefacts only...$(RESET)"
	$(RM_RF) apps/web/.next apps/spa/dist coverage playwright-report

rollback:
	@echo "$(GREEN)Opening git rollback helper...$(RESET)"
	bash scripts/git-rollback.sh --help

# ── Full CI pipeline (local) ──────────────────────────────────────────────────
# Runs the same steps as .github/workflows/ci.yml — useful for pre-push checks.
ci: install typecheck check lint-css knip test-unit build cve-ci index-check
	@echo ""
	@echo "$(GREEN)$(BOLD)✓ Full CI pipeline passed.$(RESET)"
	@echo ""
