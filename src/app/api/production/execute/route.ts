import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/core/auth/session";
import { executeAIRequest, type AIExecutionResult } from "@/core/ai/ai-runtime";
import { executeProductionWithMetrics } from "@/core/production/execution";
import { apiLimiter, checkRateLimit } from "@/core/security/ratelimit";
import { logger } from "@/core/logger";

export async function POST(request: NextRequest) {
  try {
    const session = await requireUser();

    const workspaceId = request.headers.get("x-workspace-id");
    if (!workspaceId) {
      return NextResponse.json(
        { error: "x-workspace-id header required" },
        { status: 400 }
      );
    }

    const rateLimit = await checkRateLimit(apiLimiter, `production:${workspaceId}`);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many production executions. Please try again later.",
          retryAfter: Math.ceil(rateLimit.resetTime / 1000),
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      productionId,
      provider = "openai",
      model = "gpt-4o",
      prompt,
      systemPrompt,
      maxTokens,
      temperature,
      workflowType = "Custom Workflow",
    } = body;

    if (!productionId) {
      return NextResponse.json(
        { error: "productionId is required" },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "prompt is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const result = await executeProductionWithMetrics(
      {
        productionId,
        workspaceId,
        userId: session.user.id,
        aiModel: model,
        workflowType,
      },
      async () => {
        const aiResult: AIExecutionResult = await executeAIRequest({
          provider,
          model,
          prompt: prompt.trim(),
          workspaceId,
          userId: session.user.id,
          options: {
            maxTokens,
            temperature,
            systemPrompt,
          },
        });

        return {
          success: true,
          executionTimeMs: aiResult.duration,
          inputTokens: aiResult.usage.promptTokens,
          outputTokens: aiResult.usage.completionTokens,
          costUsd: aiResult.cost.toFixed(6),
          metadata: {
            executionId: aiResult.id,
            provider: aiResult.provider,
            model: aiResult.model,
            content: aiResult.content,
            totalTokens: aiResult.usage.totalTokens,
          },
        };
      }
    );

    return NextResponse.json(
      {
        success: result.success,
        result,
        message: result.success
          ? "Production executed successfully"
          : "Production execution failed",
      },
      {
        status: result.success ? 200 : 400,
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    logger.error("Production execution error:", error instanceof Error ? error : undefined);

    const message =
      error instanceof Error ? error.message : "Production execution failed";

    if (message.includes("Insufficient credits")) {
      return NextResponse.json({ error: message }, { status: 402 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
