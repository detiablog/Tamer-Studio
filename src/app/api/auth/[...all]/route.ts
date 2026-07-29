import { auth } from "@/core/auth";
import { logger } from "@/core/logger";

export async function GET(request: Request) {
  const url = new URL(request.url);
  logger.debug("Auth GET", { pathname: url.pathname });
  
  try {
    const result = await auth.handler(request);
    logger.debug("Auth GET result", { status: result.status });
    return result;
  } catch (err) {
    logger.error("Auth GET error", err as Error);
    return new Response(JSON.stringify({ error: "auth_handler_error", message: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  logger.debug("Auth POST", { pathname: url.pathname });
  
  try {
    const result = await auth.handler(request);
    logger.debug("Auth POST result", { status: result.status });
    return result;
  } catch (err) {
    logger.error("Auth POST error", err as Error);
    return new Response(JSON.stringify({ error: "auth_handler_error", message: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
