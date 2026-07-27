export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;

  constructor(code: string, message: string, statusCode: number = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}

export class DataError extends AppError {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(code, message, 500, details);
    this.name = "DataError";
  }
}

export class NotFoundError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 404);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(code, message, 422, details);
    this.name = "ValidationError";
  }
}

export class PermissionDeniedError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 403);
    this.name = "PermissionDeniedError";
  }
}

export class AuthenticationError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 401);
    this.name = "AuthenticationError";
  }
}

export class ConflictError extends AppError {
  constructor(code: string, message: string) {
    super(code, message, 409);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends AppError {
  constructor(code: string, message: string, retryAfter?: number) {
    super(code, message, 429, retryAfter ? { retryAfter } : undefined);
    this.name = "RateLimitError";
  }
}
