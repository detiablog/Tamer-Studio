import { executeProductionWithMetrics, streamProductionExecution, calculateProductionCost } from "@/core/production/execution";
import { OpenAI } from "openai";

/**
 * Production Service - Integrates AI providers with metrics recording
 * Supports: OpenAI, Claude, and custom models
 * All executions automatically record metrics to database
 */

// ============================================================================
// OPENAI INTEGRATION
// ============================================================================

export async function executeOpenAIProduction(
  config: {
    productionId: string;
    workspaceId: string;
    userId: string;
    prompt: string;
    model?: string;
  }
) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return executeProductionWithMetrics(
    {
      productionId: config.productionId,
      workspaceId: config.workspaceId,
      userId: config.userId,
      aiModel: config.model || "gpt-4",
      workflowType: "AI Generation",
    },
    async () => {
      const startTime = Date.now();

      try {
        const response = await client.chat.completions.create({
          model: config.model || "gpt-4",
          messages: [{ role: "user", content: config.prompt }],
          temperature: 1,
          max_tokens: 4096,
        });

        const executionTimeMs = Date.now() - startTime;
        const { prompt_tokens, completion_tokens } = response.usage || {};

        // Calculate cost using token usage
        const costUsd = calculateProductionCost(
          prompt_tokens || 0,
          completion_tokens || 0,
          config.model || "gpt-4"
        );

        return {
          success: true,
          executionTimeMs,
          inputTokens: prompt_tokens,
          outputTokens: completion_tokens,
          costUsd,
          metadata: {
            model: response.model,
            finishReason: response.choices[0]?.finish_reason,
            content: response.choices[0]?.message?.content?.slice(0, 200),
          },
        };
      } catch (error) {
        return {
          success: false,
          executionTimeMs: Date.now() - startTime,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );
}

// ============================================================================
// CLAUDE (ANTHROPIC) INTEGRATION
// ============================================================================

export async function executeClaudeProduction(
  config: {
    productionId: string;
    workspaceId: string;
    userId: string;
    prompt: string;
    model?: string;
  }
) {
  // Anthropic client setup
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable not set");
  }

  return executeProductionWithMetrics(
    {
      productionId: config.productionId,
      workspaceId: config.workspaceId,
      userId: config.userId,
      aiModel: config.model || "claude-3-opus",
      workflowType: "AI Generation",
    },
    async () => {
      const startTime = Date.now();

      try {
        // Note: This is a placeholder. Use actual Anthropic SDK when available
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicApiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: config.model || "claude-3-opus-20240229",
            max_tokens: 4096,
            messages: [{ role: "user", content: config.prompt }],
          }),
        });

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.statusText}`);
        }

        const data = (await response.json()) as any;
        const executionTimeMs = Date.now() - startTime;

        // Extract token counts
        const inputTokens = data.usage?.input_tokens || 0;
        const outputTokens = data.usage?.output_tokens || 0;

        const costUsd = calculateProductionCost(
          inputTokens,
          outputTokens,
          config.model || "claude-3-opus"
        );

        return {
          success: true,
          executionTimeMs,
          inputTokens,
          outputTokens,
          costUsd,
          metadata: {
            model: data.model,
            stopReason: data.stop_reason,
            content: data.content[0]?.text?.slice(0, 200),
          },
        };
      } catch (error) {
        return {
          success: false,
          executionTimeMs: Date.now() - startTime,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );
}

// ============================================================================
// GOOGLE GEMINI INTEGRATION
// ============================================================================

export async function executeGeminiProduction(
  config: {
    productionId: string;
    workspaceId: string;
    userId: string;
    prompt: string;
    model?: string;
  }
) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY environment variable not set");
  }

  return executeProductionWithMetrics(
    {
      productionId: config.productionId,
      workspaceId: config.workspaceId,
      userId: config.userId,
      aiModel: config.model || "gemini-1.5-pro",
      workflowType: "AI Generation",
    },
    async () => {
      const startTime = Date.now();

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${config.model || "gemini-1.5-pro"}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: config.prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                maxOutputTokens: 4096,
              },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_UNSPECIFIED",
                  threshold: "BLOCK_NONE",
                },
              ],
              apiKey,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = (await response.json()) as any;
        const executionTimeMs = Date.now() - startTime;

        // Estimate token usage (Gemini doesn't always provide exact counts)
        const inputTokens = Math.ceil(config.prompt.length / 4);
        const outputTokens = data.candidates?.[0]?.content?.parts?.[0]?.text
          ? Math.ceil(data.candidates[0].content.parts[0].text.length / 4)
          : 0;

        const costUsd = calculateProductionCost(
          inputTokens,
          outputTokens,
          config.model || "gemini-1.5-pro"
        );

        return {
          success: true,
          executionTimeMs,
          inputTokens,
          outputTokens,
          costUsd,
          metadata: {
            model: config.model || "gemini-1.5-pro",
            content: data.candidates?.[0]?.content?.parts?.[0]?.text?.slice(
              0,
              200
            ),
          },
        };
      } catch (error) {
        return {
          success: false,
          executionTimeMs: Date.now() - startTime,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );
}

// ============================================================================
// MULTI-MODEL ORCHESTRATOR
// ============================================================================

export async function executeProductionWithAI(config: {
  productionId: string;
  workspaceId: string;
  userId: string;
  aiProvider: "openai" | "claude" | "gemini";
  model?: string;
  prompt: string;
}) {
  switch (config.aiProvider) {
    case "openai":
      return executeOpenAIProduction({
        productionId: config.productionId,
        workspaceId: config.workspaceId,
        userId: config.userId,
        prompt: config.prompt,
        model: config.model,
      });

    case "claude":
      return executeClaudeProduction({
        productionId: config.productionId,
        workspaceId: config.workspaceId,
        userId: config.userId,
        prompt: config.prompt,
        model: config.model,
      });

    case "gemini":
      return executeGeminiProduction({
        productionId: config.productionId,
        workspaceId: config.workspaceId,
        userId: config.userId,
        prompt: config.prompt,
        model: config.model,
      });

    default:
      throw new Error(`Unknown AI provider: ${config.aiProvider}`);
  }
}

// ============================================================================
// STREAMING EXECUTION (Real-Time Progress)
// ============================================================================

export async function streamOpenAIProduction(
  config: {
    productionId: string;
    workspaceId: string;
    userId: string;
    prompt: string;
    model?: string;
  },
  onProgress: (update: {
    status: "started" | "running" | "completed" | "failed";
    progress: number;
    message: string;
  }) => void
) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return streamProductionExecution(
    {
      productionId: config.productionId,
      workspaceId: config.workspaceId,
      userId: config.userId,
      aiModel: config.model || "gpt-4",
      workflowType: "AI Generation",
    },
    async (onUpdate) => {
      const startTime = Date.now();

      try {
        onUpdate({
          status: "running",
          progress: 10,
          message: "Initializing OpenAI connection...",
        });

        const response = await client.chat.completions.create({
          model: config.model || "gpt-4",
          messages: [{ role: "user", content: config.prompt }],
          temperature: 1,
          max_tokens: 4096,
        });

        onUpdate({
          status: "running",
          progress: 75,
          message: "Processing response...",
        });

        const executionTimeMs = Date.now() - startTime;
        const { prompt_tokens, completion_tokens } = response.usage || {};

        const costUsd = calculateProductionCost(
          prompt_tokens || 0,
          completion_tokens || 0,
          config.model || "gpt-4"
        );

        onUpdate({
          status: "running",
          progress: 95,
          message: "Finalizing execution...",
        });

        return {
          success: true,
          executionTimeMs,
          inputTokens: prompt_tokens,
          outputTokens: completion_tokens,
          costUsd,
        };
      } catch (error) {
        const executionTimeMs = Date.now() - startTime;

        onUpdate({
          status: "failed",
          progress: 100,
          message: error instanceof Error ? error.message : "Execution failed",
        });

        return {
          success: false,
          executionTimeMs,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    onProgress
  );
}

// ============================================================================
// BATCH EXECUTION
// ============================================================================

export async function executeBatchProductions(
  configs: Array<{
    productionId: string;
    workspaceId: string;
    userId: string;
    aiProvider: "openai" | "claude" | "gemini";
    prompt: string;
    model?: string;
  }>
) {
  const results = [];

  for (const config of configs) {
    try {
      const result = await executeProductionWithAI(config);
      results.push({
        productionId: config.productionId,
        success: result.success,
        ...result,
      });
    } catch (error) {
      results.push({
        productionId: config.productionId,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Add small delay between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}

// ============================================================================
// MODEL AVAILABILITY CHECK
// ============================================================================

export async function checkAIModelAvailability() {
  const availability = {
    openai: false,
    claude: false,
    gemini: false,
  };

  // Check OpenAI
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    // Can make a simple API call to verify
    availability.openai = !!process.env.OPENAI_API_KEY;
  } catch {
    availability.openai = false;
  }

  // Check Claude
  availability.claude = !!process.env.ANTHROPIC_API_KEY;

  // Check Gemini
  availability.gemini = !!process.env.GOOGLE_API_KEY;

  return availability;
}
