/**
 * Service worker registration helper.
 *
 * - Registers /sw.js in production (and optionally in dev).
 * - Checks for updates whenever the window regains focus.
 * - Prompts the user to reload when a new version is waiting.
 * - Exposes an `onUpdate` callback for custom UI (e.g. a "New version" toast).
 */

type SwUpdateCallback = (registration: ServiceWorkerRegistration) => void;

let updateCallback: SwUpdateCallback | undefined;

/**
 * Override the default reload-confirm with your own UI (e.g. a toast notification).
 * @public — intentionally exported for callers to customise update UX.
 */
export function onServiceWorkerUpdate(cb: SwUpdateCallback): void {
  updateCallback = cb;
}

export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;

  // Disable SW in development unless explicitly enabled.
  const enableInDev = import.meta.env.VITE_ENABLE_SW === "true";
  if (import.meta.env.DEV && !enableInDev) return;

  window.addEventListener("load", () => {
    void navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((registration) => {
        // Check for updates whenever the window is focused.
        window.addEventListener("focus", () => void registration.update());

        // Handle newly installed waiting worker.
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // A new version is ready. Notify via callback or default alert.
              if (updateCallback) {
                updateCallback(registration);
              } else {
                const reload = window.confirm(
                  "A new version of this app is available. Reload to update?",
                );
                if (reload) window.location.reload();
              }
            }
          });
        });
      })
      .catch((err) => {
        if (import.meta.env.DEV) {
          // biome-ignore lint/suspicious/noConsole: intentional dev-only warning
          console.warn("[SW] Registration failed:", err);
        }
      });
  });
}
