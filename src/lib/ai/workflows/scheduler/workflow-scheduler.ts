import type { WorkflowExecution } from "../types";
import type { WorkflowPlanner } from "../planner/workflow-planner";
import type { NodeExecutor } from "../executor/node-executor";

export interface WorkflowScheduler {
  start(execution: WorkflowExecution): Promise<void>;
  pause(execution: WorkflowExecution): Promise<void>;
  resume(execution: WorkflowExecution): Promise<void>;
  cancel(execution: WorkflowExecution): Promise<void>;
  approve(execution: WorkflowExecution, nodeId: string): Promise<void>;
}

export class DefaultWorkflowScheduler implements WorkflowScheduler {
  constructor(
    private planner: WorkflowPlanner,
    private executor: NodeExecutor,
  ) {}

  async start(execution: WorkflowExecution): Promise<void> {
    execution.status = "running";
    await this.executeNext(execution);
  }

  async pause(execution: WorkflowExecution): Promise<void> {
    execution.status = "paused";
  }

  async resume(execution: WorkflowExecution): Promise<void> {
    execution.status = "running";
    await this.executeNext(execution);
  }

  async cancel(execution: WorkflowExecution): Promise<void> {
    execution.status = "cancelled";
    execution.completedAt = new Date().toISOString();
  }

  async approve(execution: WorkflowExecution, nodeId: string): Promise<void> {
    const result = execution.results.get(nodeId);
    if (result) {
      result.status = "completed";
      result.completedAt = new Date().toISOString();
    }
    await this.executeNext(execution);
  }

  private async executeNext(execution: WorkflowExecution): Promise<void> {
    const nextNodes = this.planner.getNextNodes(execution);

    for (const node of nextNodes) {
      if (node.type === "approval") {
        execution.status = "waiting_approval";
        execution.currentNodeId = node.id;
        continue;
      }

      execution.currentNodeId = node.id;
      const result = await this.executor.execute(node, execution.context);
      execution.results.set(node.id, result);
    }

    if (this.planner.isComplete(execution)) {
      execution.status = "completed";
      execution.completedAt = new Date().toISOString();
    }
  }
}
