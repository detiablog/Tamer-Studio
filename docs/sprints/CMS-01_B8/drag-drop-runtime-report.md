# Drag & Drop Runtime Report

**Sprint:** CMS-01 B8 — Landing Builder Runtime
**Date:** 2026-07-28
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the Drag & Drop Runtime implementation in the Landing Builder, including move, insert, reorder, duplicate, and delete operations.

---

## 2. Library

**Drag & Drop Library:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

---

## 3. Implementation

### 3.1 DnD Context

The `AdminLandingBuilderClient` wraps the section list in a `DndContext`:

```tsx
<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext
    items={sections.map((s) => s.sectionKey)}
    strategy={verticalListSortingStrategy}
  >
    <SectionList ... />
  </SortableContext>
</DndContext>
```

### 3.2 Sensors

```typescript
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
);
```

- **PointerSensor:** Requires 8px movement to prevent accidental drags
- **KeyboardSensor:** Supports keyboard navigation for accessibility

### 3.3 Reorder Operation

When a drag ends, `handleDragEnd` calculates the new order:

```typescript
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over || active.id === over.id) return;

  const oldIndex = sections.findIndex((s) => s.sectionKey === active.id);
  const newIndex = sections.findIndex((s) => s.sectionKey === over.id);

  const reordered = arrayMove(sections, oldIndex, newIndex).map((s, idx) => ({
    sectionKey: s.sectionKey,
    order: idx,
  }));
  handleReorder(reordered);
};
```

### 3.4 Reorder API

The reorder operation calls `PATCH /api/landing/sections/reorder` which now uses `CMSService.reorderSections()`:

```typescript
await cmsService.reorderSections(reorderData);
```

### 3.5 Duplicate Operation

Duplication is handled via `POST /api/landing/sections/{sectionKey}` with a `newSectionKey` body. The route calls `CMSService.duplicateSection()` which:
1. Fetches the existing section
2. Creates a copy with a new sectionKey (`{original}-copy-{timestamp}`)
3. Preserves config, styles, and media

### 3.6 Delete Operation

Deletion is handled via `DELETE /api/landing/sections/{sectionKey}`. The route:
1. Validates the section exists
2. Checks if the section is locked
3. Calls `CMSService.deleteSection()`
4. Returns success response

### 3.7 Undo Delete

The `SectionList` component implements undo delete with a 5-second timeout:

```typescript
const handleDeleteWithUndo = async (section: LandingSection) => {
  onDelete(section);
  const timeout = setTimeout(() => {
    setUndoStack((prev) => prev.filter((item) => item.section.id !== section.id));
  }, 5000);
  setUndoStack((prev) => [...prev, { section, timeout }]);
};
```

---

## 4. CMS Integration

All drag & drop operations now flow through the CMS Engine:

| Operation | UI Action | API Route | CMS Method |
|-----------|-----------|-----------|------------|
| Reorder | Drag & drop | PATCH /api/landing/sections/reorder | CMSService.reorderSections() |
| Duplicate | Click duplicate | POST /api/landing/sections/{key} | CMSService.duplicateSection() |
| Delete | Click delete | DELETE /api/landing/sections/{key} | CMSService.deleteSection() |

---

## 5. Conclusion

The Drag & Drop Runtime is fully operational and integrated with the CMS Engine. All section manipulation operations persist through CMS repositories.