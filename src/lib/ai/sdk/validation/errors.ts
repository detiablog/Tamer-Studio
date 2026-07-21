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

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
}

export function createValidationResult(valid: boolean, errors: ValidationError[] = [], warnings: ValidationWarning[] = []): ValidationResult {
  return { valid, errors, warnings };
}

export function createValidationError(code: string, message: string, field?: string): ValidationError {
  return { code, message, field };
}

export function createValidationWarning(code: string, message: string, field?: string): ValidationWarning {
  return { code, message, field };
}
