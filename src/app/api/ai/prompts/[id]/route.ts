import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/core/auth/session";
import { promptService } from "@/core/ai/prompt.service";
import { logger } from "@/core/logger";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const body = await request.json();

    const updated = await promptService.updateTemplate(id, {
      ...body,
      userId: session.user.id,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Template not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error("Failed to update prompt template", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update prompt template" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await promptService.deleteTemplate(id);
    return NextResponse.json({ success: true, data: { message: "Template deleted" } });
  } catch (error) {
    logger.error("Failed to delete prompt template", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete prompt template" } },
      { status: 500 }
    );
  }
}
