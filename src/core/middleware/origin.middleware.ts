import type { Middleware, RequestContext, SecurityError } from "./types";

interface OriginValidationConfig {
  allowedOrigins: string[];
  allowedHosts?: string[];
}

function getAllowedOrigins(): string[] {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    throw new Error("NEXT_PUBLIC_APP_URL is required");
  }
  return [appUrl];
}

export function originValidationMiddleware(config?: OriginValidationConfig): Middleware {
  return async (ctx: RequestContext): Promise<void | SecurityError> => {
    const origin = ctx.request.headers.get("origin");
    const host = ctx.request.headers.get("host");

    if (!origin && !host) {
      return;
    }

    const allowedOrigins = config?.allowedOrigins || getAllowedOrigins();
    const allowedHosts = config?.allowedHosts || [];

    if (origin && !allowedOrigins.includes(origin)) {
      return {
        status: 403,
        message: "Origin not allowed",
      };
    }

    if (host && allowedHosts.length > 0 && !allowedHosts.includes(host)) {
      return {
        status: 403,
        message: "Host not allowed",
      };
    }

    ctx.state.origin = {
      host: host || null,
      origin: origin || null,
    };
  };
}
