import { truncate } from "@/lib/utils.js";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
};

// ── Feature cards ─────────────────────────────────────────────────────────────
// Edit this array to showcase your project's own features.
const FEATURES = [
  {
    title: "Next.js 15",
    description: "App Router with Turbopack, Server Components, and streaming.",
    icon: "⚡",
  },
  {
    title: "TypeScript Strict",
    description: "noUncheckedIndexedAccess, noImplicitReturns, and more.",
    icon: "🔒",
  },
  {
    title: "Biome",
    description: "Blazing-fast linter and formatter — replaces ESLint + Prettier.",
    icon: "🌿",
  },
  {
    title: "Bun Workspaces",
    description: "Monorepo with fast installs and built-in test runner.",
    icon: "🐇",
  },
  {
    title: "CVE Lite CLI",
    description: "Scan dependencies for known vulnerabilities via OSV.dev.",
    icon: "🛡️",
  },
  {
    title: "Index Check CLI",
    description: "Validate barrel file completeness and detect missing exports.",
    icon: "🔍",
  },
] as const;

export default function HomePage() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "My App";
  const appDescription = truncate(
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ?? "A production-grade TypeScript React application",
    160,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <header className="mb-20 text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 ring-1 ring-blue-500/20">
            v{process.env.npm_package_version ?? "0.1.0"} — Production Ready
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-6xl">
            {appName}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">{appDescription}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/api/health"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Health Check →
            </Link>
            <a
              href="https://github.com"
              className="rounded-lg border border-slate-700 bg-slate-800/50 px-6 py-3 font-semibold text-white transition-colors hover:bg-slate-800"
            >
              View on GitHub
            </a>
          </div>
        </header>

        <section aria-labelledby="features-heading">
          <h2 id="features-heading" className="sr-only">
            Features
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 transition-colors hover:border-blue-500/30 hover:bg-slate-800/50"
              >
                <div className="mb-3 text-3xl" role="img" aria-label={feature.title}>
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
