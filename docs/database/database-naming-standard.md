# Database Naming Standard

## Table Names

### Pattern

| Convention | Pattern | Example |
|------------|---------|---------|
| Explicit SQL | `snake_case` | `workspace_member`, `role_permission` |
| Inferred | Drizzle camelCase → snake_case | `workspaceMember` → `workspace_member` |

### Analysis

| Module | Table Variable | SQL Name | Method |
|--------|---------------|----------|--------|
| identity | user | user | explicit |
| identity | session | session | explicit |
| identity | account | account | explicit |
| identity | userProfile | user_profile | inferred |
| workspace | workspace | workspace | explicit |
| workspace | workspaceMember | workspace_member | explicit |
| workspace | invitation | invitation | explicit |
| rbac | role | role | explicit |
| rbac | permission | permission | explicit |
| rbac | rolePermission | role_permission | explicit |
| api-platform | apiKey | api_key | inferred |
| billing | wallet | wallet | explicit |
| billing | creditTransaction | credit_transaction | inferred |
| billing | creditReservation | credit_reservation | inferred |
| billing | invoice | invoice | explicit |
| billing | invoiceLineItem | invoice_line_item | inferred |
| commerce | order | order | explicit |
| commerce | checkoutSession | checkout_session | inferred |
| commerce | paymentIntent | payment_intent | inferred |
| commerce | paymentAttempt | payment_attempt | inferred |
| commerce | refund | refund | explicit |
| commerce | coupon | coupon | explicit |
| commerce | couponUsage | coupon_usage | inferred |
| commerce | plan | plan | explicit |
| commerce | planFeature | plan_feature | inferred |
| subscription | subscription | subscription | explicit |
| subscription | subscriptionPlan | subscription_plan | inferred |
| subscription | subscriptionUsage | subscription_usage | inferred |
| cms | cmsPage | cms_page | explicit |
| cms | cmsSection | cms_section | explicit |
| cms | cmsBlock | cms_block | explicit |
| cms | cmsMedia | cms_media | explicit |
| cms | cmsPublishPipeline | cms_publish_pipeline | inferred |
| cms | cmsPublishStep | cms_publish_step | inferred |
| landing | landingSection | landing_section | explicit |
| landing | landingMedia | landing_media | explicit |
| landing | landingPage | landing_page | explicit |
| analytics | analyticsEvent | analytics_event | inferred |
| analytics | analyticsSession | analytics_session | inferred |
| analytics | analyticsPageView | analytics_page_view | inferred |
| audit | auditLog | audit_log | inferred |
| audit | auditArchive | audit_archive | inferred |
| notifications | notification | notification | explicit |
| notifications | notificationPreference | notification_preference | inferred |
| notifications | notificationTemplate | notification_template | inferred |
| support | ticket | ticket | explicit |
| support | ticketMessage | ticket_message | inferred |
| support | ticketAttachment | ticket_attachment | inferred |
| assets | asset | asset | explicit |
| assets | assetFolder | asset_folder | inferred |
| feature-flags | featureFlag | feature_flag | inferred |
| feature-flags | featureFlagOverride | feature_flag_override | inferred |
| ai | aiProvider | ai_provider | inferred |
| ai | aiModel | ai_model | inferred |
| ai | aiUsage | ai_usage | inferred |
| ai | aiPrompt | ai_prompt | inferred |
| ai | aiCompletion | ai_completion | inferred |
| jobs | job | job | explicit |
| jobs | jobRun | job_run | inferred |
| jobs | jobSchedule | job_schedule | inferred |
| queue | queue | queue | explicit |
| queue | queueJob | queue_job | inferred |
| queue | queueWorker | queue_worker | inferred |
| workflows | workflow | workflow | explicit |
| workflows | workflowStep | workflow_step | inferred |
| workflows | workflowRun | workflow_run | inferred |
| workflows | workflowStepRun | workflow_step_run | inferred |
| admin | adminSetting | admin_setting | inferred |
| admin | adminAuditLog | admin_audit_log | inferred |
| webhooks | webhook | webhook | explicit |
| webhooks | webhookDelivery | webhook_delivery | inferred |
| localization | locale | locale | explicit |
| localization | translation | translation | explicit |
| localization | translationNamespace | translation_namespace | inferred |
| email | emailTemplate | email_template | inferred |
| email | emailLog | email_log | inferred |
| email | emailBounce | email_bounce | inferred |
| system-settings | systemSetting | system_setting | inferred |
| user-preferences | userPreference | user_preference | inferred |
| hypercare | hypercareAlert | hypercare_alert | inferred |
| hypercare | hypercareMetric | hypercare_metric | inferred |
| product-intel | productInsight | product_insight | inferred |
| product-intel | productMetric | product_metric | inferred |

### Consistency Summary

| Method | Count | Percentage |
|--------|-------|------------|
| Explicit SQL name | 28 | 36% |
| Inferred name | 50 | 64% |

**Issue:** 64% of tables use inferred names. This is risky if Drizzle changes inference behavior.

---

## Column Names

### Pattern

| Type | Pattern | Example |
|------|---------|---------|
| Foreign keys | `{referenced_table_singular}_id` | `user_id`, `workspace_id` |
| Timestamps | `created_at`, `updated_at` | `created_at`, `updated_at` |
| Status | `status` | `status` |
| Boolean flags | `is_{name}` | `is_active`, `is_system` |
| Soft delete | `deleted_at` | `deleted_at` |
| Ordering | `sort_order` | `sort_order` |
| Counters | `{name}_count` | `usage_count` |

### Column Analysis

| Table | Column | SQL Name | Inferred |
|-------|--------|----------|----------|
| user | id | id | explicit |
| user | email | email | explicit |
| user | name | name | explicit |
| user | avatarUrl | avatar_url | inferred |
| user | status | status | explicit |
| user | createdAt | created_at | inferred |
| user | updatedAt | updated_at | inferred |
| user | deletedAt | deleted_at | inferred |
| workspace | id | id | explicit |
| workspace | name | name | explicit |
| workspace | ownerId | owner_id | inferred |
| workspace | slug | slug | explicit |
| workspace | status | status | explicit |
| workspace | createdAt | created_at | inferred |
| workspace | updatedAt | updated_at | inferred |
| session | id | id | explicit |
| session | userId | user_id | inferred |
| session | expiresAt | expires_at | inferred |
| session | token | token | explicit |
| role | id | id | explicit |
| role | name | name | explicit |
| role | workspaceId | workspace_id | inferred |
| role | isSystem | is_system | inferred |
| permission | id | id | explicit |
| permission | name | name | explicit |
| permission | resource | resource | explicit |
| permission | action | action | explicit |
| rolePermission | roleId | role_id | inferred |
| rolePermission | permissionId | permission_id | inferred |
| rolePermission | createdAt | created_at | inferred |
| order | id | id | explicit |
| order | status | status | explicit |
| order | totalAmount | total_amount | inferred |
| order | createdAt | created_at | inferred |

### Consistency Summary

| Method | Count | Percentage |
|--------|-------|------------|
| Explicit SQL name | ~45% | 45% |
| Inferred name | ~55% | 55% |

---

## Index Names

### Pattern

| Type | Pattern | Example |
|------|---------|---------|
| Single column | `{table}_{column}_idx` | `session_userId_idx` |
| Unique | `{table}_{column}_unique` | `user_email_unique` |
| Composite | `{table}_{col1}_{col2}_idx` | `rolePermission_roleId_permissionId_idx` |

### Index Analysis

| Table | Index Name | Style |
|-------|------------|-------|
| session | session_userId_idx | camelCase |
| account | account_userId_idx | camelCase |
| workspaceMember | workspaceMember_workspaceId_idx | camelCase |
| rolePermission | rolePermission_roleId_permissionId_idx | camelCase |
| creditTransaction | creditTransaction_walletId_idx | camelCase |
| user | user_email_unique | snake_case |
| user | user_status_idx | snake_case |
| workspace | workspace_slug_unique | snake_case |
| workspace | workspace_status_idx | snake_case |

### Consistency Summary

| Style | Count | Percentage |
|-------|-------|------------|
| camelCase | ~50% | 50% |
| snake_case | ~50% | 50% |

**Issue:** Index naming is inconsistent. Some use camelCase (`session_userId_idx`) while others use snake_case (`user_status_idx`).

---

## Migration Names

### Pattern

```
{sequence}_{description}.sql
```

| Sequence | Range | Count |
|----------|-------|-------|
| Initial | 0000-0009 | 10 |
| Middle | 0010-0019 | 10 |
| Late | 0020-0029 | 10 |
| Final | 0030-0038 | 9 |

### Migration Analysis

| Migration | Description | Category |
|-----------|-------------|----------|
| 0000 | initial | Base |
| 0001 | auth events | Auth |
| 0002 | role status | RBAC |
| 0003 | identity tables | Identity |
| 0004 | workspace tables | Workspace |
| 0005 | billing tables | Billing |
| 0006 | commerce tables | Commerce |
| 0007 | support tables | Support |
| 0008 | notification tables | Notifications |
| 0009 | asset tables | Assets |
| 0010 | analytics tables | Analytics |
| 0011 | audit tables | Audit |
| 0012 | feature flag tables | Feature Flags |
| 0013 | AI tables | AI |
| 0014 | job tables | Jobs |
| 0015 | queue tables | Queues |
| 0016 | workflow tables | Workflows |
| 0017 | schema fixes | Fixes |
| 0018 | admin tables | Admin |
| 0019 | audit improvements | Audit |
| 0020 | soft delete | Schema |
| 0021 | system settings | System |
| 0022 | billing improvements | Billing |
| 0023 | webhook tables | Webhooks |
| 0024 | API key tables | API Platform |
| 0025 | index improvements | Indexes |
| 0026 | user preferences | User Preferences |
| 0027 | landing tables | Landing |
| 0028 | CMS tables | CMS |
| 0029 | email tables | Email |
| 0030 | localization tables | Localization |
| 0031 | landing improvements | Landing |
| 0032 | schema fixes | Fixes |
| 0033 | commerce improvements | Commerce |
| 0034 | localization improvements | Localization |
| 0035 | schema fixes | Fixes |
| 0036 | hypercare tables | Hypercare |
| 0037 | product intelligence | Product Intel |
| 0038 | system roles | RBAC |

### Consistency

| Aspect | Status |
|--------|--------|
| Sequence ordering | ✅ Consistent |
| Description format | ✅ Consistent (snake_case) |
| Category mapping | ⚠️ Some migrations cover multiple categories |

---

## Naming Inconsistencies

### 1. Table SQL Names

**Issue:** Mixed explicit vs inferred SQL names.

**Examples:**
- ✅ Explicit: `workspace_member`, `role_permission`, `cms_page`
- ❌ Inferred: `workspaceMember`, `rolePermission`, `cmsPage`

**Risk:** If Drizzle changes inference behavior, tables may be created with different names.

### 2. Index Naming

**Issue:** Mixed camelCase vs snake_case in index names.

**Examples:**
- camelCase: `session_userId_idx`, `workspaceMember_workspaceId_idx`
- snake_case: `user_status_idx`, `workspace_slug_unique`

**Risk:** Inconsistent naming makes indexes harder to find and maintain.

### 3. Column SQL Names

**Issue:** Mixed explicit vs inferred column SQL names.

**Examples:**
- ✅ Explicit: `created_at`, `user_id`, `workspace_id`
- ❌ Inferred: `createdAt`, `userId`, `workspaceId`

**Risk:** Same as table SQL names.

### 4. Foreign Key Column Names

**Issue:** Some FK columns use `{referencedTable}Id` (camelCase) while others use `{referenced_table}_id` (snake_case).

**Examples:**
- camelCase: `userId`, `workspaceId`, `roleId`
- snake_case: `user_id`, `workspace_id`, `role_id`

**Risk:** Confusion when writing SQL queries.

### 5. Boolean Column Names

**Issue:** Mixed naming conventions for boolean columns.

**Examples:**
- `is_active`, `is_system`, `is_public` (snake_case)
- `isActive`, `isSystem`, `isPublic` (camelCase)

**Risk:** Inconsistent naming makes queries harder to write.

---

## Recommendations

### 1. Standardize Table SQL Names

Add explicit SQL names to ALL table definitions:

```typescript
export const workspaceMember = pgTable("workspace_member", {
  // ... columns
});
```

### 2. Standardize Index Names

Use snake_case for ALL index names:

```typescript
index("session_user_id_idx").on(session.userId)
```

### 3. Standardize Column SQL Names

Add explicit SQL names to ALL column definitions:

```typescript
userId: text("user_id").notNull(),
```

### 4. Document Naming Convention

Create a naming convention document that specifies:
- Table names: snake_case
- Column names: snake_case
- Index names: snake_case
- FK columns: `{referenced_table}_id`
- Boolean columns: `is_{name}`
- Timestamps: `created_at`, `updated_at`, `deleted_at`

### 5. Enforce Convention in Code Review

Add naming convention checks to PR review:
- All tables must have explicit SQL names
- All columns must have explicit SQL names
- All indexes must use snake_case
- All FK columns must use `{referenced_table}_id` pattern
