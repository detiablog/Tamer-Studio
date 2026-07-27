import type { CMSPage, CMSComponent, CMSContentType, CMSPageStatus, CMSPermission } from "./cms.types";

export class PageRegistry {
  private pages: Map<string, CMSPage> = new Map();
  private slugIndex: Map<string, string> = new Map();
  private componentIndex: Map<string, CMSComponent> = new Map();

  registerPage(page: CMSPage): void {
    this.pages.set(page.id, page);
    this.slugIndex.set(page.slug, page.id);
  }

  getPage(id: string): CMSPage | undefined {
    return this.pages.get(id);
  }

  getPageBySlug(slug: string): CMSPage | undefined {
    const id = this.slugIndex.get(slug);
    if (!id) return undefined;
    return this.pages.get(id);
  }

  updatePage(id: string, updates: Partial<CMSPage>): CMSPage | undefined {
    const existing = this.pages.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, id: existing.id };
    this.pages.set(id, updated);
    if (updates.slug && updates.slug !== existing.slug) {
      this.slugIndex.delete(existing.slug);
      this.slugIndex.set(updates.slug, id);
    }
    return updated;
  }

  deletePage(id: string): boolean {
    const page = this.pages.get(id);
    if (!page) return false;
    this.slugIndex.delete(page.slug);
    this.pages.delete(id);
    return true;
  }

  listPages(filters?: { status?: CMSPageStatus; contentType?: CMSContentType }): CMSPage[] {
    let results = Array.from(this.pages.values());
    if (filters?.status) {
      results = results.filter((p) => p.status === filters.status);
    }
    if (filters?.contentType) {
      results = results.filter((p) => p.contentType === filters.contentType);
    }
    return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  registerComponent(component: CMSComponent): void {
    this.componentIndex.set(component.id, component);
  }

  getComponent(id: string): CMSComponent | undefined {
    return this.componentIndex.get(id);
  }

  listComponents(): CMSComponent[] {
    return Array.from(this.componentIndex.values());
  }

  hasPermission(page: CMSPage, action: "read" | "write" | "publish", permission: CMSPermission): boolean {
    const permissions = page.permissions[action];
    return permissions.includes(permission) || permissions.includes("admin");
  }
}

export const pageRegistry = new PageRegistry();