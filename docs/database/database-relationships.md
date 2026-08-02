# Database Relationships Audit

## Primary Key Analysis

All 388 tables use **text-based primary keys** with UUID values. This provides:
- Platform-independent identifiers
- No sequential暴露 of record counts
- Safe for distributed systems

### Pattern

```typescript
id: text("id").primaryKey().$defaultFn(() => createId())
```

### Verification

| Check | Status |
|-------|--------|
| All tables have primary key | ✅ Pass |
| All PKs are text type | ✅ Pass |
| All PKs use UUID generation | ✅ Pass |
| No auto-increment PKs | ✅ Pass |

---

## Foreign Key Analysis

### Core Authentication FKs

| Source Table | Source Column | Target Table | Target Column | Cascade |
|-------------|---------------|--------------|---------------|---------|
| session | userId | user | id | cascade |
| account | userId | user | id | cascade |
| verification | identifier | user | id | cascade |
| userProfile | userId | user | id | cascade |

### Workspace FKs

| Source Table | Source Column | Target Table | Target Column | Cascade |
|-------------|---------------|--------------|---------------|---------|
| workspaceMember | workspaceId | workspace | id | cascade |
| workspaceMember | userId | user | id | cascade |
| workspaceMember | roleId | role | id | **none** |
| invitation | workspaceId | workspace | id | cascade |
| invitation | invitedBy | user | id | cascade |
| apiKey | workspaceId | workspace | id | cascade |
| apiKey | userId | user | id | cascade |

### RBAC FKs

| Source Table | Source Column | Target Table | Target Column | Cascade |
|-------------|---------------|--------------|---------------|---------|
| rolePermission | roleId | role | id | cascade |
| rolePermission | permissionId | permission | id | cascade |
| role | workspaceId | workspace | id | cascade |

### Commerce FKs

| Source Table | Source Column | Target Table | Target Column | Cascade |
|-------------|---------------|--------------|---------------|---------|
| checkoutSession | orderId | order | id | cascade |
| paymentIntent | orderId | order | id | cascade |
| paymentAttempt | paymentIntentId | paymentIntent | id | cascade |
| refund | orderId | order | id | cascade |
| couponUsage | couponId | coupon | id | cascade |
| couponUsage | orderId | order | id | cascade |

### CMS FKs

| Source Table | Source Column | Target Table | Target Column | Cascade |
|-------------|---------------|--------------|---------------|---------|
| cmsSection | pageId | cmsPage | id | cascade |
| cmsBlock | sectionId | cmsSection | id | cascade |
| cmsPublishStep | pipelineId | cmsPublishPipeline | id | cascade |
| cmsPublishPipeline | pageId | cmsPage | id | cascade |

### Billing FKs

| Source Table | Source Column | Target Table | Target Column | Cascade |
|-------------|---------------|--------------|---------------|---------|
| creditTransaction | walletId | wallet | id | cascade |
| creditReservation | walletId | wallet | id | cascade |
| invoice | subscriptionId | subscription | id | cascade |
| invoiceLineItem | invoiceId | invoice | id | cascade |

### Landing FKs

| Source Table | Source Column | Target Table | Target Column | Cascade |
|-------------|---------------|--------------|---------------|---------|
| landingMedia | sectionId | landingSection | id | cascade |
| landingPage | workspaceId | workspace | id | cascade |

### Subscription FKs

| Source Table | Source Column | Target Table | Target Column | Cascade |
|-------------|---------------|--------------|---------------|---------|
| subscription | planId | subscriptionPlan | id | cascade |
| subscriptionUsage | subscriptionId | subscription | id | cascade |

### Notification FKs

| Source Table | Source Column | Target Table | Target Column | Cascade |
|-------------|---------------|--------------|---------------|---------|
| notificationPreference | userId | user | id | cascade |
| notification | userId | user | id | cascade |
| notificationLog | notificationId | notification | id | cascade |

### AI FKs

| Source Table | Source Column | Target Table | Target Column | Cascade |
|-------------|---------------|--------------|---------------|---------|
| aiModel | providerId | aiProvider | id | cascade |
| aiUsage | modelId | aiModel | id | cascade |
| aiUsage | providerId | aiProvider | id | cascade |
| aiCompletion | promptId | aiPrompt | id | cascade |

### Jobs/Queues FKs

| Source Table | Source Column | Target Table | Target Column | Cascade |
|-------------|---------------|--------------|---------------|---------|
| jobRun | jobId | job | id | cascade |
| jobSchedule | jobId | job | id | cascade |
| queueJob | queueId | queue | id | cascade |
| queueWorker | queueId | queue | id | cascade |

### Workflow FKs

| Source Table | Source Column | Target Table | Target Column | Cascade |
|-------------|---------------|--------------|---------------|---------|
| workflowStep | workflowId | workflow | id | cascade |
| workflowRun | workflowId | workflow | id | cascade |
| workflowStepRun | workflowRunId | workflowRun | id | cascade |
| workflowStepRun | stepId | workflowStep | id | cascade |

---

## Cascade Rules

### Protected FKs (No Cascade)

| Source Table | Source Column | Target Table | Target Column | Reason |
|-------------|---------------|--------------|---------------|--------|
| workspace | ownerId | user | id | Prevent owner deletion from cascading to workspace |
| workspaceMember | roleId | role | id | Role is optional, null allowed |
| workspaceMember | invitedBy | user | id | Inviter record should persist |

### Cascade FKs

| Pattern | Count |
|---------|-------|
| onDelete: "cascade" | 95+ |
| onDelete: "no action" | 3 |
| onUpdate: "cascade" | All |

---

## Indexes

### FK Indexes

| Table | Column | Index Name |
|-------|--------|------------|
| session | userId | session_userId_idx |
| account | userId | account_userId_idx |
| workspaceMember | workspaceId | workspaceMember_workspaceId_idx |
| workspaceMember | userId | workspaceMember_userId_idx |
| rolePermission | roleId | rolePermission_roleId_idx |
| rolePermission | permissionId | rolePermission_permissionId_idx |
| creditTransaction | walletId | creditTransaction_walletId_idx |
| invoice | subscriptionId | invoice_subscriptionId_idx |
| cmsSection | pageId | cmsSection_pageId_idx |
| cmsBlock | sectionId | cmsBlock_sectionId_idx |

### Status Indexes

| Table | Column | Index Name |
|-------|--------|------------|
| user | status | user_status_idx |
| workspace | status | workspace_status_idx |
| order | status | order_status_idx |
| subscription | status | subscription_status_idx |
| ticket | status | ticket_status_idx |
| notification | status | notification_status_idx |

### Timestamp Indexes

| Table | Column | Index Name |
|-------|--------|------------|
| user | createdAt | user_createdAt_idx |
| workspace | createdAt | workspace_createdAt_idx |
| order | createdAt | order_createdAt_idx |
| auditLog | createdAt | auditLog_createdAt_idx |

### Composite Unique Constraints

| Table | Columns | Constraint |
|-------|---------|------------|
| rolePermission | roleId, permissionId | rolePermission_roleId_permissionId_unique |
| workspaceMember | workspaceId, userId | workspaceMember_workspaceId_userId_unique |
| voucherUsage | voucherId, userId | voucherUsage_voucherId_userId_unique |
| couponUsage | couponId, orderId | couponUsage_couponId_orderId_unique |

---

## Issues Found

### Critical

#### 1. Duplicate Variable Names

| Variable | File 1 | File 2 | Issue |
|----------|--------|--------|-------|
| apiKey | api-platform.schema.ts | identity.schema.ts | Two tables named `apiKey` in different modules |
| coupon | campaigns.schema.ts | commerce.schema.ts | Two tables named `coupon` in different modules |
| voucher | campaigns.schema.ts | commerce.schema.ts | Two tables named `voucher` in different modules |

**Impact:** Import conflicts when combining schema files. Module-level isolation prevents runtime issues but creates maintenance confusion.

**Fix:** Rename to `platformApiKey`, `campaignCoupon`, `campaignVoucher` or consolidate into single modules.

#### 2. Migration Journal Incomplete

The `drizzle` migration journal only tracks 6 of 39 migrations. This means:
- Migration history is lost
- Cannot verify which migrations have been applied
- Risk of duplicate or missing migrations

**Fix:** Rebuild journal from SQL file timestamps or manual audit.

### Moderate

#### 3. Missing FK Constraints

| Table | Column | Should Reference | Issue |
|-------|--------|-----------------|-------|
| wallet | workspaceId | workspace.id | No FK constraint |
| subscription | workspaceId | workspace.id | No FK constraint |
| creditTransaction | workspaceId | workspace.id | No FK constraint |
| order | workspaceId | workspace.id | No FK constraint |
| invoice | workspaceId | workspace.id | No FK constraint |

**Impact:** Orphaned records possible if workspace is deleted. Referential integrity cannot be enforced at database level.

**Fix:** Add FK constraints with cascade or restrict rules.

#### 4. Inconsistent Naming

Some tables use explicit SQL names while others use Drizzle's inferred names:

| Table | SQL Name | Inferred Name | Issue |
|-------|----------|---------------|-------|
| workspaceMember | workspace_member | (inferred) | Mixed |
| rolePermission | role_permission | (inferred) | Mixed |
| cmsPublishPipeline | cms_publish_pipeline | (inferred) | Mixed |

**Impact:** Inconsistent database schema. Some tables have explicit snake_case names, others may use camelCase if Drizzle inference changes.

**Fix:** Add explicit SQL names to all tables.

### Minor

#### 5. Missing Indexes

| Table | Column | Suggested Index | Reason |
|-------|--------|----------------|--------|
| order | workspaceId | order_workspaceId_idx | Workspace order queries |
| subscription | workspaceId | subscription_workspaceId_idx | Workspace subscription queries |
| invoice | workspaceId | invoice_workspaceId_idx | Workspace invoice queries |
| wallet | workspaceId | wallet_workspaceId_idx | Workspace wallet queries |

#### 6. Missing Soft Delete

Some tables that should support soft delete lack the `deletedAt` column:

| Table | Has deletedAt | Recommendation |
|-------|---------------|----------------|
| apiKey | ✅ Yes | — |
| webhook | ✅ Yes | — |
| featureFlag | ❌ No | Add for feature flag archival |
| systemSetting | ❌ No | Add for setting archival |

---

## Recommendations

1. **Fix duplicate variable names** — Rename to `platformApiKey`, `campaignCoupon`, `campaignVoucher` and re-export with clear module boundaries.

2. **Add missing FK constraints** — Add FK constraints for `wallet.workspaceId`, `subscription.workspaceId`, `order.workspaceId` referencing `workspace.id`.

3. **Standardize naming** — Add explicit SQL names (`tableName: "snake_case_name"`) to all table definitions.

4. **Rebuild migration journal** — Audit all 39 SQL files and rebuild the journal for proper migration tracking.

5. **Add missing indexes** — Add indexes on `workspaceId` columns for commerce and billing tables.

6. **Add soft delete support** — Add `deletedAt` column to feature flags and system settings tables.

7. **Document FK relationships** — Create a FK reference document for all tables with cascade rules.
