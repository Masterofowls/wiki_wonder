import { describe, expect, it } from "@jest/globals";
import { cn } from "../../packages/utils/src/cn.js";
import {
  EnvValidationError,
  boolEnv,
  numberEnv,
  optionalEnv,
  requireEnv,
  validateEnv,
} from "../../packages/utils/src/env.js";

describe("cn()", () => {
  it("joins class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters falsy values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("handles numbers", () => {
    expect(cn("text", 1)).toBe("text 1");
  });

  it("handles nested arrays", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("returns empty string for all falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

describe("validateEnv()", () => {
  it("passes when all required vars are present", () => {
    const result = validateEnv<{ PORT: string }>({ PORT: { required: true } }, { PORT: "3000" });
    expect(result.PORT).toBe("3000");
  });

  it("throws EnvValidationError for missing required vars", () => {
    expect(() => validateEnv({ SECRET: { required: true } }, {})).toThrow(EnvValidationError);
  });

  it("uses default values for optional missing vars", () => {
    const result = validateEnv<{ PORT: string }>(
      { PORT: { required: false, default: "9000" } },
      {},
    );
    expect(result.PORT).toBe("9000");
  });

  it("error message lists missing keys", () => {
    try {
      validateEnv({ A: { required: true }, B: { required: true } }, {});
    } catch (err) {
      expect(err).toBeInstanceOf(EnvValidationError);
      if (err instanceof EnvValidationError) {
        expect(err.missing).toContain("A");
        expect(err.missing).toContain("B");
      }
    }
  });
});

describe("requireEnv()", () => {
  const original = process.env;
  beforeEach(() => {
    process.env = { ...original };
  });
  afterEach(() => {
    process.env = original;
  });

  it("returns value when env var exists", () => {
    process.env.TEST_VAR = "hello";
    expect(requireEnv("TEST_VAR")).toBe("hello");
  });

  it("throws when env var is missing", () => {
    delete process.env.MISSING_VAR;
    expect(() => requireEnv("MISSING_VAR")).toThrow(/MISSING_VAR/);
  });
});

describe("optionalEnv()", () => {
  it("returns env value if set", () => {
    process.env.OPT_VAR = "value";
    expect(optionalEnv("OPT_VAR", "default")).toBe("value");
    delete process.env.OPT_VAR;
  });

  it("returns fallback if not set", () => {
    delete process.env.OPT_VAR;
    expect(optionalEnv("OPT_VAR", "default")).toBe("default");
  });
});

describe("boolEnv()", () => {
  it('returns true for "true"', () => {
    process.env.BOOL_VAR = "true";
    expect(boolEnv("BOOL_VAR")).toBe(true);
    delete process.env.BOOL_VAR;
  });

  it('returns true for "1"', () => {
    process.env.BOOL_VAR = "1";
    expect(boolEnv("BOOL_VAR")).toBe(true);
    delete process.env.BOOL_VAR;
  });

  it("returns fallback if not set", () => {
    delete process.env.BOOL_VAR;
    expect(boolEnv("BOOL_VAR", true)).toBe(true);
  });
});

describe("numberEnv()", () => {
  it("parses a valid number", () => {
    process.env.NUM_VAR = "42";
    expect(numberEnv("NUM_VAR", 0)).toBe(42);
    delete process.env.NUM_VAR;
  });

  it("returns fallback when not set", () => {
    delete process.env.NUM_VAR;
    expect(numberEnv("NUM_VAR", 99)).toBe(99);
  });

  it("throws on invalid number string", () => {
    process.env.NUM_VAR = "not-a-number";
    expect(() => numberEnv("NUM_VAR", 0)).toThrow(/must be a number/);
    delete process.env.NUM_VAR;
  });
});
