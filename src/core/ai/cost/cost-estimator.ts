import type { AIRequest } from "../types/domain";

export interface CostEstimator {
  estimate(request: AIRequest, model: string, provider: string): number;
}

export class DefaultCostEstimator implements CostEstimator {
  estimate(_request: AIRequest, _model: string, _provider: string): number {
    return 0.001;
  }
}
