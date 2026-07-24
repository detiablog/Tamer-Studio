import { SUPPORTED_CURRENCIES } from "./constants";

export function formatCurrency(
  amount: number | string,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return "";

  const info = SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES];
  try {
    return new Intl.NumberFormat(locale, {
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
  return SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES]?.symbol ?? "$";
}

export { SUPPORTED_CURRENCIES } from "./constants";
