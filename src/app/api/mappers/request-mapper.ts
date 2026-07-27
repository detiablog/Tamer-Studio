import type { NextRequest } from "next/server";

export function extractRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function extractClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export function extractUserAgent(request: NextRequest): string | undefined {
  return request.headers.get("user-agent") ?? undefined;
}