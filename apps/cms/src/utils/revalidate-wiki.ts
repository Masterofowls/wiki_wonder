/**
 * Notify the Next.js wiki to revalidate cached pages after CMS changes.
 * Set REVALIDATE_URL + REVALIDATE_SECRET on Render (Strapi service).
 */
export async function notifyWikiRevalidate(slug?: string | null): Promise<void> {
  const baseUrl = process.env.REVALIDATE_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!baseUrl || !secret) {
    return;
  }

  const url = new URL(baseUrl);
  url.searchParams.set("secret", secret);
  if (slug) {
    url.searchParams.set("slug", slug);
  }

  try {
    const response = await fetch(url.toString(), { method: "POST" });
    if (!response.ok) {
      console.error(`[wiki-revalidate] failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("[wiki-revalidate] error:", error);
  }
}

export function extractSlug(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  if (typeof record.slug === "string") return record.slug;
  return null;
}
