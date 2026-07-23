export interface RequestContext {
  request: Request;
  params?: Record<string, string>;
  state: SecurityState;
  method: string;
  pathname: string;
  ip?: string;
}

export interface SecurityState {
  adminSession?: {
    id: string;
    adminId: string;
    expiresAt: Date;
    role: string;
  };
  userSession?: {
    id: string;
    userId: string;
    expiresAt: Date;
    role: string;
  };
  authError?: {
    status: number;
    message: string;
  };
  permissionError?: {
    status: number;
    message: string;
  };
  csrfError?: {
    status: number;
    message: string;
  };
  rateLimitError?: {
    status: number;
    message: string;
    retryAfter?: number;
  };
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
  origin?: {
    host: string | null;
    origin: string | null;
  };
  auditContext?: {
    actorId: string;
    actorType: "user" | "admin" | "system";
    ipAddress?: string;
    userAgent?: string;
  };
}

export type SecurityError = {
  status: number;
  message: string;
  headers?: Record<string, string>;
};

export type Middleware = (ctx: RequestContext) => Promise<void | SecurityError>;

export type Permission = string;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
