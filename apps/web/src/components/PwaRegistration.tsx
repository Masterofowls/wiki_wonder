"use client";

import { useEffect } from "react";

/**
 * Registers the service worker for PWA support.
 * Mount this once in the root layout (client component boundary).
 *
 * The SW file lives at /public/sw.js and is served from the root path.
 * Set NEXT_PUBLIC_ENABLE_SW=false in .env.local to disable during development.
 */
export function PwaRegistration() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NEXT_PUBLIC_ENABLE_SW === "false"
    ) {
      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        // Check for updates every time the page is focused.
        const checkForUpdate = () => registration.update();
        window.addEventListener("focus", checkForUpdate);

        if (process.env.NODE_ENV === "development") {
          registration.addEventListener("updatefound", () => {
            console.debug("[SW] Update found — new service worker installing.");
          });
        }

        return () => window.removeEventListener("focus", checkForUpdate);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[SW] Registration failed:", err);
        }
      }
    };

    void register();
  }, []);

  return null;
}
