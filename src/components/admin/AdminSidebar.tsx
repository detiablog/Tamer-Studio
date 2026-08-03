"use client";

import * as React from "react"
import { SidebarItem } from "@/components/ui/SidebarItem"
import { useAdminPermissions } from "@/components/auth/use-admin-permissions"
import { cn } from "@/lib/utils"
import {
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  ScrollText,
  Key,
  Brain,
  Briefcase,
  ListTodo,
  Mail,
  FileText,
  Flag,
  Settings,
  UserCog,
  Shield,
  Layout,
  DollarSign,
  Activity,
  Megaphone,
  Ticket,
  Cpu,
  Gauge,
  GitBranch,
  Database,
  Share2,
  HardDrive,
  FileBarChart,
  Rocket,
  Image,
  Video,
  Film,
  Bot,
  BookOpen,
  CalendarDays,
  TrendingUp,
  Target,
  Stethoscope,
  Lightbulb,
} from "lucide-react"
import { useLocalizationContext } from "@/providers/localization"

type AdminSidebarProps = {
  pathname?: string;
  collapsed: boolean;
  onToggle: () => void;
};

interface SidebarNavItem {
  id: string;
  labelKey: string;
  label: string;
  icon: any;
  href: string;
  group: string;
  permission?: string;
}

const ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  { id: "dashboard", labelKey: "admin.dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/admin", group: "dashboard", permission: "admin:read" },
  { id: "users", labelKey: "admin.users", label: "Users", icon: Users, href: "/admin/users", group: "management", permission: "admin:users" },
  { id: "workspaces", labelKey: "admin.workspaces", label: "Workspaces", icon: Briefcase, href: "/admin/workspaces", group: "management", permission: "admin:workspaces" },
  { id: "workflows", labelKey: "admin.workflows", label: "Workflows", icon: GitBranch, href: "/admin/workflows", group: "management", permission: "admin:workflows" },
  { id: "assets-admin", labelKey: "admin.assets", label: "Assets", icon: Database, href: "/admin/assets", group: "management" },
  { id: "storage-admin", labelKey: "admin.storage", label: "Storage", icon: HardDrive, href: "/admin/storage", group: "management" },
  { id: "subscriptions", labelKey: "admin.subscriptions", label: "Subscriptions", icon: DollarSign, href: "/admin/subscriptions", group: "management", permission: "admin:subscriptions" },
  { id: "payments", labelKey: "admin.payments", label: "Payments", icon: CreditCard, href: "/admin/payments", group: "management", permission: "admin:billing" },
  { id: "invoices", labelKey: "admin.invoices", label: "Invoices", icon: FileText, href: "/admin/payments/invoices", group: "management", permission: "admin:billing" },
  { id: "pricing", labelKey: "admin.pricing", label: "Pricing", icon: DollarSign, href: "/admin/pricing", group: "management", permission: "admin:pricing" },
  { id: "profile", labelKey: "admin.profile", label: "Profile", icon: UserCog, href: "/admin/profile", group: "management" },
  { id: "optimizer-admin", labelKey: "admin.optimizer", label: "Optimizer", icon: Target, href: "/admin/optimizer", group: "analytics" },
  { id: "memory-admin", labelKey: "admin.memory", label: "Memory", icon: Brain, href: "/admin/memory", group: "analytics" },
  { id: "analytics", labelKey: "admin.analytics", label: "Analytics", icon: BarChart3, href: "/admin/analytics", group: "analytics", permission: "admin:analytics" },
  { id: "performance", labelKey: "admin.performance", label: "Performance", icon: Gauge, href: "/admin/performance", group: "analytics" },
  { id: "reports", labelKey: "admin.reports", label: "Reports", icon: FileBarChart, href: "/admin/reports", group: "analytics" },
  { id: "audit-logs", labelKey: "admin.auditLogs", label: "Audit Logs", icon: ScrollText, href: "/admin/audit-logs", group: "analytics", permission: "admin:audit_logs" },
  { id: "email-dashboard", labelKey: "email.dashboard", label: "Dashboard", icon: Activity, href: "/admin/email/dashboard", group: "analytics", permission: "admin:email" },
  { id: "email", labelKey: "admin.email", label: "Email", icon: Mail, href: "/admin/email", group: "analytics", permission: "admin:email" },
  { id: "billing", labelKey: "admin.billing", label: "Billing", icon: CreditCard, href: "/admin/billing", group: "settings", permission: "admin:billing" },
  { id: "coupons", labelKey: "admin.coupons", label: "Coupons", icon: FileText, href: "/admin/coupons", group: "settings", permission: "admin:coupons" },
  { id: "feature-flags", labelKey: "admin.featureFlags", label: "Feature Flags", icon: Flag, href: "/admin/feature-flags", group: "settings", permission: "admin:feature_flags" },
  { id: "api-keys", labelKey: "admin.apiKeys", label: "API Keys", icon: Key, href: "/admin/api-keys", group: "settings", permission: "admin:ai_providers" },
  { id: "ai-providers", labelKey: "admin.aiProviders", label: "AI Providers", icon: Brain, href: "/admin/ai-providers", group: "settings", permission: "admin:ai_providers" },
  { id: "ai-admin", labelKey: "admin.aiAdmin", label: "AI Admin", icon: Brain, href: "/admin/ai", group: "settings", permission: "admin:ai_providers" },
  { id: "prompts-admin", labelKey: "admin.prompts", label: "Prompt Intelligence", icon: Brain, href: "/admin/prompts", group: "analytics" },
  { id: "ai-runtime", labelKey: "admin.aiRuntime.title", label: "AI Runtime", icon: Cpu, href: "/admin/ai-runtime", group: "analytics" },
  { id: "ai-image", labelKey: "admin.aiImage", label: "AI Image", icon: Image, href: "/admin/ai-image", group: "analytics" },
  { id: "ai-video", labelKey: "admin.aiVideo", label: "AI Video", icon: Video, href: "/admin/ai-video", group: "analytics" },
  { id: "monitor", labelKey: "admin.monitor", label: "Monitor", icon: Activity, href: "/admin/monitor", group: "analytics" },
  { id: "hypercare", labelKey: "hypercare.title", label: "Hypercare", icon: Stethoscope, href: "/admin/hypercare", group: "analytics" },
  { id: "product-intelligence", labelKey: "pi.title", label: "Product Intelligence", icon: Lightbulb, href: "/admin/product-intelligence", group: "analytics" },
  { id: "affiliate-studio", labelKey: "admin.affiliateStudio", label: "Affiliate Studio", icon: Megaphone, href: "/admin/affiliate-studio", group: "analytics" },
  { id: "drama", labelKey: "admin.drama", label: "AI Drama", icon: Film, href: "/admin/drama", group: "analytics" },
  { id: "story-admin", labelKey: "admin.story", label: "Story Engine", icon: BookOpen, href: "/admin/story", group: "analytics" },
  { id: "calendar-admin", labelKey: "admin.calendar", label: "Calendar", icon: CalendarDays, href: "/admin/calendar", group: "analytics" },
  { id: "trends-admin", labelKey: "admin.trends", label: "Trends", icon: TrendingUp, href: "/admin/trends", group: "analytics" },
  { id: "agents-admin", labelKey: "admin.agents", label: "Agents", icon: Bot, href: "/admin/agents", group: "analytics" },
  { id: "jobs", labelKey: "admin.jobs", label: "Jobs", icon: Briefcase, href: "/admin/jobs", group: "settings", permission: "admin:jobs" },
  { id: "queues", labelKey: "admin.queues", label: "Queues", icon: ListTodo, href: "/admin/queues", group: "settings", permission: "admin:queues" },
  { id: "landing-builder", labelKey: "admin.landingBuilder", label: "Landing Builder", icon: Layout, href: "/admin/landing-builder", group: "settings", permission: "admin:landing_builder" },
  { id: "campaigns", labelKey: "admin.campaigns", label: "Campaigns", icon: Megaphone, href: "/admin/campaigns", group: "marketing" },
  { id: "campaigns-coupons", labelKey: "admin.coupons", label: "Coupons", icon: Ticket, href: "/admin/campaigns/coupons", group: "marketing", permission: "admin:coupons" },
  { id: "publishing-admin", labelKey: "admin.publishing", label: "Publishing", icon: Share2, href: "/admin/publishing", group: "management" },
  { id: "settings", labelKey: "admin.settings", label: "Settings", icon: Settings, href: "/admin/settings", group: "settings", permission: "admin:system" },
  { id: "security", labelKey: "admin.security", label: "Security", icon: Shield, href: "/admin/security", group: "settings", permission: "admin:system" },
  { id: "devops", labelKey: "admin.devops", label: "DevOps", icon: Rocket, href: "/admin/devops", group: "settings", permission: "admin:system" },
];

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

function renderItem(item: SidebarNavItem, collapsed: boolean, isActive: (href: string) => boolean, t: (key: string) => string) {
  const IconComp = item.icon;
  const label = t(item.labelKey) || item.label;
  const active = isActive(item.href);

  if (collapsed) {
    return (
      <SidebarTooltip key={item.id} label={label}>
        <SidebarItem icon={IconComp} label="" href={item.href} active={active} />
      </SidebarTooltip>
    );
  }

  return (
    <SidebarItem key={item.id} icon={IconComp} label={label} href={item.href} active={active} />
  );
}

const adminGroupLabels: Record<string, string> = {
  dashboard: "admin.dashboard",
  management: "admin.management",
  analytics: "admin.analytics.label",
  marketing: "admin.marketing",
  settings: "admin.settings",
};

const groupOrder = ["dashboard", "management", "analytics", "marketing", "settings"];

export function AdminSidebar({ pathname, collapsed, onToggle }: AdminSidebarProps) {
  const currentPath = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const { mounted, hasPermission } = useAdminPermissions();
  const { t } = useLocalizationContext();

  const isActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  const visibleItems = React.useMemo(() => {
    if (!mounted) return ADMIN_NAV_ITEMS;
    return ADMIN_NAV_ITEMS.filter((item) => {
      if (!item.permission) return true;
      return hasPermission(item.permission);
    });
  }, [mounted, hasPermission]);

  const grouped = React.useMemo(() => {
    const groups: Record<string, SidebarNavItem[]> = {};
    for (const item of visibleItems) {
      const group = item.group ?? "default";
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    }
    return groups;
  }, [visibleItems]);

  return (
    <aside className={cn("w-full shrink-0 py-4 transition-all duration-300 ease-in-out", collapsed ? "px-2" : "px-3")} role="navigation" aria-label={t("admin.sidebar.label", "Admin navigation")}>
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
      </nav>
    </aside>
  )
}
