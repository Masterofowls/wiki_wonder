import { searchWikiPages } from "@/lib/wiki";
import { searchQuerySchema } from "@wikiwonder/wiki-core";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = searchQuerySchema.safeParse({
    q: searchParams.get("q") ?? "",
    limit: searchParams.get("limit") ?? 10,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
  }

  const pages = await searchWikiPages(parsed.data.q, parsed.data.limit);

  return NextResponse.json({
    results: pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      summary: page.summary,
    })),
    source: process.env.STRAPI_GRAPHQL_URL ? "strapi" : process.env.DATABASE_URL ? "database" : "sample",
  });
}
