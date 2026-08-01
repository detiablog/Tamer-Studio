"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import {
  TrendingUp,
  RefreshCw,
  Loader,
  Search,
  Database,
  Folder,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

type ActiveTab = "sources" | "categories" | "analytics";

const TABS: { id: ActiveTab; key: string; icon: any }[] = [
  { id: "sources", key: "admin.trends.sources", icon: Database },
  { id: "categories", key: "admin.trends.categories", icon: Folder },
  { id: "analytics", key: "admin.trends.analytics", icon: BarChart3 },
];

export function AdminTrendAnalyzerPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("sources");
  const [search, setSearch] = React.useState("");

  const {
    data: sourcesData,
    isLoading: sourcesLoading,
    mutate: mutateSources,
  } = useSWR("/api/admin/trends/sources", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    mutate: mutateCategories,
  } = useSWR("/api/admin/trends/categories", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useSWR("/api/admin/trends/analytics", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const sources = sourcesData?.success ? sourcesData.data?.sources ?? [] : [];
  const categories = categoriesData?.success ? categoriesData.data?.categories ?? [] : [];
  const analytics = analyticsData?.success ? analyticsData.data : null;

  const filteredSources = React.useMemo(
    () => sources.filter((s: any) => s.name?.toLowerCase().includes(search.toLowerCase())),
    [sources, search]
  );

  const filteredCategories = React.useMemo(
    () => categories.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );

  const renderSources = () => (
    <DashboardCard>
      <div className="flex items-center gap-2 pb-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search", "Search") + "..."}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => mutateSources()}>
          <RefreshCw className="mr-2 size-4" />
          {t("common.refresh", "Refresh")}
        </Button>
      </div>

      {sourcesLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AdminDataTable
          data={filteredSources}
          keyExtractor={(s: any) => s.id}
          columns={[
            {
              key: "name",
              header: t("common.name", "Name"),
              sortable: true,
              render: (item: any) => <span className="text-sm font-medium">{item.name}</span>,
            },
            {
              key: "type",
              header: t("common.status", "Type"),
              sortable: true,
              render: (item: any) => <Badge tone="info">{item.type}</Badge>,
            },
            {
              key: "status",
              header: t("common.status", "Status"),
              sortable: true,
              render: (item: any) => (
                <Badge tone={item.status === "active" ? "success" : "warning"}>
                  {item.status}
                </Badge>
              ),
            },
            {
              key: "lastSync",
              header: "Last Sync",
              render: (item: any) => <span className="text-sm text-muted-foreground">{item.lastSync}</span>,
            },
          ]}
        />
      )}
    </DashboardCard>
  );

  const renderCategories = () => (
    <DashboardCard>
      <div className="flex items-center gap-2 pb-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search", "Search") + "..."}
            className="pl-9"
          />
        </div>
      </div>

      {categoriesLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AdminDataTable
          data={filteredCategories}
          keyExtractor={(c: any) => c.id}
          columns={[
            {
              key: "name",
              header: t("common.name", "Name"),
              sortable: true,
              render: (item: any) => <span className="text-sm font-medium">{item.name}</span>,
            },
            {
              key: "slug",
              header: t("admin.slug", "Slug"),
              render: (item: any) => <span className="text-sm text-muted-foreground">{item.slug}</span>,
            },
            {
              key: "topicCount",
              header: t("trendAnalyzer.totalTopics", "Topics"),
              sortable: true,
              render: (item: any) => <span className="text-sm">{item.topicCount}</span>,
            },
            {
              key: "status",
              header: t("common.status", "Status"),
              render: (item: any) => (
                <Badge tone={item.status === "active" ? "success" : "warning"}>
                  {item.status}
                </Badge>
              ),
            },
          ]}
        />
      )}
    </DashboardCard>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard>
          <p className="text-xs text-muted-foreground">{t("trendAnalyzer.totalTopics", "Total Topics")}</p>
          <p className="mt-2 text-2xl font-semibold">{analytics?.totalTopics ?? 0}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-xs text-muted-foreground">{t("trendAnalyzer.totalKeywords", "Total Keywords")}</p>
          <p className="mt-2 text-2xl font-semibold">{analytics?.totalKeywords ?? 0}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-xs text-muted-foreground">{t("trendAnalyzer.totalHashtags", "Total Hashtags")}</p>
          <p className="mt-2 text-2xl font-semibold">{analytics?.totalHashtags ?? 0}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-xs text-muted-foreground">Active Sources</p>
          <p className="mt-2 text-2xl font-semibold">{analytics?.activeSources ?? 0}</p>
        </DashboardCard>
      </div>

      <DashboardCard title="Usage Stats">
        {analyticsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {(analytics?.usageStats ?? []).map((stat: any, index: number) => (
              <div key={index} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex-1">
                  <p className="font-medium text-sm">{stat.metric}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <span className="text-lg font-semibold">{stat.value}</span>
              </div>
            ))}
            {!(analytics?.usageStats?.length) && (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                No usage data available
              </div>
            )}
          </div>
        )}
      </DashboardCard>
    </div>
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.trends", "Trends") }]} />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t("admin.trends", "Trends")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("trendAnalyzer.description", "Manage trend data sources and categories")}</p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="size-4" />
              {t(tab.key, tab.id)}
            </button>
          );
        })}
      </div>

      {activeTab === "sources" && renderSources()}
      {activeTab === "categories" && renderCategories()}
      {activeTab === "analytics" && renderAnalytics()}
    </div>
  );
}
