import { db } from "@/lib/db";
import { eq, desc } from "drizzle-orm";
import {
  localizationProfile,
  region,
  pricingProfile,
  pricingRule,
  paymentProfile,
  paymentMethod,
  currencyProfile,
} from "@/lib/db/schema/localization";

export class AdminLocalizationService {
  async getProfiles() {
    const profiles = await db.select().from(localizationProfile).orderBy(localizationProfile.name);
    return profiles;
  }

  async getRegions() {
    const regions = await db
      .select()
      .from(region)
      .orderBy(desc(region.priority), region.code);
    return regions;
  }

  async getCurrencyProfiles() {
    const currencies = await db
      .select()
      .from(currencyProfile)
      .orderBy(currencyProfile.code);
    return currencies;
  }

  async getPricingProfiles() {
    const profiles = await db
      .select()
      .from(pricingProfile)
      .orderBy(pricingProfile.name);
    return profiles;
  }

  async getPricingRules(profileId: string) {
    const rules = await db
      .select()
      .from(pricingRule)
      .where(eq(pricingRule.profileId, profileId))
      .orderBy(pricingRule.planId);
    return rules;
  }

  async getPaymentProfiles() {
    const profiles = await db
      .select()
      .from(paymentProfile)
      .orderBy(paymentProfile.name);
    return profiles;
  }

  async getPaymentMethods(profileId: string) {
    const methods = await db
      .select()
      .from(paymentMethod)
      .where(eq(paymentMethod.profileId, profileId))
      .orderBy(paymentMethod.priority, paymentMethod.provider);
    return methods;
  }

  async upsertProfile(data: Partial<typeof localizationProfile.$inferInsert> & { id?: string }) {
    if (data.id) {
      const [updated] = await db
        .update(localizationProfile)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(localizationProfile.id, data.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(localizationProfile)
      .values(data as typeof localizationProfile.$inferInsert)
      .returning();
    return created;
  }

  async upsertRegion(data: Partial<typeof region.$inferInsert> & { id?: string }) {
    if (data.id) {
      const [updated] = await db
        .update(region)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(region.id, data.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(region)
      .values(data as typeof region.$inferInsert)
      .returning();
    return created;
  }

  async upsertCurrencyProfile(data: Partial<typeof currencyProfile.$inferInsert> & { id?: string }) {
    if (data.id) {
      const [updated] = await db
        .update(currencyProfile)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(currencyProfile.id, data.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(currencyProfile)
      .values(data as typeof currencyProfile.$inferInsert)
      .returning();
    return created;
  }

  async upsertPricingProfile(data: Partial<typeof pricingProfile.$inferInsert> & { id?: string }) {
    if (data.id) {
      const [updated] = await db
        .update(pricingProfile)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(pricingProfile.id, data.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(pricingProfile)
      .values(data as typeof pricingProfile.$inferInsert)
      .returning();
    return created;
  }

  async upsertPricingRule(data: Partial<typeof pricingRule.$inferInsert> & { id?: string }) {
    if (data.id) {
      const [updated] = await db
        .update(pricingRule)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(pricingRule.id, data.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(pricingRule)
      .values(data as typeof pricingRule.$inferInsert)
      .returning();
    return created;
  }

  async upsertPaymentProfile(data: Partial<typeof paymentProfile.$inferInsert> & { id?: string }) {
    if (data.id) {
      const [updated] = await db
        .update(paymentProfile)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(paymentProfile.id, data.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(paymentProfile)
      .values(data as typeof paymentProfile.$inferInsert)
      .returning();
    return created;
  }

  async upsertPaymentMethod(data: Partial<typeof paymentMethod.$inferInsert> & { id?: string }) {
    if (data.id) {
      const [updated] = await db
        .update(paymentMethod)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(paymentMethod.id, data.id))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(paymentMethod)
      .values(data as typeof paymentMethod.$inferInsert)
      .returning();
    return created;
  }

  async deleteProfile(id: string) {
    await db.delete(localizationProfile).where(eq(localizationProfile.id, id));
  }

  async deleteRegion(id: string) {
    await db.delete(region).where(eq(region.id, id));
  }

  async deleteCurrencyProfile(id: string) {
    await db.delete(currencyProfile).where(eq(currencyProfile.id, id));
  }

  async deletePricingProfile(id: string) {
    await db.delete(pricingProfile).where(eq(pricingProfile.id, id));
  }

  async deletePricingRule(id: string) {
    await db.delete(pricingRule).where(eq(pricingRule.id, id));
  }

  async deletePaymentProfile(id: string) {
    await db.delete(paymentProfile).where(eq(paymentProfile.id, id));
  }

  async deletePaymentMethod(id: string) {
    await db.delete(paymentMethod).where(eq(paymentMethod.id, id));
  }
}

export const adminLocalizationService = new AdminLocalizationService();
