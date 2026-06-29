# TypeScript React Fullstack Template

> **This is a reusable template.** Follow the [Quick Start](#quick-start) below to initialise it for your project in under two minutes.

A production-grade, opinionated **Bun monorepo** template for building TypeScript React fullstack applications. Ships with Next.js, Vite, Biome, Jest, CVE scanning, and index checking — all pre-wired and ready to clone.

---

## Using This Template

### Option A — Interactive init script (recommended)

```bash
# 1. Clone
git clone https://github.com/your-org/ts-react-fullstack-template my-project
cd my-project

# 2. Run the interactive initialiser
bash scripts/init.sh
```

The script will ask for:

| Prompt | Example |
|---|---|
| Project name (kebab-case) | `my-saas-app` |
| Display name | `My SaaS App` |
| Short description | `The best SaaS ever` |
| Package scope | `myapp` → `@myapp/ui`, `@myapp/utils` |
| Ports | `9000`, `9001` |
| Which features to include | Next.js ✓ / Vite ✓ / Docker ✓ |

It then replaces all placeholders, removes unused app directories, and re-initialises git with a clean history.

### Option B — Edit `template.config.json` and run non-interactively

```bash
# 1. Edit the config
vi template.config.json

# 2. Apply
bash scripts/init.sh --config
```

### Option C — Manual

1. Search-and-replace `ts-react-fullstack-template` with your project name.
2. Search-and-replace `@template/` with `@yourscope/`.
3. Update `NEXT_PUBLIC_APP_NAME` / `VITE_APP_NAME` in `.env.local`.
4. Delete apps or tools you don't need.
5. Run `bun install`.

---

## Contents

- [Stack](#stack)
- [Project Structure](#project-structure)
- [Quick Start (after init)](#quick-start-after-init)
- [Apps](#apps)
- [Packages](#packages)
- [CLI Tools](#cli-tools)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Environment Variables](#environment-variables)
- [Removing Unused Features](#removing-unused-features)
- [Contributing](#contributing)

---

## Stack

| Layer | Tool | Version |
|---|---|---|
| Runtime / Package Manager | [Bun](https://bun.sh) | ≥ 1.1 |
| Frontend (fullstack) | [Next.js](https://nextjs.org) | 15 |
| Frontend (SPA) | [Vite](https://vitejs.dev) + React | 6 / 19 |
| Language | TypeScript (strict) | 5.7 |
| Linting + Formatting | [Biome](https://biomejs.dev) | 1.9 |
| Unit / Integration Tests | [Jest](https://jestjs.io) + ts-jest | 29 |
| E2E Tests | [Playwright](https://playwright.dev) | 1.49 |
| CVE Scanner | CVE Lite CLI (built-in, OSV.dev) | — |
| Index Validator | Index Check CLI (built-in) | — |

---

## Project Structure

```
.
├── apps/
│   ├── web/            # Next.js 15 App Router              (port 9000)
│   └── spa/            # Vite 6 React SPA                   (port 9001)
├── packages/
│   ├── ui/             # Shared React components             @template/ui
│   ├── config/         # Shared tsconfig + biome presets     @template/config
│   └── utils/          # Shared utilities                    @template/utils
├── tools/
│   ├── cve-lite/       # CVE vulnerability scanner CLI
│   └── index-check/    # Barrel file completeness CLI
├── tests/
│   ├── unit/           # Jest unit tests
│   ├── integration/    # Jest integration tests
│   └── e2e/            # Playwright E2E tests
├── docs/               # ARCHITECTURE, DECISIONS, ACTIVITY_LOG
├── infra/docker/       # Dockerfile + docker-compose
├── scripts/            # init.sh, setup.sh, git-rollback.sh, check-env.sh
├── .github/workflows/  # ci.yml, security.yml
├── template.config.json  # ← Edit this before running init.sh
├── biome.json
├── jest.config.ts
├── playwright.config.ts
└── tsconfig.json
```

---

## Quick Start (after init)

```bash
bun install
cp .env.example .env.local   # fill in your values

bun run dev:web    # Next.js  → http://localhost:9000
bun run dev:spa    # Vite SPA → http://localhost:9001
bun run test:unit  # Jest
bun run check      # Biome lint + format
bun run cve        # CVE scan
```

---

## Apps

### `apps/web` — Next.js 15

- App Router with Server Components and streaming
- Turbopack HMR in development
- Security headers pre-configured in `next.config.ts`
- `/api/health` route for uptime probes
- All display text driven by `NEXT_PUBLIC_APP_NAME` / `NEXT_PUBLIC_APP_DESCRIPTION` env vars

```bash
bun run dev:web     # Start dev (port set by APP_PORT env var, default 9000)
bun run build:web   # Production build
```

### `apps/spa` — Vite + React 19

- React Router 7 (Home / About / 404)
- PWA manifest for installability
- `/api` dev proxy → Next.js
- Code-split vendor + router chunks
- App name driven by `VITE_APP_NAME` env var

```bash
bun run dev:spa     # Start dev (port set by SPA_PORT env var, default 9001)
bun run build:spa   # Production build
```

---

## Packages

### `@template/ui`

Shared accessible React component library. Import in either app:

```ts
import { Button, Card, Badge } from "@template/ui";
```

Components: `Button` (4 variants, 3 sizes, loading state), `Card` + `CardHeader/Content/Footer`, `Badge` (5 severity variants).

### `@template/utils`

```ts
import { cn, validateEnv, requireEnv, logger } from "@template/utils";

// Class name helper
cn("base", isActive && "active", className);

// Crash-fast env validation at startup
validateEnv({
  DATABASE_URL: { required: true },
  PORT: { required: false, default: "9000" },
});

// Leveled logger with child scopes
logger.info("Server started", { port: 9000 });
logger.child("Auth").warn("Token near expiry");
```

### `@template/config`

Shared `tsconfig` presets for all workspaces:

| Preset | Used by |
|---|---|
| `base.json` | Node.js tools, packages |
| `react-app.json` | Vite SPA |
| `nextjs.json` | Next.js app |

---

## CLI Tools

### CVE Lite (`bun run cve`)

```bash
bun run cve                          # Scan ./package.json
bun run cve -- --path apps/web       # Scan a specific workspace
bun run cve -- --fail-on-high        # CI mode: exit 1 on HIGH/CRITICAL
bun run cve -- --format json         # Machine-readable output
bun run cve -- --include-dev         # Include devDependencies
bun run cve -- --help                # All options
```

### Index Check (`bun run index-check`)

```bash
bun run index-check                          # Check current directory
bun run index-check -- --path packages       # Check packages only
bun run index-check -- --auto-fix            # Create missing index files
bun run index-check -- --format json         # Machine-readable output
bun run index-check -- --help                # All options
```

---

## Testing

```bash
bun run test:unit         # Jest unit tests
bun run test:integration  # Jest integration tests (requires running server)
bun run test:e2e          # Playwright E2E
bun run test -- --coverage
bun run test:watch
```

---

## CI/CD

`.github/workflows/ci.yml` runs on every push/PR to `main` and `develop`:

```
install → typecheck → lint → test → build → CVE scan → index check
```

`.github/workflows/security.yml` runs weekly (Monday 06:00 UTC) for a full CVE scan including dev dependencies.

**GitLab CI**: See [`docs/gitlab-ci-example.yml`](docs/gitlab-ci-example.yml) for an equivalent pipeline.

---

## Environment Variables

```bash
cp .env.example .env.local
# Then edit .env.local — the file is gitignored
```

Required variables are validated at startup by `validateEnv()` — missing required vars cause an immediate crash with a clear error message (no silent failures).

See [`.env.example`](.env.example) for the complete list with inline documentation.

---

## Removing Unused Features

Delete what you don't need — the template is designed to be trimmed:

| Feature | What to delete |
|---|---|
| Next.js app | `apps/web/`, remove `build:web` / `dev:web` from root `package.json` |
| Vite SPA | `apps/spa/`, remove `build:spa` / `dev:spa` from root `package.json` |
| Docker | `infra/docker/` |
| Playwright E2E | `playwright.config.ts`, `tests/e2e/` |
| CVE Lite | `tools/cve-lite/`, remove `cve` script |
| Index Check | `tools/index-check/`, remove `index-check` script |
| Database config | Remove `DATABASE_URL` block from `.env.example` |

Or use `bash scripts/init.sh` — it handles all of this interactively.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT
