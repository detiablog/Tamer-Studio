"use client";

import * as React from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useLocalizationContext } from "@/providers/localization";

export function LandingKeyboardShortcuts() {
  const { t } = useLocalizationContext();
  useKeyboardShortcuts([
    {
      key: "p",
      action: () => {
        const el = document.getElementById("pricing");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
      description: t("landing.shortcuts.scrollToPricing", "Scroll to pricing"),
    },
    {
      key: "f",
      action: () => {
        const el = document.getElementById("features");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
      description: t("landing.shortcuts.scrollToFeatures", "Scroll to features"),
    },
    {
      key: "c",
      action: () => {
        const el = document.getElementById("contact");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
      description: t("landing.shortcuts.scrollToContact", "Scroll to contact"),
    },
    {
      key: "h",
      action: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      description: t("landing.shortcuts.scrollToHome", "Scroll to home"),
    },
    {
      key: "r",
      action: () => {
        window.location.href = "/register";
      },
      description: t("landing.shortcuts.goToRegister", "Go to register"),
    },
    {
      key: "l",
      action: () => {
        window.location.href = "/login";
      },
      description: t("landing.shortcuts.goToLogin", "Go to login"),
    },
  ]);

  return null;
}
