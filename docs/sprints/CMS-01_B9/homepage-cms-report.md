# Homepage CMS Report

**Sprint:** CMS-01 B9  
**Date:** 2026-07-28  
**Status:** COMPLETE

---

## Overview

Homepage Runtime consumes CMS content for all page data, sections, blocks, components, and media. It never edits CMS directly.

---

## CMS Integration Points

### Pages

```typescript
// HomepageRuntime.resolvePage()
const pageId = await getOrCreateLandingPage(this.cmsService);
const page = await this.cmsService.getPage(pageId);
```

- Uses `landing-page` slug for the homepage
- Falls back to creating the page if it doesn't exist
- Respects page status (published vs draft)

### Sections

```typescript
// HomepageRuntime.resolveSections()
const cmsSections = await this.cmsService.listSections(page.id);
```

- Fetches all sections for the homepage page
- Maps CMS sections to `HomepageSectionDefinition`
- Preserves section config, styles, ordering

### Blocks

- Blocks are available through CMS sections
- Each section can contain child blocks
- Blocks provide additional content granularity

### Components

- Reusable CMS components
- Registered via `CMSService.registerComponent()`
- Available for section composition

---

## Draft Preview

```typescript
// When previewMode === "draft"
if (context.isPreview && context.previewMode === "draft") {
  const page = await this.cmsService.getPage(pageId);
  return page; // Returns draft version
}
```

- Preview mode bypasses published-only filtering
- Draft sections are included in resolution
- Used by admin landing builder

---

## Published Version

```typescript
// Normal mode
if (page.status !== "published" && !context.isPreview) {
  return null; // Only published pages are visible
}
```

- Public visitors only see published content
- Status check enforced at page level

---

## Version History

- CMS tracks version history via `cms_version` table
- Versions created on publish, rollback, and edit
- Homepage Runtime reads latest published version

---

## Content Flow

```
Admin Landing Builder
  ↓ (creates/edits sections)
CMS Service
  ↓ (stores in landing_section table)
Homepage Runtime
  ↓ (resolves sections for rendering)
Section Components
  ↓ (renders UI)
Browser
```

---

## CMS Schema (landing_section)

| Column | Type | Purpose |
|---|---|---|
| `id` | text | Primary key |
| `section_key` | text | Unique section identifier |
| `title` | text | Section title |
| `description` | text | Section description |
| `component` | text | Component type |
| `type` | text | Section type |
| `visible` | boolean | Visibility flag |
| `locked` | boolean | Lock flag |
| `order` | integer | Sort order |
| `config` | jsonb | Section configuration |
| `styles` | jsonb | Section styles |
| `created_at` | timestamp | Creation time |
| `updated_at` | timestamp | Last update time |

---

## Media Library

- CMS media stored in `landing_media` table
- Linked to sections via `section_key`
- Supports images, videos, icons
- Responsive media URLs per device

---

## No Duplication

| Rule | Status |
|---|---|
| Homepage never owns CMS content | ✓ |
| Homepage never writes to CMS | ✓ |
| Homepage only reads from CMS | ✓ |
| CMS is the single source of truth | ✓ |
