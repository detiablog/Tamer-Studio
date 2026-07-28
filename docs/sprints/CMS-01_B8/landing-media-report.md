# Landing Media Integration Report

**Sprint:** CMS-01 B8 — Landing Builder Runtime
**Date:** 2026-07-28
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the Media Integration of the Landing Builder Runtime, reusing the centralized Media Library for all media operations.

---

## 2. Media Library

**Location:** `src/core/cms/repositories/media.repository.ts`
**Table:** `cms_media`

The centralized Media Library stores all media with metadata:

| Field | Type | Description |
|-------|------|-------------|
| id | text | Primary key |
| filename | text | Original filename |
| url | text | Media URL |
| alt | text | Alt text for accessibility |
| type | text | Media type (image, video, document) |
| size | integer | File size in bytes |
| folder | text | Organization folder |
| metadata | jsonb | Additional metadata |

---

## 3. CMS Media Repository

### 3.1 Interface

```typescript
export interface CMSMediaRepository {
  createMedia(media: CMSMedia): Promise<CMSMedia>;
  getMedia(id: string): Promise<CMSMedia | undefined>;
  listMedia(filters?: { folder?: string; type?: string }): Promise<CMSMedia[]>;
  updateMedia(id: string, updates: Partial<CMSMedia>): Promise<CMSMedia | undefined>;
  deleteMedia(id: string): Promise<void>;
}
```

### 3.2 Implementation

`DefaultCMSMediaRepository` uses Drizzle ORM to persist media to the `cms_media` table with proper indexing on `type` and `folder`.

---

## 4. Landing Builder Media Operations

### 4.1 Upload Media

```typescript
async uploadMedia(input: Partial<CMSMedia>): Promise<CMSMedia>
```

Creates a new media entry in the CMS Media Library.

### 4.2 List Media

```typescript
async getMedia(filters?: { folder?: string; type?: string }): Promise<CMSMedia[]>
```

Lists media with optional filtering by folder and type.

### 4.3 Media in Sections

Sections store media references in their `media` array. The Landing Builder Runtime ensures media is registered in the CMS Media Library before associating it with sections.

---

## 5. Migration

The migration script (`scripts/migrate-landing-to-cms.ts`) moves existing `landing_media` records to `cms_media`:

```typescript
const cmsMediaRecords = await Promise.all(
  mediaRows.map(async (m) => {
    return await cmsService.registerMedia({
      filename: section.sectionKey,
      url: m.url,
      alt: m.alt ?? undefined,
      type: m.type,
      size: 0,
      folder: "landing-migration",
      metadata: { migratedFrom: "landing_media", originalId: m.id },
    });
  })
);
```

---

## 6. Supported Media Types

| Type | Description | Status |
|------|-------------|--------|
| image | Images (JPEG, PNG, GIF, WebP, SVG) | Supported |
| video | Video files (MP4, WebM) | Supported |
| document | Documents (PDF, DOC) | Supported |

---

## 7. Future Enhancements

| Enhancement | Description |
|-------------|-------------|
| Upload | Direct file upload endpoint |
| Replace | Replace existing media with new file |
| Crop | Built-in image cropping |
| Alt Text | Auto-generated alt text suggestions |
| Responsive Images | Multiple size variants |
| Video | Video transcoding and thumbnails |

---

## 8. Conclusion

Media Integration is architected and ready. The Landing Builder Runtime uses the CMS Media Library for all media operations. Existing `landing_media` data is migrated to `cms_media` during the B8 sprint.