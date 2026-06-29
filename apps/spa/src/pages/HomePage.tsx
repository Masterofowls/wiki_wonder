// ── Edit STACK_ITEMS to reflect your project's actual tech choices ───────────
const STACK_ITEMS = [
  { name: "Vite 6", desc: "Next-generation build tool with instant HMR" },
  { name: "React 19", desc: "Latest React with concurrent features" },
  { name: "TypeScript 5.7", desc: "Strict type checking across the codebase" },
  { name: "React Router 7", desc: "Declarative routing with data loading" },
  { name: "Biome", desc: "Unified linter and formatter" },
  { name: "Bun", desc: "Blazing-fast JavaScript runtime and package manager" },
] as const;

export function HomePage() {
  const appName = import.meta.env.VITE_APP_NAME ?? "My App";
  const description =
    import.meta.env.VITE_APP_DESCRIPTION ?? "A production-grade TypeScript React application";

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          {appName}
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg text-slate-600 dark:text-slate-400">
          {description}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://vite.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Vite Docs
          </a>
          <a
            href="https://react.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            React Docs
          </a>
        </div>
      </section>

      <section aria-labelledby="stack-heading" className="mt-16">
        <h2
          id="stack-heading"
          className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white"
        >
          Stack
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {STACK_ITEMS.map((item) => (
            <div
              key={item.name}
              className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <dt className="font-semibold text-slate-900 dark:text-white">{item.name}</dt>
              <dd className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.desc}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
