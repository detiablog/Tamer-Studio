# Admin Landing Builder - Quick Reference

## 🚀 Quick Start

### Access Admin Panel
```
http://localhost:3000/admin/landing-builder
```

### Prerequisites
- ✅ Database migrated: `pnpm db:migrate`
- ✅ Data seeded: `pnpm tsx scripts/seed-landing-sections.ts`
- ✅ Dev server running: `pnpm dev`
- ✅ Logged in as admin

---

## 🎮 Features Overview

| Feature | Button | Action | Result |
|---------|--------|--------|--------|
| **Create** | ➕ New Section | Click → Fill form → Save | New section at end |
| **Edit** | ✏️ | Click → Modify → Save | Section updated, DB updated |
| **Delete** | 🗑️ | Click → Confirm | Section hidden (`isVisible: false`) |
| **Show/Hide** | 👁️ / 🔒 | Toggle | Section visibility changes |
| **Reorder** | ⬆️ ⬇️ | Click arrow | Section moves one position |
| **Drag** | 🎯 | Drag section | Reorder with visual feedback |
| **Copy** | 📋 | Click | Duplicate section created |
| **Search** | 🔍 | Type title/key | Filter list in real-time |
| **Preview** | 📱 | Click | Live preview panel opens |
| **Refresh** | 🔄 | Click | Reload from database |

---

## 📊 Statistics Cards

```
Total Sections     Visible        Hidden
      14              12             2
    📊               👁️             🔒
```

- **Total:** Sum of visible + hidden
- **Visible:** Appear on landing page
- **Hidden:** Soft-deleted, can restore

---

## ✨ Visual Feedback

### Drag & Drop
```
Normal Item           Hovering           Dragging Over
┌──────────────┐    ┌──────────────┐   ┌──────────────┐
│ Section      │    │ Section      │   │ Section      │
│ 🎯           │ →  │ 🎯 shadow↑   │ → │ 🎯 ring+++   │
└──────────────┘    └──────────────┘   └──────────────┘
  border-border      border-primary    ring-primary
                    hover:bg-muted    bg-primary/10
                                      scale(1.02)
```

### Section Item
```
[grip] 🚀 Hero Section         [key] [type] [hidden]
       From intent to...
       0 media • Order: 1
                        [↑][↓][👁️][📋][✏️][🗑️]
```

---

## 🎯 Common Tasks

### Create New Section
1. Click **New Section**
2. Fill in fields:
   - Key: `section-key` (auto-lowercase)
   - Type: Choose from dropdown
   - Title: Display title
   - Subtitle: Optional description
3. Click **Create Section**
4. ✅ Section appears in list

### Edit Existing Section
1. Click **✏️ Edit** on section
2. Modify any field
3. Click **Save Changes**
4. ✅ Updates reflected immediately

### Reorder Sections
**Method 1: Arrow Buttons**
1. Click **⬆️** to move up
2. Click **⬇️** to move down
3. ✅ Order updates in database

**Method 2: Drag & Drop**
1. Drag section to new position
2. See drop zone highlight
3. Release mouse
4. ✅ Sections reorder, DB updates

### Hide Section
1. Click **🗑️ Delete** (soft-delete)
2. Confirm in dialog
3. ✅ Section moves to hidden
4. Section still in database

**OR**

1. Click **👁️** (Eye) on visible section
2. ✅ Section hides
3. Statistics update

### Duplicate Section
1. Click **📋 Copy** on section
2. ✅ New section appears at end
3. Title has "(Copy)" suffix
4. Can edit immediately

### Find Section
1. Type in search box: `hero` or `pricing`
2. List filters instantly
3. Shows "X of Y" indicator
4. Clear to show all

---

## 💾 Database Behavior

### On Create
```
POST /api/landing/sections
→ INSERT into landing_section
→ New record with id, createdAt, updatedAt
```

### On Edit
```
PATCH /api/landing/sections/[key]
→ UPDATE landing_section SET ...
→ updatedAt timestamp updates
```

### On Delete
```
DELETE /api/landing/sections/[key]
→ UPDATE landing_section SET isVisible = false
→ Soft delete, data preserved
```

### On Reorder
```
PATCH /api/landing/sections/[key]
→ UPDATE landing_section SET order = X
→ Database order changes
```

---

## 🔍 Live Preview

### Open Preview
1. Click **📱 Live Preview** button
2. Panel slides in from right
3. Shows all visible sections in order

### What Shows
```
Section Order  Type  Icon  Status
1.             Hero  🚀    Visible
2.             Features ⭐  Visible
3.             Pricing 💰  Visible
...
14.            Footer 📄  Visible
```

### Refresh Preview
1. Make changes in editor
2. Click **↻ Refresh** in preview
3. Preview updates with new data

### Close Preview
1. Click **X** button
2. Panel slides out
3. Click overlay to close

---

## ⚠️ Important Notes

### Soft Delete
- Clicking **🗑️** hides section, doesn't remove it
- Section still in database with `isVisible: false`
- Can toggle visibility with **👁️** to restore
- Permanently restore by editing and saving

### Drag & Drop
- Requires 2+ sections
- Smooth animation included
- Order updates in real-time
- Database updates automatically
- Toast confirms success

### Search
- Filters by title, key, or type
- Case-insensitive
- Shows filtered count
- Clear by deleting search text

### Statistics
- Auto-update after each action
- Total = Visible + Hidden
- Shows current state

---

## 🎨 Color Meanings

| Color | Meaning |
|-------|---------|
| 🟢 Green | Visible, active |
| 🟡 Amber | Hidden, archived |
| 🔵 Blue | Primary action, selected |
| ⚫ Black | Normal, default state |
| 🔴 Red | Destructive action, delete |

---

## 🐛 Troubleshooting

### Nothing showing up?
1. Check database migrated: `pnpm db:migrate`
2. Check data seeded: `pnpm tsx scripts/seed-landing-sections.ts`
3. Try clicking **Refresh** button
4. Check browser console for errors

### Changes not saving?
1. Check network tab (should see 200 response)
2. Look for error toast message
3. Verify database connection
4. Try refreshing page
5. Check API endpoint: `/api/landing/sections`

### Drag & drop not working?
1. Make sure 2+ sections exist
2. Check browser console
3. Try dragging slowly
4. Verify database has order field
5. Use arrow buttons instead

### Preview not loading?
1. Check if sections exist
2. Verify visibility settings
3. Try refresh button
4. Close and reopen preview
5. Check browser console

---

## 📋 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close modal/preview |
| `Enter` | Submit form (in some fields) |
| `↑` | Scroll up |
| `↓` | Scroll down |

---

## 🎓 Section Types

| Type | Icon | Use Case |
|------|------|----------|
| hero | 🚀 | Main banner section |
| features | ⭐ | Feature showcase |
| pricing | 💰 | Pricing plans |
| testimonials | 💬 | Customer quotes |
| faq | ❓ | Q&A section |
| cta | 🎯 | Call to action |
| footer | 📄 | Footer content |
| credit-packs | 📦 | Credit packages |
| credit-usage | 📊 | Usage table |
| custom | 🔧 | Custom content |

---

## 📞 Need Help?

### Check Documentation
- `ADMIN_LANDING_BUILDER_TESTING_GUIDE.md` - Full testing guide
- `ADMIN_LANDING_BUILDER_COMPLETE.md` - Complete summary

### Common Issues
See **Troubleshooting** section above

### Still Stuck?
1. Check browser console for errors
2. Check network tab for failed requests
3. Verify database connection
4. Try clearing browser cache
5. Restart dev server

---

## ✅ Test Checklist

Before going live, verify:

- [ ] Create section works
- [ ] Edit section works
- [ ] Delete section works
- [ ] Reorder with arrows works
- [ ] Drag & drop works
- [ ] Visibility toggle works
- [ ] Search filters
- [ ] Duplicate works
- [ ] Live preview shows
- [ ] Database updates
- [ ] Refresh button works
- [ ] No console errors
- [ ] Toasts show feedback

---

**Status: ✅ Ready to Use!**

Start by clicking **📱 Live Preview** to see your landing page,
then use **➕ New Section** to add or modify content.

Enjoy managing your landing page! 🎉
