# GA-01 Accessibility Audit

## Scope

This document covers the accessibility audit for Tamer Studio v1.0 GA release, ensuring WCAG 2.1 Level AA compliance.

## Architecture

### WCAG 2.1 Principles

1. **Perceivable** - Information must be presentable to users
   - Text alternatives for images
   - Captions for audio/video
   - Content adaptable to different presentations
   - Sufficient color contrast

2. **Operable** - UI components must be operable
   - Keyboard accessible
   - No keyboard traps
   - Sufficient time to read content
   - No content that flashes

3. **Understandable** - Information must be understandable
   - Readable text
   - Predictable navigation
   - Input assistance

4. **Robust** - Content must be robust enough for assistive technologies
   - Valid HTML
   - Name, role, value for UI components
   - Status messages

### Testing Tools

| Tool | Purpose | Frequency |
|------|---------|-----------|
| axe-core | Automated testing | Every build |
| Lighthouse | Performance + a11y | Every release |
| NVDA/VoiceOver | Screen reader testing | Pre-launch |
| Keyboard Navigation | Manual testing | Every sprint |

### Common Issues

- Missing alt text on images
- Insufficient color contrast
- Missing form labels
- No focus indicators
- Keyboard traps in modals

## Configuration

### Accessibility Testing

```typescript
// axe-core configuration
const axeConfig = {
  rules: [
    { id: "color-contrast", enabled: true },
    { id: "image-alt", enabled: true },
    { id: "label", enabled: true },
    { id: "link-name", enabled: true },
    { id: "button-name", enabled: true },
  ],
};
```

### Focus Management

```typescript
// Focus trap for modals
const focusTrap = {
  activate: (element: HTMLElement) => {
    const focusable = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (focusable[0] as HTMLElement)?.focus();
  },
};
```

## Commands

### Run axe-core Tests

```bash
npx playwright test --grep "accessibility"
```

### Lighthouse Accessibility Audit

```bash
npx lighthouse http://localhost:3000 --only-categories=accessibility --output=html
```

### Keyboard Navigation Test

```bash
# Manual test: Tab through all interactive elements
# Verify focus visible on all elements
# Verify no keyboard traps
# Verify skip links work
```

### Screen Reader Test

```bash
# VoiceOver (macOS)
# Enable: Cmd + F5
# Navigate: VO + arrow keys
# Verify all content announced correctly
```

## Verification

- [ ] axe-core reports 0 violations
- [ ] Lighthouse accessibility score >= 95
- [ ] All images have alt text
- [ ] All forms have labels
- [ ] Color contrast ratio >= 4.5:1
- [ ] Keyboard navigation works for all features
- [ ] Focus indicators visible
- [ ] Skip links present and functional
- [ ] ARIA labels correct
- [ ] Screen reader announces all content
- [ ] No keyboard traps
- [ ] Dynamic content announcements work
