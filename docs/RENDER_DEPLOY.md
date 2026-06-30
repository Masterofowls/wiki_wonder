# Deploy WikiWonder CMS on Render + Neon

Strapi runs on [Render](https://render.com). The wiki frontend stays on [Vercel](https://wikiwonder.vercel.app). Content updates publish in near-realtime via webhooks.

## Architecture

```
Strapi (Render)  ──publish──▶  POST /api/revalidate  ──▶  Vercel (Next.js)
     │                              │
     └── Neon Postgres              └── revalidateTag('wiki-pages')
```

## 1. Neon database

1. Create a project at [Neon](https://neon.tech)
2. Copy the **pooled** connection string from the dashboard
3. **Never commit credentials** — set `DATABASE_URL` only in Render env vars

Optional: run `npx neonctl@latest init` locally to link the project.

### GitHub PR preview branches

Workflow [`.github/workflows/neon-branches.yml`](../.github/workflows/neon-branches.yml) creates ephemeral Neon branches per PR.

Set in GitHub **Settings → Secrets and variables → Actions**:

| Name | Type | Value |
|---|---|---|
| `NEON_API_KEY` | Secret | From Neon console |
| `NEON_PROJECT_ID` | Variable | Your Neon project ID |

## 2. Deploy Strapi on Render

### Option A — Blueprint (recommended)

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect repo `Masterofowls/wiki_wonder`
3. Render reads [`render.yaml`](../render.yaml) and creates `wikiwonder-cms`

### Option B — Manual web service

| Setting | Value |
|---|---|
| Root Directory | `apps/cms` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start` |
| Health Check | `/api/health` |

## 3. Render environment variables

Set these on the **wikiwonder-cms** service:

| Variable | Example / notes |
|---|---|
| `DATABASE_CLIENT` | `postgres` |
| `DATABASE_URL` | Neon **pooled** URL |
| `DATABASE_SSL` | `true` |
| `APP_KEYS` | 4 comma-separated secrets (`openssl rand -base64 32`) |
| `API_TOKEN_SALT` | random secret |
| `ADMIN_JWT_SECRET` | random secret |
| `TRANSFER_TOKEN_SALT` | random secret |
| `JWT_SECRET` | random secret |
| `CORS_ORIGIN` | `https://wikiwonder.vercel.app,http://localhost:9000` |
| `REVALIDATE_URL` | `https://wikiwonder.vercel.app/api/revalidate` |
| `REVALIDATE_SECRET` | shared secret (same on Vercel) |
| `STRAPI_PUBLIC_URL` | `https://wikiwonder-cms.onrender.com` |

After deploy:

- **Admin:** `https://wikiwonder-cms.onrender.com/admin`
- **GraphQL:** `https://wikiwonder-cms.onrender.com/graphql`

## 4. Vercel environment variables

Set on [wikiwonder.vercel.app](https://wikiwonder.vercel.app):

| Variable | Value |
|---|---|
| `STRAPI_GRAPHQL_URL` | `https://wikiwonder-cms.onrender.com/graphql` |
| `STRAPI_API_TOKEN` | Create in Strapi → Settings → API Tokens (Read-only) |
| `STRAPI_ADMIN_URL` | `https://wikiwonder-cms.onrender.com/admin` |
| `REVALIDATE_SECRET` | Same value as Render |

Then redeploy Vercel.

## 5. Realtime wiki updates

When you **publish** a Wiki Page in Strapi:

1. Strapi lifecycle hook fires
2. `POST https://wikiwonder.vercel.app/api/revalidate?secret=...&slug=my-page`
3. Next.js clears cached pages
4. New content appears on the next request (seconds)

## 6. Admin shortcut on production wiki

Visit **https://wikiwonder.vercel.app/admin** — redirects to Strapi admin when `STRAPI_ADMIN_URL` is set.

## 7. Create API token in Strapi

1. Open Render CMS admin
2. **Settings → API Tokens → Create new API Token**
3. Name: `wikiwonder-vercel`, type: **Read-only**
4. Copy token → Vercel `STRAPI_API_TOKEN`

## Troubleshooting

| Issue | Fix |
|---|---|
| CMS won't start | Check Neon `DATABASE_URL`, all `APP_KEYS`/secrets set |
| Wiki shows sample pages only | Set `STRAPI_GRAPHQL_URL` + `STRAPI_API_TOKEN` on Vercel, redeploy |
| Changes not live | Verify `REVALIDATE_SECRET` matches on Render and Vercel |
| `/admin` on Vercel 503 | Set `STRAPI_ADMIN_URL` on Vercel |

**Security:** Rotate Neon credentials if they were exposed. Use Render/Vercel secret stores only.
