import { db } from "@/lib/db";
import {
  localizationProfile,
  region,
  pricingProfile,
  pricingRule,
  paymentProfile,
  paymentMethod,
  currencyProfile,
} from "@/lib/db/schema/localization";
import { eq, and, desc } from "drizzle-orm";
import type { LocalizationProfile, RegionInfo, CurrencyProfile, PricingProfileInfo, PricingRuleInfo, PaymentProfileInfo, PaymentMethodInfo } from "@/lib/localization/types";

export interface LocalizationRepository {
  getProfiles(): Promise<LocalizationProfile[]>;
  getRegions(): Promise<RegionInfo[]>;
  getCurrencyProfiles(): Promise<CurrencyProfile[]>;
  getPricingProfiles(): Promise<PricingProfileInfo[]>;
  getPricingRules(profileId: string): Promise<PricingRuleInfo[]>;
  getPaymentProfiles(): Promise<PaymentProfileInfo[]>;
  getPaymentMethods(profileId: string): Promise<PaymentMethodInfo[]>;
  upsertProfile(data: Partial<typeof localizationProfile.$inferInsert> & { id?: string }): Promise<LocalizationProfile>;
  upsertRegion(data: Partial<typeof region.$inferInsert> & { id?: string }): Promise<RegionInfo>;
  upsertCurrencyProfile(data: Partial<typeof currencyProfile.$inferInsert> & { id?: string }): Promise<CurrencyProfile>;
  upsertPricingProfile(data: Partial<typeof pricingProfile.$inferInsert> & { id?: string }): Promise<PricingProfileInfo>;
  upsertPricingRule(data: Partial<typeof pricingRule.$inferInsert> & { id?: string }): Promise<PricingRuleInfo>;
  upsertPaymentProfile(data: Partial<typeof paymentProfile.$inferInsert> & { id?: string }): Promise<PaymentProfileInfo>;
  upsertPaymentMethod(data: Partial<typeof paymentMethod.$inferInsert> & { id?: string }): Promise<PaymentMethodInfo>;
  deleteProfile(id: string): Promise<void>;
  deleteRegion(id: string): Promise<void>;
  deleteCurrencyProfile(id: string): Promise<void>;
  deletePricingProfile(id: string): Promise<void>;
  deletePricingRule(id: string): Promise<void>;
  deletePaymentProfile(id: string): Promise<void>;
  deletePaymentMethod(id: string): Promise<void>;
}

export class DefaultLocalizationRepository implements LocalizationRepository {
  async getProfiles(): Promise<LocalizationProfile[]> {
    const rows = await db.select().from(localizationProfile).orderBy(localizationProfile.name);
    return rows.map(this.mapProfile);
  }

  async getRegions(): Promise<RegionInfo[]> {
    const rows = await db
      .select()
      .from(region)
      .orderBy(desc(region.priority), region.code);
    return rows.map((r) => ({
      ...r,
    })) as RegionInfo[];
  }

  async getCurrencyProfiles(): Promise<CurrencyProfile[]> {
    const rows = await db
      .select()
      .from(currencyProfile)
      .orderBy(currencyProfile.code);
    return rows.map(this.mapCurrencyProfile);
  }

  async getPricingProfiles(): Promise<PricingProfileInfo[]> {
    const rows = await db
      .select()
      .from(pricingProfile)
      .orderBy(pricingProfile.name);
    return rows.map(this.mapPricingProfile);
  }

  async getPricingRules(profileId: string): Promise<PricingRuleInfo[]> {
    const rows = await db
      .select()
      .from(pricingRule)
      .where(eq(pricingRule.profileId, profileId))
      .orderBy(pricingRule.planId);
    return rows.map((r) => r as PricingRuleInfo);
  }

  async getPaymentProfiles(): Promise<PaymentProfileInfo[]> {
    const rows = await db
      .select()
      .from(paymentProfile)
      .orderBy(paymentProfile.name);
    return rows.map(this.mapPaymentProfile);
  }

  async getPaymentMethods(profileId: string): Promise<PaymentMethodInfo[]> {
    const rows = await db
      .select()
      .from(paymentMethod)
      .where(eq(paymentMethod.profileId, profileId))
      .orderBy(paymentMethod.priority, paymentMethod.provider);
    return rows.map(this.mapPaymentMethod);
  }

  async upsertProfile(data: Partial<typeof localizationProfile.$inferInsert> & { id?: string }): Promise<LocalizationProfile> {
    if (data.id) {
      const [updated] = await db
        .update(localizationProfile)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(localizationProfile.id, data.id))
        .returning();
      return this.mapProfile(updated);
    }
    const [created] = await db
      .insert(localizationProfile)
      .values(data as typeof localizationProfile.$inferInsert)
      .returning();
    return this.mapProfile(created);
  }

  async upsertRegion(data: Partial<typeof region.$inferInsert> & { id?: string }): Promise<RegionInfo> {
    if (data.id) {
      const [updated] = await db
        .update(region)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(region.id, data.id))
        .returning();
      return { ...updated } as RegionInfo;
    }
    const [created] = await db
      .insert(region)
      .values(data as typeof region.$inferInsert)
      .returning();
    return { ...created } as RegionInfo;
  }

  async upsertCurrencyProfile(data: Partial<typeof currencyProfile.$inferInsert> & { id?: string }): Promise<CurrencyProfile> {
    if (data.id) {
      const [updated] = await db
        .update(currencyProfile)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(currencyProfile.id, data.id))
        .returning();
      return this.mapCurrencyProfile(updated);
    }
    const [created] = await db
      .insert(currencyProfile)
      .values(data as typeof currencyProfile.$inferInsert)
      .returning();
    return this.mapCurrencyProfile(created);
  }

  async upsertPricingProfile(data: Partial<typeof pricingProfile.$inferInsert> & { id?: string }): Promise<PricingProfileInfo> {
    if (data.id) {
      const [updated] = await db
        .update(pricingProfile)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(pricingProfile.id, data.id))
        .returning();
      return this.mapPricingProfile(updated);
    }
    const [created] = await db
      .insert(pricingProfile)
      .values(data as typeof pricingProfile.$inferInsert)
      .returning();
    return this.mapPricingProfile(created);
  }

  async upsertPricingRule(data: Partial<typeof pricingRule.$inferInsert> & { id?: string }): Promise<PricingRuleInfo> {
    if (data.id) {
      const [updated] = await db
        .update(pricingRule)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(pricingRule.id, data.id))
        .returning();
      return updated as PricingRuleInfo;
    }
    const [created] = await db
      .insert(pricingRule)
      .values(data as typeof pricingRule.$inferInsert)
      .returning();
    return created as PricingRuleInfo;
  }

  async upsertPaymentProfile(data: Partial<typeof paymentProfile.$inferInsert> & { id?: string }): Promise<PaymentProfileInfo> {
    if (data.id) {
      const [updated] = await db
        .update(paymentProfile)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(paymentProfile.id, data.id))
        .returning();
      return this.mapPaymentProfile(updated);
    }
    const [created] = await db
      .insert(paymentProfile)
      .values(data as typeof paymentProfile.$inferInsert)
      .returning();
    return this.mapPaymentProfile(created);
  }

  async upsertPaymentMethod(data: Partial<typeof paymentMethod.$inferInsert> & { id?: string }): Promise<PaymentMethodInfo> {
    if (data.id) {
      const [updated] = await db
        .update(paymentMethod)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(paymentMethod.id, data.id))
        .returning();
      return this.mapPaymentMethod(updated);
    }
    const [created] = await db
      .insert(paymentMethod)
      .values(data as typeof paymentMethod.$inferInsert)
      .returning();
    return this.mapPaymentMethod(created);
  }

  async deleteProfile(id: string): Promise<void> {
    await db.delete(localizationProfile).where(eq(localizationProfile.id, id));
  }

  async deleteRegion(id: string): Promise<void> {
    await db.delete(region).where(eq(region.id, id));
  }

  async deleteCurrencyProfile(id: string): Promise<void> {
    await db.delete(currencyProfile).where(eq(currencyProfile.id, id));
  }

  async deletePricingProfile(id: string): Promise<void> {
    await db.delete(pricingProfile).where(eq(pricingProfile.id, id));
  }

  async deletePricingRule(id: string): Promise<void> {
    await db.delete(pricingRule).where(eq(pricingRule.id, id));
  }

  async deletePaymentProfile(id: string): Promise<void> {
    await db.delete(paymentProfile).where(eq(paymentProfile.id, id));
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await db.delete(paymentMethod).where(eq(paymentMethod.id, id));
  }

  private mapProfile(row: typeof localizationProfile.$inferSelect): LocalizationProfile {
    return {
      ...row,
      pricingProfile: row.pricingProfile ?? "",
    } as LocalizationProfile;
  }

  private mapCurrencyProfile(row: typeof currencyProfile.$inferSelect): CurrencyProfile {
    return {
      ...row,
      exchangeRateToUsd: Number(row.exchangeRateToUsd),
    } as CurrencyProfile;
  }

  private mapPricingProfile(row: typeof pricingProfile.$inferSelect): PricingProfileInfo {
    return {
      ...row,
      config: (row.config ?? {}) as Record<string, unknown>,
    } as PricingProfileInfo;
  }

  private mapPaymentProfile(row: typeof paymentProfile.$inferSelect): PaymentProfileInfo {
    return {
      ...row,
      config: (row.config ?? {}) as Record<string, unknown>,
    } as PaymentProfileInfo;
  }

  private mapPaymentMethod(row: typeof paymentMethod.$inferSelect): PaymentMethodInfo {
    return {
      ...row,
      config: (row.config ?? {}) as Record<string, unknown>,
    } as PaymentMethodInfo;
  }
}