export type AuditAction =
  | "user.login"
  | "user.logout"
  | "user.register"
  | "user.updated"
  | "user.deleted"
  | "user.profile.updated"
  | "user.preferences.updated"
  | "user.external_identity.linked"
  | "user.suspended"
  | "admin.login"
  | "admin.logout"
  | "admin.action"
  | "payment.created"
  | "payment.completed"
  | "payment.failed"
  | "payment.refunded"
  | "order.created"
  | "order.cancelled"
  | "order.paid"
  | "voucher.used"
  | "coupon.used"
  | "checkout.initiated"
  | "checkout.completed"
  | "refund.created"
  | "refund.processed"
  | "ai.generation.started"
  | "ai.generation.completed"
  | "ai.generation.failed"
  | "system.config.updated"
  | "system.error"
  | "apikey.created"
  | "apikey.revoked"
  | "apikey.rotated"
  | "membership.invited"
  | "membership.accepted"
  | "membership.removed"
  | "permission.created"
  | "permission.deleted"
  | "role.created"
  | "role.updated"
  | "role.deleted"
  | "role.permissions.updated"
  | "organization.created"
  | "organization.updated"
  | "workspace.created"
  | "workspace.updated"
  | "workspace.transferred"
  | "workspace.deleted";

export interface AuditEntry {
  id: string;
  action: AuditAction;
  actorId?: string;
  actorType?: "user" | "admin" | "system";
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
