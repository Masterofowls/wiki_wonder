import fs from "node:fs";
import path from "node:path";

const targets = [
  path.resolve(import.meta.dirname, "../apps/web/src"),
  path.resolve(import.meta.dirname, "../packages/db/src"),
  path.resolve(import.meta.dirname, "../packages/wiki-core/src"),
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.tsx?$/.test(entry.name)) {
      const content = fs.readFileSync(full, "utf8");
      const updated = content
        .replace(/(@\/[^'"\n;]+)\.js/g, "$1")
        .replace(/(\.\.?\/[^'"\n;]+)\.js/g, "$1");
      if (updated !== content) {
        fs.writeFileSync(full, updated);
        console.log(full);
      }
    }
  }
}

for (const target of targets) {
  walk(target);
}
