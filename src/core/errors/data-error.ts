import { AppError } from "./app-error";

export class DataError extends AppError {
  constructor(message: string, code = "DATA_ERROR", details?: Record<string, unknown>) {
    super(code, message, 500, details);
    this.name = "DataError";
  }
}

export class NotFoundError extends DataError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, "NOT_FOUND", { resource, id });
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

export class ValidationError extends DataError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
    this.statusCode = 422;
  }
}

export class PermissionDeniedError extends DataError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "PERMISSION_DENIED", details);
    this.name = "PermissionDeniedError";
    this.statusCode = 403;
  }
}