import type { AssetMetadata, PromptAssetData } from "./types";

export class PromptAsset {
  readonly id: string;
  readonly template: string;
  readonly variables: Record<string, unknown>;
  readonly compiledPrompt: string;
  readonly version: string;
  readonly metadata: AssetMetadata;

  constructor(data: PromptAssetData) {
    this.id = data.id;
    this.template = data.template;
    this.variables = { ...data.variables };
    this.compiledPrompt = data.compiledPrompt;
    this.version = data.version;
    this.metadata = data.metadata;
  }
}
