import {
  checkRateLimit,
  getRateLimitRemaining,
  resetRateLimit,
  getClientIdentifier,
} from "@/core/security/rate-limit";
import type { Middleware, RequestContext, SecurityError } from "./types";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

const DEFAULT_RATE_LIMITS: Record<string, RateLimitConfig> = {
  "POST:/api/admin/auth/login": { windowMs: 15 * 60 * 1000, maxRequests: 5, keyPrefix: "admin:auth:login" },
  "POST:/api/admin": { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: "admin:api:write" },
  "GET:/api/admin": { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: "admin:api:read" },
  "POST:/api/user": { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: "user:api:write" },
  "GET:/api/user": { windowMs: 60 * 1000, maxRequests: 200, keyPrefix: "user:api:read" },
};

export function rateLimitMiddleware(config?: Partial<RateLimitConfig>): Middleware {
  return async (ctx: RequestContext): Promise<void | SecurityError> => {
    const method = ctx.request.method;
    const pathname = ctx.request.url.split("?")[0] ?? ctx.pathname;
    const routeKey = `${method}:${pathname}`;

    const limit = config 
      ? { ...DEFAULT_RATE_LIMITS["default"], ...config }
      : (DEFAULT_RATE_LIMITS[routeKey] || { 
          windowMs: 60 * 1000, 
          maxRequests: 100, 
          keyPrefix: `default:${method}:${pathname}` 
        });

    const identifier = getClientIdentifier(ctx.request);
    const key = `${limit.keyPrefix}:${identifier}`;

    const allowed = checkRateLimit(key, limit.maxRequests, limit.windowMs);
    if (!allowed) {
      return {
        status: 429,
        message: "Too many requests. Please try again later.",
        headers: {
          "Retry-After": Math.ceil(limit.windowMs / 1000).toString(),
          "X-RateLimit-Limit": limit.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
        },
      };
    }

    const remaining = getRateLimitRemaining(key);
    ctx.state.rateLimit = {
      limit: limit.maxRequests,
      remaining,
      reset: Date.now() + limit.windowMs,
    };
  };
}

export function resetClientRateLimit(identifier: string): void {
  resetRateLimit(identifier);
}
