import { pgTable, text, timestamp, bigint, index } from "drizzle-orm/pg-core";

export const userMedia = pgTable(
  "user_media",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    filename: text("filename").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    kind: text("kind").notNull(),
    storageKey: text("storage_key").notNull(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_media_user_id_idx").on(table.userId),
    index("user_media_kind_idx").on(table.kind),
    index("user_media_status_idx").on(table.status),
    index("user_media_created_at_idx").on(table.createdAt),
  ]
);
