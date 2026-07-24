"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/currency";
import type { SupportedCurrency } from "@/lib/localization/types";

interface CurrencyContextValue {
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  formatCurrency: (amount: number | string, locale?: string) => string;
  symbol: string;
}

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = React.useState<SupportedCurrency>("USD");

  const setCurrency = React.useCallback((newCurrency: SupportedCurrency) => {
    setCurrencyState(newCurrency);
    window.dispatchEvent(new Event("currency-change"));
  }, []);

  const format = React.useCallback(
    (amount: number | string, locale = "en-US") => formatCurrency(amount, currency, locale),
    [currency]
  );

  const symbol = React.useMemo(() => {
    return currency === "IDR" ? "Rp" : "$";
  }, [currency]);

  const value = React.useMemo(
    () => ({
      currency,
      setCurrency,
      formatCurrency: format,
      symbol,
    }),
    [currency, setCurrency, format, symbol]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrencyContext(): CurrencyContextValue {
  const context = React.useContext(CurrencyContext);
  if (!context) {
    return {
      currency: "USD",
      setCurrency: () => {},
      formatCurrency: (amount) => formatCurrency(amount, "USD", "en-US"),
      symbol: "$",
    };
  }
  return context;
}
