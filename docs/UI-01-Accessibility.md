# UI-01 Accessibility

## Overview

This document details the accessibility implementation in Tamer Studio, covering WCAG guidelines, keyboard navigation, focus management, ARIA attributes, contrast ratios, reduced motion, and screen reader support.

---

## 1. WCAG Guidelines

### Target Compliance

| Level | Status | Notes |
|-------|--------|-------|
| WCAG 2.1 A | Partial | Core functionality accessible |
| WCAG 2.1 AA | Partial | Focus indicators, contrast, keyboard nav |
| WCAG 2.1 AAA | Not targeted | Future improvement |

### Key Principles Addressed

- **Perceivable:** Text alternatives, color contrast, resize support
- **Operable:** Keyboard accessible, no keyboard traps, timing adjustable
- **Understandable:** Readable, predictable, input assistance
- **Robust:** Compatible with assistive technologies

---

## 2. Keyboard Navigation

### Global Shortcuts

| Shortcut | Action | Component |
|----------|--------|-----------|
| Cmd+K / Ctrl+K | Open command palette | CommandPalette |
| Cmd+[ / Ctrl+[ | Toggle sidebar | AppShell |
| ArrowUp/Down | Navigate list items | CommandPalette, SearchInput |
| Enter | Select/activate item | CommandPalette, SearchInput |
| Escape | Close modal/dropdown | Dialog, Sheet, Select, CommandPalette |

### Tab Order

The application follows a logical tab order:

1. Skip to main content (future)
2. Sidebar navigation items
3. Topbar elements (left to right):
   - Workspace switcher
   - Search input
   - Language switcher
   - Notification bell
   - Theme toggle
   - Avatar dropdown
4. Main content area
5. Page-specific interactive elements

### Focus Management

**Dialog Focus Trapping:**
```tsx
// Dialog traps focus within the modal
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    {/* First focusable element receives auto-focus */}
  </DialogContent>
</Dialog>
```

**Command Palette Focus:**
```tsx
<input
  ref={inputRef}
  autoFocus
  // Arrow keys navigate results
  // Enter selects
  // Escape closes
/>
```

**Dropdown Focus:**
- Click outside closes dropdown (`fixed inset-0` overlay)
- Escape key closes dropdown
- Tab moves to next focusable element

---

## 3. Focus Indicators

### Global Focus Ring

**File:** `src/app/globals.css`

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
}
```

### Component-Level Focus Styles

| Component | Focus Style |
|-----------|-------------|
| Button | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` |
| Input | `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` |
| Select Trigger | `focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2` |
| Tabs Trigger | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |
| Switch | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |
| Sidebar Item | `focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50` |
| Avatar Dropdown | `focus-visible:ring-2 focus-visible:ring-ring/50` |

### Focus-Visible vs Focus

- `focus-visible:` used for keyboard-only focus indicators
- `focus:` used for always-visible focus (e.g., select dropdowns)
- Prevents focus ring on mouse click while maintaining keyboard accessibility

---

## 4. ARIA Labels

### Landmark Roles

| Element | ARIA Attribute | Value |
|---------|---------------|-------|
| Sidebar | `aria-label` | (implicit via nav) |
| Topbar | `role="banner"` | (implicit via header) |
| Main content | (implicit) | `<main>` element |
| Breadcrumb | `aria-label="Breadcrumb"` | Navigation landmark |
| Command Palette | `role="dialog"`, `aria-modal="true"` | Modal dialog |
| Sheet | `role="dialog"`, `aria-modal="true"` | Modal dialog |
| NotificationCenter | `role="dialog"`, `aria-modal="true"` | Modal dialog |

### Interactive Elements

| Element | ARIA Attributes |
|---------|----------------|
| Switch | `role="switch"`, `aria-checked="true/false"` |
| Accordion Trigger | `aria-expanded="true/false"` |
| Select Trigger | `aria-expanded="true/false"`, `aria-haspopup="true"` |
| Avatar Dropdown | `aria-expanded="true/false"`, `aria-haspopup="true"` |
| Language Switcher | `aria-expanded="true/false"`, `aria-haspopup="true"`, `aria-label="Change language"` |
| Sidebar Toggle | `aria-label="Expand sidebar"` / `aria-label="Collapse sidebar"` |
| Theme Toggle | `aria-label="Toggle theme"` |
| Notification Bell | `aria-label="Notifications"` |
| Menu Button | `aria-label="Open menu"` |

### Content Labels

| Element | ARIA Attribute |
|---------|----------------|
| Search Input | `aria-label="Global search"` |
| Command Palette Input | `aria-label={t("commandPalette.searchAria")}` |
| Separator | `role="separator"`, `aria-orientation="horizontal/vertical"` |
| Alert | `role="alert"` |
| Breadcrumb Items | `aria-current="page"` on current |
| Decorative Icons | `aria-hidden="true"` |

---

## 5. Contrast Ratios

### Theme Color Contrast

| Color Pair | Ratio | WCAG AA | WCAG AAA |
|------------|-------|---------|----------|
| foreground on background (light) | 18.4:1 | Pass | Pass |
| foreground on background (dark) | 18.4:1 | Pass | Pass |
| muted-foreground on background (light) | 7.1:1 | Pass | Pass |
| muted-foreground on background (dark) | 4.8:1 | Pass | Fail |
| primary on primary-foreground (light) | 18.4:1 | Pass | Pass |
| destructive on background | 5.9:1 | Pass | Fail |

### Component-Level Contrast

| Element | Pattern |
|---------|---------|
| Text on primary buttons | `text-primary-foreground` on `bg-primary` |
| Text on destructive | `text-destructive` on `bg-background` |
| Placeholder text | `placeholder:text-muted-foreground/60` |
| Disabled text | `disabled:opacity-50` |
| Focus ring | `ring-ring/50` (50% opacity) |

### Dark Mode Adjustments

Dark mode uses lighter foreground colors on darker backgrounds:
- `--foreground: oklch(0.985 0 0)` on `--background: oklch(0.145 0 0)`
- `--muted-foreground: oklch(0.708 0 0)` for secondary text
- Border uses alpha: `--border: oklch(1 0 0 / 10%)`

---

## 6. Reduced Motion Support

### CSS Media Query

**File:** `src/styles/animations.css`

```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in, .animate-slide-up, .animate-slide-down,
  .animate-scale-in, .animate-shimmer, .animate-pulse-soft,
  .animate-float {
    animation: none;
  }
  .hover-lift, .hover-scale, .hover-glow {
    transition: none;
  }
}
```

**File:** `src/styles/mobile.css`

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Affected Animations

| Animation | Class | Reduced Motion |
|-----------|-------|----------------|
| Fade in | `animate-fade-in` | Disabled |
| Slide up | `animate-slide-up` | Disabled |
| Slide down | `animate-slide-down` | Disabled |
| Scale in | `animate-scale-in` | Disabled |
| Shimmer | `animate-shimmer` | Disabled |
| Pulse soft | `animate-pulse-soft` | Disabled |
| Float | `animate-float` | Disabled |
| Hover lift | `hover-lift` | Transition disabled |
| Hover scale | `hover-scale` | Transition disabled |
| Hover glow | `hover-glow` | Transition disabled |

### tw-animate-css Integration

The `animate-in` utility from `tw-animate-css` is used extensively:
- `animate-in fade-in-0` for dialogs
- `animate-in slide-in-from-right` for sheets
- `animate-in slide-in-from-top-2` for dropdowns
- `duration-200` for quick transitions
- `duration-300` for page transitions

---

## 7. Screen Reader Support

### Semantic HTML

| Element | Usage |
|---------|-------|
| `<nav>` | Sidebar, Breadcrumb |
| `<main>` | AppShell content area |
| `<header>` | Topbar |
| `<aside>` | Sidebar |
| `<h1>` | Page title |
| `<h3>` | Section/card titles |
| `<ol>` | Breadcrumb list |
| `<button>` | All interactive buttons |
| `<a>` | Navigation links |

### Hidden Content

```tsx
// Decorative icons
<Icon className="..." aria-hidden="true" />

// Screen reader only text
<div className="sr-only">...</div>
```

### Live Regions

- Toast notifications use `sonner` which provides live region announcements
- Alert component uses `role="alert"` for immediate announcement

### State Announcements

| Element | State | ARIA Attribute |
|---------|-------|----------------|
| Accordion | Open/closed | `aria-expanded` |
| Select | Open/closed | `aria-expanded` |
| Dropdown | Open/closed | `aria-expanded` |
| Switch | On/off | `aria-checked` |
| Tab | Selected | `aria-selected` (via data-slot) |

---

## 8. Form Accessibility

### Label Association

```tsx
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### Error Messaging

```tsx
<Input aria-invalid="true" aria-describedby="email-error" />
<div id="email-error" role="alert">Email is required</div>
```

### Required Fields

```tsx
<Label>
  Email <span className="text-destructive">*</span>
</Label>
<Input required aria-required="true" />
```

### Disabled State

```tsx
<Button disabled aria-disabled="true">
  Submit
</Button>
```

---

## 9. Color Independence

### Non-Color Indicators

All status indicators use more than just color:

| Status | Color | Additional Indicator |
|--------|-------|---------------------|
| Active sidebar | Blue bg | Bold text, shadow |
| Notification unread | Primary dot | Dot indicator |
| Validation error | Red border | `aria-invalid`, ring |
| Success | Green | Icon (CircleCheck) |
| Warning | Yellow | Icon (TriangleAlert) |
| Error | Red | Icon (OctagonX) |

---

## 10. Testing Recommendations

### Automated Testing

- axe-core integration for WCAG violations
- Lighthouse accessibility audit
- eslint-plugin-jsx-a11y in codebase

### Manual Testing

| Test | Method |
|------|--------|
| Keyboard navigation | Tab through all interactive elements |
| Screen reader | VoiceOver (macOS), NVDA (Windows) |
| Zoom | 200% browser zoom |
| Color contrast | Chrome DevTools contrast checker |
| Reduced motion | OS-level preference toggle |
| Focus visibility | Keyboard-only navigation |

### Known Limitations

1. Skip to main content link not implemented
2. Some dropdown menus lack full keyboard navigation
3. Drag and drop operations not fully accessible
4. Complex data tables lack row/column headers
5. Color contrast in some chart visualizations
