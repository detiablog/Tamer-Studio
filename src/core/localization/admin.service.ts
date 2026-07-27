import { DefaultLocalizationRepository } from "./localization.repository";
import type { LocalizationRepository } from "./localization.repository";
import type { LocalizationProfile, RegionInfo, CurrencyProfile, PricingProfileInfo, PricingRuleInfo, PaymentProfileInfo, PaymentMethodInfo } from "@/lib/localization/types";

export class AdminLocalizationService {
  private repository: LocalizationRepository;

  constructor(repository?: LocalizationRepository) {
    this.repository = repository ?? new DefaultLocalizationRepository();
  }

  async getProfiles(): Promise<LocalizationProfile[]> {
    return this.repository.getProfiles();
  }

  async getRegions(): Promise<RegionInfo[]> {
    return this.repository.getRegions();
  }

  async getCurrencyProfiles(): Promise<CurrencyProfile[]> {
    return this.repository.getCurrencyProfiles();
  }

  async getPricingProfiles(): Promise<PricingProfileInfo[]> {
    return this.repository.getPricingProfiles();
  }

  async getPricingRules(profileId: string): Promise<PricingRuleInfo[]> {
    return this.repository.getPricingRules(profileId);
  }

  async getPaymentProfiles(): Promise<PaymentProfileInfo[]> {
    return this.repository.getPaymentProfiles();
  }

  async getPaymentMethods(profileId: string): Promise<PaymentMethodInfo[]> {
    return this.repository.getPaymentMethods(profileId);
  }

  async upsertProfile(data: Partial<typeof import("@/lib/db/schema/localization").localizationProfile.$inferInsert> & { id?: string }) {
    return this.repository.upsertProfile(data);
  }

  async upsertRegion(data: Partial<typeof import("@/lib/db/schema/localization").region.$inferInsert> & { id?: string }) {
    return this.repository.upsertRegion(data);
  }

  async upsertCurrencyProfile(data: Partial<typeof import("@/lib/db/schema/localization").currencyProfile.$inferInsert> & { id?: string }) {
    return this.repository.upsertCurrencyProfile(data);
  }

  async upsertPricingProfile(data: Partial<typeof import("@/lib/db/schema/localization").pricingProfile.$inferInsert> & { id?: string }) {
    return this.repository.upsertPricingProfile(data);
  }

  async upsertPricingRule(data: Partial<typeof import("@/lib/db/schema/localization").pricingRule.$inferInsert> & { id?: string }) {
    return this.repository.upsertPricingRule(data);
  }

  async upsertPaymentProfile(data: Partial<typeof import("@/lib/db/schema/localization").paymentProfile.$inferInsert> & { id?: string }) {
    return this.repository.upsertPaymentProfile(data);
  }

  async upsertPaymentMethod(data: Partial<typeof import("@/lib/db/schema/localization").paymentMethod.$inferInsert> & { id?: string }) {
    return this.repository.upsertPaymentMethod(data);
  }

  async deleteProfile(id: string): Promise<void> {
    await this.repository.deleteProfile(id);
  }

  async deleteRegion(id: string): Promise<void> {
    await this.repository.deleteRegion(id);
  }

  async deleteCurrencyProfile(id: string): Promise<void> {
    await this.repository.deleteCurrencyProfile(id);
  }

  async deletePricingProfile(id: string): Promise<void> {
    await this.repository.deletePricingProfile(id);
  }

  async deletePricingRule(id: string): Promise<void> {
    await this.repository.deletePricingRule(id);
  }

  async deletePaymentProfile(id: string): Promise<void> {
    await this.repository.deletePaymentProfile(id);
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await this.repository.deletePaymentMethod(id);
  }
}

export const adminLocalizationService = new AdminLocalizationService();