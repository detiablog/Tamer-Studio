import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { TrendingUp, BarChart3 } from "lucide-react";

const METRICS = [
  { label: "Page Views", value: "45.2K", change: "+12%", period: "vs last week" },
  { label: "Active Users", value: "892", change: "+5.2%", period: "vs last week" },
  { label: "Avg. Session", value: "4m 32s", change: "+8.1%", period: "vs last week" },
  { label: "Bounce Rate", value: "32.4%", change: "-2.4%", period: "vs last week" },
];

const TOP_PAGES = [
  { path: "/dashboard", views: "12.4K", unique: "8.2K", bounce: "28%" },
  { path: "/projects", views: "8.1K", unique: "5.4K", bounce: "35%" },
  { path: "/ai", views: "6.3K", unique: "4.1K", bounce: "22%" },
  { path: "/media", views: "4.2K", unique: "2.8K", bounce: "41%" },
  { path: "/production", views: "3.1K", unique: "2.1K", bounce: "38%" },
];

export default function AdminAnalyticsPage() {
  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric) => (
            <StatCard
              key={metric.label}
              title={metric.label}
              value={metric.value}
              delta={
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="size-3" />
                  {metric.change} {metric.period}
                </span>
              }
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardCard title="Top Pages" description="Most visited pages this week">
            <AdminDataTable
              data={TOP_PAGES}
              keyExtractor={(p) => p.path}
              columns={[
                { key: "path", header: "Page", render: (p: typeof TOP_PAGES[0]) => (
                  <span className="font-mono text-xs">{p.path}</span>
                )},
                { key: "views", header: "Views", align: "right" },
                { key: "unique", header: "Unique", align: "right" },
                { key: "bounce", header: "Bounce Rate", align: "right" },
              ]}
            />
          </DashboardCard>

          <DashboardCard title="User Engagement" description="How users interact with the platform">
            <div className="space-y-4">
              {[
                { label: "Projects Created", value: "1,240", change: "+12%" },
                { label: "Media Uploaded", value: "8,432", change: "+24%" },
                { label: "AI Generations", value: "15,678", change: "+18%" },
                { label: "Publishing Jobs", value: "342", change: "+5%" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                  <div>
                    <p className="text-sm font-medium">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{stat.value}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">{stat.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        <DashboardCard title="Retention">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/20 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="size-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">7-day retention rate</p>
              <p className="text-2xl font-semibold">68.4%</p>
              <p className="text-xs text-green-600 dark:text-green-400">+3.2% vs last month</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </RoleGuard>
  );
}
