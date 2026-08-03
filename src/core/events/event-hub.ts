import { logger } from "@/core/logger/logger";
import { eventBus } from "./event-bus";
import { EventLog } from "./event-log";

let initialized = false;
let subscribersRegistered = false;
const eventLog = new EventLog();

function setupEventLogging(): void {
  eventBus.subscribeAll((event) => {
    eventLog.append(event);
  });
}

async function registerSubscribers(): Promise<void> {
  if (subscribersRegistered) return;
  subscribersRegistered = true;

  const [
    { getCacheInvalidationSubscriber },
    { getAuditLogSubscriber },
    { getNotificationSubscriber },
  ] = await Promise.all([
    import("./subscribers/cache-invalidation.subscriber"),
    import("./subscribers/audit-log.subscriber"),
    import("./subscribers/notification.subscriber"),
  ]);

  getCacheInvalidationSubscriber().initialize();
  getAuditLogSubscriber().initialize();
  getNotificationSubscriber().initialize();

  logger.info("EventHub subscribers registered", {
    stats: eventBus.getStats(),
  });
}

export function initializeEventHub(): void {
  if (initialized) {
    return;
  }

  initialized = true;

  setupEventLogging();
  registerSubscribers();
}

export function shutdownEventHub(): void {
  if (!initialized) return;

  logger.info("Shutting down EventHub...");

  eventLog.clear();

  initialized = false;
  subscribersRegistered = false;

  logger.info("EventHub shut down successfully");
}

export function isEventHubInitialized(): boolean {
  return initialized;
}

export function getEventLog(): EventLog {
  return eventLog;
}
