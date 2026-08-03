# P0 :: CORE

RULE
Runtime > Report

RULE
Browser > Build

RULE
Existing > New

RULE
Reuse > Improve > Extend

RULE
Architecture > Feature

RULE
Quality > Speed

RULE
Database = SSOT

RULE
Documentation != Truth

RULE
Browser = Truth

FAIL
Build PASS != Runtime PASS

---

# P0 :: FROZEN

LOCK

- Database Architecture
- RBAC
- Better Auth
- Installation Runtime
- Bootstrap
- Configuration
- Environment
- Migration Architecture
- Seed Architecture

ALLOW

- Bug Fix
- Security Fix
- Performance
- Additive Feature

FORBIDDEN

- Rewrite Architecture
- Replace Runtime
- Auth V2
- Session V2
- Repository V2
- Service V2
- Middleware V2

---

# EXISTING FIRST

FLOW

Audit
→ Existing
→ Reuse
→ Improve
→ Extend

NEVER

Search
→ Rewrite

IF Existing >=70%

Improve.

Do NOT recreate.

---

# ACTIVE RUNTIME

VERIFY

Route
→ Layout
→ Page
→ Component
→ Child

Only modify active runtime.

Never modify dead code.

Never assume newest file is active.

---

# IMPACT

CHECK

UI
API
Database
Repository
Service
Auth
Session
Cookie
Middleware
RBAC
Navigation
Installation
Landing
CMS
Billing
AI Runtime
Localization

Every affected module must be verified.

---

# DATABASE

Database = SSOT

NO

Hardcoded URL
Hardcoded Secret
Hardcoded Email
Hardcoded Currency
Hardcoded Locale
Hardcoded Domain

Schema

Additive First

Backward Compatible

No destructive migration without Architecture Sprint.

---

# RBAC

Role = Identity

Permission = Capability

FeatureFlag = Availability

FLOW

Feature Enabled
→ Permission Granted
→ Access

Never authorize by role alone.

Roles

Guest
User
Admin
Founder

No additional system roles.

---

# AUTH

Reuse Better Auth.

Reuse Session.

Reuse Middleware.

Reuse Cookie.

Founder

Email
Password
MasterKey

Admin

Email
Password

Never create parallel authentication.

---

# INSTALL

Reuse

Migration
Bootstrap
RBAC
BetterAuth
Seeds

Installer creates Founder only.

---

# UI

Responsive Required

Dark Mode Compatible

Accessible

No Placeholder

No Missing i18n

Permission Driven

FeatureFlag Aware

---

# API

Thin Controller

Service Logic

Repository Access

Validate Input

Consistent Response

Audit Sensitive Action

---

# LOCALIZATION

Every new text

EN
ID

No raw string.

No missing key.

---

# REPORT

Always include

Reused
Improved
Created
Modified
Database
API
UI
Known Risk
Regression
Next Sprint

Reports are not proof.

---

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

---

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

---

# TECHNICAL DEBT

Found issue?

Choose

KEEP

IMPROVE

MERGE

REMOVE

Never ignore.

Leave project cleaner than before.

---

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

---

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

---

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

---

# ENGINEERING LAW

Every Sprint

Reduce Technical Debt

Increase Consistency

Preserve Architecture

Improve Documentation

Never sacrifice Runtime for Report.

Reality over Reports.
