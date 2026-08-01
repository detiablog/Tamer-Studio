import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withApiAuth } from "@/core/api-platform/api-auth-middleware";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { db } from "@/lib/db";
import { apiWebhook } from "@/lib/db/schema/api-platform";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, "read:profile");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const userId = auth.keyRecord.userId;
    const hooks = await db.select().from(apiWebhook).where(eq(apiWebhook.userId, userId)).orderBy(desc(apiWebhook.createdAt));
    return NextResponse.json(successResponse(hooks));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const auth = await withApiAuth(request, "publish");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const userId = auth.keyRecord.userId;
    const body = await request.json();
    if (!body.url) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Webhook URL is required" } }, { status: 422 });
    }
    const id = `whk_${randomUUID()}`;
    const secret = `whsec_${randomUUID()}`;
    const [hook] = await db.insert(apiWebhook).values({
      id,
      userId,
      url: body.url,
      events: body.events || [],
      secret,
      isActive: true,
      metadata: {},
    }).returning();
    return NextResponse.json(successResponse(hook, "Webhook created"), { status: 201 });
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
