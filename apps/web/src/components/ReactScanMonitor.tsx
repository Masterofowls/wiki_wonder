"use client";

import { useEffect } from "react";

/**
 * Initialises React Scan in development.
 *
 * React Scan highlights components that re-render unnecessarily, making it
 * easy to spot performance bottlenecks without instrumentation overhead.
 *
 * Enable:  NEXT_PUBLIC_ENABLE_REACT_SCAN=true  in .env.local
 * Disable: Remove this component from layout.tsx (production builds are
 *          automatically a no-op because of the NODE_ENV guard below).
 *
 * @see https://react-scan.com
 */
export function ReactScanMonitor() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "development" ||
      process.env.NEXT_PUBLIC_ENABLE_REACT_SCAN !== "true"
    ) {
      return;
    }

    void import("react-scan").then(({ scan }) => {
      scan({
        enabled: true,
        log: false,
        showToolbar: true,
        animationSpeed: "fast",
        trackUnnecessaryRenders: true,
      });
    });
  }, []);

  return null;
}
