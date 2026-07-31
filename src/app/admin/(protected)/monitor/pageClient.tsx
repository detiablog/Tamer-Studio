"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
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
  Bell,
  BellOff,
  Plus,
  Search,
  Download,
  ArrowRight,
  Shield,
  Cpu,
  Database,
  Globe,
  Server,
  Zap,
  Mail,
  BarChart3,
  GitBranch,
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

type Tab = "overview" | "health" | "alerts" | "incidents" | "metrics" | "dependencies";

function StatusDot({ status }: { status: string }) {
  const color =
    status === "healthy"
      ? "bg-green-500"
      : status === "warning"
        ? "bg-amber-500"
        : status === "critical"
          ? "bg-red-500"
          : "bg-gray-400";
  return <span className={cn("inline-block size-2.5 rounded-full", color)} />;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "healthy"
      ? "success"
      : status === "warning"
        ? "warning"
        : status === "critical"
          ? "default"
          : status === "resolved"
            ? "success"
            : status === "investigating"
              ? "warning"
              : status === "identified"
                ? "info"
                : status === "monitoring"
                  ? "purple"
                  : "muted";
  return <Badge tone={tone}>{status}</Badge>;
}

function SeverityBadge({ severity }: { severity: string }) {
  const tone =
    severity === "critical"
      ? "default"
      : severity === "high"
        ? "warning"
        : severity === "medium"
          ? "info"
          : severity === "low"
            ? "muted"
            : "default";
  return <Badge tone={tone}>{severity}</Badge>;
}

export function MonitorPageClient() {
  const { t } = useLocalizationContext();
  const [tab, setTab] = React.useState<Tab>("overview");
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [alertFilter, setAlertFilter] = React.useState("all");
  const [severityFilter, setSeverityFilter] = React.useState("all");
  const [runningCheck, setRunningCheck] = React.useState(false);
  const [showCreateAlert, setShowCreateAlert] = React.useState(false);
  const [showCreateIncident, setShowCreateIncident] = React.useState(false);
  const [selectedIncident, setSelectedIncident] = React.useState<any>(null);
  const [showUpdateIncident, setShowUpdateIncident] = React.useState(false);
  const [newAlert, setNewAlert] = React.useState({ name: "", type: "latency", severity: "warning", enabled: true });
  const [newIncident, setNewIncident] = React.useState({ title: "", description: "", severity: "medium", status: "investigating" });

  const { data: overviewData, isLoading: overviewLoading, mutate: mutateOverview } = useSWR(
    "/api/admin/monitoring/overview",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false, refreshInterval: autoRefresh ? 30000 : 0 }
  );

  const { data: healthData, isLoading: healthLoading, mutate: mutateHealth } = useSWR(
    "/api/admin/monitoring/health",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false, refreshInterval: autoRefresh ? 30000 : 0 }
  );

  const { data: alertsData, isLoading: alertsLoading, mutate: mutateAlerts } = useSWR(
    "/api/admin/monitoring/alerts",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: incidentsData, isLoading: incidentsLoading, mutate: mutateIncidents } = useSWR(
    "/api/admin/monitoring/incidents",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: metricsData, isLoading: metricsLoading } = useSWR(
    `/api/admin/monitoring/metrics?category=${categoryFilter}&from=${dateFrom}&to=${dateTo}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: depsData, isLoading: depsLoading } = useSWR(
    "/api/admin/monitoring/dependencies",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const overview = React.useMemo(() => {
    if (overviewData?.success && overviewData.data) return overviewData.data;
    return { status: "healthy", services: [], incidents: [], stats: {} };
  }, [overviewData]);

  const services = React.useMemo(() => {
    if (healthData?.success && Array.isArray(healthData.data)) return healthData.data;
    return [];
  }, [healthData]);

  const alerts = React.useMemo(() => {
    if (alertsData?.success && Array.isArray(alertsData.data)) return alertsData.data;
    return [];
  }, [alertsData]);

  const incidents = React.useMemo(() => {
    if (incidentsData?.success && Array.isArray(incidentsData.data)) return incidentsData.data;
    return [];
  }, [incidentsData]);

  const metrics = React.useMemo(() => {
    if (metricsData?.success && Array.isArray(metricsData.data)) return metricsData.data;
    return [];
  }, [metricsData]);

  const dependencies = React.useMemo(() => {
    if (depsData?.success && Array.isArray(depsData.data)) return depsData.data;
    return [];
  }, [depsData]);

  const stats = overview.stats || {};
  const systemStatus = overview.status || "healthy";

  const filteredAlerts = React.useMemo(() => {
    let result = alerts;
    if (alertFilter !== "all") {
      result = result.filter((a: any) => a.type === alertFilter);
    }
    if (severityFilter !== "all") {
      result = result.filter((a: any) => a.severity === severityFilter);
    }
    return result;
  }, [alerts, alertFilter, severityFilter]);

  const filteredMetrics = React.useMemo(() => {
    if (!searchQuery) return metrics;
    return metrics.filter(
      (m: any) =>
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.source?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [metrics, searchQuery]);

  const handleRunHealthCheck = async () => {
    setRunningCheck(true);
    try {
      const res = await fetch("/api/admin/monitoring/health/run", { method: "POST" });
      if (res.ok) {
        toast.success(t("admin.healthChecks", "Health check completed"));
        mutateHealth();
        mutateOverview();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
    setRunningCheck(false);
  };

  const handleCreateAlert = async () => {
    if (!newAlert.name) {
      toast.error(t("admin.missingFields", "Please fill in all fields."));
      return;
    }
    try {
      const res = await fetch("/api/admin/monitoring/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });
      if (res.ok) {
        toast.success(t("admin.alertCreated", "Alert created"));
        setShowCreateAlert(false);
        setNewAlert({ name: "", type: "latency", severity: "warning", enabled: true });
        mutateAlerts();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleToggleAlert = async (id: string, enabled: boolean) => {
    try {
      await fetch(`/api/admin/monitoring/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      mutateAlerts();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleCreateIncident = async () => {
    if (!newIncident.title) {
      toast.error(t("admin.missingFields", "Please fill in all fields."));
      return;
    }
    try {
      const res = await fetch("/api/admin/monitoring/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncident),
      });
      if (res.ok) {
        toast.success(t("admin.incidentCreated", "Incident created"));
        setShowCreateIncident(false);
        setNewIncident({ title: "", description: "", severity: "medium", status: "investigating" });
        mutateIncidents();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleUpdateIncidentStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/monitoring/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast.success(t("admin.incidentUpdated", "Incident updated"));
      setShowUpdateIncident(false);
      setSelectedIncident(null);
      mutateIncidents();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleExportMetrics = () => {
    const headers = "Name,Category,Value,Unit,Source,Recorded At\n";
    const rows = filteredMetrics.map((m: any) => `${m.name},${m.category},${m.value},${m.unit},${m.source},${m.recordedAt}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `metrics-export.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("admin.metricsExported", "Metrics exported"));
  };

  const serviceIcon = (type: string) => {
    switch (type) {
      case "database":
        return <Database className="size-4" />;
      case "api":
        return <Globe className="size-4" />;
      case "compute":
        return <Cpu className="size-4" />;
      case "storage":
        return <Server className="size-4" />;
      case "email":
        return <Mail className="size-4" />;
      case "queue":
        return <GitBranch className="size-4" />;
      default:
        return <Activity className="size-4" />;
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t("admin.overview", "Overview") },
    { key: "health", label: t("admin.healthChecks", "Health Checks") },
    { key: "alerts", label: t("admin.alerts", "Alerts") },
    { key: "incidents", label: t("admin.incidents", "Incidents") },
    { key: "metrics", label: t("admin.metrics", "Metrics") },
    { key: "dependencies", label: t("admin.dependencies", "Dependencies") },
  ];

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.monitor", "System Monitor") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.monitor", "System Monitor")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.monitorDescription", "System health, metrics, alerts, and incidents")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-muted/40" />
                <div className="mt-3 h-7 w-24 animate-pulse rounded bg-muted/40" />
              </div>
            ))}
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
      <Breadcrumbs items={[{ label: t("admin.monitor", "System Monitor") }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold leading-tight">{t("admin.monitor", "System Monitor")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t("admin.monitorDescription", "System health, metrics, alerts, and incidents")}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {tabs.map((t_item) => (
          <button
            key={t_item.key}
            onClick={() => setTab(t_item.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t_item.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t_item.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                systemStatus === "healthy" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                systemStatus === "warning" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              )}>
                <StatusDot status={systemStatus} />
                {systemStatus === "healthy"
                  ? t("admin.allHealthy", "All systems operational")
                  : systemStatus === "warning"
                    ? t("admin.someIssues", "Some systems have issues")
                    : t("admin.criticalIssues", "Critical issues detected")}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4 lg:grid-cols-7">
              {[
                { label: t("admin.totalServices", "Total Services"), value: stats.totalServices ?? services.length, icon: <Server className="size-4" /> },
                { label: t("admin.healthyServices", "Healthy"), value: stats.healthy ?? services.filter((s: any) => s.status === "healthy").length, icon: <CheckCircle className="size-4 text-green-500" /> },
                { label: t("admin.warningServices", "Warning"), value: stats.warning ?? services.filter((s: any) => s.status === "warning").length, icon: <AlertTriangle className="size-4 text-amber-500" /> },
                { label: t("admin.criticalServices", "Critical"), value: stats.critical ?? services.filter((s: any) => s.status === "critical").length, icon: <XCircle className="size-4 text-red-500" /> },
                { label: t("admin.offlineServices", "Offline"), value: stats.offline ?? services.filter((s: any) => s.status === "offline").length, icon: <XCircle className="size-4 text-gray-400" /> },
                { label: t("admin.activeAlerts", "Active Alerts"), value: stats.activeAlerts ?? alerts.filter((a: any) => a.enabled).length, icon: <Bell className="size-4" /> },
                { label: t("admin.openIncidents", "Open Incidents"), value: stats.openIncidents ?? incidents.filter((i: any) => i.status !== "resolved").length, icon: <Shield className="size-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title={t("admin.serviceHealth", "Service Health")}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service: any) => (
                <div key={service.name} className="flex items-center gap-3 rounded-xl border border-border bg-muted/10 p-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted/40">
                    {serviceIcon(service.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{service.name}</p>
                      <StatusDot status={service.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {service.latency != null ? `${service.latency}ms` : t("common.notApplicable", "N/A")}
                    </p>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center col-span-full">{t("common.noData", "No data available")}</p>
              )}
            </div>
          </DashboardCard>

          <DashboardCard title={t("admin.recentIncidents", "Recent Incidents")}>
            {incidents.length > 0 ? (
              <div className="space-y-2">
                {incidents.slice(0, 5).map((incident: any) => (
                  <div key={incident.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <SeverityBadge severity={incident.severity} />
                      <div>
                        <p className="text-sm font-medium">{incident.title}</p>
                        <p className="text-xs text-muted-foreground">{incident.createdAt}</p>
                      </div>
                    </div>
                    <StatusBadge status={incident.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">{t("admin.noIncidents", "No incidents reported")}</p>
            )}
          </DashboardCard>
        </div>
      )}

      {tab === "health" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRunHealthCheck} disabled={runningCheck}>
                  {runningCheck ? (
                    <Loader className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 size-4" />
                  )}
                  {runningCheck ? t("admin.runningCheck", "Running health check...") : t("admin.runHealthCheck", "Run Health Check")}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={autoRefresh ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  {autoRefresh ? <BellOff className="mr-2 size-4" /> : <Bell className="mr-2 size-4" />}
                  {t("admin.autoRefresh", "Auto Refresh")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => mutateHealth()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.name", "Name")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.type", "Type")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.responseTime", "Latency")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.lastChecked", "Last Checked")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.lastError", "Last Error")}</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service: any) => (
                    <tr key={service.name} className="border-b border-border/50">
                      <td className="py-3 font-medium">{service.name}</td>
                      <td className="py-3 text-muted-foreground">{service.type}</td>
                      <td className="py-3"><StatusBadge status={service.status} /></td>
                      <td className="py-3">{service.latency != null ? `${service.latency}ms` : "-"}</td>
                      <td className="py-3 text-muted-foreground">{service.lastChecked || "-"}</td>
                      <td className="py-3 text-muted-foreground text-xs max-w-[200px] truncate">{service.lastError || "-"}</td>
                    </tr>
                  ))}
                  {services.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">{t("common.noData", "No data available")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>
      )}

      {tab === "alerts" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <select
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t("common.all", "All")}</option>
                  <option value="latency">{t("admin.alertTypeLatency", "Latency")}</option>
                  <option value="error_rate">{t("admin.alertTypeErrorRate", "Error Rate")}</option>
                  <option value="uptime">{t("admin.alertTypeUptime", "Uptime")}</option>
                  <option value="custom">{t("admin.alertTypeCustom", "Custom")}</option>
                </select>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t("common.all", "All")}</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <Button size="sm" onClick={() => setShowCreateAlert(true)}>
                <Plus className="mr-2 size-4" />
                {t("admin.createAlert", "Create Alert")}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.alertName", "Alert Name")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.alertType", "Type")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.alertSeverity", "Severity")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.active", "Active")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.lastTriggered", "Last Triggered")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.triggerCount", "Trigger Count")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map((alert: any) => (
                    <tr key={alert.id} className="border-b border-border/50">
                      <td className="py-3 font-medium">{alert.name}</td>
                      <td className="py-3 text-muted-foreground">{alert.type}</td>
                      <td className="py-3"><SeverityBadge severity={alert.severity} /></td>
                      <td className="py-3">
                        <button
                          onClick={() => handleToggleAlert(alert.id, !alert.enabled)}
                          className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                            alert.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                          )}
                        >
                          <span className={cn("inline-block size-3.5 rounded-full bg-white transition-transform",
                            alert.enabled ? "translate-x-4.5" : "translate-x-0.5"
                          )} />
                        </button>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">{alert.lastTriggered || "-"}</td>
                      <td className="py-3">{alert.triggerCount ?? 0}</td>
                    </tr>
                  ))}
                  {filteredAlerts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">{t("admin.noAlerts", "No alerts configured")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {showCreateAlert && (
            <DashboardCard title={t("admin.createAlert", "Create Alert")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t("admin.alertName", "Alert Name")}</Label>
                  <Input
                    value={newAlert.name}
                    onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                    placeholder={t("admin.alertNamePlaceholder", "e.g. High Latency Alert")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("admin.alertType", "Type")}</Label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="latency">Latency</option>
                    <option value="error_rate">Error Rate</option>
                    <option value="uptime">Uptime</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <Label>{t("admin.alertSeverity", "Severity")}</Label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
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

      {tab === "incidents" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("admin.incidents", "Incidents")}</h3>
              <Button size="sm" onClick={() => setShowCreateIncident(true)}>
                <Plus className="mr-2 size-4" />
                {t("admin.createIncident", "Create Incident")}
              </Button>
            </div>

            {selectedIncident ? (
              <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedIncident(null)}>
                  {t("common.back", "Back")}
                </Button>
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold">{selectedIncident.title}</h4>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={selectedIncident.severity} />
                      <StatusBadge status={selectedIncident.status} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{selectedIncident.description}</p>
                  <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                    <Clock className="size-3" />
                    {t("admin.createdAt", "Created")}: {selectedIncident.createdAt}
                  </div>
                  {selectedIncident.affectedServices && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("admin.affectedServices", "Affected Services")}</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedIncident.affectedServices.map((s: string) => (
                          <Badge key={s} tone="muted">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedIncident.timeline && selectedIncident.timeline.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">{t("admin.timeline", "Timeline")}</p>
                      <div className="space-y-2">
                        {selectedIncident.timeline.map((event: any, idx: number) => (
                          <div key={idx} className="flex gap-3 text-sm">
                            <span className="text-muted-foreground text-xs whitespace-nowrap">{event.time}</span>
                            <StatusBadge status={event.status} />
                            <span>{event.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedIncident.status !== "resolved" && (
                    <div className="mt-4 flex gap-2">
                      {["investigating", "identified", "monitoring", "resolved"].map((status) => (
                        <Button
                          key={status}
                          variant={selectedIncident.status === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleUpdateIncidentStatus(selectedIncident.id, status)}
                        >
                          {t(`admin.${status}`, status)}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.incidentTitle", "Title")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.incidentSeverity", "Severity")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.incidentStatus", "Status")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.affectedServices", "Affected")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.createdAt", "Created")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((incident: any) => (
                      <tr
                        key={incident.id}
                        className="border-b border-border/50 cursor-pointer hover:bg-muted/30"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <td className="py-3 font-medium">{incident.title}</td>
                        <td className="py-3"><SeverityBadge severity={incident.severity} /></td>
                        <td className="py-3"><StatusBadge status={incident.status} /></td>
                        <td className="py-3 text-muted-foreground">
                          {incident.affectedServices?.join(", ") || "-"}
                        </td>
                        <td className="py-3 text-muted-foreground text-xs">{incident.createdAt}</td>
                      </tr>
                    ))}
                    {incidents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">{t("admin.noIncidents", "No incidents reported")}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>

          {showCreateIncident && (
            <DashboardCard title={t("admin.createIncident", "Create Incident")}>
              <div className="grid gap-4">
                <div>
                  <Label>{t("admin.incidentTitle", "Title")}</Label>
                  <Input
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    placeholder={t("admin.incidentTitlePlaceholder", "e.g. Database Latency Spike")}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("admin.incidentDescription", "Description")}</Label>
                  <textarea
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    placeholder={t("admin.incidentDescriptionPlaceholder", "Describe the incident...")}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>{t("admin.incidentSeverity", "Severity")}</Label>
                    <select
                      value={newIncident.severity}
                      onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <Label>{t("admin.incidentStatus", "Status")}</Label>
                    <select
                      value={newIncident.status}
                      onChange={(e) => setNewIncident({ ...newIncident, status: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="investigating">{t("admin.investigating", "Investigating")}</option>
                      <option value="identified">{t("admin.identified", "Identified")}</option>
                      <option value="monitoring">{t("admin.monitoring", "Monitoring")}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowCreateIncident(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleCreateIncident}>
                  {t("common.create", "Create")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "metrics" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t("common.all", "All")}</option>
                  <option value="performance">{t("admin.performance", "Performance")}</option>
                  <option value="usage">{t("common.usage", "Usage")}</option>
                  <option value="storage">{t("common.storage", "Storage")}</option>
                  <option value="network">{t("admin.network", "Network")}</option>
                </select>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportMetrics}>
                  <Download className="mr-2 size-4" />
                  {t("common.export", "Export")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => mutateOverview()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("common.search", "Search...")}
                className="pl-9"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.name", "Name")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.metricsCategory", "Category")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.metricsValue", "Value")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.unit", "Unit")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.source", "Source")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.recordedAt", "Recorded At")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMetrics.map((metric: any, idx: number) => (
                    <tr key={idx} className="border-b border-border/50">
                      <td className="py-3 font-medium">{metric.name}</td>
                      <td className="py-3 text-muted-foreground">{metric.category}</td>
                      <td className="py-3">{metric.value}</td>
                      <td className="py-3 text-muted-foreground">{metric.unit}</td>
                      <td className="py-3 text-muted-foreground">{metric.source}</td>
                      <td className="py-3 text-muted-foreground text-xs">{metric.recordedAt}</td>
                    </tr>
                  ))}
                  {filteredMetrics.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">{t("admin.noMetrics", "No metrics recorded")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>
      )}

      {tab === "dependencies" && (
        <div className="space-y-6">
          <DashboardCard title={t("admin.serviceMap", "Service Dependency Map")}>
            {depsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : dependencies.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dependencies.map((dep: any) => (
                  <div key={dep.service} className="rounded-xl border border-border bg-muted/10 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      {serviceIcon(dep.type)}
                      <p className="font-medium">{dep.service}</p>
                      <StatusDot status={dep.status} />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ArrowRight className="size-3" />
                      <span>{t("admin.dependsOn", "depends on")}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {dep.dependencies?.map((d: string) => (
                        <Badge key={d} tone="muted">{d}</Badge>
                      ))}
                      {(!dep.dependencies || dep.dependencies.length === 0) && (
                        <span className="text-xs text-muted-foreground">{t("admin.noDependencies", "No dependencies")}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <GitBranch className="size-8 mb-2" />
                <p className="text-sm">{t("common.noData", "No data available")}</p>
              </div>
            )}
          </DashboardCard>
        </div>
      )}
    </div>
  );
}
