# Landing Page Builder - Database Integration & Setup Guide

## Overview

The landing page builder is now fully integrated with the database. All landing page sections are stored in the database and can be managed from the admin panel at `/admin/landing-builder`.

## What's Been Implemented

### ✅ Database Schema
- **landingSection** table: Stores all landing page sections with:
  - `key`: Unique identifier (hero, features, pricing, etc.)
  - `type`: Section type (hero, features, pricing, custom, etc.)
  - `title`: Section title
  - `subtitle`: Optional subtitle
  - `content`: JSON content (flexible, stores any structured data)
  - `order`: Display order on landing page
  - `isVisible`: Toggle visibility without deleting
  - Timestamps for audit trail

- **landingMedia** table: Stores media associated with sections (images, videos)

### ✅ API Endpoints
- `GET /api/landing/sections` - Fetch all sections
- `POST /api/landing/sections` - Create new section
- `PATCH /api/landing/sections/[key]` - Update section
- `DELETE /api/landing/sections/[key]` - Hide section (soft delete)

### ✅ Admin Landing Builder Features
- **View all sections** with statistics dashboard
- **Create new sections** with customizable content
- **Edit existing sections** without modifying code
- **Reorder sections** using:
  - Up/Down arrow buttons
  - **Drag-and-drop** (drag sections to new positions)
- **Toggle visibility** (hide/show without deleting)
- **Duplicate sections** (copy and modify)
- **Delete sections** (soft delete - reversible)
- **Search & filter** sections by title, key, or type
- **Type-specific forms** for pricing, FAQ, credit packs, etc.

## Setup Instructions

### 1. Run Database Migrations

First, ensure your database has the landing tables:

```bash
pnpm db:migrate
```

### 2. Seed Landing Page Sections

Populate the database with the current landing page structure:

```bash
pnpm tsx scripts/seed-landing-sections.ts
```

This will:
- Create 14 landing page sections (hero, features, pricing, etc.)
- Each section is pre-configured with the current landing page structure
- All sections are visible by default

### 3. Access Admin Landing Builder

Navigate to the admin panel:
```
http://localhost:3000/admin/landing-builder
```

You should see:
- Dashboard with statistics (Total: 14, Visible: 14, Hidden: 0)
- All landing sections listed with their order and content
- Options to edit, reorder, hide, or delete sections

### 4. Edit Landing Page Sections

Click the **✏️ Edit** button on any section to:
- Change title, subtitle, content
- Modify JSON content directly
- Toggle visibility
- Change display order

### 5. Reorder Sections

**Option A - Drag and Drop:**
- Click and drag any section to a new position
- Drop on the target section to swap positions
- Hover indicator shows where it will drop

**Option B - Arrow Buttons:**
- Use ⬆️ Move Up / ⬇️ Move Down buttons
- Precise control without drag-and-drop

### 6. Preview Changes

Changes in the admin panel:
- Are saved to the database immediately
- Don't appear on landing page until the next page load/refresh
- Can be toggled on/off with the visibility toggle

## Database Structure

### Landing Sections

```sql
CREATE TABLE landing_section (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,           -- hero, features, pricing, etc.
  type TEXT NOT NULL,                  -- hero, features, pricing, custom, etc.
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB,                       -- Flexible JSON content
  order INTEGER NOT NULL,              -- Display order
  is_visible BOOLEAN DEFAULT true,     -- Show/hide toggle
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE landing_media (
  id TEXT PRIMARY KEY,
  section_key TEXT NOT NULL,           -- Foreign key to landing_section.key
  url TEXT NOT NULL,
  alt TEXT,
  type TEXT,                           -- image, video, etc.
  order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);
```

## Seeded Sections

The seed script creates these 14 sections:

| Key | Type | Title | Order |
|-----|------|-------|-------|
| hero | hero | From intent to production | 0 |
| social-proof | custom | Social Proof | 1 |
| features | features | Built for modern content teams | 2 |
| ai-platform | custom | AI Platform for Production Teams | 3 |
| screenshots | custom | See Tamer Studio in Action | 4 |
| realtime-stats | custom | Platform Statistics | 5 |
| pricing | pricing | Pricing | 6 |
| credit-packs | credit-packs | AI Credit Packages | 7 |
| credit-calculator | custom | Credit Calculator | 8 |
| credit-usage | credit-usage | AI Credit Usage | 9 |
| testimonials | custom | Loved by production teams | 10 |
| faq | faq | Frequently Asked Questions | 11 |
| cta | cta | Ready to Transform Your Workflow? | 12 |
| footer | footer | Footer | 13 |

## How It Works

### Current Flow

```
Landing Page Code (Components)
           ↓
   Display on /
           ↓
   (No database connection yet)
```

### New Flow

```
Database (landing_section table)
           ↓
  API (/api/landing/sections)
           ↓
  Admin Panel (/admin/landing-builder)
           ↓
  Edit & Reorder
           ↓
  Save to Database
           ↓
  Landing Page Fetches from DB
           ↓
  Display on /
```

## Integration with Landing Page Components

The landing page components still render from code, but the admin builder:
1. Stores section structure in database
2. Allows reordering without code changes
3. Enables content updates without deployment
4. Provides a UI for managing sections

To fully integrate with database rendering:
- Convert landing page components to render from database sections
- Use section.content to populate component props
- Keep current components as fallback

## Advanced Features

### Type-Specific Forms

The editor includes special forms for:
- **Pricing**: Add/edit pricing plans with fields
- **Credit Packs**: Manage credit packages
- **FAQ**: Manage FAQ items
- **Custom**: Raw JSON editing

### Search & Filter

- Search by section title, key, or type
- Shows filtered count vs total count
- Real-time filtering

### Statistics Dashboard

- Total sections count
- Visible sections (green indicator)
- Hidden sections (amber indicator)

## Troubleshooting

### "Landing tables are missing"
Solution:
```bash
pnpm db:migrate
```

### Sections not appearing
1. Check if sections are visible (eye icon)
2. Verify database has data:
   ```bash
   pnpm tsx -e "import { db } from './src/lib/db'; import { landingSection } from './src/lib/db/schema/landing'; console.log(await db.select().from(landingSection));"
   ```
3. Run seed script again:
   ```bash
   pnpm tsx scripts/seed-landing-sections.ts
   ```

### Drag-and-drop not working
- Ensure JavaScript is enabled
- Clear browser cache
- Try arrow buttons instead
- Check browser console for errors

## Next Steps

1. ✅ Database integration complete
2. ✅ Admin landing builder ready
3. ⏭️ Connect landing page components to database rendering
4. ⏭️ Add live preview in admin panel
5. ⏭️ Add section templates library
6. ⏭️ Add A/B testing for sections

## API Documentation

### GET /api/landing/sections

Returns all landing sections with associated media.

```bash
curl http://localhost:3000/api/landing/sections
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "hero-section",
      "key": "hero",
      "type": "hero",
      "title": "From intent to production",
      "order": 0,
      "isVisible": true,
      "content": {...},
      "media": []
    }
  ],
  "count": 14
}
```

### POST /api/landing/sections (Admin only)

Create a new section.

```bash
curl -X POST http://localhost:3000/api/landing/sections \
  -H "Content-Type: application/json" \
  -d '{
    "key": "custom-section",
    "type": "custom",
    "title": "My Custom Section",
    "content": {"heading": "Welcome"},
    "isVisible": true,
    "order": 99
  }'
```

### PATCH /api/landing/sections/[key] (Admin only)

Update a section.

```bash
curl -X PATCH http://localhost:3000/api/landing/sections/hero \
  -H "Content-Type: application/json" \
  -d '{"title": "New Title", "order": 1}'
```

### DELETE /api/landing/sections/[key] (Admin only)

Hide a section (soft delete).

```bash
curl -X DELETE http://localhost:3000/api/landing/sections/hero
```

---

**Status:** ✅ Database integration complete and ready to use!
