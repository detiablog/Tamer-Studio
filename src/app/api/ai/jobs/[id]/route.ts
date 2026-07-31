import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/core/auth/session";
import { generationHistoryService } from "@/core/ai/generation-history.service";
import { logger } from "@/core/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;

    const result = await generationHistoryService.listHistory({
      userId: session.user.id,
      page: 1,
      limit: 1,
    });

    const job = result.data.find((h) => h.id === id);
    if (!job) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Job not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    logger.error("Failed to get AI job", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to get AI job" } },
      { status: 500 }
    );
  }
}
