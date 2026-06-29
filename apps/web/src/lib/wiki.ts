import { createDb, wikiPages, type WikiPage } from "@wikiwonder/db";
import {
  fetchStrapiWikiPageBySlug,
  fetchStrapiWikiPages,
  isStrapiConfigured,
  searchStrapiWikiPages,
} from "@/lib/strapi";
import { eq } from "drizzle-orm";

const SAMPLE_PAGES: WikiPage[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "welcome",
    title: "Welcome to WikiWonder",
    summary: "Your advanced modern wiki with instant search, rich markdown, and offline PWA support.",
    content: `# Welcome to WikiWonder

WikiWonder is an **advanced modern wiki** built with Next.js, Strapi CMS, GraphQL, and Supabase.

## Features

- [[Instant Search]] with autocomplete
- Rich markdown with **LaTeX**, diagrams, and media blocks
- [[Wikipedia Import]] with automatic parsing
- Offline [[PWA]] support
- Username/password authentication (no email required)

Configure \`STRAPI_GRAPHQL_URL\` to load CMS-managed pages from Strapi.`,
    contentFormat: "markdown",
    sourceUrl: null,
    sourceType: "local",
    createdById: null,
    updatedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "getting-started",
    title: "Getting Started",
    summary: "Set up WikiWonder locally with Bun, Supabase, Strapi CMS, and Vercel.",
    content: `# Getting Started

1. Copy \`.env.example\` to \`.env.local\`
2. Start Strapi: \`npm run dev:cms\`
3. Configure \`STRAPI_GRAPHQL_URL\` and \`STRAPI_API_TOKEN\`
4. Run \`bun run dev:web\``,
    contentFormat: "markdown",
    sourceUrl: null,
    sourceType: "local",
    createdById: null,
    updatedById: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function getDbOrNull() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return createDb(url);
}

function mergePages(primary: WikiPage[], secondary: WikiPage[]): WikiPage[] {
  const bySlug = new Map<string, WikiPage>();
  for (const page of secondary) bySlug.set(page.slug, page);
  for (const page of primary) bySlug.set(page.slug, page);
  return [...bySlug.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function listWikiPages(limit = 24): Promise<WikiPage[]> {
  const strapiPages = isStrapiConfigured() ? await fetchStrapiWikiPages(limit) : [];

  const db = getDbOrNull();
  if (db) {
    try {
      const dbPages = await db.select().from(wikiPages).limit(limit);
      const merged = mergePages(strapiPages, dbPages);
      if (merged.length > 0) return merged.slice(0, limit);
    } catch {
      // fall through
    }
  }

  if (strapiPages.length > 0) return strapiPages.slice(0, limit);
  return SAMPLE_PAGES.slice(0, limit);
}

export async function getWikiPageBySlug(slug: string): Promise<WikiPage | null> {
  if (isStrapiConfigured()) {
    const strapiPage = await fetchStrapiWikiPageBySlug(slug);
    if (strapiPage) return strapiPage;
  }

  const db = getDbOrNull();
  if (db) {
    try {
      const [page] = await db.select().from(wikiPages).where(eq(wikiPages.slug, slug)).limit(1);
      if (page) return page;
    } catch {
      // fall through
    }
  }

  return SAMPLE_PAGES.find((p) => p.slug === slug) ?? null;
}

export async function searchWikiPages(query: string, limit = 10): Promise<WikiPage[]> {
  if (isStrapiConfigured()) {
    const results = await searchStrapiWikiPages(query, limit);
    if (results.length > 0) return results;
  }

  const pages = await listWikiPages(100);
  const term = query.toLowerCase();
  return pages
    .filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.summary?.toLowerCase().includes(term) ||
        p.content.toLowerCase().includes(term),
    )
    .slice(0, limit);
}
