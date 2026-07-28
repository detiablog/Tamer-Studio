# User Dashboard Integration Report
# CMS-01 Finalization — F6

**Status:** CRITICAL
**Date:** 2026-07-28
**Auditor:** Kilo AI

---

## Summary

The user dashboard consists of 17 pages under the `(dashboard)` route group plus a standalone `/dashboard` route. The dashboard layout at `src/app/(dashboard)/layout.tsx` provides `AppShell` and `PageLayout` wrappers but notably lacks an auth guard — unlike the standalone `/dashboard` route which uses `requireUser()`. Pages are split between those with live API integration (billing, profile, AI) and those rendering hardcoded mock data (api-keys, media, production, publishing, settings, templates). Six pages display static mock data with no API connectivity, representing a critical integration gap. Feature stores rely on localStorage only.

## Verified Items

- [x] Standalone `/dashboard` route has auth guard via `requireUser()` (`src/app/dashboard/layout.tsx:8`)
- [x] Dashboard layout uses `AppShell` + `PageLayout` wrapper (`src/app/(dashboard)/layout.tsx:6-7`)
- [x] Root `/dashboard` page uses `useSWR("/api/user/stats")` for live data (`src/app/dashboard/page.tsx:25`)
- [x] Billing page uses `useSWR("/api/billing")` with live API data (`src/app/(dashboard)/billing/page.tsx:21`)
- [x] Profile page uses `useSWR("/api/profile")` with PATCH support (`src/app/(dashboard)/profile/page.tsx:18`)
- [x] AI page is a server component delegating to `AIPageClient` (`src/app/(dashboard)/ai/page.tsx`)
- [x] AI providers detail page has `generateMetadata` (`src/app/(dashboard)/ai/providers/[id]/page.tsx`)
- [x] Projects page uses `ProjectList` component (`src/app/(dashboard)/projects/page.tsx`)
- [x] Workspace page uses `WorkspaceList` component (`src/app/(dashboard)/workspace/page.tsx`)
- [x] All dashboard pages use `useLocalizationContext()` for i18n
- [x] Notifications page uses `NotificationsContent` component (`src/components/dashboard/NotificationsContent.tsx`)
- [x] API routes exist for: `/api/billing`, `/api/profile`, `/api/user/stats`
- [x] Root dashboard page shows: Recent Projects, Production Queue, Quick Actions, Recent Activity, AI Usage

## Issues Found

1. **CRITICAL** — Six dashboard pages use hardcoded mock data with zero API integration:
   - `src/app/(dashboard)/api-keys/page.tsx` — Static `API_KEYS` array (line 14-18)
   - `src/app/(dashboard)/media/page.tsx` — Static `MEDIA_ITEMS` array (line 14-21)
   - `src/app/(dashboard)/production/page.tsx` — Static `JOBS` array (line 15-21)
   - `src/app/(dashboard)/publishing/page.tsx` — Static `PUBLICATIONS` array (line 15-20)
   - `src/app/(dashboard)/settings/page.tsx` — Static `SETTINGS_SECTIONS` array (line 11-18)
   - `src/app/(dashboard)/templates/page.tsx` — Static `TEMPLATES` array (line 13-19)

2. **CRITICAL** — Dashboard layout at `src/app/(dashboard)/layout.tsx` has NO auth guard. Unlike the standalone `/dashboard` route which calls `requireUser()`, the `(dashboard)` route group layout does not validate user sessions. Any unauthenticated user accessing `/ai`, `/billing`, `/profile`, etc. will see the layout shell.

3. **HIGH** — Projects detail page (`src/app/(dashboard)/projects/[id]/page.tsx`) is a placeholder with no data fetching.

4. **HIGH** — Workspace detail page (`src/app/(dashboard)/workspace/[id]/page.tsx`) is a placeholder with no data fetching.

5. **MEDIUM** — Workspace edit page (`src/app/(dashboard)/workspace/[id]/edit/page.tsx`) uses `workspaceStore` which is client-side only (localStorage), meaning workspace edits are not persisted to any backend.

6. **MEDIUM** — Production detail page (`src/app/(dashboard)/production/[id]/page.tsx`) uses `productionStore` which is client-side only (localStorage).

7. **MEDIUM** — API keys page "Create Key" button renders `ActionButton` component but has no `onClick` handler — it is non-functional.

8. **MEDIUM** — Media page "Upload Media" button renders `ActionButton` component but has no `onClick` handler — it is non-functional.

9. **LOW** — Settings page "Save Changes" button has no `onClick` handler — changes cannot be saved.

10. **LOW** — Root dashboard hardcodes delta text strings like "+2 this week", "+8 new files" (lines 44, 46) instead of deriving from API data.

## Recommendations

1. **CRITICAL** — Add `requireUser()` auth guard to `src/app/(dashboard)/layout.tsx` to protect all dashboard sub-routes. Currently only the standalone `/dashboard` route is protected.

2. **CRITICAL** — Replace hardcoded mock data in the six affected pages with API integrations using `useSWR` or server components, matching the pattern used by billing and profile pages.

3. **HIGH** — Implement API integration for projects detail (`/api/projects/[id]`) and workspace detail (`/api/workspace/[id]`) endpoints and connect the placeholder pages.

4. **HIGH** — Replace client-side localStorage stores (workspace, production) with backend API persistence to ensure data durability across sessions and devices.

5. **MEDIUM** — Wire up action buttons (Create Key, Upload Media, Save Changes) to their respective API endpoints with proper form handling and error states.

6. **MEDIUM** — Add proper TypeScript types for all API responses instead of using `any` casts throughout dashboard pages.

7. **LOW** — Ensure all hardcoded UI strings use localization keys for full i18n support.

## Compliance

**FAIL** — The user dashboard fails CMS-01 compliance critically:
- 6 of 17 pages (35%) render hardcoded mock data with no backend connectivity
- The `(dashboard)` route group layout lacks authentication guards
- Placeholder pages for projects/[id] and workspace/[id] have no functionality
- Client-side localStorage stores do not meet production data persistence requirements
