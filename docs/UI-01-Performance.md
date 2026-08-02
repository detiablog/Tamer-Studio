# UI-01 Performance

## Overview

This document details the performance optimization strategies for Tamer Studio, covering code splitting, lazy loading, image optimization, bundle optimization, and Lighthouse targets.

---

## 1. Code Splitting

### Next.js Automatic Code Splitting

Tamer Studio leverages Next.js 16's automatic code splitting:

- **Route-based splitting:** Each page under `src/app/` is automatically split
- **Component-level splitting:** Dynamic imports for heavy components
- **Shared chunks:** Common dependencies extracted automatically

### Dynamic Imports

```typescript
// Dynamic component loading
const CommandPalette = dynamic(() => import("@/components/ui/CommandPalette"), {
  ssr: false,
  loading: () => null,
});

const NotificationCenter = dynamic(() => import("@/components/ui/NotificationCenter"), {
  ssr: false,
});
```

### Route Groups

| Route Group | Purpose | Splitting |
|-------------|---------|-----------|
| `(auth)` | Authentication pages | Separate bundle |
| `(dashboard)` | Dashboard pages | Shared dashboard chunk |
| `(marketing)` | Landing page | Marketing bundle |
| `(admin)` | Admin panel | Admin bundle |

---

## 2. Lazy Loading

### Component Lazy Loading

```typescript
// Below-the-fold content
const Features = dynamic(() => import("@/components/landing/Features"), {
  loading: () => <Skeleton className="h-96" />,
});

// Modal content
const EmailBuilder = dynamic(() => import("@/components/email/EmailBuilder"), {
  loading: () => <CompactLoader />,
});
```

### Image Lazy Loading

```tsx
// Native lazy loading
<img src="/image.png" loading="lazy" alt="..." />

// Next.js Image component
import Image from "next/image";
<Image src="/image.png" width={800} height={600} loading="lazy" alt="..." />
```

### Intersection Observer

```typescript
// Custom hook for scroll-triggered loading
function useIntersectionObserver(ref: RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  
  return isVisible;
}
```

---

## 3. Image Optimization

### Next.js Image Component

```tsx
import Image from "next/image";

<Image
  src="/hero.png"
  width={1200}
  height={600}
  priority={true}        // Above the fold
  placeholder="blur"     // Blur placeholder
  quality={85}           // Optimized quality
  alt="Hero image"
/>
```

### Image Formats

| Format | Usage | Browser Support |
|--------|-------|-----------------|
| WebP | Primary format | 97%+ |
| AVIF | High-compression | 92%+ |
| PNG | Fallback | 100% |
| JPEG | Photos | 100% |

### Responsive Images

```tsx
<Image
  src="/hero.png"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  alt="Responsive hero"
/>
```

### Image Optimization Checklist

- [ ] Use WebP format where possible
- [ ] Set explicit width/height to prevent layout shift
- [ ] Use `priority` for above-the-fold images
- [ ] Implement blur placeholders for large images
- [ ] Lazy load below-the-fold images
- [ ] Compress images to 80-85% quality

---

## 4. Bundle Optimization

### Package Analysis

```bash
# Analyze bundle size
npx @next/bundle-analyzer
```

### Tree Shaking

- ES modules used throughout
- Named imports preferred over barrel imports
- Dead code elimination via TypeScript strict mode

### Dependency Optimization

| Package | Optimization |
|---------|-------------|
| lucide-react | Individual icon imports |
| recharts | Lazy load chart components |
| sonner | Minimal toast library |
| zod | Schema-only import |

### Import Optimization

```typescript
// Bad - imports entire library
import { icons } from "lucide-react";

// Good - imports specific icon
import { ChevronRight } from "lucide-react";
```

### Bundle Size Targets

| Bundle | Target | Current |
|--------|--------|---------|
| Initial JS | <150KB | ~120KB |
| Initial CSS | <50KB | ~35KB |
| Total assets | <500KB | ~400KB |

---

## 5. Lighthouse Targets

### Performance Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| FCP | <1.8s | First Contentful Paint |
| LCP | <2.5s | Largest Contentful Paint |
| TTI | <3.8s | Time to Interactive |
| TBT | <200ms | Total Blocking Time |
| CLS | <0.1 | Cumulative Layout Shift |
| Speed Index | <3.4s | Speed Index |

### Score Targets

| Category | Target |
|----------|--------|
| Performance | >90 |
| Accessibility | >90 |
| Best Practices | >90 |
| SEO | >90 |

---

## 6. Caching Strategy

### Browser Caching

```typescript
// next.config.ts
const nextConfig = {
  headers: async () => [
    {
      source: "/static/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
      ],
    },
  ],
};
```

### API Caching

```typescript
// SWR for client-side caching
import useSWR from "swr";

const { data, error } = useSWR("/api/projects", fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000, // 1 minute
});
```

### Service Worker

**File:** `src/components/pwa/ServiceWorkerRegistration.tsx`

- Offline support for static assets
- Cache-first strategy for images
- Network-first for API calls

---

## 7. Rendering Strategies

### Static Generation (SSG)

- Landing page components
- Marketing pages
- Static documentation

### Server-Side Rendering (SSR)

- Dashboard ( authenticated)
- Dynamic content
- Real-time data

### Client-Side Rendering (CSR)

- Command palette
- Modals and dialogs
- Interactive widgets

---

## 8. Font Optimization

### Next.js Font System

```typescript
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
```

### Font Loading Strategy

- `display: "swap"` for FOUT prevention
- Preload critical fonts
- Subset fonts to reduce size

---

## 9. JavaScript Optimization

### Minification

- Terser via Next.js built-in
- CSS minification via PostCSS
- HTML minification

### Compression

```typescript
// next.config.ts
const nextConfig = {
  compress: true, // Enable gzip compression
};
```

### Prefetching

```tsx
// Next.js Link prefetching
<Link href="/dashboard" prefetch={true}>
  Dashboard
</Link>
```

---

## 10. Monitoring

### Web Vitals

```typescript
// Report Web Vitals
export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics
}
```

### Performance Budget

| Resource | Budget |
|----------|--------|
| Total JS | <200KB gzipped |
| Total CSS | <50KB gzipped |
| Total Images | <1MB |
| Total Fonts | <200KB |
| Total Assets | <1.5MB |

### Monitoring Tools

- Lighthouse CI
- Web Vitals library
- Custom performance marks
- Bundle analyzer
