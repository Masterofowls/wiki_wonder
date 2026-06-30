import { GraphQLClient, gql } from "graphql-request";
import type { WikiPage } from "@wikiwonder/db";
import { unstable_cache } from "next/cache";

const STRAPI_GRAPHQL_URL = process.env.STRAPI_GRAPHQL_URL;
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;
export const WIKI_PAGES_CACHE_TAG = "wiki-pages";

export interface StrapiWikiPage {
  documentId: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  contentFormat?: string | null;
  sourceUrl?: string | null;
  sourceType?: string | null;
  updatedAt?: string | null;
}

let client: GraphQLClient | null = null;

export function isStrapiConfigured(): boolean {
  return Boolean(STRAPI_GRAPHQL_URL);
}

export function getStrapiClient() {
  if (!STRAPI_GRAPHQL_URL) {
    throw new Error("STRAPI_GRAPHQL_URL is not configured");
  }

  if (!client) {
    client = new GraphQLClient(STRAPI_GRAPHQL_URL, {
      headers: STRAPI_API_TOKEN ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` } : {},
    });
  }

  return client;
}

const WIKI_PAGES_QUERY = gql`
  query WikiPages($limit: Int) {
    wikiPages(pagination: { limit: $limit }, sort: ["updatedAt:desc"], status: PUBLISHED) {
      documentId
      title
      slug
      summary
      content
      contentFormat
      sourceUrl
      sourceType
      updatedAt
    }
  }
`;

const WIKI_PAGE_BY_SLUG_QUERY = gql`
  query WikiPageBySlug($slug: String!) {
    wikiPages(filters: { slug: { eq: $slug } }, status: PUBLISHED, pagination: { limit: 1 }) {
      documentId
      title
      slug
      summary
      content
      contentFormat
      sourceUrl
      sourceType
      updatedAt
    }
  }
`;

const WIKI_SEARCH_QUERY = gql`
  query WikiSearch($term: String!, $limit: Int) {
    wikiPages(
      filters: {
        or: [
          { title: { containsi: $term } }
          { summary: { containsi: $term } }
          { content: { containsi: $term } }
        ]
      }
      pagination: { limit: $limit }
      sort: ["updatedAt:desc"]
      status: PUBLISHED
    ) {
      documentId
      title
      slug
      summary
      updatedAt
    }
  }
`;

export function mapStrapiPageToWikiPage(page: StrapiWikiPage): WikiPage {
  return {
    id: page.documentId,
    slug: page.slug,
    title: page.title,
    summary: page.summary ?? null,
    content: page.content,
    contentFormat: page.contentFormat ?? "markdown",
    sourceUrl: page.sourceUrl ?? null,
    sourceType: page.sourceType ?? "strapi",
    createdById: null,
    updatedById: null,
    createdAt: page.updatedAt ? new Date(page.updatedAt) : new Date(),
    updatedAt: page.updatedAt ? new Date(page.updatedAt) : new Date(),
  };
}

async function fetchStrapiWikiPagesRaw(limit = 24): Promise<WikiPage[]> {
  if (!isStrapiConfigured()) return [];

  try {
    const data = await getStrapiClient().request<{ wikiPages: StrapiWikiPage[] }>(WIKI_PAGES_QUERY, {
      limit,
    });
    return (data.wikiPages ?? []).map(mapStrapiPageToWikiPage);
  } catch (error) {
    console.error("[strapi] fetchStrapiWikiPages failed:", error);
    return [];
  }
}

async function fetchStrapiWikiPageBySlugRaw(slug: string): Promise<WikiPage | null> {
  if (!isStrapiConfigured()) return null;

  try {
    const data = await getStrapiClient().request<{ wikiPages: StrapiWikiPage[] }>(
      WIKI_PAGE_BY_SLUG_QUERY,
      { slug },
    );
    const page = data.wikiPages?.[0];
    return page ? mapStrapiPageToWikiPage(page) : null;
  } catch (error) {
    console.error("[strapi] fetchStrapiWikiPageBySlug failed:", error);
    return null;
  }
}

async function searchStrapiWikiPagesRaw(term: string, limit = 10): Promise<WikiPage[]> {
  if (!isStrapiConfigured()) return [];

  try {
    const data = await getStrapiClient().request<{ wikiPages: StrapiWikiPage[] }>(WIKI_SEARCH_QUERY, {
      term,
      limit,
    });
    return (data.wikiPages ?? []).map(mapStrapiPageToWikiPage);
  } catch (error) {
    console.error("[strapi] searchStrapiWikiPages failed:", error);
    return [];
  }
}

const getCachedWikiPages = unstable_cache(
  async (limit: number) => fetchStrapiWikiPagesRaw(limit),
  ["strapi-wiki-pages"],
  { tags: [WIKI_PAGES_CACHE_TAG], revalidate: 3600 },
);

export async function fetchStrapiWikiPages(limit = 24): Promise<WikiPage[]> {
  if (!isStrapiConfigured()) return [];
  return getCachedWikiPages(limit);
}

export async function fetchStrapiWikiPageBySlug(slug: string): Promise<WikiPage | null> {
  if (!isStrapiConfigured()) return null;

  return unstable_cache(
    async () => fetchStrapiWikiPageBySlugRaw(slug),
    ["strapi-wiki-page", slug],
    { tags: [WIKI_PAGES_CACHE_TAG], revalidate: 3600 },
  )();
}

export async function searchStrapiWikiPages(term: string, limit = 10): Promise<WikiPage[]> {
  if (!isStrapiConfigured()) return [];
  return searchStrapiWikiPagesRaw(term, limit);
}
