"use client";

import * as React from "react";

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "success" | "warning" | "info" | "muted" }) {
  const cls = {
    default: "bg-muted text-foreground",
    success: "bg-green-600 text-white",
    warning: "bg-amber-500 text-black",
    info: "bg-sky-500 text-white",
    muted: "bg-muted/60 text-muted-foreground",
  }[tone];

  return <span className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}
