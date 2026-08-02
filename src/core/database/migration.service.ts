import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "@/core/config";
import { logger } from "@/core/logger";

export interface MigrationResult {
  success: boolean;
  error?: string;
}

export async function runMigrations(): Promise<MigrationResult> {
  const connectionString = config.database.url;
  if (!connectionString) {
    return { success: false, error: "DATABASE_URL is not configured" };
  }

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    logger.info("Running database migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    logger.info("Database migrations completed successfully");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Migration failed";
    logger.error("Database migration failed", error instanceof Error ? error : new Error(message));
    return { success: false, error: message };
  } finally {
    await sql.end();
  }
}
