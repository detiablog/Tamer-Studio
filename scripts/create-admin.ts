import "dotenv/config";
import { bootstrapAdmin } from "@/core/admin/admin-bootstrap.service";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables.");
    console.error("   Example: ADMIN_EMAIL=admin@tamerstudio.com ADMIN_PASSWORD=your-secure-password pnpm tsx scripts/create-admin.ts");
    process.exit(1);
  }

  console.log("Creating admin user...");

  const result = await bootstrapAdmin({ email, password });

  if (!result.success) {
    console.error("❌ Error creating admin user:", result.error);
    process.exit(1);
  }

  if (result.skipped) {
    console.log("ℹ️  Admin user already exists.");
  } else {
    console.log("\n✅ Admin user created successfully!");
    console.log("Admin ID:", result.adminId);
  }

  console.log("\n⚠️  IMPORTANT: Remove ADMIN_EMAIL and ADMIN_PASSWORD from your environment after login.");
  console.log(`\nYou can now login at: ${appUrl}/admin/login`);
  process.exit(0);
}

main();
