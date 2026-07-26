"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import type { SupportedLocale } from "@/lib/localization/types";
import { SUPPORTED_LOCALES } from "@/lib/localization/types";

const LANGUAGES: { code: SupportedLocale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocalizationContext();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === locale) ?? LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg px-2 py-1 text-sm hover:bg-muted/40 inline-flex items-center gap-1"
        aria-label={t("common.language", "Change language")}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Globe className="size-5" />
        <span className="hidden md:inline text-xs">{current.flag}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            className="absolute right-0 z-50 w-48 rounded-xl bg-card p-1.5 shadow-lg ring-1 ring-foreground/10 animate-in fade-in slide-in-from-top-2 duration-200"
            role="menu"
            aria-orientation="vertical"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                role="menuitem"
                onClick={() => {
                  setLocale(lang.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/40 ${
                  locale === lang.code ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                <span>{lang.flag}</span>
                <span className="flex-1 text-left">{lang.label}</span>
                {locale === lang.code && (
                  <svg className="size-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
