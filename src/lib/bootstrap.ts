import { initializeEventHub, shutdownEventHub, isEventHubInitialized } from "@/core/events/event-hub";

let bootstrapPromise: Promise<void> | null = null;

export async function bootstrapEventRuntime(): Promise<void> {
  if (isEventHubInitialized()) {
    return;
  }

  if (bootstrapPromise) {
    return bootstrapPromise;
  }

  bootstrapPromise = (async () => {
    initializeEventHub();
  })();

  return bootstrapPromise;
}

export function teardownEventRuntime(): void {
  shutdownEventHub();
  bootstrapPromise = null;
}
