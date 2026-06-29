import "katex/dist/katex.min.css";
import { cn } from "@/lib/cn";

interface WikiContentProps {
  html: string;
  className?: string;
}

export function WikiContent({ html, className }: WikiContentProps) {
  return (
    <article
      className={cn(
        "wiki-content prose prose-neutral dark:prose-invert max-w-none",
        "prose-headings:scroll-mt-24 prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-pre:overflow-x-auto prose-img:rounded-lg",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
