import type { NextConfig } from "next";

// ── Customise these settings for your project ──────────────────────────────
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    // typedRoutes enables compile-time checking of href values in <Link>.
    // Remove if you don't use typed routes.
    typedRoutes: true,
  },

  images: {
    formats: ["image/avif", "image/webp"],
    // Add your allowed remote image hostnames here.
    // Example: { protocol: "https", hostname: "images.example.com" }
    remotePatterns: [],
  },

  // Security headers applied to every response.
  // Tighten the CSP header once you know your actual domains/scripts.
  headers: async () => [
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
  ],

  // Packages that are internal workspaces — Next.js needs to transpile them.
  // Add/remove based on which packages your web app consumes.
  transpilePackages: ["@template/ui", "@template/utils"],
};

export default nextConfig;
