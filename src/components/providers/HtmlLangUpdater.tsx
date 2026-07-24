"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";

export function HtmlLangUpdater() {
  const { locale } = useLocalizationContext();

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
