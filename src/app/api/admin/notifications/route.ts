import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { adminAuthentication } from "@/core/middleware";
import type { RequestContext } from "@/core/middleware/types";
import { runMiddleware } from "@/core/middleware/compose";
import { db } from "@/lib/db";
import { notification } from "@/lib/db/schema/notification";
import { eq, desc, count, sql, and } from "drizzle-orm";

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

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const session = ctx.state.adminSession;
    if (!session?.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const conditions = [eq(notification.userId, session.adminId)];

    if (unreadOnly) {
      conditions.push(eq(notification.status, "queued"));
    }

    const notifications = await db
      .select()
      .from(notification)
      .where(and(...conditions))
      .orderBy(desc(notification.createdAt))
      .limit(limit)
      .offset(offset);

    const [unreadCountResult] = await db
      .select({ count: count() })
      .from(notification)
      .where(and(eq(notification.userId, session.adminId), eq(notification.status, "queued")));

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        category: n.category,
        status: n.status,
        priority: n.priority,
        createdAt: n.createdAt,
        read: n.status === "read" || n.status === "archived",
      })),
      unreadCount: unreadCountResult?.count ?? 0,
    });
  } catch (error) {
    console.error("[Admin Notifications] Error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
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
    method: "PATCH",
    pathname: request.nextUrl.pathname,
    ip: request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
  };

  const errorResponse = await runMiddleware([adminAuthentication()], ctx);
  if (errorResponse) return errorResponse;

  try {
    const session = ctx.state.adminSession;
    if (!session?.adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, id } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "Missing id or action" }, { status: 400 });
    }

    const allowedActions = ["read", "archive", "delete"];
    if (!allowedActions.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const existing = await db.select().from(notification).where(eq(notification.id, id)).limit(1);
    if (existing.length === 0 || existing[0].userId !== session.adminId) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    if (action === "read") {
      await db.update(notification).set({ status: "read", updatedAt: new Date() }).where(eq(notification.id, id));
    } else if (action === "archive") {
      await db.update(notification).set({ status: "archived", updatedAt: new Date() }).where(eq(notification.id, id));
    } else if (action === "delete") {
      await db.update(notification).set({ status: "deleted", updatedAt: new Date() }).where(eq(notification.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Notifications PATCH] Error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
