const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function cleanup() {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanup, 60000);

export function checkRateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function getRateLimitRemaining(identifier: string): number {
  const record = rateLimitStore.get(identifier);
  if (!record || Date.now() > record.resetTime) {
    return 100;
  }
  return Math.max(0, 100 - record.count);
}

export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
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

function getTrustedProxies(): string[] {
  const proxies = process.env.TRUSTED_PROXIES || "";
  return proxies.split(",").map((p) => p.trim()).filter(Boolean);
}

function isTrustedProxy(ip: string | null, trustedProxies: string[]): boolean {
  if (!ip) return false;
  return trustedProxies.some((proxy) => ip === proxy || ip.startsWith(proxy + "/") || ip.endsWith("/" + proxy));
}
