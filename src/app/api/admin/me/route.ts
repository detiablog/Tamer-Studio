import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { adminAuthentication } from "@/core/middleware";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { db } from "@/lib/db";
import { admin } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ctx: RequestContext = {
    request,
    params: {},
    state: {
      rateLimit: undefined,
      origin: undefined,
      adminSession: undefined,
      userSession: undefined,
      authError: undefined,
      permissionError: undefined,
      csrfError: undefined,
      rateLimitError: undefined,
      auditContext: undefined,
    },
    method: "GET",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication(true)], ctx);
  if (errorResponse) return errorResponse;

  try {
    const session = ctx.state.adminSession;

    if (session?.adminId) {
      const adminRecord = await db.select().from(admin).where(eq(admin.id, session.adminId)).limit(1);
      if (adminRecord.length > 0 && adminRecord[0].isActive) {
        const record = adminRecord[0];
        const initials = record.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
        return NextResponse.json({
          id: record.id,
          email: record.email,
          name: record.name,
          role: record.role,
          initials,
          isActive: record.isActive,
          lastLoginAt: record.lastLoginAt,
        });
      }
    }

    if (process.env.NODE_ENV === "development") {
      return NextResponse.json({
        id: "dev-admin",
        email: "admin@tamer.studio",
        name: "Admin User",
        role: "super_admin",
        initials: "AU",
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("[Admin Me] Error:", error);
    return NextResponse.json({ error: "Failed to fetch admin profile" }, { status: 500 });
  }
}
