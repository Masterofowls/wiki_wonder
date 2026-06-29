import { WikiContent } from "@/components/wiki/wiki-content";
import { BookmarkButton } from "@/components/wiki/bookmark-button";
import { Badge } from "@/components/ui/badge";
import { getWikiPageBySlug } from "@/lib/wiki";
import { renderMarkdownToHtml } from "@wikiwonder/wiki-core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface WikiPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: WikiPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getWikiPageBySlug(slug);
  if (!page) return { title: "Not Found" };

  return {
    title: page.title,
    description: page.summary ?? undefined,
    openGraph: {
      title: page.title,
      description: page.summary ?? undefined,
      type: "article",
    },
  };
}

export default async function WikiArticlePage({ params }: WikiPageProps) {
  const { slug } = await params;
  const page = await getWikiPageBySlug(slug);
  if (!page) notFound();

  const html = await renderMarkdownToHtml(page.content);

  return (
    <article className="space-y-6">
      <header className="space-y-4 border-b border-border pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{page.title}</h1>
            {page.summary && <p className="max-w-3xl text-lg text-muted-foreground">{page.summary}</p>}
          </div>
          <BookmarkButton slug={page.slug} title={page.title} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {page.sourceType && page.sourceType !== "local" && (
            <Badge variant="secondary" className="capitalize">
              {page.sourceType}
            </Badge>
          )}
          {page.sourceUrl && (
            <a
              href={page.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View source
            </a>
          )}
        </div>
      </header>

      <WikiContent html={html} />
    </article>
  );
}
