# Landing Builder Audit Report

**Sprint:** CMS-01 B8 — Landing Builder Runtime
**Date:** 2026-07-28
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the audit of the existing Landing Builder implementation prior to integrating it with the CMS Engine as the official visual editor.

---

## 2. Current State

### 2.1 Landing Builder UI
- **Location:** `src/app/admin/(protected)/landing-builder/`
- **Main Component:** `AdminLandingBuilderClient.tsx`
- **Features:**
  - Drag & drop section reordering via `@dnd-kit`
  - Section creation, editing, deletion
  - Live preview via iframe
  - Auto-save with 800ms debounce
  - Undo delete with 5-second timeout
  - Visibility and lock toggles

### 2.2 Landing Builder Data Layer
- **Service:** `src/core/landing/landing.service.ts`
- **Database:** `landing_section` and `landing_media` tables
- **API Routes:** `/api/landing/sections`, `/api/landing/sections/[key]`, `/api/landing/sections/reorder`

### 2.3 CMS Engine
- **Location:** `src/core/cms/`
- **State:** Mostly in-memory (PageRegistry, ComponentLibrary)
- **Persistence:** No CMS database tables existed before this sprint
- **API Routes:** `/api/cms/pages`, `/api/cms/sections`, `/api/cms/components`, `/api/cms/media`, `/api/cms/versions`, `/api/cms/publish`, `/api/cms/audit`

---

## 3. Architecture Violations Found

### 3.1 Critical Violations
| Issue | Description | Impact |
|-------|-------------|--------|
| Independent Content Storage | Landing Builder stores content in `landing_section` table, bypassing CMS Engine | Violates CMS Architecture Standard §Landing Integration |
| No CMS Integration | Landing Builder UI calls `/api/landing/*` instead of `/api/cms/*` | Content is not versioned, localized, or audited through CMS |
| Missing Persistence | CMS Engine is entirely in-memory | No versioning, no audit, no publishing pipeline |

### 3.2 High Violations
| Issue | Description | Impact |
|-------|-------------|--------|
| Duplicate CRUD Logic | LandingService and CMSService both implement section CRUD | Maintenance burden, inconsistent behavior |
| No Navigation Sync | Landing sections are not registered in Navigation Runtime | Breadcrumbs and menus don't reflect landing content |
| No SEO Integration | Landing sections don't publish SEO metadata through CMS | SEO Runtime cannot consume landing page metadata |

---

## 4. Broken Features

| Feature | Status | Root Cause |
|---------|--------|------------|
| Version History | Not Working | CMSService.createVersion returns objects but doesn't persist |
| Audit Log | Not Working | CMSService.getAuditLog returns empty array |
| Media Management | Not Working | CMSService.listMedia returns empty array |
| Publishing Pipeline | Not Working | Pipeline created but not persisted |
| Localization | Partial | UI strings localized, but section content not stored per-locale |
| Navigation Integration | Not Working | No bridge between landing sections and navigation items |

---

## 5. Duplicate Logic

| Duplicate | Location A | Location B |
|-----------|-----------|-----------|
| Section CRUD | `LandingService` | `CMSService` (stub) |
| Section Schema | `landing.ts` Drizzle schema | `cms.types.ts` (in-memory only) |
| Section List API | `/api/landing/sections` | `/api/cms/sections` (returns empty) |

---

## 6. Missing CMS Integration

| Integration | Status | Gap |
|-------------|--------|-----|
| Page → Sections | Missing | Landing sections have no parent page in CMS |
| Section → Blocks | Missing | No block-level editing in Landing Builder |
| Section → Media | Missing | Media not linked to CMS Media Library |
| Section → Version | Missing | No version history for landing sections |
| Section → Publish | Missing | No publish pipeline for landing content |
| Section → Audit | Missing | No audit trail for landing section changes |

---

## 7. Recommendations

1. **Create CMS Database Schema** — Add `cms_page`, `cms_section`, `cms_block`, `cms_component`, `cms_media`, `cms_version`, `cms_publish_pipeline`, `cms_publish_step`, `cms_audit_entry` tables
2. **Create CMS Repositories** — Implement repository pattern for all CMS entities
3. **Complete CMSService** — Wire repositories into service, implement all stub methods
4. **Create Landing Builder Runtime** — Centralized mediation layer between UI and CMS
5. **Migrate Existing Data** — Move `landing_section` data to CMS tables
6. **Update API Routes** — Make landing routes use CMSService
7. **Wire Integrations** — Navigation, Localization, Media, SEO, Publishing

---

## 8. Conclusion

The existing Landing Builder is functionally complete as a standalone editor but violates the CMS Architecture Standard by storing content independently. The B8 sprint addresses all identified violations by migrating the Landing Builder to consume the CMS Engine as its single source of truth.
