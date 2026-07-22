export interface MockProvider {
  readonly id: string;
  readonly name: string;
  execute(request: MockRequest): Promise<MockResponse>;
  health(): Promise<{ status: string; latencyMs: number }>;
}

export interface MockRequest {
  readonly capability: string;
  readonly model?: string;
  readonly payload: Record<string, unknown>;
  readonly context: MockContext;
}

export interface MockContext {
  readonly requestId: string;
  readonly userId?: string;
  readonly workspaceId?: string;
  readonly startedAt: string;
}

export interface MockResponse {
  readonly status: string;
  readonly result?: Record<string, unknown>;
  readonly usage: {
    readonly estimatedCost: number;
    readonly currency: string;
  };
}

export interface FakeRuntime {
  readonly id: string;
  start(request: MockContext): Promise<string>;
  stop(executionId: string): Promise<void>;
  getStatus(executionId: string): Promise<string>;
  getResult(executionId: string): Promise<{ result?: Record<string, unknown> }>;
}

export interface AIExecutionHarness {
  setup(): Promise<void>;
  teardown(): Promise<void>;
  execute(input: MockRequest): Promise<MockResponse>;
  simulateFailure(error?: { code?: string; message?: string }): void;
  simulateLatency(ms: number): void;
}
