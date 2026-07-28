# Landing Builder Runtime Report

**Sprint:** CMS-01 B8 — Landing Builder Runtime
**Date:** 2026-07-28
**Status:** COMPLETE

---

## 1. Executive Summary

This report documents the implementation of the Landing Builder Runtime, a centralized mediation layer between the Landing Builder UI and the CMS Engine.

---

## 2. Architecture

```
Landing Builder UI
        ↓
Landing Builder Runtime
        ↓
CMS Engine (CMSService)
        ↓
CMS Repositories
        ↓
Database
```

The Landing Builder Runtime is the ONLY entry point for Landing Builder operations. It never bypasses the CMS Engine.

---

## 3. Implementation

### 3.1 Core File

**File:** `src/core/cms/landing-builder-runtime.ts`
**Class:** `LandingBuilderRuntime`

### 3.2 Responsibilities

| Responsibility | Description |
|----------------|-------------|
| Editor State | Manages current page, selection, clipboard |
| History | Undo/redo with 50-entry history buffer |
| Page Operations | Create, read, update landing pages |
| Section Operations | CRUD, duplicate, reorder |
| Block Operations | CRUD within sections |
| Component Operations | Register, list, lookup by type |
| Media Operations | Upload, list via CMS Media Library |
| Version Operations | Create versions, rollback |
| Publishing Operations | Create publish pipelines |
| Navigation Integration | Sync landing pages to navigation |
| Localization Integration | Get/set localized content |
| SEO Integration | Update page SEO metadata |

### 3.3 State Management

```typescript
export type EditorSelection = {
  type: "page" | "section" | "block" | "component";
  id: string;
};

export type EditorHistoryEntry = {
  action: string;
  timestamp: number;
  data: unknown;
  selection?: EditorSelection;
};

export type ClipboardEntry = {
  type: "section" | "block" | "component";
  data: unknown;
};
```

### 3.4 Key Methods

| Method | Description |
|--------|-------------|
| `createLandingPage()` | Creates a CMS page for landing content |
| `getCurrentPage()` | Returns the currently edited CMS page |
| `createSection()` | Creates a CMS section |
| `updateSection()` | Updates a CMS section |
| `deleteSection()` | Soft-deletes a CMS section |
| `duplicateSection()` | Clones a section with new sectionKey |
| `reorderSections()` | Reorders sections within a page |
| `pushHistory()` | Records an undo/redo entry |
| `undo()` / `redo()` | Navigates history |
| `setSelection()` / `getSelection()` | Manages active selection |
| `setClipboard()` / `getClipboard()` / `pasteClipboard()` | Clipboard operations |

---

## 4. Integration Points

### 4.1 CMS Engine Integration

The runtime delegates all data operations to `CMSService`:
- Pages → `CMSService.createPage()`, `CMSService.updatePage()`
- Sections → `CMSService.createSection()`, `CMSService.updateSection()`, `CMSService.deleteSection()`
- Blocks → `CMSService.createBlock()`, `CMSService.updateBlock()`
- Media → `CMSService.registerMedia()`, `CMSService.listMedia()`
- Versions → `CMSService.createVersion()`, `CMSService.getVersions()`
- Publishing → `CMSService.createPublishPipeline()`
- Audit → `CMSService.getAuditLog()`

### 4.2 Navigation Integration

```typescript
async syncToNavigation(pageId: string): Promise<void>
```

Triggers navigation sync when landing page content changes.

### 4.3 Localization Integration

```typescript
async getLocalizedContent(contentId: string, locale: string): Promise<Record<string, string>>
async updateLocalizedContent(contentId: string, locale: string, translations: Record<string, string>): Promise<void>
```

Reads and writes localized content through the CMS page localization fields.

### 4.4 SEO Integration

```typescript
async updatePageSEO(pageId: string, seo: {...}): Promise<void>
```

Updates CMS page SEO metadata.

---

## 5. Dependency Injection

The runtime accepts an optional `CMSService` instance via constructor:

```typescript
constructor(cmsService?: CMSService)
```

This enables testing with mock services and future DI container integration.

---

## 6. Permanent Rules Enforced

| Rule | Enforcement |
|------|-------------|
| Landing Builder never owns content | All operations delegate to CMSService |
| CMS owns content | Runtime never writes to `landing_section` table |
| Navigation owns routing | Runtime calls `syncToNavigation()` for nav updates |
| Localization owns translations | Runtime uses CMS localization fields |
| SEO Runtime owns SEO generation | Runtime only stores SEO metadata, never generates |

---

## 7. Conclusion

The Landing Builder Runtime provides a clean, centralized interface for the Landing Builder UI to interact with the CMS Engine. It enforces all architectural rules and provides the foundation for all future Landing Builder features.