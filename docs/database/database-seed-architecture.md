# Database Seed Architecture

## Overview

| Seed Type | Purpose | Execution | Idempotent |
|-----------|---------|-----------|------------|
| Installation | Setup system on first run | Once during install | Yes |
| Development | Populate dev environment | On demand | No (destructive) |
| Test | Provide test fixtures | During test setup | Yes |

---

## Seed Categories

### Installation Seeds

**Purpose:** Bootstrap the system with essential data during installation.

**Execution:** Run once via `POST /api/install` endpoint.

**Data Seeded:**

| Seed | Description | Count |
|------|-------------|-------|
| Roles | Founder (level 3), Admin (level 2), User (level 1) | 3 |
| Permissions | 45 permissions across 3 categories (read, write, admin) | 45 |
| Role-Permission mappings | Permissions assigned to roles | 45+ |
| Admin Bootstrap | Creates founder account and workspace | 1 |
| Commerce Plans | Lite, Creator, Pro plans with features | 3 |
| Landing Sections | 14 landing page sections with media | 14 |

**Seed Files:**

| File | Description |
|------|-------------|
| `src/core/installation/installation.service.ts` | Main installation service with seed methods |
| `src/core/commerce/seed.ts` | Commerce plan seeding |
| `src/core/landing/landing-seed.service.ts` | Landing section seeding |
| `src/core/landing/landing-seed-data.ts` | Landing seed data definitions |

### Development Seeds

**Purpose:** Populate development environment with realistic test data.

**Execution:** Run via `pnpm seed` command.

**Data Seeded:**

| Seed | Description | Count |
|------|-------------|-------|
| Users | Test users with various roles | 10+ |
| Workspaces | Test workspaces | 5+ |
| API Keys | Test API keys | 10+ |
| Feature Flags | Test feature flags | 10+ |
| AI Providers | Test AI providers | 5+ |
| Jobs | Test job definitions | 10+ |
| Queues | Test queue configurations | 5+ |
| Workflows | Test workflow definitions | 5+ |
| Billing | Test billing data | 5+ |
| Coupons | Test coupon codes | 10+ |

**Seed Files:**

| File | Description |
|------|-------------|
| `src/scripts/seed.ts` | Main development seed script |
| `scripts/seed-landing-sections.ts` | CLI wrapper for landing seeds |

### Test Seeds

**Purpose:** Provide deterministic test fixtures for integration tests.

**Execution:** Run during test setup in test runner.

**Data Seeded:**

| Seed | Description | Count |
|------|-------------|-------|
| Users | Minimal test users | 3 |
| Workspaces | Minimal test workspaces | 2 |
| Roles | Test roles | 3 |
| Permissions | Test permissions | 10 |

**Seed Files:**

| File | Description |
|------|-------------|
| `src/test/fixtures/` | Test fixture directory |
| `src/test/fixtures/users.ts` | User fixtures |
| `src/test/fixtures/workspaces.ts` | Workspace fixtures |
| `src/test/fixtures/roles.ts` | Role fixtures |

---

## Seed Files Detail

### Installation Service

**File:** `src/core/installation/installation.service.ts`

```typescript
// Seed Methods:
// - seedRoles(): Creates Founder, Admin, User roles
// - seedPermissions(): Creates 45 permissions
// - seedRolePermissions(): Maps permissions to roles
// - seedAdminBootstrap(): Creates founder account
// - seedCommercePlans(): Creates Lite, Creator, Pro plans
// - seedLandingSections(): Creates 14 landing sections
// - runAll(): Executes all seeds in order
```

### Commerce Seed

**File:** `src/core/commerce/seed.ts`

```typescript
// Seed Methods:
// - seedPlans(): Creates subscription plans
// - seedPlanFeatures(): Creates plan feature mappings
// - Idempotent: Checks before inserting
```

### Landing Seed

**File:** `src/core/landing/landing-seed.service.ts`

```typescript
// Seed Methods:
// - seedSections(): Creates landing sections
// - seedMedia(): Creates landing media
// - Idempotent: Uses upsert pattern
```

### Landing Seed Data

**File:** `src/core/landing/landing-seed-data.ts`

```typescript
// Data Definitions:
// - LANDING_SECTIONS: 14 section definitions
// - SECTION_MEDIA: Media references for sections
// - Section ordering and content
```

### Development Seed

**File:** `src/scripts/seed.ts`

```typescript
// Seed Methods:
// - seedUsers(): Creates test users
// - seedWorkspaces(): Creates test workspaces
// - seedApiKeys(): Creates test API keys
// - seedFeatureFlags(): Creates test feature flags
// - seedAiProviders(): Creates test AI providers
// - seedJobs(): Creates test jobs
// - seedQueues(): Creates test queues
// - seedWorkflows(): Creates test workflows
// - seedBilling(): Creates test billing data
// - seedCoupons(): Creates test coupons
// - destructive: Clears tables before seeding
```

---

## Seed Execution Order

### Installation Flow

```
1. Database Migration
   └── Drizzle Kit push / SQL files
       └── Creates all tables

2. Roles & Permissions
   ├── seedRoles()
   │   ├── Founder (level 3)
   │   ├── Admin (level 2)
   │   └── User (level 1)
   ├── seedPermissions()
   │   ├── 45 permissions
   │   └── 3 categories (read, write, admin)
   └── seedRolePermissions()
       └── Maps permissions to roles

3. Admin/Founder Account
   ├── Create founder user
   ├── Create founder workspace
   └── Assign founder role

4. Commerce Plans
   ├── seedPlans()
   │   ├── Lite plan
   │   ├── Creator plan
   │   └── Pro plan
   └── seedPlanFeatures()
       └── Feature mappings for each plan

5. Landing Sections
   ├── seedSections()
   │   ├── 14 landing sections
   │   └── Section ordering
   └── seedMedia()
       └── Media references

6. Development Data (if applicable)
   └── pnpm seed
       └── Destructive seed
```

### Development Flow

```
1. Clear Tables (destructive)
   ├── Truncate all tables
   └── Reset sequences

2. Create Users
   ├── Test users with various roles
   └── User profiles

3. Create Workspaces
   ├── Test workspaces
   └── Workspace members

4. Create Test Data
   ├── API keys
   ├── Feature flags
   ├── AI providers
   ├── Jobs
   ├── Queues
   ├── Workflows
   ├── Billing data
   └── Coupons
```

### Test Flow

```
1. Setup DB
   ├── Connect to test database
   └── Run migrations

2. Run Fixtures
   ├── Load user fixtures
   ├── Load workspace fixtures
   └── Load role fixtures

3. Run Tests
   └── Execute test suite

4. Teardown DB
   ├── Clear test data
   └── Disconnect
```

---

## Idempotency Analysis

### Installation Seeds

| Seed | Idempotent | Strategy |
|------|------------|----------|
| Roles | ✅ Yes | Check if exists before insert |
| Permissions | ✅ Yes | Check if exists before insert |
| Role-Permission | ✅ Yes | Check if exists before insert |
| Admin Bootstrap | ✅ Yes | Check if user exists |
| Commerce Plans | ✅ Yes | Check if plan exists |
| Landing Sections | ✅ Yes | Upsert pattern |

### Development Seeds

| Seed | Idempotent | Strategy |
|------|------------|----------|
| Users | ❌ No | Destructive (truncates) |
| Workspaces | ❌ No | Destructive (truncates) |
| API Keys | ❌ No | Destructive (truncates) |
| Feature Flags | ❌ No | Destructive (truncates) |
| AI Providers | ❌ No | Destructive (truncates) |
| Jobs | ❌ No | Destructive (truncates) |
| Queues | ❌ No | Destructive (truncates) |
| Workflows | ❌ No | Destructive (truncates) |
| Billing | ❌ No | Destructive (truncates) |
| Coupons | ❌ No | Destructive (truncates) |

### Test Seeds

| Seed | Idempotent | Strategy |
|------|------------|----------|
| User Fixtures | ✅ Yes | Clear and reload |
| Workspace Fixtures | ✅ Yes | Clear and reload |
| Role Fixtures | ✅ Yes | Clear and reload |

---

## Seed Data Examples

### Roles

```typescript
const ROLES = [
  {
    name: "Founder",
    description: "Full system access",
    level: 3,
    isSystem: true,
  },
  {
    name: "Admin",
    description: "Workspace administration",
    level: 2,
    isSystem: true,
  },
  {
    name: "User",
    description: "Basic user access",
    level: 1,
    isSystem: true,
  },
];
```

### Permissions

```typescript
const PERMISSIONS = [
  // Read permissions
  { name: "read:user", resource: "user", action: "read" },
  { name: "read:workspace", resource: "workspace", action: "read" },
  // ... 43 more permissions

  // Write permissions
  { name: "write:user", resource: "user", action: "write" },
  { name: "write:workspace", resource: "workspace", action: "write" },
  // ... more permissions

  // Admin permissions
  { name: "admin:user", resource: "user", action: "admin" },
  { name: "admin:workspace", resource: "workspace", action: "admin" },
  // ... more permissions
];
```

### Commerce Plans

```typescript
const PLANS = [
  {
    name: "Lite",
    description: "For individuals",
    price: 0,
    interval: "month",
    features: ["basic_features"],
  },
  {
    name: "Creator",
    description: "For creators",
    price: 29,
    interval: "month",
    features: ["basic_features", "advanced_features", "analytics"],
  },
  {
    name: "Pro",
    description: "For teams",
    price: 99,
    interval: "month",
    features: ["basic_features", "advanced_features", "analytics", "priority_support", "custom_domain"],
  },
];
```

### Landing Sections

```typescript
const LANDING_SECTIONS = [
  { slug: "hero", title: "Hero Section", sortOrder: 1 },
  { slug: "features", title: "Features", sortOrder: 2 },
  { slug: "pricing", title: "Pricing", sortOrder: 3 },
  { slug: "testimonials", title: "Testimonials", sortOrder: 4 },
  // ... 10 more sections
];
```

---

## Recommendations

### 1. Consolidate Seed Files

**Current:** Multiple seed files scattered across modules.

**Recommendation:** Create a unified seed orchestrator:

```typescript
// src/core/seed/seed-orchestrator.ts
export class SeedOrchestrator {
  async runInstallationSeeds() { ... }
  async runDevelopmentSeeds() { ... }
  async runTestSeeds() { ... }
}
```

### 2. Add Seed Validation

**Current:** No validation of seed data.

**Recommendation:** Add validation:

```typescript
// Validate seed data before inserting
const validatedPlan = planSchema.parse(planData);
```

### 3. Add Seed Logging

**Current:** Minimal logging.

**Recommendation:** Add detailed logging:

```typescript
logger.info("Seeding roles...");
const roles = await seedRoles();
logger.info(`Seeded ${roles.length} roles`);
```

### 4. Add Seed Rollback

**Current:** No rollback mechanism.

**Recommendation:** Add rollback methods:

```typescript
async rollbackInstallationSeeds() {
  await deleteRoles();
  await deletePermissions();
  // ...
}
```

### 5. Add Seed Testing

**Current:** No seed tests.

**Recommendation:** Add seed tests:

```typescript
describe("Installation Seeds", () => {
  it("should seed roles correctly", async () => {
    const roles = await seedRoles();
    expect(roles).toHaveLength(3);
  });
});
```

### 6. Document Seed Dependencies

**Current:** No dependency documentation.

**Recommendation:** Document dependencies:

```typescript
// Seed Dependencies:
// 1. Roles → Permissions (roles must exist before mapping)
// 2. Plans → Features (plans must exist before features)
// 3. Sections → Media (sections must exist before media)
```
