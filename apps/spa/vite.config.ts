import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load env vars so we can inject them into the HTML at build time.
  const env = loadEnv(mode, process.cwd(), "VITE_");

  const APP_NAME = env.VITE_APP_NAME ?? "My App";
  const APP_DESCRIPTION =
    env.VITE_APP_DESCRIPTION ?? "A production-grade TypeScript React application";
  const APP_URL = env.VITE_APP_URL ?? "https://example.com";
  const WEB_PORT = Number(env.VITE_WEB_PORT ?? 9000);
  const SPA_PORT = Number(env.VITE_PORT ?? 9001);

  return {
    plugins: [react()],

    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@template/ui": resolve(__dirname, "../../packages/ui/src/index.ts"),
        "@template/utils": resolve(__dirname, "../../packages/utils/src/index.ts"),
      },
    },

    server: {
      port: SPA_PORT,
      host: "0.0.0.0",
      strictPort: false,
      proxy: {
        // Proxy /api requests to the Next.js app during development.
        "/api": { target: `http://localhost:${WEB_PORT}`, changeOrigin: true },
      },
    },

    preview: {
      port: SPA_PORT,
      host: "0.0.0.0",
    },

    build: {
      outDir: "dist",
      sourcemap: true,
      rollupOptions: {
        output: {
          // Immutable chunk names — safe for long-term CDN caching.
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router"],
          },
        },
      },
    },

    // Inject app metadata into index.html placeholders at build time.
    // Corresponding %VITE_*% tokens in index.html are replaced automatically.
    define: {
      __DEV__: JSON.stringify(mode !== "production"),
      __APP_NAME__: JSON.stringify(APP_NAME),
      __APP_DESCRIPTION__: JSON.stringify(APP_DESCRIPTION),
      __APP_URL__: JSON.stringify(APP_URL),
    },
  };
});
