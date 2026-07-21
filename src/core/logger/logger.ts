export type LogLevel = "info" | "warn" | "error" | "security" | "audit";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export class Logger {
  private static instance: Logger;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
    };

    if (process.env.NODE_ENV === "production") {
      console.error(JSON.stringify(entry));
    } else {
      if (level === "warn") {
        console.warn(`[${level.toUpperCase()}] ${message}`, context ?? "");
      } else if (level === "error") {
        console.error(`[${level.toUpperCase()}] ${message}`, context ?? "");
      }
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log("error", message, {
      ...context,
      error: error?.message,
      stack: error?.stack,
    });
  }

  security(message: string, context?: Record<string, unknown>): void {
    this.log("security", message, context);
  }

  audit(message: string, context?: Record<string, unknown>): void {
    this.log("audit", message, context);
  }
}

export const logger = Logger.getInstance();
