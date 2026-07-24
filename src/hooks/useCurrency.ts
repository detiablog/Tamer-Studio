"use client";

import * as React from "react";
import { formatCurrency, formatNumber, formatPercent, formatDate, formatTime, formatDateTime, getCurrencySymbol } from "@/lib/currency";
import type { SupportedCurrency } from "@/lib/localization/types";

export function useCurrency() {
  const [currency, setCurrencyState] = React.useState<SupportedCurrency>("USD");
  const [locale, setLocaleState] = React.useState("en-US");

  React.useEffect(() => {
    const handler = () => {
      const params = new URLSearchParams(window.location.search);
      const c = params.get("currency");
      if (c) setCurrencyState(c as SupportedCurrency);
    };
    window.addEventListener("currency-change", handler);
    return () => window.removeEventListener("currency-change", handler);
  }, []);

  const setCurrency = React.useCallback(
    (c: SupportedCurrency) => {
      setCurrencyState(c);
      window.dispatchEvent(new Event("currency-change"));
    },
    []
  );

  const setLocale = React.useCallback((l: string) => {
    setLocaleState(l);
  }, []);

  return {
    currency,
    setCurrency,
    locale,
    setLocale,
    formatCurrency: (amount: number | string) => formatCurrency(amount, currency, locale),
    formatNumber: (value: number | string) => formatNumber(value, locale),
    formatPercent: (value: number | string) => formatPercent(value, locale),
    formatDate: (date: Date | string | number) => formatDate(date, locale),
    formatTime: (date: Date | string | number) => formatTime(date, locale),
    formatDateTime: (date: Date | string | number) => formatDateTime(date, locale),
    symbol: getCurrencySymbol(currency),
  };
}
