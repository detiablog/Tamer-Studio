import type { NodeMetadata, UIMetadata, NodeInputContract, NodeOutputContract, WorkflowNodeDefinition, SerializedNodeDefinition, NodeCategory } from "../types";

export class BaseWorkflowNodeDefinition implements WorkflowNodeDefinition {
  readonly id: string;
  readonly type: string;
  readonly category: NodeCategory;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly metadata: NodeMetadata;
  readonly inputContract: NodeInputContract[];
  readonly outputContract: NodeOutputContract[];
  readonly uiMetadata?: UIMetadata;

  constructor(params: {
    id: string;
    type: string;
    category: NodeCategory;
    name: string;
    description: string;
    version: string;
    metadata?: NodeMetadata;
    inputContract?: NodeInputContract[];
    outputContract?: NodeOutputContract[];
    uiMetadata?: UIMetadata;
  }) {
    this.id = params.id;
    this.type = params.type;
    this.category = params.category;
    this.name = params.name;
    this.description = params.description;
    this.version = params.version;
    this.metadata = params.metadata ?? {};
    this.inputContract = params.inputContract ?? [];
    this.outputContract = params.outputContract ?? [];
    this.uiMetadata = params.uiMetadata;
  }

  serialize(): SerializedNodeDefinition {
    return {
      id: this.id,
      type: this.type,
      category: this.category,
      name: this.name,
      description: this.description,
      version: this.version,
      metadata: this.metadata,
      inputContract: this.inputContract,
      outputContract: this.outputContract,
      uiMetadata: this.uiMetadata,
    };
  }

  clone(): WorkflowNodeDefinition {
    return new BaseWorkflowNodeDefinition({
      id: this.id,
      type: this.type,
      category: this.category,
      name: this.name,
      description: this.description,
      version: this.version,
      metadata: { ...this.metadata, tags: [...(this.metadata.tags ?? [])] },
      inputContract: this.inputContract.map((c) => ({ ...c })),
      outputContract: this.outputContract.map((c) => ({ ...c })),
      uiMetadata: this.uiMetadata ? { ...this.uiMetadata } : undefined,
    });
  }
}
