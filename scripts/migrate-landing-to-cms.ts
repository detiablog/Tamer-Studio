import { db } from "@/lib/db";
import { landingSection, landingMedia } from "@/lib/db/schema/landing";
import { cmsPage, cmsSection, cmsMedia } from "@/lib/db/schema/cms";
import { eq, inArray } from "drizzle-orm";
import { CMSService } from "@/core/cms/cms.service";

async function migrateLandingToCMS() {
  console.log("Starting migration: landing_section → cms_page / cms_section");

  const sections = await db.select().from(landingSection).orderBy(landingSection.order);
  console.log(`Found ${sections.length} landing sections`);

  if (sections.length === 0) {
    console.log("No landing sections to migrate.");
    return;
  }

  const cmsService = new CMSService();

  const page = await cmsService.createPage({
    title: "Landing Page",
    slug: "landing-page",
    contentType: "page",
    status: "published",
    authorId: "system",
  });

  console.log(`Created CMS page: ${page.id}`);

  for (const section of sections) {
    const mediaRows = await db.select().from(landingMedia).where(eq(landingMedia.sectionKey, section.sectionKey));

    const cmsMediaRecords = await Promise.all(
      mediaRows.map(async (m) => {
        const created = await cmsService.registerMedia({
          filename: section.sectionKey,
          url: m.url,
          alt: m.alt ?? undefined,
          type: m.type,
          size: 0,
          folder: "landing-migration",
          metadata: { migratedFrom: "landing_media", originalId: m.id },
        });
        return created;
      })
    );

    await cmsService.createSection({
      pageId: page.id,
      sectionKey: section.sectionKey,
      type: section.type,
      title: section.title,
      description: section.description ?? undefined,
      component: section.component ?? undefined,
      order: section.order,
      visible: section.visible,
      locked: section.locked,
      config: (section.config as Record<string, unknown>) ?? {},
      styles: (section.styles as Record<string, unknown>) ?? {},
      media: cmsMediaRecords,
    });

    console.log(`Migrated section: ${section.sectionKey}`);
  }

  console.log("Migration completed successfully.");
}

migrateLandingToCMS().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
