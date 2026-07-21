export class AuthError extends Error {
  constructor(message: string, public code = "AUTH_ERROR") {
    super(message);
    this.name = "AuthError";
  }
}

export class InvalidSessionError extends AuthError {
  constructor() {
    super("Invalid or expired session", "AUTH_INVALID_SESSION");
  }
}

export class UnauthorizedError extends AuthError {
  constructor() {
    super("Unauthorized", "AUTH_UNAUTHORIZED");
  }
}

export class ForbiddenError extends AuthError {
  constructor() {
    super("Forbidden", "AUTH_FORBIDDEN");
  }
}
