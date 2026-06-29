type LogLevel = "debug" | "info" | "warn" | "error";

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const COLORS: Record<LogLevel, string> = {
  debug: "\x1b[36m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

const RESET = "\x1b[0m";

function isNode(): boolean {
  return typeof process !== "undefined" && typeof process.env !== "undefined";
}

function currentLevel(): LogLevel {
  if (!isNode()) return "info";
  const envLevel = (process.env.LOG_LEVEL ?? "info").toLowerCase() as LogLevel;
  return LEVELS[envLevel] !== undefined ? envLevel : "info";
}

function buildMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const color = COLORS[level];
  const tag = `[${level.toUpperCase()}]`;
  const base = `${color}${timestamp} ${tag}${RESET} ${message}`;
  if (meta !== undefined) {
    return `${base} ${JSON.stringify(meta)}`;
  }
  return base;
}

export const logger = {
  debug(message: string, meta?: unknown): void {
    if (LEVELS[currentLevel()] <= LEVELS.debug) {
      process.stdout.write(`${buildMessage("debug", message, meta)}\n`);
    }
  },
  info(message: string, meta?: unknown): void {
    if (LEVELS[currentLevel()] <= LEVELS.info) {
      process.stdout.write(`${buildMessage("info", message, meta)}\n`);
    }
  },
  warn(message: string, meta?: unknown): void {
    if (LEVELS[currentLevel()] <= LEVELS.warn) {
      process.stderr.write(`${buildMessage("warn", message, meta)}\n`);
    }
  },
  error(message: string, meta?: unknown): void {
    if (LEVELS[currentLevel()] <= LEVELS.error) {
      process.stderr.write(`${buildMessage("error", message, meta)}\n`);
    }
  },
  child(prefix: string) {
    return {
      debug: (msg: string, meta?: unknown) => logger.debug(`[${prefix}] ${msg}`, meta),
      info: (msg: string, meta?: unknown) => logger.info(`[${prefix}] ${msg}`, meta),
      warn: (msg: string, meta?: unknown) => logger.warn(`[${prefix}] ${msg}`, meta),
      error: (msg: string, meta?: unknown) => logger.error(`[${prefix}] ${msg}`, meta),
    };
  },
};
