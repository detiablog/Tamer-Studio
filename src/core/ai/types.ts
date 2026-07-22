export interface AIProviderConfig {
  providerType: "openai" | "anthropic" | "google" | "aws" | "azure" | "custom";
  baseUrl?: string;
  apiKey: string;
  name?: string;
}
