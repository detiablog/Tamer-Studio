"use client";

import * as React from "react";
import { getLocalizationService } from "@/lib/localization";
import type { SupportedLocale } from "@/lib/localization/types";

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

  React.useEffect(() => {
    const saved = service.getLocale();
    if (saved !== "en") {
      setLocaleState(saved);
      return;
    }

    if (typeof window !== "undefined") {
      const cookieLocale = document.cookie
        .split("; ")
        .find((row) => row.startsWith("tamer_locale="))
        ?.split("=")[1];

      if (cookieLocale && ["en", "id", "ja", "fr", "de"].includes(cookieLocale)) {
        service.setLocale(cookieLocale as SupportedLocale);
        setLocaleState(cookieLocale as SupportedLocale);
        return;
      }

      const browserLang = (navigator.languages?.[0] || navigator.language || "en").split("-")[0];
      const supported = ["en", "id", "ja", "fr", "de"] as SupportedLocale[];
      if (supported.includes(browserLang as SupportedLocale)) {
        service.setLocale(browserLang as SupportedLocale);
        setLocaleState(browserLang as SupportedLocale);
        document.cookie = `tamer_locale=${browserLang};path=/;max-age=${60 * 60 * 24 * 365}`;
      }
    }
  }, [service]);

  const setLocale = React.useCallback(
    (newLocale: SupportedLocale) => {
      service.setLocale(newLocale);
      setLocaleState(newLocale);
      forceUpdate();
      if (typeof window !== "undefined") {
        document.cookie = `tamer_locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
      }
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
