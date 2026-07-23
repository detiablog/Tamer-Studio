import type { Middleware, RequestContext, SecurityError } from "./types";

interface OriginValidationConfig {
  allowedOrigins: string[];
  allowedHosts?: string[];
}

const DEFAULT_ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
];

export function originValidationMiddleware(config?: OriginValidationConfig): Middleware {
  return async (ctx: RequestContext): Promise<void | SecurityError> => {
    const origin = ctx.request.headers.get("origin");
    const host = ctx.request.headers.get("host");

    if (!origin && !host) {
      return;
    }

    const allowedOrigins = config?.allowedOrigins || DEFAULT_ALLOWED_ORIGINS;
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
