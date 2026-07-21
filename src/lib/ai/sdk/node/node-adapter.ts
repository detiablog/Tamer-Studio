import type { WorkflowNode, NodeInput, NodeOutput, RetryPolicy } from "../../workflows/types";
import type { WorkflowNodeDefinition, NodeValueType, NodeCategory } from "../types";

export function workflowNodeToDefinition(node: WorkflowNode): WorkflowNodeDefinition {
  return {
    id: node.id,
    type: node.type,
    category: categorizeNodeType(node.type) as NodeCategory,
    name: node.name,
    description: "",
    version: "1.0.0",
    metadata: {
      tags: [],
    },
    inputContract: node.inputs.map((input) => ({
      name: input.name,
      type: mapInputType(input.type),
      required: input.required,
      defaultValue: undefined,
      description: undefined,
      validation: undefined,
      ui: undefined,
    })),
    outputContract: node.outputs.map((output) => ({
      name: output.name,
      type: mapInputType(output.type),
      description: undefined,
    })),
    serialize() {
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
    },
    clone() {
      return workflowNodeToDefinition({
        ...node,
        config: { ...node.config },
        inputs: node.inputs.map((i) => ({ ...i })),
        outputs: node.outputs.map((o) => ({ ...o })),
        dependsOn: [...node.dependsOn],
        retryPolicy: node.retryPolicy ? { ...node.retryPolicy } : undefined,
      });
    },
  };
}

function categorizeNodeType(type: string): NodeCategory {
  const map: Record<string, NodeCategory> = {
    prompt: "ai",
    image_generation: "ai",
    video_generation: "media",
    caption: "ai",
    translation: "ai",
    approval: "flow",
    publish: "publishing",
    export: "output",
    start: "flow",
    end: "flow",
    condition: "logic",
    merge: "flow",
    transform: "utility",
    variable: "utility",
    http_request: "input",
    storage_write: "storage",
    storage_read: "storage",
    media_generation: "media",
    media_edit: "media",
    custom: "utility",
  };
  return map[type] ?? "utility";
}

function mapInputType(type: string): NodeValueType {
  const map: Record<string, NodeValueType> = {
    string: "string",
    number: "number",
    boolean: "boolean",
    array: "array",
    object: "object",
    image: "image",
    video: "video",
    audio: "audio",
    document: "document",
    text: "text",
    binary: "binary",
    workflow_result: "workflow-result",
    any: "any",
  };
  return map[type] ?? "any";
}
