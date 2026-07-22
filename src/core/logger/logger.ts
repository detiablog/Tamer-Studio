export type LogLevel = "debug" | "info" | "warn" | "error" | "security" | "audit";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "secret",
  "authorization",
  "cookie",
  "csrf_token",
  "session",
  "access_token",
  "refresh_token",
  "id_token",
  "api_key",
  "masterKey",
]);

export function redactContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return undefined;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (SENSITIVE_KEYS.has(key)) {
      out[key] = "[REDACTED]";
    } else if (typeof value === "string" && value.length > 200) {
      out[key] = value.slice(0, 200) + "...[TRUNCATED]";
    } else {
      out[key] = value;
    }
  }
  return out;
}

type ConsoleLike = {
  debug: (msg: string, ...args: unknown[]) => void;
  log: (msg: string, ...args: unknown[]) => void;
  warn: (msg: string, ...args: unknown[]) => void;
  error: (msg: string, ...args: unknown[]) => void;
  info: (msg: string, ...args: unknown[]) => void;
};

let minLevel: LogLevel = "debug";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  security: 3,
  audit: 1,
};

export function setLogLevel(level: LogLevel): void {
  minLevel = level;
}

export function getLogLevel(): LogLevel {
  return minLevel;
}

let correlationId: string | undefined;

export function setCorrelationId(id: string): void {
  correlationId = id;
}

export function getCorrelationId(): string | undefined {
  return correlationId;
}

export function clearCorrelationId(): void {
  correlationId = undefined;
}

type TimingEntry = {
  start: number;
  label: string;
};

const timers = new Map<string, TimingEntry>();

export class Logger {
  private static instance: Logger;
  private console: ConsoleLike;

  private constructor() {
    this.console = console;
  }

  static getInstance(consoleOverride?: ConsoleLike): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    if (consoleOverride) {
      Logger.instance.console = consoleOverride;
    }
    return Logger.instance;
  }

  isEnabled(level: LogLevel): boolean {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[minLevel];
  }

  private emit(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!this.isEnabled(level)) return;

    const safeContext = redactContext(context);
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(safeContext && { context: safeContext }),
    };

    if (process.env.NODE_ENV === "production") {
      const payload = correlationId ? { ...entry, correlationId } : entry;
      this.console.error(JSON.stringify(payload));
      return;
    }

    const prefix = correlationId ? `[${correlationId.slice(0, 8)}] ` : "";
    const meta = safeContext && Object.keys(safeContext).length > 0 ? JSON.stringify(safeContext) : "";

    switch (level) {
      case "debug":
        this.console.debug(`${prefix}[${level.toUpperCase()}] ${message}`, meta || "");
        break;
      case "info":
        this.console.info(`${prefix}[${level.toUpperCase()}] ${message}`, meta || "");
        break;
      case "warn":
        this.console.warn(`${prefix}[${level.toUpperCase()}] ${message}`, meta || "");
        break;
      case "error":
        this.console.error(`${prefix}[${level.toUpperCase()}] ${message}`, meta || "");
        break;
      case "security":
        this.console.warn(`${prefix}[${level.toUpperCase()}] ${message}`, meta || "");
        break;
      case "audit":
        this.console.info(`${prefix}[${level.toUpperCase()}] ${message}`, meta || "");
        break;
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.emit("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.emit("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.emit("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const safeContext = context ? { ...context } : {};
    if (error) {
      safeContext.error = error.message;
      safeContext.stack = error.stack;
    }
    this.emit("error", message, safeContext);
  }

  security(message: string, context?: Record<string, unknown>): void {
    this.emit("security", message, context);
  }

  audit(message: string, context?: Record<string, unknown>): void {
    this.emit("audit", message, context);
  }

  time(label: string): void {
    timers.set(label, { start: Date.now(), label });
    this.debug("Timer started", { label });
  }

  timeEnd(label: string): void {
    const entry = timers.get(label);
    if (!entry) {
      this.warn("Timer not found", { label });
      return;
    }
    const durationMs = Date.now() - entry.start;
    timers.delete(label);
    this.debug("Timer ended", { label, durationMs });
    return;
  }

  timeEndAsync(label: string): number {
    const entry = timers.get(label);
    if (!entry) {
      return -1;
    }
    const durationMs = Date.now() - entry.start;
    timers.delete(label);
    this.debug("Timer ended (async)", { label, durationMs });
    return durationMs;
  }
}

export const logger = Logger.getInstance();
