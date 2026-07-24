"use client";

import * as React from "react";
import { getLocalizationService } from "@/lib/localization";
import { type SupportedLocale } from "@/lib/localization/types";

export function useLocalization() {
  const service = getLocalizationService();
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    const handler = () => forceUpdate();
    window.addEventListener("locale-change", handler);
    return () => window.removeEventListener("locale-change", handler);
  }, []);

  const t = React.useCallback(
    (key: string, fallback?: string) => service.t(key, fallback),
    [service]
  );

  const setLocale = React.useCallback(
    (locale: SupportedLocale) => {
      service.setLocale(locale);
      forceUpdate();
      window.dispatchEvent(new Event("locale-change"));
    },
    [service]
  );

  return {
    locale: service.getLocale(),
    setLocale,
    t,
    translations: service.getTranslations(),
  };
}
