import { logger } from "@/core/logger/logger";
import { eventBus } from "./event-bus";
import { EventLog } from "./event-log";
import {
  getCacheInvalidationSubscriber,
  resetCacheInvalidationSubscriber,
} from "./subscribers/cache-invalidation.subscriber";
import {
  getAuditLogSubscriber,
  resetAuditLogSubscriber,
} from "./subscribers/audit-log.subscriber";
import {
  getNotificationSubscriber,
  resetNotificationSubscriber,
} from "./subscribers/notification.subscriber";

let initialized = false;
const eventLog = new EventLog();

function setupEventLogging(): void {
  eventBus.subscribeAll((event) => {
    eventLog.append(event);
  });
}

export function initializeEventHub(): void {
  if (initialized) {
    logger.warn("EventHub already initialized, skipping");
    return;
  }

  logger.info("Initializing EventHub...");

  setupEventLogging();

  const cacheInvalidation = getCacheInvalidationSubscriber();
  cacheInvalidation.initialize();

  const auditLog = getAuditLogSubscriber();
  auditLog.initialize();

  const notification = getNotificationSubscriber();
  notification.initialize();

  initialized = true;

  logger.info("EventHub initialized successfully", {
    stats: eventBus.getStats(),
  });
}

export function shutdownEventHub(): void {
  if (!initialized) return;

  logger.info("Shutting down EventHub...");

  resetCacheInvalidationSubscriber();
  resetAuditLogSubscriber();
  resetNotificationSubscriber();

  eventLog.clear();

  initialized = false;

  logger.info("EventHub shut down successfully");
}

export function isEventHubInitialized(): boolean {
  return initialized;
}

export function getEventLog(): EventLog {
  return eventLog;
}
