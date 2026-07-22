import type { ExecutionContext, WorkflowNodeDefinition, NodeExecutionContext } from "../types";
import { createWorkflowMemory } from "./memory";

export function createExecutionContext(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    user: {
      id: overrides.user?.id ?? "anonymous",
      role: overrides.user?.role,
      email: overrides.user?.email,
      permissions: overrides.user?.permissions,
    },
    workspace: {
      id: overrides.workspace?.id ?? "default",
      name: overrides.workspace?.name,
      memberIds: overrides.workspace?.memberIds,
    },
    project: {
      id: overrides.project?.id ?? "default",
      name: overrides.project?.name,
      tags: overrides.project?.tags,
    },
    assets: {
      references: overrides.assets?.references ?? [],
      getById: (assetId: string) => overrides.assets?.references?.find((a) => a.assetId === assetId),
      listByType: (type: string) => overrides.assets?.references?.filter((a) => a.type === type) ?? [],
    },
    variables: createVariables(overrides.variables?.entries?.() ?? {}),
    execution: {
      executionId: overrides.execution?.executionId ?? `exec_${crypto.randomUUID().replace(/-/g, "")}`,
      startedAt: overrides.execution?.startedAt ?? new Date().toISOString(),
      traceId: overrides.execution?.traceId,
      priority: overrides.execution?.priority,
      parentExecutionId: overrides.execution?.parentExecutionId,
    },
    workflow: {
      workflowId: overrides.workflow?.workflowId ?? "unknown",
      version: overrides.workflow?.version ?? "1.0.0",
      name: overrides.workflow?.name ?? "unknown",
      tags: overrides.workflow?.tags,
    },
    memory: createWorkflowMemory(overrides.memory?.entries?.() ?? {}),
  };
}

function createVariables(initial: Record<string, unknown> = {}): ExecutionContext["variables"] {
  const store = new Map(Object.entries(initial));
  return {
    get: (key: string) => store.get(key),
    set: (key: string, value: unknown) => store.set(key, value),
    has: (key: string) => store.has(key),
    entries: () => Object.fromEntries(store),
    clear: () => store.clear(),
  };
}

export function createNodeExecutionContext(
  node: WorkflowNodeDefinition,
  context: ExecutionContext,
  inputs: Record<string, unknown> = {},
  signal?: AbortSignal,
): NodeExecutionContext {
  return {
    node,
    context,
    inputs,
    memory: context.memory,
    signal,
  };
}
