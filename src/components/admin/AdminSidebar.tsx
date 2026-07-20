import * as React from "react";
import { SidebarItem } from "@/components/ui/SidebarItem";
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
} from "lucide-react";

type AdminSidebarProps = {
  pathname?: string;
};

export function AdminSidebar({ pathname }: AdminSidebarProps) {
  const currentPath = pathname ?? typeof window !== "undefined" ? window.location.pathname : "";

  const isActive = (href: string) => {
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  return (
    <aside className="w-72 shrink-0 px-3 py-4">
      <nav className="flex flex-col gap-1">
        <div className="mb-2 px-2 text-xs uppercase tracking-wide text-muted-foreground">Admin</div>
        <SidebarItem icon={LayoutDashboard} label="Dashboard" href="/admin" active={isActive("/admin")} />
        <SidebarItem icon={Users} label="Users" href="/admin/users" active={isActive("/admin/users")} />
        <SidebarItem icon={Building2} label="Organizations" href="/admin/organizations" active={isActive("/admin/organizations")} />
        <SidebarItem icon={Workflow} label="Workspaces" href="/admin/workspaces" active={isActive("/admin/workspaces")} />
        <SidebarItem icon={Cpu} label="AI Providers" href="/admin/ai-providers" active={isActive("/admin/ai-providers")} />
        <SidebarItem icon={Rocket} label="Jobs" href="/admin/jobs" active={isActive("/admin/jobs")} />
        <SidebarItem icon={BarChart3} label="Queues" href="/admin/queues" active={isActive("/admin/queues")} />
        <SidebarItem icon={CreditCard} label="Billing" href="/admin/billing" active={isActive("/admin/billing")} />
        <SidebarItem icon={Ticket} label="Subscriptions" href="/admin/subscriptions" active={isActive("/admin/subscriptions")} />
        <SidebarItem icon={Ticket} label="Coupons" href="/admin/coupons" active={isActive("/admin/coupons")} />
        <div className="mt-3 mb-2 px-2 text-xs uppercase tracking-wide text-muted-foreground">Insights</div>
        <SidebarItem icon={LineChart} label="Analytics" href="/admin/analytics" active={isActive("/admin/analytics")} />
        <SidebarItem icon={ScrollText} label="Audit Logs" href="/admin/audit-logs" active={isActive("/admin/audit-logs")} />
        <SidebarItem icon={Flag} label="Feature Flags" href="/admin/feature-flags" active={isActive("/admin/feature-flags")} />
        <div className="mt-3 mb-2 px-2 text-xs uppercase tracking-wide text-muted-foreground">System</div>
        <SidebarItem icon={Settings} label="Settings" href="/admin/settings" active={isActive("/admin/settings")} />
      </nav>
    </aside>
  );
}
