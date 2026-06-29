import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { App } from "./App.js";
import { registerServiceWorker } from "./utils/pwa.js";
import { initReactScan } from "./utils/react-scan.js";

if (import.meta.env.DEV) {
  const appName = import.meta.env.VITE_APP_NAME ?? "App";
  // biome-ignore lint/suspicious/noConsole: intentional dev-only log
  console.debug(`[${appName}] Starting in development mode`);
}

// React Scan must be initialised before createRoot to profile all renders.
// Controlled by VITE_ENABLE_REACT_SCAN=true in .env.local
await initReactScan();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element "#root" not found. Check your index.html file.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register the service worker after the app has rendered.
registerServiceWorker();
