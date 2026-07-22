"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarItem } from "./SidebarItem";
import { cn } from "@/lib/utils";
import {
  Home,
  Grid,
  Folder,
  ImageIcon,
  Film,
  Settings,
  FileText,
  Cpu,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
} from "lucide-react";

export function Sidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard", shortcut: "⌘D" },
    { icon: Grid, label: "Workspace", href: "/workspace", shortcut: "⌘W" },
    { icon: Folder, label: "Projects", href: "/projects", shortcut: "⌘P" },
    { icon: ImageIcon, label: "Media", href: "/media", shortcut: "⌘M" },
    { icon: Film, label: "Production", href: "/production", shortcut: "⌘R" },
    { icon: Cpu, label: "AI Platform", href: "/ai", shortcut: "⌘A" },
    { icon: FileText, label: "Publishing", href: "/publishing", shortcut: "⌘U" },
    { icon: Settings, label: "Settings", href: "/settings", shortcut: "⌘S" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 sm:hidden"
          onClick={() => setIsCollapsed(true)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-sidebar transition-all duration-300 ease-in-out sm:relative sm:translate-x-0",
          isCollapsed ? "w-[72px] -translate-x-full sm:translate-x-0 sm:w-[72px]" : "w-72 translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b px-3">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                TS
              </div>
              <span className="font-heading text-sm font-semibold">Tamer Studio</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted/40 transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeft className="size-4" /> : <PanelLeftClose className="size-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {isCollapsed ? "" : "Main"}
          </div>
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                icon={item.icon}
                label={isCollapsed ? "" : item.label}
                href={item.href}
                active={isActive(item.href)}
                shortcut={isCollapsed ? undefined : item.shortcut}
              />
            ))}
          </div>

          <div className="mt-6 mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {isCollapsed ? "" : "Manage"}
          </div>
          <div className="flex flex-col gap-1">
            <SidebarItem
              icon={Settings}
              label={isCollapsed ? "" : "Settings"}
              href="/settings"
              active={isActive("/settings")}
              shortcut={isCollapsed ? undefined : "⌘S"}
            />
          </div>
        </nav>

        {/* Collapse toggle for desktop */}
        {isCollapsed && (
          <div className="border-t p-3">
            <button
              onClick={() => setIsCollapsed(false)}
              className="flex w-full items-center justify-center rounded-lg p-2 hover:bg-muted/40 transition-colors focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="size-4 rotate-180" />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
