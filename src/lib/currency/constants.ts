export type SupportedCurrency = "USD" | "IDR";

export interface CurrencyInfo {
  code: SupportedCurrency;
  name: string;
  symbol: string;
  locale: string;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
}

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
};

export const DEFAULT_CURRENCY: SupportedCurrency = "USD";
