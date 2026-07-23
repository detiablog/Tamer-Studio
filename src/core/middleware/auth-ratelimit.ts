import { NextRequest, NextResponse } from "next/server";
import { authLimiter, checkRateLimit } from "@/core/security/ratelimit";

export async function authRateLimitMiddleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown";
  
  const rateLimit = await checkRateLimit(authLimiter, ip);

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: "Too many login attempts. Please try again later.",
        retryAfter: Math.ceil(rateLimit.resetTime / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(rateLimit.resetTime / 1000).toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", rateLimit.remaining.toString());
  response.headers.set("X-RateLimit-Reset", new Date(rateLimit.resetTime).toISOString());
  
  return response;
}
