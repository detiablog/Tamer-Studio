# Repository Documentation

**Sprint:** CMS-01 B1 — Repository Foundation
**Date:** 2026-07-27
**Status:** COMPLETE

---

## 1. Repository Ownership Map

| Repository | Module | Owner | Tables | Purpose |
|-----------|--------|-------|--------|---------|
| `user.repository.ts` | users | Auth Module | `userProfile`, `userPreferences`, `externalIdentity` | User profile, preferences, and external identity management |
| `workspace.repository.ts` | workspace | Workspace Module | `workspace`, `workspaceTransfer` | Workspace CRUD, ownership transfer, soft delete |
| `organization.repository.ts` | organization | Workspace Module | `organization` | Organization CRUD |
| `membership.repository.ts` | membership | Auth Module | `invitation`, `workspaceMember`, `organizationMember` | Workspace/org membership, invitations, role assignment |
| `role.repository.ts` | roles | Auth Module | `role`, `rolePermission` | Role CRUD, permission assignment |
| `permission.repository.ts` | permissions | Auth Module | `permission`, `rolePermission` | Permission CRUD, bulk operations |
| `apikey.repository.ts` | apikey | Auth Module | `apiKey` | API key lifecycle management |
| `notification.repository.ts` | notifications | Notification Module | `notification` | Notification CRUD, status updates, stats |
| `inbox.repository.ts` | inbox | Notification Module | `notification` | Inbox-specific notification queries |
| `feedback.repository.ts` | feedback | Support Module | `supportFeedback` | Feedback CRUD and stats |
| `ticket.repository.ts` | tickets | Support Module | `supportTicket`, `supportTicketComment` | Support ticket CRUD, comments, soft delete |
| `internal-note.repository.ts` | internal-notes | Support Module | `supportInternalNote` | Internal note CRUD for support tickets |
| `attachment.repository.ts` | attachments | Support Module | `supportAttachment` | Support attachment CRUD |
| `customer.repository.ts` | customer | Support Module | `supportCustomerTimeline` | Customer timeline events |
| `sla.repository.ts` | sla | Support Module | `supportSlaPolicy`, `supportSlaViolation`, `supportTicket` | SLA policy management and violation tracking |
| `knowledge.repository.ts` | knowledge | Support Module | `supportKnowledgeCategory`, `supportKnowledgeArticle` | Knowledge base CRUD |
| `dashboard.repository.ts` | admin/dashboard | Admin Module | `userProfile`, `workspace`, `invoice`, `wallet`, `usageRecord`, `creditTransaction`, `job`, `auditLog`, `aiProvider` | Platform-wide dashboard statistics |
| `moderation.repository.ts` | admin/moderation | Admin Module | `userProfile`, `workspace` | User/workspace suspension/unsuspension |
| `audit.repository.ts` | audit | Admin Module | `auditLog` | Audit log creation, querying, export |
| `wallet/repository.ts` | wallet | Billing Module | `wallet`, `creditTransaction`, `creditReservation` | Wallet balance, credit transactions, reservations |
| `order.repository.ts` | commerce/orders | Commerce Module | `order` | Order CRUD, status management |
| `checkout.repository.ts` | commerce/checkout | Commerce Module | `checkoutSession` | Checkout session management |
| `coupon.repository.ts` | commerce/coupon | Commerce Module | `coupon`, `couponUsage` | Coupon CRUD and usage tracking |
| `voucher.repository.ts` | commerce/voucher | Commerce Module | `voucher`, `voucherUsage` | Voucher CRUD and usage tracking |
| `refund.repository.ts` | commerce/refund | Commerce Module | `refund` | Refund CRUD and status management |
| `tax.repository.ts` | commerce/tax | Commerce Module | `taxRule` | Tax rule CRUD |
| `transaction.repository.ts` | commerce/transactions | Commerce Module | `paymentIntent`, `paymentAttempt` | Payment intent and attempt management |
| `template.repository.ts` | templates | Email Module | `notificationTemplate`, `notificationTemplateVersion` | Email template CRUD with versioning |

---

## 2. Repository Interface Standards

### 2.1 Standard Methods

Every repository must implement these 8 methods:

1. **findById(id: string)** — Find a single record by primary key
2. **findMany(filter?: FilterInput)** — Find multiple records with optional filtering
3. **create(input: CreateInput)** — Insert a new record
4. **update(id: string, input: UpdateInput)** — Update an existing record
5. **delete(id: string)** — Delete a record (soft delete preferred)
6. **exists(id: string)** — Check if a record exists
7. **count(filter?: FilterInput)** — Count records matching optional filter
8. **transaction<T>(fn: (tx: Transaction) => Promise<T>)** — Execute operations within a transaction

### 2.2 Naming Conventions

| Operation | Standard Method | Common Aliases Found |
|-----------|----------------|---------------------|
| Get by ID | `findById()` | `getById()`, `get()`, `getByX()` |
| List | `findMany()` | `list()`, `getAll()`, `getByX()` |
| Create | `create()` | `createX()`, `addX()`, `invite()`, `insert()` |
| Update | `update()` | `updateX()`, `setX()`, `modify()` |
| Delete | `delete()` | `deleteX()`, `removeX()`, `softDelete()`, `deactivate()` |
| Exists | `exists()` | — |
| Count | `count()` | — |
| Transaction | `transaction()` | — |

---

## 3. Repository Patterns

### 3.1 Pattern A: Interface + Default Implementation

Used by: checkout, coupon, order, refund, tax, transaction repositories

```typescript
export interface XRepository {
  findById(id: string): Promise<X | undefined>;
  findMany(filter?: FilterInput): Promise<X[]>;
  create(input: CreateXInput): Promise<X>;
  update(id: string, input: UpdateXInput): Promise<X | undefined>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  count(filter?: FilterInput): Promise<number>;
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}

export class DefaultXRepository implements XRepository {
  // ... implementation
}
```

### 3.2 Pattern B: Class Only

Used by: user, workspace, organization, membership, role, permission, apikey, notification, inbox, feedback, ticket, internal-note, attachment, customer, sla, knowledge, dashboard, moderation, audit, wallet, template repositories

```typescript
export class XRepository {
  // ... methods
}
```

### 3.3 Pattern C: Function Exports

Used by: audit.repository.ts (standalone async functions)

```typescript
export async function createAuditEntry(entry: ...): Promise<void> { ... }
export async function getAuditEntries(filters?: ...): Promise<AuditEntry[]> { ... }
```

---

## 4. Consumer Map

| Repository | Consumers |
|-----------|-----------|
| `user.repository.ts` | `user.service.ts`, `auth.service.ts`, `admin.service.ts` |
| `workspace.repository.ts` | `workspace.service.ts`, `moderation.service.ts`, `admin.service.ts` |
| `organization.repository.ts` | `organization.service.ts`, `admin.service.ts` |
| `membership.repository.ts` | `membership.service.ts`, `auth.service.ts` |
| `role.repository.ts` | `role.service.ts`, `rbac.engine.ts` |
| `permission.repository.ts` | `permission.service.ts`, `rbac.engine.ts` |
| `apikey.repository.ts` | `apikey.service.ts` |
| `notification.repository.ts` | `notification.service.ts`, `inbox.repository.ts` |
| `inbox.repository.ts` | `inbox.service.ts` |
| `feedback.repository.ts` | `feedback.service.ts` |
| `ticket.repository.ts` | `ticket.service.ts` |
| `internal-note.repository.ts` | `internal-note.service.ts` |
| `attachment.repository.ts` | `attachment.service.ts` |
| `customer.repository.ts` | `customer.service.ts` |
| `sla.repository.ts` | `sla.service.ts` |
| `knowledge.repository.ts` | `knowledge.service.ts` |
| `dashboard.repository.ts` | `dashboard.service.ts` |
| `moderation.repository.ts` | `moderation.service.ts` |
| `audit.repository.ts` | `audit.service.ts`, all repositories (via logAction) |
| `wallet/repository.ts` | `wallet.service.ts`, `credit.service.ts` |
| `order.repository.ts` | `order.service.ts` |
| `checkout.repository.ts` | `checkout.service.ts` |
| `coupon.repository.ts` | `coupon.service.ts` |
| `voucher.repository.ts` | `voucher.service.ts` |
| `refund.repository.ts` | `refund.service.ts` |
| `tax.repository.ts` | `tax.service.ts` |
| `transaction.repository.ts` | `payment.service.ts` |
| `template.repository.ts` | `template.service.ts` |

---

## 5. Ownership Documentation

| Module | Owner | Repository | Tables |
|--------|-------|-----------|--------|
| Auth | Auth Module | `user.repository.ts`, `membership.repository.ts`, `role.repository.ts`, `permission.repository.ts`, `apikey.repository.ts` | `userProfile`, `userPreferences`, `externalIdentity`, `invitation`, `workspaceMember`, `organizationMember`, `role`, `permission`, `rolePermission`, `apiKey` |
| Workspace | Workspace Module | `workspace.repository.ts`, `organization.repository.ts` | `workspace`, `workspaceTransfer`, `organization` |
| Notification | Notification Module | `notification.repository.ts`, `inbox.repository.ts` | `notification` |
| Support | Support Module | `feedback.repository.ts`, `ticket.repository.ts`, `internal-note.repository.ts`, `attachment.repository.ts`, `customer.repository.ts`, `sla.repository.ts`, `knowledge.repository.ts` | `supportFeedback`, `supportTicket`, `supportTicketComment`, `supportInternalNote`, `supportAttachment`, `supportCustomerTimeline`, `supportSlaPolicy`, `supportSlaViolation`, `supportKnowledgeCategory`, `supportKnowledgeArticle` |
| Admin | Admin Module | `dashboard.repository.ts`, `moderation.repository.ts`, `audit.repository.ts` | `userProfile`, `workspace`, `auditLog` |
| Billing | Billing Module | `wallet/repository.ts`, `order.repository.ts`, `checkout.repository.ts`, `coupon.repository.ts`, `voucher.repository.ts`, `refund.repository.ts`, `tax.repository.ts`, `transaction.repository.ts` | `wallet`, `creditTransaction`, `creditReservation`, `order`, `checkoutSession`, `coupon`, `couponUsage`, `voucher`, `voucherUsage`, `refund`, `taxRule`, `paymentIntent`, `paymentAttempt` |
| Email | Email Module | `template.repository.ts` | `notificationTemplate`, `notificationTemplateVersion` |

---

## 6. Architecture Compliance

### 6.1 Data Flow Compliance

```
Database
  ↓
Repository ← ✅ All DB access goes through repositories
  ↓
Service
  ↓
API
  ↓
Component
  ↓
User
```

### 6.2 Violations

1. **6 repositories import `@/core/audit`** — violates the "Repository → Database only" rule
2. **16+ files have direct DB access** — violates the repository pattern
3. **`dashboard.repository.ts` accesses 9 modules' tables** — violates module ownership

### 6.3 Remediation Plan

| Violation | Fix | Sprint |
|-----------|-----|--------|
| Repositories importing `@/core/audit` | Move `logAction()` to service layer | B2 |
| Direct DB access in services | Create repositories, route through them | B2 |
| Direct DB access in API routes | Create repositories, route through services | B2 |
| `dashboard.repository.ts` cross-module access | Delegate to individual repositories | B2 |
| Cross-module type imports | Consolidate types or define locally | B2 |

---

## 7. Next Steps

1. Standardize all repository interfaces to the 8-method pattern
2. Remove business logic (`logAction`) from repositories
3. Create missing repositories for modules with direct DB access
4. Update barrel exports for all repository modules
5. Add dependency validation to CI pipeline
