import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/core/auth/session";
import { generationHistoryService } from "@/core/ai/generation-history.service";
import { providerRouter } from "@/core/ai/provider-router";
import { executeAIRequest } from "@/core/ai/ai-runtime";
import { logger } from "@/core/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await requireUser();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await generationHistoryService.listHistory({
      userId: session.user.id,
      type,
      status,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (error) {
    logger.error("Failed to list AI jobs", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to list AI jobs" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const { provider: preferredProvider, model, prompt, type = "text_generation", parameters = {} } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "prompt is required" } },
        { status: 400 }
      );
    }

    if (!model || typeof model !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "model is required" } },
        { status: 400 }
      );
    }

    const decision = await providerRouter.selectProvider(type, preferredProvider);

    const record = await generationHistoryService.recordGeneration({
      userId: session.user.id,
      type,
      model,
      provider: decision.providerId,
      prompt: prompt.trim(),
      parameters,
      status: "running",
    });

    try {
      const startTime = Date.now();
      const result = await executeAIRequest({
        provider: decision.providerId,
        model,
        prompt: prompt.trim(),
        workspaceId: (session.user as any).workspaceId || "default",
        userId: session.user.id,
        options: {
          maxTokens: parameters.maxTokens as number | undefined,
          temperature: parameters.temperature as number | undefined,
          systemPrompt: parameters.systemPrompt as string | undefined,
        },
      });

      const executionTimeMs = Date.now() - startTime;
      await providerRouter.recordSuccess(decision.providerId, executionTimeMs);

      await generationHistoryService.updateGeneration(record.id, {
        status: "completed",
        executionTimeMs,
        creditsUsed: result.cost,
        inputTokens: result.usage.promptTokens,
        outputTokens: result.usage.completionTokens,
      });

      return NextResponse.json({
        success: true,
        data: {
          id: record.id,
          content: result.content,
          model: result.model,
          provider: result.provider,
          usage: result.usage,
          cost: result.cost,
          duration: result.duration,
        },
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      await providerRouter.recordFailure(decision.providerId, errorMsg);
      await generationHistoryService.updateGeneration(record.id, {
        status: "failed",
        error: errorMsg,
      });
      throw error;
    }
  } catch (error) {
    logger.error("Failed to submit AI job", error instanceof Error ? error : undefined);
    const message = error instanceof Error ? error.message : "Failed to submit AI job";
    if (message.includes("Insufficient credits")) {
      return NextResponse.json(
        { success: false, error: { code: "INSUFFICIENT_CREDITS", message } },
        { status: 402 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
