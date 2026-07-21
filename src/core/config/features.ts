export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export const FEATURE_FLAGS = {
  KNOWLEDGE_GRAPH: "KNOWLEDGE_GRAPH",
  WORKFLOW_AUTOMATION: "WORKFLOW_AUTOMATION",
  ADVANCED_ANALYTICS: "ADVANCED_ANALYTICS",
  MULTI_PROVIDER_AI: "MULTI_PROVIDER_AI",
} as const;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const value = process.env[`FEATURE_${flag}`];
  return value === "true" || value === "1";
}

export function getEnabledFeatures(): FeatureFlag[] {
  return Object.keys(FEATURE_FLAGS).filter((key) => isFeatureEnabled(key as FeatureFlag)) as FeatureFlag[];
}
