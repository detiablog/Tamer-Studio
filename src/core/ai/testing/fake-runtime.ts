import type { AIRuntime, AIRequest, RuntimeResult, RuntimeOptions, AIHealth } from "../runtime/types";

export class FakeRuntime implements AIRuntime {
  private responses: RuntimeResult[] = [];
  private nextResponse: RuntimeResult = { success: true, data: "fake" };

  setResponses(responses: RuntimeResult[]) {
    this.responses = responses;
  }
  setNextResponse(response: RuntimeResult) {
    this.nextResponse = response;
  }

  async execute<T = unknown>(_request: AIRequest, _options?: RuntimeOptions): Promise<RuntimeResult<T>> {
    const response = this.responses.shift() ?? this.nextResponse;
    return response as RuntimeResult<T>;
  }

  async *executeStream<T = unknown>(_request: AIRequest, _options?: RuntimeOptions): AsyncIterable<RuntimeResult<T>> {
    yield await this.execute<T>(_request, _options);
  }

  async cancel(_executionId: string): Promise<void> {}
  async getHealth(): Promise<AIHealth> {
    return {
      status: "healthy",
      providers: [],
      checkedAt: new Date().toISOString(),
    };
  }
}
