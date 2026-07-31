import { pricingRepository } from "./pricing.repository";
import { campaignRepository } from "@/core/campaign/campaign.repository";

export interface PriceCalculationInput {
  pricingItemId: string;
  country?: string;
  currency?: string;
  campaignCode?: string;
  couponCode?: string;
  referralCode?: string;
}

export interface PriceBreakdown {
  basePrice: number;
  salePrice: number | null;
  regionalPrice: number | null;
  campaignDiscount: number;
  couponDiscount: number;
  referralDiscount: number;
  subtotal: number;
  taxAmount: number;
  taxRate: number;
  feeAmount: number;
  finalPrice: number;
  currency: string;
  breakdown: Array<{ label: string; amount: number }>;
}

export class PriceCalculationEngine {
  async calculate(input: PriceCalculationInput): Promise<PriceBreakdown> {
    const item = await pricingRepository.findPricingItemById(input.pricingItemId);
    if (!item) throw new Error("Pricing item not found");

    const basePrice = parseFloat(item.basePrice);
    const salePrice = item.salePrice ? parseFloat(item.salePrice) : null;
    const workingPrice = salePrice ?? basePrice;

    const breakdown: Array<{ label: string; amount: number }> = [];

    let regionalPrice: number | null = null;
    let currentPrice = workingPrice;

    if (input.country) {
      const regions = await pricingRepository.findRegions(item.id);
      const region = regions.find((r) => r.country === input.country && r.isActive);
      if (region) {
        regionalPrice = parseFloat(region.overridePrice);
        if (region.overrideSalePrice) {
          regionalPrice = parseFloat(region.overrideSalePrice);
        }
        currentPrice = regionalPrice;
        breakdown.push({ label: "Regional override", amount: regionalPrice });
      }
    }

    let campaignDiscount = 0;
    if (input.campaignCode) {
      const campaign = await campaignRepository.findCampaignByCode(input.campaignCode);
      if (campaign && campaign.status === "running") {
        const rules = campaign.rules as Record<string, unknown>;
        const discountType = rules.discountType as string;
        const discountValue = Number(rules.discountValue) || 0;
        if (discountType === "percentage") {
          campaignDiscount = currentPrice * (discountValue / 100);
        } else if (discountType === "fixed") {
          campaignDiscount = discountValue;
        }
        campaignDiscount = Math.min(campaignDiscount, currentPrice);
        if (campaignDiscount > 0) {
          currentPrice -= campaignDiscount;
          breakdown.push({ label: `Campaign discount (${campaign.code})`, amount: -campaignDiscount });
        }
      }
    }

    let couponDiscount = 0;
    if (input.couponCode) {
      const coupon = await campaignRepository.findCouponByCode(input.couponCode);
      if (coupon && coupon.isActive) {
        const couponValue = parseFloat(coupon.value);
        if (coupon.type === "percentage") {
          couponDiscount = currentPrice * (couponValue / 100);
          if (coupon.maxDiscount) {
            couponDiscount = Math.min(couponDiscount, parseFloat(coupon.maxDiscount));
          }
        } else if (coupon.type === "fixed") {
          couponDiscount = couponValue;
        }
        couponDiscount = Math.min(couponDiscount, currentPrice);
        if (couponDiscount > 0) {
          currentPrice -= couponDiscount;
          breakdown.push({ label: `Coupon discount (${coupon.code})`, amount: -couponDiscount });
        }
      }
    }

    let referralDiscount = 0;
    if (input.referralCode) {
      const referralRules = (item.config as Record<string, unknown>).referral as Record<string, unknown> | undefined;
      if (referralRules) {
        const refDiscountType = referralRules.discountType as string;
        const refDiscountValue = Number(referralRules.discountValue) || 0;
        if (refDiscountType === "percentage") {
          referralDiscount = currentPrice * (refDiscountValue / 100);
        } else if (refDiscountType === "fixed") {
          referralDiscount = refDiscountValue;
        }
        referralDiscount = Math.min(referralDiscount, currentPrice);
        if (referralDiscount > 0) {
          currentPrice -= referralDiscount;
          breakdown.push({ label: "Referral discount", amount: -referralDiscount });
        }
      }
    }

    const subtotal = currentPrice;

    let taxRate = 0;
    let taxAmount = 0;
    const taxes = await pricingRepository.findActiveTaxes(input.country);
    for (const tax of taxes) {
      const rate = parseFloat(tax.rate);
      if (tax.type === "percentage") {
        taxRate += rate;
      }
    }
    if (taxRate > 0) {
      taxAmount = subtotal * (taxRate / 100);
      breakdown.push({ label: `Tax (${taxRate}%)`, amount: taxAmount });
    }

    let feeAmount = 0;
    const fees = await pricingRepository.findActiveFees();
    for (const fee of fees) {
      const feeRate = parseFloat(fee.rate);
      const minAmount = parseFloat(fee.minAmount);
      let maxAmount: number | null = null;
      if (fee.maxAmount) maxAmount = parseFloat(fee.maxAmount);
      if (subtotal < minAmount) continue;
      if (maxAmount !== null && subtotal > maxAmount) continue;
      let feeValue = 0;
      if (fee.type === "percentage") {
        feeValue = subtotal * (feeRate / 100);
      } else if (fee.type === "fixed") {
        feeValue = feeRate;
      }
      feeAmount += feeValue;
      breakdown.push({ label: `Fee (${fee.name})`, amount: feeValue });
    }

    const finalPrice = subtotal + taxAmount + feeAmount;

    if (salePrice !== null && regionalPrice === null) {
      breakdown.push({ label: "Base price", amount: basePrice });
      breakdown.push({ label: "Sale price", amount: salePrice });
    } else if (regionalPrice === null) {
      breakdown.push({ label: "Base price", amount: basePrice });
    }

    breakdown.push({ label: "Subtotal", amount: subtotal });
    breakdown.push({ label: "Final price", amount: finalPrice });

    return {
      basePrice,
      salePrice,
      regionalPrice,
      campaignDiscount,
      couponDiscount,
      referralDiscount,
      subtotal,
      taxAmount,
      taxRate,
      feeAmount,
      finalPrice,
      currency: input.currency || item.currency,
      breakdown,
    };
  }
}

export const pricingEngine = new PriceCalculationEngine();
