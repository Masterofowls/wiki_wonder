# Architecture — WikiWonder

## Overview

WikiWonder is a Bun monorepo with a Next.js 15 wiki frontend, shared packages for data and markdown processing, and optional Strapi CMS integration.

```
┌─────────────────────────────────────────────────────────────┐
│                     apps/web (Next.js 15)                   │
│  Pages: /, /wiki, /wiki/[slug], /search, /import, /login   │
│  API: /api/search, /api/import, /api/auth, /api/health      │
└────────────┬───────────────────────────────┬────────────────┘
             │                               │
    ┌────────▼────────┐              ┌───────▼────────┐
    │  @wikiwonder/db │              │ @wikiwonder/   │
    │  Drizzle ORM    │              │ wiki-core      │
    │  Supabase PG    │              │ Markdown+Import│
    └────────────────┘              └────────────────┘
             │
    ┌────────▼────────┐
    │  apps/cms       │  Strapi 5 — wiki-page, wiki-category
    │  GraphQL :1337  │  (Render/Railway/Docker — not Vercel)
    └─────────────────┘
```

## Data Model

| Table | Purpose |
|---|---|
| `users` | Username + password hash (no email) |
| `wiki_pages` | Slug, title, markdown content, source metadata |
| `bookmarks` | User ↔ page associations |

## Request Flow

### Wiki Page Render

1. `GET /wiki/[slug]` → `getWikiPageBySlug()` (DB or sample fallback)
2. `renderMarkdownToHtml()` — remark/rehype pipeline with GFM, KaTeX, wiki links
3. Server-rendered HTML via `WikiContent` component

### Search Autocomplete

1. Client debounces input (200ms) → `GET /api/search?q=...`
2. Drizzle `ilike` query on title, summary, content
3. Results displayed in cmdk Command palette

### Wikipedia Import

1. Authenticated `POST /api/import` with URL or title
2. Fetches Wikipedia REST summary + MediaWiki wikitext
3. Converts wikitext → markdown, upserts into `wiki_pages`

## Auth

NextAuth v5 Credentials provider — username/password validated against `users` table via bcrypt. No email field or OAuth in v0.1.

## PWA

`@ducanh2912/next-pwa` generates service worker at build time. Offline fallback document at `/offline`.

## Key Packages

- **`@wikiwonder/db`** — Drizzle client, schema, migrations
- **`@wikiwonder/wiki-core`** — Zod schemas, markdown renderer, Wikipedia import (server subpath)
- **`@wikiwonder/ui`** — Shared Button, Card, Badge from template
- **`@wikiwonder/utils`** — Env validation, logger

## Deployment (Vercel)

1. Set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` in Vercel env
2. Run migrations against Supabase before first deploy
3. `bun run build:web` — root build command

See [DECISIONS.md](DECISIONS.md) for ADRs.
