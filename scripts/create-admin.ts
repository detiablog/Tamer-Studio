import { db } from "@/lib/db";
import { admin } from "@/lib/db/schema/admin";
import { hashPassword } from "@/core/admin/login";
import { randomUUID } from "crypto";

async function createAdminUser() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (!email || !password) {
      console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables.");
      console.error("   Example: ADMIN_EMAIL=admin@tamerstudio.com ADMIN_PASSWORD=your-secure-password pnpm tsx scripts/create-admin.ts");
      process.exit(1);
    }

    if (password.length < 12) {
      console.error("❌ ADMIN_PASSWORD must be at least 12 characters long.");
      process.exit(1);
    }

    const adminId = `admin_${randomUUID()}`;
    const passwordHash = await hashPassword(password);

    console.log("Creating admin user...");

    const result = await db.insert(admin).values({
      id: adminId,
      email,
      passwordHash,
      name: "Admin",
      role: "admin",
      isActive: true,
    }).returning();

    console.log("\n✅ Admin user created successfully!");
    console.log("Admin ID:", result[0]?.id);
    console.log("\n⚠️  IMPORTANT: Remove ADMIN_EMAIL and ADMIN_PASSWORD from your environment after login.");
    console.log(`\nYou can now login at: ${appUrl}/admin/login`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();
