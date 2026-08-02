"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { useLocalizationContext } from "@/providers/localization";
import { Bot, BarChart3, FileText, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AgentsAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<"agents" | "templates" | "analytics">("agents");

  const { data: agentsData, isLoading } = useSWR("/api/agents", fetcher);
  const agents = agentsData?.data || [];

  const { data: templatesData } = useSWR("/api/agents/templates", fetcher);
  const templates = templatesData?.data || [];

  const { data: statsData } = useSWR("/api/agents/stats", fetcher);
  const stats = statsData?.data || {};

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.dashboard") }, { label: t("admin.agents") }]} />
      <PageHeader title={t("admin.agents")} description={t("admin.agentsDescription")} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Agents", value: stats.totalAgents || 0 },
          { label: "Total Tasks", value: stats.totalTasks || 0 },
          { label: "Total Runs", value: stats.totalRuns || 0 },
          { label: "Total Credits", value: stats.totalCreditsUsed || 0 },
        ].map((card) => (
          <DashboardCard key={card.label}>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </DashboardCard>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border">
        {[
          { key: "agents" as const, label: t("admin.agents"), icon: Bot },
          { key: "templates" as const, label: t("agents.marketplace"), icon: FileText },
          { key: "analytics" as const, label: t("admin.analytics"), icon: BarChart3 },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            <tab.icon className="size-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "agents" && (
        isLoading ? <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin" /></div> : (
          <div className="space-y-2">
            {agents.map((a: { id: string; name: string; type: string; status: string; userId: string }) => (
              <DashboardCard key={a.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="size-5 text-primary" />
                    <div><p className="font-medium">{a.name}</p><p className="text-xs text-muted-foreground">{a.type} · {a.userId}</p></div>
                  </div>
                  <Badge tone={a.status === "active" ? "default" : "muted"}>{a.status}</Badge>
                </div>
              </DashboardCard>
            ))}
          </div>
        )
      )}

      {activeTab === "templates" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl: { id: string; name: string; type?: string; role?: string }) => (
            <DashboardCard key={tpl.id}>
              <h4 className="font-medium">{tpl.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{tpl.type}</p>
            </DashboardCard>
          ))}
        </div>
      )}

      {activeTab === "analytics" && (
        <DashboardCard>
          <h3 className="font-heading font-semibold mb-4">Agent Usage Analytics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div><p className="text-sm text-muted-foreground">Total Runs</p><p className="text-xl font-bold">{stats.totalRuns || 0}</p></div>
            <div><p className="text-sm text-muted-foreground">Total Credits</p><p className="text-xl font-bold">{stats.totalCreditsUsed || 0}</p></div>
            <div><p className="text-sm text-muted-foreground">Total Tokens</p><p className="text-xl font-bold">{stats.totalTokensUsed || 0}</p></div>
          </div>
        </DashboardCard>
      )}
    </div>
  );
}
