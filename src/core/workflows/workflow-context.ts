import type { WorkflowContext, WorkflowVariables } from "./workflow.types";

export class WorkflowContextImpl implements WorkflowContext {
  variables: Record<string, unknown>;
  artifacts: Map<string, unknown>;

  constructor(initialVariables: Record<string, unknown> = {}) {
    this.variables = { ...initialVariables };
    this.artifacts = new Map();
  }

  getVariable(key: string): unknown {
    return this.variables[key];
  }

  setVariable(key: string, value: unknown): void {
    this.variables[key] = value;
  }

  setArtifact(key: string, value: unknown): void {
    this.artifacts.set(key, value);
  }

  getArtifact(key: string): unknown | undefined {
    return this.artifacts.get(key);
  }
}

export class WorkflowVariablesImpl implements WorkflowVariables {
  static: Record<string, unknown>;
  dynamic: Map<string, unknown>;

  constructor(staticVariables: Record<string, unknown> = {}) {
    this.static = { ...staticVariables };
    this.dynamic = new Map();
  }

  resolve(key: string): unknown {
    if (this.dynamic.has(key)) {
      return this.dynamic.get(key);
    }
    return this.static[key];
  }

  set(key: string, value: unknown): void {
    this.dynamic.set(key, value);
  }
}