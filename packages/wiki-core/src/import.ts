import { slugifyTitle } from "./schemas";

export interface ImportedPage {
  title: string;
  slug: string;
  content: string;
  summary: string;
  sourceUrl: string;
  sourceType: "wikipedia" | "import";
}

function parseWikipediaTitle(titleOrUrl: string): string {
  if (titleOrUrl.includes("wikipedia.org")) {
    const segment = titleOrUrl.split("/wiki/").pop() ?? titleOrUrl;
    return decodeURIComponent(segment.replace(/_/g, " "));
  }
  return titleOrUrl.trim();
}

function wikitextToMarkdown(wikitext: string): string {
  return wikitext
    .replace(/^={2,}\s*(.+?)\s*={2,}$/gm, (_, title: string) => `## ${title.trim()}`)
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "[[$2|$1]]")
    .replace(/\[\[([^\]]+)\]\]/g, "[[$1]]")
    .replace(/'''(.+?)'''/g, "**$1**")
    .replace(/''(.+?)''/g, "*$1*")
    .replace(/^\*\s+/gm, "- ")
    .replace(/^#\s*REDIRECT\s*\[\[([^\]]+)\]\]/i, (_m, target: string) => `# Redirect\n\n→ [[${target}]]`);
}

function extractWikitext(pages: Record<string, { revisions?: Array<{ "*": string }> }>): string {
  const page = Object.values(pages)[0];
  return page?.revisions?.[0]?.["*"] ?? "";
}

export async function importFromWikipedia(titleOrUrl: string): Promise<ImportedPage> {
  const title = parseWikipediaTitle(titleOrUrl);
  const encoded = encodeURIComponent(title.replace(/ /g, "_"));

  const [summaryRes, contentRes] = await Promise.all([
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
      headers: { "User-Agent": "WikiWonder/0.1 (https://github.com/mrdan/wiki_wonder)" },
    }),
    fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&origin=*&titles=${encoded}`,
      { headers: { "User-Agent": "WikiWonder/0.1 (https://github.com/mrdan/wiki_wonder)" } },
    ),
  ]);

  if (!summaryRes.ok) {
    throw new Error(`Wikipedia page not found: ${title}`);
  }

  const summaryData = (await summaryRes.json()) as { title?: string; extract?: string };
  const contentData = (await contentRes.json()) as {
    query?: { pages?: Record<string, { revisions?: Array<{ "*": string }> }> };
  };

  const wikitext = extractWikitext(contentData.query?.pages ?? {});
  const pageTitle = summaryData.title ?? title;
  const slug = slugifyTitle(pageTitle);
  const sourceUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle).replace(/%20/g, "_")}`;

  return {
    title: pageTitle,
    slug,
    content: wikitextToMarkdown(wikitext),
    summary: (summaryData.extract ?? "").slice(0, 500),
    sourceUrl,
    sourceType: "wikipedia",
  };
}

export async function validateWikiLinks(content: string, existingSlugs: Set<string>): Promise<string[]> {
  const pattern = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const broken: string[] = [];

  for (const match of content.matchAll(pattern)) {
    const slug = slugifyTitle(match[1]?.trim() ?? "");
    if (slug && !existingSlugs.has(slug)) {
      broken.push(slug);
    }
  }

  return [...new Set(broken)];
}
