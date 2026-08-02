import { describe, it, expect } from "vitest";

describe("Tamer Studio Smoke Tests", () => {
  it("should have valid package.json", async () => {
    const pkg = await import("../../package.json");
    expect(pkg.name).toBeDefined();
    expect(pkg.version).toBeDefined();
  });

  it("should have all required dependencies", async () => {
    const pkg = await import("../../package.json");
    expect(pkg.dependencies["next"]).toBeDefined();
    expect(pkg.dependencies["react"]).toBeDefined();
    expect(pkg.dependencies["swr"]).toBeDefined();
  });

  it("should export schema index without errors", async () => {
    const schema = await import("@/lib/db/schema");
    expect(schema).toBeDefined();
  });

  it("should export creative memory service", async () => {
    const { creativeMemoryService } = await import("@/core/creative-memory");
    expect(creativeMemoryService).toBeDefined();
    expect(typeof creativeMemoryService.listMemories).toBe("function");
  });

  it("should export orchestrator services", async () => {
    const { pipelineBuilderService } = await import("@/core/orchestrator");
    expect(pipelineBuilderService).toBeDefined();
  });

  it("should export automation services", async () => {
    const { ruleEngineService } = await import("@/core/automation");
    expect(ruleEngineService).toBeDefined();
  });

  it("should export AI gateway services", async () => {
    const { routingEngineService } = await import("@/core/ai-gateway");
    expect(routingEngineService).toBeDefined();
  });

  it("should export prompt intelligence services", async () => {
    const { promptAnalyzerService } = await import("@/core/prompt-intelligence");
    expect(promptAnalyzerService).toBeDefined();
  });

  it("should export quality assurance services", async () => {
    const { qualityOrchestratorService } = await import("@/core/quality-assurance");
    expect(qualityOrchestratorService).toBeDefined();
  });

  it("should export asset intelligence services", async () => {
    const { metadataService } = await import("@/core/asset-intelligence");
    expect(metadataService).toBeDefined();
  });

  it("should export learning engine services", async () => {
    const { learningCollectorService } = await import("@/core/learning-engine");
    expect(learningCollectorService).toBeDefined();
  });
});
