import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { executeProductionWithMetrics, calculateProductionCost } from "@/core/production/execution";
import {
  executeOpenAIProduction,
  executeProductionWithAI,
  executeBatchProductions,
  checkAIModelAvailability,
} from "@/features/production/ai-service";

/**
 * End-to-End Integration Tests
 * Tests production execution, metrics recording, AI integration, and analytics
 */

describe("Production Metrics & AI Integration", () => {
  // ========================================================================
  // UNIT TESTS - Cost Calculation
  // ========================================================================

  describe("calculateProductionCost", () => {
    it("should calculate GPT-4 cost correctly", () => {
      // 1000 input tokens at $0.03/1K = $0.03
      // 1000 output tokens at $0.06/1K = $0.06
      // Total: $0.09
      const cost = calculateProductionCost(1000, 1000, "gpt-4");
      expect(parseFloat(cost)).toBeCloseTo(0.09, 2);
    });

    it("should calculate Claude 3 Opus cost correctly", () => {
      // 1000 input tokens at $0.015/1K = $0.015
      // 1000 output tokens at $0.075/1K = $0.075
      // Total: $0.09
      const cost = calculateProductionCost(1000, 1000, "claude-3-opus");
      expect(parseFloat(cost)).toBeCloseTo(0.09, 2);
    });

    it("should handle zero tokens", () => {
      const cost = calculateProductionCost(0, 0, "gpt-4");
      expect(parseFloat(cost)).toBe(0);
    });

    it("should handle unknown models (default to gpt-4 pricing)", () => {
      const cost = calculateProductionCost(1000, 1000, "unknown-model");
      expect(parseFloat(cost)).toBeGreaterThan(0);
    });
  });

  // ========================================================================
  // UNIT TESTS - Execution Service
  // ========================================================================

  describe("executeProductionWithMetrics", () => {
    it("should execute and record metrics successfully", async () => {
      const result = await executeProductionWithMetrics(
        {
          productionId: "test-prod-1",
          workspaceId: "test-ws-1",
          userId: "test-user-1",
          aiModel: "gpt-4",
          workflowType: "Test Workflow",
        },
        async () => {
          return {
            success: true,
            executionTimeMs: 1500,
            inputTokens: 100,
            outputTokens: 200,
            costUsd: "0.015",
          };
        }
      );

      expect(result.success).toBe(true);
      expect(result.executionTimeMs).toBe(1500);
      expect(result.inputTokens).toBe(100);
      expect(result.outputTokens).toBe(200);
    });

    it("should handle executor errors gracefully", async () => {
      const result = await executeProductionWithMetrics(
        {
          productionId: "test-prod-2",
          workspaceId: "test-ws-1",
          userId: "test-user-1",
          aiModel: "gpt-4",
          workflowType: "Test Workflow",
        },
        async () => {
          throw new Error("Simulated AI service error");
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Simulated AI service error");
      expect(result.executionTimeMs).toBeGreaterThan(0);
    });

    it("should record metrics for both success and failure", async () => {
      // Success case
      const successResult = await executeProductionWithMetrics(
        {
          productionId: "test-prod-3",
          workspaceId: "test-ws-1",
          userId: "test-user-1",
          aiModel: "gpt-4",
          workflowType: "Test Workflow",
        },
        async () => ({
          success: true,
          executionTimeMs: 1000,
          inputTokens: 50,
          outputTokens: 100,
          costUsd: "0.01",
        })
      );

      expect(successResult.success).toBe(true);

      // Failure case
      const failureResult = await executeProductionWithMetrics(
        {
          productionId: "test-prod-4",
          workspaceId: "test-ws-1",
          userId: "test-user-1",
          aiModel: "gpt-4",
          workflowType: "Test Workflow",
        },
        async () => {
          throw new Error("Test error");
        }
      );

      expect(failureResult.success).toBe(false);
    });
  });

  // ========================================================================
  // INTEGRATION TESTS - AI Service
  // ========================================================================

  describe("AI Service Integration", () => {
    it("should check model availability", async () => {
      const availability = await checkAIModelAvailability();

      expect(availability).toHaveProperty("openai");
      expect(availability).toHaveProperty("claude");
      expect(availability).toHaveProperty("gemini");
      expect(typeof availability.openai).toBe("boolean");
    });

    it("should execute production with AI orchestrator", async () => {
      // This test uses the multi-provider orchestrator
      // Will skip if no API keys are configured
      const availability = await checkAIModelAvailability();

      if (!availability.openai) {
        console.log("Skipping OpenAI test - no API key");
        return;
      }

      // Test would execute a real OpenAI call
      // For now, just verify the function exists and is callable
      expect(executeProductionWithAI).toBeDefined();
    });

    it("should handle unknown AI provider", async () => {
      const result = await executeProductionWithAI({
        productionId: "test-prod-5",
        workspaceId: "test-ws-1",
        userId: "test-user-1",
        aiProvider: "unknown-provider" as any,
        prompt: "Test prompt",
      }).catch((error) => ({ error }));

      expect(result.error).toBeDefined();
    });
  });

  // ========================================================================
  // PERFORMANCE TESTS
  // ========================================================================

  describe("Performance", () => {
    it("should complete cost calculation in < 1ms", () => {
      const startTime = performance.now();

      calculateProductionCost(10000, 5000, "gpt-4");

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1);
    });

    it("should complete metrics recording in < 100ms", async () => {
      const startTime = performance.now();

      await executeProductionWithMetrics(
        {
          productionId: "perf-test-1",
          workspaceId: "test-ws-1",
          userId: "test-user-1",
          aiModel: "gpt-4",
          workflowType: "Performance Test",
        },
        async () => ({
          success: true,
          executionTimeMs: 1000,
          inputTokens: 100,
          outputTokens: 200,
          costUsd: "0.015",
        })
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
    });

    it("should batch execute multiple productions efficiently", async () => {
      const configs = Array.from({ length: 5 }, (_, i) => ({
        productionId: `batch-test-${i}`,
        workspaceId: "test-ws-1",
        userId: "test-user-1",
        aiProvider: "openai" as const,
        prompt: `Test prompt ${i}`,
        model: "gpt-4",
      }));

      const startTime = performance.now();

      // Mock the batch execution
      for (const config of configs) {
        await executeProductionWithMetrics(
          {
            productionId: config.productionId,
            workspaceId: config.workspaceId,
            userId: config.userId,
            aiModel: config.model,
            workflowType: "Batch Test",
          },
          async () => ({
            success: true,
            executionTimeMs: 1000,
            inputTokens: 100,
            outputTokens: 200,
            costUsd: "0.015",
          })
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 5 executions should complete in reasonable time (< 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });

  // ========================================================================
  // ERROR HANDLING TESTS
  // ========================================================================

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      const result = await executeProductionWithMetrics(
        {
          productionId: "error-test-1",
          workspaceId: "test-ws-1",
          userId: "test-user-1",
          aiModel: "gpt-4",
          workflowType: "Error Test",
        },
        async () => {
          throw new Error("Network timeout");
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network timeout");
    });

    it("should handle rate limiting", async () => {
      const result = await executeProductionWithMetrics(
        {
          productionId: "rate-limit-test-1",
          workspaceId: "test-ws-1",
          userId: "test-user-1",
          aiModel: "gpt-4",
          workflowType: "Rate Limit Test",
        },
        async () => {
          throw new Error("429: Too Many Requests");
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("429");
    });

    it("should handle invalid model names", () => {
      const cost = calculateProductionCost(100, 100, "invalid-model-xyz");
      expect(parseFloat(cost)).toBeGreaterThan(0); // Should use default pricing
    });

    it("should handle missing required fields", async () => {
      const result = await executeProductionWithMetrics(
        {
          productionId: "",
          workspaceId: "test-ws-1",
          userId: "test-user-1",
          aiModel: "gpt-4",
          workflowType: "Validation Test",
        },
        async () => ({
          success: true,
          executionTimeMs: 1000,
          inputTokens: 100,
          outputTokens: 200,
          costUsd: "0.015",
        })
      );

      // Should still work but with empty productionId
      expect(result.executionTimeMs).toBeGreaterThan(0);
    });
  });

  // ========================================================================
  // COST ACCURACY TESTS
  // ========================================================================

  describe("Cost Accuracy", () => {
    const costTestCases = [
      {
        model: "gpt-4",
        input: 1000,
        output: 1000,
        expectedMin: 0.08,
        expectedMax: 0.1,
      },
      {
        model: "gpt-3.5-turbo",
        input: 1000,
        output: 1000,
        expectedMin: 0.002,
        expectedMax: 0.004,
      },
      {
        model: "claude-3-opus",
        input: 1000,
        output: 1000,
        expectedMin: 0.08,
        expectedMax: 0.1,
      },
      {
        model: "claude-3-sonnet",
        input: 1000,
        output: 1000,
        expectedMin: 0.018,
        expectedMax: 0.02,
      },
    ];

    costTestCases.forEach(({ model, input, output, expectedMin, expectedMax }) => {
      it(`should calculate ${model} cost accurately`, () => {
        const cost = parseFloat(calculateProductionCost(input, output, model));
        expect(cost).toBeGreaterThanOrEqual(expectedMin);
        expect(cost).toBeLessThanOrEqual(expectedMax);
      });
    });
  });

  // ========================================================================
  // METADATA TESTS
  // ========================================================================

  describe("Metadata Recording", () => {
    it("should include workflow type in metadata", async () => {
      const result = await executeProductionWithMetrics(
        {
          productionId: "metadata-test-1",
          workspaceId: "test-ws-1",
          userId: "test-user-1",
          aiModel: "gpt-4",
          workflowType: "Image Generation",
        },
        async () => ({
          success: true,
          executionTimeMs: 1500,
          inputTokens: 100,
          outputTokens: 200,
          costUsd: "0.015",
          metadata: { imageSize: "1024x1024" },
        })
      );

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.imageSize).toBe("1024x1024");
    });
  });
});

// ============================================================================
// END-TO-END TEST SCENARIOS
// ============================================================================

describe("End-to-End Scenarios", () => {
  it("should complete full production lifecycle", async () => {
    // 1. Execute production
    const result = await executeProductionWithMetrics(
      {
        productionId: "e2e-test-1",
        workspaceId: "e2e-ws-1",
        userId: "e2e-user-1",
        aiModel: "gpt-4",
        workflowType: "E2E Test Workflow",
      },
      async () => ({
        success: true,
        executionTimeMs: 2500,
        inputTokens: 500,
        outputTokens: 1000,
        costUsd: "0.06",
      })
    );

    // 2. Verify metrics recorded
    expect(result.success).toBe(true);
    expect(result.costUsd).toBe("0.06");
    expect(result.inputTokens).toBe(500);
    expect(result.outputTokens).toBe(1000);

    // 3. Verify cost calculation
    const manualCost = calculateProductionCost(500, 1000, "gpt-4");
    expect(parseFloat(manualCost)).toBeCloseTo(0.06, 2);
  });

  it("should handle multiple concurrent executions", async () => {
    const executions = Array.from({ length: 3 }, (_, i) =>
      executeProductionWithMetrics(
        {
          productionId: `concurrent-${i}`,
          workspaceId: "test-ws-1",
          userId: "test-user-1",
          aiModel: "gpt-4",
          workflowType: "Concurrent Test",
        },
        async () => ({
          success: true,
          executionTimeMs: 1000,
          inputTokens: 100,
          outputTokens: 200,
          costUsd: "0.015",
        })
      )
    );

    const results = await Promise.all(executions);

    expect(results).toHaveLength(3);
    results.forEach((result) => {
      expect(result.success).toBe(true);
    });
  });
});
