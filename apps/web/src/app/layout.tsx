import { PwaRegistration } from "@/components/PwaRegistration.js";
import { ReactScanMonitor } from "@/components/ReactScanMonitor.js";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "My App";
const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? "A production-grade TypeScript React application";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:9000";
const APP_AUTHOR = process.env.NEXT_PUBLIC_AUTHOR ?? "Author";
const OG_IMAGE_URL = `${APP_URL}/opengraph-image`;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  // ── Title ──────────────────────────────────────────────────────
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,

  // ── Authors & Creator ─────────────────────────────────────────
  authors: [{ name: APP_AUTHOR }],
  creator: APP_AUTHOR,
  publisher: APP_AUTHOR,

  // ── Keywords ─────────────────────────────────────────────────
  // Update keywords to reflect your project domain.
  keywords: ["typescript", "react", "nextjs", "web", "app"],

  // ── Canonical & alternates ────────────────────────────────────
  alternates: {
    canonical: APP_URL,
  },

  // ── Open Graph ────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — Open Graph image`,
        type: "image/png",
      },
    ],
  },

  // ── Twitter Card ─────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [OG_IMAGE_URL],
    // creator: "@your_twitter_handle",
  },

  // ── Robots ───────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── App / PWA ─────────────────────────────────────────────────
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },

  // ── Icons ─────────────────────────────────────────────────────
  // Add your own icons to /public/icons/ and update these paths.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains you'll load resources from */}
        {/* <link rel="preconnect" href="https://fonts.googleapis.com" /> */}
      </head>
      <body>
        <main id="main-content">{children}</main>
        {/* PWA service worker registration — client-side only */}
        <PwaRegistration />
        {/* React Scan — dev-only render profiler (NEXT_PUBLIC_ENABLE_REACT_SCAN=true) */}
        <ReactScanMonitor />
      </body>
    </html>
  );
}
