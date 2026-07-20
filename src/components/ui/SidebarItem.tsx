"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type SidebarItemProps = {
  icon?: LucideIcon;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  shortcut?: string;
  disabled?: boolean;
};

export function SidebarItem({
  icon: IconComp,
  label,
  href = "#",
  active = false,
  onClick,
  shortcut,
  disabled = false,
}: SidebarItemProps) {
  const content = (
    <span className="flex items-center gap-3">
      {IconComp ? <IconComp className="size-5 shrink-0" aria-hidden="true" /> : null}
      <span className="truncate">{label}</span>
      {shortcut ? <kbd className="ml-auto text-[10px] text-muted-foreground/70 border border-border/60 rounded px-1 py-0.5">{shortcut}</kbd> : null}
    </span>
  );

  const className = cn(
    "group/item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
    active
      ? "bg-[color-mix(in_oklch,var(--sidebar-primary),var(--sidebar)_8%)] text-[color-mix(in_oklch,var(--sidebar-primary-foreground),var(--sidebar-foreground)_90%)] shadow-sm"
      : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
    disabled && "opacity-50 pointer-events-none"
  );

  if (href && href !== "#") {
    return (
      <a href={href} onClick={onClick} className={className} aria-current={active ? "page" : undefined}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {content}
    </button>
  );
}
