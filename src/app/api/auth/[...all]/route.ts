import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { checkRateLimit, getClientIdentifier } from "@/core/security/rate-limit";

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

  return handler.POST(request);
}
