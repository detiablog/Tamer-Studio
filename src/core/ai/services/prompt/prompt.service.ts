import type {
  PromptVariable,
  PromptCompileOptions,
  PromptCompileResult,
  PromptValidationResult,
  PromptSanitizeResult,
  PromptVersion as PromptVersionType,
} from "./types";
import { AIPromptValidationError } from "../errors";

const VARIABLE_PATTERN = /\{\{\s*(\w+)\s*\}\}/g;
const DANGEROUS_PATTERNS = [
  /ignore\s+(previous|all)\s+instructions?/i,
  /pretend\s+you\s+are/i,
  /bypass\s+security/i,
  /reveal\s+your\s+(system\s+)?prompt/i,
  /act\s+as\s+(if\s+)?you\s+are/i,
];

export interface PromptTemplateConfig {
  name: string;
  content: string;
  variables: PromptVariable[];
  category: string;
  version: string;
}

export class PromptBuilder {
  private variables = new Map<string, PromptVariable>();
  private content = "";

  addVariable(name: string, value: string | number | boolean): PromptBuilder {
    this.variables.set(name, { name, value });
    return this;
  }

  setTemplate(content: string): PromptBuilder {
    this.content = content;
    return this;
  }

  compile(options: PromptCompileOptions = {}): PromptCompileResult {
    const warnings: string[] = [];
    let compiled = this.content;
    const compiledVariables = Array.from(this.variables.values());

    for (const variable of compiledVariables) {
      const regex = new RegExp(`\\{\\{\\s*${variable.name}\\s*\\}\\}`, "g");
      if (!regex.test(compiled)) {
        warnings.push(`Variable "${variable.name}" not found in template`);
      }
      compiled = compiled.replace(regex, String(variable.value));
    }

    const remainingVariables = Array.from(compiled.matchAll(VARIABLE_PATTERN)).map((m) => m[1]);
    if (remainingVariables.length > 0) {
      warnings.push(`Unresolved variables: ${remainingVariables.join(", ")}`);
    }

    if (options.sanitize) {
      const sanitized = PromptSanitizer.sanitize(compiled);
      if (sanitized.modified) {
        warnings.push(...sanitized.modifications);
        compiled = sanitized.sanitized;
      }
    }

    if (options.strict && warnings.length > 0) {
      throw new AIPromptValidationError(`Template compilation failed: ${warnings.join("; ")}`);
    }

    return {
      templateId: crypto.randomUUID(),
      compiled,
      variables: compiledVariables,
      warnings,
    };
  }
}

export class PromptTemplate {
  id: string;
  name: string;
  content: string;
  variables: PromptVariable[];
  category: string;
  version: string;
  createdAt: string;

  constructor(config: PromptTemplateConfig) {
    this.id = crypto.randomUUID();
    this.name = config.name;
    this.content = config.content;
    this.variables = [...config.variables];
    this.category = config.category;
    this.version = config.version;
    this.createdAt = new Date().toISOString();
  }
}

export class PromptVariables {
  static validate(variables: PromptVariable[], template: string): PromptValidationResult {
    const violations: Array<{ rule: string; message: string; severity: "error" | "warning" }> = [];
    const requiredVars = Array.from(template.matchAll(VARIABLE_PATTERN)).map((m) => m[1]);

    for (const name of requiredVars) {
      if (!variables.some((v) => v.name === name)) {
        violations.push({
          rule: "missing_required",
          message: `Missing required variable: "${name}"`,
          severity: "error",
        });
      }
    }

    return { valid: violations.filter((v) => v.severity === "error").length === 0, violations };
  }
}

export class PromptCompiler {
  static compile(template: PromptTemplate, variables: PromptVariable[], options: PromptCompileOptions = {}): PromptCompileResult {
    const builder = new PromptBuilder();
    builder.setTemplate(template.content);
    for (const v of variables) {
      builder.addVariable(v.name, v.value);
    }
    return builder.compile(options);
  }
}

export class PromptValidator {
  static validate(template: PromptTemplate): PromptValidationResult {
    const violations: Array<{ rule: string; message: string; severity: "error" | "warning" }> = [];
    const variableValidation = PromptVariables.validate(template.variables, template.content);
    violations.push(...variableValidation.violations);

    const sanitized = PromptSanitizer.sanitize(template.content);
    if (sanitized.modified) {
      violations.push({
        rule: "unsafe_content",
        message: "Template contains potentially unsafe patterns",
        severity: "warning",
      });
    }

    return {
      valid: violations.filter((v) => v.severity === "error").length === 0,
      violations,
    };
  }
}

export class PromptSanitizer {
  static sanitize(text: string): PromptSanitizeResult {
    const modifications: string[] = [];
    let sanitized = text;

    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        modifications.push(`Removed unsafe pattern: ${pattern.source}`);
        sanitized = sanitized.replace(pattern, "[filtered]");
      }
    }

    return {
      sanitized,
      modified: modifications.length > 0,
      modifications,
    };
  }
}

export class PromptVersion {
  static create(previous: PromptVersionType | null, newVersion: PromptTemplate, author: string, changeLog: string): PromptVersionType {
    const nextVersion = previous
      ? (parseFloat(previous.version) + 0.1).toFixed(1)
      : "1.0";

    return {
      id: crypto.randomUUID(),
      templateId: newVersion.id,
      version: nextVersion,
      content: newVersion.content,
      variables: newVersion.variables,
      createdAt: new Date().toISOString(),
      author,
      changeLog,
    };
  }
}
