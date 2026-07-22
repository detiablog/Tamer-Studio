export interface TimeoutManager {
  wrap<T>(signal: AbortSignal | undefined, timeoutMs: number, fn: () => Promise<T>): Promise<T>;
  createTimeoutController(timeoutMs: number): { signal: AbortSignal; clear: () => void };
}

export class DefaultTimeoutManager implements TimeoutManager {
  wrap<T>(signal: AbortSignal | undefined, timeoutMs: number, fn: () => Promise<T>): Promise<T> {
    const controller = new AbortController();
    const combinedSignal = this.combineSignals(signal, controller.signal);

    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    return Promise.resolve()
      .then(() => fn())
      .catch((error) => {
        if (combinedSignal.aborted) {
          return Promise.reject(new Error("Operation timed out or was aborted"));
        }
        return Promise.reject(error);
      })
      .finally(() => {
        clearTimeout(timer);
      });
  }

  createTimeoutController(timeoutMs: number): { signal: AbortSignal; clear: () => void } {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    return {
      signal: controller.signal,
      clear: () => clearTimeout(timer),
    };
  }

  private combineSignals(a: AbortSignal | undefined, b: AbortSignal): AbortSignal {
    if (!a) return b;
    const controller = new AbortController();
    const abort = () => controller.abort();
    a.addEventListener("abort", abort, { once: true });
    b.addEventListener("abort", abort, { once: true });
    if (a.aborted || b.aborted) {
      controller.abort();
    }
    return controller.signal;
  }
}

export const defaultTimeoutManager = new DefaultTimeoutManager();
