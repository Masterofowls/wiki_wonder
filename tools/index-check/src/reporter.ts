import type { IndexCheckResult, IssueKind } from "./types.js";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";

const KIND_ICON: Record<IssueKind, string> = {
  MISSING_INDEX: `${RED}✗ MISSING INDEX${RESET}`,
  MISSING_EXPORT: `${YELLOW}⚠ MISSING EXPORT${RESET}`,
  STALE_EXPORT: `${CYAN}↻ STALE EXPORT${RESET}`,
  CIRCULAR_SUSPECTED: `${RED}⟲ CIRCULAR${RESET}`,
};

export function renderIndexCheckReport(result: IndexCheckResult, format: "table" | "json"): string {
  if (format === "json") {
    return JSON.stringify(result, null, 2);
  }

  const lines: string[] = [];
  lines.push("");
  lines.push(`${BOLD}Index Check Report${RESET}  ${DIM}${result.checkedAt}${RESET}`);
  lines.push(`${DIM}Path: ${result.rootPath}${RESET}`);
  lines.push(`${DIM}Directories scanned: ${result.directoriesScanned}${RESET}`);
  lines.push("─".repeat(80));

  if (result.issues.length === 0) {
    lines.push(`${GREEN}  ✓ All index files are complete and up-to-date.${RESET}`);
    lines.push("─".repeat(80));
    return lines.join("\n");
  }

  for (const issue of result.issues) {
    lines.push(`${KIND_ICON[issue.kind]}  ${issue.directory}`);
    lines.push(`  ${issue.message}`);
    if (issue.fixable && !result.autoFixed.length) {
      lines.push(`  ${DIM}Run with --auto-fix to resolve${RESET}`);
    }
    lines.push("");
  }

  if (result.autoFixed.length > 0) {
    lines.push("─".repeat(80));
    lines.push(`${GREEN}${BOLD}Auto-fixed:${RESET}`);
    for (const f of result.autoFixed) {
      lines.push(`  ${GREEN}✓${RESET} ${f}`);
    }
    lines.push("");
  }

  lines.push("─".repeat(80));
  const parts: string[] = [];
  if (result.summary.missingIndex > 0) {
    parts.push(`${RED}${result.summary.missingIndex} missing index${RESET}`);
  }
  if (result.summary.missingExport > 0) {
    parts.push(`${YELLOW}${result.summary.missingExport} missing export${RESET}`);
  }
  lines.push(
    `${BOLD}Summary:${RESET} ${parts.join("  ")}  |  Total: ${result.summary.totalIssues}`,
  );
  lines.push("");

  return lines.join("\n");
}
