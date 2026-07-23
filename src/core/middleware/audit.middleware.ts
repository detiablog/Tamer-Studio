import type { Middleware, RequestContext } from "./types";
import type { AuditAction } from "@/core/audit/audit.types";

export function auditMiddleware(): Middleware {
  return async (ctx: RequestContext): Promise<void> => {
    const { auditContext } = ctx.state;

    if (!auditContext) {
      return;
    }
  };
}

export function logAuditIfNeeded(action: string, ctx: RequestContext, metadata?: Record<string, unknown>): void {
  const { auditContext } = ctx.state;

  if (!auditContext) {
    return;
  }

  try {
    void import("@/core/audit/audit.service").then(({ logAction }) =>
      logAction(
        action as AuditAction,
        auditContext.actorId,
        auditContext.actorType,
        metadata
      )
    );
  } catch {
    // Audit logging is non-blocking
  }
}
