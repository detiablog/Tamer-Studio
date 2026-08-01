"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Target,
  Gauge,
  Lightbulb,
  BarChart3,
  Plus,
  Search,
  RefreshCw,
  Loader,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

type TabKey = "scoring" | "recommendations" | "analytics";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "scoring", icon: Gauge },
  { key: "recommendations", icon: Lightbulb },
  { key: "analytics", icon: BarChart3 },
];

export function OptimizerAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("scoring");
  const [search, setSearch] = React.useState("");

  const { data: scoringData, isLoading: scoringLoading, mutate: mutateScoring } = useSWR(
    "/api/optimizer/admin/scoring-rules",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: recRulesData, isLoading: recRulesLoading, mutate: mutateRecRules } = useSWR(
    "/api/optimizer/admin/recommendation-rules",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: analyticsData, isLoading: analyticsLoading } = useSWR(
    "/api/optimizer/admin/analytics",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const scoringRules = scoringData?.success ? scoringData.data?.rules ?? [] : [];
  const recRules = recRulesData?.success ? recRulesData.data?.rules ?? [] : [];
  const analytics = analyticsData?.success ? analyticsData.data : null;

  const filteredScoring = React.useMemo(
    () => scoringRules.filter((r: any) => r.name?.toLowerCase().includes(search.toLowerCase())),
    [scoringRules, search]
  );

  const filteredRecRules = React.useMemo(
    () => recRules.filter((r: any) => r.name?.toLowerCase().includes(search.toLowerCase())),
    [recRules, search]
  );

  const handleDeleteScoringRule = async (id: string) => {
    try {
      const res = await fetch(`/api/optimizer/admin/scoring-rules/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Rule deleted"));
        mutateScoring();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleDeleteRecRule = async (id: string) => {
    try {
      const res = await fetch(`/api/optimizer/admin/recommendation-rules/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Rule deleted"));
        mutateRecRules();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const isLoading = scoringLoading || recRulesLoading || analyticsLoading;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("conversionOptimizer.title", "AI Conversion Optimizer") }]} />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("conversionOptimizer.title", "AI Conversion Optimizer")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("conversionOptimizer.description", "Optimize your content for better performance and conversions")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { mutateScoring(); mutateRecRules(); }}>
              <RefreshCw className="mr-2 size-4" />
              {t("common.refresh", "Refresh")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 mb-6">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {t(`conversionOptimizer.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
          </div>
        ) : (
          <>
            {activeTab === "scoring" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", "Search...")} className="pl-9" />
                  </div>
                  <Button size="sm">
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                <AdminDataTable
                  data={filteredScoring}
                  keyExtractor={(r) => r.id}
                  columns={[
                    { key: "name", header: t("common.name", "Name"), sortable: true, render: (item: any) => <span className="text-sm font-medium">{item.name}</span> },
                    { key: "weight", header: t("conversionOptimizer.priority", "Weight"), sortable: true, render: (item: any) => <span className="text-sm">{item.weight}</span> },
                    { key: "category", header: t("common.status", "Category"), sortable: true, render: (item: any) => <Badge tone="info">{item.category}</Badge> },
                    { key: "status", header: t("common.status", "Status"), sortable: true, render: (item: any) => <Badge tone={item.enabled ? "success" : "default"}>{item.enabled ? t("common.ok", "Enabled") : t("common.cancel", "Disabled")}</Badge> },
                    { key: "actions", header: t("common.actions", "Actions"), render: (item: any) => (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm"><Edit className="size-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteScoringRule(item.id)}><Trash2 className="size-3" /></Button>
                      </div>
                    )},
                  ]}
                />
              </div>
            )}

            {activeTab === "recommendations" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", "Search...")} className="pl-9" />
                  </div>
                  <Button size="sm">
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                <AdminDataTable
                  data={filteredRecRules}
                  keyExtractor={(r) => r.id}
                  columns={[
                    { key: "name", header: t("common.name", "Name"), sortable: true, render: (item: any) => <span className="text-sm font-medium">{item.name}</span> },
                    { key: "type", header: t("common.description", "Type"), sortable: true, render: (item: any) => <Badge tone="info">{item.type}</Badge> },
                    { key: "priority", header: t("conversionOptimizer.priority", "Priority"), sortable: true, render: (item: any) => <Badge tone={item.priority === "high" ? "error" : item.priority === "medium" ? "warning" : "info"}>{t(`conversionOptimizer.${item.priority}`, item.priority)}</Badge> },
                    { key: "status", header: t("common.status", "Status"), sortable: true, render: (item: any) => <Badge tone={item.enabled ? "success" : "default"}>{item.enabled ? t("common.ok", "Enabled") : t("common.cancel", "Disabled")}</Badge> },
                    { key: "actions", header: t("common.actions", "Actions"), render: (item: any) => (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm"><Edit className="size-3" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRecRule(item.id)}><Trash2 className="size-3" /></Button>
                      </div>
                    )},
                  ]}
                />
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("conversionOptimizer.performanceScore", "Performance Score")}</p>
                    <p className="mt-2 text-2xl font-semibold">{analytics?.performanceScore ?? 0}</p>
                  </DashboardCard>
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("conversionOptimizer.totalRecommendations", "Recommendations")}</p>
                    <p className="mt-2 text-2xl font-semibold">{analytics?.totalRecommendations ?? 0}</p>
                  </DashboardCard>
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("conversionOptimizer.activeExperiments", "Experiments")}</p>
                    <p className="mt-2 text-2xl font-semibold">{analytics?.activeExperiments ?? 0}</p>
                  </DashboardCard>
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("conversionOptimizer.totalReports", "Reports")}</p>
                    <p className="mt-2 text-2xl font-semibold">{analytics?.totalReports ?? 0}</p>
                  </DashboardCard>
                </div>
              </div>
            )}
          </>
        )}
      </DashboardCard>
    </div>
  );
}
