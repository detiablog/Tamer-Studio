import type { WorkflowSDK, WorkflowNodeHandler, NodeCategory, WorkflowNodeDefinition, ExecutionContext, WorkflowMemory, ExecutionSnapshot, ValidationResult, WorkflowValidationResult, WorkflowPlugin, PluginSystem, NodeValidator, RollbackManager, WorkflowNodeRegistry } from "./types";
import { InMemoryWorkflowNodeRegistry } from "./node/node-registry";
import { DefaultNodeValidator, DefaultWorkflowValidator } from "./validation/validator";
import { DefaultRollbackManager } from "./rollback/rollback-manager";
import { DefaultPluginSystem } from "./plugin/plugin-system";
import { createExecutionContext } from "./context/execution-context";
import { createWorkflowMemory } from "./context/memory";

export class DefaultWorkflowSDK implements WorkflowSDK {
  readonly nodeRegistry: WorkflowNodeRegistry;
  readonly pluginSystem: PluginSystem;
  readonly validator: NodeValidator;
  readonly rollbackManager: RollbackManager;

  constructor() {
    this.nodeRegistry = new InMemoryWorkflowNodeRegistry();
    this.pluginSystem = new DefaultPluginSystem(this.nodeRegistry);
    this.validator = new DefaultNodeValidator();
    this.rollbackManager = new DefaultRollbackManager();
  }

  registerNode(handler: WorkflowNodeHandler): void {
    this.nodeRegistry.register(handler);
  }

  getNodeDefinition(type: string): WorkflowNodeDefinition | undefined {
    return this.nodeRegistry.resolve(type);
  }

  listNodes(category?: NodeCategory): WorkflowNodeDefinition[] {
    return this.nodeRegistry.list(category);
  }

  createExecutionContext(overrides?: Partial<ExecutionContext>): ExecutionContext {
    return createExecutionContext(overrides);
  }

  createMemory(): WorkflowMemory {
    return createWorkflowMemory();
  }

  async validateNode(definition: WorkflowNodeDefinition): Promise<ValidationResult> {
    return this.validator.validateDefinition(definition);
  }

  async validateWorkflow(definition: unknown): Promise<WorkflowValidationResult> {
    const workflowValidator = new DefaultWorkflowValidator(this.nodeRegistry);
    return workflowValidator.validateDefinition(definition);
  }

  createSnapshot(execution: unknown): ExecutionSnapshot {
    return this.rollbackManager.createSnapshot(execution);
  }

  async rollback(snapshot: ExecutionSnapshot): Promise<void> {
    return this.rollbackManager.rollback(snapshot);
  }

  loadPlugin(plugin: WorkflowPlugin): void {
    this.pluginSystem.register(plugin);
  }

  unloadPlugin(pluginId: string): void {
    this.pluginSystem.unregister(pluginId);
  }
}
