"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Loader, Activity, CheckCircle, XCircle, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

export function AIRuntimePage({ adminToken }: { adminToken: string | null }) {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");
  const [tab, setTab] = React.useState<"providers" | "models" | "jobs" | "prompts">("providers");

  const { data: statsData, isLoading: statsLoading } = useSWR("/api/ai/stats", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const { data: providersData, isLoading: providersLoading, mutate: mutateProviders } = useSWR("/api/ai/providers", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const { data: modelsData, isLoading: modelsLoading } = useSWR("/api/ai/models", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const { data: jobsData, isLoading: jobsLoading } = useSWR("/api/admin/jobs?type=ai", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const { data: promptsData, isLoading: promptsLoading } = useSWR("/api/ai/prompts", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const stats = React.useMemo(() => {
    if (statsData?.success && statsData.data) return statsData.data;
    return { stats: { total: 0, completed: 0, failed: 0 }, creditsConsumed: 0, avgGenerationTimeMs: 0, topModels: [], health: [] };
  }, [statsData]);

  const providers = React.useMemo(() => {
    if (providersData?.success && Array.isArray(providersData.data)) return providersData.data;
    return [];
  }, [providersData]);

  const models = React.useMemo(() => {
    if (modelsData?.success && Array.isArray(modelsData.data)) return modelsData.data;
    return [];
  }, [modelsData]);

  const jobs = React.useMemo(() => {
    if (jobsData?.success && Array.isArray(jobsData.data)) return jobsData.data;
    return [];
  }, [jobsData]);

  const prompts = React.useMemo(() => {
    if (promptsData?.success && Array.isArray(promptsData.data)) return promptsData.data;
    return [];
  }, [promptsData]);

  const filteredProviders = React.useMemo(
    () => providers.filter((p: any) => (p.name || "").toLowerCase().includes(search.toLowerCase())),
    [providers, search]
  );

  const filteredModels = React.useMemo(
    () => models.filter((m: any) => (m.model || "").toLowerCase().includes(search.toLowerCase())),
    [models, search]
  );

  const tabLabels: Record<string, string> = {
    providers: t("admin.aiRuntime.providers"),
    models: t("admin.aiRuntime.models"),
    jobs: t("admin.aiRuntime.jobs"),
    prompts: t("admin.aiRuntime.promptTemplates"),
  };

  if (statsLoading || providersLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.aiRuntime.title") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.aiRuntime.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.aiRuntime.description")}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("common.loading")}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.aiRuntime.title") }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.aiRuntime.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.aiRuntime.description")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { mutateProviders(); }}>
            <RefreshCw className="mr-2 size-4" />{t("common.refresh")}
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="size-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t("admin.aiRuntime.providers")}</p>
            </div>
            <p className="text-2xl font-semibold">{providers.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="size-4 text-green-600" />
              <p className="text-xs text-muted-foreground">{t("admin.aiRuntime.completedToday")}</p>
            </div>
            <p className="text-2xl font-semibold">{stats.stats?.completed || 0}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="size-4 text-destructive" />
              <p className="text-xs text-muted-foreground">{t("admin.aiRuntime.failedJobs")}</p>
            </div>
            <p className="text-2xl font-semibold">{stats.stats?.failed || 0}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="size-4 text-yellow-600" />
              <p className="text-xs text-muted-foreground">{t("admin.aiRuntime.creditsConsumed")}</p>
            </div>
            <p className="text-2xl font-semibold">{stats.creditsConsumed || 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-border mb-4">
          {(["providers", "models", "jobs", "prompts"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors -mb-px",
                tab === key ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tabLabels[key]}
            </button>
          ))}
        </div>

        {tab === "providers" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`${t("common.search")}...`} className="pl-9" />
              </div>
            </div>
            {filteredProviders.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{t("admin.aiRuntime.noProviders")}</div>
            ) : (
              <AdminDataTable
                data={filteredProviders}
                keyExtractor={(p: any) => p.id}
                columns={[
                  { key: "name", header: t("common.name"), render: (p: any) => <div className="flex items-center gap-2"><Zap className="size-4 text-primary" /><span className="font-medium text-sm">{p.name}</span></div> },
                  { key: "status", header: t("common.status"), render: (p: any) => <Badge tone={p.status === "online" ? "success" : p.status === "offline" ? "warning" : "muted"}>{p.status}</Badge> },
                  { key: "latencyMs", header: t("admin.aiRuntime.latency"), render: (p: any) => <span className="text-sm">{p.latencyMs ? `${p.latencyMs}ms` : "—"}</span> },
                  { key: "successRate", header: t("admin.aiRuntime.successRate"), render: (p: any) => <span className="text-sm">{p.successRate}%</span> },
                  { key: "totalRequests", header: t("admin.aiRuntime.totalRequests"), render: (p: any) => <span className="text-sm">{p.totalRequests}</span> },
                  { key: "lastCheckedAt", header: t("admin.aiRuntime.health"), render: (p: any) => <span className="text-xs text-muted-foreground">{p.lastCheckedAt ? new Date(p.lastCheckedAt).toLocaleString("en-GB") : "—"}</span> },
                ]}
              />
            )}
          </div>
        )}

        {tab === "models" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`${t("common.search")}...`} className="pl-9" />
              </div>
            </div>
            {filteredModels.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{t("admin.aiRuntime.noProviders")}</div>
            ) : (
              <AdminDataTable
                data={filteredModels}
                keyExtractor={(m: any) => `${m.provider}-${m.model}`}
                columns={[
                  { key: "model", header: t("common.name"), render: (m: any) => <span className="font-medium text-sm">{m.model}</span> },
                  { key: "provider", header: t("admin.aiRuntime.providers"), render: (m: any) => <Badge tone="info">{m.provider}</Badge> },
                ]}
              />
            )}
          </div>
        )}

        {tab === "jobs" && (
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{t("admin.aiRuntime.noJobs")}</div>
            ) : (
              <AdminDataTable
                data={jobs}
                keyExtractor={(j: any) => j.id}
                columns={[
                  { key: "name", header: t("common.name"), render: (j: any) => <span className="font-medium text-sm">{j.name}</span> },
                  { key: "status", header: t("common.status"), render: (j: any) => <Badge tone={j.status === "Completed" ? "success" : j.status === "Failed" ? "warning" : "default"}>{j.status}</Badge> },
                  { key: "owner", header: t("admin.aiRuntime.jobs"), render: (j: any) => <span className="text-sm">{j.owner}</span> },
                  { key: "createdAt", header: t("common.date"), render: (j: any) => <span className="text-sm">{j.createdAt}</span> },
                ]}
              />
            )}
          </div>
        )}

        {tab === "prompts" && (
          <div className="space-y-4">
            {prompts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">{t("admin.aiRuntime.noJobs")}</div>
            ) : (
              <AdminDataTable
                data={prompts}
                keyExtractor={(p: any) => p.id}
                columns={[
                  { key: "name", header: t("common.name"), render: (p: any) => <span className="font-medium text-sm">{p.name}</span> },
                  { key: "category", header: t("admin.aiRuntime.analytics"), render: (p: any) => <Badge tone="muted">{p.category || "—"}</Badge> },
                  { key: "useCount", header: t("admin.aiRuntime.totalRequests"), render: (p: any) => <span className="text-sm">{p.useCount}</span> },
                ]}
              />
            )}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
