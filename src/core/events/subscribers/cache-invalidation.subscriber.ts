import { BaseEventSubscriber } from "@/core/events/event-subscriber";
import { getHomepageCache } from "@/core/homepage/homepage-cache";
import { getSEOCache } from "@/core/seo/seo-cache";
import { getNavigationCache } from "@/core/navigation/navigation-cache";
import { logger } from "@/core/logger/logger";
import type { Event, EventType } from "@/core/events/event";

const CACHE_INVALIDATION_EVENTS: EventType[] = [
  "cms.page.created",
  "cms.page.updated",
  "cms.page.deleted",
  "cms.section.created",
  "cms.section.updated",
  "cms.section.deleted",
  "cms.block.created",
  "cms.block.updated",
  "cms.block.deleted",
  "homepage.updated",
  "navigation.updated",
];

export class CacheInvalidationSubscriber extends BaseEventSubscriber {
  private homepageCache = getHomepageCache();
  private seoCache = getSEOCache();
  private navigationCache = getNavigationCache();

  constructor() {
    super();
  }

  initialize(): void {
    this.subscribe(CACHE_INVALIDATION_EVENTS, this.onEvent.bind(this));
    logger.info("CacheInvalidationSubscriber initialized", {
      events: CACHE_INVALIDATION_EVENTS,
    });
  }

  async onEvent(event: Event): Promise<void> {
    logger.info("Cache invalidation triggered", {
      eventType: event.type,
      eventId: event.id,
    });

    switch (event.type) {
      case "cms.page.created":
      case "cms.page.updated":
      case "cms.page.deleted":
        await this.invalidateHomepageAndSEO(event);
        break;

      case "cms.section.created":
      case "cms.section.updated":
      case "cms.section.deleted":
        await this.invalidateHomepageAndSEO(event);
        break;

      case "cms.block.created":
      case "cms.block.updated":
      case "cms.block.deleted":
        await this.invalidateHomepageAndSEO(event);
        break;

      case "homepage.updated":
        await this.invalidateHomepage(event);
        break;

      case "navigation.updated":
        await this.invalidateNavigation(event);
        break;
    }
  }

  private async invalidateHomepageAndSEO(event: Event): Promise<void> {
    const resourceId = event.payload.resourceId as string | undefined;
    const pageId = event.payload.pageId as string | undefined;

    if (resourceId) {
      await this.seoCache.invalidateByTag(`page:${resourceId}`);
    }
    if (pageId) {
      await this.seoCache.invalidateByTag(`page:${pageId}`);
    }

    await this.homepageCache.invalidateAll();

    logger.info("Homepage and SEO caches invalidated", {
      eventType: event.type,
      resourceId,
      pageId,
    });
  }

  private async invalidateHomepage(event: Event): Promise<void> {
    await this.homepageCache.invalidateAll();
    logger.info("Homepage cache invalidated", { eventType: event.type });
  }

  private async invalidateNavigation(event: Event): Promise<void> {
    await this.navigationCache.invalidateAll();
    logger.info("Navigation cache invalidated", { eventType: event.type });
  }
}

let cacheInvalidationSubscriberInstance: CacheInvalidationSubscriber | null = null;

export function getCacheInvalidationSubscriber(): CacheInvalidationSubscriber {
  if (!cacheInvalidationSubscriberInstance) {
    cacheInvalidationSubscriberInstance = new CacheInvalidationSubscriber();
  }
  return cacheInvalidationSubscriberInstance;
}

export function resetCacheInvalidationSubscriber(): void {
  if (cacheInvalidationSubscriberInstance) {
    cacheInvalidationSubscriberInstance.unsubscribe();
    cacheInvalidationSubscriberInstance = null;
  }
}
