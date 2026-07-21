export type NodeValueType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "text"
  | "binary"
  | "workflow-result"
  | "any";

export type NodeCategory =
  | "ai"
  | "media"
  | "flow"
  | "storage"
  | "publishing"
  | "logic"
  | "input"
  | "output"
  | "utility"
  | "system";

export interface NodeMetadata {
  author?: string;
  tags?: string[];
  icon?: string;
  color?: string;
  deprecated?: boolean;
  minVersion?: string;
  maxVersion?: string;
  experimental?: boolean;
}

export interface UIMetadata {
  width?: number;
  height?: number;
  color?: string;
  icon?: string;
  description?: string;
  category?: string;
  documentationUrl?: string;
}

export interface NodeInputContract {
  name: string;
  type: NodeValueType;
  required: boolean;
  defaultValue?: unknown;
  description?: string;
  validation?: InputValidation;
  ui?: InputUIMetadata;
}

export interface InputValidation {
  pattern?: string;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  enum?: unknown[];
  custom?: string;
}

export interface InputUIMetadata {
  component?: "text" | "textarea" | "number" | "select" | "checkbox" | "slider" | "color" | "file";
  placeholder?: string;
  options?: { label: string; value: unknown }[];
  step?: number;
  rows?: number;
  accept?: string;
  disabled?: boolean;
}

export interface NodeOutputContract {
  name: string;
  type: NodeValueType;
  description?: string;
}

export interface SerializedNodeDefinition {
  id: string;
  type: string;
  category: NodeCategory;
  name: string;
  description: string;
  version: string;
  metadata: NodeMetadata;
  inputContract: NodeInputContract[];
  outputContract: NodeOutputContract[];
  uiMetadata?: UIMetadata;
}

export interface WorkflowNodeDefinition {
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

  serialize(): SerializedNodeDefinition;
  clone(): WorkflowNodeDefinition;
}

export interface NodeExecutionContext {
  readonly node: WorkflowNodeDefinition;
  readonly inputs: Record<string, unknown>;
  readonly memory: WorkflowMemory;
  readonly context: ExecutionContext;
  signal?: AbortSignal;
}

export interface NodeExecutionResult {
  readonly nodeId: string;
  readonly status: "completed" | "failed" | "skipped" | "waiting_approval";
  readonly output: Record<string, unknown>;
  readonly assets: string[];
  readonly error?: string;
  readonly durationMs: number;
  readonly startedAt: string;
  readonly completedAt: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
}

export interface ValidationError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

export interface ValidationWarning {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
}

export interface WorkflowValidationResult extends ValidationResult {
  readonly nodeResults: Map<string, ValidationResult>;
}

export interface UserContext {
  readonly id: string;
  readonly role?: string;
  readonly email?: string;
  readonly permissions?: string[];
}

export interface WorkspaceContext {
  readonly id: string;
  readonly name?: string;
  readonly memberIds?: string[];
}

export interface ProjectContext {
  readonly id: string;
  readonly name?: string;
  readonly tags?: string[];
}

export interface AssetReference {
  readonly assetId: string;
  readonly type: string;
  readonly mimeType?: string;
  readonly sizeBytes?: number;
  readonly url?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface AssetContext {
  readonly references: readonly AssetReference[];
  getById(assetId: string): AssetReference | undefined;
  listByType(type: string): readonly AssetReference[];
}

export interface Variables {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  has(key: string): boolean;
  entries(): Record<string, unknown>;
  clear(): void;
}

export interface ExecutionMetadata {
  readonly executionId: string;
  readonly startedAt: string;
  readonly traceId?: string;
  readonly priority?: string;
  readonly parentExecutionId?: string;
}

export interface WorkflowMetadata {
  readonly workflowId: string;
  readonly version: string;
  readonly name: string;
  readonly tags?: string[];
}

export interface WorkflowMemory {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  has(key: string): boolean;
  delete(key: string): void;
  clear(): void;
  entries(): Record<string, unknown>;
}

export interface ExecutionContext {
  readonly user: UserContext;
  readonly workspace: WorkspaceContext;
  readonly project: ProjectContext;
  readonly assets: AssetContext;
  readonly variables: Variables;
  readonly execution: ExecutionMetadata;
  readonly workflow: WorkflowMetadata;
  readonly memory: WorkflowMemory;
}

export interface ExecutionSnapshot {
  readonly executionId: string;
  readonly timestamp: string;
  readonly workflowState: Record<string, unknown>;
  readonly nodeStates: Map<string, Record<string, unknown>>;
  readonly memory: Record<string, unknown>;
  readonly metadata: Record<string, unknown>;
}

export interface PluginDependency {
  readonly id: string;
  readonly version: string;
  readonly source?: PluginSource;
}

export interface PluginSource {
  readonly type: "core" | "official" | "workspace" | "marketplace" | "third-party";
  readonly workspaceId?: string;
  readonly marketplaceId?: string;
  readonly vendor?: string;
}

export interface PluginManifest {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author?: string;
  readonly source: PluginSource;
  readonly categories: NodeCategory[];
  readonly nodes: SerializedNodeDefinition[];
  readonly dependencies?: PluginDependency[];
  readonly minSDKVersion: string;
}

export interface WorkflowPlugin {
  readonly manifest: PluginManifest;
  initialize(pluginSystem: PluginSystem): void | Promise<void>;
  registerNodes(registry: WorkflowNodeRegistry): void;
  teardown(): void | Promise<void>;
}

export interface WorkflowNodeHandler {
  readonly definition: WorkflowNodeDefinition;

  execute(input: NodeExecutionContext): Promise<NodeExecutionResult>;
  validate(input: NodeExecutionContext): Promise<ValidationResult>;
  rollback?(input: NodeExecutionContext): Promise<void>;
}

export interface WorkflowNodeRegistry {
  register(handler: WorkflowNodeHandler): void;
  registerMany(handlers: WorkflowNodeHandler[]): void;
  resolve(type: string): WorkflowNodeDefinition | undefined;
  has(type: string): boolean;
  list(category?: NodeCategory): WorkflowNodeDefinition[];
  getHandler(type: string): WorkflowNodeHandler | undefined;
  unregister(type: string): void;
}

export interface NodeExecutor {
  execute(node: WorkflowNodeDefinition, input: NodeExecutionContext): Promise<NodeExecutionResult>;
}

export interface NodeValidator {
  validateDefinition(definition: WorkflowNodeDefinition): Promise<ValidationResult>;
  validateExecution(definition: WorkflowNodeDefinition, inputs: Record<string, unknown>): Promise<ValidationResult>;
}

export interface WorkflowValidator {
  validateDefinition(definition: unknown): Promise<WorkflowValidationResult>;
  validateDependencies(definition: unknown): Promise<ValidationResult>;
}

export interface RollbackManager {
  createSnapshot(execution: unknown): ExecutionSnapshot;
  rollback(snapshot: ExecutionSnapshot): Promise<void>;
  canRollback(execution: unknown): boolean;
}

export interface PluginSystem {
  register(plugin: WorkflowPlugin): void;
  unregister(pluginId: string): void;
  loadPlugin(manifest: PluginManifest, module: unknown): Promise<WorkflowPlugin>;
  getPlugins(): WorkflowPlugin[];
  getNodeRegistry(): WorkflowNodeRegistry;
}

export interface WorkflowSDK {
  readonly nodeRegistry: WorkflowNodeRegistry;
  readonly pluginSystem: PluginSystem;
  readonly validator: NodeValidator;
  readonly rollbackManager: RollbackManager;

  registerNode(handler: WorkflowNodeHandler): void;
  getNodeDefinition(type: string): WorkflowNodeDefinition | undefined;
  listNodes(category?: NodeCategory): WorkflowNodeDefinition[];

  createExecutionContext(overrides?: Partial<ExecutionContext>): ExecutionContext;
  createMemory(): WorkflowMemory;

  validateNode(definition: WorkflowNodeDefinition): Promise<ValidationResult>;
  validateWorkflow(definition: unknown): Promise<WorkflowValidationResult>;

  createSnapshot(execution: unknown): ExecutionSnapshot;
  rollback(snapshot: ExecutionSnapshot): Promise<void>;

  loadPlugin(plugin: WorkflowPlugin): void;
  unloadPlugin(pluginId: string): void;
}
