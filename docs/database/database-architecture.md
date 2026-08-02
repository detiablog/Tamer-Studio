# Database Architecture

## Overview

| Metric | Value |
|--------|-------|
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Total Tables | 388 |
| Schema Files | 62 |
| Migration Files | 39 |
| Repository Files | 61 |
| Service Files | 170+ |
| Seed Files | 7 |

## ER Diagram

### Core User & Authentication

```
┌─────────────┐
│    user      │
│─────────────│
│ id (PK)      │
│ email        │
│ name         │
│ avatar_url   │
│ status       │
│ created_at   │
│ updated_at   │
└──────┬──────┘
       │
       ├──1:N──▶┌─────────────┐
       │        │   session    │
       │        │─────────────│
       │        │ id (PK)      │
       │        │ userId (FK)  │
       │        │ expiresAt    │
       │        └─────────────┘
       │
       ├──1:N──▶┌─────────────┐
       │        │   account    │
       │        │─────────────│
       │        │ id (PK)      │
       │        │ userId (FK)  │
       │        │ provider     │
       │        └─────────────┘
       │
       ├──1:N──▶┌──────────────┐
       │        │  workspace    │
       │        │──────────────│
       │        │ id (PK)       │
       │        │ ownerId (FK)  │
       │        │ name          │
       │        └──────┬───────┘
       │               │
       │               ├──1:N──▶┌─────────────────┐
       │               │        │ workspaceMember   │
       │               │        │─────────────────│
       │               │        │ id (PK)          │
       │               │        │ workspaceId (FK) │
       │               │        │ userId (FK)      │
       │               │        │ roleId (FK)      │
       │               │        └─────────────────┘
       │               │
       │               ├──1:N──▶┌─────────────┐
       │               │        │   wallet      │
       │               │        │─────────────│
       │               │        │ id (PK)      │
       │               │        │ workspaceId  │
       │               │        └──────┬──────┘
       │               │               │
       │               │               ├──1:N──▶┌──────────────────┐
       │               │               │        │ creditTransaction │
       │               │               │        │──────────────────│
       │               │               │        │ id (PK)          │
       │               │               │        │ walletId (FK)    │
       │               │               │        └──────────────────┘
       │               │               │
       │               │               └──1:N──▶┌──────────────────┐
       │               │                        │ creditReservation │
       │               │                        │──────────────────│
       │               │                        │ id (PK)          │
       │               │                        │ walletId (FK)    │
       │               │                        └──────────────────┘
       │               │
       │               ├──1:N──▶┌─────────────────┐
       │               │        │  subscription    │
       │               │        │─────────────────│
       │               │        │ id (PK)          │
       │               │        │ workspaceId      │
       │               │        └─────────────────┘
       │               │
       │               └──1:N──▶┌─────────────┐
       │                        │   order       │
       │                        │─────────────│
       │                        │ id (PK)      │
       │                        └──────┬──────┘
       │                               │
       │                               ├──1:N──▶┌────────────────┐
       │                               │        │ checkoutSession │
       │                               │        │────────────────│
       │                               │        │ id (PK)        │
       │                               │        │ orderId (FK)   │
       │                               │        └───────┬────────┘
       │                               │                │
       │                               │                └──1:N──▶┌──────────────┐
       │                               │                         │ paymentIntent │
       │                               │                         │──────────────│
       │                               │                         │ id (PK)      │
       │                               │                         │ orderId (FK) │
       │                               │                         └──────┬───────┘
       │                               │                                │
       │                               │                                └──1:N──▶┌────────────────┐
       │                               │                                         │ paymentAttempt   │
       │                               │                                         │────────────────│
       │                               │                                         │ id (PK)        │
       │                               │                                         │ paymentIntentId │
       │                               │                                         └────────────────┘
       │                               │
       │                               └──1:N──▶┌──────────┐
       │                                        │  refund   │
       │                                        │──────────│
       │                                        │ id (PK)  │
       │                                        │ orderId  │
       │                                        └──────────┘
       │
       ├──1:N──▶┌──────────────┐
       │        │  invitation   │
       │        │──────────────│
       │        │ id (PK)       │
       │        │ email         │
       │        │ workspaceId   │
       │        └───────────────┘
       │
       └──1:N──▶┌─────────────┐
                │   apiKey      │
                │─────────────│
                │ id (PK)      │
                │ userId (FK)  │
                └─────────────┘
```

### RBAC

```
┌─────────────┐       ┌────────────────────┐       ┌─────────────┐
│    role      │──1:N─▶│  rolePermission     │◀─N:1─│  permission  │
│─────────────│       │────────────────────│       │─────────────│
│ id (PK)      │       │ id (PK)            │       │ id (PK)      │
│ name         │       │ roleId (FK)        │       │ name         │
│ workspaceId  │       │ permissionId (FK)  │       │ resource     │
│ isSystem     │       │ createdAt          │       │ action       │
└─────────────┘       └────────────────────┘       │ isSystem     │
                                                   └─────────────┘
```

### CMS & Landing

```
┌──────────────┐
│ landingSection│──1:N──▶┌──────────────┐
│──────────────│        │ landingMedia  │
│ id (PK)      │        │──────────────│
│ slug         │        │ id (PK)      │
│ sortOrder    │        │ sectionId(FK)│
└──────────────┘        └──────────────┘

┌─────────────┐
│  cmsPage     │──1:N──▶┌──────────────┐
│─────────────│        │  cmsSection   │
│ id (PK)      │        │──────────────│
│ slug         │        │ id (PK)      │
│ status       │        │ pageId (FK)  │
└─────────────┘        └──────┬───────┘
                              │
                              └──1:N──▶┌──────────────┐
                                       │   cmsBlock    │
                                       │──────────────│
                                       │ id (PK)      │
                                       │ sectionId(FK)│
                                       └──────────────┘

┌─────────────────────┐──1:N──▶┌──────────────────┐
│ cmsPublishPipeline   │        │  cmsPublishStep   │
│─────────────────────│        │──────────────────│
│ id (PK)              │        │ id (PK)          │
│ pageId               │        │ pipelineId (FK)  │
└─────────────────────┘        └──────────────────┘
```

## Module Dependency Map

```
┌─────────────────────────────────────────────────────────────────┐
│                      Module Dependencies                         │
├──────────────────┬───────────────────────────────────────────────┤
│ Module           │ Depends On                                    │
├──────────────────┼───────────────────────────────────────────────┤
│ auth             │ identity                                      │
│ identity         │ (none - foundational)                         │
│ workspace        │ identity                                      │
│ rbac             │ identity, workspace                           │
│ api-platform     │ identity, workspace, rbac                     │
│ billing          │ workspace, commerce                           │
│ commerce         │ workspace                                     │
│ subscription     │ workspace, commerce, billing                  │
│ cms              │ identity, workspace                           │
│ landing          │ identity, workspace, cms                      │
│ analytics        │ identity, workspace                           │
│ audit            │ identity, workspace                           │
│ notifications    │ identity, workspace                           │
│ support          │ identity, workspace                           │
│ assets           │ identity, workspace                           │
│ feature-flags    │ workspace                                     │
│ ai               │ identity, workspace, feature-flags            │
│ jobs             │ identity, workspace                           │
│ queues           │ identity, workspace, jobs                     │
│ workflows        │ identity, workspace, jobs, queues             │
│ admin            │ identity, workspace, rbac, billing            │
│ webhooks         │ identity, workspace                           │
│ localization     │ identity                                      │
│ email            │ identity, workspace                           │
│ system-settings  │ (none - foundational)                         │
│ user-preferences │ identity                                      │
│ hypercare        │ identity, workspace                           │
│ product-intel    │ identity, workspace                           │
└──────────────────┴───────────────────────────────────────────────┘
```

## Table Ownership Matrix

| Module | Schema Files | Owned Tables |
|--------|-------------|--------------|
| identity | identity.schema.ts | user, session, account, verification, userProfile |
| workspace | workspace.schema.ts | workspace, workspaceMember, invitation |
| rbac | rbac.schema.ts | role, permission, rolePermission, workspaceRole |
| auth | auth.schema.ts | authEvent |
| api-platform | api-platform.schema.ts | apiKey, apiUsage, apiRateLimit |
| billing | billing.schema.ts | wallet, creditTransaction, creditReservation, invoice, invoiceLineItem |
| commerce | commerce.schema.ts | order, checkoutSession, paymentIntent, paymentAttempt, refund, coupon, couponUsage, plan, planFeature |
| subscription | subscription.schema.ts | subscription, subscriptionPlan, subscriptionUsage |
| cms | cms.schema.ts | cmsPage, cmsSection, cmsBlock, cmsMedia, cmsPublishPipeline, cmsPublishStep |
| landing | landing.schema.ts | landingSection, landingMedia, landingPage |
| analytics | analytics.schema.ts | analyticsEvent, analyticsSession, analyticsPageView |
| audit | audit.schema.ts | auditLog, auditArchive |
| notifications | notification.schema.ts | notification, notificationPreference, notificationTemplate |
| support | support.schema.ts | ticket, ticketMessage, ticketAttachment |
| assets | asset.schema.ts | asset, assetFolder |
| feature-flags | feature-flag.schema.ts | featureFlag, featureFlagOverride |
| ai | ai.schema.ts | aiProvider, aiModel, aiUsage, aiPrompt, aiCompletion |
| jobs | job.schema.ts | job, jobRun, jobSchedule |
| queue | queue.schema.ts | queue, queueJob, queueWorker |
| workflows | workflow.schema.ts | workflow, workflowStep, workflowRun, workflowStepRun |
| admin | admin.schema.ts | adminSetting, adminAuditLog |
| webhooks | webhook.schema.ts | webhook, webhookDelivery |
| localization | localization.schema.ts | locale, translation, translationNamespace |
| email | email.schema.ts | emailTemplate, emailLog, emailBounce |
| system-settings | system-setting.schema.ts | systemSetting |
| user-preferences | user-preference.schema.ts | userPreference |
| hypercare | hypercare.schema.ts | hypercareAlert, hypercareMetric |
| product-intel | product-intelligence.schema.ts | productInsight, productMetric |

## Repository Ownership Matrix

| Module | Repository File | Tables Accessed |
|--------|----------------|-----------------|
| identity | user.repository.ts, session.repository.ts | user, session, account |
| workspace | workspace.repository.ts, workspace-member.repository.ts | workspace, workspaceMember, invitation |
| rbac | role.repository.ts, permission.repository.ts | role, permission, rolePermission |
| api-platform | api-key.repository.ts | apiKey, apiUsage |
| billing | wallet.repository.ts, invoice.repository.ts | wallet, creditTransaction, invoice |
| commerce | order.repository.ts, plan.repository.ts | order, checkoutSession, plan |
| subscription | subscription.repository.ts | subscription |
| cms | cms-page.repository.ts, cms-section.repository.ts | cmsPage, cmsSection, cmsBlock |
| landing | landing-section.repository.ts | landingSection, landingMedia |
| analytics | analytics.repository.ts | analyticsEvent, analyticsSession |
| audit | audit.repository.ts | auditLog |
| notifications | notification.repository.ts | notification |
| support | ticket.repository.ts | ticket, ticketMessage |
| assets | asset.repository.ts | asset, assetFolder |
| feature-flags | feature-flag.repository.ts | featureFlag, featureFlagOverride |
| ai | ai-provider.repository.ts, ai-usage.repository.ts | aiProvider, aiModel, aiUsage |
| jobs | job.repository.ts | job, jobRun |
| queue | queue.repository.ts | queue, queueJob |
| workflows | workflow.repository.ts | workflow, workflowStep, workflowRun |
| admin | admin-setting.repository.ts | systemSetting |
| webhooks | webhook.repository.ts | webhook, webhookDelivery |
| localization | locale.repository.ts | locale, translation |
| email | email-template.repository.ts | emailTemplate, emailLog |
| hypercare | hypercare.repository.ts | hypercareAlert, hypercareMetric |
| product-intel | product-intelligence.repository.ts | productInsight, productMetric |

## Service Ownership Matrix

| Module | Service File | Primary Responsibilities |
|--------|-------------|------------------------|
| identity | user.service.ts, session.service.ts | User CRUD, session management, profile |
| workspace | workspace.service.ts, workspace-member.service.ts | Workspace CRUD, member management, invitations |
| rbac | role.service.ts, permission.service.ts | Role CRUD, permission assignment, access control |
| api-platform | api-key.service.ts | API key lifecycle, rate limiting, usage tracking |
| billing | wallet.service.ts, invoice.service.ts | Credit management, invoicing |
| commerce | order.service.ts, plan.service.ts, coupon.service.ts | Order lifecycle, plan management, coupon system |
| subscription | subscription.service.ts | Subscription lifecycle, usage tracking |
| cms | cms.service.ts | Page management, section CRUD, publishing |
| landing | landing.service.ts, landing-seed.service.ts | Landing page management, section seeding |
| analytics | analytics.service.ts | Event tracking, session tracking |
| audit | audit.service.ts | Audit logging, archive management |
| notifications | notification.service.ts | Notification delivery, preference management |
| support | ticket.service.ts | Ticket lifecycle, message management |
| assets | asset.service.ts | Asset upload, folder management |
| feature-flags | feature-flag.service.ts | Flag evaluation, override management |
| ai | ai-provider.service.ts, ai-completion.service.ts | Provider management, completion handling |
| jobs | job.service.ts, job-scheduler.service.ts | Job execution, scheduling |
| queue | queue.service.ts | Queue management, job processing |
| workflows | workflow.service.ts | Workflow execution, step management |
| admin | admin.service.ts | System settings, admin operations |
| webhooks | webhook.service.ts | Webhook delivery, retry logic |
| localization | localization.service.ts | Locale management, translation management |
| email | email.service.ts | Email sending, template rendering |
| hypercare | hypercare.service.ts | Alert monitoring, metric collection |
| product-intel | product-intelligence.service.ts | Insight generation, metric tracking |

## Migration Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│ Schema Files │────▶│ Drizzle Kit   │────▶│  SQL Files    │────▶│ PostgreSQL │
│ *.ts         │     │ push / generate│     │ drizzle/*.sql │     │ Database   │
└─────────────┘     └──────────────┘     └──────────────┘     └────────────┘

1. Developer modifies schema/*.ts files
2. Run `npx drizzle-kit generate` to produce SQL migration files
3. SQL files written to ./drizzle/ directory
4. Run `npx drizzle-kit push` or apply SQL to PostgreSQL
5. Drizzle tracks applied migrations in __drizzle_migrations table
```

## Seed Flow

### Installation Seeds

```
┌──────────────────┐
│ POST /api/install │
│──────────────────│
│ 1. Create Roles   │
│ 2. Create Perms   │
│ 3. Create Admin   │
│ 4. Create Plans   │
│ 5. Create Landing │
└──────────────────┘
```

### Development Seeds

```
┌──────────────────┐
│ pnpm seed         │
│──────────────────│
│ 1. Clear Tables   │  ← Destructive
│ 2. Create Users   │
│ 3. Create Workspaces│
│ 4. Create Test Data │
└──────────────────┘
```

### Test Seeds

```
┌──────────────────┐
│ Test Runner       │
│──────────────────│
│ 1. Setup DB       │
│ 2. Run Fixtures   │  ← Idempotent
│ 3. Run Tests      │
│ 4. Teardown DB    │
└──────────────────┘
```

## Configuration Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ .env          │────▶│ drizzle.config│────▶│ drizzle-kit   │
│ DATABASE_URL  │     │ .ts           │     │ generate/push │
└──────────────┘     └──────────────┘     └──────────────┘

drizzle.config.ts:
  - schema: ./src/lib/db/schema/**/*.ts
  - out: ./drizzle
  - dialect: postgresql
  - dbCredentials.url: process.env.DATABASE_URL
```

## Authentication Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Login    │───▶│ Session   │───▶│  Auth     │───▶│  Route    │
│  Request  │    │  Create   │    │  Guard    │    │  Handler  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
  credentials    session table    verify token    authenticated
  validation     insert row       check expiry    request
```

## Installation Flow

```
┌──────────────┐
│ GET /api/install │
│──────────────│
│ Check if setup   │
│ is complete      │
└───────┬──────────┘
        │ (not complete)
        ▼
┌──────────────┐
│ POST /api/install │
│──────────────│
│ 1. Validate input │
│ 2. Create founder │
│ 3. Create workspace│
│ 4. Seed roles     │
│ 5. Seed permissions│
│ 6. Seed plans     │
│ 7. Seed landing   │
│ 8. Return token   │
└──────────────────┘
```

## RBAC Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Request  │───▶│ Extract   │───▶│  Load     │───▶│  Check    │
│  Handler  │    │  User     │    │  Roles    │    │  Perms    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
     │               │               │               │
     ▼               ▼               ▼               ▼
  hasPermission   session.userId   rolePermission   permission
                   → workspaceMember → role          .resource
                                                  → .action
                                                  match?
```
