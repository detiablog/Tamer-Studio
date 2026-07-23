import { NextRequest, NextResponse } from "next/server";
import { executeProductionWithMetrics, calculateProductionCost } from "@/core/production/execution";
import { recordUserActivity } from "@/core/analytics/aggregation";
import { apiLimiter, checkRateLimit } from "@/core/security/ratelimit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 productions per hour per workspace
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
      workspaceId: bodyWorkspaceId,
      userId,
      aiModel = "gpt-4",
      workflowType = "Custom Workflow",
      prompt,
      parameters,
    } = body;

    // Validate required fields
    if (!productionId || !userId) {
      return NextResponse.json(
        { error: "productionId and userId are required" },
        { status: 400 }
      );
    }

    // Verify workspace ID matches
    if (bodyWorkspaceId !== workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID mismatch" },
        { status: 403 }
      );
    }

    // Simulate production execution
    // In production, this would call actual AI APIs (OpenAI, Claude, etc.)
    const result = await executeProductionWithMetrics(
      {
        productionId,
        workspaceId,
        userId,
        aiModel,
        workflowType,
      },
      async () => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000));

        // Simulate token usage and cost
        const inputTokens = Math.floor(prompt?.length / 4) || 100;
        const outputTokens = Math.floor(Math.random() * 500) + 100;
        const costUsd = calculateProductionCost(inputTokens, outputTokens, aiModel);

        return {
          success: true,
          executionTimeMs: Math.random() * 2000 + 1000,
          inputTokens,
          outputTokens,
          costUsd,
          metadata: {
            aiModel,
            workflowType,
            parametersUsed: parameters ? Object.keys(parameters).length : 0,
          },
        };
      }
    );

    return NextResponse.json(
      {
        success: true,
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
    console.error("Production execution error:", error);
    return NextResponse.json(
      { error: "Production execution failed" },
      { status: 500 }
    );
  }
}
