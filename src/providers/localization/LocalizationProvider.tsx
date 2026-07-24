"use client";

import * as React from "react";
import { getLocalizationService } from "@/lib/localization";
import { type SupportedLocale } from "@/lib/localization/types";

interface LocalizationContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, fallback?: string) => string;
  translations: Record<string, string>;
}

const LocalizationContext = React.createContext<LocalizationContextValue | null>(null);

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const service = getLocalizationService();
  const [locale, setLocaleState] = React.useState<SupportedLocale>(service.getLocale());
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const setLocale = React.useCallback(
    (newLocale: SupportedLocale) => {
      service.setLocale(newLocale);
      setLocaleState(newLocale);
      forceUpdate();
      window.dispatchEvent(new Event("locale-change"));
    },
    [service]
  );

  const t = React.useCallback(
    (key: string, fallback?: string) => service.t(key, fallback),
    [service]
  );

  const value = React.useMemo(
    () => ({
      locale,
      setLocale,
      t,
      translations: service.getTranslations(),
    }),
    [locale, setLocale, t, service]
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalizationContext(): LocalizationContextValue {
  const context = React.useContext(LocalizationContext);
  if (!context) {
    const service = getLocalizationService();
    return {
      locale: service.getLocale(),
      setLocale: (l) => service.setLocale(l),
      t: (key, fallback) => service.t(key, fallback),
      translations: service.getTranslations(),
    };
  }
  return context;
}
