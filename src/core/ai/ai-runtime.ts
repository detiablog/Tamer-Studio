import { randomUUID } from "crypto";
import { logger } from "@/core/logger";
import { getProviderAdapter, getAvailableProviders, getAllModels, type AIProviderInfo } from "./provider-registry";
import { WalletService } from "@/core/wallet/service";
import { DefaultCreditEngine } from "@/core/credits/credits";
import { DefaultAuditRepository } from "@/core/audit/audit.repository";

export interface AIExecutionRequest {
  provider: string;
  model: string;
  prompt: string;
  workspaceId: string;
  userId: string;
  options?: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  };
}

export interface AIExecutionResult {
  id: string;
  content: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  duration: number;
}

export interface AIProvider {
  name: string;
  displayName: string;
  enabled: boolean;
  models: string[];
}

export interface AIModel {
  provider: string;
  model: string;
}

const walletService = new WalletService();
const creditEngine = new DefaultCreditEngine();
const auditRepo = new DefaultAuditRepository();

function convertCostToCredits(costUsd: number): number {
  return creditEngine.convertCostToCredits(costUsd, "USD");
}

export async function executeAIRequest(request: AIExecutionRequest): Promise<AIExecutionResult> {
  const executionId = randomUUID();
  const startTime = Date.now();

  logger.info("AI execution started", {
    executionId,
    provider: request.provider,
    model: request.model,
    workspaceId: request.workspaceId,
    userId: request.userId,
  });

  const adapter = getProviderAdapter(request.provider);

  const estimatedCostUsd = adapter.estimateCost({
    prompt: request.prompt,
    model: request.model,
    maxTokens: request.options?.maxTokens,
  });

  const estimatedCredits = convertCostToCredits(estimatedCostUsd);

  const wallet = await walletService.getOrCreateWallet(request.workspaceId);
  if (wallet.availableCredits < estimatedCredits) {
    throw new Error(
      `Insufficient credits: need ${estimatedCredits} credits (≈$${estimatedCostUsd.toFixed(4)}), have ${wallet.availableCredits}`
    );
  }

  await walletService.debit(
    wallet.id,
    request.workspaceId,
    estimatedCredits,
    "reserve",
    `AI execution reserve: ${request.provider}/${request.model}`,
    { executionId, provider: request.provider, model: request.model }
  );

  try {
    const result = await adapter.execute({
      prompt: request.prompt,
      model: request.model,
      systemPrompt: request.options?.systemPrompt,
      maxTokens: request.options?.maxTokens,
      temperature: request.options?.temperature,
    });

    const actualCostUsd = (result.usage.promptTokens * estimatedCostUsd) / Math.max(1, Math.ceil(request.prompt.length / 4));
    const outputCostUsd = (result.usage.completionTokens * estimatedCostUsd) / (request.options?.maxTokens ?? 1024);
    const totalCostUsd = actualCostUsd + outputCostUsd;
    const actualCredits = convertCostToCredits(totalCostUsd);

    const creditDifference = estimatedCredits - actualCredits;
    if (creditDifference > 0) {
      await walletService.debit(
        wallet.id,
        request.workspaceId,
        creditDifference,
        "release",
        `Release unused credits for execution ${executionId}`,
        { executionId }
      );
    } else if (creditDifference < 0) {
      await walletService.debit(
        wallet.id,
        request.workspaceId,
        Math.abs(creditDifference),
        "usage_debit",
        `Additional charges for execution ${executionId}`,
        { executionId, provider: request.provider, model: request.model }
      );
    }

    const aiResult: AIExecutionResult = {
      id: executionId,
      content: result.content,
      model: result.model,
      provider: request.provider,
      usage: result.usage,
      cost: totalCostUsd,
      duration: result.duration,
    };

    await auditRepo.createAuditEntry({
      action: "ai.execution.completed",
      actorId: request.userId,
      actorType: "user",
      resourceType: "ai_execution",
      resourceId: executionId,
      metadata: {
        provider: request.provider,
        model: request.model,
        workspaceId: request.workspaceId,
        tokensUsed: result.usage.totalTokens,
        costUsd: totalCostUsd,
        creditsCharged: actualCredits,
        durationMs: result.duration,
      },
    });

    logger.info("AI execution completed", {
      executionId,
      provider: request.provider,
      model: request.model,
      tokensUsed: result.usage.totalTokens,
      costUsd: totalCostUsd,
      durationMs: result.duration,
    });

    return aiResult;
  } catch (error) {
    await walletService.debit(
      wallet.id,
      request.workspaceId,
      estimatedCredits,
      "release",
      `Release reservation for failed execution ${executionId}`,
      { executionId }
    );

    await auditRepo.createAuditEntry({
      action: "ai.execution.failed",
      actorId: request.userId,
      actorType: "user",
      resourceType: "ai_execution",
      resourceId: executionId,
      metadata: {
        provider: request.provider,
        model: request.model,
        workspaceId: request.workspaceId,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    logger.error("AI execution failed", error instanceof Error ? error : new Error(String(error)), {
      executionId,
      provider: request.provider,
      model: request.model,
    });

    throw error;
  }
}

export function getAvailableAIProviders(): AIProvider[] {
  return getAvailableProviders();
}

export function getAvailableAIModels(): AIModel[] {
  return getAllModels();
}
