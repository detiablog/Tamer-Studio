import { db } from "@/lib/db";
import { landingSection } from "@/lib/db/schema/landing";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/core/logger";

export interface LandingSeedResult {
  success: boolean;
  created: number;
  updated: number;
  skipped: boolean;
  error?: string;
}

export async function seedLandingSections(): Promise<LandingSeedResult> {
  const { LANDING_SECTIONS } = await import("./landing-seed-data");

  const existingCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(landingSection);

  if (existingCount[0]?.count && existingCount[0].count > 0) {
    logger.info("Landing sections already exist, skipping seed");
    return { success: true, created: 0, updated: 0, skipped: true };
  }

  let created = 0;
  let updated = 0;

  for (const section of LANDING_SECTIONS) {
    const existing = await db
      .select()
      .from(landingSection)
      .where(eq(landingSection.sectionKey, section.sectionKey))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(landingSection)
        .set({ ...section, updatedAt: new Date() } as never)
        .where(eq(landingSection.sectionKey, section.sectionKey));
      updated++;
    } else {
      await db.insert(landingSection).values({
        ...section,
        component: "",
        locked: false,
        styles: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);
      created++;
    }
  }

  logger.info("Landing sections seeded", { created, updated, total: LANDING_SECTIONS.length });
  return { success: true, created, updated, skipped: false };
}
