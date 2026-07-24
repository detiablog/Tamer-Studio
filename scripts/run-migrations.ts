import "dotenv/config";
import postgres from "postgres";

async function runMigrations() {
  try {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error("DATABASE_URL not found");
    }

    const sql = postgres(connectionString);

    console.log("Running migrations...");

    // Check if columns exist
    const checkRole = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user' AND column_name = 'role'
      )
    `;

    if (!checkRole[0].exists) {
      console.log("Adding role column...");
      await sql`ALTER TABLE "user" ADD COLUMN "role" varchar(50) DEFAULT 'user' NOT NULL`;
      console.log("✓ role column added");
    } else {
      console.log("✓ role column already exists");
    }

    const checkStatus = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'user' AND column_name = 'status'
      )
    `;

    if (!checkStatus[0].exists) {
      console.log("Adding status column...");
      await sql`ALTER TABLE "user" ADD COLUMN "status" varchar(50) DEFAULT 'pending' NOT NULL`;
      console.log("✓ status column added");
    } else {
      console.log("✓ status column already exists");
    }

    console.log("✓ All migrations completed!");
    await sql.end();
  } catch (error) {
    console.error("✗ Migration error:", error);
    process.exit(1);
  }
}

runMigrations();
