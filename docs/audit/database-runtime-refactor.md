# Database Runtime Refactor

**Date:** 2026-08-03
**Sprint:** PERF-BOOTSTRAP-02A

---

## Objective

Decouple database initialization from application bootstrap. Convert eager pool creation to lazy initialization.

---

## Before/After

### Before (Eager)

```typescript
// src/lib/db/client.ts
const connectionString = config.database.url;
const client = postgres(connectionString, { max: 10, idle_timeout: 30, connect_timeout: 5 });
export const db = drizzle(client, { schema });
```

**Problem**: `postgres()` called at module import time. Pool created immediately when any file imports `db`.

### After (Lazy)

```typescript
// src/lib/db/client.ts
let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!dbInstance) {
    if (!client) {
      client = postgres(config.database.url, { max: 10, idle_timeout: 30, connect_timeout: 5 });
      if (typeof globalThis !== "undefined") {
        (globalThis as any).onExit = async () => { await client!.end(); };
      }
    }
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});
```

**Solution**: Pool created only on first database access. Proxy delegates all property access to the real Drizzle instance.

---

## Files Modified

| File | Change |
|------|--------|
| `src/lib/db/client.ts` | Converted eager pool creation to lazy initialization |

## Files NOT Modified

| File | Reason |
|------|--------|
| `src/lib/db/index.ts` | Re-export unchanged |
| All 100+ repositories | `import { db } from "@/lib/db"` unchanged |
| All services | No changes needed |
| `src/app/layout.tsx` | No changes needed |
| `src/core/events/event-hub.ts` | No changes needed |

---

## Backward Compatibility

- `export const db` remains a named export
- All `import { db } from "@/lib/db"` statements continue to work
- Drizzle API (select, insert, update, delete) unchanged
- Repository API unchanged
- Service API unchanged

---

## Verification

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Dev server startup | No DB pool at startup | Clean startup (1180ms) | PASS |
| GET /admin | 307 redirect | 307 | PASS |
| GET /admin/login | 200 with UI | 200 | PASS |
| GET /dashboard | 307 redirect | 307 | PASS |
| GET /login | 200 | 200 | PASS |
| GET /register | 200 | 200 | PASS |
| POST /api/admin/auth/login | 401 | 401 | PASS |
| POST /api/admin/auth/logout | 200 | 200 | PASS |
| GET /api/admin/stats | 401 | 401 | PASS |
| Production build | Passes | Passes (257.4s) | PASS |
