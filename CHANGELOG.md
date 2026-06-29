# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- ────────────────────────────────────────────────────────────
  HOW TO USE:
  - Add entries under [Unreleased] as you work.
  - When releasing, rename [Unreleased] to [x.y.z] — YYYY-MM-DD.
  - Run `bun run cve` before each release to check for CVEs.
  - Sections per release: Added, Changed, Deprecated, Removed, Fixed, Security.
──────────────────────────────────────────────────────────── -->

## [Unreleased]

### Added
- Initial monorepo scaffold from the fullstack template
- `apps/web` — Next.js 15 App Router with Turbopack
- `apps/spa` — Vite 6 + React 19 SPA
- `packages/ui` — shared `Button`, `Card`, `Badge` components
- `packages/utils` — `cn`, `validateEnv`, `logger` utilities
- `packages/config` — shared tsconfig presets
- `tools/cve-lite` — CVE vulnerability scanner CLI (OSV.dev)
- `tools/index-check` — barrel file completeness checker CLI
- `scripts/init.sh` — interactive project initialiser
- GitHub Actions CI/CD pipeline
- Jest unit tests (30 passing)
- Playwright E2E test scaffold

---

<!-- Example release entry — copy this block when you ship a version:

## [1.0.0] — 2026-01-01

### Added
- Feature X

### Changed
- Updated dependency Y to v2

### Fixed
- Bug Z when doing W

-->

[Unreleased]: https://github.com/your-org/my-app/compare/HEAD...HEAD
