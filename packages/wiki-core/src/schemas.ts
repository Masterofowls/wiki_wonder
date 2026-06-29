import { z } from "zod";

export const wikiPageInputSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case"),
  summary: z.string().max(1000).optional(),
  content: z.string().default(""),
  sourceUrl: z.string().url().optional(),
  sourceType: z.enum(["local", "wikipedia", "import"]).default("local"),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const importSourceSchema = z.object({
  url: z.string().url(),
  source: z.enum(["wikipedia", "mediawiki"]).default("wikipedia"),
});

export type WikiPageInput = z.infer<typeof wikiPageInputSchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type ImportSource = z.infer<typeof importSourceSchema>;

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractWikiLinks(content: string): string[] {
  const links = new Set<string>();
  const bracketPattern = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const wikilinkPattern = /\[\[wiki:([^\]|]+)(?:\|[^\]]+)?\]\]/gi;

  for (const match of content.matchAll(bracketPattern)) {
    const target = match[1]?.trim();
    if (target) links.add(slugifyTitle(target));
  }

  for (const match of content.matchAll(wikilinkPattern)) {
    const target = match[1]?.trim();
    if (target) links.add(slugifyTitle(target));
  }

  return [...links];
}
