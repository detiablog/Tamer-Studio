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
  Loader,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Download,
  Activity,
  Bug,
  Zap,
  Database,
  Mail,
  CreditCard,
  BarChart3,
  MessageSquare,
  FileText,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  GitBranch,
  Play,
  Pause,
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

type Tab = "overview" | "incidents" | "hotfixes" | "health" | "kpis" | "feedback" | "reports";

function StatusDot({ status }: { status: string }) {
  const color =
    status === "healthy" || status === "resolved" || status === "verified" || status === "on_track"
      ? "bg-green-500"
      : status === "warning" || status === "at_risk" || status === "in_progress" || status === "testing"
        ? "bg-amber-500"
        : status === "critical" || status === "breached" || status === "failed" || status === "open"
          ? "bg-red-500"
          : "bg-gray-400";
  return <span className={cn("inline-block size-2.5 rounded-full", color)} />;
}

function SeverityBadge({ severity }: { severity: string }) {
  const tone =
    severity === "critical" || severity === "breached"
      ? "default"
      : severity === "high"
        ? "warning"
        : severity === "medium" || severity === "at_risk"
          ? "info"
          : severity === "low" || severity === "on_track"
            ? "success"
            : "muted";
  return <Badge tone={tone}>{severity}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "resolved" || status === "verified" || status === "closed" || status === "on_track" || status === "healthy"
      ? "success"
      : status === "in_progress" || status === "testing" || status === "monitoring" || status === "at_risk" || status === "warning"
        ? "warning"
        : status === "open" || status === "assigned" || status === "breached" || status === "critical"
          ? "default"
          : status === "deployed" || status === "healthy"
            ? "success"
            : "muted";
  return <Badge tone={tone}>{status}</Badge>;
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "improving") return <TrendingUp className="size-4 text-green-500" />;
  if (trend === "declining") return <TrendingDown className="size-4 text-red-500" />;
  return <Minus className="size-4 text-muted-foreground" />;
}

export function HypercarePageClient() {
  const { t } = useLocalizationContext();
  const [tab, setTab] = React.useState<Tab>("overview");
  const [autoRefresh, setAutoRefresh] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [severityFilter, setSeverityFilter] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showCreateIncident, setShowCreateIncident] = React.useState(false);
  const [showCreateHotfix, setShowCreateHotfix] = React.useState(false);
  const [selectedIncident, setSelectedIncident] = React.useState<Record<string, unknown> | null>(null);

  const [newIncident, setNewIncident] = React.useState({
    title: "", description: "", severity: "medium", priority: "medium", affectedModule: "", affectedServices: "",
  });
  const [newHotfix, setNewHotfix] = React.useState({
    incidentId: "", branchName: "", title: "", description: "", targetVersion: "",
  });

  const swrOpts = { revalidateOnFocus: false, shouldRetryOnError: false, refreshInterval: autoRefresh ? 30000 : 0 };

  const { data: overviewData, isLoading: overviewLoading, mutate: mutateOverview } = useSWR("/api/admin/hypercare/overview", fetcher, swrOpts);
  const { data: incidentsData, isLoading: _incidentsLoading, mutate: mutateIncidents } = useSWR(
    `/api/admin/hypercare/incidents${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`,
    fetcher, { ...swrOpts, refreshInterval: 0 }
  );
  const { data: hotfixesData, isLoading: _hotfixesLoading, mutate: mutateHotfixes } = useSWR("/api/admin/hypercare/hotfixes", fetcher, { ...swrOpts, refreshInterval: 0 });
  const { data: healthData, isLoading: _healthLoading } = useSWR("/api/admin/hypercare/health", fetcher, swrOpts);
  const { data: kpisData, isLoading: _kpisLoading } = useSWR("/api/admin/hypercare/kpis", fetcher, swrOpts);
  const { data: feedbackData, isLoading: _feedbackLoading, mutate: _mutateFeedback } = useSWR("/api/admin/hypercare/feedback", fetcher, { ...swrOpts, refreshInterval: 0 });
  const { data: reportsData, isLoading: _reportsLoading } = useSWR("/api/admin/hypercare/reports", fetcher, { ...swrOpts, refreshInterval: 0 });

  const overview = React.useMemo(() => {
    if (overviewData?.success && overviewData.data) return overviewData.data;
    return { totalIncidents: 0, openIncidents: 0, criticalIncidents: 0, resolvedToday: 0, avgResolutionTimeHours: 0, totalHotfixes: 0, deployedHotfixes: 0, totalFeedback: 0, openFeedback: 0, healthScore: 100, platformAvailability: 99.9, aiSuccessRate: 99, paymentSuccessRate: 99.9, emailDeliveryRate: 98, queueSuccessRate: 99, apiSuccessRate: 99.9, crashRate: 0.1, recentIncidents: [], healthChecks: [] };
  }, [overviewData]);

  const incidents = React.useMemo(() => {
    if (incidentsData?.success && incidentsData.data?.data) return incidentsData.data.data;
    return [];
  }, [incidentsData]);

  const hotfixes = React.useMemo(() => {
    if (hotfixesData?.success && hotfixesData.data?.data) return hotfixesData.data.data;
    return [];
  }, [hotfixesData]);

  const healthChecks = React.useMemo(() => {
    if (healthData?.success && Array.isArray(healthData.data)) return healthData.data;
    return [];
  }, [healthData]);

  const kpis = React.useMemo(() => {
    if (kpisData?.success && Array.isArray(kpisData.data)) return kpisData.data;
    return [];
  }, [kpisData]);

  const feedbackItems = React.useMemo(() => {
    if (feedbackData?.success && feedbackData.data?.data) return feedbackData.data.data;
    return [];
  }, [feedbackData]);

  const reports = React.useMemo(() => {
    if (reportsData?.success && Array.isArray(reportsData.data)) return reportsData.data;
    return [];
  }, [reportsData]);

  const filteredIncidents = React.useMemo(() => {
    let result = incidents;
    if (severityFilter !== "all") result = result.filter((i: any) => i.severity === severityFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i: any) => i.title?.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q));
    }
    return result;
  }, [incidents, severityFilter, searchQuery]);

  const handleCreateIncident = async () => {
    if (!newIncident.title) { toast.error(t("admin.missingFields", "Please fill in all fields.")); return; }
    try {
      const res = await fetch("/api/admin/hypercare/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newIncident,
          affectedServices: newIncident.affectedServices ? newIncident.affectedServices.split(",").map((s) => s.trim()) : [],
        }),
      });
      if (res.ok) {
        toast.success(t("hypercare.incidentCreated", "Incident created"));
        setShowCreateIncident(false);
        setNewIncident({ title: "", description: "", severity: "medium", priority: "medium", affectedModule: "", affectedServices: "" });
        mutateIncidents();
        mutateOverview();
      } else { toast.error(t("common.error", "Error")); }
    } catch { toast.error(t("common.genericError", "Something went wrong")); }
  };

  const handleUpdateIncidentStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/hypercare/incidents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { toast.success(t("hypercare.incidentUpdated", "Incident updated")); setSelectedIncident(null); mutateIncidents(); mutateOverview(); }
      else { toast.error(t("common.error", "Error")); }
    } catch { toast.error(t("common.genericError", "Something went wrong")); }
  };

  const handleCreateHotfix = async () => {
    if (!newHotfix.title || !newHotfix.branchName) { toast.error(t("admin.missingFields", "Please fill in all fields.")); return; }
    try {
      const res = await fetch("/api/admin/hypercare/hotfixes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHotfix),
      });
      if (res.ok) {
        toast.success(t("hypercare.hotfixCreated", "Hotfix created"));
        setShowCreateHotfix(false);
        setNewHotfix({ incidentId: "", branchName: "", title: "", description: "", targetVersion: "" });
        mutateHotfixes();
      } else { toast.error(t("common.error", "Error")); }
    } catch { toast.error(t("common.genericError", "Something went wrong")); }
  };

  const handleUpdateHotfixStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/hypercare/hotfixes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) { toast.success(t("hypercare.hotfixUpdated", "Hotfix updated")); mutateHotfixes(); }
      else { toast.error(t("common.error", "Error")); }
    } catch { toast.error(t("common.genericError", "Something went wrong")); }
  };

  const handleExportIncidents = () => {
    const headers = "ID,Title,Severity,Priority,Status,Module,Created At\n";
    const rows = filteredIncidents.map((i: any) => `${i.id},${i.title},${i.severity},${i.priority},${i.status},${i.affectedModule || ""},${i.createdAt}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hypercare-incidents.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t("hypercare.incidentsExported", "Incidents exported"));
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("hypercare.overview", "Overview"), icon: <Activity className="size-4" /> },
    { key: "incidents", label: t("hypercare.incidents", "Incidents"), icon: <Bug className="size-4" /> },
    { key: "hotfixes", label: t("hypercare.hotfixes", "Hotfixes"), icon: <GitBranch className="size-4" /> },
    { key: "health", label: t("hypercare.productionHealth", "Health"), icon: <Heart className="size-4" /> },
    { key: "kpis", label: t("hypercare.kpis", "KPIs"), icon: <BarChart3 className="size-4" /> },
    { key: "feedback", label: t("hypercare.feedback", "Feedback"), icon: <MessageSquare className="size-4" /> },
    { key: "reports", label: t("hypercare.reports", "Reports"), icon: <FileText className="size-4" /> },
  ];

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("hypercare.title", "Hypercare") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("hypercare.title", "Hypercare Operations")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("hypercare.description", "Production stabilization, incident management, and continuous improvement")}</p>
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
      <Breadcrumbs items={[{ label: t("hypercare.title", "Hypercare") }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold leading-tight">{t("hypercare.title", "Hypercare Operations")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t("hypercare.description", "Production stabilization, incident management, and continuous improvement")}</p>
        </div>
        <Button
          variant={autoRefresh ? "default" : "outline"}
          size="sm"
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          {autoRefresh ? <Pause className="mr-2 size-4" /> : <Play className="mr-2 size-4" />}
          {autoRefresh ? "Auto Refresh On" : "Auto Refresh Off"}
        </Button>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 flex-wrap">
        {tabs.map((t_item) => (
          <button
            key={t_item.key}
            onClick={() => setTab(t_item.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t_item.key ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
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
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium",
                overview.healthScore >= 90 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                overview.healthScore >= 70 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              )}>
                <StatusDot status={overview.healthScore >= 90 ? "healthy" : overview.healthScore >= 70 ? "warning" : "critical"} />
                {t("hypercare.healthScore", "Health Score")}: {overview.healthScore}%
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[
                { label: t("hypercare.totalIncidents", "Total Incidents"), value: overview.totalIncidents, icon: <Bug className="size-4" /> },
                { label: t("hypercare.openIncidents", "Open Incidents"), value: overview.openIncidents, icon: <AlertTriangle className="size-4 text-amber-500" /> },
                { label: t("hypercare.criticalIncidents", "Critical"), value: overview.criticalIncidents, icon: <XCircle className="size-4 text-red-500" /> },
                { label: t("hypercare.resolvedToday", "Resolved Today"), value: overview.resolvedToday, icon: <CheckCircle className="size-4 text-green-500" /> },
                { label: t("hypercare.totalHotfixes", "Hotfixes"), value: overview.totalHotfixes, icon: <GitBranch className="size-4" /> },
                { label: t("hypercare.openFeedback", "Open Feedback"), value: overview.openFeedback, icon: <MessageSquare className="size-4" /> },
                { label: t("hypercare.avgResolutionTime", "Avg Resolution"), value: `${overview.avgResolutionTimeHours}h`, icon: <Clock className="size-4" /> },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">{stat.icon}{stat.label}</div>
                  <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title={t("hypercare.platformKpis", "Platform KPIs")}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: t("hypercare.platformAvailability", "Availability"), value: overview.platformAvailability, target: 99.9, unit: "%", icon: <Activity className="size-4" /> },
                { label: t("hypercare.aiSuccessRate", "AI Success"), value: overview.aiSuccessRate, target: 99, unit: "%", icon: <Zap className="size-4" /> },
                { label: t("hypercare.paymentSuccessRate", "Payment"), value: overview.paymentSuccessRate, target: 99.9, unit: "%", icon: <CreditCard className="size-4" /> },
                { label: t("hypercare.emailDeliveryRate", "Email"), value: overview.emailDeliveryRate, target: 98, unit: "%", icon: <Mail className="size-4" /> },
                { label: t("hypercare.queueSuccessRate", "Queue"), value: overview.queueSuccessRate, target: 99, unit: "%", icon: <Database className="size-4" /> },
                { label: t("hypercare.apiSuccessRate", "API"), value: overview.apiSuccessRate, target: 99.9, unit: "%", icon: <BarChart3 className="size-4" /> },
                { label: t("hypercare.crashRate", "Crash Rate"), value: overview.crashRate, target: 0.1, unit: "%", icon: <XCircle className="size-4" />, invert: true },
              ].map((kpi) => {
                const isGood = kpi.invert ? kpi.value <= kpi.target : kpi.value >= kpi.target;
                return (
                  <div key={kpi.label} className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">{kpi.icon}{kpi.label}</div>
                      <StatusDot status={isGood ? "healthy" : "critical"} />
                    </div>
                    <p className="mt-2 text-2xl font-semibold">{kpi.value}{kpi.unit}</p>
                    <p className="text-xs text-muted-foreground">{t("hypercare.target", "Target")}: {kpi.invert ? "<" : ">"}{kpi.target}{kpi.unit}</p>
                  </div>
                );
              })}
            </div>
          </DashboardCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardCard title={t("hypercare.recentIncidents", "Recent Incidents")}>
              {overview.recentIncidents && overview.recentIncidents.length > 0 ? (
                <div className="space-y-2">
                  {overview.recentIncidents.map((incident: any) => (
                    <div key={incident.id} className="flex items-center justify-between rounded-lg border border-border p-3 cursor-pointer hover:bg-muted/30"
                      onClick={() => { setSelectedIncident(incident); setTab("incidents"); }}>
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
                <p className="text-sm text-muted-foreground py-4 text-center">{t("hypercare.noIncidents", "No incidents recorded")}</p>
              )}
            </DashboardCard>

            <DashboardCard title={t("hypercare.serviceHealth", "Service Health")}>
              {overview.healthChecks && overview.healthChecks.length > 0 ? (
                <div className="space-y-2">
                  {overview.healthChecks.map((check: any) => (
                    <div key={check.serviceName} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-3">
                        <StatusDot status={check.status} />
                        <p className="text-sm font-medium">{check.serviceName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{check.latencyMs != null ? `${check.latencyMs}ms` : "N/A"}</span>
                        <StatusBadge status={check.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">{t("hypercare.noHealthChecks", "No health checks configured")}</p>
              )}
            </DashboardCard>
          </div>
        </div>
      )}

      {tab === "incidents" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                  <option value="all">{t("common.all", "All")}</option>
                  <option value="open">{t("hypercare.statusOpen", "Open")}</option>
                  <option value="assigned">{t("hypercare.statusAssigned", "Assigned")}</option>
                  <option value="in_progress">{t("hypercare.statusInProgress", "In Progress")}</option>
                  <option value="testing">{t("hypercare.statusTesting", "Testing")}</option>
                  <option value="resolved">{t("hypercare.statusResolved", "Resolved")}</option>
                  <option value="closed">{t("hypercare.statusClosed", "Closed")}</option>
                </select>
                <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
                  <option value="all">{t("common.all", "All")}</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="informational">Informational</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("common.search", "Search...")} className="pl-9 w-48" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportIncidents}><Download className="mr-2 size-4" />{t("common.export", "Export")}</Button>
                <Button size="sm" onClick={() => setShowCreateIncident(true)}><Plus className="mr-2 size-4" />{t("hypercare.createIncident", "Create Incident")}</Button>
              </div>
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
                    {t("hypercare.createdAt", "Created")}: {selectedIncident.createdAt}
                  </div>
                  {selectedIncident.affectedServices && selectedIncident.affectedServices.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("hypercare.affectedServices", "Affected Services")}</p>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(selectedIncident.affectedServices) ? selectedIncident.affectedServices : []).map((s: string) => (
                          <Badge key={s} tone="muted">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedIncident.timeline && selectedIncident.timeline.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">{t("hypercare.timeline", "Timeline")}</p>
                      <div className="space-y-2">
                        {selectedIncident.timeline.map((event: any, idx: number) => (
                          <div key={idx} className="flex gap-3 text-sm">
                            <span className="text-muted-foreground text-xs whitespace-nowrap">{event.timestamp || event.time}</span>
                            <Badge tone="muted">{event.action || event.status}</Badge>
                            <span>{event.note || event.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedIncident.status !== "resolved" && selectedIncident.status !== "closed" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["assigned", "in_progress", "testing", "resolved", "closed"].map((status) => (
                        <Button key={status} variant={selectedIncident.status === status ? "default" : "outline"} size="sm"
                          onClick={() => handleUpdateIncidentStatus(selectedIncident.id, status)}>
                          {t(`hypercare.${status}`, status)}
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
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.incidentTitle", "Title")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.severity", "Severity")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.priority", "Priority")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.module", "Module")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.createdAt", "Created")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.map((incident: any) => (
                      <tr key={incident.id} className="border-b border-border/50 cursor-pointer hover:bg-muted/30" onClick={() => setSelectedIncident(incident)}>
                        <td className="py-3 font-medium">{incident.title}</td>
                        <td className="py-3"><SeverityBadge severity={incident.severity} /></td>
                        <td className="py-3"><Badge tone="muted">{incident.priority}</Badge></td>
                        <td className="py-3"><StatusBadge status={incident.status} /></td>
                        <td className="py-3 text-muted-foreground">{incident.affectedModule || "-"}</td>
                        <td className="py-3 text-muted-foreground text-xs">{incident.createdAt}</td>
                      </tr>
                    ))}
                    {filteredIncidents.length === 0 && (
                      <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">{t("hypercare.noIncidents", "No incidents found")}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>

          {showCreateIncident && (
            <DashboardCard title={t("hypercare.createIncident", "Create Incident")}>
              <div className="grid gap-4">
                <div>
                  <Label>{t("hypercare.incidentTitle", "Title")}</Label>
                  <Input value={newIncident.title} onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    placeholder={t("hypercare.incidentTitlePlaceholder", "e.g. Database Latency Spike")} className="mt-1" />
                </div>
                <div>
                  <Label>{t("hypercare.incidentDescription", "Description")}</Label>
                  <textarea value={newIncident.description} onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    placeholder={t("hypercare.incidentDescriptionPlaceholder", "Describe the incident...")}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>{t("hypercare.severity", "Severity")}</Label>
                    <select value={newIncident.severity} onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="informational">Informational</option>
                    </select>
                  </div>
                  <div>
                    <Label>{t("hypercare.priority", "Priority")}</Label>
                    <select value={newIncident.priority} onChange={(e) => setNewIncident({ ...newIncident, priority: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <Label>{t("hypercare.module", "Affected Module")}</Label>
                    <Input value={newIncident.affectedModule} onChange={(e) => setNewIncident({ ...newIncident, affectedModule: e.target.value })}
                      placeholder={t("hypercare.modulePlaceholder", "e.g. billing, ai-runtime")} className="mt-1" />
                  </div>
                  <div>
                    <Label>{t("hypercare.affectedServices", "Affected Services (comma separated)")}</Label>
                    <Input value={newIncident.affectedServices} onChange={(e) => setNewIncident({ ...newIncident, affectedServices: e.target.value })}
                      placeholder={t("hypercare.affectedServicesPlaceholder", "e.g. api, database, redis")} className="mt-1" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowCreateIncident(false)}>{t("common.cancel", "Cancel")}</Button>
                <Button size="sm" onClick={handleCreateIncident}>{t("common.create", "Create")}</Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "hotfixes" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("hypercare.hotfixPipeline", "Hotfix Pipeline")}</h3>
              <Button size="sm" onClick={() => setShowCreateHotfix(true)}><Plus className="mr-2 size-4" />{t("hypercare.createHotfix", "Create Hotfix")}</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.hotfixTitle", "Title")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.branch", "Branch")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.targetVersion", "Version")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.created", "Created")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {hotfixes.map((hotfix: any) => (
                    <tr key={hotfix.id} className="border-b border-border/50">
                      <td className="py-3 font-medium">{hotfix.title}</td>
                      <td className="py-3 text-muted-foreground font-mono text-xs">{hotfix.branchName}</td>
                      <td className="py-3"><StatusBadge status={hotfix.status} /></td>
                      <td className="py-3 text-muted-foreground">{hotfix.targetVersion || "-"}</td>
                      <td className="py-3 text-muted-foreground text-xs">{hotfix.createdAt}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {hotfix.status === "pending" && (
                            <Button variant="outline" size="sm" onClick={() => handleUpdateHotfixStatus(hotfix.id, "deployed")}>
                              <Play className="size-3 mr-1" />{t("hypercare.deploy", "Deploy")}
                            </Button>
                          )}
                          {hotfix.status === "deployed" && (
                            <Button variant="outline" size="sm" onClick={() => handleUpdateHotfixStatus(hotfix.id, "verified")}>
                              <CheckCircle className="size-3 mr-1" />{t("hypercare.verify", "Verify")}
                            </Button>
                          )}
                          {(hotfix.status === "deployed" || hotfix.status === "failed") && (
                            <Button variant="outline" size="sm" onClick={() => handleUpdateHotfixStatus(hotfix.id, "rolled_back")}>
                              <Pause className="size-3 mr-1" />{t("hypercare.rollback", "Rollback")}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {hotfixes.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">{t("hypercare.noHotfixes", "No hotfixes recorded")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {showCreateHotfix && (
            <DashboardCard title={t("hypercare.createHotfix", "Create Hotfix")}>
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>{t("hypercare.hotfixTitle", "Title")}</Label>
                    <Input value={newHotfix.title} onChange={(e) => setNewHotfix({ ...newHotfix, title: e.target.value })}
                      placeholder={t("hypercare.hotfixTitlePlaceholder", "e.g. Fix payment timeout")} className="mt-1" />
                  </div>
                  <div>
                    <Label>{t("hypercare.branch", "Branch Name")}</Label>
                    <Input value={newHotfix.branchName} onChange={(e) => setNewHotfix({ ...newHotfix, branchName: e.target.value })}
                      placeholder={t("hypercare.branchPlaceholder", "e.g. hotfix/payment-timeout")} className="mt-1" />
                  </div>
                  <div>
                    <Label>{t("hypercare.linkedIncident", "Linked Incident ID (optional)")}</Label>
                    <Input value={newHotfix.incidentId} onChange={(e) => setNewHotfix({ ...newHotfix, incidentId: e.target.value })}
                      placeholder={t("hypercare.linkedIncidentPlaceholder", "e.g. hinc_xxx")} className="mt-1" />
                  </div>
                  <div>
                    <Label>{t("hypercare.targetVersion", "Target Version")}</Label>
                    <Input value={newHotfix.targetVersion} onChange={(e) => setNewHotfix({ ...newHotfix, targetVersion: e.target.value })}
                      placeholder={t("hypercare.targetVersionPlaceholder", "e.g. v1.0.1")} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label>{t("hypercare.description", "Description")}</Label>
                  <textarea value={newHotfix.description} onChange={(e) => setNewHotfix({ ...newHotfix, description: e.target.value })}
                    placeholder={t("hypercare.descriptionPlaceholder", "Describe the hotfix...")}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowCreateHotfix(false)}>{t("common.cancel", "Cancel")}</Button>
                <Button size="sm" onClick={handleCreateHotfix}>{t("common.create", "Create")}</Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "health" && (
        <div className="space-y-6">
          <DashboardCard title={t("hypercare.productionHealth", "Production Health")}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {healthChecks.map((check: any) => (
                <div key={check.id} className="rounded-xl border border-border bg-muted/10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <StatusDot status={check.status} />
                      <p className="font-medium">{check.serviceName}</p>
                    </div>
                    <Badge tone="muted">{check.serviceType}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("hypercare.status", "Status")}</span>
                      <StatusBadge status={check.status} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("hypercare.latency", "Latency")}</span>
                      <span>{check.latencyMs != null ? `${check.latencyMs}ms` : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("hypercare.healthScore", "Score")}</span>
                      <span>{check.healthScore != null ? `${check.healthScore}%` : "N/A"}</span>
                    </div>
                    {check.errorMessage && (
                      <p className="text-xs text-red-500 mt-2 truncate">{check.errorMessage}</p>
                    )}
                  </div>
                </div>
              ))}
              {healthChecks.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Heart className="size-8 mb-2" />
                  <p className="text-sm">{t("hypercare.noHealthChecks", "No health checks configured")}</p>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
      )}

      {tab === "kpis" && (
        <div className="space-y-6">
          <DashboardCard title={t("hypercare.operationalKpis", "Operational KPIs")}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kpis.map((kpi: any) => (
                <div key={kpi.id} className="rounded-xl border border-border bg-muted/10 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <StatusDot status={kpi.status} />
                      <p className="font-medium">{kpi.name}</p>
                    </div>
                    <TrendIcon trend={kpi.trend} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("hypercare.currentValue", "Current")}</span>
                      <span className="font-semibold">{kpi.currentValue}{kpi.unit ? ` ${kpi.unit}` : ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("hypercare.targetValue", "Target")}</span>
                      <span>{kpi.targetValue != null ? `${kpi.targetValue}${kpi.unit ? ` ${kpi.unit}` : ""}` : "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("hypercare.category", "Category")}</span>
                      <Badge tone="muted">{kpi.category}</Badge>
                    </div>
                  </div>
                </div>
              ))}
              {kpis.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BarChart3 className="size-8 mb-2" />
                  <p className="text-sm">{t("hypercare.noKpis", "No KPIs recorded")}</p>
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
      )}

      {tab === "feedback" && (
        <div className="space-y-6">
          <DashboardCard title={t("hypercare.customerFeedback", "Customer Feedback")}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.subject", "Subject")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.type", "Type")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.category", "Category")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.priority", "Priority")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.createdAt", "Created")}</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackItems.map((fb: any) => (
                    <tr key={fb.id} className="border-b border-border/50">
                      <td className="py-3 font-medium">{fb.subject}</td>
                      <td className="py-3 text-muted-foreground">{fb.type}</td>
                      <td className="py-3 text-muted-foreground">{fb.category}</td>
                      <td className="py-3"><StatusBadge status={fb.status} /></td>
                      <td className="py-3"><SeverityBadge severity={fb.priority} /></td>
                      <td className="py-3 text-muted-foreground text-xs">{fb.createdAt}</td>
                    </tr>
                  ))}
                  {feedbackItems.length === 0 && (
                    <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">{t("hypercare.noFeedback", "No feedback collected")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-6">
          <DashboardCard title={t("hypercare.operationalReports", "Operational Reports")}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.reportTitle", "Title")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.type", "Type")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.period", "Period")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                    <th className="pb-2 text-left font-medium text-muted-foreground">{t("hypercare.generatedAt", "Generated")}</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report: any) => (
                    <tr key={report.id} className="border-b border-border/50">
                      <td className="py-3 font-medium">{report.title}</td>
                      <td className="py-3 text-muted-foreground"><Badge tone="muted">{report.type}</Badge></td>
                      <td className="py-3 text-muted-foreground">{report.period || "-"}</td>
                      <td className="py-3"><StatusBadge status={report.status} /></td>
                      <td className="py-3 text-muted-foreground text-xs">{report.generatedAt}</td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">{t("hypercare.noReports", "No reports generated")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>
      )}
    </div>
  );
}
