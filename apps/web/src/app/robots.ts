import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:9000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Block internal Next.js and API paths from indexing.
        // Add more paths here if you have admin or private sections.
        disallow: ["/api/", "/_next/", "/admin/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
