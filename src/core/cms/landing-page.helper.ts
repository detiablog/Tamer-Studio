import type { CMSService } from "./cms.service";

const DEFAULT_LANDING_PAGE_SLUG = "landing-page";
const DEFAULT_LANDING_PAGE_TITLE = "Landing Page";

let cachedPageId: string | null = null;

export async function getOrCreateLandingPage(cmsService: CMSService): Promise<string> {
  if (cachedPageId) return cachedPageId;

  let page = await cmsService.getPageBySlug(DEFAULT_LANDING_PAGE_SLUG);
  if (!page) {
    page = await cmsService.createPage({
      title: DEFAULT_LANDING_PAGE_TITLE,
      slug: DEFAULT_LANDING_PAGE_SLUG,
      contentType: "page",
      status: "published",
      authorId: "system",
    });
  }

  cachedPageId = page.id;
  return page.id;
}

export function clearLandingPageCache(): void {
  cachedPageId = null;
}
