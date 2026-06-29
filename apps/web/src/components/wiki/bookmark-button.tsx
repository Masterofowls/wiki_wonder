"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarkStore } from "@/stores/wiki-store";

interface BookmarkButtonProps {
  slug: string;
  title: string;
}

export function BookmarkButton({ slug, title }: BookmarkButtonProps) {
  const { has, toggle } = useBookmarkStore();
  const saved = has(slug);

  return (
    <Button
      variant={saved ? "default" : "outline"}
      size="sm"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={saved ? `Remove bookmark for ${title}` : `Bookmark ${title}`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      {saved ? "Saved" : "Bookmark"}
    </Button>
  );
}
