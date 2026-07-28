# Homepage Preview Report

**Sprint:** CMS-01 B9  
**Date:** 2026-07-28  
**Status:** COMPLETE

---

## Overview

Homepage Runtime supports draft preview, published preview, responsive preview, and locale preview.

---

## Preview Modes

| Mode | Purpose | Access |
|---|---|---|
| `published` | Default published content | Public |
| `draft` | Draft content for admin review | Admin |
| `responsive` | Device-specific preview | Admin |
| `locale` | Locale-specific preview | Admin |

---

## Preview API

```typescript
// POST /api/homepage
{
  "options": {
    "mode": "draft",
    "locale": "id",
    "device": "mobile",
    "version": 3
  },
  "context": {
    "locale": "id",
    "device": "mobile",
    "isPreview": true,
    "previewMode": "draft"
  }
}
```

---

## Draft Preview

```typescript
// HomepageRuntime.resolvePage()
if (context.isPreview && context.previewMode === "draft") {
  const page = await this.cmsService.getPage(pageId);
  return page; // Returns draft version
}
```

- Bypasses published-only filtering
- Shows draft sections and content
- Used by admin landing builder

---

## Published Preview

```typescript
// Normal mode (no preview)
if (page.status !== "published" && !context.isPreview) {
  return null;
}
```

- Only published content visible to public
- Preview mode bypasses this check

---

## Responsive Preview

```typescript
// HomepageContext
device: "desktop" | "tablet" | "mobile"

// Media resolution
getResponsiveUrl(media, device) {
  switch (device) {
    case "mobile": return media.responsive.sm || media.url;
    case "tablet": return media.responsive.md || media.url;
    default: return media.responsive.lg || media.url;
  }
}
```

- Device parameter selects responsive media
- Sections adapt to device context
- Available via preview API

---

## Locale Preview

```typescript
// HomepageRuntime.resolvePreview()
async resolvePreview(options, context) {
  const previewContext = {
    ...context,
    isPreview: true,
    previewMode: options.mode,
    locale: options.locale ?? context.locale,
    device: options.device ?? context.device,
  };
  return this.resolveHomepage(previewContext);
}
```

- Locale parameter selects translations
- Sections localized for preview locale
- Available via preview API

---

## useHomepage Hook

```typescript
const { resolvePreview } = useHomepage();

// Draft preview
await resolvePreview({ mode: "draft" });

// Locale preview
await resolvePreview({ mode: "locale", locale: "id" });

// Responsive preview
await resolvePreview({ mode: "responsive", device: "mobile" });

// Combined
await resolvePreview({
  mode: "draft",
  locale: "id",
  device: "mobile",
  version: 3,
});
```

---

## Preview Integration

| Feature | Status |
|---|---|
| Draft preview | ✓ |
| Published preview | ✓ |
| Responsive preview | ✓ |
| Locale preview | ✓ |
| Version preview | ✓ |
| Combined preview | ✓ |
