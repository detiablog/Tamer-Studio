# RC-01 Known Issues Report

## Scope
All identified issues, limitations, and known gaps in the Tamer Studio platform as of the RC-01 release candidate. This report documents items that are known but not resolved, along with their severity and planned remediation timeline.

## Findings

### Issue Registry

| ID | Description | Severity | Module | Status |
|---|---|---|---|---|
| KI-01 | Pre-existing TypeScript errors in legacy agents module | Medium | agents | Documented |
| KI-02 | Pre-existing TypeScript errors in legacy payments module | Medium | payments | Documented |
| KI-03 | SSG warnings for routes using cookies (expected Next.js behavior) | Low | Middleware | Documented |
| KI-04 | No formal test suite (unit, integration, e2e) implemented | Medium | Global | Planned |
| KI-05 | OpenAPI specification not auto-generated from routes | Low | API | Planned |
| KI-06 | Webhook validation not tested in production environment | Low | Integrations | Planned |
| KI-07 | Mobile experience not comprehensively tested across devices | Medium | UI/UX | Planned |

### Detailed Descriptions

#### KI-01: Legacy Agents Module TypeScript Errors
- **Severity**: Medium
- **Module**: agents
- **Description**: The legacy agents module contains pre-existing TypeScript compilation errors that predate the current development cycle. These errors are in files that were not modified during the RC-01 sprint.
- **Impact**: Does not affect any newly developed functionality. The errors exist in isolated legacy code paths.
- **Remediation Plan**: Schedule a dedicated cleanup sprint to refactor and fix legacy agent module code.
- **Target**: Post-RC-01

#### KI-02: Legacy Payments Module TypeScript Errors
- **Severity**: Medium
- **Module**: payments
- **Description**: The legacy payments module contains pre-existing TypeScript compilation errors. These are inherited from earlier development cycles.
- **Impact**: Does not affect any newly developed functionality. Payment flows are handled by separate, clean service interfaces.
- **Remediation Plan**: Schedule a dedicated cleanup sprint to refactor and fix legacy payments module code.
- **Target**: Post-RC-01

#### KI-03: SSG Warnings for Cookie-Using Routes
- **Severity**: Low
- **Module**: Middleware
- **Description**: Next.js generates warnings during static site generation (SSG) for routes that access cookies. This is expected behavior when using `next/headers` in routes that Next.js attempts to statically generate.
- **Impact**: Build warnings only; no runtime impact. Routes function correctly at runtime.
- **Remediation Plan**: Add `export const dynamic = 'force-dynamic'` to affected routes to suppress warnings, or accept the warnings as expected behavior.
- **Target**: Low priority

#### KI-04: No Formal Test Suite
- **Severity**: Medium
- **Module**: Global
- **Description**: The codebase does not yet have a formal test suite (unit tests, integration tests, or end-to-end tests). Code quality has been verified through compilation, build success, and manual review.
- **Impact**: Regressions may not be caught automatically. Code coverage is unknown.
- **Remediation Plan**: Implement Vitest for unit testing, add integration tests for critical flows, and set up Playwright for e2e testing.
- **Target**: Post-RC-01 priority

#### KI-05: OpenAPI Specification Not Generated
- **Severity**: Low
- **Module**: API
- **Description**: No auto-generated OpenAPI/Swagger specification exists for the 571 API routes. API documentation is available through the codebase but not in a machine-readable format.
- **Impact**: Third-party API consumers cannot use automated tooling to generate client libraries. Internal API documentation relies on code-level documentation.
- **Remediation Plan**: Integrate swagger-jsdoc or similar tooling to generate OpenAPI specs from route definitions.
- **Target**: Post-RC-01

#### KI-06: Webhook Validation Not Production-Tested
- **Severity**: Low
- **Module**: Integrations
- **Description**: Webhook validation logic for external integrations has been implemented but not tested against actual production webhook payloads from third-party services.
- **Impact**: Webhook handling may fail silently with malformed payloads in production.
- **Remediation Plan**: Test webhook validation with real payloads from each integrated service in a staging environment.
- **Target**: Before open beta

#### KI-07: Mobile Experience Not Comprehensively Tested
- **Severity**: Medium
- **Module**: UI/UX
- **Description**: While responsive design patterns are implemented, the mobile experience has not been comprehensively tested across a representative sample of iOS and Android devices and browsers.
- **Impact**: Mobile users may encounter layout issues, touch target problems, or interaction failures.
- **Remediation Plan**: Conduct a dedicated mobile testing sprint covering iOS Safari, Android Chrome, and various screen sizes before open beta.
- **Target**: Before open beta

## Severity
Medium

## Resolution
All identified issues have been documented with clear descriptions, severity ratings, and remediation plans. None of the issues are blockers for the RC-01 release. All critical and high severity issues have been resolved; only medium and low severity items remain.

## Remaining Risks
- Pre-existing legacy TypeScript errors (KI-01, KI-02) may cause confusion for new contributors.
- Lack of formal test suite (KI-04) increases the risk of undetected regressions.
- Mobile experience (KI-07) may have undiscovered issues until formal testing is conducted.

## Recommendations
1. Prioritize KI-04 (test suite) as the highest-priority post-RC-01 task.
2. Schedule KI-07 (mobile testing) before the open beta release.
3. Address KI-01 and KI-02 (legacy TS errors) in a dedicated cleanup sprint.
4. Track all known issues in a project management tool with assigned owners and target dates.

## Verification Result
PASS WITH MINOR ISSUES
