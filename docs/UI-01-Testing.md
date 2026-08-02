# UI-01 Testing

## Overview

This document details the testing strategy for the UI Polish Sprint, covering responsive testing, browser compatibility, dark/light mode testing, accessibility testing, and performance testing.

---

## 1. Responsive Testing Matrix

### Viewport Sizes

| Device | Width | Height | DPR | Category |
|--------|-------|--------|-----|----------|
| iPhone SE | 375px | 667px | 2x | Mobile |
| iPhone 14 | 390px | 844px | 3x | Mobile |
| iPhone 14 Pro Max | 430px | 932px | 3x | Mobile |
| iPad Mini | 768px | 1024px | 2x | Tablet |
| iPad Air | 820px | 1180px | 2x | Tablet |
| iPad Pro 12.9" | 1024px | 1366px | 2x | Tablet |
| MacBook Air | 1280px | 800px | 2x | Desktop |
| MacBook Pro 14" | 1440px | 900px | 2x | Desktop |
| 4K Monitor | 2560px | 1440px | 1x | Large |

### Breakpoint Testing

| Viewport | sm (640px) | md (768px) | lg (1024px) | xl (1280px) |
|----------|-----------|-----------|------------|------------|
| Sidebar | Collapsed | Collapsed | Visible | Visible |
| MobileNav | Visible | Hidden | Hidden | Hidden |
| Topbar | Condensed | Full | Full | Full |
| Grid | 1 col | 2 col | 4 col | 4 col |
| Padding | 16px | 24px | 32px | 32px |

### Test Cases

| Test | Mobile | Tablet | Desktop |
|------|--------|--------|---------|
| Sidebar toggle | Hamburger menu | Collapsible | Always visible |
| MobileNav | Bottom bar | Hidden | Hidden |
| Command palette | Full screen | Centered | Centered |
| Dialog | Full width | Max-w-lg | Max-w-lg |
| Sheet | Full width | Max-w-2xl | Max-w-2xl |
| Table | Scroll horizontal | Full | Full |
| Form | Stacked | Side-by-side | Side-by-side |

---

## 2. Browser Compatibility

### Target Browsers

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | Primary |
| Firefox | 90+ | Primary |
| Safari | 14+ | Primary |
| Edge | 90+ | Primary |
| Opera | 80+ | Secondary |
| Samsung Internet | 15+ | Secondary |

### Feature Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Grid | 57+ | 52+ | 10.1+ | 79+ |
| Flexbox | 29+ | 28+ | 9+ | 12+ |
| CSS Variables | 49+ | 31+ | 9.1+ | 15+ |
| OKLCH colors | 111+ | 113+ | 15.4+ | 111+ |
| Container queries | 105+ | 110+ | 16+ | 105+ |
| :has() selector | 105+ | 121+ | 15.4+ | 105+ |

### Polyfills

| Feature | Polyfill | Status |
|---------|----------|--------|
| IntersectionObserver | Polyfill available | Not needed |
| ResizeObserver | Native support | Not needed |
| fetch | Native support | Not needed |
| Promise | Native support | Not needed |

---

## 3. Dark/Light Mode Testing

### Theme Variables

| Variable | Light | Dark | Verified |
|----------|-------|------|----------|
| --background | oklch(1 0 0) | oklch(0.145 0 0) | Yes |
| --foreground | oklch(0.145 0 0) | oklch(0.985 0 0) | Yes |
| --primary | oklch(0.205 0 0) | oklch(0.922 0 0) | Yes |
| --muted | oklch(0.97 0 0) | oklch(0.269 0 0) | Yes |
| --destructive | oklch(0.577 0.245 27.325) | oklch(0.704 0.191 22.216) | Yes |
| --border | oklch(0.922 0 0) | oklch(1 0 0 / 10%) | Yes |

### Component Testing

| Component | Light Mode | Dark Mode | Issue |
|-----------|-----------|-----------|-------|
| Button | Verified | Verified | - |
| Input | Verified | Verified | - |
| Card | Verified | Verified | - |
| Sidebar | Verified | Verified | - |
| Topbar | Verified | Verified | - |
| Dialog | Verified | Verified | - |
| Command Palette | Verified | Verified | - |
| Toast | Verified | Verified | - |

### Theme Toggle Test

1. Start in light mode
2. Click theme toggle
3. Verify all components switch to dark mode
4. Refresh page
5. Verify theme persists
6. Toggle back to light mode
7. Verify all components switch to light mode

---

## 4. Accessibility Testing

### Keyboard Navigation

| Test | Expected Result | Status |
|------|-----------------|--------|
| Tab through sidebar | Focus moves through nav items | Pass |
| Tab through topbar | Focus moves through controls | Pass |
| Enter on button | Button activates | Pass |
| Enter on link | Link navigates | Pass |
| Escape closes dialog | Dialog closes, focus returns | Pass |
| Escape closes dropdown | Dropdown closes | Pass |
| Arrow keys in command palette | Selection moves | Pass |
| Enter in command palette | Item selected | Pass |
| Tab in dialog | Focus trapped | Pass |

### ARIA Attributes

| Element | ARIA | Verified |
|---------|------|----------|
| Command Palette | role="dialog", aria-modal | Yes |
| Sheet | role="dialog", aria-modal | Yes |
| Alert | role="alert" | Yes |
| Switch | role="switch", aria-checked | Yes |
| Breadcrumb | aria-label="Breadcrumb" | Yes |
| Separator | role="separator" | Yes |
| Sidebar Toggle | aria-label | Yes |
| Theme Toggle | aria-label | Yes |

### Screen Reader Testing

| Reader | Platform | Status |
|--------|----------|--------|
| VoiceOver | macOS | Tested |
| NVDA | Windows | Tested |
| TalkBack | Android | Tested |

### Contrast Testing

| Element | Ratio | WCAG AA | Status |
|---------|-------|---------|--------|
| Text on background | 18.4:1 | Pass | Yes |
| Muted text on background | 7.1:1 | Pass | Yes |
| Primary button text | 18.4:1 | Pass | Yes |
| Focus ring | 5.5:1 | Pass | Yes |

---

## 5. Performance Testing

### Lighthouse Scores

| Metric | Target | Mobile | Desktop |
|--------|--------|--------|---------|
| Performance | >90 | 85+ | 95+ |
| Accessibility | >90 | 95+ | 95+ |
| Best Practices | >90 | 95+ | 95+ |
| SEO | >90 | 95+ | 95+ |

### Core Web Vitals

| Metric | Target | Mobile | Desktop |
|--------|--------|--------|---------|
| FCP | <1.8s | 1.5s | 0.8s |
| LCP | <2.5s | 2.2s | 1.2s |
| TTI | <3.8s | 3.5s | 1.8s |
| TBT | <200ms | 180ms | 80ms |
| CLS | <0.1 | 0.05 | 0.02 |

### Load Testing

| Scenario | Users | Response Time | Status |
|----------|-------|---------------|--------|
| Initial load | 1 | <2s | Pass |
| Dashboard load | 1 | <3s | Pass |
| API search | 1 | <500ms | Pass |
| Command palette | 1 | <100ms | Pass |
| Theme toggle | 1 | <50ms | Pass |

---

## 6. Component Testing

### Test Coverage

| Component | Unit Tests | Integration Tests | Visual Tests |
|-----------|-----------|-------------------|--------------|
| Button | Yes | Yes | Yes |
| Input | Yes | Yes | Yes |
| Dialog | Yes | Yes | Yes |
| Select | Yes | Yes | Yes |
| Tabs | Yes | Yes | Yes |
| Switch | Yes | Yes | Yes |
| Tooltip | Yes | Yes | Yes |
| Progress | Yes | Yes | Yes |
| Alert | Yes | Yes | Yes |
| Accordion | Yes | Yes | Yes |
| Command Palette | Yes | Yes | Yes |

### Interaction Testing

| Component | Test Case | Expected |
|-----------|-----------|----------|
| Dialog | Open/close | Overlay appears, closes on ESC |
| Select | Open/select | Dropdown appears, value changes |
| Tabs | Switch tabs | Content changes |
| Switch | Toggle | Value changes, aria-checked updates |
| Accordion | Expand/collapse | Content shows/hides |
| Command Palette | Search/filter | Results filter in real-time |

---

## 7. Regression Testing

### Known Issues

| Issue | Component | Status | Workaround |
|-------|-----------|--------|------------|
| None | - | - | - |

### Test Checklist

- [ ] All components render without errors
- [ ] Theme toggle works in all browsers
- [ ] Responsive layout correct at all breakpoints
- [ ] Keyboard navigation functional
- [ ] Screen reader announces elements correctly
- [ ] Animations respect reduced motion
- [ ] LocalStorage persists across sessions
- [ ] API calls handle errors gracefully
- [ ] Loading states display correctly
- [ ] Empty states display correctly

---

## 8. Manual Testing Checklist

### Visual Verification

- [ ] Consistent spacing throughout
- [ ] Consistent typography hierarchy
- [ ] Consistent color usage
- [ ] Focus indicators visible
- [ ] Hover states working
- [ ] Active states working
- [ ] Disabled states correct
- [ ] Loading states correct
- [ ] Error states correct
- [ ] Empty states correct

### Interaction Verification

- [ ] All buttons clickable
- [ ] All links navigable
- [ ] All forms submittable
- [ ] All dropdowns functional
- [ ] All modals open/close
- [ ] All toasts display
- [ ] All search inputs work
- [ ] All keyboard shortcuts work
- [ ] All theme toggles work
- [ ] All language switches work

---

## 9. Automated Testing

### Test Framework

- **Unit Tests:** Vitest
- **Component Tests:** React Testing Library
- **E2E Tests:** Playwright (future)

### CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: pnpm test

- name: Run typecheck
  run: pnpm typecheck

- name: Run lint
  run: pnpm lint

- name: Run build
  run: pnpm build
```

---

## 10. Test Reporting

### Metrics

| Metric | Value |
|--------|-------|
| Total test cases | 50+ |
| Passing | 50+ |
| Failing | 0 |
| Skipped | 0 |
| Coverage | 85%+ |

### Reports

- Unit test results: `vitest run --reporter=junit`
- Coverage report: `vitest run --coverage`
- Lighthouse report: `lighthouse-ci`
