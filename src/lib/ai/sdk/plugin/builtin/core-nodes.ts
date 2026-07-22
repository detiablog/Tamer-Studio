import type { WorkflowNodeDefinition } from "../../types";
import { BaseWorkflowNodeDefinition } from "../../node/node-definition";

export function createCoreNodes(): WorkflowNodeDefinition[] {
  return [
    new BaseWorkflowNodeDefinition({
      id: "core.start",
      type: "core.start",
      category: "flow",
      name: "Start",
      description: "Entry point of a workflow",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["flow", "entry"],
        icon: "Play",
      },
      inputContract: [],
      outputContract: [{ name: "flow", type: "workflow-result", description: "Passes control to connected nodes" }],
    }),
    new BaseWorkflowNodeDefinition({
      id: "core.end",
      type: "core.end",
      category: "flow",
      name: "End",
      description: "Terminates a workflow",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["flow", "exit"],
        icon: "Square",
      },
      inputContract: [{ name: "result", type: "workflow-result", required: true, description: "Final workflow result" }],
      outputContract: [],
    }),
    new BaseWorkflowNodeDefinition({
      id: "core.log",
      type: "core.log",
      category: "utility",
      name: "Log",
      description: "Logs a message during workflow execution",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["utility", "debug"],
        icon: "FileText",
      },
      inputContract: [
        { name: "message", type: "text", required: true, description: "Message to log" },
        { name: "level", type: "string", required: false, defaultValue: "info", description: "Log level" },
      ],
      outputContract: [{ name: "logged", type: "boolean", description: "Whether the message was logged" }],
    }),
    new BaseWorkflowNodeDefinition({
      id: "core.delay",
      type: "core.delay",
      category: "flow",
      name: "Delay",
      description: "Pauses execution for a specified duration",
      version: "1.0.0",
      metadata: {
        author: "tamer-studio",
        tags: ["flow", "timer"],
        icon: "Clock",
      },
      inputContract: [
        { name: "durationMs", type: "number", required: true, description: "Duration in milliseconds" },
      ],
      outputContract: [{ name: "resumed", type: "boolean", description: "Whether execution resumed" }],
    }),
  ];
}
