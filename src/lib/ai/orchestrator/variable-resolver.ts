import type { PromptVariable } from "./types";

export interface VariableResolver {
  resolve(templateContent: string, variables: PromptVariable[]): string;
  validate(templateContent: string, variables: PromptVariable[]): { valid: boolean; missing: string[] };
}

export class DefaultVariableResolver implements VariableResolver {
  resolve(templateContent: string, variables: PromptVariable[]): string {
    let result = templateContent;
    const variableMap = new Map(variables.map((v) => [v.key, v.value]));

    for (const [key, value] of variableMap) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
      result = result.replace(regex, String(value));
    }

    return result;
  }

  validate(templateContent: string, variables: PromptVariable[]): { valid: boolean; missing: string[] } {
    const providedKeys = new Set(variables.map((v) => v.key));
    const regex = /\{\{\s*([^}]+)\s*\}\}/g;
    const missing: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(templateContent)) !== null) {
      const key = match[1]?.trim();
      if (key && !providedKeys.has(key)) {
        missing.push(key);
      }
    }

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
