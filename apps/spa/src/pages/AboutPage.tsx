// ── Update this page content to match your project ──────────────────────────
export function AboutPage() {
  const appName = import.meta.env.VITE_APP_NAME ?? "My App";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-bold text-slate-900 dark:text-white">About {appName}</h1>
      <div className="space-y-4 text-slate-600 dark:text-slate-400">
        <p>
          This is the Vite SPA portion of the monorepo. It shares UI components and utilities with
          the Next.js application via workspace packages.
        </p>
        <p>Edit this page to describe your project's purpose, team, or tech choices.</p>
      </div>
    </div>
  );
}
