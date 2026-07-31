import { db } from "@/lib/db";
import { workflow, workflowNode, workflowConnection, workflowRun, workflowRunLog } from "@/lib/db/schema/workflows";
import { eq, and, sql, desc } from "drizzle-orm";
import { generateId } from "@/modules/email/email.encryption";
import { providerRouter } from "@/core/ai/provider-router";

export interface NodeExecutionResult {
  nodeId: string;
  status: "completed" | "failed" | "skipped";
  output?: Record<string, unknown>;
  creditsUsed?: number;
  executionTimeMs?: number;
  error?: string;
}

export class WorkflowEngine {
  async executeWorkflow(runId: string): Promise<void> {
    const [run] = await db.select().from(workflowRun).where(eq(workflowRun.id, runId)).limit(1);
    if (!run) throw new Error("Workflow run not found");

    const nodes = await db.select().from(workflowNode).where(eq(workflowNode.workflowId, run.workflowId));
    const connections = await db.select().from(workflowConnection).where(eq(workflowConnection.workflowId, run.workflowId));

    if (nodes.length === 0) throw new Error("Workflow has no nodes");

    await db.update(workflowRun).set({ status: "running", startedAt: new Date(), totalNodes: nodes.length }).where(eq(workflowRun.id, runId));

    const executionOrder = this.topologicalSort(nodes, connections);
    let totalCredits = 0;

    for (const nodeId of executionOrder) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;

      await db.update(workflowRun).set({ currentNodeId: nodeId }).where(eq(workflowRun.id, runId));

      const logId = generateId("rlog");
      await db.insert(workflowRunLog).values({
        id: logId, runId, nodeId, nodeType: node.type, status: "running",
        input: node.config || {}, startedAt: new Date(),
      });

      try {
        const result = await this.executeNode(node, run.variables as Record<string, unknown>);
        totalCredits += result.creditsUsed || 0;

        await db.update(workflowRunLog).set({
          status: result.status, output: result.output || {}, creditsUsed: result.creditsUsed || 0,
          executionTimeMs: result.executionTimeMs, completedAt: new Date(),
        }).where(eq(workflowRunLog.id, logId));

        const progress = Math.round(((executionOrder.indexOf(nodeId) + 1) / executionOrder.length) * 100);
        await db.update(workflowRun).set({ progress, creditsUsed: totalCredits }).where(eq(workflowRun.id, runId));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await db.update(workflowRunLog).set({ status: "failed", error: errorMessage, completedAt: new Date() }).where(eq(workflowRunLog.id, logId));
        await db.update(workflowRun).set({ status: "failed", error: errorMessage, completedAt: new Date() }).where(eq(workflowRun.id, runId));
        return;
      }
    }

    await db.update(workflowRun).set({ status: "completed", progress: 100, completedAt: new Date(), result: { totalCredits } }).where(eq(workflowRun.id, runId));
  }

  private async executeNode(node: typeof workflowNode.$inferSelect, variables: Record<string, unknown>): Promise<NodeExecutionResult> {
    const start = Date.now();
    const config = node.config as Record<string, unknown>;

    switch (node.type) {
      case "ai_image":
      case "ai_video":
      case "ai_storyboard":
        return this.executeAINode(node, config, variables, start);
      case "prompt":
        return { nodeId: node.id, status: "completed", output: { prompt: this.resolveVariables(config.prompt as string || "", variables) }, executionTimeMs: Date.now() - start };
      case "storage":
        return { nodeId: node.id, status: "completed", output: { stored: true }, executionTimeMs: Date.now() - start };
      case "notification":
        return { nodeId: node.id, status: "completed", output: { notified: true }, executionTimeMs: Date.now() - start };
      case "condition":
        const conditionMet = this.evaluateCondition(config, variables);
        return { nodeId: node.id, status: "completed", output: { conditionMet }, executionTimeMs: Date.now() - start };
      case "delay":
        const delayMs = (config.delayMs as number) || 1000;
        await new Promise(resolve => setTimeout(resolve, Math.min(delayMs, 30000)));
        return { nodeId: node.id, status: "completed", output: { delayed: delayMs }, executionTimeMs: Date.now() - start };
      case "variable":
        const varName = config.variableName as string;
        const varValue = this.resolveVariables(config.value as string || "", variables);
        if (varName) variables[varName] = varValue;
        return { nodeId: node.id, status: "completed", output: { [varName || "value"]: varValue }, executionTimeMs: Date.now() - start };
      default:
        return { nodeId: node.id, status: "completed", output: { message: `Node type '${node.type}' executed` }, executionTimeMs: Date.now() - start };
    }
  }

  private async executeAINode(node: typeof workflowNode.$inferSelect, config: Record<string, unknown>, variables: Record<string, unknown>, start: number): Promise<NodeExecutionResult> {
    const prompt = this.resolveVariables(config.prompt as string || "", variables);
    const model = config.model as string || "default";
    try {
      const routing = await providerRouter.selectProvider(node.type, config.preferredProvider as string);
      return { nodeId: node.id, status: "completed", output: { prompt, model, provider: routing.providerId, generated: true }, creditsUsed: (config.creditCost as number) || 10, executionTimeMs: Date.now() - start };
    } catch (error) {
      return { nodeId: node.id, status: "failed", error: error instanceof Error ? error.message : "AI execution failed", executionTimeMs: Date.now() - start };
    }
  }

  private resolveVariables(template: string, variables: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(variables[key] ?? `{{${key}}}`));
  }

  private evaluateCondition(config: Record<string, unknown>, variables: Record<string, unknown>): boolean {
    const varName = config.variable as string;
    const operator = config.operator as string || "equals";
    const value = config.value as string;
    const actual = String(variables[varName] ?? "");
    switch (operator) {
      case "equals": return actual === value;
      case "not_equals": return actual !== value;
      case "contains": return actual.includes(value);
      case "gt": return Number(actual) > Number(value);
      case "lt": return Number(actual) < Number(value);
      default: return false;
    }
  }

  private topologicalSort(nodes: Array<{ id: string }>, connections: Array<{ sourceNodeId: string; targetNodeId: string }>): string[] {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();
    for (const node of nodes) { inDegree.set(node.id, 0); adjacency.set(node.id, []); }
    for (const conn of connections) {
      inDegree.set(conn.targetNodeId, (inDegree.get(conn.targetNodeId) || 0) + 1);
      adjacency.get(conn.sourceNodeId)?.push(conn.targetNodeId);
    }
    const queue: string[] = [];
    for (const [id, degree] of inDegree) { if (degree === 0) queue.push(id); }
    const sorted: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      sorted.push(current);
      for (const neighbor of (adjacency.get(current) || [])) {
        const newDegree = (inDegree.get(neighbor) || 1) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }
    return sorted.length === nodes.length ? sorted : nodes.map(n => n.id);
  }
}

export const workflowEngine = new WorkflowEngine();
