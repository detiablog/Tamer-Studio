import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { logger } from "@/core/logger";

let redisClient: Redis | null = null;
let authLimiterInstance: Ratelimit | null = null;
let apiLimiterInstance: Ratelimit | null = null;
let productionLimiterInstance: Ratelimit | null = null;

function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || "",
      token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    });
  }
  return redisClient;
}

export function getAuthLimiter(): Ratelimit {
  if (!authLimiterInstance) {
    authLimiterInstance = new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:auth",
    });
  }
  return authLimiterInstance;
}

export function getApiLimiter(): Ratelimit {
  if (!apiLimiterInstance) {
    apiLimiterInstance = new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(100, "1 m"),
      analytics: true,
      prefix: "ratelimit:api",
    });
  }
  return apiLimiterInstance;
}

export function getProductionLimiter(): Ratelimit {
  if (!productionLimiterInstance) {
    productionLimiterInstance = new Ratelimit({
      redis: getRedisClient(),
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      analytics: true,
      prefix: "ratelimit:production",
    });
  }
  return productionLimiterInstance;
}

// Backward compatibility - lazy getters
export const authLimiter = new Proxy({} as Ratelimit, {
  get(_, prop) {
    return (getAuthLimiter() as any)[prop];
  },
});

export const apiLimiter = new Proxy({} as Ratelimit, {
  get(_, prop) {
    return (getApiLimiter() as any)[prop];
  },
});

export const productionLimiter = new Proxy({} as Ratelimit, {
  get(_, prop) {
    return (getProductionLimiter() as any)[prop];
  },
});

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  try {
    const result = await limiter.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      resetTime: result.reset,
    };
  } catch (error) {
    logger.error("Rate limit check failed:", error instanceof Error ? error : undefined);
    // Fail open in case of Redis outage
    return { success: true, remaining: 1, resetTime: 0 };
  }
}

function getTrustedProxies(): string[] {
  const proxies = process.env.TRUSTED_PROXIES || "";
  return proxies.split(",").map((p) => p.trim()).filter(Boolean);
}

function isTrustedProxy(ip: string | null, trustedProxies: string[]): boolean {
  if (!ip) return false;
  return trustedProxies.some((proxy) => ip === proxy || ip.startsWith(proxy + "/") || ip.endsWith("/" + proxy));
}

export function getClientIdentifier(request: Request): string {
  const trustedProxies = getTrustedProxies();
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  const connectionIp = request.headers.get("x-real-ip") || forwarded?.split(",").pop()?.trim() || "unknown";
  const trusted = isTrustedProxy(connectionIp === "unknown" ? null : connectionIp, trustedProxies);

  if (cfConnectingIp) {
    return cfConnectingIp.split(",")[0].trim();
  }

  if (trusted) {
    if (vercelForwardedFor) {
      return vercelForwardedFor.split(",")[0].trim();
    }
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
  }

  if (realIp) {
    return realIp;
  }

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return "unknown";
}
