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
    {
      key: "f",
      action: () => {
        const el = document.getElementById("features");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
      description: "Scroll to features",
    },
    {
      key: "c",
      action: () => {
        const el = document.getElementById("contact");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
      description: "Scroll to contact",
    },
    {
      key: "h",
      action: () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      description: "Scroll to home",
    },
    {
      key: "r",
      action: () => {
        window.location.href = "/register";
      },
      description: "Go to register",
    },
    {
      key: "l",
      action: () => {
        window.location.href = "/login";
      },
      description: "Go to login",
    },
  ]);

  return null;
}
