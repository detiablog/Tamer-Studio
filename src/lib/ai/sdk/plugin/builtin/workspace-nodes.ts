import type { WorkflowNodeDefinition } from "../../types";
import { BaseWorkflowNodeDefinition } from "../../node/node-definition";

export function createWorkspaceNodes(): WorkflowNodeDefinition[] {
  return [
    new BaseWorkflowNodeDefinition({
      id: "workspace.asset.load",
      type: "workspace.asset.load",
      category: "storage",
      name: "Load Workspace Asset",
      description: "Loads an asset from the current workspace",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["storage", "workspace", "asset"],
        icon: "FolderOpen",
      },
      inputContract: [
        { name: "assetId", type: "string", required: true, description: "Asset identifier" },
        { name: "assetType", type: "string", required: false, defaultValue: "any", description: "Asset type filter" },
      ],
      outputContract: [
        { name: "asset", type: "object", description: "Loaded asset metadata" },
        { name: "url", type: "text", description: "Asset URL" },
      ],
    }),
    new BaseWorkflowNodeDefinition({
      id: "workspace.asset.save",
      type: "workspace.asset.save",
      category: "storage",
      name: "Save to Workspace",
      description: "Saves generated content as a workspace asset",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["storage", "workspace", "asset"],
        icon: "Save",
      },
      inputContract: [
        { name: "content", type: "binary", required: true, description: "Content to save" },
        { name: "name", type: "text", required: true, description: "Asset name" },
        { name: "type", type: "string", required: true, description: "Asset type (image, video, audio, document)" },
      ],
      outputContract: [
        { name: "assetId", type: "string", description: "Saved asset identifier" },
        { name: "url", type: "text", description: "Asset URL" },
      ],
    }),
    new BaseWorkflowNodeDefinition({
      id: "workspace.variable.set",
      type: "workspace.variable.set",
      category: "utility",
      name: "Set Variable",
      description: "Sets a workflow variable",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["utility", "variable"],
        icon: "Variable",
      },
      inputContract: [
        { name: "key", type: "text", required: true, description: "Variable name" },
        { name: "value", type: "any", required: true, description: "Variable value" },
      ],
      outputContract: [{ name: "set", type: "boolean", description: "Whether the variable was set" }],
    }),
    new BaseWorkflowNodeDefinition({
      id: "workspace.variable.get",
      type: "workspace.variable.get",
      category: "utility",
      name: "Get Variable",
      description: "Gets a workflow variable value",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["utility", "variable"],
        icon: "Variable",
      },
      inputContract: [
        { name: "key", type: "text", required: true, description: "Variable name" },
        { name: "defaultValue", type: "any", required: false, description: "Default value if not found" },
      ],
      outputContract: [
        { name: "value", type: "any", description: "Variable value" },
        { name: "found", type: "boolean", description: "Whether the variable was found" },
      ],
    }),
  ];
}
