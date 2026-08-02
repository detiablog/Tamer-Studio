# UI-01 Animations

## Overview

This document details the animation system in Tamer Studio, covering utility classes, hover interactions, page transitions, loading animations, reduced motion support, and tw-animate-css integration.

---

## 1. Animation Utilities

### Core Animations

**File:** `src/styles/animations.css`

| Class | Keyframe | Duration | Easing | Usage |
|-------|----------|----------|--------|-------|
| `animate-fade-in` | fadeIn | 0.3s | ease-in-out | General appearance |
| `animate-slide-up` | slideUp | 0.3s | ease-out | Content reveal |
| `animate-slide-down` | slideDown | 0.3s | ease-out | Dropdown menus |
| `animate-scale-in` | scaleIn | 0.2s | ease-out | Popups, modals |
| `animate-shimmer` | shimmer | 2s infinite | linear | Loading states |
| `animate-pulse-soft` | pulseSoft | 2s infinite | ease-in-out | Subtle pulsing |
| `animate-float` | float | 3s infinite | ease-in-out | Decorative elements |

### Keyframe Definitions

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulseSoft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
```

### Transition Utilities

| Class | Transition | Usage |
|-------|-----------|-------|
| `transition-all-fast` | all 0.15s ease-in-out | Quick interactions |
| `transition-all-smooth` | all 0.3s cubic-bezier(0.4, 0, 0.2, 1) | Smooth transitions |

---

## 2. Hover Interactions

### Hover Lift

**File:** `src/styles/animations.css`

```css
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

**Usage:** Cards, interactive containers

### Hover Scale

```css
.hover-scale {
  transition: transform 0.15s ease;
}
.hover-scale:hover {
  transform: scale(1.02);
}
```

**Usage:** Buttons, clickable elements

### Hover Glow

```css
.hover-glow {
  transition: box-shadow 0.2s ease;
}
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(var(--primary), 0.15);
}
```

**Usage:** Primary action buttons, featured elements

### Button Press Feedback

**File:** `src/components/ui/button.tsx`

```tsx
active:not-aria-[haspopup]:translate-y-px
```

- Buttons translate down 1px on active press
- Excludes dropdown triggers (aria-haspopup)

---

## 3. Page Transitions

### Dialog Appearance

**File:** `src/components/ui/dialog.tsx`

```tsx
className="animate-in fade-in-0 zoom-in-95 duration-200"
```

- Fade in from 0 opacity
- Scale from 95% to 100%
- Duration: 200ms

### Sheet Slide-In

**File:** `src/components/ui/Sheet.tsx`

```tsx
// Right side
"animate-in slide-in-from-right duration-300"

// Left side
"animate-in slide-in-from-left duration-300"

// Top
"animate-in slide-in-from-top duration-300"

// Bottom
"animate-in slide-in-from-bottom duration-300"
```

### Dropdown Menu Appearance

```tsx
"animate-in fade-in slide-in-from-top-2 duration-200"
```

- Used in WorkspaceSwitcher, AvatarDropdown, LanguageSwitcher, NotificationCenter

### Tab Content Transition

**File:** `src/components/ui/tabs.tsx`

```tsx
"animate-in fade-in-0 duration-200"
```

### Accordion Content

**File:** `src/components/ui/accordion.tsx`

```tsx
"animate-in slide-in-from-top-1 duration-200"
```

### Page Header Animation

**File:** `src/components/ui/PageHeader.tsx`

```tsx
// Title
"animate-in fade-in slide-in-from-bottom-2 duration-300"

// Actions
"animate-in fade-in slide-in-from-bottom-2 duration-300 delay-75"
```

### Select Dropdown

**File:** `src/components/ui/select.tsx`

```tsx
"animate-in fade-in-0 zoom-in-95 duration-200"
```

### Tooltip

**File:** `src/components/ui/tooltip.tsx`

```tsx
"animate-in fade-in-0 zoom-in-95 duration-150"
```

---

## 4. Loading Animations

### ElegantLoader Rotating Rings

**File:** `src/components/ui/ElegantLoader.tsx`

```tsx
// Outer ring
<div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/60 animate-spin"
  style={{ animationDuration: '3s' }} />

// Middle ring (reverse)
<div className="absolute inset-1 rounded-full border-2 border-transparent border-b-primary/40 border-l-primary/30 animate-spin"
  style={{ animationDuration: '5s', animationDirection: 'reverse' }} />

// Inner glow
<div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse" />

// Center dot
<div className="w-2 h-2 bg-primary rounded-full animate-pulse"
  style={{ animationDuration: '2s' }} />
```

### Shimmer Progress Bar

```tsx
<div className="h-full bg-gradient-to-r from-primary/0 via-primary to-primary/0 animate-shimmer"
  style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }} />
```

### Bouncing Dots

```tsx
<span className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce"
  style={{ animationDelay: '0ms' }} />
<span className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce"
  style={{ animationDelay: '150ms' }} />
<span className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce"
  style={{ animationDelay: '300ms' }} />
```

### Background Gradient Orbs

```tsx
<div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-30" />
<div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-30" />
```

---

## 5. Dashboard Animations

**File:** `src/app/dashboard.css`

| Class | Keyframe | Duration | Usage |
|-------|----------|----------|-------|
| `animate-fadeIn` | fadeIn | 300ms | Card appearance |
| `animate-slideUp` | slideUp | 400ms | Content reveal |
| `animate-scaleIn` | scaleIn | 300ms | Card scale |
| `animate-skeleton` | skeleton-loading | 2s infinite | Loading placeholder |
| `animate-counterUp` | counterUp | 300ms | Number counting |

### Skeleton Loading

```css
@keyframes skeleton-loading {
  0% { background-color: hsl(var(--muted) / 0.4); }
  50% { background-color: hsl(var(--muted) / 0.6); }
  100% { background-color: hsl(var(--muted) / 0.4); }
}
```

---

## 6. Sidebar Animations

### Collapse/Expand

**File:** `src/components/ui/Sidebar.tsx`

```tsx
className="transition-all duration-300 ease-in-out"
```

- Width: 288px to 72px
- Transform: translate-x for mobile
- Duration: 300ms

### Mobile Overlay

```tsx
className="fixed inset-0 z-30 bg-black/50 sm:hidden"
```

- Fade in/out with sidebar

---

## 7. tw-animate-css Integration

### Import

**File:** `src/app/globals.css`

```css
@import "tw-animate-css";
```

### Available Utilities

| Utility | Description |
|---------|-------------|
| `animate-in` | Base animation class |
| `fade-in-0` | Fade in from 0 |
| `zoom-in-95` | Scale from 95% |
| `slide-in-from-top-2` | Slide from top 8px |
| `slide-in-from-right` | Slide from right |
| `slide-in-from-left` | Slide from left |
| `slide-in-from-bottom` | Slide from bottom |
| `duration-150` | 150ms duration |
| `duration-200` | 200ms duration |
| `duration-300` | 300ms duration |

### Usage Pattern

```tsx
<div className="animate-in fade-in-0 zoom-in-95 duration-200">
  {/* Content */}
</div>
```

---

## 8. Scrollbar Animations

### Custom Scrollbar

**File:** `src/components/ui/Sidebar.tsx`

```css
.sidebar-nav::-webkit-scrollbar { width: 6px; }
.sidebar-nav::-webkit-scrollbar-track { background: transparent; }
.sidebar-nav::-webkit-scrollbar-thumb { background: transparent; border-radius: 3px; }
.sidebar-nav:hover::-webkit-scrollbar-thumb { background: #D1D5DB; }
.dark .sidebar-nav:hover::-webkit-scrollbar-thumb { background: #4B5563; }
```

- Scrollbar hidden by default
- Appears on hover
- 6px width
- Rounded thumb

---

## 9. Animation Timing Reference

| Duration | Usage | Examples |
|----------|-------|---------|
| 150ms | Quick feedback | Tooltip, button press |
| 200ms | Micro-interactions | Dropdown, tab switch, accordion |
| 300ms | Page transitions | Dialog, sheet, sidebar, page header |
| 400ms | Content reveal | Dashboard slide-up |
| 2s | Loading loops | Shimmer, pulse, skeleton |
| 3s | Decorative loops | Floating elements, rotating rings |
| 5s | Slow rotations | Reverse ring rotation |

### Easing Functions

| Easing | Usage |
|--------|-------|
| `ease-in-out` | Symmetric transitions (fade, pulse) |
| `ease-out` | Appearances (slide, scale) |
| `ease-in` | Disappearances |
| `cubic-bezier(0.4, 0, 0.2, 1)` | Smooth all-purpose |
| `linear` | Continuous loops (shimmer) |

---

## 10. Performance Considerations

### GPU-Accelerated Properties

All animations use GPU-accelerated properties:
- `opacity` (compositor-only)
- `transform` (compositor-only)

### Avoided Properties

The following properties are NOT animated to prevent layout thrashing:
- `width` / `height` (except sidebar collapse)
- `padding` / `margin`
- `top` / `left` / `right` / `bottom`

### will-change

Not explicitly set; relying on browser optimization for known animation patterns.

### Animation-Iteration-Count

- Most animations: 1 (single play)
- Loading animations: `infinite` (shimmer, pulse, skeleton, float)
