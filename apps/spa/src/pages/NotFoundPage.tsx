import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-6xl font-bold text-slate-200 dark:text-slate-700" aria-hidden="true">
        404
      </p>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mb-8 text-slate-500 dark:text-slate-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-blue-700"
      >
        Back to Home
      </Link>
    </div>
  );
}
