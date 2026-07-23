import { describe, it, expect, vi } from "vitest";
import type { AIRuntime, RuntimeResult } from "@/core/ai/runtime/types";
import type { AIRequest } from "@/core/ai/types/domain";
import { BaseAIService } from "@/core/ai/services/base";

class TestableBaseAIService extends BaseAIService {
  async runExecute(request: AIRequest, options?: unknown): Promise<RuntimeResult> {
    return super.execute(request.capability, request.payload, request.context, options as never);
  }

  async *runExecuteStream(request: AIRequest, options?: unknown): AsyncIterable<RuntimeResult> {
    yield* super.executeStream(request.capability, request.payload, request.context, options as never);
  }
}

describe("BaseAIService", () => {
  it("delegates execute to runtime", async () => {
    const runtime = {
      execute: vi.fn().mockResolvedValue({ success: true, data: { result: "ok" } as unknown }),
    } as unknown as AIRuntime;

    const service = new TestableBaseAIService(runtime);
    const result = await service.runExecute({
      id: "req-1",
      capability: "test.capability",
      payload: { key: "value" },
      context: { executionId: "exec-1", requestId: "req-1", startedAt: new Date().toISOString() },
    });

    expect(result.success).toBe(true);
    expect(runtime.execute).toHaveBeenCalledTimes(1);
  });

  it("returns error when runtime fails", async () => {
    const runtime = {
      execute: vi.fn().mockResolvedValue({ success: false, error: { code: "test_error", message: "provider error" } }),
    } as unknown as AIRuntime;

    const service = new TestableBaseAIService(runtime);
    const result = await service.runExecute({
      id: "req-1",
      capability: "test.capability",
      payload: { key: "value" },
      context: { executionId: "exec-1", requestId: "req-1", startedAt: new Date().toISOString() },
    });

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe("provider error");
  });
});
