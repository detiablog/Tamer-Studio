"use client";

import * as React from "react"
import { SidebarItem } from "@/components/ui/SidebarItem"
import { useAdminPermissions } from "@/components/auth/use-admin-permissions"
import { cn } from "@/lib/utils"
import {
  PanelLeftClose,
  PanelLeft,
  RefreshCw,
} from "lucide-react"
import { useLocalizationContext } from "@/providers/localization"
import { getNavigationRuntime, resolveIcon } from "@/core/navigation"
import type { NavigationItem } from "@/core/navigation"

const runtime = getNavigationRuntime()

type AdminSidebarProps = {
  pathname?: string;
  collapsed: boolean;
  onToggle: () => void;
};

const adminGroupLabels: Record<string, string> = {
  dashboard: "admin.dashboard",
  management: "admin.dashboard",
  analytics: "admin.analytics.label",
  settings: "admin.settings",
};

function SidebarTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs shadow-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-border">
        {label}
      </div>
    </div>
  )
}

function renderItem(item: NavigationItem, collapsed: boolean, isActive: (href: string) => boolean, t: (key: string) => string) {
  const IconComp = resolveIcon(item.icon);
  const label = t(item.titleKey ?? item.title);
  const active = isActive(item.route);

  if (collapsed) {
    return (
      <SidebarTooltip key={item.id} label={label}>
        <SidebarItem icon={IconComp} label="" href={item.route} active={active} />
      </SidebarTooltip>
    );
  }

  return (
    <SidebarItem key={item.id} icon={IconComp} label={label} href={item.route} active={active} />
  );
}

export function AdminSidebar({ pathname, collapsed, onToggle }: AdminSidebarProps) {
  const currentPath = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const { hasPermission, mounted, isAdmin, permissions: userPermissions } = useAdminPermissions();
  const [forceRefresh, setForceRefresh] = React.useState(0);
  const { t } = useLocalizationContext();

  React.useEffect(() => {
    if (mounted) {
      setForceRefresh(prev => prev + 1);
    }
  }, [mounted]);

  const isActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  const allItems = runtime.getItemsByPosition("admin-sidebar");

  const visibleItems = React.useMemo(() => {
    if (!mounted) return [];
    return runtime.filterByPermissions(allItems, [...userPermissions]);
  }, [allItems, userPermissions, mounted]);

  const grouped = React.useMemo(() => {
    const groups: Record<string, NavigationItem[]> = {};
    for (const item of visibleItems) {
      const group = item.group ?? "default";
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    }
    return groups;
  }, [visibleItems]);

  const groupOrder = ["dashboard", "management", "analytics", "settings"];

  return (
    <aside className={cn("w-full shrink-0 py-4 transition-all duration-300 ease-in-out", collapsed ? "px-2" : "px-3")}>
      <nav className="flex flex-col gap-1">
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 hover:bg-muted/40",
            collapsed ? "justify-center w-full" : "justify-between"
          )}
          aria-expanded={!collapsed}
          aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">TS</div>
            {!collapsed && <span className="font-heading text-sm font-semibold">{t("topbar.brand")}</span>}
          </div>
          {collapsed ? (
            <PanelLeft className="size-4 text-muted-foreground" />
          ) : (
            <PanelLeftClose className="size-4 text-muted-foreground" />
          )}
        </button>

        {mounted ? (
          <>
            {groupOrder.map((groupKey) => {
              const items = grouped[groupKey];
              if (!items || items.length === 0) return null;
              return (
                <React.Fragment key={groupKey}>
                  {!collapsed && adminGroupLabels[groupKey] && (
                    <div className={cn(
                      "mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-[#9CA3AF] dark:text-muted-foreground/70",
                      groupKey !== "dashboard" && "mt-6"
                    )}>
                      {t(adminGroupLabels[groupKey])}
                    </div>
                  )}
                  {items.map((item) => renderItem(item, collapsed, isActive, (key) => t(key)))}
                </React.Fragment>
              );
            })}
          </>
        ) : (
          <div className={cn("flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground", collapsed && "justify-center")}>
            <RefreshCw className="h-3 w-3 animate-spin" />
            {!collapsed && t("admin.loadingPermissions")}
          </div>
        )}

        {!collapsed && mounted && (
          <div className="mt-6 pt-4 border-t border-border/50 text-[10px] text-muted-foreground/60 px-2">
            <p>{t("admin.statusLabel", "Status")}: {isAdmin ? t("admin.adminStatus") : t("admin.notAdminStatus")}</p>
            <p>{t("admin.refreshLabel", "Refresh")}: {forceRefresh}</p>
          </div>
        )}
      </nav>
    </aside>
  )
}
