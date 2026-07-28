# Landing CMS Integration Report

**Sprint:** CMS-01 B8 — Landing Builder Runtime
**Date:** 2026-07-28
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the CMS Integration of the Landing Builder, ensuring all landing content is managed through the CMS Engine as the single source of truth.

---

## 2. Architecture

```
Landing Builder UI
        ↓
/api/landing/sections/* (proxied to CMS)
        ↓
LandingBuilderRuntime
        ↓
CMSService
        ↓
CMS Repositories
        ↓
cms_page, cms_section, cms_block, cms_component, cms_media, cms_version, cms_publish_pipeline, cms_audit_entry
```

---

## 3. CMS Database Schema

### 3.1 New Tables

| Table | Description |
|-------|-------------|
| cms_page | Landing pages with SEO, localization, permissions |
| cms_section | Landing sections with config, styles, media |
| cms_block | Blocks within sections |
| cms_component | Registered components with schemas |
| cms_media | Centralized media library |
| cms_version | Version history for all content |
| cms_publish_pipeline | Publishing workflow |
| cms_publish_step | Individual publish steps |
| cms_audit_entry | Immutable audit trail |

### 3.2 Migration

**File:** `drizzle/0031_create_cms_tables.sql`

The migration creates all CMS tables with proper indexes and foreign keys.

### 3.3 Data Migration

**File:** `scripts/migrate-landing-to-cms.ts`

The migration script:
1. Creates a default CMS page ("Landing Page")
2. Migrates all `landing_section` records to `cms_section`
3. Migrates all `landing_media` records to `cms_media`
4. Links media to sections

---

## 4. CMS Repositories

| Repository | Interface | Implementation |
|-----------|-----------|----------------|
| Page | `CMSPageRepository` | `DefaultCMSPageRepository` |
| Section | `CMSSectionRepository` | `DefaultCMSSectionRepository` |
| Block | `CMSBlockRepository` | `DefaultCMSBlockRepository` |
| Component | `CMSComponentRepository` | `DefaultCMSComponentRepository` |
| Media | `CMSMediaRepository` | `DefaultCMSMediaRepository` |
| Version | `CMSVersionRepository` | `DefaultCMSVersionRepository` |
| Publish | `CMSPublishRepository` | `DefaultCMSPublishRepository` |
| Audit | `CMSAuditRepository` | `DefaultCMSAuditRepository` |

---

## 5. API Integration

### 5.1 Landing API Routes (Updated)

All `/api/landing/sections/*` routes now use `CMSService` via `LandingBuilderRuntime`:

| Route | Method | CMS Operation |
|-------|--------|---------------|
| `/api/landing/sections` | GET | `CMSService.listSections()` |
| `/api/landing/sections` | POST | `CMSService.createSection()` |
| `/api/landing/sections/{key}` | GET | `CMSService.listSections()` + filter |
| `/api/landing/sections/{key}` | PATCH | `CMSService.updateSection()` |
| `/api/landing/sections/{key}` | DELETE | `CMSService.deleteSection()` |
| `/api/landing/sections/{key}` | POST | `CMSService.duplicateSection()` |
| `/api/landing/sections/reorder` | PATCH | `CMSService.reorderSections()` |

### 5.2 Response Mapping

The landing API routes map CMS responses to the `LandingSection` format expected by the UI, maintaining backward compatibility.

---

## 6. Page Management

### 6.1 Default Landing Page

The `getOrCreateLandingPage()` helper ensures a default CMS page exists for landing content:

```typescript
export async function getOrCreateLandingPage(cmsService: CMSService): Promise<string> {
  if (cachedPageId) return cachedPageId;
  let page = await cmsService.getPageBySlug("landing-page");
  if (!page) {
    page = await cmsService.createPage({
      title: "Landing Page",
      slug: "landing-page",
      contentType: "page",
      status: "published",
      authorId: "system",
    });
  }
  cachedPageId = page.id;
  return page.id;
}
```

---

## 7. CMS Engine Completion

### 7.1 Previously Stub Methods

| Method | Before | After |
|--------|--------|-------|
| `CMSService.listSections()` | Returned `[]` | Returns sections from repository |
| `CMSService.listMedia()` | Returned `[]` | Returns media from repository |
| `CMSService.getAuditLog()` | Returned `[]` | Returns audit entries from repository |
| `CMSService.createVersion()` | Created in-memory | Persisted to repository |
| `CMSService.createPublishPipeline()` | Created in-memory | Persisted to repository with steps |

---

## 8. Conclusion

The Landing Builder now fully consumes the CMS Engine. All content operations flow through CMS repositories, ensuring versioning, audit, localization, and publishing are available for all landing content.
