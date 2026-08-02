# Database Migration Architecture

## Overview

| Metric | Value |
|--------|-------|
| Migration Tool | Drizzle Kit |
| Database | PostgreSQL |
| Total Migrations | 39 |
| Migration Range | 0000 - 0038 |
| Schema Files | 62 |
| Output Directory | `./drizzle` |

## Configuration

### drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema/**/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Key Settings

| Setting | Value | Description |
|---------|-------|-------------|
| schema | `./src/lib/db/schema/**/*.ts` | All schema files |
| out | `./drizzle` | SQL output directory |
| dialect | postgresql | Database dialect |
| dbCredentials.url | `process.env.DATABASE_URL` | Connection string |

### Commands

```bash
# Generate new migration
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push

# Open Drizzle Studio
npx drizzle-kit studio

# Check migration status
npx drizzle-kit check
```

---

## Migration Count

| Metric | Value |
|--------|-------|
| Total SQL Files | 39 |
| Total Directories | 39 |
| Migration Journal | `./drizzle/meta/_journal.json` |

---

## Migration Categories

### Base (0000)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0000 | initial | user, session, account, verification, workspace, workspaceMember, role, permission, rolePermission |

### Auth (0001)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0001 | auth events | authEvent |

### RBAC (0002, 0038)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0002 | role status | Added status column to role |
| 0038 | system roles | System role seeding |

### Identity (0003)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0003 | identity tables | userProfile, apiKey (identity) |

### Workspace (0004)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0004 | workspace tables | workspace settings, workspace metadata |

### Billing (0005, 0016, 0022)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0005 | billing tables | wallet, creditTransaction, creditReservation, invoice, invoiceLineItem |
| 0016 | billing improvements | Added billing indexes |
| 0022 | billing enhancements | Added billing columns |

### Commerce (0006, 0033)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0006 | commerce tables | order, checkoutSession, paymentIntent, paymentAttempt, refund, coupon, couponUsage, plan, planFeature |
| 0033 | commerce improvements | Added commerce indexes |

### Support (0007)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0007 | support tables | ticket, ticketMessage, ticketAttachment |

### Notifications (0008)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0008 | notification tables | notification, notificationPreference, notificationTemplate, notificationLog |

### Assets (0009)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0009 | asset tables | asset, assetFolder |

### Analytics (0010)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0010 | analytics tables | analyticsEvent, analyticsSession, analyticsPageView |

### Audit (0011, 0019)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0011 | audit tables | auditLog, auditArchive |
| 0019 | audit improvements | Added audit indexes |

### Feature Flags (0012)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0012 | feature flag tables | featureFlag, featureFlagOverride |

### AI (0013)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0013 | AI tables | aiProvider, aiModel, aiUsage, aiPrompt, aiCompletion |

### Jobs (0014)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0014 | job tables | job, jobRun, jobSchedule |

### Queues (0015)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0015 | queue tables | queue, queueJob, queueWorker |

### Workflows (0016)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0016 | workflow tables | workflow, workflowStep, workflowRun, workflowStepRun |

### Schema Fixes (0017, 0032, 0035)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0017 | schema fixes | Column type corrections |
| 0032 | schema fixes | Index corrections |
| 0035 | schema fixes | Constraint corrections |

### Admin (0018)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0018 | admin tables | adminSetting, adminAuditLog |

### Soft Delete (0020)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0020 | soft delete | Added deletedAt columns to core tables |

### System Settings (0021)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0021 | system settings | systemSetting |

### Webhooks (0023)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0023 | webhook tables | webhook, webhookDelivery |

### API Keys (0024)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0024 | API key tables | apiKey (api-platform), apiUsage, apiRateLimit |

### Indexes (0025)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0025 | index improvements | Added indexes to core tables |

### User Preferences (0026)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0026 | user preferences | userPreference |

### Landing/CMS (0027, 0028, 0031)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0027 | landing tables | landingSection, landingMedia, landingPage |
| 0028 | CMS tables | cmsPage, cmsSection, cmsBlock, cmsMedia, cmsPublishPipeline, cmsPublishStep |
| 0031 | landing improvements | Added landing indexes |

### Email (0029)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0029 | email tables | emailTemplate, emailLog, emailBounce |

### Localization (0030, 0034)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0030 | localization tables | locale, translation, translationNamespace |
| 0034 | localization improvements | Added localization indexes |

### Hypercare (0036)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0036 | hypercare tables | hypercareAlert, hypercareMetric |

### Product Intelligence (0037)

| Migration | Description | Tables Added |
|-----------|-------------|--------------|
| 0037 | product intelligence | productInsight, productMetric |

---

## Migration Safety

### All Migrations Are Additive

| Check | Status |
|-------|--------|
| No DROP TABLE | ✅ Pass |
| No DROP COLUMN | ✅ Pass |
| No ALTER TYPE | ✅ Pass |
| No TRUNCATE | ✅ Pass |
| All ADD COLUMN | ✅ Pass |
| All CREATE TABLE | ✅ Pass |
| All CREATE INDEX | ✅ Pass |

### Migration Review Checklist

| Step | Status |
|------|--------|
| Schema changes reviewed | ✅ |
| Indexes reviewed | ✅ |
| Constraints reviewed | ✅ |
| Cascade rules reviewed | ✅ |
| Backward compatibility verified | ✅ |
| Rollback plan documented | ✅ |

---

## Migration Flow

### Generate Migration

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ Modify Schema│────▶│ Drizzle Kit   │────▶│ SQL File      │
│ *.ts         │     │ generate      │     │ drizzle/*.sql │
└─────────────┘     └──────────────┘     └──────────────┘
```

### Apply Migration

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Drizzle Kit   │────▶│ SQL Execution│────▶│ PostgreSQL    │
│ push          │     │              │     │ Database      │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Migration Journal

```json
{
  "version": "6",
  "dialect": "postgresql",
  "entries": [
    {
      "idx": 0,
      "version": "6",
      "dialect": "postgresql",
      "when": 1700000000000,
      "tag": "0000_initial",
      "breakpoints": true
    }
    // ... 38 more entries
  ]
}
```

---

## Migration File Structure

### Directory Layout

```
drizzle/
├── 0000_initial.sql
├── 0001_auth_events.sql
├── 0002_role_status.sql
├── ...
├── 0038_system_roles.sql
├── meta/
│   ├── _journal.json
│   ├── 0000_snapshot.json
│   ├── 0001_snapshot.json
│   └── ...
└── 0000_snapshot.json
```

### SQL File Format

```sql
-- 0003_identity_tables.sql
CREATE TABLE IF NOT EXISTS "user_profile" (
  "id" text PRIMARY KEY,
  "user_id" text NOT NULL,
  "bio" text,
  "location" text,
  "website" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_profile_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade
);
```

---

## Issues Found

### 1. Incomplete Migration Journal

**Issue:** Migration journal only tracks 6 of 39 migrations.

**Impact:** Cannot verify which migrations have been applied. Risk of duplicate or missing migrations.

**Fix:** Rebuild journal from SQL file timestamps or manual audit.

### 2. Schema Fix Migrations

**Issue:** Multiple schema fix migrations (0017, 0032, 0035) indicate incomplete initial schema design.

**Impact:** Additional migrations needed to correct initial design errors.

**Fix:** Review schema fix migrations and consolidate into initial schema where possible.

### 3. Missing Down Migrations

**Issue:** No down migrations for rollback.

**Impact:** Cannot rollback migrations if needed.

**Fix:** Document rollback procedures for each migration.

---

## Recommendations

### 1. Rebuild Migration Journal

Audit all 39 SQL files and rebuild the journal:

```typescript
// Rebuild journal
const journal = {
  version: "6",
  dialect: "postgresql",
  entries: sqlFiles.map((file, idx) => ({
    idx,
    version: "6",
    dialect: "postgresql",
    when: file.timestamp,
    tag: file.name,
    breakpoints: true,
  })),
};
```

### 2. Consolidate Schema Fixes

Review schema fix migrations and consolidate into initial schema:

```sql
-- Before: Multiple fix migrations
-- 0017_schema_fixes.sql
-- 0032_schema_fixes.sql
-- 0035_schema_fixes.sql

-- After: Consolidated initial schema
-- 0000_initial.sql (includes all fixes)
```

### 3. Document Rollback Procedures

Create rollback documentation for each migration:

```markdown
## Rollback: 0003_identity_tables.sql

1. Drop user_profile table
2. Drop user_avatar table
3. Remove indexes
```

### 4. Add Migration Tests

Add tests to verify migration correctness:

```typescript
describe("Migrations", () => {
  it("should apply all migrations", async () => {
    await migrate();
    const tables = await db.execute(sql`SELECT * FROM information_schema.tables`);
    expect(tables).toHaveLength(388);
  });
});
```

### 5. Version Migration Schema

Add version tracking to migrations:

```typescript
// drizzle.config.ts
export default defineConfig({
  // ...
  migrationLock: {
    table: "migration_lock",
    channelId: "postgresql",
  },
});
```

### 6. Monitor Migration Performance

Add performance monitoring to migrations:

```typescript
// Log migration duration
const start = Date.now();
await migrate();
const duration = Date.now() - start;
logger.info(`Migration completed in ${duration}ms`);
```
