# Performance Architecture Audit

**Date:** 2026-08-03
**Scope:** Rendering, caching, lazy loading, bundle splitting, server/client boundaries

---

## Rendering Architecture

### Server Components (Default)

Next.js App Router uses Server Components by default. The project correctly uses this pattern:

- `app/page.tsx` — Landing page (Server)
- `app/(dashboard)/layout.tsx` — Dashboard layout (Server, auth guard)
- `app/(dashboard)/*/page.tsx` — Dashboard pages (Server, data fetching)
- `app/admin/(protected)/layout.tsx` — Admin layout (Server, auth guard)
- `app/api/*/route.ts` — All API routes (Server)

### Client Components

Client components use `"use client"` directive or are in `pageClient.tsx` files:

- `app/(auth)/layout.tsx` — Auth layout (Client, animations)
- `app/(dashboard)/*/pageClient.tsx` — Dashboard page clients
- `app/admin/(protected)/*/pageClient.tsx` — Admin page clients
- `components/ui/*` — Most UI components

### Pattern: `page.tsx` + `pageClient.tsx`

This is the primary pattern for dashboard pages:
- `page.tsx` — Server component, fetches data, passes to client
- `pageClient.tsx` — Client component, handles interactivity

**Assessment:** This pattern is well-implemented and correctly separates server/client concerns.

---

## Caching Architecture

### Server-Side Caching

| Layer | Implementation | Usage |
|-------|----------------|-------|
| `core/cache/redis-cache.ts` | Redis (Upstash) | Production caching |
| `core/cache/memory-cache.ts` | In-memory LRU | Development/fallback |
| `core/cache/shared-cache.ts` | Singleton factory | Auto-selects Redis or Memory |
| `lib/cache.ts` | Simple Map + TTL | Legacy/fallback |

### Client-Side Caching

| Layer | Implementation | Usage |
|-------|----------------|-------|
| SWR | Client-side cache | Data fetching revalidation |
| Browser cache | HTTP headers | Static assets |

### Cache Headers

`next.config.ts` configures:
- `images.minimumCacheTTL: 86400` (24 hours)
- `compress: true` (gzip/brotli)

---

## Bundle Splitting

### Next.js Automatic Splitting

Next.js App Router automatically splits bundles by route. Each page gets its own chunk.

### Manual Optimization

`next.config.ts` includes:
```typescript
experimental: {
  optimizePackageImports: ["lucide-react", "recharts", "@dnd-kit/core", "@dnd-kit/sortable"],
}
```

This optimizes tree-shaking for large icon/chart libraries.

### Server External Packages

```typescript
serverExternalPackages: [
  "postgres", "redis", "@trigger.dev/sdk/v3",
  "nodemailer", "@sendgrid/mail", "@aws-sdk/client-ses",
  "mailgun.js", "resend", "postmark", "sparkpost", "@getbrevo/brevo"
]
```

These are excluded from the client bundle and run only on the server.

---

## Lazy Loading

### Dynamic Imports

No explicit `dynamic()` imports were found in the explored files. The project relies on:
- Next.js automatic code splitting
- Route-based splitting
- Server/Client component boundaries

### Potential Opportunities

- Landing page components (26 files) could benefit from dynamic loading
- Admin dashboard pages with heavy charts could use dynamic imports
- Email builder component could be lazy-loaded

---

## Server/Client Boundary Analysis

### Correct Boundaries

| Boundary | Implementation |
|----------|----------------|
| Data fetching | Server Components |
| Auth guard | Server Component (dashboard layout) |
| Forms/interactivity | Client Components |
| API routes | Server-only |
| Database access | Server-only (via `server-only` package) |

### Boundary Violations

| Violation | Location | Issue |
|-----------|----------|-------|
| EventHubProvider | `components/providers/` | Client component calls server-side `initializeEventHub()` |
| `server-only` usage | `server-only` package | Used in `lib/db/client.ts` — correct |

---

## Performance Concerns

### 1. Large Landing Page Bundle
26 landing components all loaded together. No lazy loading for below-the-fold sections.

### 2. No Image Optimization Config
`next.config.ts` has `images.remotePatterns` allowing `**` (any hostname). This is a security concern but also means no image optimization restrictions.

### 3. No Streaming/Suspense
No `loading.tsx` files found in the route structure. Next.js supports streaming with `loading.tsx` — not utilized.

### 4. 7 Email Providers Bundled
All 7 email provider packages are in `serverExternalPackages`, but they still contribute to server bundle size.

### 5. No Edge Runtime
All routes run on Node.js runtime. No edge runtime usage for lightweight routes.

---

## Score

| Dimension | Score |
|-----------|-------|
| Server/Client separation | 8/10 |
| Caching strategy | 6/10 |
| Bundle splitting | 7/10 |
| Lazy loading | 4/10 |
| Streaming/Suspense | 3/10 |
| **Overall** | **5.6/10** |
