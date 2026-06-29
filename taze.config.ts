import { defineConfig } from "taze";

export default defineConfig({
  // Recursively check all workspace packages.
  recursive: true,

  // Write updates to package.json files. Set to false for dry-run / CI.
  write: false,

  // Ignore specific packages from updating.
  // Add packages you want to pin here.
  exclude: [],

  // Only include packages matching these patterns.
  // include: [],

  // Change mode: "default" | "major" | "minor" | "patch" | "latest"
  mode: "default",

  // Packages to treat as always needing a major-version bump (opt-in).
  // force: [],
});
