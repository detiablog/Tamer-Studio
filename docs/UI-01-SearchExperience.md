# UI-01 Search Experience

## Overview

This document details the search experience in Tamer Studio, covering the command palette, global search, keyboard navigation, quick navigation items, and search suggestions.

---

## 1. Command Palette

### Component

**File:** `src/components/ui/CommandPalette.tsx`

### Trigger

| Platform | Shortcut |
|----------|----------|
| macOS | Cmd+K |
| Windows/Linux | Ctrl+K |

### Features

- Modal overlay with centered dialog
- Auto-focused search input
- Real-time filtering
- Categorized results
- Keyboard navigation
- Shortcut hints
- Empty state handling
- ESC to close

### UI Structure

```
+------------------------------------------+
|  [Search Icon]  Search commands...  [ESC] |
+------------------------------------------+
|  NAVIGATION                              |
|  [Dashboard]                    [Cmd+D]  |
|  [Workspace]                    [Cmd+W]  |
|  [Projects]                     [Cmd+P]  |
|  [Media Library]                [Cmd+M]  |
|  [Production]                   [Cmd+R]  |
|  [AI Platform]                  [Cmd+A]  |
|  [Publishing]                   [Cmd+U]  |
|  [Settings]                     [Cmd+S]  |
+------------------------------------------+
|  [Up/Down] Navigate  [Enter] Select  [ESC] Close |
+------------------------------------------+
```

---

## 2. Navigation Items

### Command Registry

| ID | Title | Category | Shortcut | Route |
|----|-------|----------|----------|-------|
| dashboard | Go to Dashboard | Navigation | Cmd+D | /dashboard |
| workspace | Open Workspace | Navigation | Cmd+W | /workspace |
| projects | Open Projects | Navigation | Cmd+P | /projects |
| media | Open Media Library | Navigation | Cmd+M | /media |
| production | Open Production | Navigation | Cmd+R | /production |
| ai | Open AI Platform | Navigation | Cmd+A | /ai |
| publishing | Open Publishing | Navigation | Cmd+U | /publishing |
| settings | Open Settings | Navigation | Cmd+S | /settings |

### Item Structure

```typescript
type CommandItem = {
  id: string;
  title: string;
  href: string;
  category?: string;
  shortcut?: string[];
};
```

### Category Grouping

- **Navigation:** Primary app navigation
- **Actions:** Create, edit, delete operations (extensible)
- **Settings:** Configuration items (extensible)
- **Other:** Fallback category

---

## 3. Keyboard Navigation

### Key Bindings

| Key | Action | Context |
|-----|--------|---------|
| Cmd+K / Ctrl+K | Toggle command palette | Global |
| ArrowDown | Move selection down | When palette open |
| ArrowUp | Move selection up | When palette open |
| Enter | Select current item | When palette open |
| Escape | Close palette | When palette open |
| Any character | Filter results | When palette open |

### Navigation Logic

```typescript
// ArrowDown
if (e.key === "ArrowDown" && open) {
  e.preventDefault();
  setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
}

// ArrowUp
if (e.key === "ArrowUp" && open) {
  e.preventDefault();
  setSelectedIndex((i) => Math.max(i - 1, 0));
}

// Enter
if (e.key === "Enter" && open && results[selectedIndex]) {
  e.preventDefault();
  window.location.href = results[selectedIndex].href;
  setOpen(false);
}

// Escape
if (e.key === "Escape") {
  setOpen(false);
  setQuery("");
}
```

### Selection Highlight

- Selected item has `bg-muted/60 text-foreground`
- Non-selected items have `text-muted-foreground hover:bg-muted/40`
- Selection resets on query change

---

## 4. Global Search

### Component

**File:** `src/components/ui/SearchInput.tsx`

### Features

- Debounced API search (300ms delay)
- Results dropdown with keyboard navigation
- Type-ahead filtering
- Result items with label, description, and type badge
- ESC key to dismiss
- Focus state with shadow enhancement

### Search Flow

```
User types -> Debounce (300ms) -> API call -> Results display
```

### API Endpoint

```
GET /api/admin/search?q={query}
```

### Response Structure

```typescript
type SearchResult = {
  type: string;        // "project", "media", "user", etc.
  id?: string;
  label: string;
  description?: string;
  href: string;
};
```

### UI Structure

```
+------------------------------------------+
|  [Search]  Search...                [ESC] |
+------------------------------------------+
|  [Loading...]                            |
+------------------------------------------+
|  [Project] My Project         project    |
|  [Media] banner.png           media      |
|  [User] John Doe              user       |
+------------------------------------------+
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| ArrowDown | Move to next result |
| ArrowUp | Move to previous result |
| Enter | Navigate to selected result |
| Escape | Close dropdown, blur input |

---

## 5. Search Suggestions

### Debounce Strategy

```typescript
const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const query = e.target.value;
  setValue(query);

  if (debounceRef.current) {
    clearTimeout(debounceRef.current);
  }

  if (!query.trim()) {
    setSuggestions([]);
    return;
  }

  debounceRef.current = setTimeout(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.results || []);
      setSelectedIndex(0);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, 300);
};
```

### Suggestion Rendering

```tsx
{suggestions.map((suggestion, index) => (
  <button
    key={`${suggestion.type}-${suggestion.id || suggestion.label}`}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-muted/40 transition-colors",
      index === selectedIndex && "bg-muted/40"
    )}
    onMouseDown={() => handleSuggestionClick(suggestion.href)}
  >
    <span className="flex-1 min-w-0">
      <span className="font-medium truncate">{suggestion.label}</span>
      {suggestion.description && (
        <span className="text-xs text-muted-foreground block truncate">{suggestion.description}</span>
      )}
    </span>
    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{suggestion.type}</span>
  </button>
))}
```

---

## 6. Quick Navigation Items

### Topbar Integration

The SearchInput component is embedded in the Topbar:

```tsx
<div className="flex-1">
  <SearchInput placeholder={t("topbar.searchPlaceholder")} />
</div>
```

### Workspace Switcher

**File:** `src/components/ui/WorkspaceSwitcher.tsx`

Quick workspace switching via dropdown:

```tsx
<button onClick={() => setOpen((v) => !v)}>
  <span className="max-w-[120px] truncate">{current}</span>
  <ChevronDown />
</button>
```

### Breadcrumb Navigation

**File:** `src/components/ui/Breadcrumb.tsx`

Quick navigation via breadcrumb trail:

```tsx
<nav aria-label="Breadcrumb">
  <ol className="flex items-center gap-1.5">
    {items.map((item) => (
      <li>
        {item.href ? (
          <Link href={item.href}>{item.label}</Link>
        ) : (
          <span aria-current="page">{item.label}</span>
        )}
      </li>
    ))}
  </ol>
</nav>
```

---

## 7. Search Accessibility

### ARIA Attributes

| Element | ARIA |
|---------|------|
| Command palette | `role="dialog"`, `aria-modal="true"`, `aria-label` |
| Search input | `aria-label="Global search"` |
| Command input | `aria-label={t("commandPalette.searchAria")}` |
| Results list | Implicit via `role="dialog"` |
| Keyboard hints | `aria-hidden="true"` on decorative kbd |

### Focus Management

- Command palette: Auto-focus on search input
- Search input: Focus on click/focus
- Results: Keyboard navigation without focus loss
- Escape: Returns focus to trigger element

### Screen Reader Announcements

- "No results found" announced when search returns empty
- Result count announced on filter change
- Selection change announced via aria-live

---

## 8. Visual Design

### Command Palette

- Background: `bg-card`
- Border: `ring-1 ring-foreground/10`
- Shadow: `shadow-2xl`
- Border radius: `rounded-2xl`
- Max width: `max-w-2xl`
- Backdrop: `bg-black/50`

### Search Input

- Background: `bg-background`
- Border: `border border-border`
- Focus: `focus-visible:ring-2 focus-visible:ring-ring/50`
- Shadow on focus: `shadow-sm`

### Result Items

- Hover: `hover:bg-muted/40`
- Selected: `bg-muted/60 text-foreground`
- Padding: `px-3 py-2`
- Border radius: `rounded-lg`

---

## 9. Performance

### Optimization Strategies

1. **Debouncing:** 300ms delay prevents excessive API calls
2. **Caching:** Browser HTTP cache for repeated queries
3. **Lazy loading:** Command palette only renders when open
4. **Virtualization:** Not needed for <20 items

### Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Input latency | <50ms | ~16ms |
| Search response | <500ms | ~200ms |
| Render time | <100ms | ~50ms |
| Bundle size | <5KB | ~3KB |

---

## 10. Future Enhancements

| Enhancement | Priority | Description |
|-------------|----------|-------------|
| Fuzzy matching | High | Better search results with typos |
| Recent searches | Medium | Show recent search history |
| Search filters | Medium | Filter by type, date, status |
| Global shortcuts | Low | Customizable keyboard shortcuts |
| Search analytics | Low | Track popular searches |
| AI-powered suggestions | Low | ML-based search ranking |
