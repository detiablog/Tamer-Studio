declare module "@trigger.dev/sdk/v3" {
  export const logger: {
    info(message: string, options?: Record<string, unknown>): void;
    error(message: string, options?: Record<string, unknown>): void;
    warn(message: string, options?: Record<string, unknown>): void;
    debug(message: string, options?: Record<string, unknown>): void;
  };

  export interface TaskConfig {
    id: string;
    run: () => Promise<unknown>;
    cron?: string;
  }

  export function task(config: TaskConfig): TaskConfig;
}
