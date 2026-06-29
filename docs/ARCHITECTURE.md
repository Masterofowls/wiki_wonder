# Architecture

> **Template note**: Update this file to reflect your project's actual architecture after running `scripts/init.sh`.

## Overview

This monorepo is organised into three layers: **apps** (deployable units), **packages** (shared libraries), and **tools** (CLI utilities).

```
┌──────────────────────────────────────────────────────────────┐
│                      Monorepo Root                           │
│                (Bun Workspaces · Biome · Jest)               │
└───────────┬──────────────────┬──────────────────────────────┘
            │                  │
     ┌──────▼──────┐    ┌──────▼──────┐
     │  apps/web   │    │  apps/spa   │
     │  Next.js 15 │    │  Vite + RR  │
     │  Port 9000  │    │  Port 9001  │
     └──────┬──────┘    └──────┬──────┘
            │                  │
            └────────┬─────────┘
                     │ imports
         ┌───────────▼───────────────────────┐
         │           packages/               │
         │   @template/ui   @template/utils  │
         └───────────────────────────────────┘
```

## Applications

### `apps/web` — Next.js 15 App Router

| Concern | Implementation |
|---|---|
| Rendering | Server Components by default; `"use client"` only at interaction leaves |
| Routing | File-system routes under `src/app/` |
| API | Route Handlers in `src/app/api/` |
| Config | `next.config.ts` — security headers, transpiled packages |
| Env | `NEXT_PUBLIC_*` vars inlined at build time; secrets via server-side `process.env` |

### `apps/spa` — Vite + React 19

| Concern | Implementation |
|---|---|
| Routing | React Router 7 (browser history) |
| Build | Vite 6 with manual chunk splitting |
| PWA | Manifest at `public/manifest.json` |
| API | `/api` proxied to `apps/web` in development |
| Env | `VITE_*` vars inlined at build time |

## Packages

### `@template/ui`
React component library. No runtime dependencies beyond React. All components:
- Are accessible (WCAG 2.1 AA target)
- Accept a `className` prop for Tailwind overrides
- Are exported from a single barrel (`src/index.ts`)

### `@template/utils`
Framework-agnostic utilities:
- `cn()` — class-name concatenation with falsy filtering
- `validateEnv()` — type-safe env validation; crashes fast with descriptive messages
- `logger` — leveled console logger with child scope support

### `@template/config`
Configuration files only — no runtime code except a metadata export.

## CLI Tools

### `tools/cve-lite`
Queries [OSV.dev](https://osv.dev) batch API for CVEs in `package.json` dependencies.
No authentication required. Outputs table / JSON / minimal formats.

### `tools/index-check`
Scans directory trees for barrel file completeness. Detects missing `index.ts` files
and un-re-exported modules. `--auto-fix` mode creates / patches them.

## Request Flow

```
Browser
 ├── / ───────────────────────► Next.js RSC (Server Components)
 │                                └── @template/ui (server-side render)
 │
 ├── /api/* ──────────────────► Next.js Route Handlers
 │
 └── (SPA)  ──────────────────► Vite Dev Server / CDN (static)
                                  ├── React Router
                                  └── @template/ui (client-side)
```

## Key Design Decisions

See [DECISIONS.md](DECISIONS.md) for ADR entries.

---

## Adding a New Feature

1. **Shared logic** → `packages/utils/src/`
2. **Shared UI** → `packages/ui/src/components/`
3. **Server-side page/route** → `apps/web/src/app/`
4. **Client-side page** → `apps/spa/src/pages/`
5. **CLI tool** → `tools/<tool-name>/src/`
6. **Tests** → `tests/unit/` (unit) or `tests/integration/` (API)
