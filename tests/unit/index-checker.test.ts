import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "@jest/globals";
import { runIndexCheck } from "../../tools/index-check/src/checker.js";

function createTempDir(): string {
  return mkdtempSync(join(tmpdir(), "index-check-test-"));
}

describe("runIndexCheck()", () => {
  it("returns no issues for empty directory", () => {
    const dir = createTempDir();
    const result = runIndexCheck({
      path: dir,
      extensions: ["ts"],
      autoFix: false,
      excludePatterns: ["node_modules"],
      verbose: false,
    });
    expect(result.issues).toHaveLength(0);
  });

  it("detects missing index file", () => {
    const dir = createTempDir();
    const sub = join(dir, "components");
    mkdirSync(sub);
    writeFileSync(join(sub, "Button.ts"), "export const Button = () => {};");

    const result = runIndexCheck({
      path: dir,
      extensions: ["ts"],
      autoFix: false,
      excludePatterns: ["node_modules"],
      verbose: false,
    });

    expect(result.issues.some((i) => i.kind === "MISSING_INDEX")).toBe(true);
    expect(result.summary.missingIndex).toBeGreaterThan(0);
  });

  it("finds no issues when index exports all files", () => {
    const dir = createTempDir();
    writeFileSync(join(dir, "Button.ts"), "export const Button = () => {};");
    writeFileSync(join(dir, "index.ts"), 'export * from "./Button.js";\n');

    const result = runIndexCheck({
      path: dir,
      extensions: ["ts"],
      autoFix: false,
      excludePatterns: ["node_modules"],
      verbose: false,
    });

    const issues = result.issues.filter((i) => i.directory === ".");
    expect(issues).toHaveLength(0);
  });

  it("detects missing export in existing index", () => {
    const dir = createTempDir();
    writeFileSync(join(dir, "Button.ts"), "export const Button = () => {};");
    writeFileSync(join(dir, "Card.ts"), "export const Card = () => {};");
    writeFileSync(join(dir, "index.ts"), 'export * from "./Button.js";\n');

    const result = runIndexCheck({
      path: dir,
      extensions: ["ts"],
      autoFix: false,
      excludePatterns: ["node_modules"],
      verbose: false,
    });

    expect(result.issues.some((i) => i.kind === "MISSING_EXPORT")).toBe(true);
  });

  it("auto-creates index file when autoFix is true", () => {
    const dir = createTempDir();
    writeFileSync(join(dir, "utils.ts"), "export const helper = () => {};");

    const result = runIndexCheck({
      path: dir,
      extensions: ["ts"],
      autoFix: true,
      excludePatterns: ["node_modules"],
      verbose: false,
    });

    expect(result.autoFixed.length).toBeGreaterThan(0);
  });

  it("throws for nonexistent path", () => {
    expect(() =>
      runIndexCheck({
        path: "/nonexistent/path/that/does/not/exist",
        extensions: ["ts"],
        autoFix: false,
        excludePatterns: [],
        verbose: false,
      }),
    ).toThrow(/does not exist/);
  });
});
