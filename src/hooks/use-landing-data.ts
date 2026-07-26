"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocalizationContext } from "@/providers/localization";
import { currencyService } from "@/lib/currency/service";
import { getLocalizationService } from "@/lib/localization";
import type { CurrencyProfile } from "@/lib/localization/types";

interface LandingDataState {
  locale: string;
  currency: string;
  country: string | null;
  timezone: string | null;
  currencyProfile: CurrencyProfile | null;
  pricingProfile: Record<string, unknown> | null;
  pricingRules: Array<{
    planId: string;
    monthly: { displayPrice: string; amount: string; currency: string; billingCycle: string } | null;
    yearly: { displayPrice: string; amount: string; currency: string; billingCycle: string } | null;
  }> | null;
  campaign: Record<string, unknown> | null;
  subscriptionPlans: Array<{
    id: string;
    name: string;
    price: number | null;
    currency: string;
    billingCycle: string;
    features: string[];
    cta: string;
    href: string;
    popular?: boolean;
    topUp?: boolean;
    campaignBadge?: string;
  }> | null;
  seo: Record<string, unknown> | null;
  loading: boolean;
  error: Error | null;
}

export function useLandingData() {
  const { locale, currency, t } = useLocalizationContext();
  const [data, setData] = useState<LandingDataState>({
    locale,
    currency,
    country: null,
    timezone: null,
    currencyProfile: null,
    pricingProfile: null,
    pricingRules: null,
    campaign: null,
    subscriptionPlans: null,
    seo: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      const [currencyRes, pricingRes, campaignRes, subscriptionRes, seoRes] =
        await Promise.all([
          fetch("/api/landing/currency").catch(() => null),
          fetch("/api/landing/pricing").catch(() => null),
          fetch("/api/landing/campaign").catch(() => null),
          fetch("/api/landing/subscription").catch(() => null),
          fetch("/api/landing/seo").catch(() => null),
        ]);

      const currencyProfile = currencyRes?.ok ? await currencyRes.json() : null;
      const pricingData = pricingRes?.ok ? await pricingRes.json() : null;
      const campaign = campaignRes?.ok ? await campaignRes.json() : null;
      const subscription = subscriptionRes?.ok ? await subscriptionRes.json() : null;
      const seo = seoRes?.ok ? await seoRes.json() : null;

      setData({
        locale,
        currency,
        country: null,
        timezone: null,
        currencyProfile: currencyProfile?.data?.data ?? null,
        pricingProfile: pricingData?.data?.profile ?? null,
        pricingRules: pricingData?.data?.rules ?? null,
        campaign: campaign?.data ?? null,
        subscriptionPlans: subscription?.data?.plans ?? null,
        seo: seo?.data ?? null,
        loading: false,
        error: null,
      });
    } catch (err) {
      setData((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err : new Error("Failed to load landing data"),
      }));
    }
  }, [locale, currency]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resolvedCurrency = useMemo(() => {
    if (data.currencyProfile) {
      return data.currencyProfile;
    }
    return { code: data.currency, symbol: "$", locale: "en-US" };
  }, [data.currencyProfile, data.currency]);

  const formatPrice = useCallback(
    (price: number | null, billingCycle?: string) => {
      if (price === null) return t("marketing.contactSales");
      const symbol = resolvedCurrency.symbol || "$";
      const loc = resolvedCurrency.locale || "en-US";
      const currencyCode = data.currency || "USD";
      try {
        return new Intl.NumberFormat(loc, {
          style: "currency",
          currency: currencyCode,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(price);
      } catch {
        return `${symbol}${price.toFixed(2)}`;
      }
    },
    [resolvedCurrency, data.currency, t]
  );

  return {
    ...data,
    resolvedCurrency,
    formatPrice,
    refetch: fetchData,
  };
}