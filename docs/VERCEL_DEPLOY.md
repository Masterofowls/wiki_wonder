# Deploying WikiWonder to Vercel

WikiWonder deploys as a **Bun monorepo**. The Next.js app lives in `apps/web`; Strapi CMS deploys separately.

## Critical: Root Directory

In **Vercel → Project → Settings → General → Root Directory**, set:

```
apps/web
```

Vercel detects Next.js from `apps/web/package.json`. If Root Directory is `.` (repo root), the build fails with:

> No Next.js version detected. Make sure your package.json has "next" in dependencies...

The install/build commands in `apps/web/vercel.json` run from the monorepo root so workspace packages resolve:

```json
{
  "installCommand": "cd ../.. && bun install",
  "buildCommand": "cd ../.. && bun run build:web",
  "framework": "nextjs"
}
```

## 1. Link the project

```bash
cd apps/web
vercel link
```

When importing from GitHub, set **Root Directory** to `apps/web` during setup.

## 2. Environment variables

Copy from [`.env.example`](../../.env.example) into **Vercel → Settings → Environment Variables**:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Yes | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_APP_NAME` | Yes | `WikiWonder` |
| `NEXT_PUBLIC_APP_DESCRIPTION` | Yes | App description |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | Same as `NEXT_PUBLIC_APP_URL` |
| `STRAPI_GRAPHQL_URL` | Recommended | Strapi host + `/graphql` |
| `STRAPI_API_TOKEN` | Recommended | Strapi Admin → API Tokens |
| `DATABASE_URL` | Optional | Supabase Postgres |
| `NEXT_PUBLIC_ENABLE_SW` | Optional | `true` for PWA |

## 3. Deploy

### Git push (recommended)

Push to GitHub — Vercel builds from `apps/web` with full repo checkout.

### CLI preview deploy

```bash
cd apps/web
vercel deploy --yes --no-wait
vercel inspect <deployment-url>
```

## 4. Strapi CMS (separate host)

Strapi cannot run on Vercel serverless. Deploy `apps/cms` to Render, Railway, or Fly.io — see [apps/cms/README.md](../../apps/cms/README.md).

## 5. Supabase (optional)

1. Create a Supabase project
2. Set `DATABASE_URL` on Vercel
3. Run `bun run db:migrate` locally against that database
