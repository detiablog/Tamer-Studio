"use client";

import * as React from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export function LandingKeyboardShortcuts() {
  useKeyboardShortcuts([
    {
      key: "p",
      action: () => {
        const el = document.getElementById("pricing");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
      description: "Scroll to pricing",
    },
  ]);

  return null;
}