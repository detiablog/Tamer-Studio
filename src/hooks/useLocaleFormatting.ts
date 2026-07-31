"use client";

import { useLocalizationContext } from "@/providers/localization";
import { formatCurrency, formatNumber, formatPercent, formatDate, formatTime, formatDateTime } from "@/lib/currency/formatter";

export function useLocaleFormatting() {
  const { locale } = useLocalizationContext();

  return {
    currency: (amount: number, currency?: string) =>
      formatCurrency(amount, currency || "USD", locale),
    number: (value: number) => formatNumber(value, locale),
    percent: (value: number, decimals?: number) => formatPercent(value, locale, decimals),
    date: (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, locale, options),
    time: (date: Date | string, options?: Intl.DateTimeFormatOptions) =>
      formatTime(date, locale, options),
    dateTime: (date: Date | string) => formatDateTime(date, locale),
    locale,
  };
}
