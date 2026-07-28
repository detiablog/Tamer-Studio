import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

// Login/Register: 5 requests per 15 minutes per IP
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "ratelimit:auth",
});

// API endpoints: 100 requests per minute per user
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:api",
});

// Production execution: 20 per hour per workspace
export const productionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: true,
  prefix: "ratelimit:production",
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
    console.error("Rate limit check failed:", error);
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
