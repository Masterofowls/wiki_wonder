# Activity Log

Running history of significant changes to this project.

> **How to use**: Append a time-stamped bullet to the relevant date section after
> each significant action. Keep entries concise — one line per action is ideal.

---

## 2026-06-28

- **Template scaffold** — Created full monorepo from `ts-react-fullstack-template`
- **Root configs** — `biome.json`, `tsconfig.json`, `bunfig.toml`, `jest.config.ts`, `playwright.config.ts`, `.gitignore`, `.env.example`
- **apps/web** — Next.js 15 App Router; display name/description driven by `NEXT_PUBLIC_*` env vars
- **apps/spa** — Vite 6 + React 19; app name driven by `VITE_APP_NAME` env var
- **packages/** — `@template/ui` (Button, Card, Badge), `@template/utils` (cn, validateEnv, logger), `@template/config` (tsconfig presets)
- **tools/cve-lite** — CVE Lite CLI (OSV.dev, table/JSON/minimal output, `--fail-on-high`)
- **tools/index-check** — Index Check CLI (barrel validation, auto-fix mode)
- **tests/** — 30 passing Jest unit tests; integration health check; Playwright E2E scaffold
- **CI/CD** — GitHub Actions `ci.yml` + `security.yml`; GitLab CI example in `docs/`
- **Template genericisation** — `template.config.json` + `scripts/init.sh` for zero-friction project init
- **Docs** — `ARCHITECTURE.md`, `DECISIONS.md`, `ACTIVITY_LOG.md`, `CHANGELOG.md`, `docs/gitlab-ci-example.yml`
- **GitHub** — PR template at `.github/PULL_REQUEST_TEMPLATE.md`

---
