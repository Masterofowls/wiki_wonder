/**
 * React Scan initialisation for the Vite SPA.
 *
 * Call `initReactScan()` before `createRoot()` in main.tsx to profile
 * component renders in development.
 *
 * Enable:  VITE_ENABLE_REACT_SCAN=true  in .env.local
 *
 * @see https://react-scan.com
 */
export async function initReactScan(): Promise<void> {
  if (!import.meta.env.DEV) return;
  if (import.meta.env.VITE_ENABLE_REACT_SCAN !== "true") return;

  const { scan } = await import("react-scan");
  scan({
    enabled: true,
    log: false,
    showToolbar: true,
    animationSpeed: "fast",
    trackUnnecessaryRenders: true,
  });
}
