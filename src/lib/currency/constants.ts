import type { SupportedCurrency, CurrencyInfo } from "@/lib/localization/types";

export const SUPPORTED_CURRENCIES: Record<SupportedCurrency, CurrencyInfo> = {
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    locale: "en-US",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  IDR: {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    locale: "id-ID",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  JPY: {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    locale: "ja-JP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    locale: "de-DE",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  GBP: {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    locale: "en-GB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
};

export const DEFAULT_CURRENCY: SupportedCurrency = "USD";
