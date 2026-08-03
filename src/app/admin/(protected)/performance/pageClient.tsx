"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  Cpu,
  Database,
  Gauge,
  HardDrive,
  Loader,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Server,
  Settings,
  Trash2,
  X,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Layers,
  Cog,
} from "lucide-react";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

type Tab = "overview" | "scaling" | "workers" | "queues" | "database" | "storage" | "ai-runtime" | "caching" | "load-tests" | "settings";

const TABS: { key: Tab; icon: React.ElementType }[] = [
  { key: "overview", icon: Gauge },
  { key: "scaling", icon: TrendingUp },
  { key: "workers", icon: Server },
  { key: "queues", icon: Layers },
  { key: "database", icon: Database },
  { key: "storage", icon: HardDrive },
  { key: "ai-runtime", icon: Cpu },
  { key: "caching", icon: Zap },
  { key: "load-tests", icon: Activity },
  { key: "settings", icon: Settings },
];

type WorkerData = {
  id: string;
  workerId: string;
  workerType: string;
  status: string;
  cpuUsage?: number;
  memoryUsageMb?: number;
  jobsProcessed?: number;
  jobsFailed?: number;
  updatedAt?: string;
};

type QueueData = {
  queueName: string;
  queueLength: number;
  processingCount: number;
  failedCount: number;
  avgWaitTimeMs?: number;
};

type LoadTestData = {
  id: string;
  testName: string;
  targetUsers: number;
  durationSeconds: number;
  status: string;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
};

type ScaleSettings = {
  id: string;
  autoScalingEnabled: boolean;
  minWorkers: number;
  maxWorkers: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  healthCheckIntervalMs: number;
  gracefulShutdownTimeoutMs: number;
  enableCdn: boolean;
  cdnProvider?: string;
  cachingEnabled: boolean;
  defaultCacheTtlSeconds: number;
};

type ResourceLimit = {
  id: string;
  resourceType: string;
  resourceName: string;
  limitType: string;
  limitValue: number;
  currentValue?: number;
  unit?: string;
  isEnabled: boolean;
};

type CostSummary = {
  totalCost: number;
  totalCredits: number;
  byCategory: { category: string; total: number }[];
  byProvider: { provider: string | null; total: number }[];
};

type MetricSummary = {
  name: string;
  category: string;
  avg: number;
  min: number;
  max: number;
  count: number;
  unit?: string;
};

type CapacityForecast = {
  id: string;
  forecastType: string;
  currentValue: number;
  projectedValue: number;
  projectedDate: string;
  confidence?: number;
  recommendation?: string;
};

export function PerformancePageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<Tab>("overview");
  const [showCreateWorker, setShowCreateWorker] = React.useState(false);
  const [showCreateQueue, setShowCreateQueue] = React.useState(false);
  const [showCreateLoadTest, setShowCreateLoadTest] = React.useState(false);
  const [showCreateForecast, setShowCreateForecast] = React.useState(false);
  const [showCreateResourceLimit, setShowCreateResourceLimit] = React.useState(false);

  const [newWorker, setNewWorker] = React.useState({ workerId: "", workerType: "app" });
  const [newQueue, setNewQueue] = React.useState({ queueName: "", queueLength: 0 });
  const [newLoadTest, setNewLoadTest] = React.useState({ testName: "", targetUsers: 100, durationSeconds: 60 });
  const [newForecast, setNewForecast] = React.useState({ forecastType: "cpu", currentValue: 0, projectedValue: 0, projectedDate: "", recommendation: "" });
  const [newResourceLimit, setNewResourceLimit] = React.useState({ resourceType: "cpu", resourceName: "", limitType: "max", limitValue: 0, unit: "%", isEnabled: true });

  const { data: overviewData, isLoading: overviewLoading, mutate: mutateOverview } = useSWR("/api/scaling/overview", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR("/api/scaling/stats", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: workersData, mutate: mutateWorkers } = useSWR("/api/scaling/workers", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: queuesData, mutate: mutateQueues } = useSWR("/api/scaling/queues", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: metricsData } = useSWR("/api/scaling/metrics/summary?hours=24", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: costsData } = useSWR("/api/scaling/costs/summary?days=30", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: loadTestsData, mutate: mutateLoadTests } = useSWR("/api/scaling/load-tests", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: settingsData, mutate: mutateSettings } = useSWR("/api/scaling/settings", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: forecastsData, mutate: mutateForecasts } = useSWR("/api/scaling/capacity", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: resourceLimitsData, mutate: mutateResourceLimits } = useSWR("/api/scaling/resource-limits", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });

  const overview = overviewData?.data ?? null;
  const workers: WorkerData[] = workersData?.data ?? [];
  const queues: QueueData[] = queuesData?.data ?? [];
  const metrics: MetricSummary[] = metricsData?.data ?? [];
  const costSummary: CostSummary | null = costsData?.data ?? null;
  const loadTests: LoadTestData[] = loadTestsData?.data?.data ?? [];
  const settings: ScaleSettings | null = settingsData?.data ?? null;
  const forecasts: CapacityForecast[] = forecastsData?.data?.data ?? [];
  const resourceLimits: ResourceLimit[] = resourceLimitsData?.data ?? [];

  const isLoading = overviewLoading || statsLoading;

  const handleRegisterWorker = async () => {
    if (!newWorker.workerId) {
      toast.error(t("scaling.workerIdRequired", "Worker ID is required"));
      return;
    }
    try {
      const res = await fetch("/api/scaling/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWorker),
      });
      if (res.ok) {
        toast.success(t("scaling.workerRegistered", "Worker registered"));
        setShowCreateWorker(false);
        setNewWorker({ workerId: "", workerType: "app" });
        mutateWorkers();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleDeleteWorker = async (workerId: string) => {
    try {
      const res = await fetch(`/api/scaling/workers/${workerId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("scaling.workerDeleted", "Worker removed"));
        mutateWorkers();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleRecordQueue = async () => {
    if (!newQueue.queueName) {
      toast.error(t("scaling.queueNameRequired", "Queue name is required"));
      return;
    }
    try {
      const res = await fetch("/api/scaling/queues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQueue),
      });
      if (res.ok) {
        toast.success(t("scaling.queueRecorded", "Queue snapshot recorded"));
        setShowCreateQueue(false);
        setNewQueue({ queueName: "", queueLength: 0 });
        mutateQueues();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleCreateLoadTest = async () => {
    if (!newLoadTest.testName) {
      toast.error(t("scaling.testNameRequired", "Test name is required"));
      return;
    }
    try {
      const res = await fetch("/api/scaling/load-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLoadTest),
      });
      if (res.ok) {
        toast.success(t("scaling.loadTestCreated", "Load test created"));
        setShowCreateLoadTest(false);
        setNewLoadTest({ testName: "", targetUsers: 100, durationSeconds: 60 });
        mutateLoadTests();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleStartLoadTest = async (id: string) => {
    try {
      const res = await fetch(`/api/scaling/load-tests/${id}/start`, { method: "POST" });
      if (res.ok) {
        toast.success(t("scaling.loadTestStarted", "Load test started"));
        mutateLoadTests();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleDeleteLoadTest = async (id: string) => {
    try {
      const res = await fetch(`/api/scaling/load-tests/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("scaling.loadTestDeleted", "Load test deleted"));
        mutateLoadTests();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleSaveSettings = async (updates: Partial<ScaleSettings>) => {
    try {
      const res = await fetch("/api/scaling/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, ...updates }),
      });
      if (res.ok) {
        toast.success(t("common.saved", "Settings saved"));
        mutateSettings();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleCreateForecast = async () => {
    if (!newForecast.forecastType || !newForecast.projectedDate) {
      toast.error(t("scaling.forecastFieldsRequired", "Forecast type and date are required"));
      return;
    }
    try {
      const res = await fetch("/api/scaling/capacity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newForecast),
      });
      if (res.ok) {
        toast.success(t("scaling.forecastCreated", "Forecast created"));
        setShowCreateForecast(false);
        setNewForecast({ forecastType: "cpu", currentValue: 0, projectedValue: 0, projectedDate: "", recommendation: "" });
        mutateForecasts();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleCreateResourceLimit = async () => {
    if (!newResourceLimit.resourceName) {
      toast.error(t("scaling.resourceNameRequired", "Resource name is required"));
      return;
    }
    try {
      const res = await fetch("/api/scaling/resource-limits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newResourceLimit),
      });
      if (res.ok) {
        toast.success(t("scaling.resourceLimitCreated", "Resource limit created"));
        setShowCreateResourceLimit(false);
        setNewResourceLimit({ resourceType: "cpu", resourceName: "", limitType: "max", limitValue: 0, unit: "%", isEnabled: true });
        mutateResourceLimits();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleRefreshAll = () => {
    mutateOverview();
    mutateStats();
    mutateWorkers();
    mutateQueues();
    mutateLoadTests();
    mutateSettings();
    mutateForecasts();
    mutateResourceLimits();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("scaling.title", "Scaling") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("scaling.title", "Scaling")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("scaling.description", "Scalability monitoring and resource management")}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("scaling.title", "Scaling") }]} />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gauge className="size-8 text-primary" />
              {t("scaling.title", "Scaling")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{t("scaling.description", "Scalability monitoring and resource management")}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefreshAll}>
            <RefreshCw className="mr-2 size-4" />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 mb-6">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {t(`scaling.tab.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Server className="size-4" />
                  {t("scaling.activeWorkers", "Active Workers")}
                </div>
                <p className="mt-2 text-2xl font-semibold">{overview?.workers?.active ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="size-4" />
                  {t("scaling.totalJobsProcessed", "Jobs Processed")}
                </div>
                <p className="mt-2 text-2xl font-semibold">{overview?.workers?.totalJobs ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Layers className="size-4" />
                  {t("scaling.queueBacklog", "Queue Backlog")}
                </div>
                <p className="mt-2 text-2xl font-semibold">{overview?.queues?.totalBacklog ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="size-4" />
                  {t("scaling.workerUtilization", "Worker Utilization")}
                </div>
                <p className="mt-2 text-2xl font-semibold">{overview?.capacity?.workerUtilization ?? 0}%</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{t("scaling.avgCpu", "Avg CPU")}</p>
                <p className="mt-2 text-2xl font-semibold">{overview?.system?.avgCpu ?? 0}%</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{t("scaling.avgMemory", "Avg Memory")}</p>
                <p className="mt-2 text-2xl font-semibold">{overview?.system?.avgMemory ?? 0}%</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{t("scaling.totalCost30d", "Total Cost (30d)")}</p>
                <p className="mt-2 text-2xl font-semibold">${costSummary?.totalCost?.toFixed(2) ?? "0.00"}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground">{t("scaling.totalCredits", "Total Credits")}</p>
                <p className="mt-2 text-2xl font-semibold">{costSummary?.totalCredits ?? 0}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "scaling" && (
          <div className="space-y-6">
            <DashboardCard title={t("scaling.metricsSummary", "Metrics Summary (24h)")}>
              {metrics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("common.name", "Name")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("common.category", "Category")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.avg", "Avg")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.min", "Min")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.max", "Max")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.count", "Count")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((m: MetricSummary, i: number) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="py-2 px-3 font-medium">{m.name}</td>
                          <td className="py-2 px-3"><Badge tone="muted">{m.category}</Badge></td>
                          <td className="py-2 px-3">{Math.round(m.avg)}</td>
                          <td className="py-2 px-3">{Math.round(m.min)}</td>
                          <td className="py-2 px-3">{Math.round(m.max)}</td>
                          <td className="py-2 px-3">{m.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DashboardCard>
            <DashboardCard title={t("scaling.capacityForecasts", "Capacity Forecasts")}>
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => setShowCreateForecast(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("scaling.createForecast", "Create Forecast")}
                </Button>
              </div>
              {showCreateForecast && (
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4 mb-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>{t("scaling.forecastType", "Type")}</Label>
                      <Input value={newForecast.forecastType} onChange={(e) => setNewForecast((p) => ({ ...p, forecastType: e.target.value }))} placeholder="cpu" />
                    </div>
                    <div className="space-y-1">
                      <Label>{t("scaling.currentValue", "Current")}</Label>
                      <Input type="number" value={newForecast.currentValue} onChange={(e) => setNewForecast((p) => ({ ...p, currentValue: Number(e.target.value) }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>{t("scaling.projectedValue", "Projected")}</Label>
                      <Input type="number" value={newForecast.projectedValue} onChange={(e) => setNewForecast((p) => ({ ...p, projectedValue: Number(e.target.value) }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>{t("scaling.projectedDate", "Date")}</Label>
                      <Input type="date" value={newForecast.projectedDate} onChange={(e) => setNewForecast((p) => ({ ...p, projectedDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowCreateForecast(false)}>
                      {t("common.cancel", "Cancel")}
                    </Button>
                    <Button size="sm" onClick={handleCreateForecast}>
                      <Save className="mr-2 size-4" />
                      {t("common.save", "Save")}
                    </Button>
                  </div>
                </div>
              )}
              {forecasts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">{t("common.noData", "No data available")}</div>
              ) : (
                <div className="space-y-2">
                  {forecasts.map((f: CapacityForecast) => (
                    <div key={f.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                      <div>
                        <p className="font-medium text-sm">{f.forecastType}</p>
                        <p className="text-xs text-muted-foreground">{f.recommendation || "-"}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span>{Math.round(f.currentValue)} &rarr; {Math.round(f.projectedValue)}</span>
                        <Badge tone="muted">{new Date(f.projectedDate).toLocaleDateString()}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>
          </div>
        )}

        {activeTab === "workers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("scaling.workers", "Workers")}</h3>
              <Button size="sm" onClick={() => setShowCreateWorker(true)}>
                <Plus className="mr-2 size-4" />
                {t("scaling.registerWorker", "Register Worker")}
              </Button>
            </div>
            {showCreateWorker && (
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>{t("scaling.workerId", "Worker ID")}</Label>
                    <Input value={newWorker.workerId} onChange={(e) => setNewWorker((p) => ({ ...p, workerId: e.target.value }))} placeholder="worker-1" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("scaling.workerType", "Type")}</Label>
                    <select
                      value={newWorker.workerType}
                      onChange={(e) => setNewWorker((p) => ({ ...p, workerType: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="app">App</option>
                      <option value="background">Background</option>
                      <option value="queue">Queue</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowCreateWorker(false)}>
                    {t("common.cancel", "Cancel")}
                  </Button>
                  <Button size="sm" onClick={handleRegisterWorker}>
                    <Save className="mr-2 size-4" />
                    {t("common.save", "Save")}
                  </Button>
                </div>
              </div>
            )}
            {workers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">{t("scaling.noWorkers", "No workers registered")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.workerId", "Worker ID")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.workerType", "Type")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.cpu", "CPU")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.memory", "Memory")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.jobsProcessed", "Jobs")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("common.actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((w: WorkerData) => (
                      <tr key={w.id} className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">{w.workerId}</td>
                        <td className="py-2 px-3"><Badge tone="muted">{w.workerType}</Badge></td>
                        <td className="py-2 px-3">
                          <Badge tone={w.status === "active" ? "success" : w.status === "failed" ? "default" : "warning"}>{w.status}</Badge>
                        </td>
                        <td className="py-2 px-3">{w.cpuUsage ?? 0}%</td>
                        <td className="py-2 px-3">{w.memoryUsageMb ?? 0} MB</td>
                        <td className="py-2 px-3">{w.jobsProcessed ?? 0}</td>
                        <td className="py-2 px-3">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteWorker(w.workerId)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "queues" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("scaling.queues", "Queues")}</h3>
              <Button size="sm" onClick={() => setShowCreateQueue(true)}>
                <Plus className="mr-2 size-4" />
                {t("scaling.recordSnapshot", "Record Snapshot")}
              </Button>
            </div>
            {showCreateQueue && (
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>{t("scaling.queueName", "Queue Name")}</Label>
                    <Input value={newQueue.queueName} onChange={(e) => setNewQueue((p) => ({ ...p, queueName: e.target.value }))} placeholder="email-queue" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("scaling.queueLength", "Length")}</Label>
                    <Input type="number" value={newQueue.queueLength} onChange={(e) => setNewQueue((p) => ({ ...p, queueLength: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowCreateQueue(false)}>
                    {t("common.cancel", "Cancel")}
                  </Button>
                  <Button size="sm" onClick={handleRecordQueue}>
                    <Save className="mr-2 size-4" />
                    {t("common.save", "Save")}
                  </Button>
                </div>
              </div>
            )}
            {queues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">{t("scaling.noQueueData", "No queue data available")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.queueName", "Queue Name")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.queueLength", "Length")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.processing", "Processing")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.failed", "Failed")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.avgWaitTime", "Avg Wait")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queues.map((q: QueueData, i: number) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">{q.queueName}</td>
                        <td className="py-2 px-3">{q.queueLength}</td>
                        <td className="py-2 px-3">{q.processingCount}</td>
                        <td className="py-2 px-3">{q.failedCount}</td>
                        <td className="py-2 px-3">{q.avgWaitTimeMs ?? 0}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "database" && (
          <div className="space-y-4">
            <DashboardCard title={t("scaling.databasePerformance", "Database Performance")}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {metrics.filter((m: MetricSummary) => m.category === "database").length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground text-sm">{t("scaling.noDbMetrics", "No database metrics recorded")}</div>
                ) : (
                  metrics.filter((m: MetricSummary) => m.category === "database").map((m: MetricSummary, i: number) => (
                    <div key={i} className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-xs text-muted-foreground">{m.name}</p>
                      <p className="mt-2 text-2xl font-semibold">{Math.round(m.avg)}ms</p>
                      <p className="text-xs text-muted-foreground">min: {Math.round(m.min)} / max: {Math.round(m.max)}</p>
                    </div>
                  ))
                )}
              </div>
            </DashboardCard>
          </div>
        )}

        {activeTab === "storage" && (
          <div className="space-y-4">
            <DashboardCard title={t("scaling.storageUsage", "Storage Usage")}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {metrics.filter((m: MetricSummary) => m.category === "storage").length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground text-sm">{t("scaling.noStorageMetrics", "No storage metrics recorded")}</div>
                ) : (
                  metrics.filter((m: MetricSummary) => m.category === "storage").map((m: MetricSummary, i: number) => (
                    <div key={i} className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-xs text-muted-foreground">{m.name}</p>
                      <p className="mt-2 text-2xl font-semibold">{Math.round(m.avg)} {m.unit || ""}</p>
                    </div>
                  ))
                )}
              </div>
            </DashboardCard>
          </div>
        )}

        {activeTab === "ai-runtime" && (
          <div className="space-y-4">
            <DashboardCard title={t("scaling.aiRuntimeScaling", "AI Runtime Scaling")}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {metrics.filter((m: MetricSummary) => m.category === "ai_runtime").length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground text-sm">{t("scaling.noAiMetrics", "No AI runtime metrics recorded")}</div>
                ) : (
                  metrics.filter((m: MetricSummary) => m.category === "ai_runtime").map((m: MetricSummary, i: number) => (
                    <div key={i} className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-xs text-muted-foreground">{m.name}</p>
                      <p className="mt-2 text-2xl font-semibold">{Math.round(m.avg)} {m.unit || ""}</p>
                    </div>
                  ))
                )}
              </div>
            </DashboardCard>
          </div>
        )}

        {activeTab === "caching" && (
          <div className="space-y-4">
            <DashboardCard title={t("scaling.cachePerformance", "Cache Performance")}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {metrics.filter((m: MetricSummary) => m.category === "cache").length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground text-sm">{t("scaling.noCacheMetrics", "No cache metrics recorded")}</div>
                ) : (
                  metrics.filter((m: MetricSummary) => m.category === "cache").map((m: MetricSummary, i: number) => (
                    <div key={i} className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-xs text-muted-foreground">{m.name}</p>
                      <p className="mt-2 text-2xl font-semibold">{Math.round(m.avg)} {m.unit || ""}</p>
                      <p className="text-xs text-muted-foreground">min: {Math.round(m.min)} / max: {Math.round(m.max)}</p>
                    </div>
                  ))
                )}
              </div>
            </DashboardCard>
          </div>
        )}

        {activeTab === "load-tests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("scaling.loadTests", "Load Tests")}</h3>
              <Button size="sm" onClick={() => setShowCreateLoadTest(true)}>
                <Plus className="mr-2 size-4" />
                {t("scaling.createLoadTest", "Create Load Test")}
              </Button>
            </div>
            {showCreateLoadTest && (
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label>{t("scaling.testName", "Test Name")}</Label>
                    <Input value={newLoadTest.testName} onChange={(e) => setNewLoadTest((p) => ({ ...p, testName: e.target.value }))} placeholder="load-test-1" />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("scaling.targetUsers", "Target Users")}</Label>
                    <Input type="number" value={newLoadTest.targetUsers} onChange={(e) => setNewLoadTest((p) => ({ ...p, targetUsers: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>{t("scaling.durationSeconds", "Duration (s)")}</Label>
                    <Input type="number" value={newLoadTest.durationSeconds} onChange={(e) => setNewLoadTest((p) => ({ ...p, durationSeconds: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowCreateLoadTest(false)}>
                    {t("common.cancel", "Cancel")}
                  </Button>
                  <Button size="sm" onClick={handleCreateLoadTest}>
                    <Save className="mr-2 size-4" />
                    {t("common.save", "Save")}
                  </Button>
                </div>
              </div>
            )}
            {loadTests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">{t("scaling.noLoadTests", "No load tests created")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.testName", "Name")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.targetUsers", "Users")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.durationSeconds", "Duration")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.created", "Created")}</th>
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("common.actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadTests.map((lt: LoadTestData) => (
                      <tr key={lt.id} className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">{lt.testName}</td>
                        <td className="py-2 px-3">{lt.targetUsers}</td>
                        <td className="py-2 px-3">{lt.durationSeconds}s</td>
                        <td className="py-2 px-3">
                          <Badge tone={lt.status === "completed" ? "success" : lt.status === "running" ? "warning" : lt.status === "failed" ? "default" : "muted"}>
                            {lt.status}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">{lt.createdAt ? new Date(lt.createdAt).toLocaleString() : "-"}</td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            {lt.status === "pending" && (
                              <Button variant="ghost" size="sm" onClick={() => handleStartLoadTest(lt.id)}>
                                <Play className="size-3" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteLoadTest(lt.id)}>
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && settings && (
          <div className="space-y-6">
            <DashboardCard title={t("scaling.autoScaling", "Auto-Scaling")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium text-sm">{t("scaling.autoScalingEnabled", "Auto-Scaling")}</p>
                    <p className="text-xs text-muted-foreground">{t("scaling.autoScalingDesc", "Automatically scale workers based on load")}</p>
                  </div>
                  <Button variant={settings.autoScalingEnabled ? "default" : "outline"} size="sm" onClick={() => handleSaveSettings({ autoScalingEnabled: !settings.autoScalingEnabled })}>
                    {settings.autoScalingEnabled ? t("common.enabled", "Enabled") : t("common.disabled", "Disabled")}
                  </Button>
                </div>
                <div className="space-y-1 rounded-xl border border-border p-4">
                  <Label>{t("scaling.minWorkers", "Min Workers")}</Label>
                  <Input type="number" value={settings.minWorkers} onChange={(e) => handleSaveSettings({ minWorkers: Number(e.target.value) })} />
                </div>
                <div className="space-y-1 rounded-xl border border-border p-4">
                  <Label>{t("scaling.maxWorkers", "Max Workers")}</Label>
                  <Input type="number" value={settings.maxWorkers} onChange={(e) => handleSaveSettings({ maxWorkers: Number(e.target.value) })} />
                </div>
                <div className="space-y-1 rounded-xl border border-border p-4">
                  <Label>{t("scaling.scaleUpThreshold", "Scale Up Threshold (%)")}</Label>
                  <Input type="number" value={settings.scaleUpThreshold} onChange={(e) => handleSaveSettings({ scaleUpThreshold: Number(e.target.value) })} />
                </div>
                <div className="space-y-1 rounded-xl border border-border p-4">
                  <Label>{t("scaling.scaleDownThreshold", "Scale Down Threshold (%)")}</Label>
                  <Input type="number" value={settings.scaleDownThreshold} onChange={(e) => handleSaveSettings({ scaleDownThreshold: Number(e.target.value) })} />
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title={t("scaling.cdnCaching", "CDN & Caching")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium text-sm">{t("scaling.enableCdn", "CDN")}</p>
                    <p className="text-xs text-muted-foreground">{t("scaling.enableCdnDesc", "Enable CDN for static assets")}</p>
                  </div>
                  <Button variant={settings.enableCdn ? "default" : "outline"} size="sm" onClick={() => handleSaveSettings({ enableCdn: !settings.enableCdn })}>
                    {settings.enableCdn ? t("common.enabled", "Enabled") : t("common.disabled", "Disabled")}
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium text-sm">{t("scaling.cachingEnabled", "Caching")}</p>
                    <p className="text-xs text-muted-foreground">{t("scaling.cachingEnabledDesc", "Enable response caching")}</p>
                  </div>
                  <Button variant={settings.cachingEnabled ? "default" : "outline"} size="sm" onClick={() => handleSaveSettings({ cachingEnabled: !settings.cachingEnabled })}>
                    {settings.cachingEnabled ? t("common.enabled", "Enabled") : t("common.disabled", "Disabled")}
                  </Button>
                </div>
                <div className="space-y-1 rounded-xl border border-border p-4">
                  <Label>{t("scaling.cacheTtl", "Cache TTL (seconds)")}</Label>
                  <Input type="number" value={settings.defaultCacheTtlSeconds} onChange={(e) => handleSaveSettings({ defaultCacheTtlSeconds: Number(e.target.value) })} />
                </div>
                <div className="space-y-1 rounded-xl border border-border p-4">
                  <Label>{t("scaling.healthCheckInterval", "Health Check Interval (ms)")}</Label>
                  <Input type="number" value={settings.healthCheckIntervalMs} onChange={(e) => handleSaveSettings({ healthCheckIntervalMs: Number(e.target.value) })} />
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title={t("scaling.resourceLimits", "Resource Limits")}>
              <div className="flex justify-end mb-4">
                <Button size="sm" onClick={() => setShowCreateResourceLimit(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("scaling.addLimit", "Add Limit")}
                </Button>
              </div>
              {showCreateResourceLimit && (
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4 mb-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>{t("scaling.resourceType", "Type")}</Label>
                      <Input value={newResourceLimit.resourceType} onChange={(e) => setNewResourceLimit((p) => ({ ...p, resourceType: e.target.value }))} placeholder="cpu" />
                    </div>
                    <div className="space-y-1">
                      <Label>{t("scaling.resourceName", "Name")}</Label>
                      <Input value={newResourceLimit.resourceName} onChange={(e) => setNewResourceLimit((p) => ({ ...p, resourceName: e.target.value }))} placeholder="main-app-cpu" />
                    </div>
                    <div className="space-y-1">
                      <Label>{t("scaling.limitType", "Limit Type")}</Label>
                      <Input value={newResourceLimit.limitType} onChange={(e) => setNewResourceLimit((p) => ({ ...p, limitType: e.target.value }))} placeholder="max" />
                    </div>
                    <div className="space-y-1">
                      <Label>{t("scaling.limitValue", "Limit Value")}</Label>
                      <Input type="number" value={newResourceLimit.limitValue} onChange={(e) => setNewResourceLimit((p) => ({ ...p, limitValue: Number(e.target.value) }))} />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowCreateResourceLimit(false)}>
                      {t("common.cancel", "Cancel")}
                    </Button>
                    <Button size="sm" onClick={handleCreateResourceLimit}>
                      <Save className="mr-2 size-4" />
                      {t("common.save", "Save")}
                    </Button>
                  </div>
                </div>
              )}
              {resourceLimits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">{t("scaling.noResourceLimits", "No resource limits configured")}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.resourceType", "Type")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.resourceName", "Name")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.limitType", "Limit")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("scaling.limitValue", "Value")}</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resourceLimits.map((rl: ResourceLimit) => (
                        <tr key={rl.id} className="border-b border-border/50">
                          <td className="py-2 px-3">{rl.resourceType}</td>
                          <td className="py-2 px-3 font-medium">{rl.resourceName}</td>
                          <td className="py-2 px-3"><Badge tone="muted">{rl.limitType}</Badge></td>
                          <td className="py-2 px-3">{rl.limitValue} {rl.unit || ""}</td>
                          <td className="py-2 px-3">
                            <Badge tone={rl.isEnabled ? "success" : "default"}>
                              {rl.isEnabled ? t("common.enabled", "Enabled") : t("common.disabled", "Disabled")}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </DashboardCard>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
