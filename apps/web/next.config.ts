import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    typedRoutes: true,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    // Add remote image hostnames your app loads from:
    // { protocol: "https", hostname: "images.example.com" }
    remotePatterns: [],
  },

  async headers() {
    return [
      // ── Security headers — applied to every response ──────────
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },

      // ── Service Worker — must not be cached by the browser ────
      // Browsers cache SW files aggressively; force revalidation on
      // every page load so updates are picked up immediately.
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },

      // ── Web App Manifest — short cache, allow revalidation ────
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },

      // ── OG image — long-lived CDN cache ───────────────────────
      {
        source: "/opengraph-image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },

  // Workspace packages that Next.js needs to transpile.
  transpilePackages: ["@template/ui", "@template/utils"],
};

export default nextConfig;
