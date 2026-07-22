# Database Guidelines

Version: 2.0

---

# Naming

snake_case

Singular table names

Plural relation names

---

# Keys

UUID primary keys

Foreign keys

Indexes

---

# Migrations

Never modify old migration.

Always create new migration.

---

# Audit Fields

created_at

updated_at

deleted_at

---

# Soft Delete

Preferred over hard delete.

---

# Transactions

Use transactions for multi-step operations.

---

# Performance

Index frequently queried columns.

Avoid N+1 queries.

Use pagination.