import { BrowserRouter, Link, Route, Routes } from "react-router";
import { AboutPage } from "./pages/AboutPage.js";
import { HomePage } from "./pages/HomePage.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";

// ── App name is driven by VITE_APP_NAME env var ──────────────────
const APP_NAME = import.meta.env.VITE_APP_NAME ?? "My App";

export function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <nav
            aria-label="Main navigation"
            className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
          >
            <Link
              to="/"
              className="text-lg font-bold text-slate-900 dark:text-white"
              aria-label="Home"
            >
              {APP_NAME}
            </Link>
            <ul className="flex list-none items-center gap-6">
              <li>
                <Link
                  to="/"
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <main id="main-content" className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>{APP_NAME} — built with TypeScript, React &amp; Vite</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
