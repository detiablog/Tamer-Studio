import { pricingRepository } from "./pricing.repository";

export class PricingService {
  private repo = pricingRepository;

  async listPricingItems(filters?: { category?: string; status?: string; page?: number; limit?: number }) {
    return this.repo.findPricingItems(filters);
  }

  async getPricingItem(id: string) {
    return this.repo.findPricingItemById(id);
  }

  async getPricingItemBySlug(slug: string) {
    return this.repo.findPricingItemBySlug(slug);
  }

  async createPricingItem(data: {
    name: string;
    code: string;
    slug: string;
    description?: string;
    category: string;
    type: string;
    status?: string;
    visibility?: string;
    displayOrder?: number;
    language?: string;
    basePrice: string;
    salePrice?: string;
    currency?: string;
    features?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    config?: Record<string, unknown>;
    startsAt?: string;
    endsAt?: string;
    timezone?: string;
    createdBy?: string;
  }) {
    return this.repo.createPricingItem({
      name: data.name,
      code: data.code.toUpperCase(),
      slug: data.slug,
      description: data.description || null,
      category: data.category,
      type: data.type,
      status: data.status || "draft",
      visibility: data.visibility || "public",
      displayOrder: data.displayOrder ?? 0,
      language: data.language || "en",
      basePrice: data.basePrice,
      salePrice: data.salePrice || null,
      currency: data.currency || "USD",
      features: data.features || {},
      metadata: data.metadata || {},
      config: data.config || {},
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      timezone: data.timezone || "UTC",
      createdBy: data.createdBy || null,
    });
  }

  async updatePricingItem(id: string, data: Record<string, unknown>, createdBy?: string) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = String(data.code).toUpperCase();
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice;
    if (data.salePrice !== undefined) updateData.salePrice = data.salePrice;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;
    if (data.config !== undefined) updateData.config = data.config;
    if (data.startsAt !== undefined) updateData.startsAt = data.startsAt ? new Date(String(data.startsAt)) : null;
    if (data.endsAt !== undefined) updateData.endsAt = data.endsAt ? new Date(String(data.endsAt)) : null;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;

    const updated = await this.repo.updatePricingItem(id, updateData);

    if (updated) {
      await this.repo.createVersion(id, updated as unknown as Record<string, unknown>, createdBy);
    }

    return updated;
  }

  async deletePricingItem(id: string) {
    return this.repo.deletePricingItem(id);
  }

  async getVersions(pricingItemId: string) {
    return this.repo.getVersions(pricingItemId);
  }

  async findRegions(pricingItemId: string) {
    return this.repo.findRegions(pricingItemId);
  }

  async upsertRegion(data: { pricingItemId: string; country: string; region?: string; currency: string; overridePrice: string; overrideSalePrice?: string; isActive?: boolean }) {
    return this.repo.upsertRegion(data);
  }

  async deleteRegion(id: string) {
    return this.repo.deleteRegion(id);
  }

  async findActiveTaxes(country?: string) {
    return this.repo.findActiveTaxes(country);
  }

  async createTax(data: { name: string; type: string; rate: string; country?: string; region?: string }) {
    return this.repo.createTax(data);
  }

  async findActiveFees() {
    return this.repo.findActiveFees();
  }

  async createFee(data: { name: string; type: string; rate: string; minAmount?: string; maxAmount?: string }) {
    return this.repo.createFee(data);
  }

  async getDashboardStats() {
    return this.repo.getDashboardStats();
  }
}

export const pricingService = new PricingService();
