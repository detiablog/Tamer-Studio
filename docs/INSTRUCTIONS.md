# P0 :: CORE

RULE Runtime \> Report

RULE Browser \> Build

RULE Existing \> New

RULE Reuse \> Improve \> Extend

RULE Architecture \> Feature

RULE Quality \> Speed

RULE Database = SSOT

RULE Documentation != Truth

RULE Browser = Truth

FAIL Build PASS != Runtime PASS

------------------------------------------------------------------------

# P0 :: FROZEN

LOCK

-   Database Architecture
-   RBAC
-   Better Auth
-   Installation Runtime
-   Bootstrap
-   Configuration
-   Environment
-   Migration Architecture
-   Seed Architecture

ALLOW

-   Bug Fix
-   Security Fix
-   Performance
-   Additive Feature

FORBIDDEN

-   Rewrite Architecture
-   Replace Runtime
-   Auth V2
-   Session V2
-   Repository V2
-   Service V2
-   Middleware V2

------------------------------------------------------------------------

# EXISTING FIRST

FLOW

Audit → Existing → Reuse → Improve → Extend

NEVER

Search → Rewrite

IF Existing \>=70%

Improve.

Do NOT recreate.

------------------------------------------------------------------------

# ACTIVE RUNTIME

VERIFY

Route → Layout → Page → Component → Child

Only modify active runtime.

Never modify dead code.

Never assume newest file is active.

------------------------------------------------------------------------

# IMPACT

CHECK

UI API Database Repository Service Auth Session Cookie Middleware RBAC
Navigation Installation Landing CMS Billing AI Runtime Localization

Every affected module must be verified.

------------------------------------------------------------------------

# DATABASE

Database = SSOT

NO

Hardcoded URL Hardcoded Secret Hardcoded Email Hardcoded Currency
Hardcoded Locale Hardcoded Domain

Schema

Additive First

Backward Compatible

No destructive migration without Architecture Sprint.

------------------------------------------------------------------------

# RBAC

Role = Identity

Permission = Capability

FeatureFlag = Availability

FLOW

Feature Enabled → Permission Granted → Access

Never authorize by role alone.

Roles

Guest User Admin Founder

No additional system roles.

------------------------------------------------------------------------

# AUTH

Reuse Better Auth.

Reuse Session.

Reuse Middleware.

Reuse Cookie.

Founder

Email Password MasterKey

Admin

Email Password

Never create parallel authentication.

------------------------------------------------------------------------

# INSTALL

Reuse

Migration Bootstrap RBAC BetterAuth Seeds

Installer creates Founder only.

------------------------------------------------------------------------

# UI

Responsive Required

Dark Mode Compatible

Accessible

No Placeholder

No Missing i18n

Permission Driven

FeatureFlag Aware

------------------------------------------------------------------------

# API

Thin Controller

Service Logic

Repository Access

Validate Input

Consistent Response

Audit Sensitive Action

------------------------------------------------------------------------

# LOCALIZATION

Every new text

EN ID

No raw string.

No missing key.

------------------------------------------------------------------------

# REPORT

Always include

Reused Improved Created Modified Database API UI Known Risk Regression
Next Sprint

Reports are not proof.

------------------------------------------------------------------------

# VERIFY

Browser

Console

Network

Database

Route

Permission

Session

Cookie

Localization

Responsive

Audit Log

------------------------------------------------------------------------

# REGRESSION

Every change must verify

Authentication

Authorization

Navigation

Database

Installation

Landing

CMS

Billing

AI Runtime

User Dashboard

Admin Dashboard

------------------------------------------------------------------------

# TECHNICAL DEBT

Found issue?

Choose

KEEP

IMPROVE

MERGE

REMOVE

Never ignore.

Leave project cleaner than before.

------------------------------------------------------------------------

# FORBIDDEN

Duplicate Component

Duplicate Route

Duplicate API

Duplicate Repository

Duplicate Service

Duplicate Runtime

Duplicate Middleware

Duplicate Auth

Unused Component Modification

Legacy Runtime Modification

Fake PASS Report

------------------------------------------------------------------------

# DONE

Required

Build PASS

Lint PASS

Runtime PASS

Browser PASS

Regression PASS

Permission PASS

Database PASS

Localization PASS

Protected Route PASS

End-to-End PASS

Otherwise

NOT COMPLETE.

------------------------------------------------------------------------

# SPRINT

Audit

↓

Dependency

↓

Runtime Dependency

↓

Impact

↓

Implementation

↓

Runtime Verify

↓

Regression

↓

End-to-End

↓

Report

↓

Done

Skipping phases is forbidden.

------------------------------------------------------------------------

# ENGINEERING LAW

Every Sprint

Reduce Technical Debt

Increase Consistency

Preserve Architecture

Improve Documentation

Never sacrifice Runtime for Report.

Reality over Reports.

------------------------------------------------------------------------

# ACTIVE RUNTIME DISCOVERY

RULE

Before modifying ANY runtime:

1.  Discover every implementation.
2.  Identify ACTIVE implementation.
3.  Identify LEGACY implementations.
4.  Modify ONLY the ACTIVE implementation.
5.  Never modify inactive runtime.
6.  Never create RuntimeV2/AuthV2/LoginV2.
7.  If multiple implementations exist:
    -   STOP
    -   Generate Runtime Map
    -   Recover approved runtime
    -   Do not create another implementation

------------------------------------------------------------------------

# APPROVED MODIFICATION LIST

Before implementation:

Generate:

Approved Modification List

Only listed files may be modified.

If another file becomes necessary:

STOP

Explain dependency.

Request approval.

------------------------------------------------------------------------

# PROTECTED FILES

Protected (immutable unless sprint explicitly targets them):

.env* next.config.* package.json tsconfig.json proxy.ts middleware.ts
bootstrap.ts config.ts auth.ts permissions.ts installation.service.ts
db/client.ts

Never modify protected files outside approved scope.

------------------------------------------------------------------------

# SCOPE LOCK

One Sprint

One Objective

Forbidden:

Cleanup outside scope Refactor outside scope Optimization outside scope
Rename outside scope Delete outside scope

No "while I'm here" changes.

------------------------------------------------------------------------

# CHANGE BUDGET

Small Sprint: \<=10 files

Medium Sprint: \<=25 files

Large Sprint: \<=50 files

If budget exceeded:

STOP

Split into another sprint.

------------------------------------------------------------------------

# ROOT CAUSE

Never fix symptoms.

Trace:

Runtime → Layout → Middleware/Proxy → Session → Cookie → Permission →
API → Repository → Database

Fix ONLY the root cause.

------------------------------------------------------------------------

# ENVIRONMENT PROTECTION

Protected variables:

Founder credentials Founder master key Founder master key hash Better
Auth secret JWT secret Database credentials SMTP credentials Storage
credentials Payment credentials AI provider credentials

Never delete, rename, rotate or regenerate outside dedicated
Environment/Auth/Installation/Security sprints.

------------------------------------------------------------------------

# RESTORE POLICY

If regression appears:

STOP development.

Identify:

Last working runtime

Current runtime

Minimal diff

Restore minimal change.

Do not stack fixes.

------------------------------------------------------------------------

# BUILD QUALITY LAW

Every sprint must finish with:

pnpm lint

pnpm typecheck

pnpm build

Browser verification

If one fails:

SPRINT FAILED.

------------------------------------------------------------------------

# TYPE SAFETY LAW

TypeScript errors:

0

No @ts-ignore

No unnecessary any

No hidden bypass.

------------------------------------------------------------------------

# COMPLETION

Sprint is COMPLETE only if:

Runtime PASS

Browser PASS

API PASS

Protected Routes PASS

Regression PASS

Build PASS

Typecheck PASS

Lint PASS

Reports support evidence.

Runtime is the source of truth.