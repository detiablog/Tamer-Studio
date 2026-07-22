import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { checkRateLimit, getClientIdentifier } from "@/core/security/rate-limit";
import { recordFailedLogin } from "@/lib/auth/events";

const handler = toNextJsHandler(auth);

export async function GET(request: Request) {
  const identifier = getClientIdentifier(request);
  if (!checkRateLimit(`auth:get:${identifier}`, 30, 60000)) {
    return new Response("Too many requests", { status: 429 });
  }
  return handler.GET(request);
}

export async function POST(request: Request) {
  const identifier = getClientIdentifier(request);
  const limit = 5;
  const windowMs = 15 * 60 * 1000;

  if (!checkRateLimit(`auth:post:${identifier}`, limit, windowMs)) {
    return new Response("Too many authentication attempts. Please try again later.", { status: 429 });
  }

  const response = await handler.POST(request);

  if (response.status >= 400 && response.status < 500) {
    let reason = "unknown_error";
    try {
      const respClone = response.clone();
      const body = (await respClone.json()) as Record<string, unknown>;
      if (body && typeof body === "object" && "error" in body) {
        const errorBody = (body as { error?: { message?: string } }).error;
        if (errorBody?.message) {
          reason = errorBody.message;
        }
      }
    } catch {
      // unable to parse error body
    }

    recordFailedLogin({
      email: identifier,
      identifier,
      reason: reason.slice(0, 200),
      userAgent: request.headers.get("user-agent") ?? undefined,
      ipAddress: identifier === "unknown" ? undefined : identifier,
    }).catch(() => {});
  }

  return response;
}
