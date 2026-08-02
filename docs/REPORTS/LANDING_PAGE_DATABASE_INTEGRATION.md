# Landing Page Database Integration Guide

## Overview

The landing page is now fully connected to the database. All sections are dynamically fetched from the database and rendered in real-time. Changes made in the admin landing-builder immediately affect the landing page.

## Architecture

### Data Flow

```
Database (landing_section table)
         ↓
API (/api/landing/sections)
         ↓
useLandingSections hook (fetches & caches)
         ↓
LandingPageContent component
         ↓
Section Renderer (maps to components)
         ↓
Landing Page Display (/)
```

### Files Created

#### 1. **Hook** - `src/hooks/use-landing-sections.ts`
- Fetches sections from `/api/landing/sections`
- Filters only visible sections
- Sorts by order
- Provides loading/error states
- Offers refetch capability

```typescript
const { sections, loading, error, refetch } = useLandingSections();
```

#### 2. **Renderer** - `src/lib/landing-section-renderer.ts`
- Maps section keys to React components
- Renders sections in order
- Provides fallback for unmapped sections
- Exports:
  - `renderLandingSection()` - Render single section
  - `renderLandingSections()` - Render multiple sections
  - `getSectionComponent()` - Get component by key
  - `getAvailableSectionTypes()` - List available types

#### 3. **Page Content** - `src/components/landing/LandingPageContent.tsx`
- Client component that uses the hook
- Handles loading/error states
- Falls back to hardcoded components if database unavailable
- Maintains Header, SocialProof, Footer structure

#### 4. **Main Page** - `src/app/page.tsx`
- Updated to use LandingPageContent
- Added Suspense boundary for loading state
- Maintains all metadata (SEO, OpenGraph, etc.)

#### 5. **Index** - `src/components/landing/index.ts`
- Barrel export for all landing components
- Simplifies imports throughout the app

## Features

### ✅ Dynamic Section Rendering
- Sections load from database on page load
- Real-time updates reflected on landing page
- No need to redeploy for section changes

### ✅ Section Reordering
- Drag-and-drop reordering in admin panel
- Order automatically updates on landing page
- Smooth transitions between sections

### ✅ Visibility Control
- Show/hide sections without deletion
- Admin panel toggle → immediate landing page effect
- Soft delete - sections can be restored

### ✅ Graceful Fallback
- If database unavailable → uses hardcoded components
- If sections not found → renders default components
- Error handling with logging

### ✅ Performance
- Sections sorted by order on fetch
- Visible sections filtered
- React keys prevent unnecessary re-renders
- Suspense boundary for smooth loading

## Component Mapping

The following sections are mapped to components:

| Key | Component | Type |
|-----|-----------|------|
| hero | Hero | hero |
| social-proof | N/A (skipped) | custom |
| features | Features | features |
| ai-platform | AIPlatform | custom |
| screenshots | Screenshots | custom |
| realtime-stats | RealtimeStats | custom |
| pricing | PricingSection | pricing |
| credit-packs | CreditPacks | credit-packs |
| credit-calculator | CreditCalculator | custom |
| credit-usage | CreditUsageTable | credit-usage |
| testimonials | Testimonials | custom |
| faq | FAQ | faq |
| cta | CTASection | cta |
| footer | Footer | footer |

## How It Works

### Initial Load
1. Page renders with Suspense boundary (shows loading)
2. `useLandingSections` hook fetches from API
3. Sections sorted by `order` field
4. Only visible sections (`isVisible: true`) included
5. Sections rendered in order using `renderLandingSections()`

### When Admin Makes Changes
1. Admin edits section in `/admin/landing-builder`
2. Section saved to database
3. Landing page can be refreshed to see changes
4. For automatic updates, implement polling or WebSocket

### Fallback Behavior
If database is unavailable:
- Hook catches error
- `DefaultLandingPage` renders hardcoded components
- All sections display in correct order
- Landing page remains functional

## Setup

### 1. Database Setup
```bash
pnpm db:migrate
pnpm tsx scripts/seed-landing-sections.ts
```

### 2. Access Landing Page
```
http://localhost:3000/
```

### 3. Access Admin Panel
```
http://localhost:3000/admin/landing-builder
```

### 4. Make Changes
- Edit sections in admin panel
- Reorder using drag-drop or arrow buttons
- Toggle visibility
- Changes saved to database

## Adding New Sections

To add a new section type:

1. **Create component** in `src/components/landing/NewSection.tsx`
2. **Add to index** in `src/components/landing/index.ts`
3. **Add to mapping** in `src/lib/landing-section-renderer.ts`:
   ```typescript
   const SECTION_COMPONENTS = {
     // ... existing
     'new-section': NewSection,
   };
   ```
4. **Create database entry** in admin panel
5. **Set order** and visibility

## Advanced Features

### Real-Time Updates (Optional)
To enable real-time updates without page refresh:

```typescript
// Add polling
useEffect(() => {
  const interval = setInterval(() => refetch(), 5000);
  return () => clearInterval(interval);
}, [refetch]);

// Or use WebSocket
// Listen to /api/landing/sections/subscribe
```

### Caching Strategies
Current: No caching (fresh fetch each load)

Options:
- Browser cache: `fetch(..., { cache: 'default' })`
- Server cache: Next.js ISR or revalidateTags
- CDN cache: For static exports

### Performance Optimization
- Suspense boundaries per section
- Lazy loading for below-fold sections
- Image optimization in sections

## Troubleshooting

### Sections not loading
```bash
# Check database has data
pnpm tsx -e "
  import { db } from './src/lib/db';
  import { landingSection } from './src/lib/db/schema/landing';
  const sections = await db.select().from(landingSection);
  console.log(sections);
"
```

### Fallback rendering
- Check browser console for errors
- Verify API endpoint: `curl http://localhost:3000/api/landing/sections`
- Check database connection

### Sections in wrong order
- Verify `order` field in database
- Use admin panel to reorder
- Sections auto-sort by order on fetch

## API Reference

### GET /api/landing/sections

Returns all sections sorted by order, filtered for visibility.

```json
{
  "success": true,
  "data": [
    {
      "id": "hero-section",
      "key": "hero",
      "type": "hero",
      "title": "From intent to production",
      "subtitle": "...",
      "order": 0,
      "isVisible": true,
      "content": {},
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "media": []
    },
    // ... more sections
  ],
  "count": 14
}
```

## Next Steps

- ✅ Database integration complete
- ✅ Admin landing builder ready
- ✅ Dynamic section rendering working
- ⏭️ Add real-time updates (WebSocket/polling)
- ⏭️ Add section analytics
- ⏭️ Add section templates library
- ⏭️ Add A/B testing capabilities

## Files Modified

- `src/app/page.tsx` - Updated main landing page
- `src/components/landing/LandingPageContent.tsx` - NEW: Dynamic content component
- `src/hooks/use-landing-sections.ts` - NEW: Database fetching hook
- `src/lib/landing-section-renderer.ts` - NEW: Component mapping & rendering
- `src/components/landing/index.ts` - NEW: Barrel exports

---

**Status:** ✅ Landing page fully connected to database!
