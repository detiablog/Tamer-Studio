# Homepage Media Report

**Sprint:** CMS-01 B9  
**Date:** 2026-07-28  
**Status:** COMPLETE

---

## Overview

Homepage Runtime consumes CMS Media Library for all images, icons, and videos. No hardcoded media paths.

---

## Media Integration

```typescript
// HomepageRuntime.resolveMedia()
resolveMedia(sections: HomepageSectionDefinition[]): HomepageMediaItem[] {
  const media: HomepageMediaItem[] = [];
  for (const section of sections) {
    media.push(...section.media);
  }
  return media;
}
```

---

## Media Types

| Type | Usage |
|---|---|
| `image` | Hero backgrounds, feature icons, screenshots |
| `video` | Product demos, tutorials |
| `icon` | Provider logos, feature icons |

---

## Responsive Media

```typescript
interface HomepageMediaItem {
  id: string;
  url: string;
  alt: string;
  type: string;
  order: number;
  responsive?: {
    sm?: string;   // Mobile
    md?: string;   // Tablet
    lg?: string;   // Desktop
    xl?: string;   // Large desktop
  };
}
```

### Responsive Resolution

```typescript
getResponsiveUrl(media, device) {
  if (!media.responsive) return media.url;
  switch (device) {
    case "mobile": return media.responsive.sm || media.url;
    case "tablet": return media.responsive.md || media.responsive.sm || media.url;
    default: return media.responsive.lg || media.responsive.xl || media.url;
  }
}
```

---

## Alt Text

Every media item includes alt text from CMS:

```typescript
alt: m.alt || ""  // Preserved from CMS media library
```

---

## Media Sources

| Source | Table | Purpose |
|---|---|---|
| CMS Media Library | `cms_media` | Global media assets |
| Landing Media | `landing_media` | Section-specific media |

---

## No Hardcoded Media

| Requirement | Status |
|---|---|
| All images from CMS Media Library | ✓ |
| All icons from CMS Media Library | ✓ |
| All videos from CMS Media Library | ✓ |
| Responsive media support | ✓ |
| Alt text preserved | ✓ |
| No hardcoded media paths | ✓ |
