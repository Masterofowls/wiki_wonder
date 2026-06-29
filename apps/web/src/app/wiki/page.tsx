import { WikiPreviewCard } from "@/components/wiki/wiki-preview-card";
import { listWikiPages } from "@/lib/wiki";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Wiki",
};

export default async function WikiIndexPage() {
  const pages = await listWikiPages(48);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Wiki Pages</h1>
        <p className="mt-2 text-muted-foreground">
          Browse {pages.length} pages. Use the search bar for instant autocomplete.
        </p>
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
    </div>
  );
}
