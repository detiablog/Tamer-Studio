export interface PromptVariable {
  name: string;
  value: string | number | boolean;
  required?: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  variables: PromptVariable[];
  category: string;
  version: string;
  createdAt: string;
}

export interface PromptCompileOptions {
  strict?: boolean;
  sanitize?: boolean;
}

export interface PromptCompileResult {
  templateId: string;
  compiled: string;
  variables: PromptVariable[];
  warnings: string[];
}

export interface PromptValidationResult {
  valid: boolean;
  violations: Array<{ rule: string; message: string; severity: "error" | "warning" }>;
}

export interface PromptSanitizeResult {
  sanitized: string;
  modified: boolean;
  modifications: string[];
}

export interface PromptVersion {
  id: string;
  templateId: string;
  version: string;
  content: string;
  variables: PromptVariable[];
  createdAt: string;
  author: string;
  changeLog: string;
}
