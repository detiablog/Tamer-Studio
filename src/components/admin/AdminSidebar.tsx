"use client";

import * as React from "react"
import { SidebarItem } from "@/components/ui/SidebarItem"
import { useAdminPermissions } from "@/components/auth/use-admin-permissions"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Building2,
  Workflow,
  Cpu,
  Rocket,
  BarChart3,
  CreditCard,
  Ticket,
  LineChart,
  ScrollText,
  Flag,
  Settings,
  RefreshCw,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { useLocalizationContext } from "@/providers/localization"

type AdminSidebarProps = {
  pathname?: string;
  collapsed: boolean;
  onToggle: () => void;
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

export function AdminSidebar({ pathname, collapsed, onToggle }: AdminSidebarProps) {
  const currentPath = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const { hasPermission, mounted, isAdmin } = useAdminPermissions();
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
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">TS</div>
            {!collapsed && <span className="font-heading text-sm font-semibold">Tamer Studio</span>}
          </div>
          {collapsed ? (
            <PanelLeft className="size-4 text-muted-foreground" />
          ) : (
            <PanelLeftClose className="size-4 text-muted-foreground" />
          )}
        </button>

        {!collapsed && (
          <div className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{t("admin.dashboard")}</div>
        )}

        {collapsed ? (
          <SidebarTooltip label={t("admin.dashboard")}>
            <SidebarItem icon={LayoutDashboard} label="" href="/admin" active={isActive("/admin")} />
          </SidebarTooltip>
        ) : (
          <SidebarItem icon={LayoutDashboard} label={t("admin.dashboard")} href="/admin" active={isActive("/admin")} />
        )}

        {mounted ? (
          <>
            {hasPermission("admin:users") && (collapsed ? (
              <SidebarTooltip label={t("admin.users")}>
                <SidebarItem icon={Users} label="" href="/admin/users" active={isActive("/admin/users")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={Users} label={t("admin.users")} href="/admin/users" active={isActive("/admin/users")} />
            ))}
            {hasPermission("admin:organizations") && (collapsed ? (
              <SidebarTooltip label={t("admin.organizations")}>
                <SidebarItem icon={Building2} label="" href="/admin/organizations" active={isActive("/admin/organizations")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={Building2} label={t("admin.organizations")} href="/admin/organizations" active={isActive("/admin/organizations")} />
            ))}
            {hasPermission("admin:workspaces") && (collapsed ? (
              <SidebarTooltip label={t("admin.workspaces")}>
                <SidebarItem icon={Workflow} label="" href="/admin/workspaces" active={isActive("/admin/workspaces")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={Workflow} label={t("admin.workspaces")} href="/admin/workspaces" active={isActive("/admin/workspaces")} />
            ))}
            {hasPermission("admin:ai_providers") && (collapsed ? (
              <SidebarTooltip label={t("admin.aiProviders")}>
                <SidebarItem icon={Cpu} label="" href="/admin/ai-providers" active={isActive("/admin/ai-providers")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={Cpu} label={t("admin.aiProviders")} href="/admin/ai-providers" active={isActive("/admin/ai-providers")} />
            ))}
            {hasPermission("admin:jobs") && (collapsed ? (
              <SidebarTooltip label={t("admin.jobs")}>
                <SidebarItem icon={Rocket} label="" href="/admin/jobs" active={isActive("/admin/jobs")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={Rocket} label={t("admin.jobs")} href="/admin/jobs" active={isActive("/admin/jobs")} />
            ))}
            {hasPermission("admin:queues") && (collapsed ? (
              <SidebarTooltip label={t("admin.queues")}>
                <SidebarItem icon={BarChart3} label="" href="/admin/queues" active={isActive("/admin/queues")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={BarChart3} label={t("admin.queues")} href="/admin/queues" active={isActive("/admin/queues")} />
            ))}
            {hasPermission("admin:billing") && (collapsed ? (
              <SidebarTooltip label={t("admin.billing")}>
                <SidebarItem icon={CreditCard} label="" href="/admin/billing" active={isActive("/admin/billing")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={CreditCard} label={t("admin.billing")} href="/admin/billing" active={isActive("/admin/billing")} />
            ))}
            {hasPermission("admin:subscriptions") && (collapsed ? (
              <SidebarTooltip label={t("admin.subscriptions")}>
                <SidebarItem icon={Ticket} label="" href="/admin/subscriptions" active={isActive("/admin/subscriptions")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={Ticket} label={t("admin.subscriptions")} href="/admin/subscriptions" active={isActive("/admin/subscriptions")} />
            ))}
            {hasPermission("admin:coupons") && (collapsed ? (
              <SidebarTooltip label={t("admin.coupons")}>
                <SidebarItem icon={Ticket} label="" href="/admin/coupons" active={isActive("/admin/coupons")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={Ticket} label={t("admin.coupons")} href="/admin/coupons" active={isActive("/admin/coupons")} />
            ))}

            {!collapsed && (
              <div className="mt-6 mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{t("admin.analytics")}</div>
            )}
            {hasPermission("admin:analytics") && (collapsed ? (
              <SidebarTooltip label={t("admin.analytics")}>
                <SidebarItem icon={LineChart} label="" href="/admin/analytics" active={isActive("/admin/analytics")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={LineChart} label={t("admin.analytics")} href="/admin/analytics" active={isActive("/admin/analytics")} />
            ))}
            {hasPermission("admin:audit_logs") && (collapsed ? (
              <SidebarTooltip label={t("admin.auditLogs")}>
                <SidebarItem icon={ScrollText} label="" href="/admin/audit-logs" active={isActive("/admin/audit-logs")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={ScrollText} label={t("admin.auditLogs")} href="/admin/audit-logs" active={isActive("/admin/audit-logs")} />
            ))}
            {hasPermission("admin:feature_flags") && (collapsed ? (
              <SidebarTooltip label={t("admin.featureFlags")}>
                <SidebarItem icon={Flag} label="" href="/admin/feature-flags" active={isActive("/admin/feature-flags")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={Flag} label={t("admin.featureFlags")} href="/admin/feature-flags" active={isActive("/admin/feature-flags")} />
            ))}

            {!collapsed && (
              <div className="mt-6 mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{t("admin.settings")}</div>
            )}
            {hasPermission("admin:system") && (collapsed ? (
              <SidebarTooltip label={t("admin.settings")}>
                <SidebarItem icon={Settings} label="" href="/admin/settings" active={isActive("/admin/settings")} />
              </SidebarTooltip>
            ) : (
              <SidebarItem icon={Settings} label={t("admin.settings")} href="/admin/settings" active={isActive("/admin/settings")} />
            ))}
          </>
        ) : (
          <div className={cn("flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground", collapsed && "justify-center")}>
            <RefreshCw className="h-3 w-3 animate-spin" />
            {!collapsed && "Loading permissions..."}
          </div>
        )}

        {!collapsed && mounted && (
          <div className="mt-6 pt-4 border-t border-border/50 text-[10px] text-muted-foreground/60 px-2">
            <p>Status: {isAdmin ? "✓ Admin" : "✗ Not Admin"}</p>
            <p>Refresh: {forceRefresh}</p>
          </div>
        )}
      </nav>
    </aside>
  )
}