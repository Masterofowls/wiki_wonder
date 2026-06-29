import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";
import type { IndexCheckOptions, IndexCheckResult, IndexIssue } from "./types.js";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".next",
  "dist",
  "build",
  ".git",
  "coverage",
  ".turbo",
  ".cache",
]);

function isExportableFile(file: string, extensions: string[]): boolean {
  const ext = extname(file).slice(1);
  const base = basename(file, extname(file));
  return extensions.includes(ext) && base !== "index" && !base.startsWith(".");
}

function isIndexFile(file: string, extensions: string[]): boolean {
  const base = basename(file, extname(file));
  const ext = extname(file).slice(1);
  return base === "index" && extensions.includes(ext);
}

function parseExports(content: string): Set<string> {
  const exported = new Set<string>();
  const patterns = [
    /export\s+(?:const|function|class|interface|type|enum|let|var)\s+(\w+)/g,
    /export\s*\{([^}]+)\}/g,
    /export\s*\*\s+from\s+["']([^"']+)["']/g,
    /export\s+default\s+/g,
  ];

  for (const pattern of patterns) {
    const re = new RegExp(pattern.source, pattern.flags);
    let match = re.exec(content);
    while (match !== null) {
      if (match[1]) {
        for (const part of match[1].split(",")) {
          exported.add(
            part
              .trim()
              .split(/\s+as\s+/)[0]
              ?.trim() ?? "",
          );
        }
      } else {
        exported.add("*");
      }
      match = re.exec(content);
    }
  }

  return exported;
}

function scanDirectory(
  dir: string,
  options: IndexCheckOptions,
  issues: IndexIssue[],
  autoFixed: string[],
  rootPath: string,
): number {
  let count = 0;

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return count;
  }

  const shouldExclude = options.excludePatterns.some((pattern) => {
    const rel = relative(rootPath, dir);
    return rel.includes(pattern);
  });

  if (shouldExclude) return count;

  const exportableFiles = entries.filter(
    (f) =>
      !IGNORED_DIRS.has(f) &&
      statSync(join(dir, f)).isFile() &&
      isExportableFile(f, options.extensions),
  );

  const subDirs = entries.filter((f) => {
    if (IGNORED_DIRS.has(f)) return false;
    try {
      return statSync(join(dir, f)).isDirectory();
    } catch {
      return false;
    }
  });

  const hasIndexFile = entries.some(
    (f) => statSync(join(dir, f)).isFile() && isIndexFile(f, options.extensions),
  );

  if (exportableFiles.length > 0 && !hasIndexFile) {
    const rel = relative(rootPath, dir) || ".";
    issues.push({
      kind: "MISSING_INDEX",
      directory: rel,
      message: `Missing index file in "${rel}" (${exportableFiles.length} exportable file${exportableFiles.length > 1 ? "s" : ""})`,
      fixable: true,
    });

    if (options.autoFix) {
      const indexPath = join(dir, `index.${options.extensions[0] ?? "ts"}`);
      const lines = exportableFiles.map((f) => {
        const name = basename(f, extname(f));
        return `export * from "./${name}.js";`;
      });
      writeFileSync(indexPath, `${lines.join("\n")}\n`, "utf-8");
      autoFixed.push(relative(rootPath, indexPath));
    }

    count++;
  } else if (hasIndexFile && exportableFiles.length > 0) {
    const indexFile = entries.find(
      (f) => statSync(join(dir, f)).isFile() && isIndexFile(f, options.extensions),
    );

    if (indexFile) {
      const indexPath = join(dir, indexFile);
      const indexContent = readFileSync(indexPath, "utf-8");
      const rel = relative(rootPath, dir) || ".";

      for (const file of exportableFiles) {
        const name = basename(file, extname(file));
        const isReferenced =
          indexContent.includes(`"${name}"`) ||
          indexContent.includes(`'${name}'`) ||
          indexContent.includes(`./${name}`);

        if (!isReferenced) {
          const fileExports = parseExports(readFileSync(join(dir, file), "utf-8"));
          if (fileExports.size > 0) {
            issues.push({
              kind: "MISSING_EXPORT",
              directory: rel,
              file,
              message: `"${name}" is not re-exported from "${rel}/index"`,
              fixable: true,
            });

            if (options.autoFix) {
              const newLine = `export * from "./${name}.js";`;
              writeFileSync(indexPath, `${indexContent.trimEnd()}\n${newLine}\n`);
              autoFixed.push(relative(rootPath, indexPath));
            }

            count++;
          }
        }
      }
    }
  }

  for (const sub of subDirs) {
    count += scanDirectory(join(dir, sub), options, issues, autoFixed, rootPath);
  }

  return count + 1;
}

export function runIndexCheck(options: IndexCheckOptions): IndexCheckResult {
  const rootPath = resolve(options.path);

  if (!existsSync(rootPath)) {
    throw new Error(`Path does not exist: ${rootPath}`);
  }

  const issues: IndexIssue[] = [];
  const autoFixed: string[] = [];

  const directoriesScanned = scanDirectory(rootPath, options, issues, autoFixed, rootPath);

  const summary = {
    missingIndex: issues.filter((i) => i.kind === "MISSING_INDEX").length,
    missingExport: issues.filter((i) => i.kind === "MISSING_EXPORT").length,
    staleExport: issues.filter((i) => i.kind === "STALE_EXPORT").length,
    totalIssues: issues.length,
  };

  return {
    checkedAt: new Date().toISOString(),
    rootPath,
    directoriesScanned,
    issues,
    autoFixed,
    summary,
  };
}
