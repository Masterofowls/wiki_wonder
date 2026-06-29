import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Ports can be overridden via environment variables.
// Change defaults in .env.local or template.config.json.
const WEB_PORT = Number(process.env.APP_PORT ?? 9000);
const SPA_PORT = Number(process.env.SPA_PORT ?? 9001);

export default defineConfig({
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
      // Update the target if your API runs elsewhere.
      "/api": {
        target: `http://localhost:${WEB_PORT}`,
        changeOrigin: true,
      },
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
        // Adjust chunk names to match your project's naming conventions.
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router"],
        },
      },
    },
  },

  define: {
    // __DEV__ is available in source code for debug-only code paths.
    __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
  },
});
