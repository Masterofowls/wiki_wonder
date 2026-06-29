# Deploying WikiWonder to Vercel

WikiWonder deploys as a **monorepo** with the Next.js app at `apps/web`. Strapi CMS runs separately (Render, Railway, etc.) — it cannot run on Vercel serverless.

## 1. Link the project

From the **repository root** (not `apps/web`):

```bash
vercel link
```

In the Vercel dashboard, set **Root Directory** to `.` (repository root). The root `vercel.json` handles the monorepo build:

```json
{
  "installCommand": "bun install",
  "buildCommand": "bun run build:web",
  "outputDirectory": "apps/web/.next"
}
```

Do **not** set Root Directory to `apps/web` — workspace packages live at the repo root.

## 2. Environment variables

Copy from [`.env.example`](../../.env.example) into **Vercel → Project → Settings → Environment Variables**:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Yes | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | Yes | `WikiWonder` |
| `NEXT_PUBLIC_APP_DESCRIPTION` | Yes | App description |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | Same as `NEXT_PUBLIC_APP_URL` |
| `STRAPI_GRAPHQL_URL` | Recommended | Your Strapi host `/graphql` |
| `STRAPI_API_TOKEN` | Recommended | Strapi Admin → API Tokens |
| `DATABASE_URL` | Optional | Supabase Postgres for Drizzle |
| `NEXT_PUBLIC_ENABLE_SW` | Optional | `true` for PWA |

Apply to **Production**, **Preview**, and **Development** as needed.

## 3. Deploy

### Git push (recommended)

Push to GitHub — Vercel builds automatically on each push.

### CLI preview deploy

```bash
# From repository root
vercel deploy --yes --no-wait
vercel inspect <deployment-url>
```

## 4. Strapi CMS (separate host)

Deploy `apps/cms` to Render/Railway/Fly.io:

```bash
cd apps/cms
npm install
npm run build
npm run start
```

Set `STRAPI_GRAPHQL_URL` on Vercel to your Strapi URL + `/graphql`.

## 5. Supabase (optional)

1. Create a Supabase project
2. Copy the Postgres connection string → `DATABASE_URL` on Vercel
3. Run migrations locally: `bun run db:migrate`

Without `DATABASE_URL`, the app uses Strapi + built-in sample pages.
