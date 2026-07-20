import type { WorkflowNodeDefinition, NodeExecutionContext, ValidationResult, WorkflowValidationResult, WorkflowValidator, NodeValidator, ValidationError, ValidationWarning } from "../types";
import type { WorkflowNodeRegistry } from "../node/node-registry";
import { createValidationResult, createValidationError } from "./errors";

export class DefaultNodeValidator implements NodeValidator {
  async validateDefinition(definition: WorkflowNodeDefinition): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!definition.id) {
      errors.push(createValidationError("missing_id", "Node definition must have an id"));
    }

    if (!definition.type) {
      errors.push(createValidationError("missing_type", "Node definition must have a type"));
    }

    if (!definition.name) {
      errors.push(createValidationError("missing_name", "Node definition must have a name"));
    }

    if (!definition.version) {
      errors.push(createValidationError("missing_version", "Node definition must have a version"));
    }

    for (const input of definition.inputContract) {
      if (!input.name) {
        errors.push(createValidationError("missing_input_name", "Input contract must have a name", `input.${input.name}`));
      }
    }

    for (const output of definition.outputContract) {
      if (!output.name) {
        errors.push(createValidationError("missing_output_name", "Output contract must have a name", `output.${output.name}`));
      }
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  }

  async validateExecution(definition: WorkflowNodeDefinition, inputs: Record<string, unknown>): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const contract of definition.inputContract) {
      if (contract.required && inputs[contract.name] === undefined) {
        errors.push(createValidationError("missing_required_input", `Missing required input: ${contract.name}`, contract.name));
      }
    }

    if (errors.length > 0) {
      return createValidationResult(false, errors, warnings);
    }

    for (const contract of definition.inputContract) {
      const value = inputs[contract.name];
      if (value === undefined) continue;

      if (!this.validateValueType(value, contract.type)) {
        errors.push(createValidationError("type_mismatch", `Input ${contract.name} expects type ${contract.type}`, contract.name));
      }
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  }

  private validateValueType(value: unknown, expectedType: string): boolean {
    if (expectedType === "any") return true;

    switch (expectedType) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number";
      case "boolean":
        return typeof value === "boolean";
      case "array":
        return Array.isArray(value);
      case "object":
        return typeof value === "object" && value !== null && !Array.isArray(value);
      case "text":
        return typeof value === "string";
      case "binary":
        return value instanceof ArrayBuffer || Array.isArray(value);
      case "workflow-result":
        return typeof value === "object" && value !== null;
      default:
        return true;
    }
  }
}

export class DefaultWorkflowValidator implements WorkflowValidator {
  constructor(private nodeRegistry: WorkflowNodeRegistry) {}

  async validateDefinition(definition: unknown): Promise<WorkflowValidationResult> {
    const nodeResults = new Map<string, ValidationResult>();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!definition || typeof definition !== "object") {
      return createValidationResult(false, [createValidationError("invalid_definition", "Workflow definition must be an object")], warnings) as WorkflowValidationResult;
    }

    const def = definition as Record<string, unknown>;

    if (!def.nodes || !Array.isArray(def.nodes)) {
      return createValidationResult(false, [createValidationError("invalid_nodes", "Workflow definition must have a nodes array")], warnings) as WorkflowValidationResult;
    }

    const nodeValidator = new DefaultNodeValidator();

    for (const node of def.nodes as Record<string, unknown>[]) {
      const nodeResult = await nodeValidator.validateDefinition(node as unknown as WorkflowNodeDefinition);
      nodeResults.set(node.id as string, nodeResult);

      for (const error of nodeResult.errors) {
        errors.push({ ...error, field: `nodes.${node.id}.${error.field ?? ""}`.trim() });
      }
      for (const warning of nodeResult.warnings) {
        warnings.push({ ...warning, field: `nodes.${node.id}.${warning.field ?? ""}`.trim() });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      nodeResults,
    } as WorkflowValidationResult;
  }

  async validateDependencies(definition: unknown): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!definition || typeof definition !== "object") {
      return createValidationResult(false, [createValidationError("invalid_definition", "Workflow definition must be an object")], warnings);
    }

    const def = definition as Record<string, unknown>;

    if (!def.nodes || !Array.isArray(def.nodes)) {
      return createValidationResult(false, [createValidationError("invalid_nodes", "Workflow definition must have a nodes array")], warnings);
    }

    const nodeIds = new Set(def.nodes.map((n) => n.id as string));

    for (const node of def.nodes as Record<string, unknown>[]) {
      const dependsOn = (node.dependsOn as string[]) ?? [];
      for (const depId of dependsOn) {
        if (!nodeIds.has(depId)) {
          errors.push(createValidationError("missing_dependency", `Node ${node.id as string} depends on unknown node ${depId}`, node.id as string));
        }
      }
    }

    return createValidationResult(errors.length === 0, errors, warnings);
  }
}
