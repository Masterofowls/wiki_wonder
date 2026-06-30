import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import withPWAInit from "@ducanh2912/next-pwa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_ENABLE_SW !== "true",
  register: true,
  fallbacks: {
    document: "/offline",
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../.."),
  typedRoutes: true,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
    ];
  },

  transpilePackages: ["@wikiwonder/ui", "@wikiwonder/utils", "@wikiwonder/db", "@wikiwonder/wiki-core"],
};

export default withPWA(nextConfig);
