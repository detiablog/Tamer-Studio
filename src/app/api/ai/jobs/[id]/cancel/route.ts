import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/core/auth/session";
import { generationHistoryService } from "@/core/ai/generation-history.service";
import { logger } from "@/core/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;

    const result = await generationHistoryService.listHistory({
      userId: session.user.id,
      page: 1,
      limit: 100,
    });

    const job = result.data.find((h) => h.id === id);
    if (!job) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Job not found" } },
        { status: 404 }
      );
    }

    if (job.status !== "running" && job.status !== "queued") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Job cannot be cancelled" } },
        { status: 400 }
      );
    }

    await generationHistoryService.updateGeneration(id, {
      status: "cancelled",
      error: "Cancelled by user",
    });

    return NextResponse.json({ success: true, data: { message: "Job cancelled" } });
  } catch (error) {
    logger.error("Failed to cancel AI job", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to cancel AI job" } },
      { status: 500 }
    );
  }
}
