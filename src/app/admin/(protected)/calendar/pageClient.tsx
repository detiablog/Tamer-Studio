"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { StatCard } from "@/components/ui/StatCard";
import {
  CalendarDays,
  FileText,
  BarChart3,
  Loader,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Search,
  Activity,
  TrendingUp,
  Clock,
  Users,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch(() => ({ data: [] }));

type AdminTab = "templates" | "analytics";

type EventTemplate = {
  id: string;
  name: string;
  type: string;
  defaultDuration: string;
  uses: number;
  lastUsed: string;
};

export function CalendarAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<AdminTab>("templates");
  const [search, setSearch] = React.useState("");

  const { data: templatesData, isLoading: templatesLoading, mutate: mutateTemplates } = useSWR("/api/calendar/admin/templates", fetcher);
  const { data: analyticsData, isLoading: analyticsLoading } = useSWR("/api/calendar/admin/analytics", fetcher);

  const templates: EventTemplate[] = templatesData?.data ?? [];
  const analytics = analyticsData?.data ?? { totalEvents: 0, totalTasks: 0, activeUsers: 0, avgEventsPerDay: 0, eventsByType: [], recentActivity: [] };

  const filteredTemplates = React.useMemo(() => {
    return templates.filter((tpl) => {
      return !search || tpl.name.toLowerCase().includes(search.toLowerCase());
    });
  }, [templates, search]);

  const handleDeleteTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/calendar/admin/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success"));
        mutateTemplates();
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const tabs = [
    { id: "templates" as AdminTab, label: t("admin.templates"), icon: FileText },
    { id: "analytics" as AdminTab, label: t("admin.analytics.label"), icon: BarChart3 },
  ];

  const renderTemplates = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.searchTemplates", "Search templates...")}
            className="pl-9"
          />
        </div>
        <Button size="sm">
          <Plus className="mr-1 size-4" />
          {t("admin.createTemplate", "Create Template")}
        </Button>
      </div>

      <DashboardCard title={t("admin.templates")}>
        {templatesLoading ? (
          <div className="flex items-center justify-center p-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <FileText className="mb-3 size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t("admin.noTemplates", "No templates found")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.name")}</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("contentCalendar.eventType")}</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.duration", "Duration")}</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.uses", "Uses")}</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.lastUsed", "Last Used")}</th>
                  <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((tpl) => (
                  <tr key={tpl.id} className="border-b border-border hover:bg-muted/30">
                    <td className="py-3 px-2 font-medium">{tpl.name}</td>
                    <td className="py-3 px-2"><Badge tone="info">{tpl.type}</Badge></td>
                    <td className="py-3 px-2 text-muted-foreground">{tpl.defaultDuration}</td>
                    <td className="py-3 px-2 text-muted-foreground">{tpl.uses}</td>
                    <td className="py-3 px-2 text-muted-foreground">{tpl.lastUsed || "—"}</td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="icon-sm">
                          <Edit3 className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm">
                          <Copy className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteTemplate(tpl.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("contentCalendar.totalEvents")} value={analytics.totalEvents} />
        <StatCard title={t("contentCalendar.upcomingTasks")} value={analytics.totalTasks} />
        <StatCard title={t("admin.activeUsers", "Active Users")} value={analytics.activeUsers} />
        <StatCard title={t("admin.avgEventsPerDay", "Avg Events/Day")} value={analytics.avgEventsPerDay} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title={t("admin.eventsByType", "Events by Type")}>
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-8"><Loader className="size-5 animate-spin text-muted-foreground" /></div>
          ) : (analytics.eventsByType || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <BarChart3 className="mb-2 size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(analytics.eventsByType || []).map((item: any) => (
                <div key={item.type} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <Badge tone="info">{item.type}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{item.count}</span>
                    <div className="w-20">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${(item.count / analytics.totalEvents) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title={t("admin.recentActivity", "Recent Activity")}>
          {analyticsLoading ? (
            <div className="flex items-center justify-center py-8"><Loader className="size-5 animate-spin text-muted-foreground" /></div>
          ) : (analytics.recentActivity || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="mb-2 size-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">{t("common.noData")}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {(analytics.recentActivity || []).slice(0, 10).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex items-center gap-3">
                    <Activity className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{item.title || item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.user || "—"}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.time || item.timestamp || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("contentCalendar.title") }]} />

      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("contentCalendar.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.calendarDescription", "Manage calendar templates and view usage analytics")}</p>
        </div>
      </DashboardCard>

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "templates" && renderTemplates()}
      {activeTab === "analytics" && renderAnalytics()}
    </div>
  );
}
