/**
 * Seed script for landing page sections
 * This populates the database with all landing page sections from the live site
 * Run with: pnpm tsx scripts/seed-landing-sections.ts
 */

import "dotenv/config";
import { seedLandingSections } from "@/core/landing";

seedLandingSections().then((result) => {
  if (!result.success) {
    console.error("❌ Error seeding landing sections:", result.error);
    process.exit(1);
  }
  if (result.skipped) {
    console.log("ℹ️  Landing sections already exist, skipping seed.");
  } else {
    console.log("✅ Landing sections seed completed successfully!");
    console.log(`📊 Created: ${result.created}, Updated: ${result.updated}`);
  }
  process.exit(0);
});
