import "dotenv/config";
import { runMigrations } from "@/core/database";

runMigrations().then((result) => {
  if (!result.success) {
    console.error("❌ Migration failed:", result.error);
    process.exit(1);
  }
  console.log("✅ Migrations completed successfully");
  process.exit(0);
});
