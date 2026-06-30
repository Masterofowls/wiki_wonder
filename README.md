# WikiWonder

**Advanced Modern Wiki** — instant search, rich markdown, Strapi CMS, offline PWA, and Wikipedia import.

Built on the TypeScript React fullstack monorepo template with Next.js 15, Drizzle ORM, Supabase Postgres, NextAuth, Zustand, and Shadcn-style UI.

---

## Quick Start

```bash
bun install
cp .env.example .env.local   # configure DATABASE_URL, AUTH_SECRET

bun run dev:web              # http://localhost:9000
bun run db:generate          # generate Drizzle migrations
bun run db:migrate           # apply migrations (requires DATABASE_URL)
bun run test:unit
bun run check
```

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS 4, Shadcn-style components |
| Auth | NextAuth v5 — username/password credentials (no email) |
| Database | Drizzle ORM + Supabase Postgres |
| CMS | Strapi GraphQL (optional — `STRAPI_GRAPHQL_URL`) |
| State | Zustand (search + bookmarks) |
| Validation | Zod |
| Markdown | unified/remark/rehype, GFM, KaTeX, wiki links |
| Import | Wikipedia REST + MediaWiki API |
| PWA | @ducanh2912/next-pwa |
| Themes | next-themes |
| Deploy | Vercel-ready |

---

## Project Structure

```
apps/web/              Next.js wiki app (port 9000)
packages/db/           Drizzle schema — users, wiki_pages, bookmarks
packages/wiki-core/    Markdown pipeline, Zod schemas, Wikipedia import
packages/ui/           Shared React components
packages/utils/        cn, validateEnv, logger
infra/docker/          Docker Compose (Postgres + optional services)
```

---

## Features

- **Instant wiki search** — autocomplete API at `/api/search`
- **Rich markdown** — headers, GFM, LaTeX (`$...$`), `[[wiki links]]`
- **Wiki pages** — `/wiki/[slug]` with previews and bookmarks
- **Wikipedia import** — `/import` + `/api/import` (authenticated)
- **Offline PWA** — service worker with `/offline` fallback
- **Dark/light theme** — system-aware via next-themes
- **Mobile adaptive** — responsive layout throughout

---

## Environment Variables

See [`.env.example`](.env.example). Key variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Supabase Postgres connection string |
| `AUTH_SECRET` | NextAuth session encryption |
| `STRAPI_GRAPHQL_URL` | Strapi CMS GraphQL endpoint |
| `NEXT_PUBLIC_APP_NAME` | Display name (default: WikiWonder) |

Without `DATABASE_URL`, the app runs with built-in sample pages.

---

## Scripts

```bash
bun run dev:web        # Start Next.js dev server
bun run build:web      # Production build
bun run db:generate    # Drizzle migration files
bun run db:migrate     # Apply migrations
bun run db:studio      # Drizzle Studio
bun run test:unit      # Jest unit tests
bun run test:e2e       # Playwright E2E
bun run cve            # CVE scan
```

---

## Deploy

| Service | Host | Docs |
|---|---|---|
| Wiki frontend | [Vercel](https://wikiwonder.vercel.app) | [VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md) |
| Strapi CMS | [Render](https://render.com) | [RENDER_DEPLOY.md](docs/RENDER_DEPLOY.md) |

Admin: **https://wikiwonder.vercel.app/admin** (redirects to Render CMS when configured).

**Strapi CMS** deploys separately — see [apps/cms/README.md](apps/cms/README.md).

---

## Roadmap

- [x] Strapi CMS app (`apps/cms`) with wiki-page + wiki-category content types
- [ ] Mermaid diagrams, video blocks, citation.js integration
- [ ] Link previews and hover cards
- [ ] Server-synced bookmarks
- [ ] Full-text search (Postgres FTS or Meilisearch)
- [ ] Lucide Animated icons

---

## License

MIT
