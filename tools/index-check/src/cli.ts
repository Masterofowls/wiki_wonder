#!/usr/bin/env bun
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { runIndexCheck } from "./checker.js";
import { renderIndexCheckReport } from "./reporter.js";
import type { IndexCheckOptions } from "./types.js";

const HELP_TEXT = `
Index Check — Barrel file and export completeness validator

USAGE
  index-check [options]

OPTIONS
  --path, -p        Root directory to scan (default: current directory)
  --ext, -e         Comma-separated extensions to check (default: ts,tsx)
  --auto-fix        Automatically create/update missing index files
  --exclude         Comma-separated patterns to exclude (default: node_modules,dist)
  --format, -f      Output format: table | json (default: table)
  --verbose, -v     Show verbose output
  --help, -h        Show this help message

EXAMPLES
  index-check                           Scan current directory
  index-check --path ./packages         Scan packages directory
  index-check --ext ts,tsx,js           Include JS files
  index-check --auto-fix                Create missing index files automatically
  index-check --format json             Output as JSON
  index-check --exclude test,__mocks__  Skip test directories
`;

async function main(): Promise<void> {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      path: { type: "string", short: "p", default: "." },
      ext: {
        type: "string",
        short: "e",
        default: process.env.INDEX_CHECK_EXTENSIONS ?? "ts,tsx",
      },
      "auto-fix": {
        type: "boolean",
        default: process.env.INDEX_CHECK_AUTO_FIX === "true",
      },
      exclude: { type: "string", default: "node_modules,dist,.next,build" },
      format: { type: "string", short: "f", default: "table" },
      verbose: { type: "boolean", short: "v", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
  });

  if (values.help) {
    console.log(HELP_TEXT);
    process.exit(0);
  }

  const format = (values.format ?? "table") as "table" | "json";
  if (format !== "table" && format !== "json") {
    console.error(`Invalid format "${format}". Use: table | json`);
    process.exit(1);
  }

  const options: IndexCheckOptions = {
    path: resolve(values.path ?? "."),
    extensions: (values.ext ?? "ts,tsx").split(",").map((e) => e.trim()),
    autoFix: values["auto-fix"] ?? false,
    excludePatterns: (values.exclude ?? "node_modules,dist").split(",").map((e) => e.trim()),
    verbose: values.verbose ?? false,
  };

  if (format === "table") {
    console.log(`\x1b[2mChecking index files in ${options.path}...\x1b[0m`);
    if (options.autoFix) {
      console.log("\x1b[33mAuto-fix enabled: missing index files will be created.\x1b[0m");
    }
  }

  try {
    const result = runIndexCheck(options);
    const report = renderIndexCheckReport(result, format);
    console.log(report);

    if (result.summary.totalIssues > 0 && !options.autoFix) {
      process.exit(1);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\x1b[31mError:\x1b[0m ${message}`);
    process.exit(1);
  }
}

main();
