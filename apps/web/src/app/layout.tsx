import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "My App";
const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? "A production-grade TypeScript React application";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:9000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  authors: [{ name: process.env.NEXT_PUBLIC_AUTHOR ?? "Author" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
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
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
