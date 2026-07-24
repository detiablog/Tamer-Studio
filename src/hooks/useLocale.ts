"use client";

import * as React from "react";
import { getLocalizationService } from "@/lib/localization";
import { type SupportedLocale } from "@/lib/localization/types";

export function useLocale() {
  const service = getLocalizationService();
  const [locale, setLocale] = React.useState<SupportedLocale>(service.getLocale());
  const [country, setCountry] = React.useState<string | null>(service.getCountry());
  const [timezone, setTimezone] = React.useState<string | null>(service.getTimezone());
  const [autoDetect, setAutoDetect] = React.useState(service.getAutoDetect());

  const updateLocale = React.useCallback(
    (newLocale: SupportedLocale) => {
      service.setLocale(newLocale);
      setLocale(newLocale);
      window.dispatchEvent(new Event("locale-change"));
    },
    [service]
  );

  return {
    locale,
    setLocale: updateLocale,
    country,
    setCountry,
    timezone,
    setTimezone,
    autoDetect,
    setAutoDetect,
  };
}
