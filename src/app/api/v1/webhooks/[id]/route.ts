import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withApiAuth } from "@/core/api-platform/api-auth-middleware";
import { successResponse } from "@/app/api/mappers/response";
import { mapErrorToResponse } from "@/app/api/mappers/error-mapper";
import { db } from "@/lib/db";
import { apiWebhook } from "@/lib/db/schema/api-platform";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const UpdateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await withApiAuth(request, "publish");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const userId = auth.keyRecord.userId;
    const existing = await db.select().from(apiWebhook).where(and(eq(apiWebhook.id, id), eq(apiWebhook.userId, userId))).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Webhook not found" } }, { status: 404 });
    }

    const body = await request.json();
    const parsed = UpdateWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details: { fieldErrors: parsed.error.flatten().fieldErrors } } }, { status: 422 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.url !== undefined) updateData.url = parsed.data.url;
    if (parsed.data.events !== undefined) updateData.events = parsed.data.events;
    if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

    const [updated] = await db.update(apiWebhook).set({ ...updateData, updatedAt: new Date() }).where(eq(apiWebhook.id, id)).returning();
    return NextResponse.json(successResponse(updated, "Webhook updated"));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await withApiAuth(request, "publish");
  if (!auth.authenticated) return NextResponse.json(auth.response, { status: 401 });

  try {
    const userId = auth.keyRecord.userId;
    const existing = await db.select().from(apiWebhook).where(and(eq(apiWebhook.id, id), eq(apiWebhook.userId, userId))).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: { code: "NOT_FOUND", message: "Webhook not found" } }, { status: 404 });
    }

    await db.delete(apiWebhook).where(eq(apiWebhook.id, id));
    return NextResponse.json(successResponse({ id }, "Webhook deleted"));
  } catch (error) {
    return mapErrorToResponse(error);
  }
}
