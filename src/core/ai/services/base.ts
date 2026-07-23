import type { AIRuntime, RuntimeResult, RuntimeOptions } from "../runtime";
import type { AIRequest, AIExecutionContext } from "../types";
import { generateExecutionId, generateRequestId } from "../utils";

export interface AIServiceContext {
  userId?: string;
  workspaceId?: string;
  projectId?: string;
  metadata?: Record<string, unknown>;
}

export class BaseAIService {
  constructor(protected runtime: AIRuntime) {}

  protected async execute<T>(
    capability: string,
    payload: Record<string, unknown>,
    context: Partial<AIExecutionContext> = {},
    options?: RuntimeOptions,
  ): Promise<RuntimeResult<T>> {
    const request: AIRequest = {
      id: generateRequestId(),
      capability,
      payload,
      context: Object.assign(
        {
          executionId: generateExecutionId(),
          requestId: generateRequestId(),
          startedAt: new Date().toISOString(),
        },
        context
      ) as AIExecutionContext,
      ...(options?.metadata ? { metadata: options.metadata } : {}),
    };

    return this.runtime.execute<T>(request, options);
  }

  protected async *executeStream<T>(
    capability: string,
    payload: Record<string, unknown>,
    context: Partial<AIExecutionContext> = {},
    options?: RuntimeOptions,
  ): AsyncIterable<RuntimeResult<T>> {
    const request: AIRequest = {
      id: generateRequestId(),
      capability,
      payload,
      context: Object.assign(
        {
          executionId: generateExecutionId(),
          requestId: generateRequestId(),
          startedAt: new Date().toISOString(),
        },
        context
      ) as AIExecutionContext,
      ...(options?.metadata ? { metadata: options.metadata } : {}),
    };

    yield* this.runtime.executeStream<T>(request, options);
  }
}
