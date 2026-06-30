# Deploying WikiWonder to Vercel

WikiWonder is a **Bun monorepo**. Choose **one** configuration below — do not mix them.

## Option A — Root Directory: `.` (recommended for GitHub)

Use when the Vercel project is linked to the full repo (e.g. `wiki_wonder`).

1. **Vercel → Settings → General → Root Directory** → leave as **`.`** (repository root)
2. Root [`vercel.json`](../vercel.json) is used automatically:

```json
{
  "installCommand": "bun install",
  "buildCommand": "bun run build:web",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs"
}
```

3. Root [`package.json`](../package.json) includes `next` so Vercel detects the framework.

## Option B — Root Directory: `apps/web`

Use if you prefer the Next.js app folder as the project root.

1. **Vercel → Settings → General → Root Directory** → **`apps/web`**
2. [`apps/web/vercel.json`](../apps/web/vercel.json) runs install/build from the monorepo root:

```json
{
  "installCommand": "cd ../.. && bun install",
  "buildCommand": "cd ../.. && bun run build:web",
  "framework": "nextjs"
}
```

Requires **Git integration** (full repo checkout). CLI-only uploads of `apps/web` alone will fail.

---

## Fix: "No Next.js version detected"

This error means Vercel is reading a `package.json` that does **not** list `next`:

| Root Directory | Fix |
|---|---|
| `.` (repo root) | Ensure root `package.json` has `next` in `dependencies` (already configured) |
| `apps/web` | Set Root Directory to `apps/web` — `next` is in `apps/web/package.json` |

After changing Root Directory, **redeploy** from the Deployments tab.

## Environment variables

Set in **Vercel → Settings → Environment Variables** (from [`.env.example`](../.env.example)):

| Variable | Required |
|---|---|
| `NEXT_PUBLIC_APP_URL` | Yes |
| `NEXT_PUBLIC_APP_NAME` | Yes |
| `AUTH_SECRET` | Yes |
| `AUTH_URL` | Yes |
| `STRAPI_GRAPHQL_URL` | Optional |
| `STRAPI_API_TOKEN` | Optional |
| `DATABASE_URL` | Optional |

## Deploy

```bash
# Git push (recommended)
git push origin main

# CLI preview (from repo root — Option A)
vercel deploy --yes --no-wait

# CLI preview (Option B — Root Directory must be apps/web in dashboard)
cd apps/web && vercel deploy --yes --no-wait
```

## Strapi CMS

Deploy `apps/cms` separately (Render/Railway/Fly.io). See [apps/cms/README.md](../apps/cms/README.md).
