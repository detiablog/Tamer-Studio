import { NextRequest, NextResponse } from "next/server";
import { getAvailableAIProviders, getAvailableAIModels } from "@/core/ai/ai-runtime";
import { logger } from "@/core/logger";

export async function GET(_request: NextRequest) {
  try {
    const providers = getAvailableAIProviders();
    const models = getAvailableAIModels();

    return NextResponse.json({
      providers,
      models,
      summary: {
        totalProviders: providers.length,
        connectedProviders: providers.filter((p) => p.enabled).length,
        totalModels: models.length,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch AI providers:", error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: "Failed to fetch AI providers" },
      { status: 500 }
    );
  }
}
