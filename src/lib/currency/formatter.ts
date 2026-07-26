import { SUPPORTED_CURRENCIES } from "./constants";
import type { CurrencyProfile } from "@/lib/localization/types";

const FALLBACK_SYMBOLS: Record<string, string> = {
  USD: "$",
  IDR: "Rp",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  SGD: "S$",
  MYR: "RM",
  THB: "฿",
  PHP: "₱",
  VND: "₫",
  AED: "د.إ",
  SAR: "﷼",
  CNY: "¥",
  KRW: "₩",
  INR: "₹",
  AUD: "A$",
  CAD: "C$",
  BRL: "R$",
  MXN: "MX$",
  RUB: "₽",
  ZAR: "R",
};

export function resolveCurrencyInfo(
  currency: string,
  profile?: CurrencyProfile | null
): { symbol: string; minimumFractionDigits: number; maximumFractionDigits: number; locale: string } {
  if (profile) {
    return {
      symbol: profile.symbol,
      minimumFractionDigits: profile.minimumFractionDigits,
      maximumFractionDigits: profile.maximumFractionDigits,
      locale: profile.locale,
    };
  }
  const info = SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES];
  if (info) {
    return {
      symbol: info.symbol,
      minimumFractionDigits: info.minimumFractionDigits,
      maximumFractionDigits: info.maximumFractionDigits,
      locale: info.locale,
    };
  }
  return {
    symbol: FALLBACK_SYMBOLS[currency] ?? currency,
    minimumFractionDigits: currency === "JPY" || currency === "KRW" || currency === "VND" || currency === "IDR" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" || currency === "KRW" || currency === "VND" || currency === "IDR" ? 0 : 2,
    locale: "en-US",
  };
}

export function formatCurrency(
  amount: number | string,
  currency: string = "USD",
  locale: string = "en-US",
  profile?: CurrencyProfile | null
): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "";

  const info = resolveCurrencyInfo(currency, profile);
  try {
    return new Intl.NumberFormat(locale || info.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: info.minimumFractionDigits,
      maximumFractionDigits: info.maximumFractionDigits,
    }).format(numericAmount);
  } catch {
    return `${info.symbol}${numericAmount.toFixed(info.minimumFractionDigits)}`;
  }
}

export function formatNumber(
  value: number | string,
  locale: string = "en-US",
  options?: Intl.NumberFormatOptions
): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numericValue)) return "";
  return new Intl.NumberFormat(locale, options).format(numericValue);
}

export function formatPercent(
  value: number | string,
  locale: string = "en-US",
  decimals: number = 1
): string {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numericValue)) return "";
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numericValue / 100);
}

export function formatDate(
  date: Date | string | number,
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    ...options,
  }).format(d);
}

export function formatTime(
  date: Date | string | number,
  locale: string = "en-US",
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
    ...options,
  }).format(d);
}

export function formatDateTime(
  date: Date | string | number,
  locale: string = "en-US"
): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function getCurrencySymbol(currency: string = "USD"): string {
  return (
    SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES]?.symbol ??
    FALLBACK_SYMBOLS[currency] ??
    currency
  );
}

export { SUPPORTED_CURRENCIES } from "./constants";
