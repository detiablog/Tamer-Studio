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
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  AlertOctagon,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  FileText,
  HardDrive,
  LayoutDashboard,
  Loader,
  MemoryStick,
  RefreshCw,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  Trash2,
  XCircle,
  Plus,
  Bell,
  BellOff,
  Wifi,
  Wrench,
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

type Tab = "overview" | "infrastructure" | "alerts" | "incidents" | "deployments" | "maintenance" | "audit" | "reports" | "settings";

function StatusDot({ status }: { status: string }) {
  const color =
    status === "healthy"
      ? "bg-green-500"
      : status === "ok"
        ? "bg-green-500"
        : status === "active"
          ? "bg-green-500"
          : status === "warning"
            ? "bg-amber-500"
            : status === "degraded"
              ? "bg-amber-500"
              : status === "pending"
                ? "bg-amber-500"
                : status === "critical"
                  ? "bg-red-500"
                  : status === "emergency"
                    ? "bg-red-500"
                    : status === "failed"
                      ? "bg-red-500"
                      : status === "down"
                        ? "bg-red-500"
                        : "bg-gray-400";
  return <span className={cn("inline-block size-2.5 rounded-full", color)} />;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "healthy" || status === "ok" || status === "active" || status === "resolved" || status === "completed"
      ? "success"
      : status === "warning" || status === "degraded" || status === "pending" || status === "acknowledged"
        ? "warning"
        : status === "critical" || status === "emergency" || status === "failed" || status === "open"
          ? "default"
          : "muted";
  return <Badge tone={tone}>{status}</Badge>;
}

export function OperationsPageClient() {
  const { t } = useLocalizationContext();
  const [tab, setTab] = React.useState<Tab>("overview");
  const [alertFilter, setAlertFilter] = React.useState("all");
  const [showCreateAlert, setShowCreateAlert] = React.useState(false);
  const [showCreateIncident, setShowCreateIncident] = React.useState(false);
  const [showCreateDeployment, setShowCreateDeployment] = React.useState(false);
  const [showCreateMaintenance, setShowCreateMaintenance] = React.useState(false);
  const [showGenerateReport, setShowGenerateReport] = React.useState(false);

  const [newAlert, setNewAlert] = React.useState({ severity: "warning", category: "", title: "", message: "" });
  const [newIncident, setNewIncident] = React.useState({ title: "", description: "", severity: "medium", category: "", impact: "" });
  const [newDeployment, setNewDeployment] = React.useState({ version: "", environment: "production", commitHash: "", notes: "" });
  const [newMaintenance, setNewMaintenance] = React.useState({ title: "", description: "", scheduledAt: "", message: "" });
  const [newReport, setNewReport] = React.useState({ reportType: "daily", title: "", period: "" });
  const [settingsForm, setSettingsForm] = React.useState({ alertEmails: "", healthCheckIntervalMs: 30000, retentionDays: 30 });

  const { data: overviewData, isLoading: overviewLoading, mutate: mutateOverview } = useSWR("/api/operations/overview", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR("/api/operations/stats", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: healthData, isLoading: healthLoading, mutate: mutateHealth } = useSWR("/api/operations/health", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: trendData } = useSWR("/api/operations/health/trend?hours=24", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: alertsData, isLoading: alertsLoading, mutate: mutateAlerts } = useSWR(`/api/operations/alerts${alertFilter !== "all" ? `?status=${alertFilter}` : ""}`, fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: incidentsData, isLoading: incidentsLoading, mutate: mutateIncidents } = useSWR("/api/operations/incidents", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: deploymentsData, isLoading: deploymentsLoading, mutate: mutateDeployments } = useSWR("/api/operations/deployments", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: maintenanceData, isLoading: maintenanceLoading, mutate: mutateMaintenance } = useSWR("/api/operations/maintenance", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: auditData, isLoading: auditLoading, mutate: mutateAudit } = useSWR("/api/operations/audit", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: reportsData, isLoading: reportsLoading, mutate: mutateReports } = useSWR("/api/operations/reports", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });
  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR("/api/operations/settings", fetcher, { revalidateOnFocus: false, shouldRetryOnError: false });

  const overview = overviewData?.success ? overviewData.data : null;
  const stats = statsData?.success ? statsData.data : null;
  const health = healthData?.success ? healthData.data : null;
  const alerts = alertsData?.success && Array.isArray(alertsData.data) ? alertsData.data : [];
  const incidents = incidentsData?.success && Array.isArray(incidentsData.data) ? incidentsData.data : [];
  const deployments = deploymentsData?.success && Array.isArray(deploymentsData.data) ? deploymentsData.data : [];
  const maintenance = maintenanceData?.success && Array.isArray(maintenanceData.data) ? maintenanceData.data : [];
  const auditEvents = auditData?.success && Array.isArray(auditData.data) ? auditData.data : [];
  const reports = reportsData?.success && Array.isArray(reportsData.data) ? reportsData.data : [];
  const settings = settingsData?.success ? settingsData.data : null;

  React.useEffect(() => {
    if (settings) {
      setSettingsForm({
        alertEmails: Array.isArray(settings.alertEmails) ? settings.alertEmails.join(", ") : "",
        healthCheckIntervalMs: settings.healthCheckIntervalMs || 30000,
        retentionDays: settings.retentionDays || 30,
      });
    }
  }, [settings]);

  const handleCreateAlert = async () => {
    if (!newAlert.title || !newAlert.category) {
      toast.error(t("operations.error.missingFields", "Please fill in all required fields."));
      return;
    }
    try {
      const res = await fetch("/api/operations/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });
      if (res.ok) {
        toast.success(t("operations.alert.created", "Alert created"));
        setShowCreateAlert(false);
        setNewAlert({ severity: "warning", category: "", title: "", message: "" });
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
      const res = await fetch(`/api/operations/alerts/${id}/acknowledge`, { method: "POST" });
      if (res.ok) {
        toast.success(t("operations.alert.acknowledged", "Alert acknowledged"));
        mutateAlerts();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/operations/alerts/${id}/resolve`, { method: "POST" });
      if (res.ok) {
        toast.success(t("operations.alert.resolved", "Alert resolved"));
        mutateAlerts();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/operations/alerts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("operations.alert.deleted", "Alert deleted"));
        mutateAlerts();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleCreateIncident = async () => {
    if (!newIncident.title || !newIncident.category) {
      toast.error(t("operations.error.missingFields", "Please fill in all required fields."));
      return;
    }
    try {
      const res = await fetch("/api/operations/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncident),
      });
      if (res.ok) {
        toast.success(t("operations.incident.created", "Incident created"));
        setShowCreateIncident(false);
        setNewIncident({ title: "", description: "", severity: "medium", category: "", impact: "" });
        mutateIncidents();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleResolveIncident = async (id: string) => {
    try {
      const res = await fetch(`/api/operations/incidents/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: "Auto-resolved from dashboard" }),
      });
      if (res.ok) {
        toast.success(t("operations.incident.resolved", "Incident resolved"));
        mutateIncidents();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleCreateDeployment = async () => {
    if (!newDeployment.version) {
      toast.error(t("operations.error.missingFields", "Please fill in all required fields."));
      return;
    }
    try {
      const res = await fetch("/api/operations/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDeployment),
      });
      if (res.ok) {
        toast.success(t("operations.deployment.created", "Deployment created"));
        setShowCreateDeployment(false);
        setNewDeployment({ version: "", environment: "production", commitHash: "", notes: "" });
        mutateDeployments();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleCreateMaintenance = async () => {
    if (!newMaintenance.title) {
      toast.error(t("operations.error.missingFields", "Please fill in all required fields."));
      return;
    }
    try {
      const res = await fetch("/api/operations/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMaintenance),
      });
      if (res.ok) {
        toast.success(t("operations.maintenance.created", "Maintenance scheduled"));
        setShowCreateMaintenance(false);
        setNewMaintenance({ title: "", description: "", scheduledAt: "", message: "" });
        mutateMaintenance();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleStartMaintenance = async (id: string) => {
    try {
      const res = await fetch(`/api/operations/maintenance/${id}/start`, { method: "POST" });
      if (res.ok) {
        toast.success(t("operations.maintenance.started", "Maintenance started"));
        mutateMaintenance();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleToggleMaintenance = async (enabled: boolean) => {
    try {
      const res = await fetch("/api/operations/settings/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, message: settings?.maintenanceMessage || "System is under maintenance" }),
      });
      if (res.ok) {
        toast.success(enabled ? t("operations.maintenance.modeEnabled", "Maintenance mode enabled") : t("operations.maintenance.modeDisabled", "Maintenance mode disabled"));
        mutateSettings();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/operations/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alertEmails: settingsForm.alertEmails.split(",").map((e: string) => e.trim()).filter(Boolean),
          healthCheckIntervalMs: settingsForm.healthCheckIntervalMs,
          retentionDays: settingsForm.retentionDays,
        }),
      });
      if (res.ok) {
        toast.success(t("operations.settings.saved", "Settings saved"));
        mutateSettings();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleGenerateReport = async () => {
    if (!newReport.title) {
      toast.error(t("operations.error.missingFields", "Please fill in all required fields."));
      return;
    }
    try {
      const res = await fetch("/api/operations/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });
      if (res.ok) {
        toast.success(t("operations.report.generated", "Report generated"));
        setShowGenerateReport(false);
        setNewReport({ reportType: "daily", title: "", period: "" });
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
      const res = await fetch(`/api/operations/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("operations.report.deleted", "Report deleted"));
        mutateReports();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleTakeSnapshot = async () => {
    try {
      const res = await fetch("/api/operations/health/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overallStatus: health?.status || "unknown",
          databaseStatus: health?.database || "unknown",
          redisStatus: health?.redis || "unknown",
          storageStatus: health?.storage || "unknown",
          cpuUsage: health?.cpuUsage || 0,
          memoryUsage: health?.memoryUsage || 0,
          diskUsage: health?.diskUsage || 0,
        }),
      });
      if (res.ok) {
        toast.success(t("operations.health.snapshotTaken", "Health snapshot taken"));
        mutateHealth();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t("operations.tab.overview", "Overview") },
    { key: "infrastructure", label: t("operations.tab.infrastructure", "Infrastructure") },
    { key: "alerts", label: t("operations.tab.alerts", "Alerts") },
    { key: "incidents", label: t("operations.tab.incidents", "Incidents") },
    { key: "deployments", label: t("operations.tab.deployments", "Deployments") },
    { key: "maintenance", label: t("operations.tab.maintenance", "Maintenance") },
    { key: "audit", label: t("operations.tab.audit", "Audit Logs") },
    { key: "reports", label: t("operations.tab.reports", "Reports") },
    { key: "settings", label: t("operations.tab.settings", "Settings") },
  ];

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("operations.operations", "Operations") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("operations.operations", "Operations")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("operations.operationsDescription", "System health, alerts, incidents, and operational management")}</p>
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
      <Breadcrumbs items={[{ label: t("operations.operations", "Operations") }]} />
      <PageHeader
        title={t("operations.operations", "Operations")}
        description={t("operations.operationsDescription", "System health, alerts, incidents, and operational management")}
      />

      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 overflow-x-auto">
        {tabs.map((t_item) => (
          <button
            key={t_item.key}
            onClick={() => setTab(t_item.key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap",
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t("operations.overview.systemHealth", "System Health"), value: overview?.health?.status || "unknown", icon: <Activity className="size-4" />, badge: overview?.health?.status },
                { label: t("operations.overview.openAlerts", "Open Alerts"), value: overview?.alerts?.open ?? 0, icon: <Bell className="size-4" /> },
                { label: t("operations.overview.criticalAlerts", "Critical Alerts"), value: overview?.alerts?.critical ?? 0, icon: <AlertOctagon className="size-4" /> },
                { label: t("operations.overview.openIncidents", "Open Incidents"), value: overview?.incidents?.open ?? 0, icon: <AlertTriangle className="size-4" /> },
                { label: t("operations.overview.currentVersion", "Current Version"), value: overview?.deployment?.version || "-", icon: <Server className="size-4" /> },
                { label: t("operations.overview.deploymentStatus", "Deployment Status"), value: overview?.deployment?.status || "-", icon: <CheckCircle className="size-4" />, badge: overview?.deployment?.status },
                { label: t("operations.overview.cpuUsage", "CPU Usage"), value: `${overview?.health?.cpuUsage ?? 0}%`, icon: <Cpu className="size-4" /> },
                { label: t("operations.overview.memoryUsage", "Memory Usage"), value: `${overview?.health?.memoryUsage ?? 0}%`, icon: <MemoryStick className="size-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {stat.icon}
                    {stat.label}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-2xl font-semibold truncate">{stat.value}</p>
                    {stat.badge && <StatusBadge status={String(stat.badge)} />}
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardCard title={t("operations.overview.quickActions", "Quick Actions")}>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={handleTakeSnapshot}>
                  <Activity className="mr-2 size-4" />
                  {t("operations.health.takeSnapshot", "Take Snapshot")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => mutateOverview()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setTab("alerts")}>
                  <Bell className="mr-2 size-4" />
                  {t("operations.overview.viewAlerts", "View Alerts")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setTab("incidents")}>
                  <AlertTriangle className="mr-2 size-4" />
                  {t("operations.overview.viewIncidents", "View Incidents")}
                </Button>
              </div>
            </DashboardCard>

            <DashboardCard title={t("operations.overview.diskUsage", "Disk Usage")}>
              <div className="flex items-center gap-4">
                <HardDrive className="size-8 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{t("operations.overview.diskUsage", "Disk Usage")}</span>
                    <span className="text-sm text-muted-foreground">{overview?.health?.diskUsage ?? 0}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full",
                        (overview?.health?.diskUsage ?? 0) > 80 ? "bg-red-500" : (overview?.health?.diskUsage ?? 0) > 60 ? "bg-amber-500" : "bg-green-500"
                      )}
                      style={{ width: `${Math.min(overview?.health?.diskUsage ?? 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      )}

      {tab === "infrastructure" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("operations.infrastructure.systemHealth", "System Health")}</h3>
              <Button variant="outline" size="sm" onClick={() => { mutateHealth(); }}>
                <RefreshCw className="mr-2 size-4" />
                {t("common.refresh", "Refresh")}
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: t("operations.infrastructure.database", "Database"), status: health?.database || "unknown", latency: health?.databaseLatencyMs ? `${health.databaseLatencyMs}ms` : "-" },
                { label: t("operations.infrastructure.redis", "Redis"), status: health?.redis || "unknown", latency: health?.redisLatencyMs ? `${health.redisLatencyMs}ms` : "-" },
                { label: t("operations.infrastructure.storage", "Storage"), status: health?.storage || "unknown", latency: "-" },
                { label: t("operations.infrastructure.aiRuntime", "AI Runtime"), status: health?.aiRuntime || "unknown", latency: "-" },
                { label: t("operations.infrastructure.smtp", "SMTP"), status: health?.smtp || "unknown", latency: "-" },
                { label: t("operations.infrastructure.queue", "Queue"), status: health?.queue || "unknown", latency: "-" },
                { label: t("operations.infrastructure.worker", "Worker"), status: health?.worker || "unknown", latency: "-" },
                { label: t("operations.infrastructure.overall", "Overall"), status: health?.status || "unknown", latency: "-" },
              ].map((svc) => (
                <div key={svc.label} className="flex items-center gap-3 rounded-xl border border-border bg-muted/10 p-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted/40">
                    <Server className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{svc.label}</p>
                      <StatusDot status={svc.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{svc.status}</span>
                      {svc.latency !== "-" && <span>· {svc.latency}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          {trendData?.success && Array.isArray(trendData.data) && trendData.data.length > 0 && (
            <DashboardCard title={t("operations.infrastructure.healthTrend", "Health Trend (24h)")}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.infrastructure.time", "Time")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.infrastructure.status", "Status")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.infrastructure.cpu", "CPU")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.infrastructure.memory", "Memory")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.infrastructure.disk", "Disk")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trendData.data.slice(-20).map((snap: any) => (
                      <tr key={snap.id} className="border-b border-border/50">
                        <td className="py-2 text-xs text-muted-foreground">{new Date(snap.createdAt).toLocaleString()}</td>
                        <td className="py-2"><StatusBadge status={snap.overallStatus || "unknown"} /></td>
                        <td className="py-2 text-muted-foreground">{snap.cpuUsage ?? 0}%</td>
                        <td className="py-2 text-muted-foreground">{snap.memoryUsage ?? 0}%</td>
                        <td className="py-2 text-muted-foreground">{snap.diskUsage ?? 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "alerts" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{t("operations.alerts.title", "Alerts")}</h3>
                <select
                  value={alertFilter}
                  onChange={(e) => setAlertFilter(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t("operations.alerts.allAlerts", "All")}</option>
                  <option value="open">{t("operations.alerts.openAlerts", "Open")}</option>
                  <option value="acknowledged">{t("operations.alerts.acknowledged", "Acknowledged")}</option>
                  <option value="resolved">{t("operations.alerts.resolved", "Resolved")}</option>
                  <option value="dismissed">{t("operations.alerts.dismissed", "Dismissed")}</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => mutateAlerts()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
                <Button size="sm" onClick={() => setShowCreateAlert(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("operations.alerts.create", "Create Alert")}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.alerts.severity", "Severity")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.alerts.title", "Title")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.alerts.category", "Category")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.alerts.status", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.alerts.created", "Created")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.alerts.actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert: any) => (
                    <tr key={alert.id} className="border-b border-border/50">
                      <td className="py-3"><StatusBadge status={alert.severity} /></td>
                      <td className="py-3 font-medium">{alert.title}</td>
                      <td className="py-3 text-muted-foreground">{alert.category}</td>
                      <td className="py-3"><StatusBadge status={alert.status} /></td>
                      <td className="py-3 text-muted-foreground text-xs">{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : "-"}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {alert.status === "open" && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleAcknowledgeAlert(alert.id)}>
                                <Shield className="size-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleResolveAlert(alert.id)}>
                                <CheckCircle className="size-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAlert(alert.id)}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">{t("operations.alerts.noAlerts", "No alerts found")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {showCreateAlert && (
            <DashboardCard title={t("operations.alerts.create", "Create Alert")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t("operations.alerts.severity", "Severity")}</Label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <Label>{t("operations.alerts.category", "Category")}</Label>
                  <Input
                    value={newAlert.category}
                    onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value })}
                    placeholder="e.g. system, network, database"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("operations.alerts.title", "Title")}</Label>
                  <Input
                    value={newAlert.title}
                    onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                    placeholder="Alert title"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("operations.alerts.message", "Message")}</Label>
                  <textarea
                    value={newAlert.message}
                    onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                    placeholder="Alert description..."
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                  />
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
              <h3 className="text-lg font-semibold">{t("operations.incidents.title", "Incidents")}</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => mutateIncidents()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
                <Button size="sm" onClick={() => setShowCreateIncident(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("operations.incidents.create", "Create Incident")}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.incidents.title", "Title")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.incidents.severity", "Severity")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.incidents.category", "Category")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.incidents.status", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.incidents.created", "Created")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.incidents.actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident: any) => (
                    <tr key={incident.id} className="border-b border-border/50">
                      <td className="py-3 font-medium">{incident.title}</td>
                      <td className="py-3"><StatusBadge status={incident.severity || "unknown"} /></td>
                      <td className="py-3 text-muted-foreground">{incident.category}</td>
                      <td className="py-3"><StatusBadge status={incident.status} /></td>
                      <td className="py-3 text-muted-foreground text-xs">{incident.createdAt ? new Date(incident.createdAt).toLocaleString() : "-"}</td>
                      <td className="py-3">
                        {incident.status === "open" && (
                          <Button variant="ghost" size="sm" onClick={() => handleResolveIncident(incident.id)}>
                            <CheckCircle className="size-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {incidents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">{t("operations.incidents.noIncidents", "No incidents found")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {showCreateIncident && (
            <DashboardCard title={t("operations.incidents.create", "Create Incident")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>{t("operations.incidents.title", "Title")}</Label>
                  <Input
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    placeholder="Incident title"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("operations.incidents.description", "Description")}</Label>
                  <textarea
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    placeholder="Incident description..."
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>{t("operations.incidents.severity", "Severity")}</Label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <Label>{t("operations.incidents.category", "Category")}</Label>
                  <Input
                    value={newIncident.category}
                    onChange={(e) => setNewIncident({ ...newIncident, category: e.target.value })}
                    placeholder="e.g. outage, degradation"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("operations.incidents.impact", "Impact")}</Label>
                  <Input
                    value={newIncident.impact}
                    onChange={(e) => setNewIncident({ ...newIncident, impact: e.target.value })}
                    placeholder="Impact description"
                    className="mt-1"
                  />
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

      {tab === "deployments" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("operations.deployments.title", "Deployments")}</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => mutateDeployments()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
                <Button size="sm" onClick={() => setShowCreateDeployment(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("operations.deployments.create", "Create Deployment")}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.deployments.version", "Version")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.deployments.environment", "Environment")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.deployments.status", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.deployments.commit", "Commit")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.deployments.started", "Started")}</th>
                  </tr>
                </thead>
                <tbody>
                  {deployments.map((dep: any) => (
                    <tr key={dep.id} className="border-b border-border/50">
                      <td className="py-3 font-medium">{dep.version}</td>
                      <td className="py-3 text-muted-foreground">{dep.environment}</td>
                      <td className="py-3"><StatusBadge status={dep.status} /></td>
                      <td className="py-3 text-muted-foreground font-mono text-xs">{dep.commitHash || "-"}</td>
                      <td className="py-3 text-muted-foreground text-xs">{dep.startedAt ? new Date(dep.startedAt).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                  {deployments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">{t("operations.deployments.noDeployments", "No deployments found")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {showCreateDeployment && (
            <DashboardCard title={t("operations.deployments.create", "Create Deployment")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t("operations.deployments.version", "Version")}</Label>
                  <Input
                    value={newDeployment.version}
                    onChange={(e) => setNewDeployment({ ...newDeployment, version: e.target.value })}
                    placeholder="1.0.0"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("operations.deployments.environment", "Environment")}</Label>
                  <select
                    value={newDeployment.environment}
                    onChange={(e) => setNewDeployment({ ...newDeployment, environment: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>
                <div>
                  <Label>{t("operations.deployments.commit", "Commit Hash")}</Label>
                  <Input
                    value={newDeployment.commitHash}
                    onChange={(e) => setNewDeployment({ ...newDeployment, commitHash: e.target.value })}
                    placeholder="abc123"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("operations.deployments.notes", "Notes")}</Label>
                  <Input
                    value={newDeployment.notes}
                    onChange={(e) => setNewDeployment({ ...newDeployment, notes: e.target.value })}
                    placeholder="Deployment notes"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowCreateDeployment(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleCreateDeployment}>
                  {t("common.create", "Create")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "maintenance" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("operations.maintenance.title", "Maintenance Mode")}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant={settings?.maintenanceMode ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleToggleMaintenance(!settings?.maintenanceMode)}
                >
                  {settings?.maintenanceMode ? <BellOff className="mr-2 size-4" /> : <Bell className="mr-2 size-4" />}
                  {settings?.maintenanceMode ? t("operations.maintenance.disable", "Disable Maintenance") : t("operations.maintenance.enable", "Enable Maintenance")}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/20">
              <div className={cn("flex size-10 items-center justify-center rounded-lg", settings?.maintenanceMode ? "bg-red-500/10" : "bg-green-500/10")}>
                {settings?.maintenanceMode ? <BellOff className="size-5 text-red-500" /> : <Bell className="size-5 text-green-500" />}
              </div>
              <div>
                <p className="text-sm font-medium">{settings?.maintenanceMode ? t("operations.maintenance.active", "Maintenance mode is active") : t("operations.maintenance.inactive", "Maintenance mode is inactive")}</p>
                <p className="text-xs text-muted-foreground">{settings?.maintenanceMessage || t("operations.maintenance.noMessage", "No message configured")}</p>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("operations.maintenance.scheduled", "Scheduled Maintenance")}</h3>
              <Button size="sm" onClick={() => setShowCreateMaintenance(true)}>
                <Plus className="mr-2 size-4" />
                {t("operations.maintenance.schedule", "Schedule Maintenance")}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.maintenance.title", "Title")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.maintenance.status", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.maintenance.scheduledAt", "Scheduled At")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.maintenance.actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenance.map((mnt: any) => (
                    <tr key={mnt.id} className="border-b border-border/50">
                      <td className="py-3 font-medium">{mnt.title}</td>
                      <td className="py-3"><StatusBadge status={mnt.status} /></td>
                      <td className="py-3 text-muted-foreground text-xs">{mnt.scheduledAt ? new Date(mnt.scheduledAt).toLocaleString() : "-"}</td>
                      <td className="py-3">
                        {mnt.status === "scheduled" && (
                          <Button variant="ghost" size="sm" onClick={() => handleStartMaintenance(mnt.id)}>
                            <CheckCircle className="size-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {maintenance.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">{t("operations.maintenance.noMaintenance", "No maintenance records")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {showCreateMaintenance && (
            <DashboardCard title={t("operations.maintenance.schedule", "Schedule Maintenance")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>{t("operations.maintenance.title", "Title")}</Label>
                  <Input
                    value={newMaintenance.title}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, title: e.target.value })}
                    placeholder="Maintenance title"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("operations.maintenance.description", "Description")}</Label>
                  <textarea
                    value={newMaintenance.description}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                    placeholder="Maintenance description..."
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                  />
                </div>
                <div>
                  <Label>{t("operations.maintenance.scheduledAt", "Scheduled At")}</Label>
                  <Input
                    type="datetime-local"
                    value={newMaintenance.scheduledAt}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduledAt: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("operations.maintenance.message", "User Message")}</Label>
                  <Input
                    value={newMaintenance.message}
                    onChange={(e) => setNewMaintenance({ ...newMaintenance, message: e.target.value })}
                    placeholder="Message shown to users"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowCreateMaintenance(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleCreateMaintenance}>
                  {t("common.create", "Create")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "audit" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("operations.audit.title", "Audit Logs")}</h3>
              <Button variant="outline" size="sm" onClick={() => mutateAudit()}>
                <RefreshCw className="mr-2 size-4" />
                {t("common.refresh", "Refresh")}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.audit.action", "Action")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.audit.category", "Category")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.audit.entityType", "Entity Type")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.audit.entityId", "Entity ID")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.audit.userId", "User ID")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.audit.time", "Time")}</th>
                  </tr>
                </thead>
                <tbody>
                  {auditEvents.map((event: any) => (
                    <tr key={event.id} className="border-b border-border/50">
                      <td className="py-3 font-medium font-mono text-xs">{event.action}</td>
                      <td className="py-3 text-muted-foreground">{event.category}</td>
                      <td className="py-3 text-muted-foreground">{event.entityType || "-"}</td>
                      <td className="py-3 text-muted-foreground font-mono text-xs max-w-[120px] truncate">{event.entityId || "-"}</td>
                      <td className="py-3 text-muted-foreground font-mono text-xs max-w-[120px] truncate">{event.userId || "-"}</td>
                      <td className="py-3 text-muted-foreground text-xs">{event.createdAt ? new Date(event.createdAt).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                  {auditEvents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">{t("operations.audit.noEvents", "No audit events found")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("operations.reports.title", "Reports")}</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => mutateReports()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
                <Button size="sm" onClick={() => setShowGenerateReport(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("operations.reports.generate", "Generate Report")}
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.reports.title", "Title")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.reports.type", "Type")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.reports.period", "Period")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.reports.generated", "Generated")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("operations.reports.actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report: any) => (
                    <tr key={report.id} className="border-b border-border/50">
                      <td className="py-3 font-medium">{report.title}</td>
                      <td className="py-3 text-muted-foreground">{report.reportType}</td>
                      <td className="py-3 text-muted-foreground">{report.period || "-"}</td>
                      <td className="py-3 text-muted-foreground text-xs">{report.generatedAt ? new Date(report.generatedAt).toLocaleString() : "-"}</td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(report.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">{t("operations.reports.noReports", "No reports found")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {showGenerateReport && (
            <DashboardCard title={t("operations.reports.generate", "Generate Report")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t("operations.reports.type", "Report Type")}</Label>
                  <select
                    value={newReport.reportType}
                    onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <Label>{t("operations.reports.title", "Title")}</Label>
                  <Input
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    placeholder="Report title"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>{t("operations.reports.period", "Period")}</Label>
                  <Input
                    value={newReport.period}
                    onChange={(e) => setNewReport({ ...newReport, period: e.target.value })}
                    placeholder="e.g. 2024-01-01 to 2024-01-31"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowGenerateReport(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleGenerateReport}>
                  {t("common.create", "Create")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-6">
          <DashboardCard title={t("operations.settings.title", "Operations Settings")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>{t("operations.settings.alertEmails", "Alert Email Addresses")}</Label>
                <Input
                  value={settingsForm.alertEmails}
                  onChange={(e) => setSettingsForm({ ...settingsForm, alertEmails: e.target.value })}
                  placeholder="admin@example.com, ops@example.com"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">{t("operations.settings.alertEmailsHelp", "Comma-separated list of email addresses to receive alerts")}</p>
              </div>
              <div>
                <Label>{t("operations.settings.healthCheckInterval", "Health Check Interval (ms)")}</Label>
                <Input
                  type="number"
                  value={settingsForm.healthCheckIntervalMs}
                  onChange={(e) => setSettingsForm({ ...settingsForm, healthCheckIntervalMs: parseInt(e.target.value) || 30000 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t("operations.settings.retentionDays", "Data Retention (days)")}</Label>
                <Input
                  type="number"
                  value={settingsForm.retentionDays}
                  onChange={(e) => setSettingsForm({ ...settingsForm, retentionDays: parseInt(e.target.value) || 30 })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t("operations.settings.maintenanceMode", "Maintenance Mode")}</Label>
                <div className="mt-2">
                  <Badge tone={settings?.maintenanceMode ? "default" : "muted"}>
                    {settings?.maintenanceMode ? t("operations.settings.enabled", "Enabled") : t("operations.settings.disabled", "Disabled")}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>{t("operations.settings.autoResolve", "Auto-Resolve Incidents")}</Label>
                <div className="mt-2">
                  <Badge tone={settings?.autoResolveIncidents ? "success" : "muted"}>
                    {settings?.autoResolveIncidents ? t("operations.settings.enabled", "Enabled") : t("operations.settings.disabled", "Disabled")}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button size="sm" onClick={handleSaveSettings}>
                <Settings className="mr-2 size-4" />
                {t("operations.settings.save", "Save Settings")}
              </Button>
            </div>
          </DashboardCard>
        </div>
      )}
    </div>
  );
}
