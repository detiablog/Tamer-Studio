export interface FeatureFlag {
  id: string;
  key: string;
  description: string;
  enabled: boolean;
  scope: "global" | "workspace" | "user";
  targetId?: string;
  rolloutPercentage?: number;
  scheduledAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

export interface FeatureFlagInput {
  key: string;
  description: string;
  enabled: boolean;
  scope: "global" | "workspace" | "user";
  targetId?: string;
  rolloutPercentage?: number;
  scheduledAt?: Date;
  expiresAt?: Date;
}

export interface FeatureFlagEvaluation {
  flag: FeatureFlag;
  result: boolean;
  reason: string;
}
