import type { WorkflowDefinition, WorkflowExecution, NodeResult, WorkflowNode, NodeId } from "../types";
import type { WorkflowRegistry } from "../registry/workflow-registry";

export interface WorkflowPlanner {
  plan(definition: WorkflowDefinition, context: Record<string, unknown>): WorkflowExecution;
  getNextNodes(execution: WorkflowExecution): WorkflowNode[];
  isComplete(execution: WorkflowExecution): boolean;
}

export class DefaultWorkflowPlanner implements WorkflowPlanner {
  constructor(private registry: WorkflowRegistry) {}

  plan(definition: WorkflowDefinition, context: Record<string, unknown>): WorkflowExecution {
    const results = new Map<string, NodeResult>();

    return {
      executionId: `wf_${crypto.randomUUID().replace(/-/g, "")}`,
      workflowId: definition.id,
      status: "queued",
      context,
      results,
    };
  }

  getNextNodes(execution: WorkflowExecution): WorkflowNode[] {
    const definition = this.registry.resolve(execution.workflowId);
    if (!definition) return [];

    const completedNodeIds = new Set(Array.from(execution.results.keys()).filter((nodeId) => {
      const result = execution.results.get(nodeId);
      return result && result.status === "completed";
    }));

    const waitingNodeIds = new Set(Array.from(execution.results.keys()).filter((nodeId) => {
      const result = execution.results.get(nodeId);
      return result && (result.status === "running" || result.status === "waiting_approval");
    }));

    const nextNodes: WorkflowNode[] = [];

    for (const node of definition.nodes) {
      if (completedNodeIds.has(node.id) || waitingNodeIds.has(node.id)) continue;

      const dependenciesMet = node.dependsOn.every((depId: NodeId) => completedNodeIds.has(depId));
      if (dependenciesMet) {
        nextNodes.push(node);
      }
    }

    return nextNodes;
  }

  isComplete(execution: WorkflowExecution): boolean {
    const definition = this.registry.resolve(execution.workflowId);
    if (!definition) return true;

    return definition.nodes.every((node: WorkflowNode) => {
      const result = execution.results.get(node.id);
      return result && (result.status === "completed" || result.status === "skipped");
    });
  }
}
