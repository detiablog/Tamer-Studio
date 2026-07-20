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
};

export function SidebarItem({
  icon: IconComp,
  label,
  href = "#",
  active = false,
  onClick,
}: SidebarItemProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(
        "group/item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        active
          ? "bg-[color-mix(in_oklch,var(--sidebar-primary),var(--sidebar)_8%)] text-[color-mix(in_oklch,var(--sidebar-primary-foreground),var(--sidebar-foreground)_90%)] shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
      )}
      aria-current={active ? "page" : undefined}
    >
      {IconComp ? <IconComp className="size-5 opacity-90" /> : null}
      <span className="truncate">{label}</span>
    </a>
  );
}
