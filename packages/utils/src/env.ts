type EnvSchema = Record<string, { required: boolean; default?: string }>;

export class EnvValidationError extends Error {
  constructor(public readonly missing: string[]) {
    super(`Missing required environment variables: ${missing.join(", ")}`);
    this.name = "EnvValidationError";
  }
}

export function validateEnv<T extends Record<string, string>>(
  schema: EnvSchema,
  source: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): T {
  const missing: string[] = [];
  const result: Record<string, string> = {};

  for (const [key, config] of Object.entries(schema)) {
    const value = source[key] ?? config.default;
    if (value === undefined || value === "") {
      if (config.required) {
        missing.push(key);
      }
    } else {
      result[key] = value;
    }
  }

  if (missing.length > 0) {
    throw new EnvValidationError(missing);
  }

  return result as T;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Required environment variable "${name}" is missing. Set it in your .env.local file or environment.`,
    );
  }
  return value;
}

export function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export function boolEnv(name: string, fallback = false): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "yes";
}

export function numberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable "${name}" must be a number, got "${value}"`);
  }
  return parsed;
}
