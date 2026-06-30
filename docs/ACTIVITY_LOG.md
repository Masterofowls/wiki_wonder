# Activity Log

Running history of significant changes to this project.

> **How to use**: Append a time-stamped bullet to the relevant date section after
> each significant action. Keep entries concise — one line per action is ideal.

---

## 2026-06-28

- **Template scaffold** — Created full monorepo from `wiki-wonder`
- **Root configs** — `biome.json`, `tsconfig.json`, `bunfig.toml`, `jest.config.ts`, `playwright.config.ts`, `.gitignore`, `.env.example`
- **apps/web** — Next.js 15 App Router; display name/description driven by `NEXT_PUBLIC_*` env vars
- **apps/spa** — Vite 6 + React 19; app name driven by `VITE_APP_NAME` env var
- **packages/** — `@wikiwonder/ui` (Button, Card, Badge), `@wikiwonder/utils` (cn, validateEnv, logger), `@wikiwonder/config` (tsconfig presets)
- **tools/cve-lite** — CVE Lite CLI (OSV.dev, table/JSON/minimal output, `--fail-on-high`)
- **tools/index-check** — Index Check CLI (barrel validation, auto-fix mode)
- **tests/** — 30 passing Jest unit tests; integration health check; Playwright E2E scaffold
- **CI/CD** — GitHub Actions `ci.yml` + `security.yml`; GitLab CI example in `docs/`
- **Template genericisation** — `template.config.json` + `scripts/init.sh` for zero-friction project init
- **Docs** — `ARCHITECTURE.md`, `DECISIONS.md`, `ACTIVITY_LOG.md`, `CHANGELOG.md`, `docs/gitlab-ci-example.yml`
- **GitHub** — PR template at `.github/PULL_REQUEST_TEMPLATE.md`

## 2026-06-28 (Tooling: Stylelint, Knip, ncu, Taze, React Scan)

- **Stylelint** — `.stylelintrc.json` with `stylelint-config-standard` + `stylelint-config-recess-order`; Tailwind at-rules allowed; `lint:css` + `lint:css:fix` scripts; Stylelint CI job added; CSS auto-fixed on integration
- **Knip** — `knip.json` with full workspace map (all 8 workspaces); exit-0 after removing duplicate barrel and marking public exports; CI job added; `knip` + `knip:fix` scripts
- **ncu** — `.ncurc.json` (bun package manager, latest target, group format); `deps:check` + `deps:update` scripts; `make deps-check` + `make deps-update` targets
- **Taze** — `taze.config.ts` (recursive, write-false for dry-run safety); `deps:taze` + `deps:taze:write` scripts; `make deps-taze` + `make deps-taze-write` targets
- **React Scan** — `apps/web/src/components/ReactScanMonitor.tsx`: `"use client"` component; lazy-loads `react-scan` only when `NODE_ENV=development` + `NEXT_PUBLIC_ENABLE_REACT_SCAN=true`; mounted in layout.tsx; `apps/spa/src/utils/react-scan.ts`: `initReactScan()` called before `createRoot()` in main.tsx; controlled by `VITE_ENABLE_REACT_SCAN`
- **package.json** — added 8 new scripts: `lint:css`, `lint:css:fix`, `knip`, `knip:fix`, `deps:check`, `deps:update`, `deps:taze`, `deps:taze:write`
- **Makefile** — added `lint-css`, `lint-css-fix`, `knip`, `knip-fix`, `deps-check`, `deps-update`, `deps-taze`, `deps-taze-write` targets; `ci` pipeline extended with `lint-css` + `knip` steps
- **.env.example** — added `NEXT_PUBLIC_ENABLE_REACT_SCAN`, `VITE_ENABLE_REACT_SCAN`

## 2026-06-28 (PWA / SEO / OG / License)

- **LICENSE** — MIT license added at repo root
- **apps/web/src/app/robots.ts** — Next.js Metadata API robots; disallows `/api/`, `/_next/`, `/admin/`
- **apps/web/src/app/sitemap.ts** — Next.js dynamic sitemap; annotated for static and dynamic routes
- **apps/web/src/app/manifest.ts** — Next.js PWA web manifest driven by `NEXT_PUBLIC_APP_NAME`
- **apps/web/src/app/opengraph-image.tsx** — Dynamic OG image via `next/og` ImageResponse (1200×630, edge runtime)
- **apps/web/src/app/offline/page.tsx** — Offline fallback page served by the service worker
- **apps/web/public/sw.js** — Service worker: Cache-First for static/media, Network-First for HTML, Network-Only for `/api/`; auto-purges old caches
- **apps/web/src/components/PwaRegistration.tsx** — `"use client"` SW registration; respects `NEXT_PUBLIC_ENABLE_SW`; update-on-focus
- **apps/web/src/app/layout.tsx** — Full OG + Twitter Card metadata; `PwaRegistration` mounted; `appleWebApp` config
- **apps/web/next.config.ts** — SW no-cache headers, manifest content-type header, OG image CDN cache header
- **apps/spa/public/robots.txt** — Static robots.txt with Disallow rules and Sitemap reference
- **apps/spa/public/sitemap.xml** — Static XML sitemap template; commented guide for dynamic generation
- **apps/spa/public/manifest.json** — Enhanced PWA manifest: `display_override`, `categories`, `lang`, `shortcuts`
- **apps/spa/public/offline.html** — Standalone offline fallback (no JS/framework dependency)
- **apps/spa/public/sw.js** — Service worker: Cache-First for `/assets/`, Network-First for shell/routes
- **apps/spa/src/utils/pwa.ts** — SW registration helper with `onServiceWorkerUpdate()` hook for custom UI
- **apps/spa/src/main.tsx** — Calls `registerServiceWorker()` after first render
- **apps/spa/index.html** — Full OG + Twitter Card meta; apple PWA tags; `%VITE_*%` tokens; canonical URL
- **apps/spa/vite.config.ts** — `loadEnv` for build-time injection; immutable asset file names; `define` block
- **.env.example** — Added `NEXT_PUBLIC_ENABLE_SW`, `NEXT_PUBLIC_AUTHOR`, `VITE_ENABLE_SW`, `VITE_APP_URL`, `VITE_AUTHOR`

## 2026-06-29

- **WikiWonder init** — Applied template substitutions (`@wikiwonder/*`, removed Vite SPA, renamed to WikiWonder)
- **packages/db** — Drizzle schema: users, wiki_pages, bookmarks; migration scripts
- **packages/wiki-core** — Markdown pipeline (GFM, KaTeX, wiki links), Zod schemas, Wikipedia REST import
- **apps/web** — Wiki routes, instant search, auth (NextAuth credentials), bookmarks, import UI, PWA, themes
- **Dependencies** — Tailwind 4, Shadcn-style UI, Zustand, GraphQL client, next-pwa, next-themes
- **Build verified** — `bun run typecheck` + `bun run build:web` pass

## 2026-06-29 (Strapi CMS + Vercel)

- **apps/cms** — Strapi 5 with wiki-page + wiki-category content types, GraphQL plugin, seed bootstrap
- **Strapi integration** — Next.js reads CMS pages via Strapi 5 flat GraphQL queries (server-side token)
- **Docker** — Added `cms` service + `Dockerfile.cms` to docker-compose
- **Vercel** — `apps/web/vercel.json`, `docs/VERCEL_DEPLOY.md`, updated `.env.example` with production vars
- **Monorepo** — Excluded `apps/cms` from Bun workspaces (uses npm); added `dev:cms` / `build:cms` scripts

## 2026-06-29 (Vercel monorepo fix)

- **Root package.json** — Added `next`, `react`, `react-dom` so Vercel detects Next.js when Root Directory is `.`
- **vercel.json** — Root monorepo config: `bun install` → `bun run build:web` → `apps/web/.next`
- **apps/web/vercel.json** — Alternate config when Root Directory is `apps/web` (Git deploys only)
- **docs/VERCEL_DEPLOY.md** — Documented Option A (root) vs Option B (apps/web) and detection error fix

## 2026-06-29 (Render CMS + Neon + realtime)

- **render.yaml** — Render Blueprint for `wikiwonder-cms` (Node, Neon Postgres, health check)
- **Strapi lifecycles** — Publish/update wiki pages → POST Vercel `/api/revalidate`
- **apps/web** — `/api/revalidate` cache busting, `/admin` redirect to Strapi, tagged Strapi fetches
- **Neon workflow** — `.github/workflows/neon-branches.yml` for PR preview database branches
- **docs/RENDER_DEPLOY.md** — Full Render + Neon + Vercel env configuration guide

---
