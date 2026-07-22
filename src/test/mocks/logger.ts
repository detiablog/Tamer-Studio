import type { LogEntry, LogLevel } from '@/core/logger/logger';

export class MockLogger {
  private logs: LogEntry[] = [];

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const safeContext = context ? { ...context } : {};
    if (error) {
      safeContext.error = error.message;
      safeContext.stack = error.stack;
    }
    this.log('error', message, safeContext);
  }

  security(message: string, context?: Record<string, unknown>): void {
    this.log('security', message, context);
  }

  audit(message: string, context?: Record<string, unknown>): void {
    this.log('audit', message, context);
  }

  time(label: string): void {
    this.log('debug', 'Timer started', { label });
  }

  timeEnd(label: string): void {
    this.log('debug', 'Timer ended', { label });
  }

  timeEndAsync(label: string): number {
    this.log('debug', 'Timer ended (async)', { label });
    return 0;
  }

  getLogs() {
    return this.logs;
  }

  clear() {
    this.logs = [];
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    this.logs.push({
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(context && Object.keys(context).length > 0 ? { context } : {}),
    });
  }
}
