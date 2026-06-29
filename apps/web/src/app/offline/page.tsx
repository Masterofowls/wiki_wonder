import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 text-center">
      <div className="mb-6 text-6xl" role="img" aria-label="No internet connection">
        📡
      </div>
      <h1 className="mb-3 text-3xl font-bold text-white">You're offline</h1>
      <p className="mb-8 max-w-md text-slate-400">
        This page isn't available offline. Check your internet connection and try again.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Try again
      </Link>
    </div>
  );
}
