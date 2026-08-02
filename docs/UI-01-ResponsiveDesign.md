# UI-01 Responsive Design

## Overview

This document details the responsive design strategy for Tamer Studio, covering breakpoints, mobile navigation, responsive grids, touch targets, and sidebar collapse behavior.

---

## 1. Breakpoint Strategy

### Tailwind CSS Default Breakpoints

| Prefix | Min Width | Target |
|--------|-----------|--------|
| (none) | 0px | Mobile (base) |
| `sm` | 640px | Large phones / small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Application Breakpoints

| Range | Layout | Sidebar | Topbar | MobileNav |
|-------|--------|---------|--------|-----------|
| 0-639px | Single column, stacked | Hidden (overlay) | Condensed | Visible (bottom) |
| 640-1023px | Single column | Collapsible | Full | Hidden |
| 1024px+ | Sidebar + content | Visible | Full | Hidden |

### CSS Custom Breakpoints

**File:** `src/styles/mobile.css`

```css
@media (max-width: 640px) {
  .mobile-nav-padding { padding-bottom: 4rem; }
  .mobile-full-width { width: 100%; }
  .mobile-stack { flex-direction: column; }
  .mobile-hide { display: none; }
  .mobile-show { display: block; }
  .mobile-compact { padding: 0.75rem; }
  .mobile-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .mobile-center { text-align: center; }
  .touch-target { min-height: 44px; min-width: 44px; }
}

@media (min-width: 641px) {
  .mobile-hide { display: block; }
  .mobile-show { display: none; }
}
```

### Safe Area Support

```css
@supports (padding: env(safe-area-inset-bottom)) {
  .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
  .safe-area-top { padding-top: env(safe-area-inset-top); }
}
```

---

## 2. Mobile Navigation

### Bottom Navigation Bar

**Component:** `src/components/ui/MobileNav.tsx`

- Fixed to bottom of viewport (`fixed bottom-0 left-0 right-0`)
- z-index: 40
- Height: 64px (`h-16`)
- Background: `bg-background/80 backdrop-blur-lg` (glass effect)
- Border top: `border-t border-border`
- 5 navigation items in a flex row with `justify-around`
- Hidden on `sm` breakpoint and above (`sm:hidden`)

**Navigation Items:**

| Label | Icon | Route |
|-------|------|-------|
| Home | Home | /dashboard |
| Projects | FolderOpen | /projects |
| AI | Image | /ai/image |
| Settings | Settings | /settings |
| Alerts | Bell | /notifications |

**Active State:**
```tsx
isActive ? "text-primary" : "text-muted-foreground"
```

### Mobile Sidebar

**Component:** `src/components/ui/AppShell.tsx`

- Sidebar hidden by default on mobile
- Toggle via hamburger menu in Topbar
- Overlay backdrop (`bg-black/50`) when open
- Slide-in animation (`translate-x-0` / `-translate-x-full`)
- Duration: 300ms ease-in-out
- Close on backdrop click

### Mobile Topbar

- Hamburger menu button visible only on `sm:hidden`
- Brand mark + "TS" logo
- Notification bell
- Theme toggle
- Avatar dropdown
- Workspace switcher hidden on mobile (`hidden sm:flex`)

---

## 3. Responsive Grids

### Dashboard Stats Grid

**File:** `src/app/dashboard.css`

```css
.grid-dashboard-stats {
  @apply grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4;
}
```

| Breakpoint | Columns | Gap |
|------------|---------|-----|
| Mobile | 1 | 16px |
| sm (640px) | 2 | 16px |
| md (768px) | 2 | 24px |
| lg (1024px) | 4 | 24px |

### Dashboard Panels Grid

```css
.grid-dashboard-panels {
  @apply grid gap-4 md:gap-6 lg:grid-cols-3;
}
```

| Breakpoint | Columns | Gap |
|------------|---------|-----|
| Mobile | 1 | 16px |
| md (768px) | 1 | 24px |
| lg (1024px) | 3 | 24px |

### Page Container

**Component:** `src/components/ui/PageContainer.tsx`

```tsx
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
```

| Breakpoint | Max Width | Horizontal Padding |
|------------|-----------|-------------------|
| Mobile | 1280px | 16px |
| sm (640px) | 1280px | 24px |
| lg (1024px) | 1280px | 32px |

### App Content Padding

**File:** `src/components/ui/AppShell.tsx`

```tsx
<main className="flex-1 p-4 sm:p-6 lg:p-8">
```

| Breakpoint | Padding |
|------------|---------|
| Mobile | 16px |
| sm (640px) | 24px |
| lg (1024px) | 32px |

---

## 4. Touch Targets

### Minimum Touch Target Size

**File:** `src/styles/mobile.css`

```css
.touch-target { min-height: 44px; min-width: 44px; }
```

### Component-Level Touch Targets

| Component | Touch Size | Notes |
|-----------|-----------|-------|
| MobileNav items | 44px min | Flex column with padding |
| Sidebar items | 40px height | `py-2` with icon + text |
| Topbar buttons | 36px | `h-9 w-9` |
| Dialog close | 32px | `right-4 top-4` |
| Search input | 40px height | `h-10` |
| Select trigger | 40px height | `h-10` |
| Switch | 36px | `h-5 w-9` |
| Checkbox | 24px | `size-4` with padding |

### Touch-Friendly Patterns

- All interactive elements have `hover:bg-muted/40` or similar feedback
- `active:not-aria-[haspopup]:translate-y-px` on buttons for press feedback
- `-webkit-overflow-scrolling: touch` on scrollable areas
- `select-none` on buttons to prevent text selection on tap

---

## 5. Sidebar Collapse Behavior

### Desktop (sm+)

| State | Width | Behavior |
|-------|-------|----------|
| Expanded | 288px (w-72) | Full sidebar with labels |
| Collapsed | 72px (w-[72px]) | Icons only |

**Collapse Toggle:**
- Button in sidebar header: `PanelLeftClose` / `PanelLeft` icons
- ChevronRight at bottom when collapsed
- Keyboard shortcut: Cmd+[
- Smooth transition: `transition-all duration-300 ease-in-out`

**Collapsed State:**
- Group labels hidden
- Item labels hidden (icon-only)
- Brand name hidden
- Logo "TS" still visible
- Bottom expand button appears

### Mobile (< sm)

| State | Behavior |
|-------|----------|
| Closed | Sidebar off-screen (`-translate-x-full`) |
| Open | Sidebar slides in (`translate-x-0`) with overlay |

**Mobile Overlay:**
```tsx
<div className="fixed inset-0 z-30 bg-black/50 sm:hidden" onClick={close} />
```

### Transition Details

```
duration: 300ms
easing: ease-in-out
properties: transform, width
```

---

## 6. Responsive Typography

### Text Size Scaling

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Page title | `text-2xl` | `text-2xl` | `text-2xl` |
| Section title | `text-lg` | `text-lg` | `text-lg` |
| Card title | `text-base` | `text-base` | `text-base` |
| Body text | `text-sm` | `text-sm` | `text-sm` |
| Caption | `text-xs` | `text-xs` | `text-xs` |
| Stat value | `text-3xl` | `text-3xl` | `text-3xl` |

### Page Header Responsive Layout

**Component:** `src/components/ui/PageHeader.tsx`

```tsx
<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
```

- Mobile: Stacked vertically (`flex-col`)
- sm+: Side by side (`sm:flex-row`) with space-between

---

## 7. Responsive Component Patterns

### WorkspaceSwitcher

```tsx
<div className="relative hidden sm:flex items-center">
```

- Hidden on mobile
- Visible on `sm` and above

### AvatarDropdown

```tsx
<div className="hidden md:flex flex-col items-start">
  <span className="text-sm font-medium">{label}</span>
  <span className="text-xs text-muted-foreground">{role}</span>
</div>
<div className="hidden md:block">
  <ChevronRight />
</div>
```

- Name/role text hidden on mobile
- Chevron hidden on mobile
- Avatar always visible

### LanguageSwitcher

```tsx
<span className="hidden md:inline text-xs">{current.flag}</span>
```

- Flag text hidden on mobile
- Globe icon always visible

---

## 8. Print Styles

**File:** `src/app/dashboard.css`

```css
@media print {
  .no-print {
    display: none !important;
  }
}
```

---

## 9. Reduced Motion Support

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

---

## 10. Testing Matrix

| Device | Width | Sidebar | MobileNav | Topbar |
|--------|-------|---------|-----------|--------|
| iPhone SE | 375px | Hidden | Visible | Condensed |
| iPhone 14 | 390px | Hidden | Visible | Condensed |
| iPad Mini | 768px | Collapsible | Hidden | Full |
| iPad Pro | 1024px | Visible | Hidden | Full |
| MacBook Air | 1280px | Visible | Hidden | Full |
| 4K Monitor | 2560px | Visible | Hidden | Full |
