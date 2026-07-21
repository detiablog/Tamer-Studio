export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode = 500,
    public details: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message: string, code = "AUTH_ERROR", details?: Record<string, unknown>) {
    super(code, message, 401, details);
    this.name = "AuthError";
  }
}

export class PaymentError extends AppError {
  constructor(message: string, code = "PAYMENT_ERROR", details?: Record<string, unknown>) {
    super(code, message, 402, details);
    this.name = "PaymentError";
  }
}

export class AIError extends AppError {
  constructor(message: string, code = "AI_ERROR", details?: Record<string, unknown>) {
    super(code, message, 500, details);
    this.name = "AIError";
  }
}

export function formatError(error: AppError) {
  return {
    success: false as const,
    code: error.code,
    message: error.message,
    details: error.details,
  };
}
