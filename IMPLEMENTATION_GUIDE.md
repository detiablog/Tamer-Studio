# Admin Panel Implementation Guide

## Overview
This document provides step-by-step instructions for implementing CRUD operations on remaining admin pages following the established pattern from Users & Organizations pages.

---

## Completed Pages ✅
- **Users** - Full CRUD (Create, Read, Update, Delete)
- **Organizations** - Full CRUD

---

## Implementation Pattern

### Architecture
```
Frontend (page.tsx)
    ↓
API Route (route.ts)
    ↓
Database (PostgreSQL via postgres library)
```

### Key Technologies
- **Frontend**: React/Next.js with SWR for data fetching
- **Backend**: Next.js API Routes with postgres library
- **Database**: PostgreSQL with Drizzle ORM schema definitions
- **Data Sync**: SWR with `mutate()` for real-time updates

---

## Step-by-Step Implementation Guide

### Phase 1: Create Page Component

**File**: `src/app/admin/(protected)/[resource]/page.tsx`

#### Structure Template:
```typescript
"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, Loader, X, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

// Mock data for fallback
const MOCK_[RESOURCE] = [
  // Add mock entries matching your data structure
];

const fetcher = (url: string) => 
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      console.error(`[Fetcher] Failed to fetch ${url}:`, error);
      throw error;
    });

export default function Admin[Resource]Page() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/admin/[resource]",
    fetcher,
    { 
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      dedupingInterval: 0,
    }
  );
  
  const [items, setItems] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<any>(null);
  const [originalData, setOriginalData] = React.useState<any>(null);
  const [formLoading, setFormLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({ 
    // Define all fields here
  });

  React.useEffect(() => {
    if (data?.data && data.success) {
      setItems(data.data);
    } else if (error && items.length === 0) {
      setItems(MOCK_[RESOURCE]);
    }
  }, [data, error]);

  const isUsingMockData = !data && error;

  const filtered = (items || []).filter((item: any) => {
    // Implement search/filter logic
    return item.name?.toLowerCase().includes(search.toLowerCase());
  });

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setOriginalData({ ...item });
    setFormData({ ...item });
    setEditOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch("/api/admin/[resource]", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to create");
        return;
      }

      toast.success("Created successfully!");
      setFormData({ /* reset */ });
      setAddOpen(false);
      mutate();
    } catch (error) {
      toast.error("Error creating item");
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.id) {
      toast.error("ID not found");
      return;
    }

    setFormLoading(true);

    try {
      const changedFields: any = {};

      // Check only changed fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== originalData?.[key]) {
          changedFields[key] = formData[key];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        toast.info("No changes made");
        return;
      }

      const response = await fetch(
        `/api/admin/[resource]/${editingItem.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changedFields),
        }
      );

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to update");
        return;
      }

      toast.success("Updated successfully!");
      setFormData({ /* reset */ });
      setOriginalData(null);
      setEditingItem(null);
      setEditOpen(false);
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating");
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/[resource]/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: "Failed to delete" 
        }));
        toast.error(errorData.error || "Failed to delete");
        return;
      }

      toast.success("Deleted successfully!");
      mutate();
    } catch (error) {
      toast.error("Error deleting");
      console.error(error);
    }
  };

  // Render JSX (use Users page as template)
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "[Resource Name]" }]} />
      {/* Rest of UI */}
    </div>
  );
}
```

---

### Phase 2: Create API Routes

**File**: `src/app/api/admin/[resource]/route.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { db } = await import("@/lib/db");
    // Import your schema
    const { [resource] } = await import("@/lib/db/schema/[schema-file]");

    const items = await db.query.[resource].findMany();

    return NextResponse.json({
      success: true,
      data: items,
      count: items.length,
    });
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = await import("@/lib/db");
    const { [resource] } = await import("@/lib/db/schema/[schema-file]");

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const itemId = `[prefix]_${Date.now()}`;
    const result = await db.insert([resource]).values({
      id: itemId,
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    return NextResponse.json({
      success: true,
      message: "Created successfully",
      data: result[0],
    });
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
```

**File**: `src/app/api/admin/[resource]/[id]/route.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const postgres = await import("postgres").then(m => m.default);
    const sql = postgres(process.env.DATABASE_URL!);

    try {
      let query = `UPDATE "[resource]" SET `;
      const values: any[] = [];
      let paramCount = 1;

      // Build dynamic query for provided fields only
      if (body.name) {
        values.push(body.name);
        query += `name = $${paramCount++}`;
      }
      if (body.email) {
        if (values.length > 0) query += ", ";
        values.push(body.email);
        query += `email = $${paramCount++}`;
      }
      // Add more fields as needed

      if (values.length === 0) {
        await sql.end();
        return NextResponse.json(
          { success: false, error: "No fields to update" },
          { status: 400 }
        );
      }

      query += `, updated_at = NOW() WHERE id = $${paramCount} RETURNING *`;
      values.push(id);

      const result = await sql.unsafe(query, values);
      await sql.end();

      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, error: "Not found" },
          { status: 404 }
        );
      }

      const item = result[0];

      return NextResponse.json({
        success: true,
        message: "Updated successfully",
        data: item,
      });
    } finally {
      await sql.end();
    }
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const postgres = await import("postgres").then(m => m.default);
    const sql = postgres(process.env.DATABASE_URL!);

    try {
      const result = await sql`DELETE FROM "[resource]" WHERE id = ${id} RETURNING id`;
      await sql.end();

      if (!result || result.length === 0) {
        return NextResponse.json(
          { success: false, error: "Not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Deleted successfully",
      });
    } finally {
      await sql.end();
    }
  } catch (error) {
    console.error("[API Error]", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
```

---

### Phase 3: Define Database Schema

**File**: `src/lib/db/schema/[schema-file].ts`

```typescript
import { pgTable, text, timestamp, varchar, boolean } from "drizzle-orm/pg-core";

export const [resource] = pgTable("[resource]", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});
```

---

## Remaining Pages to Implement (12 pages)

1. **Workspaces**
2. **Billing**
3. **Subscriptions**
4. **Coupons**
5. **AI Providers**
6. **Jobs**
7. **Queues**
8. **Analytics**
9. **Audit Logs**
10. **Feature Flags**
11. **Settings**
12. **API Keys**

---

## Quick Checklist for Each Page

- [ ] Create mock data (5-10 entries)
- [ ] Define database schema in `src/lib/db/schema/`
- [ ] Create GET/POST endpoints in `src/app/api/admin/[resource]/route.ts`
- [ ] Create PUT/DELETE endpoints in `src/app/api/admin/[resource]/[id]/route.ts`
- [ ] Create page component in `src/app/admin/(protected)/[resource]/page.tsx`
- [ ] Test CREATE functionality
- [ ] Test UPDATE (only changed fields)
- [ ] Test DELETE functionality
- [ ] Test with real database data
- [ ] Hard refresh browser to clear cache

---

## Common Issues & Solutions

### Issue: "UNDEFINED_VALUE: Undefined values are not allowed"
**Solution**: Always check if field exists before using in template literals. Use `.hasOwnProperty()` and only include fields that are actually provided.

### Issue: "params is not a Promise"
**Solution**: Next.js 16+ requires `params: Promise<{ id: string }>`. Always await: `const { id } = await params;`

### Issue: Edit shows old data after update
**Solution**: Call `mutate()` after successful update to refresh from server.

### Issue: Connection timeout
**Solution**: Always call `await sql.end()` in finally block to close connections properly.

---

## Next.js 16 API Route Signature

```typescript
// ✅ CORRECT
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}

// ❌ WRONG (Old syntax)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // ...
}
```

---

## Database Connection Best Practices

```typescript
const postgres = await import("postgres").then(m => m.default);
const sql = postgres(process.env.DATABASE_URL!);

try {
  // Your query here
  const result = await sql.unsafe(query, values);
  await sql.end(); // Always close
  
  return NextResponse.json({ data: result });
} finally {
  await sql.end(); // Ensure connection is closed
}
```

---

## Testing Workflow

1. **Add**: Fill form → Click Add → Check table updates → Verify in DB
2. **Edit**: Click Edit → Change 1 field → Click Update → Verify only that field changed → Check DB
3. **Delete**: Click Delete → Confirm → Check table updates → Verify in DB
4. **Search/Filter**: Type search term → Results filter in real-time

---

## File Structure Reference

```
src/
├── app/
│   ├── api/admin/
│   │   ├── [resource]/
│   │   │   ├── route.ts (GET, POST)
│   │   │   └── [id]/route.ts (PUT, DELETE)
│   │   └── users/ (completed example)
│   └── admin/(protected)/
│       ├── [resource]/
│       │   └── page.tsx (React component)
│       └── users/ (completed example)
├── lib/
│   └── db/
│       └── schema/
│           ├── [resource].ts (Drizzle schema)
│           └── auth.ts (completed example)
```

---

## Timeline Estimate

- **Per page**: ~30-45 minutes (once pattern understood)
- **All 12 pages**: ~6-9 hours total
- **Testing**: ~2-3 hours

Total: **~10 hours** to complete all remaining pages

---

**Last Updated**: December 2024
**Status**: ACTIVE - Users & Organizations working, ready to scale to remaining pages
