import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  console.log("[AUTH GET]", url.pathname);
  
  try {
    const result = await auth.handler(request);
    console.log("[AUTH GET] result status:", result.status);
    return result;
  } catch (err) {
    console.error("[AUTH GET] error:", err);
    return new Response(JSON.stringify({ error: "auth_handler_error", message: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  console.log("[AUTH POST]", url.pathname);
  
  try {
    const result = await auth.handler(request);
    console.log("[AUTH POST] result status:", result.status);
    return result;
  } catch (err) {
    console.error("[AUTH POST] error:", err);
    return new Response(JSON.stringify({ error: "auth_handler_error", message: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
