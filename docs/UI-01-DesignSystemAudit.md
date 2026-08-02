# UI-01 Design System Audit

## Overview

This document audits the Tamer Studio design system, cataloging all existing components, patterns, conventions, and identifying gaps that were addressed in the UI Polish Sprint.

---

## 1. Existing Components Inventory

### Primitives (shadcn/ui base-nova style)

| Component | File | Primitives Used |
|-----------|------|-----------------|
| Button | `src/components/ui/button.tsx` | `@base-ui/react/button`, CVA |
| Input | `src/components/ui/input.tsx` | `@base-ui/react/input` |
| Checkbox | `src/components/ui/checkbox.tsx` | `@base-ui/react/checkbox` |
| Label | `src/components/ui/label.tsx` | Native `<label>` |
| Card | `src/components/ui/card.tsx` | Native `<div>` with data-slot |

### Composite Components

| Component | File | Description |
|-----------|------|-------------|
| Dialog | `src/components/ui/dialog.tsx` | Modal dialog with overlay, close, header, footer |
| Select | `src/components/ui/select.tsx` | Custom dropdown with context provider |
| Tabs | `src/components/ui/tabs.tsx` | Tabbed interface with context provider |
| Accordion | `src/components/ui/accordion.tsx` | Collapsible sections, single/multiple mode |
| Switch | `src/components/ui/switch.tsx` | Toggle switch with aria role |
| Tooltip | `src/components/ui/tooltip.tsx` | Hover/focus tooltip with positioning |
| Progress | `src/components/ui/progress.tsx` | Linear progress bar |
| Alert | `src/components/ui/alert.tsx` | Alert banner with variants |
| Separator | `src/components/ui/separator.tsx` | Horizontal/vertical divider |
| Textarea | `src/components/ui/textarea.tsx` | Multi-line text input |
| Sheet | `src/components/ui/Sheet.tsx` | Slide-in panel (left/right/top/bottom) |
| Badge | `src/components/ui/Badge.tsx` | Status badge with tone variants |

### Layout & Navigation

| Component | File | Description |
|-----------|------|-------------|
| AppShell | `src/components/ui/AppShell.tsx` | Main app layout with sidebar + topbar |
| Sidebar | `src/components/ui/Sidebar.tsx` | Collapsible sidebar with grouped nav items |
| SidebarItem | `src/components/ui/SidebarItem.tsx` | Individual sidebar navigation item |
| Topbar | `src/components/ui/Topbar.tsx` | Top navigation bar with search, theme, notifications |
| MobileNav | `src/components/ui/MobileNav.tsx` | Bottom navigation bar for mobile |
| Breadcrumb | `src/components/ui/Breadcrumb.tsx` | Breadcrumb navigation |
| PageLayout | `src/components/ui/PageLayout.tsx` | Page wrapper with breadcrumb + header |
| PageHeader | `src/components/ui/PageHeader.tsx` | Page title + description + actions |
| PageContainer | `src/components/ui/PageContainer.tsx` | Max-width centered container |
| SectionHeader | `src/components/ui/SectionHeader.tsx` | Section title + subtitle + action |

### Feedback & Loading

| Component | File | Description |
|-----------|------|-------------|
| Skeleton | `src/components/ui/Skeleton.tsx` | Placeholder loading skeleton |
| ElegantLoader | `src/components/ui/ElegantLoader.tsx` | Full-screen branded loading spinner |
| CompactLoader | `src/components/ui/ElegantLoader.tsx` | Compact loading for modals/sections |
| MiniLoader | `src/components/ui/ElegantLoader.tsx` | Inline loading indicator |
| EmptyState | `src/components/ui/EmptyState.tsx` | Empty state with icon, title, description, action |
| Toaster (Sonner) | `src/components/ui/sonner.tsx` | Toast notifications via sonner |

### Interactive

| Component | File | Description |
|-----------|------|-------------|
| CommandPalette | `src/components/ui/CommandPalette.tsx` | Cmd+K command palette |
| SearchInput | `src/components/ui/SearchInput.tsx` | Global search with suggestions |
| WorkspaceSwitcher | `src/components/ui/WorkspaceSwitcher.tsx` | Workspace dropdown switcher |
| AvatarDropdown | `src/components/ui/AvatarDropdown.tsx` | User avatar menu |
| Avatar | `src/components/ui/Avatar.tsx` | User avatar with initials |
| LanguageSwitcher | `src/components/ui/LanguageSwitcher.tsx` | Language selector dropdown |
| NotificationCenter | `src/components/ui/NotificationCenter.tsx` | Notification panel |
| ActionButton | `src/components/ui/ActionButton.tsx` | Simple action button wrapper |

### Dashboard-Specific

| Component | File | Description |
|-----------|------|-------------|
| StatCard | `src/components/ui/StatCard.tsx` | Statistics card with title, value, delta |
| DashboardCard | `src/components/ui/DashboardCard.tsx` | Generic dashboard card |

---

## 2. Component Patterns and Conventions

### CVA (class-variance-authority)

Used for component variant definitions. Example from `button.tsx`:

```tsx
const buttonVariants = cva(
  "base-classes...",
  {
    variants: {
      variant: { default: "...", outline: "...", ... },
      size: { default: "...", xs: "...", sm: "...", lg: "...", ... },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);
```

### data-slot Pattern

Components use `data-slot` attributes for CSS targeting:

```tsx
<div data-slot="card" ...>
<div data-slot="card-header" ...>
<div data-slot="button" ...>
<div data-slot="progress" ...>
```

### cn() Utility

All components use the `cn()` utility from `@/lib/utils`:

```tsx
import { cn } from "@/lib/utils";

// Combines clsx + tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Context Pattern

Composite components use React Context for state sharing:

```tsx
const TabsContext = React.createContext<{ value: string; onChange: (v: string) => void }>(...);
function useTabs() { return React.useContext(TabsContext); }
```

### Controlled/Uncontrolled

Most interactive components support both controlled and uncontrolled modes:

```tsx
// Controlled
<Select value={value} onValueChange={setValue}>

// Uncontrolled
<Select defaultValue="option1">
```

---

## 3. Theme System

### CSS Variables (globals.css)

The theme uses OKLCH color space with CSS custom properties:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --radius: 0.625rem;
  /* ... */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... */
}
```

### Theme Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--background` | oklch(1 0 0) | oklch(0.145 0 0) | Page background |
| `--foreground` | oklch(0.145 0 0) | oklch(0.985 0 0) | Default text |
| `--primary` | oklch(0.205 0 0) | oklch(0.922 0 0) | Primary actions |
| `--muted` | oklch(0.97 0 0) | oklch(0.269 0 0) | Subdued backgrounds |
| `--destructive` | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | Error/danger |
| `--border` | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | Borders |
| `--radius` | 0.625rem | 0.625rem | Base border radius |

### Theme Provider

Uses `next-themes` with class-based dark mode:

```tsx
@custom-variant dark (&:is(.dark *));
```

Toggle via `useTheme()` hook from `next-themes`.

---

## 4. Typography, Spacing, Color Consistency

### Typography

| Class | Usage |
|-------|-------|
| `font-heading` | Maps to `--font-sans`, used for headings |
| `text-2xl font-semibold` | Page titles |
| `text-lg font-semibold` | Section titles |
| `text-base font-semibold` | Card titles |
| `text-sm font-medium` | Body text, labels |
| `text-xs` | Captions, badges |
| `text-[11px] uppercase tracking-wider` | Group labels, categories |

### Spacing

| Pattern | Usage |
|---------|-------|
| `p-4 sm:p-6 lg:p-8` | Page content padding |
| `gap-4 md:gap-6 lg:gap-8` | Dashboard grid gaps |
| `mb-6` | Section spacing |
| `py-3 px-4` | Topbar padding |
| `px-3 py-2` | Sidebar item padding |

### Color Usage

| Color | Application |
|-------|-------------|
| `text-foreground` | Primary text |
| `text-muted-foreground` | Secondary text |
| `bg-primary` | Primary buttons, active states |
| `bg-muted/40` | Hover backgrounds |
| `bg-destructive/10` | Error states |
| `border-border` | Default borders |
| `ring-ring/50` | Focus rings |

---

## 5. Missing Components Inventory (Pre-Sprint)

The following components were missing before the UI Polish Sprint and were created:

| Component | Status | File |
|-----------|--------|------|
| Dialog | Created | `src/components/ui/dialog.tsx` |
| Select | Created | `src/components/ui/select.tsx` |
| Tabs | Created | `src/components/ui/tabs.tsx` |
| Textarea | Created | `src/components/ui/textarea.tsx` |
| Tooltip | Created | `src/components/ui/tooltip.tsx` |
| Switch | Created | `src/components/ui/switch.tsx` |
| Progress | Created | `src/components/ui/progress.tsx` |
| Alert | Created | `src/components/ui/alert.tsx` |
| Separator | Created | `src/components/ui/separator.tsx` |
| Accordion | Created | `src/components/ui/accordion.tsx` |
| Sheet | Created | `src/components/ui/Sheet.tsx` |

---

## 6. New Components Created in This Sprint

### UI Primitives (11 components)

1. **Dialog** - Modal dialog with overlay, escape close, backdrop click
2. **Select** - Custom dropdown with keyboard support
3. **Tabs** - Tabbed interface with context-based state
4. **Textarea** - Multi-line input with focus ring
5. **Tooltip** - Position-aware hover tooltip
6. **Switch** - Toggle with aria-checked role
7. **Progress** - Animated progress bar
8. **Alert** - Banner with default/destructive/warning/success variants
9. **Separator** - Horizontal/vertical divider with role="separator"
10. **Accordion** - Collapsible sections with single/multiple mode
11. **Sheet** - Slide-in panel with side positioning

### Layout & UX Components

12. **CommandPalette** - Cmd+K quick navigation
13. **SearchInput** - Global search with debounced API suggestions
14. **EmptyState** - Empty state placeholder
15. **Breadcrumb** - Accessible breadcrumb navigation
16. **PageLayout** - Composed page layout
17. **Skeleton** - Loading skeleton
18. **ElegantLoader/CompactLoader/MiniLoader** - Loading indicators
19. **MobileNav** - Bottom navigation for mobile
20. **NotificationCenter** - Notification panel

---

## 7. Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.7 | UI framework |
| Next.js | 16.2.10 | App framework |
| Tailwind CSS | 4.3.3 | Utility-first CSS |
| class-variance-authority | 0.7.1 | Variant management |
| clsx | 2.1.1 | Conditional classes |
| tailwind-merge | 3.6.0 | Class deduplication |
| @base-ui/react | 1.6.0 | Headless UI primitives |
| lucide-react | 1.25.0 | Icons |
| next-themes | 0.4.6 | Theme management |
| sonner | 2.0.7 | Toast notifications |
| tw-animate-css | 1.4.0 | Animation utilities |
| zod | 4.4.3 | Schema validation |

---

## 8. Conventions Summary

- All components use `"use client"` directive for client-side interactivity
- `cn()` utility for all className merging
- `data-slot` attributes for CSS targeting and testing
- OKLCH color space for all theme colors
- Semantic color tokens (not raw hex values)
- Focus-visible rings on all interactive elements
- `aria-*` attributes for accessibility
- Responsive design with `sm:`, `md:`, `lg:` breakpoints
- Animation via `animate-in` from `tw-animate-css`
