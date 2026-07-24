import { db } from "@/lib/db";
import { admin } from "@/lib/db/schema";
import { hashPassword } from "@/core/admin/login";
import { randomUUID } from "crypto";

/**
 * Create a development admin user
 * Run with: npx ts-node scripts/create-admin.ts
 */
async function createAdminUser() {
  try {
    const adminId = randomUUID();
    const passwordHash = await hashPassword("SecureAdminPassword123!");
    
    console.log("Creating admin user...");
    console.log("Email: admin@tamer.studio");
    console.log("Password: SecureAdminPassword123!");
    console.log("Master Key: admin-master-key-development");
    
    const result = await db.insert(admin).values({
      id: adminId,
      email: "admin@tamer.studio",
      passwordHash,
      name: "Admin",
      role: "admin",
      isActive: true,
    }).returning();

    console.log("\n✅ Admin user created successfully!");
    console.log("Admin ID:", result[0]?.id);
    console.log("\nYou can now login at: http://localhost:3000/admin/login");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
