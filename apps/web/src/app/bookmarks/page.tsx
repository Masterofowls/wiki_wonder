"use client";

import Link from "next/link";
import { useBookmarkStore } from "@/stores/wiki-store";

export default function BookmarksPage() {
  const { slugs } = useBookmarkStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookmarks</h1>
        <p className="mt-2 text-muted-foreground">Pages saved locally in your browser.</p>
      </div>

      {slugs.length === 0 ? (
        <p className="text-muted-foreground">No bookmarks yet. Open a wiki page and click Bookmark.</p>
      ) : (
        <ul className="space-y-2">
          {slugs.map((slug) => (
            <li key={slug}>
              <Link href={`/wiki/${slug}`} className="text-primary hover:underline">
                {slug.replace(/-/g, " ")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
