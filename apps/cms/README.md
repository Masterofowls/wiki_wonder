# WikiWonder Strapi CMS

Headless CMS for wiki content with GraphQL API.

## Quick start

```bash
cd apps/cms
cp .env.example .env
# Edit .env — set APP_KEYS and secrets (see below)

npm install
npm run develop
```

- Admin panel: http://localhost:1337/admin
- GraphQL playground: http://localhost:1337/graphql
- REST API: http://localhost:1337/api

## Generate secrets

```bash
# Run 4 times for APP_KEYS (comma-separated in .env)
openssl rand -base64 32
```

Set `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, and `JWT_SECRET` the same way.

## Content types

| Type | API ID | GraphQL |
|---|---|---|
| Wiki Page | `wiki-page` | `wikiPages`, `wikiPage` |
| Wiki Category | `wiki-category` | `wikiCategories`, `wikiCategory` |

## Connect to Next.js

In the root `.env.local`:

```env
STRAPI_GRAPHQL_URL=http://localhost:1337/graphql
STRAPI_API_TOKEN=<create in Strapi Admin → Settings → API Tokens>
```

## Production hosting

Strapi requires a persistent Node.js server — **do not deploy to Vercel serverless**.

Recommended hosts: [Render](https://render.com), [Railway](https://railway.app), [Fly.io](https://fly.io), or Strapi Cloud.

Use `DATABASE_CLIENT=postgres` with a managed Postgres instance.
