# Repository Standard

**Sprint:** CMS-01 B1 — Repository Foundation
**Date:** 2026-07-27
**Status:** STANDARD DEFINED

---

## 1. Purpose

This standard defines the consistent interface and conventions that every repository in the Tamer Studio application must follow. The repository layer is the ONLY layer allowed to communicate with the database.

---

## 2. Standard Interface

Every repository must expose the following methods:

### 2.1 Core Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `findById` | `findById(id: string): Promise<T \| undefined>` | Find a single record by its primary key |
| `findMany` | `findMany(filter?: FilterInput): Promise<T[]>` | Find multiple records with optional filtering |
| `create` | `create(input: CreateInput): Promise<T>` | Insert a new record |
| `update` | `update(id: string, input: UpdateInput): Promise<T \| undefined>` | Update an existing record |
| `delete` | `delete(id: string): Promise<void>` | Delete a record (soft delete preferred) |
| `exists` | `exists(id: string): Promise<boolean>` | Check if a record exists |
| `count` | `count(filter?: FilterInput): Promise<number>` | Count records matching optional filter |
| `transaction` | `transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>` | Execute operations within a transaction |

### 2.2 Filter Input Type

```typescript
export interface FilterInput {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  [key: string]: unknown;
}
```

---

## 3. Repository Pattern

Every repository must follow the Interface + Default Implementation pattern:

### 3.1 Interface Definition

```typescript
export interface XRepository {
  findById(id: string): Promise<X | undefined>;
  findMany(filter?: FilterInput): Promise<X[]>;
  create(input: CreateXInput): Promise<X>;
  update(id: string, input: UpdateXInput): Promise<X | undefined>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  count(filter?: FilterInput): Promise<number>;
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}
```

### 3.2 Default Implementation

```typescript
export class DefaultXRepository implements XRepository {
  constructor(
    private readonly db: DrizzleClient,
    private readonly table: Table,
  ) {}

  async findById(id: string): Promise<X | undefined> {
    const rows = await this.db.select().from(this.table).where(eq(this.table.id, id)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapRow(rows[0]);
  }

  async findMany(filter?: FilterInput): Promise<X[]> {
    const rows = await this.db.select().from(this.table).limit(filter?.limit ?? 50).offset(filter?.offset ?? 0);
    return rows.map(this.mapRow);
  }

  async create(input: CreateXInput): Promise<X> {
    const [row] = await this.db.insert(this.table).values(input).returning();
    return this.mapRow(row);
  }

  async update(id: string, input: UpdateXInput): Promise<X | undefined> {
    const [row] = await this.db.update(this.table).set(input).where(eq(this.table.id, id)).returning();
    if (!row) return undefined;
    return this.mapRow(row);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(this.table).where(eq(this.table.id, id));
  }

  async exists(id: string): Promise<boolean> {
    const rows = await this.db.select().from(this.table).where(eq(this.table.id, id)).limit(1);
    return rows.length > 0;
  }

  async count(filter?: FilterInput): Promise<number> {
    const rows = await this.db.select({ count: count() }).from(this.table);
    return Number(rows[0]?.count ?? 0);
  }

  async transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(fn);
  }

  private mapRow(row: typeof this.table.$inferSelect): X {
    // Implementation-specific mapping
  }
}
```

---

## 4. Conventions

### 4.1 File Naming

- Repository files must be named `<module>.repository.ts`
- Interface must be named `<Module>Repository`
- Default implementation must be named `Default<Module>Repository`

### 4.2 Import Conventions

```typescript
import { db } from "@/lib/db";
import { table } from "@/lib/db/schema/<module>";
import { eq, and, desc, count, sql } from "drizzle-orm";
import type { X, CreateXInput, UpdateXInput } from "./<module>.types";
```

### 4.3 Export Conventions

Every repository module must have a barrel export file (`index.ts`) that exports:

```typescript
export { DefaultXRepository } from "./<module>.repository";
export type { XRepository } from "./<module>.repository";
export type { X, CreateXInput, UpdateXInput, FilterInput } from "./<module>.types";
```

### 4.4 Dependency Rules

A repository may ONLY depend on:

1. `@/lib/db` — the database client
2. `@/lib/db/schema/*` — the Drizzle schema definitions
3. `drizzle-orm` — the ORM utilities
4. `crypto` — for UUID generation (if needed)
5. Its own types file

A repository may NOT depend on:

1. Any service
2. Any other repository (except through dependency injection)
3. Any API route
4. Any component
5. Any business logic module

### 4.5 Error Handling

- Repositories must throw `Error` with descriptive messages when records are not found
- Repositories must NOT catch errors — error handling belongs to services
- Repositories must NOT log — logging belongs to services

### 4.6 Type Safety

- All methods must have explicit return types
- All input parameters must have explicit types
- All drizzle query results must be mapped through a private `mapRow()` method
- Raw drizzle types (`$inferSelect`) must NOT leak to consumers

---

## 5. Migration Guide for Existing Repositories

### 5.1 Class-Only Repositories

1. Extract an interface from the class
2. Rename the class to `Default<Module>Repository` and implement the interface
3. Add missing standard methods where applicable
4. Rename non-standard methods to match the standard interface

### 5.2 Function-Only Repositories

1. Convert to a class with interface
2. Group related functions into methods
3. Add the standard interface methods

### 5.3 Repositories with Custom Methods

1. Keep custom methods as additional methods on the interface
2. Ensure the 8 standard methods are always present
3. Custom methods should not replace standard methods

---

## 6. Examples

### 6.1 Before (Inconsistent)

```typescript
// src/core/users/user.repository.ts
export class UserRepository {
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const rows = await db.select().from(userProfile).where(eq(userProfile.userId, userId)).limit(1);
    if (rows.length === 0) return undefined;
    return this.mapProfile(rows[0]);
  }
  // ... no findById, findMany, create, update, delete, exists, count, transaction
}
```

### 6.2 After (Standardized)

```typescript
// src/core/users/user.repository.ts
export interface UserRepository {
  findById(id: string): Promise<User | undefined>;
  findMany(filter?: FilterInput): Promise<User[]>;
  create(input: CreateUserInput): Promise<User>;
  update(id: string, input: UpdateUserInput): Promise<User | undefined>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  count(filter?: FilterInput): Promise<number>;
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
}

export class DefaultUserRepository implements UserRepository {
  // ... all standard methods implemented
}
```

---

## 7. Compliance

All repositories must comply with this standard. Non-compliant repositories must be updated in subsequent sprints. This standard takes effect immediately for all new repositories and during B2 for all existing repositories.
