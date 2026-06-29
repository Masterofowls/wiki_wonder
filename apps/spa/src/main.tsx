import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import { App } from "./App.js";

// Debug logging — only active in development
if (import.meta.env.DEV) {
  const appName = import.meta.env.VITE_APP_NAME ?? "App";
  // Use console only in dev — production builds strip this via Vite tree-shaking
  // biome-ignore lint/suspicious/noConsole: intentional dev-only log
  console.debug(`[${appName}] Starting in development mode`);
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element "#root" not found. Check your index.html file.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
