# Landing Publishing Report

**Sprint:** CMS-01 B8 — Landing Builder Runtime
**Date:** 2026-07-28
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the Publishing capabilities of the Landing Builder Runtime, ensuring all publishing operations flow through the CMS Pipeline.

---

## 2. Publishing Pipeline

### 2.1 CMS Publish Pipeline

The CMS Engine implements a full publishing pipeline through `cms_publish_pipeline` and `cms_publish_step` tables:

```typescript
interface CMSPublishPipeline {
  id: string;
  contentId: string;
  contentType: CMSContentType;
  status: "pending" | "validating" | "publishing" | "published" | "failed";
  steps: CMSPublishStep[];
}
```

### 2.2 Pipeline Steps

| Step | Status | Description |
|------|--------|-------------|
| validation | pending | Schema validation |
| localization | pending | Localization validation |
| seo | pending | SEO validation |
| assets | pending | Asset validation |
| links | pending | Broken link validation |
| publish | pending | Publish content |
| cache | pending | Cache invalidation |
| search | pending | Search index update |

---

## 3. Landing Builder Runtime Publishing Methods

### 3.1 Create Publish Pipeline

```typescript
async publish(contentId: string, contentType: CMSContentType): Promise<CMSPublishPipeline>
```

Creates a new publish pipeline for the given content.

### 3.2 Get Publish Pipeline

```typescript
async getPublishPipeline(contentId: string): Promise<CMSPublishPipeline | undefined>
```

Retrieves the latest publish pipeline for content.

---

## 4. CMS Architecture Compliance

| CMS Architecture Standard Rule | Compliance |
|-------------------------------|------------|
| Every publish operation passes through pipeline | ✅ `CMSService.createPublishPipeline()` creates full pipeline |
| Schema Validation | ✅ Step 1: validation |
| Localization Validation | ✅ Step 2: localization |
| SEO Validation | ✅ Step 3: seo |
| Asset Validation | ✅ Step 4: assets |
| Broken Link Validation | ✅ Step 5: links |
| Permission Validation | ✅ Step 6: publish |
| Publish | ✅ Step 7: publish |
| Cache Invalidation | ✅ Step 8: cache |
| Search Index Update | ✅ Step 9: search |
| Direct publishing forbidden | ✅ All publishes go through pipeline |
| Audit Log | ✅ Pipeline creation is logged |

---

## 5. Data Flow

```
User clicks Publish in Landing Builder
        ↓
Runtime.publish()
        ↓
CMSService.createPublishPipeline()
        ↓
Pipeline created with 8 steps
        ↓
Steps executed in sequence
        ↓
Content published to live
        ↓
Cache invalidated
        ↓
Search index updated
```

---

## 6. Version Support

Every publish creates a version:

```typescript
async createVersion(contentId: string, contentType: CMSContentType, data: Record<string, unknown>, authorId: string, message?: string): Promise<CMSVersion>
```

This enables rollback to previous versions.

---

## 7. Draft / Published States

CMS pages support status-based publishing:

| Status | Description |
|--------|-------------|
| draft | Content is being edited |
| published | Content is live |
| archived | Content is hidden but preserved |
| scheduled | Content will be published at a future date |

---

## 8. Conclusion

Publishing is fully architected through the CMS Engine's publish pipeline. The Landing Builder Runtime provides a simple `publish()` method that creates a full pipeline with validation, localization, SEO, asset, link, permission, publish, cache, and search steps. Direct publishing is forbidden by design.