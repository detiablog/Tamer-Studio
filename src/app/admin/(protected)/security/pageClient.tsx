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
  Shield,
  RefreshCw,
  Loader,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Search,
  Activity,
  Lock,
  FileText,
  Key,
  Eye,
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

type Tab = "overview" | "events" | "incidents" | "audit" | "rate-limits";

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
            : "muted";
  return <Badge tone={tone}>{severity}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "resolved"
      ? "success"
      : status === "investigating"
        ? "warning"
        : status === "open"
          ? "info"
          : status === "identified"
            ? "purple"
            : "muted";
  return <Badge tone={tone}>{status}</Badge>;
}

function ThreatLevelBadge({ level }: { level: string }) {
  const color =
    level === "high"
      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      : level === "medium"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
        : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium", color)}>
      <Shield className="size-3.5" />
      {level}
    </span>
  );
}

export function SecurityPageClient() {
  const { t } = useLocalizationContext();
  const [tab, setTab] = React.useState<Tab>("overview");
  const [search, setSearch] = React.useState("");
  const [eventTypeFilter, setEventTypeFilter] = React.useState("all");
  const [severityFilter, setSeverityFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [auditSearch, setAuditSearch] = React.useState("");
  const [auditDateFrom, setAuditDateFrom] = React.useState("");
  const [auditDateTo, setAuditDateTo] = React.useState("");
  const [showCreateIncident, setShowCreateIncident] = React.useState(false);
  const [selectedIncident, setSelectedIncident] = React.useState<any>(null);
  const [newIncident, setNewIncident] = React.useState({ title: "", description: "", severity: "medium" });

  const { data: overviewData, isLoading: overviewLoading, mutate: mutateOverview } = useSWR(
    "/api/admin/security/overview",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: eventsData, isLoading: eventsLoading, mutate: mutateEvents } = useSWR(
    "/api/admin/security/events",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: incidentsData, isLoading: incidentsLoading, mutate: mutateIncidents } = useSWR(
    "/api/admin/security/incidents",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: auditData, isLoading: auditLoading, mutate: mutateAudit } = useSWR(
    "/api/admin/security/audit",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: rateLimitsData, isLoading: rateLimitsLoading, mutate: mutateRateLimits } = useSWR(
    "/api/admin/security/rate-limits",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const overview = React.useMemo(() => {
    if (overviewData?.success && overviewData.data) return overviewData.data;
    return { stats: {}, threatLevel: "low", securityScore: 100 };
  }, [overviewData]);

  const events = React.useMemo(() => {
    if (eventsData?.success && Array.isArray(eventsData.data)) return eventsData.data;
    return [];
  }, [eventsData]);

  const incidents = React.useMemo(() => {
    if (incidentsData?.success && Array.isArray(incidentsData.data)) return incidentsData.data;
    return [];
  }, [incidentsData]);

  const auditLogs = React.useMemo(() => {
    if (auditData?.success && Array.isArray(auditData.data)) return auditData.data;
    return [];
  }, [auditData]);

  const rateLimits = React.useMemo(() => {
    if (rateLimitsData?.success && rateLimitsData.data) return rateLimitsData.data;
    return { limits: [], summary: { total: 0, blocked: 0, active: 0 } };
  }, [rateLimitsData]);

  const stats = overview.stats || {};

  const filteredEvents = React.useMemo(() => {
    let result = events;
    if (eventTypeFilter !== "all") {
      result = result.filter((e: any) => e.eventType === eventTypeFilter);
    }
    if (severityFilter !== "all") {
      result = result.filter((e: any) => e.severity === severityFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e: any) =>
        (e.eventType || "").toLowerCase().includes(q) ||
        (e.description || "").toLowerCase().includes(q) ||
        (e.source || "").toLowerCase().includes(q) ||
        (e.ipAddress || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, eventTypeFilter, severityFilter, search]);

  const filteredAuditLogs = React.useMemo(() => {
    let result = auditLogs;
    if (statusFilter !== "all") {
      result = result.filter((l: any) => l.entityType === statusFilter);
    }
    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      result = result.filter((l: any) =>
        (l.action || "").toLowerCase().includes(q) ||
        (l.entityType || "").toLowerCase().includes(q) ||
        (l.userId || "").toLowerCase().includes(q) ||
        (l.ipAddress || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [auditLogs, statusFilter, auditSearch]);

  const filteredIncidents = React.useMemo(() => {
    let result = incidents;
    if (statusFilter !== "all") {
      result = result.filter((i: any) => i.status === statusFilter);
    }
    if (severityFilter !== "all") {
      result = result.filter((i: any) => i.severity === severityFilter);
    }
    return result;
  }, [incidents, statusFilter, severityFilter]);

  const handleCreateIncident = async () => {
    if (!newIncident.title) {
      toast.error(t("admin.error.missingFields", "Please fill in all fields."));
      return;
    }
    try {
      const res = await fetch("/api/admin/security/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncident),
      });
      if (res.ok) {
        toast.success(t("admin.incidentCreated", "Incident created"));
        setShowCreateIncident(false);
        setNewIncident({ title: "", description: "", severity: "medium" });
        mutateIncidents();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleUpdateIncident = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/security/incidents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note: `Status changed to ${status}` }),
      });
      if (res.ok) {
        toast.success(t("common.success", "Updated"));
        setSelectedIncident(null);
        mutateIncidents();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t("admin.overview", "Overview") },
    { key: "events", label: t("admin.securityEvents", "Security Events") },
    { key: "incidents", label: t("admin.securityIncidents", "Security Incidents") },
    { key: "audit", label: t("admin.auditLog", "Audit Log") },
    { key: "rate-limits", label: t("admin.rateLimits", "Rate Limits") },
  ];

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.security", "Security") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.security", "Security")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.securityDescription", "System security monitoring, threats, and audit logs")}</p>
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
      <Breadcrumbs items={[{ label: t("admin.security", "Security") }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold leading-tight">{t("admin.security", "Security")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{t("admin.securityDescription", "System security monitoring, threats, and audit logs")}</p>
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
              <ThreatLevelBadge level={overview.threatLevel || "low"} />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{t("admin.securityScore", "Security Score")}:</span>
                <span className="font-semibold text-foreground">{overview.securityScore ?? 100}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: t("admin.recentEvents", "Recent Events"), value: stats.todayEvents ?? 0, icon: <Activity className="size-4" /> },
                { label: t("admin.openIncidents", "Open Incidents"), value: stats.openIncidents ?? 0, icon: <AlertTriangle className="size-4" /> },
                { label: t("admin.failedLogins", "Failed Logins"), value: stats.failedLogins ?? 0, icon: <Lock className="size-4" /> },
                { label: t("admin.rateLimitHits", "Rate Limit Hits"), value: stats.rateLimitHits ?? 0, icon: <Key className="size-4" /> },
                { label: t("admin.securityEvents", "Total Events"), value: stats.totalEvents ?? 0, icon: <Eye className="size-4" /> },
                { label: t("admin.auditLog", "Audit Entries"), value: stats.totalAuditEntries ?? 0, icon: <FileText className="size-4" /> },
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

          <DashboardCard title={t("admin.securityIncidents", "Security Incidents")}>
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
              <p className="text-sm text-muted-foreground py-4 text-center">{t("admin.noIncidents", "No security incidents")}</p>
            )}
          </DashboardCard>
        </div>
      )}

      {tab === "events" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t("common.all", "All")}</option>
                  <option value="failed_login">Failed Login</option>
                  <option value="rate_limit_exceeded">Rate Limit</option>
                  <option value="unauthorized_access">Unauthorized Access</option>
                  <option value="suspicious_activity">Suspicious Activity</option>
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
                  <option value="info">Info</option>
                </select>
              </div>
              <Button variant="outline" size="sm" onClick={() => mutateEvents()}>
                <RefreshCw className="mr-2 size-4" />
                {t("common.refresh", "Refresh")}
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("common.search", "Search...")}
                className="pl-9"
              />
            </div>

            {eventsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("admin.noEvents", "No security events")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.type", "Type")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.status", "Severity")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Source</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">IP</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.description", "Description")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.date", "Time")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event: any) => (
                      <tr key={event.id} className="border-b border-border/50">
                        <td className="py-3 font-medium">{event.eventType}</td>
                        <td className="py-3"><SeverityBadge severity={event.severity} /></td>
                        <td className="py-3 text-muted-foreground">{event.source}</td>
                        <td className="py-3 text-xs font-mono text-muted-foreground">{event.ipAddress || "-"}</td>
                        <td className="py-3 text-muted-foreground text-xs max-w-[200px] truncate">{event.description || "-"}</td>
                        <td className="py-3 text-muted-foreground text-xs">{event.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>
        </div>
      )}

      {tab === "incidents" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t("common.all", "All")}</option>
                  <option value="open">{t("admin.open", "Open")}</option>
                  <option value="investigating">{t("admin.investigating", "Investigating")}</option>
                  <option value="resolved">{t("admin.resolved", "Resolved")}</option>
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
                    {t("common.date", "Created")}: {selectedIncident.createdAt}
                  </div>
                  {selectedIncident.affectedServices && selectedIncident.affectedServices.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Affected Services</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedIncident.affectedServices.map((s: string) => (
                          <Badge key={s} tone="muted">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedIncident.timeline && selectedIncident.timeline.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Timeline</p>
                      <div className="space-y-2">
                        {selectedIncident.timeline.map((event: any, idx: number) => (
                          <div key={idx} className="flex gap-3 text-sm">
                            <span className="text-muted-foreground text-xs whitespace-nowrap">{event.timestamp}</span>
                            <Badge tone="muted">{event.action}</Badge>
                            <span>{event.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedIncident.status !== "resolved" && (
                    <div className="mt-4 flex gap-2">
                      {["investigating", "resolved"].map((status) => (
                        <Button
                          key={status}
                          variant={selectedIncident.status === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleUpdateIncident(selectedIncident.id, status)}
                        >
                          {status === "resolved" ? t("admin.resolved", "Resolved") : t("admin.investigating", "Investigating")}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : incidentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredIncidents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("admin.noIncidents", "No security incidents")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.incidentTitle", "Title")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.incidentSeverity", "Severity")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Affected Users</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.date", "Created")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIncidents.map((incident: any) => (
                      <tr
                        key={incident.id}
                        className="border-b border-border/50 cursor-pointer hover:bg-muted/30"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <td className="py-3 font-medium">{incident.title}</td>
                        <td className="py-3"><SeverityBadge severity={incident.severity} /></td>
                        <td className="py-3"><StatusBadge status={incident.status} /></td>
                        <td className="py-3 text-muted-foreground">{incident.affectedUsers ?? 0}</td>
                        <td className="py-3 text-muted-foreground text-xs">{incident.createdAt}</td>
                      </tr>
                    ))}
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
                    placeholder="e.g. Brute force login attempt detected"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("admin.incidentDescription", "Description")}</Label>
                  <textarea
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    placeholder="Describe the security incident..."
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                  />
                </div>
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

      {tab === "audit" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t("common.all", "All")}</option>
                  <option value="user">User</option>
                  <option value="workspace">Workspace</option>
                  <option value="api_key">API Key</option>
                  <option value="settings">Settings</option>
                </select>
                <input
                  type="date"
                  value={auditDateFrom}
                  onChange={(e) => setAuditDateFrom(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                />
                <input
                  type="date"
                  value={auditDateTo}
                  onChange={(e) => setAuditDateTo(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => mutateAudit()}>
                <RefreshCw className="mr-2 size-4" />
                {t("common.refresh", "Refresh")}
              </Button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder={t("common.search", "Search...")}
                className="pl-9"
              />
            </div>

            {auditLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAuditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("admin.noAuditEntries", "No audit entries")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.auditLogs.action", "Action")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Entity</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">User</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">IP</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("admin.auditLogs.timestamp", "Timestamp")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((log: any) => (
                      <tr key={log.id} className="border-b border-border/50">
                        <td className="py-3 font-medium">{log.action}</td>
                        <td className="py-3 text-muted-foreground">
                          <code className="text-xs bg-muted/50 px-2 py-0.5 rounded">{log.entityType}</code>
                        </td>
                        <td className="py-3 text-muted-foreground">{log.userId || "-"}</td>
                        <td className="py-3 text-xs font-mono text-muted-foreground">{log.ipAddress || "-"}</td>
                        <td className="py-3 text-muted-foreground text-xs">{log.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>
        </div>
      )}

      {tab === "rate-limits" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("admin.rateLimits", "Rate Limits")}</h3>
              <Button variant="outline" size="sm" onClick={() => mutateRateLimits()}>
                <RefreshCw className="mr-2 size-4" />
                {t("common.refresh", "Refresh")}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="text-xs text-muted-foreground">Total Rules</div>
                <p className="mt-2 text-2xl font-semibold">{rateLimits.summary?.total ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="text-xs text-muted-foreground">Active</div>
                <p className="mt-2 text-2xl font-semibold text-green-600">{rateLimits.summary?.active ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <div className="text-xs text-muted-foreground">Blocked</div>
                <p className="mt-2 text-2xl font-semibold text-red-600">{rateLimits.summary?.blocked ?? 0}</p>
              </div>
            </div>

            {rateLimitsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : !rateLimits.limits || rateLimits.limits.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Key className="size-8 mb-2" />
                <p className="text-sm">{t("common.noData", "No rate limit rules configured")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">Key</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Max Requests</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Window</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Current</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Status</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rateLimits.limits.map((limit: any, idx: number) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-3 font-medium font-mono text-xs">{limit.key}</td>
                        <td className="py-3">{limit.maxRequests}</td>
                        <td className="py-3 text-muted-foreground">{limit.windowMs}ms</td>
                        <td className="py-3">{limit.currentCount}</td>
                        <td className="py-3">
                          {limit.blockedUntil && new Date(limit.blockedUntil) > new Date() ? (
                            <Badge tone="default">Blocked</Badge>
                          ) : limit.currentCount > 0 ? (
                            <Badge tone="warning">Active</Badge>
                          ) : (
                            <Badge tone="muted">Idle</Badge>
                          )}
                        </td>
                        <td className="py-3 text-muted-foreground text-xs">{limit.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>
        </div>
      )}
    </div>
  );
}
