# R11: Navigation Remediation Report — CMS-01.5 Production Readiness Remediation

**Status:** PARTIAL
**Date:** 2026-07-28

---

## Summary of Findings

A Navigation Runtime exists and is consumed by the Homepage Runtime and CMS navigation, but the actual sidebar UI components (`Sidebar.tsx`, `AdminSidebar.tsx`) use hardcoded navigation items. There is no dynamic menu management.

---

## Changes Made

No direct changes in this remediation cycle — this report documents findings for future work.

---

## Current Architecture

| Component | Status | Notes |
|---|---|---|
| Navigation Runtime | EXISTS | Provides navigation data to Homepage and CMS |
| `Sidebar.tsx` | HARDCODED | Static menu items, not connected to runtime |
| `AdminSidebar.tsx` | HARDCODED | Static menu items, not connected to runtime |
| Dynamic menu management | NONE | No UI or API for managing navigation items |

### Runtime Consumers
- `homepage-runtime` — reads navigation data
- `cms-navigation` — reads navigation data
- `Sidebar.tsx` — does NOT consume runtime
- `AdminSidebar.tsx` — does NOT consume runtime

---

## Remaining Issues

| Issue | Severity | Impact |
|---|---|---|
| Sidebar.tsx hardcoded | High | Navigation changes require code deploys |
| AdminSidebar.tsx hardcoded | Medium | Admin nav changes require code deploys |
| No dynamic menu management UI | Medium | Cannot add/remove/reorder menu items without code changes |
| No role-based menu filtering | Medium | All admin users see same menu regardless of permissions |

---

## Recommendations

1. **Wire Sidebar.tsx**: Replace hardcoded items with data from the Navigation Runtime.
2. **Wire AdminSidebar.tsx**: Replace hardcoded items with data from the Admin Navigation Runtime.
3. **Dynamic menu management**: Create an admin UI for managing navigation items (add, remove, reorder, set visibility).
4. **Role-based filtering**: Filter admin sidebar items based on the user's RBAC permissions.
5. **Caching**: Cache navigation data with appropriate TTL to avoid DB hits on every page load.
