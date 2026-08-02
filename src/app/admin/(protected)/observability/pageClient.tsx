"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  Activity,
  RefreshCw,
  Loader,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Download,
  Trash2,
  Settings,
  BarChart3,
  FileText,
  LayoutDashboard,
  Bell,
  Eye,
  EyeOff,
  Shield,
  TrendingUp,
  TrendingDown,
  Filter,
  Play,
  Pause,
  Zap,
  Hash,
  GitBranch,
  Layers,
  Timer,
  Server,
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

type Tab = "overview" | "metrics" | "logs" | "traces" | "errors" | "alerts" | "performance" | "dashboards" | "reports" | "settings";

function SeverityBadge({ severity }: { severity: string }) {
  const tone =
    severity === "fatal"
      ? "default"
      : severity === "error"
        ? "default"
        : severity === "warn"
          ? "warning"
          : severity === "info"
            ? "info"
            : "muted";
  return <Badge tone={tone}>{severity}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "resolved"
      ? "success"
      : status === "acknowledged"
        ? "info"
        : status === "firing"
          ? "default"
          : status === "ok"
            ? "success"
            : status === "error"
              ? "default"
              : "muted";
  return <Badge tone={tone}>{status}</Badge>;
}

export function ObservabilityPageClient() {
  const { t } = useLocalizationContext();
  const [tab, setTab] = React.useState<Tab>("overview");
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState("all");
  const [serviceFilter, setServiceFilter] = React.useState("all");
  const [showCreateDashboard, setShowCreateDashboard] = React.useState(false);
  const [showCreateReport, setShowCreateReport] = React.useState(false);
  const [showCreateAlert, setShowCreateAlert] = React.useState(false);
  const [newDashboard, setNewDashboard] = React.useState({ name: "", description: "" });
  const [newReport, setNewReport] = React.useState({ reportType: "metrics", title: "", period: "daily" });
  const [newAlert, setNewAlert] = React.useState({ ruleName: "", category: "threshold", title: "", severity: "warning", service: "", metricName: "", threshold: 0 });
  const [logSearch, setLogSearch] = React.useState("");
  const [logPage, setLogPage] = React.useState(1);
  const [metricHours, setMetricHours] = React.useState(24);
  const [tracePage, setTracePage] = React.useState(1);
  const [errorPage, setErrorPage] = React.useState(1);
  const [settingsForm, setSettingsForm] = React.useState<any>(null);
  const [retentionForm, setRetentionForm] = React.useState({ dataType: "logs", retentionDays: 30 });

  const refreshOpts = { revalidateOnFocus: false, shouldRetryOnError: false, refreshInterval: autoRefresh ? 30000 : 0 };

  const { data: overviewData, isLoading: overviewLoading, mutate: mutateOverview } = useSWR("/api/observability/overview", fetcher, refreshOpts);
  const { data: metricsData, isLoading: metricsLoading, mutate: mutateMetrics } = useSWR(`/api/observability/metrics/summary?hours=${metricHours}`, fetcher, refreshOpts);
  const { data: logsData, isLoading: logsLoading, mutate: mutateLogs } = useSWR(`/api/observability/logs?limit=50&page=${logPage}&search=${logSearch}&severity=${severityFilter === "all" ? "" : severityFilter}&service=${serviceFilter === "all" ? "" : serviceFilter}`, fetcher, refreshOpts);
  const { data: tracesData, isLoading: tracesLoading, mutate: mutateTraces } = useSWR(`/api/observability/traces?limit=50&page=${tracePage}`, fetcher, refreshOpts);
  const { data: errorsData, isLoading: errorsLoading, mutate: mutateErrors } = useSWR(`/api/observability/errors?limit=50&page=${errorPage}&severity=${severityFilter === "all" ? "" : severityFilter}&resolved=${severityFilter === "resolved" ? "true" : severityFilter === "unresolved" ? "false" : ""}`, fetcher, refreshOpts);
  const { data: alertsData, isLoading: alertsLoading, mutate: mutateAlerts } = useSWR("/api/observability/alerts?limit=100", fetcher, refreshOpts);
  const { data: dashboardsData, isLoading: dashboardsLoading, mutate: mutateDashboards } = useSWR("/api/observability/dashboards", fetcher, refreshOpts);
  const { data: reportsData, isLoading: reportsLoading, mutate: mutateReports } = useSWR("/api/observability/reports", fetcher, refreshOpts);
  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR("/api/observability/settings", fetcher, refreshOpts);
  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR("/api/observability/stats", fetcher, refreshOpts);
  const { data: slowTracesData } = useSWR("/api/observability/traces/slow?minDurationMs=1000&hours=24", fetcher, refreshOpts);

  const overview = overviewData?.success ? overviewData.data : null;
  const metricsSummary = metricsData?.success ? metricsData.data : [];
  const logs = logsData?.success ? logsData.data : { data: [], total: 0, page: 1, limit: 50 };
  const traces = tracesData?.success ? tracesData.data : { data: [], total: 0, page: 1, limit: 50 };
  const errors = errorsData?.success ? errorsData.data : { data: [], total: 0, page: 1, limit: 50 };
  const alerts = alertsData?.success && Array.isArray(alertsData.data) ? alertsData.data : [];
  const dashboards = dashboardsData?.success && Array.isArray(dashboardsData.data) ? dashboardsData.data : [];
  const reports = reportsData?.success && Array.isArray(reportsData.data) ? reportsData.data : [];
  const settings = settingsData?.success ? settingsData.data : null;
  const stats = statsData?.success ? statsData.data : null;
  const slowTraces = slowTracesData?.success && Array.isArray(slowTracesData.data) ? slowTracesData.data : [];

  React.useEffect(() => {
    if (settings && !settingsForm) {
      setSettingsForm(settings);
    }
  }, [settings]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("observability.overview", "Overview"), icon: <Activity className="size-4" /> },
    { key: "metrics", label: t("observability.metrics", "Metrics"), icon: <BarChart3 className="size-4" /> },
    { key: "logs", label: t("observability.logs", "Logs"), icon: <FileText className="size-4" /> },
    { key: "traces", label: t("observability.traces", "Traces"), icon: <GitBranch className="size-4" /> },
    { key: "errors", label: t("observability.errors", "Errors"), icon: <AlertTriangle className="size-4" /> },
    { key: "alerts", label: t("observability.alerts", "Alerts"), icon: <Bell className="size-4" /> },
    { key: "performance", label: t("observability.performance", "Performance"), icon: <Zap className="size-4" /> },
    { key: "dashboards", label: t("observability.dashboards", "Dashboards"), icon: <LayoutDashboard className="size-4" /> },
    { key: "reports", label: t("observability.reports", "Reports"), icon: <FileText className="size-4" /> },
    { key: "settings", label: t("observability.settings", "Settings"), icon: <Settings className="size-4" /> },
  ];

  const mutateAll = () => {
    mutateOverview();
    mutateMetrics();
    mutateLogs();
    mutateTraces();
    mutateErrors();
    mutateAlerts();
    mutateDashboards();
    mutateReports();
    mutateSettings();
    mutateStats();
  };

  const handleCreateDashboard = async () => {
    if (!newDashboard.name) {
      toast.error(t("observability.nameRequired", "Name is required"));
      return;
    }
    try {
      const res = await fetch("/api/observability/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDashboard),
      });
      if (res.ok) {
        toast.success(t("observability.dashboardCreated", "Dashboard created"));
        setShowCreateDashboard(false);
        setNewDashboard({ name: "", description: "" });
        mutateDashboards();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleDeleteDashboard = async (id: string) => {
    try {
      const res = await fetch(`/api/observability/dashboards/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("observability.dashboardDeleted", "Dashboard deleted"));
        mutateDashboards();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleCreateReport = async () => {
    if (!newReport.title) {
      toast.error(t("observability.titleRequired", "Title is required"));
      return;
    }
    try {
      const res = await fetch("/api/observability/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });
      if (res.ok) {
        toast.success(t("observability.reportGenerated", "Report generated"));
        setShowCreateReport(false);
        setNewReport({ reportType: "metrics", title: "", period: "daily" });
        mutateReports();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const res = await fetch(`/api/observability/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("observability.reportDeleted", "Report deleted"));
        mutateReports();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleCreateAlert = async () => {
    if (!newAlert.ruleName || !newAlert.title) {
      toast.error(t("observability.fillRequired", "Please fill in required fields"));
      return;
    }
    try {
      const res = await fetch("/api/observability/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });
      if (res.ok) {
        toast.success(t("observability.alertCreated", "Alert created"));
        setShowCreateAlert(false);
        setNewAlert({ ruleName: "", category: "threshold", title: "", severity: "warning", service: "", metricName: "", threshold: 0 });
        mutateAlerts();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/observability/alerts/${id}/acknowledge`, { method: "POST" });
      if (res.ok) {
        toast.success(t("observability.alertAcknowledged", "Alert acknowledged"));
        mutateAlerts();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/observability/alerts/${id}/resolve`, { method: "POST" });
      if (res.ok) {
        toast.success(t("observability.alertResolved", "Alert resolved"));
        mutateAlerts();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/observability/alerts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("observability.alertDeleted", "Alert deleted"));
        mutateAlerts();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleResolveError = async (id: string) => {
    try {
      const res = await fetch(`/api/observability/errors/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: "Manual resolve" }),
      });
      if (res.ok) {
        toast.success(t("observability.errorResolved", "Error resolved"));
        mutateErrors();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleDeleteError = async (id: string) => {
    try {
      const res = await fetch(`/api/observability/errors/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("observability.errorDeleted", "Error deleted"));
        mutateErrors();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleSaveSettings = async () => {
    if (!settingsForm) return;
    try {
      const res = await fetch("/api/observability/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        toast.success(t("observability.settingsSaved", "Settings saved"));
        mutateSettings();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleSaveRetention = async () => {
    try {
      const res = await fetch("/api/observability/settings/retention", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(retentionForm),
      });
      if (res.ok) {
        toast.success(t("observability.retentionSaved", "Retention policy saved"));
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleExportLogs = () => {
    const rows = (logs.data || []).map((l: any) => `${l.createdAt},${l.severity},${l.service},${l.module},${l.message}`);
    const csv = `Timestamp,Severity,Service,Module,Message\n${rows.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "observability-logs.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("observability.logsExported", "Logs exported"));
  };

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("observability.title", "Observability")} description={t("observability.description", "System telemetry, metrics, logs, traces, and alerting")} />
        <DashboardCard>
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title={t("observability.title", "Observability")} description={t("observability.description", "System telemetry, metrics, logs, traces, and alerting")} />
        <div className="flex items-center gap-2">
          <Button variant={autoRefresh ? "default" : "outline"} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? <Pause className="mr-2 size-4" /> : <Play className="mr-2 size-4" />}
            {autoRefresh ? t("observability.pause", "Pause") : t("observability.autoRefresh", "Auto Refresh")}
          </Button>
          <Button variant="outline" size="sm" onClick={mutateAll}>
            <RefreshCw className="mr-2 size-4" />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 overflow-x-auto">
        {tabs.map((t_item) => (
          <button
            key={t_item.key}
            onClick={() => setTab(t_item.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
              tab === t_item.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t_item.icon}
            {t_item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BarChart3 className="size-4" />
                  {t("observability.totalMetrics", "Total Metrics")}
                </div>
                <p className="mt-2 text-2xl font-semibold">{stats?.logs?.total ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="size-4" />
                  {t("observability.totalLogs", "Total Logs")}
                </div>
                <p className="mt-2 text-2xl font-semibold">{stats?.logs?.total ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <GitBranch className="size-4" />
                  {t("observability.totalTraces", "Total Traces")}
                </div>
                <p className="mt-2 text-2xl font-semibold">{stats?.traces?.total ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="size-4 text-red-500" />
                  {t("observability.totalErrors", "Total Errors")}
                </div>
                <p className="mt-2 text-2xl font-semibold">{stats?.errors?.total ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Bell className="size-4" />
                  {t("observability.firingAlerts", "Firing Alerts")}
                </div>
                <p className="mt-2 text-2xl font-semibold">{stats?.alerts?.firing ?? 0}</p>
              </div>
            </div>
          </DashboardCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardCard title={t("observability.logsBySeverity", "Logs by Severity")}>
              <div className="space-y-3">
                {(stats?.logs?.bySeverity || []).map((item: any) => (
                  <div key={item.severity} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={item.severity || "unknown"} />
                      <span className="text-sm">{item.severity}</span>
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
                {(!stats?.logs?.bySeverity || stats.logs.bySeverity.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("common.noData", "No data available")}</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title={t("observability.errorsBySeverity", "Errors by Severity")}>
              <div className="space-y-3">
                {(stats?.errors?.bySeverity || []).map((item: any) => (
                  <div key={item.severity} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={item.severity || "unknown"} />
                      <span className="text-sm">{item.severity}</span>
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
                {(!stats?.errors?.bySeverity || stats.errors.bySeverity.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("common.noData", "No data available")}</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title={t("observability.traceStats", "Trace Statistics")}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border bg-muted/10 p-3">
                    <p className="text-xs text-muted-foreground">{t("observability.avgDuration", "Avg Duration")}</p>
                    <p className="text-lg font-semibold">{stats?.traces?.avgDuration ?? 0}ms</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/10 p-3">
                    <p className="text-xs text-muted-foreground">{t("observability.totalSpans", "Total Spans")}</p>
                    <p className="text-lg font-semibold">{stats?.traces?.total ?? 0}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {(stats?.traces?.byService || []).map((item: any) => (
                    <div key={item.service} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{item.service}</span>
                      <span>{item.count} spans, {Math.round(item.avgDuration)}ms avg</span>
                    </div>
                  ))}
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title={t("observability.alertsBySeverity", "Alerts by Severity")}>
              <div className="space-y-3">
                {(stats?.alerts?.bySeverity || []).map((item: any) => (
                  <div key={item.severity} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={item.severity || "unknown"} />
                      <span className="text-sm">{item.severity}</span>
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
                {(!stats?.alerts?.bySeverity || stats.alerts.bySeverity.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("common.noData", "No data available")}</p>
                )}
              </div>
            </DashboardCard>
          </div>
        </div>
      )}

      {tab === "metrics" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <select
                  value={metricHours}
                  onChange={(e) => setMetricHours(Number(e.target.value))}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value={1}>{t("observability.lastHour", "Last 1h")}</option>
                  <option value={6}>{t("observability.last6Hours", "Last 6h")}</option>
                  <option value={24}>{t("observability.last24Hours", "Last 24h")}</option>
                  <option value={72}>{t("observability.last3Days", "Last 3d")}</option>
                  <option value={168}>{t("observability.last7Days", "Last 7d")}</option>
                </select>
              </div>
              <Button variant="outline" size="sm" onClick={() => mutateMetrics()}>
                <RefreshCw className="mr-2 size-4" />
                {t("common.refresh", "Refresh")}
              </Button>
            </div>

            {metricsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.name", "Name")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.category", "Category")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.avgValue", "Avg")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.minValue", "Min")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.maxValue", "Max")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.count", "Count")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(metricsSummary) && metricsSummary.map((m: any, idx: number) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-3 font-medium">{m.name}</td>
                        <td className="py-3"><Badge tone="muted">{m.category}</Badge></td>
                        <td className="py-3">{Math.round(Number(m.avg) * 100) / 100}</td>
                        <td className="py-3">{m.min}</td>
                        <td className="py-3">{m.max}</td>
                        <td className="py-3">{m.count}</td>
                      </tr>
                    ))}
                    {(!Array.isArray(metricsSummary) || metricsSummary.length === 0) && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">{t("common.noData", "No data available")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>
        </div>
      )}

      {tab === "logs" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={logSearch}
                    onChange={(e) => { setLogSearch(e.target.value); setLogPage(1); }}
                    placeholder={t("common.search", "Search") + "..."}
                    className="pl-9 w-64"
                  />
                </div>
                <select
                  value={severityFilter}
                  onChange={(e) => { setSeverityFilter(e.target.value); setLogPage(1); }}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t("common.all", "All")} {t("observability.severity", "Severity")}</option>
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warn</option>
                  <option value="error">Error</option>
                  <option value="fatal">Fatal</option>
                </select>
                <select
                  value={serviceFilter}
                  onChange={(e) => { setServiceFilter(e.target.value); setLogPage(1); }}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t("common.all", "All")} {t("observability.service", "Service")}</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportLogs}>
                  <Download className="mr-2 size-4" />
                  {t("common.export", "Export")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => mutateLogs()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
              </div>
            </div>

            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.timestamp", "Timestamp")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.severity", "Severity")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.service", "Service")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.module", "Module")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.message", "Message")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(logs.data || []).map((log: any) => (
                        <tr key={log.id} className="border-b border-border/50">
                          <td className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">{log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}</td>
                          <td className="py-2.5"><SeverityBadge severity={log.severity} /></td>
                          <td className="py-2.5 text-muted-foreground">{log.service || "-"}</td>
                          <td className="py-2.5 text-muted-foreground">{log.module || "-"}</td>
                          <td className="py-2.5 max-w-[300px] truncate">{log.message}</td>
                        </tr>
                      ))}
                      {(!logs.data || logs.data.length === 0) && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">{t("common.noData", "No data available")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                  <span>{t("observability.showing", "Showing")} {(logs.data || []).length} {t("observability.of", "of")} {logs.total}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={logPage <= 1} onClick={() => setLogPage(p => p - 1)}>
                      {t("common.previous", "Previous")}
                    </Button>
                    <span>{logs.page} / {Math.ceil((logs.total || 0) / (logs.limit || 50)) || 1}</span>
                    <Button variant="outline" size="sm" disabled={(logs.data || []).length < (logs.limit || 50)} onClick={() => setLogPage(p => p + 1)}>
                      {t("common.next", "Next")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DashboardCard>
        </div>
      )}

      {tab === "traces" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge tone="muted">{t("observability.totalTraces", "Total")}: {traces.total}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => mutateTraces()}>
                <RefreshCw className="mr-2 size-4" />
                {t("common.refresh", "Refresh")}
              </Button>
            </div>

            {tracesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.traceId", "Trace ID")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.name", "Name")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.service", "Service")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.operation", "Operation")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.duration", "Duration")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.startTime", "Start Time")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(traces.data || []).map((trace: any) => (
                        <tr key={trace.id} className="border-b border-border/50">
                          <td className="py-2.5 font-mono text-xs">{trace.traceId}</td>
                          <td className="py-2.5 font-medium">{trace.name}</td>
                          <td className="py-2.5 text-muted-foreground">{trace.service}</td>
                          <td className="py-2.5 text-muted-foreground">{trace.operation || "-"}</td>
                          <td className="py-2.5">{trace.durationMs != null ? `${trace.durationMs}ms` : "-"}</td>
                          <td className="py-2.5"><StatusBadge status={trace.status} /></td>
                          <td className="py-2.5 text-xs text-muted-foreground">{trace.startTime ? new Date(trace.startTime).toLocaleString() : "-"}</td>
                        </tr>
                      ))}
                      {(!traces.data || traces.data.length === 0) && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground">{t("common.noData", "No data available")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                  <span>{t("observability.showing", "Showing")} {(traces.data || []).length} {t("observability.of", "of")} {traces.total}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={tracePage <= 1} onClick={() => setTracePage(p => p - 1)}>
                      {t("common.previous", "Previous")}
                    </Button>
                    <span>{traces.page} / {Math.ceil((traces.total || 0) / (traces.limit || 50)) || 1}</span>
                    <Button variant="outline" size="sm" disabled={(traces.data || []).length < (traces.limit || 50)} onClick={() => setTracePage(p => p + 1)}>
                      {t("common.next", "Next")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DashboardCard>

          <DashboardCard title={t("observability.slowTraces", "Slow Traces (>1s)")}>
            {slowTraces.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("observability.noSlowTraces", "No slow traces found")}</p>
            ) : (
              <div className="space-y-2">
                {slowTraces.map((trace: any) => (
                  <div key={trace.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <Timer className="size-4 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">{trace.name}</p>
                        <p className="text-xs text-muted-foreground">{trace.service} / {trace.operation || "unknown"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="default">{trace.durationMs}ms</Badge>
                      <span className="text-xs text-muted-foreground">{trace.startTime ? new Date(trace.startTime).toLocaleString() : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      )}

      {tab === "errors" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <select
                  value={severityFilter}
                  onChange={(e) => { setSeverityFilter(e.target.value); setErrorPage(1); }}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t("common.all", "All")}</option>
                  <option value="unresolved">{t("observability.unresolved", "Unresolved")}</option>
                  <option value="resolved">{t("observability.resolved", "Resolved")}</option>
                  <option value="error">Error</option>
                  <option value="fatal">Fatal</option>
                  <option value="warn">Warn</option>
                </select>
              </div>
              <Button variant="outline" size="sm" onClick={() => mutateErrors()}>
                <RefreshCw className="mr-2 size-4" />
                {t("common.refresh", "Refresh")}
              </Button>
            </div>

            {errorsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.timestamp", "Timestamp")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.severity", "Severity")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.errorType", "Type")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.message", "Message")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.service", "Service")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                        <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.actions", "Actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(errors.data || []).map((err: any) => (
                        <tr key={err.id} className="border-b border-border/50">
                          <td className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">{err.createdAt ? new Date(err.createdAt).toLocaleString() : "-"}</td>
                          <td className="py-2.5"><SeverityBadge severity={err.severity} /></td>
                          <td className="py-2.5 text-muted-foreground">{err.type}</td>
                          <td className="py-2.5 max-w-[250px] truncate">{err.message}</td>
                          <td className="py-2.5 text-muted-foreground">{err.service || "-"}</td>
                          <td className="py-2.5">
                            <Badge tone={err.resolved ? "success" : "default"}>
                              {err.resolved ? t("observability.resolved", "Resolved") : t("observability.open", "Open")}
                            </Badge>
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-1">
                              {!err.resolved && (
                                <Button variant="ghost" size="sm" onClick={() => handleResolveError(err.id)}>
                                  <CheckCircle className="size-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteError(err.id)}>
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(!errors.data || errors.data.length === 0) && (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-muted-foreground">{t("common.noData", "No data available")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                  <span>{t("observability.showing", "Showing")} {(errors.data || []).length} {t("observability.of", "of")} {errors.total}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={errorPage <= 1} onClick={() => setErrorPage(p => p - 1)}>
                      {t("common.previous", "Previous")}
                    </Button>
                    <span>{errors.page} / {Math.ceil((errors.total || 0) / (errors.limit || 50)) || 1}</span>
                    <Button variant="outline" size="sm" disabled={(errors.data || []).length < (errors.limit || 50)} onClick={() => setErrorPage(p => p + 1)}>
                      {t("common.next", "Next")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DashboardCard>
        </div>
      )}

      {tab === "alerts" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge tone="muted">{t("observability.activeAlerts", "Active")}: {alerts.filter((a: any) => a.status === "firing").length}</Badge>
                <Badge tone="info">{t("observability.acknowledged", "Acknowledged")}: {alerts.filter((a: any) => a.status === "acknowledged").length}</Badge>
                <Badge tone="success">{t("observability.resolved", "Resolved")}: {alerts.filter((a: any) => a.status === "resolved").length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setShowCreateAlert(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("observability.createAlert", "Create Alert")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => mutateAlerts()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
              </div>
            </div>

            {alertsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.ruleName", "Rule")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.title", "Title")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.severity", "Severity")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.category", "Category")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.service", "Service")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.createdAt", "Created")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert: any) => (
                      <tr key={alert.id} className="border-b border-border/50">
                        <td className="py-2.5 font-medium">{alert.ruleName}</td>
                        <td className="py-2.5">{alert.title}</td>
                        <td className="py-2.5"><SeverityBadge severity={alert.severity} /></td>
                        <td className="py-2.5 text-muted-foreground">{alert.category}</td>
                        <td className="py-2.5"><StatusBadge status={alert.status} /></td>
                        <td className="py-2.5 text-muted-foreground">{alert.service || "-"}</td>
                        <td className="py-2.5 text-xs text-muted-foreground">{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "-"}</td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1">
                            {alert.status === "firing" && (
                              <Button variant="ghost" size="sm" onClick={() => handleAcknowledgeAlert(alert.id)}>
                                <Shield className="size-4" />
                              </Button>
                            )}
                            {alert.status !== "resolved" && (
                              <Button variant="ghost" size="sm" onClick={() => handleResolveAlert(alert.id)}>
                                <CheckCircle className="size-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAlert(alert.id)}>
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {alerts.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-muted-foreground">{t("observability.noAlerts", "No alerts configured")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>

          {showCreateAlert && (
            <DashboardCard title={t("observability.createAlert", "Create Alert")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t("observability.ruleName", "Rule Name")} *</Label>
                  <Input value={newAlert.ruleName} onChange={(e) => setNewAlert({ ...newAlert, ruleName: e.target.value })} placeholder={t("observability.ruleNamePlaceholder", "e.g. High Latency")} className="mt-1" />
                </div>
                <div>
                  <Label>{t("common.title", "Title")} *</Label>
                  <Input value={newAlert.title} onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })} placeholder={t("observability.titlePlaceholder", "Alert title")} className="mt-1" />
                </div>
                <div>
                  <Label>{t("observability.category", "Category")}</Label>
                  <select value={newAlert.category} onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="threshold">Threshold</option>
                    <option value="anomaly">Anomaly</option>
                    <option value="availability">Availability</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <Label>{t("observability.severity", "Severity")}</Label>
                  <select value={newAlert.severity} onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="critical">Critical</option>
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                  </select>
                </div>
                <div>
                  <Label>{t("observability.service", "Service")}</Label>
                  <Input value={newAlert.service} onChange={(e) => setNewAlert({ ...newAlert, service: e.target.value })} placeholder={t("observability.servicePlaceholder", "Service name")} className="mt-1" />
                </div>
                <div>
                  <Label>{t("observability.metricName", "Metric Name")}</Label>
                  <Input value={newAlert.metricName} onChange={(e) => setNewAlert({ ...newAlert, metricName: e.target.value })} placeholder={t("observability.metricNamePlaceholder", "e.g. response_time")} className="mt-1" />
                </div>
                <div>
                  <Label>{t("observability.threshold", "Threshold")}</Label>
                  <Input type="number" value={newAlert.threshold} onChange={(e) => setNewAlert({ ...newAlert, threshold: Number(e.target.value) })} className="mt-1" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowCreateAlert(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleCreateAlert}>
                  {t("common.create", "Create")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "performance" && (
        <div className="space-y-6">
          <DashboardCard title={t("observability.performanceAnalysis", "Performance Analysis")}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Timer className="size-4" />
                  {t("observability.avgTraceDuration", "Avg Trace Duration")}
                </div>
                <p className="mt-2 text-2xl font-semibold">{stats?.traces?.avgDuration ?? 0}ms</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="size-4 text-red-500" />
                  {t("observability.errorRate", "Error Rate")}
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {stats?.traces?.total ? Math.round(((stats.errors?.unresolved ?? 0) / (stats.traces.total || 1)) * 10000) / 100 : 0}%
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="size-4 text-amber-500" />
                  {t("observability.slowTracesCount", "Slow Traces")}
                </div>
                <p className="mt-2 text-2xl font-semibold">{slowTraces.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Layers className="size-4" />
                  {t("observability.totalServices", "Services")}
                </div>
                <p className="mt-2 text-2xl font-semibold">{stats?.traces?.byService?.length ?? 0}</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title={t("observability.servicePerformance", "Service Performance")}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.service", "Service")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.totalSpans", "Spans")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.avgDuration", "Avg Duration")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("observability.health", "Health")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.traces?.byService || []).map((svc: any) => (
                    <tr key={svc.service} className="border-b border-border/50">
                      <td className="py-3 font-medium">{svc.service}</td>
                      <td className="py-3">{svc.count}</td>
                      <td className="py-3">{Math.round(svc.avgDuration)}ms</td>
                      <td className="py-3">
                        <Badge tone={svc.avgDuration < 500 ? "success" : svc.avgDuration < 2000 ? "warning" : "default"}>
                          {svc.avgDuration < 500 ? t("observability.good", "Good") : svc.avgDuration < 2000 ? t("observability.degraded", "Degraded") : t("observability.poor", "Poor")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.traces?.byService || stats.traces.byService.length === 0) && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">{t("common.noData", "No data available")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>
      )}

      {tab === "dashboards" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("observability.dashboards", "Dashboards")}</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setShowCreateDashboard(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("observability.createDashboard", "Create Dashboard")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => mutateDashboards()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
              </div>
            </div>

            {dashboardsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : dashboards.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <LayoutDashboard className="size-8 mx-auto mb-2" />
                <p className="text-sm">{t("observability.noDashboards", "No dashboards created yet")}</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dashboards.map((d: any) => (
                  <div key={d.id} className="rounded-xl border border-border bg-muted/10 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{d.name}</p>
                        {d.description && <p className="text-xs text-muted-foreground mt-1">{d.description}</p>}
                      </div>
                      {d.isDefault && <Badge tone="info">Default</Badge>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : ""}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteDashboard(d.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          {showCreateDashboard && (
            <DashboardCard title={t("observability.createDashboard", "Create Dashboard")}>
              <div className="grid gap-4">
                <div>
                  <Label>{t("common.name", "Name")} *</Label>
                  <Input value={newDashboard.name} onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })} placeholder={t("observability.dashboardNamePlaceholder", "Dashboard name")} className="mt-1" />
                </div>
                <div>
                  <Label>{t("observability.description", "Description")}</Label>
                  <Input value={newDashboard.description} onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })} placeholder={t("observability.dashboardDescPlaceholder", "Optional description")} className="mt-1" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowCreateDashboard(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleCreateDashboard}>
                  {t("common.create", "Create")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("observability.reports", "Reports")}</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setShowCreateReport(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("observability.generateReport", "Generate Report")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => mutateReports()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
              </div>
            </div>

            {reportsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="size-8 mx-auto mb-2" />
                <p className="text-sm">{t("observability.noReports", "No reports generated yet")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reports.map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{report.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.reportType} {report.period ? `(${report.period})` : ""} - {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="muted">{report.reportType}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(report.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          {showCreateReport && (
            <DashboardCard title={t("observability.generateReport", "Generate Report")}>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label>{t("common.title", "Title")} *</Label>
                  <Input value={newReport.title} onChange={(e) => setNewReport({ ...newReport, title: e.target.value })} placeholder={t("observability.reportTitlePlaceholder", "Report title")} className="mt-1" />
                </div>
                <div>
                  <Label>{t("observability.reportType", "Type")}</Label>
                  <select value={newReport.reportType} onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="metrics">Metrics</option>
                    <option value="logs">Logs</option>
                    <option value="traces">Traces</option>
                    <option value="errors">Errors</option>
                    <option value="performance">Performance</option>
                    <option value="summary">Summary</option>
                  </select>
                </div>
                <div>
                  <Label>{t("observability.period", "Period")}</Label>
                  <select value={newReport.period} onChange={(e) => setNewReport({ ...newReport, period: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowCreateReport(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleCreateReport}>
                  {t("observability.generate", "Generate")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-6">
          <DashboardCard title={t("observability.featureToggles", "Feature Toggles")}>
            {settingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : settingsForm ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { key: "metricsEnabled", label: t("observability.metricsEnabled", "Metrics Collection") },
                    { key: "loggingEnabled", label: t("observability.loggingEnabled", "Logging") },
                    { key: "tracingEnabled", label: t("observability.tracingEnabled", "Distributed Tracing") },
                    { key: "alertingEnabled", label: t("observability.alertingEnabled", "Alerting") },
                    { key: "correlationEnabled", label: t("observability.correlationEnabled", "Correlation IDs") },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2">
                        {settingsForm[key] ? <Eye className="size-4 text-green-500" /> : <EyeOff className="size-4 text-muted-foreground" />}
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <button
                        onClick={() => setSettingsForm({ ...settingsForm, [key]: !settingsForm[key] })}
                        className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                          settingsForm[key] ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                        )}
                      >
                        <span className={cn("inline-block size-3.5 rounded-full bg-white transition-transform",
                          settingsForm[key] ? "translate-x-4.5" : "translate-x-0.5"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>{t("observability.samplingRate", "Sampling Rate")}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settingsForm.samplingRate ?? 1}
                      onChange={(e) => setSettingsForm({ ...settingsForm, samplingRate: Number(e.target.value) })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t("observability.samplingRateHint", "0.0 to 1.0, fraction of traces to sample")}</p>
                  </div>
                  <div>
                    <Label>{t("observability.maxLogSize", "Max Log Size")}</Label>
                    <Input
                      type="number"
                      min="1000"
                      value={settingsForm.maxLogSize ?? 10000}
                      onChange={(e) => setSettingsForm({ ...settingsForm, maxLogSize: Number(e.target.value) })}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">{t("observability.maxLogSizeHint", "Maximum characters per log entry")}</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button size="sm" onClick={handleSaveSettings}>
                    {t("common.save", "Save Settings")}
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">{t("common.noData", "No data available")}</p>
            )}
          </DashboardCard>

          <DashboardCard title={t("observability.retentionPolicies", "Retention Policies")}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>{t("observability.dataType", "Data Type")}</Label>
                <select
                  value={retentionForm.dataType}
                  onChange={(e) => setRetentionForm({ ...retentionForm, dataType: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="logs">{t("observability.logs", "Logs")}</option>
                  <option value="metrics">{t("observability.metrics", "Metrics")}</option>
                  <option value="traces">{t("observability.traces", "Traces")}</option>
                  <option value="errors">{t("observability.errors", "Errors")}</option>
                  <option value="alerts">{t("observability.alerts", "Alerts")}</option>
                </select>
              </div>
              <div>
                <Label>{t("observability.retentionDays", "Retention Days")}</Label>
                <Input
                  type="number"
                  min="1"
                  value={retentionForm.retentionDays}
                  onChange={(e) => setRetentionForm({ ...retentionForm, retentionDays: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button size="sm" onClick={handleSaveRetention}>
                  {t("observability.savePolicy", "Save Policy")}
                </Button>
              </div>
            </div>
          </DashboardCard>
        </div>
      )}
    </div>
  );
}
