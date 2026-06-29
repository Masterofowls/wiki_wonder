import type { MetadataRoute } from "next";

// Add your application's routes here.
// For dynamic routes (e.g. blog posts), fetch from your data source and
// spread the results into this array.
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:9000";
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    // ── Add routes below ─────────────────────────────────────────
    // {
    //   url: `${siteUrl}/about`,
    //   lastModified: now,
    //   changeFrequency: "monthly",
    //   priority: 0.8,
    // },
    // ── Dynamic routes example ───────────────────────────────────
    // ...posts.map((post) => ({
    //   url: `${siteUrl}/blog/${post.slug}`,
    //   lastModified: new Date(post.updatedAt),
    //   changeFrequency: "weekly" as const,
    //   priority: 0.7,
    // })),
  ];
}
