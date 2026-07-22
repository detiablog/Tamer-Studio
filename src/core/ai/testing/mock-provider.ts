import type { AIProviderAdapter, AIRequest, AIResponse, AIHealth, AIModel, AIProviderConfig } from "../providers/adapter";

export class MockProviderAdapter implements AIProviderAdapter {
  readonly providerType = "mock";
  private responses: AIResponse[] = [];
  private shouldFail = false;
  private failCount = 0;
  private currentFail = 0;

  setResponses(responses: AIResponse[]) {
    this.responses = responses;
  }
  setShouldFail(shouldFail: boolean, count = 1) {
    this.shouldFail = shouldFail;
    this.failCount = count;
    this.currentFail = 0;
  }

  async execute(request: AIRequest, _config: AIProviderConfig): Promise<AIResponse> {
    if (this.shouldFail && this.currentFail < this.failCount) {
      this.currentFail++;
      throw new Error("Mock provider failure");
    }
    const response = this.responses.shift();
    if (response) return response;
    return {
      id: `mock-${crypto.randomUUID()}`,
      model: request.model,
      provider: this.providerType,
      content: "mock response",
      createdAt: new Date().toISOString(),
    };
  }

  async *executeStream(_request: AIRequest, _config: AIProviderConfig): AsyncIterable<AIResponse> {
    yield await this.execute(_request, _config);
  }

  async healthCheck(): Promise<AIHealth> {
    return {
      providerId: "mock",
      status: "healthy",
      latencyMs: 10,
      availability: 1,
      lastChecked: new Date().toISOString(),
      errorCount: 0,
      retryCount: 0,
    };
  }

  async getModels(): Promise<AIModel[]> {
    return [];
  }

  async estimateCost(_request: AIRequest): Promise<number> {
    return 0.001;
  }
}
