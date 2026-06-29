import { WikiPreviewCard } from "@/components/wiki/wiki-preview-card";
import { Badge } from "@/components/ui/badge";
import { listWikiPages } from "@/lib/wiki";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
};

const HIGHLIGHTS = [
  { title: "Instant Search", description: "Autocomplete across titles, summaries, and full page content." },
  { title: "Rich Markdown", description: "LaTeX, GFM tables, wiki links, diagrams, images, and video embeds." },
  { title: "Wikipedia Import", description: "Import and normalize articles with link validation." },
  { title: "Offline PWA", description: "Install WikiWonder and browse cached pages offline." },
  { title: "Strapi CMS", description: "Fast content authoring via GraphQL-connected Strapi backend." },
  { title: "Bookmarks", description: "Save pages locally and sync when authenticated." },
] as const;

export default async function HomePage() {
  const pages = await listWikiPages(6);

  return (
    <div className="space-y-12">
      <section className="space-y-6 text-center">
        <Badge variant="secondary" className="mx-auto">
          Advanced Modern Wiki
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">WikiWonder</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Full-featured wiki with instant search, rich markdown, Strapi CMS, Wikipedia import, and offline PWA —
          built on Next.js, Drizzle, and Supabase.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/wiki/welcome"
            className="inline-flex h-10 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Read Welcome Guide
          </Link>
          <Link
            href="/wiki"
            className="inline-flex h-10 items-center rounded-md border border-input px-6 text-sm font-medium hover:bg-accent"
          >
            Browse All Pages
          </Link>
        </div>
      </section>

      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="mb-6 text-2xl font-semibold">
          Features
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <article key={item.title} className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-2 font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-heading">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="recent-heading" className="text-2xl font-semibold">
            Recent Pages
          </h2>
          <Link href="/wiki" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <WikiPreviewCard
              key={page.id}
              slug={page.slug}
              title={page.title}
              summary={page.summary}
              sourceType={page.sourceType}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
