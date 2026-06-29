import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const exclude = new Set(["node_modules", ".git", ".next", "dist", "build", "coverage", "bun.lock"]);
const exts = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".toml",
  ".yml",
  ".yaml",
  ".md",
  ".sh",
  ".ps1",
  ".html",
  ".css",
  ".mjs",
]);

const replacements = [
  ["wiki-wonder", "wiki-wonder"],
  ["@wikiwonder/ui", "@wikiwonder/ui"],
  ["@wikiwonder/utils", "@wikiwonder/utils"],
  ["@wikiwonder/config", "@wikiwonder/config"],
  ["@wikiwonder/web", "@wikiwonder/web"],
  ["@wikiwonder/spa", "@wikiwonder/spa"],
  ["@wikiwonder/cve-lite", "@wikiwonder/cve-lite"],
  ["@wikiwonder/index-check", "@wikiwonder/index-check"],
  ["WikiWonder", "WikiWonder"],
  ["WikiWonder", "WikiWonder"],
  ["WikiWonder SPA", "WikiWonder SPA"],
  ["WikiWonder", "WikiWonder"],
  [
    "Advanced Modern Wiki — instant search, rich markdown, Strapi CMS, offline PWA, and Wikipedia import",
    "Advanced Modern Wiki — instant search, rich markdown, Strapi CMS, offline PWA, and Wikipedia import",
  ],
  [
    "Advanced Modern Wiki — instant search, rich markdown, Strapi CMS, offline PWA, and Wikipedia import",
    "Advanced Modern Wiki — instant search, rich markdown, Strapi CMS, offline PWA, and Wikipedia import",
  ],
  [
    "Advanced Modern Wiki with instant search, rich markdown, and offline PWA",
    "Advanced Modern Wiki with instant search, rich markdown, and offline PWA",
  ],
  ['"WikiWonder"', '"WikiWonder"'],
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (exclude.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (exts.has(path.extname(entry.name)) || entry.name.startsWith(".env")) {
      const content = fs.readFileSync(full, "utf8");
      let updated = content;
      for (const [old, neu] of replacements) {
        updated = updated.split(old).join(neu);
      }
      if (updated !== content) {
        fs.writeFileSync(full, updated);
        console.log("Updated:", path.relative(root, full));
      }
    }
  }
}

walk(root);

const spaDir = path.join(root, "apps", "spa");
if (fs.existsSync(spaDir)) {
  fs.rmSync(spaDir, { recursive: true, force: true });
  console.log("Removed apps/spa");
}

for (const f of ["template.config.json", "template.schema.json"]) {
  const p = path.join(root, f);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log("Removed", f);
  }
}

console.log("WikiWonder init complete");
