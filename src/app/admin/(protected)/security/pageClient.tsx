"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Ban,
  Upload,
  Globe,
  Settings,
  Trash2,
  BookOpen,
  Zap,
  Users,
  Wifi,
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

type Tab = "overview" | "threats" | "incidents" | "sessions" | "api" | "uploads" | "compliance" | "reports" | "settings" | "audit";

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

function ComplianceBadge({ status }: { status: string }) {
  const tone =
    status === "passed"
      ? "success"
      : status === "failed"
        ? "default"
        : status === "partial"
          ? "warning"
          : "muted";
  return <Badge tone={tone}>{status}</Badge>;
}

export function SecurityPageClient() {
  const { t } = useLocalizationContext();
  const [tab, setTab] = React.useState<Tab>("overview");
  const [search, setSearch] = React.useState("");
  const [eventTypeFilter, setEventTypeFilter] = React.useState("all");
  const [severityFilter, setSeverityFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [showCreateIncident, setShowCreateIncident] = React.useState(false);
  const [selectedIncident, setSelectedIncident] = React.useState<any>(null);
  const [newIncident, setNewIncident] = React.useState({ title: "", description: "", severity: "medium", category: "" });
  const [showCreateReport, setShowCreateReport] = React.useState(false);
  const [newReport, setNewReport] = React.useState({ title: "", reportType: "security_overview", period: "" });
  const [showCreateEvent, setShowCreateEvent] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState({ eventType: "suspicious_activity", severity: "medium", category: "manual", description: "" });
  const [selectedReport, setSelectedReport] = React.useState<any>(null);
  const [settingsForm, setSettingsForm] = React.useState<any>(null);

  const { data: overviewData, isLoading: overviewLoading, mutate: mutateOverview } = useSWR(
    "/api/security/overview",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: eventsData, isLoading: eventsLoading, mutate: mutateEvents } = useSWR(
    "/api/security/events",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: incidentsData, isLoading: incidentsLoading, mutate: mutateIncidents } = useSWR(
    "/api/security/incidents",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: sessionsData, isLoading: sessionsLoading, mutate: mutateSessions } = useSWR(
    "/api/security/sessions",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: apiEventsData, isLoading: apiEventsLoading, mutate: mutateApiEvents } = useSWR(
    "/api/security/api-events",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: slowEndpointsData, isLoading: slowEndpointsLoading } = useSWR(
    "/api/security/api-events/slow",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: uploadsData, isLoading: uploadsLoading, mutate: mutateUploads } = useSWR(
    "/api/security/uploads",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: complianceData, isLoading: complianceLoading, mutate: mutateCompliance } = useSWR(
    "/api/security/compliance",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: reportsData, isLoading: reportsLoading, mutate: mutateReports } = useSWR(
    "/api/security/reports",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR(
    "/api/security/settings",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: auditData, isLoading: auditLoading, mutate: mutateAudit } = useSWR(
    "/api/admin/security/audit",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: threatsTodayData, isLoading: threatsTodayLoading, mutate: mutateThreatsToday } = useSWR(
    "/api/security/threats/today",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: statsData } = useSWR(
    "/api/security/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const overview = React.useMemo(() => {
    if (overviewData?.success && overviewData.data) return overviewData.data;
    return { threats: {}, incidents: {}, sessions: {}, api: {}, uploads: {}, compliance: {} };
  }, [overviewData]);

  const events = React.useMemo(() => {
    if (eventsData?.success && eventsData.data?.data) return eventsData.data.data;
    return [];
  }, [eventsData]);

  const incidents = React.useMemo(() => {
    if (incidentsData?.success && incidentsData.data?.data) return incidentsData.data.data;
    return [];
  }, [incidentsData]);

  const sessions = React.useMemo(() => {
    if (sessionsData?.success && Array.isArray(sessionsData.data)) return sessionsData.data;
    return [];
  }, [sessionsData]);

  const apiEvents = React.useMemo(() => {
    if (apiEventsData?.success && apiEventsData.data?.data) return apiEventsData.data.data;
    return [];
  }, [apiEventsData]);

  const slowEndpoints = React.useMemo(() => {
    if (slowEndpointsData?.success && Array.isArray(slowEndpointsData.data)) return slowEndpointsData.data;
    return [];
  }, [slowEndpointsData]);

  const uploads = React.useMemo(() => {
    if (uploadsData?.success && uploadsData.data?.data) return uploadsData.data.data;
    return [];
  }, [uploadsData]);

  const complianceControls = React.useMemo(() => {
    if (complianceData?.success && Array.isArray(complianceData.data)) return complianceData.data;
    return [];
  }, [complianceData]);

  const reports = React.useMemo(() => {
    if (reportsData?.success && reportsData.data?.data) return reportsData.data.data;
    return [];
  }, [reportsData]);

  const settings = React.useMemo(() => {
    if (settingsData?.success && settingsData.data) return settingsData.data;
    return null;
  }, [settingsData]);

  const auditLogs = React.useMemo(() => {
    if (auditData?.success && Array.isArray(auditData.data)) return auditData.data;
    return [];
  }, [auditData]);

  const threatsToday = React.useMemo(() => {
    if (threatsTodayData?.success && Array.isArray(threatsTodayData.data)) return threatsTodayData.data;
    return [];
  }, [threatsTodayData]);

  const stats = React.useMemo(() => {
    if (statsData?.success && statsData.data) return statsData.data;
    return { threats: {}, incidents: {}, sessions: {}, api: {}, uploads: {}, compliance: {} };
  }, [statsData]);

  React.useEffect(() => {
    if (settings && !settingsForm) {
      setSettingsForm(settings);
    }
  }, [settings, settingsForm]);

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
        (e.category || "").toLowerCase().includes(q) ||
        (e.resource || "").toLowerCase().includes(q) ||
        (e.ipAddress || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, eventTypeFilter, severityFilter, search]);

  const filteredIncidents = React.useMemo(() => {
    let result = incidents;
    if (statusFilter !== "all") {
      result = result.filter((i: any) => i.status === statusFilter);
    }
    if (severityFilter !== "all") {
      result = result.filter((i: any) => i.severity === severityFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i: any) =>
        (i.title || "").toLowerCase().includes(q) ||
        (i.description || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [incidents, statusFilter, severityFilter, search]);

  const filteredSessions = React.useMemo(() => {
    if (!search) return sessions;
    const q = search.toLowerCase();
    return sessions.filter((s: any) =>
      (s.userId || "").toLowerCase().includes(q) ||
      (s.ipAddress || "").toLowerCase().includes(q) ||
      (s.userAgent || "").toLowerCase().includes(q) ||
      (s.device || "").toLowerCase().includes(q)
    );
  }, [sessions, search]);

  const filteredApiEvents = React.useMemo(() => {
    let result = apiEvents;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((e: any) =>
        (e.endpoint || "").toLowerCase().includes(q) ||
        (e.method || "").toLowerCase().includes(q) ||
        (e.userId || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [apiEvents, search]);

  const filteredAuditLogs = React.useMemo(() => {
    let result = auditLogs;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l: any) =>
        (l.action || "").toLowerCase().includes(q) ||
        (l.entityType || "").toLowerCase().includes(q) ||
        (l.userId || "").toLowerCase().includes(q) ||
        (l.ipAddress || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [auditLogs, search]);

  const handleCreateIncident = async () => {
    if (!newIncident.title) {
      toast.error(t("security.fillRequired", "Please fill in all required fields"));
      return;
    }
    try {
      const res = await fetch("/api/security/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIncident),
      });
      if (res.ok) {
        toast.success(t("security.incidentCreated", "Incident created"));
        setShowCreateIncident(false);
        setNewIncident({ title: "", description: "", severity: "medium", category: "" });
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
      const res = await fetch(`/api/security/incidents/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: "Resolved by admin" }),
      });
      if (res.ok) {
        toast.success(t("security.incidentResolved", "Incident resolved"));
        setSelectedIncident(null);
        mutateIncidents();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      const res = await fetch(`/api/security/sessions/${id}/revoke`, { method: "POST" });
      if (res.ok) {
        toast.success(t("security.sessionRevoked", "Session revoked"));
        mutateSessions();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleRevokeAllSessions = async (userId: string) => {
    try {
      const res = await fetch("/api/security/sessions/revoke-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        toast.success(t("security.allSessionsRevoked", "All sessions revoked"));
        mutateSessions();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleResolveEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/security/events/${id}/resolve`, { method: "POST" });
      if (res.ok) {
        toast.success(t("security.eventResolved", "Event resolved"));
        mutateEvents();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleCreateReport = async () => {
    if (!newReport.title) {
      toast.error(t("security.fillRequired", "Please fill in all required fields"));
      return;
    }
    try {
      const res = await fetch("/api/security/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReport),
      });
      if (res.ok) {
        toast.success(t("security.reportGenerated", "Report generated"));
        setShowCreateReport(false);
        setNewReport({ title: "", reportType: "security_overview", period: "" });
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
      const res = await fetch(`/api/security/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("security.reportDeleted", "Report deleted"));
        setSelectedReport(null);
        mutateReports();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleSaveSettings = async () => {
    if (!settingsForm) return;
    try {
      const res = await fetch("/api/security/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        toast.success(t("security.settingsSaved", "Settings saved"));
        mutateSettings();
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleCreateEvent = async () => {
    try {
      const res = await fetch("/api/security/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      if (res.ok) {
        toast.success(t("security.eventCreated", "Event recorded"));
        setShowCreateEvent(false);
        setNewEvent({ eventType: "suspicious_activity", severity: "medium", category: "manual", description: "" });
        mutateEvents();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: t("security.tab.overview", "Overview"), icon: <Eye className="size-4" /> },
    { key: "threats", label: t("security.tab.threats", "Threats"), icon: <AlertTriangle className="size-4" /> },
    { key: "incidents", label: t("security.tab.incidents", "Incidents"), icon: <Shield className="size-4" /> },
    { key: "sessions", label: t("security.tab.sessions", "Sessions"), icon: <Users className="size-4" /> },
    { key: "api", label: t("security.tab.api", "API"), icon: <Wifi className="size-4" /> },
    { key: "uploads", label: t("security.tab.uploads", "Uploads"), icon: <Upload className="size-4" /> },
    { key: "compliance", label: t("security.tab.compliance", "Compliance"), icon: <CheckCircle className="size-4" /> },
    { key: "reports", label: t("security.tab.reports", "Reports"), icon: <FileText className="size-4" /> },
    { key: "settings", label: t("security.tab.settings", "Settings"), icon: <Settings className="size-4" /> },
    { key: "audit", label: t("security.tab.audit", "Audit Logs"), icon: <BookOpen className="size-4" /> },
  ];

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("security.title", "Security")}
          description={t("security.description", "Security monitoring, threats, and compliance")}
        />
        <DashboardCard>
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
      <PageHeader
        title={t("security.title", "Security")}
        description={t("security.description", "Security monitoring, threats, and compliance")}
        actions={
          <Button variant="outline" size="sm" onClick={() => { mutateOverview(); mutateEvents(); mutateIncidents(); mutateSessions(); mutateApiEvents(); mutateUploads(); mutateCompliance(); mutateReports(); mutateSettings(); mutateAudit(); mutateThreatsToday(); }}>
            <RefreshCw className="mr-2 size-4" />
            {t("common.refresh", "Refresh")}
          </Button>
        }
      />

      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1 overflow-x-auto">
        {tabs.map((t_item) => (
          <button
            key={t_item.key}
            onClick={() => { setTab(t_item.key); setSearch(""); setEventTypeFilter("all"); setSeverityFilter("all"); setStatusFilter("all"); }}
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <AlertTriangle className="size-4" />
                {t("security.threats", "Threats")}
              </div>
              <p className="text-2xl font-semibold">{stats.threats?.total ?? 0}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-red-600">{stats.threats?.critical ?? 0} critical</span>
                <span>·</span>
                <span>{stats.threats?.blocked ?? 0} blocked</span>
                <span>·</span>
                <span>{stats.threats?.today ?? 0} today</span>
              </div>
            </DashboardCard>

            <DashboardCard>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Shield className="size-4" />
                {t("security.incidents", "Incidents")}
              </div>
              <p className="text-2xl font-semibold">{stats.incidents?.total ?? 0}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-amber-600">{stats.incidents?.open ?? 0} open</span>
                <span>·</span>
                <span className="text-red-600">{stats.incidents?.critical ?? 0} critical</span>
              </div>
            </DashboardCard>

            <DashboardCard>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Users className="size-4" />
                {t("security.sessions", "Sessions")}
              </div>
              <p className="text-2xl font-semibold">{stats.sessions?.active ?? 0}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{stats.sessions?.total ?? 0} total</span>
                <span>·</span>
                <span className="text-amber-600">{stats.sessions?.suspicious ?? 0} suspicious</span>
              </div>
            </DashboardCard>

            <DashboardCard>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Wifi className="size-4" />
                {t("security.apiTraffic", "API Traffic")}
              </div>
              <p className="text-2xl font-semibold">{stats.api?.total ?? 0}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{stats.api?.today ?? 0} today</span>
                <span>·</span>
                <span className="text-red-600">{stats.api?.errors ?? 0} errors</span>
                <span>·</span>
                <span className="text-amber-600">{stats.api?.rateLimited ?? 0} rate limited</span>
              </div>
            </DashboardCard>

            <DashboardCard>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Upload className="size-4" />
                {t("security.uploads", "Uploads")}
              </div>
              <p className="text-2xl font-semibold">{stats.uploads?.total ?? 0}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-red-600">{stats.uploads?.invalid ?? 0} invalid</span>
                <span>·</span>
                <span className="text-amber-600">{stats.uploads?.suspicious ?? 0} suspicious</span>
              </div>
            </DashboardCard>

            <DashboardCard>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <CheckCircle className="size-4" />
                {t("security.compliance", "Compliance")}
              </div>
              <p className="text-2xl font-semibold">{stats.compliance?.score ?? 0}%</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="text-green-600">{stats.compliance?.passed ?? 0} passed</span>
                <span>·</span>
                <span className="text-red-600">{stats.compliance?.failed ?? 0} failed</span>
                <span>·</span>
                <span>{stats.compliance?.pending ?? 0} pending</span>
              </div>
            </DashboardCard>
          </div>

          {threatsToday.length > 0 && (
            <DashboardCard title={t("security.threatsToday", "Threats Today")}>
              <div className="space-y-2">
                {threatsToday.slice(0, 5).map((threat: any) => (
                  <div key={threat.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <SeverityBadge severity={threat.severity} />
                      <div>
                        <p className="text-sm font-medium">{threat.eventType}</p>
                        <p className="text-xs text-muted-foreground">{threat.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {threat.blocked && <Badge tone="default"><Ban className="size-3 mr-1" />Blocked</Badge>}
                      <span className="text-xs text-muted-foreground">{threat.ipAddress || "-"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          )}

          {incidents.length > 0 && (
            <DashboardCard title={t("security.recentIncidents", "Recent Incidents")}>
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
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "threats" && (
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
                  <option value="brute_force">Brute Force</option>
                  <option value="api_abuse">API Abuse</option>
                  <option value="suspicious_upload">Suspicious Upload</option>
                  <option value="privilege_escalation">Privilege Escalation</option>
                  <option value="prompt_injection">Prompt Injection</option>
                  <option value="session_hijack">Session Hijack</option>
                  <option value="unusual_activity">Unusual Activity</option>
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
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowCreateEvent(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("security.recordEvent", "Record Event")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => mutateEvents()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
              </div>
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
              <p className="text-sm text-muted-foreground py-8 text-center">{t("security.noEvents", "No threat events")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.type", "Type")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.severity", "Severity")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Category</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Resource</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">IP</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Blocked</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Resolved</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.date", "Time")}</th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">{t("common.actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event: any) => (
                      <tr key={event.id} className="border-b border-border/50">
                        <td className="py-3 font-medium">{event.eventType}</td>
                        <td className="py-3"><SeverityBadge severity={event.severity} /></td>
                        <td className="py-3 text-muted-foreground">{event.category}</td>
                        <td className="py-3 text-muted-foreground text-xs">{event.resource || "-"}</td>
                        <td className="py-3 text-xs font-mono text-muted-foreground">{event.ipAddress || "-"}</td>
                        <td className="py-3">{event.blocked ? <Badge tone="default">Yes</Badge> : <Badge tone="muted">No</Badge>}</td>
                        <td className="py-3">{event.resolved ? <Badge tone="success">Yes</Badge> : <Badge tone="muted">No</Badge>}</td>
                        <td className="py-3 text-muted-foreground text-xs">{event.createdAt}</td>
                        <td className="py-3 text-right">
                          {!event.resolved && (
                            <Button variant="ghost" size="sm" onClick={() => handleResolveEvent(event.id)}>
                              <CheckCircle className="size-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>

          {showCreateEvent && (
            <DashboardCard title={t("security.recordEvent", "Record Event")}>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("common.type", "Event Type")}</Label>
                    <select
                      value={newEvent.eventType}
                      onChange={(e) => setNewEvent({ ...newEvent, eventType: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="brute_force">Brute Force</option>
                      <option value="api_abuse">API Abuse</option>
                      <option value="suspicious_upload">Suspicious Upload</option>
                      <option value="privilege_escalation">Privilege Escalation</option>
                      <option value="prompt_injection">Prompt Injection</option>
                      <option value="session_hijack">Session Hijack</option>
                      <option value="unusual_activity">Unusual Activity</option>
                    </select>
                  </div>
                  <div>
                    <Label>{t("common.severity", "Severity")}</Label>
                    <select
                      value={newEvent.severity}
                      onChange={(e) => setNewEvent({ ...newEvent, severity: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="info">Info</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                    placeholder="e.g. manual, system"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("common.description", "Description")}</Label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Describe the event..."
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowCreateEvent(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleCreateEvent}>
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
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm"
                >
                  <option value="all">{t("common.all", "All")}</option>
                  <option value="open">{t("security.open", "Open")}</option>
                  <option value="investigating">{t("security.investigating", "Investigating")}</option>
                  <option value="resolved">{t("security.resolved", "Resolved")}</option>
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
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setShowCreateIncident(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("security.createIncident", "Create Incident")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => mutateIncidents()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
              </div>
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

            {selectedIncident ? (
              <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedIncident(null)}>
                  ← {t("common.back", "Back")}
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
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span>Category: <code className="bg-muted/50 px-1.5 py-0.5 rounded">{selectedIncident.category}</code></span>
                    <span>Created: {selectedIncident.createdAt}</span>
                  </div>
                  {selectedIncident.affectedSystems && selectedIncident.affectedSystems.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("security.affectedSystems", "Affected Systems")}</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedIncident.affectedSystems.map((s: string) => (
                          <Badge key={s} tone="muted">{s}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedIncident.resolution && (
                    <div className="mb-4 rounded-lg bg-muted/20 p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t("security.resolution", "Resolution")}</p>
                      <p className="text-sm">{selectedIncident.resolution}</p>
                    </div>
                  )}
                  {selectedIncident.status !== "resolved" && (
                    <div className="mt-4 flex gap-2">
                      {["investigating", "resolved"].map((status) => (
                        <Button
                          key={status}
                          variant={selectedIncident.status === status ? "default" : "outline"}
                          size="sm"
                          onClick={() => status === "resolved" ? handleResolveIncident(selectedIncident.id) : undefined}
                        >
                          {status === "resolved" ? t("security.resolve", "Resolve") : t("security.investigating", "Investigating")}
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
              <p className="text-sm text-muted-foreground py-8 text-center">{t("security.noIncidents", "No security incidents")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("security.title", "Title")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.severity", "Severity")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Category</th>
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
                        <td className="py-3 text-muted-foreground text-xs">{incident.category}</td>
                        <td className="py-3 text-muted-foreground text-xs">{incident.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>

          {showCreateIncident && (
            <DashboardCard title={t("security.createIncident", "Create Incident")}>
              <div className="grid gap-4">
                <div>
                  <Label>{t("security.title", "Title")}</Label>
                  <Input
                    value={newIncident.title}
                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                    placeholder="e.g. Brute force login attempt detected"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("common.description", "Description")}</Label>
                  <textarea
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    placeholder="Describe the security incident..."
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t("common.severity", "Severity")}</Label>
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
                    <Label>Category</Label>
                    <Input
                      value={newIncident.category}
                      onChange={(e) => setNewIncident({ ...newIncident, category: e.target.value })}
                      placeholder="e.g. auth, network"
                      className="mt-1"
                    />
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

      {tab === "sessions" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>{t("security.activeSessions", "Active")}: <strong className="text-foreground">{sessions.length}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => mutateSessions()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
              </div>
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

            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("security.noSessions", "No active sessions")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">User</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">IP</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Device</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">User Agent</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Suspicious</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.date", "Last Activity")}</th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">{t("common.actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSessions.map((session: any) => (
                      <tr key={session.id} className="border-b border-border/50">
                        <td className="py-3 font-medium text-xs font-mono">{session.userId}</td>
                        <td className="py-3 text-xs font-mono text-muted-foreground">{session.ipAddress || "-"}</td>
                        <td className="py-3 text-muted-foreground">{session.device || "-"}</td>
                        <td className="py-3 text-muted-foreground text-xs max-w-[200px] truncate">{session.userAgent || "-"}</td>
                        <td className="py-3">{session.isSuspicious ? <Badge tone="warning">Yes</Badge> : <Badge tone="muted">No</Badge>}</td>
                        <td className="py-3 text-muted-foreground text-xs">{session.lastActivityAt}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(session.id)} title="Revoke">
                              <Ban className="size-4 text-red-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleRevokeAllSessions(session.userId)} title="Revoke All">
                              <Trash2 className="size-4 text-red-500" />
                            </Button>
                          </div>
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

      {tab === "api" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("security.apiEvents", "API Security Events")}</h3>
              <Button variant="outline" size="sm" onClick={() => mutateApiEvents()}>
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

            {apiEventsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredApiEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("security.noApiEvents", "No API events")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">Method</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Endpoint</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Status</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Latency</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">User</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">IP</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Rate Limited</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.date", "Time")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApiEvents.map((event: any) => (
                      <tr key={event.id} className="border-b border-border/50">
                        <td className="py-3">
                          <Badge tone={event.method === "GET" ? "muted" : event.method === "POST" ? "info" : "warning"}>{event.method}</Badge>
                        </td>
                        <td className="py-3 text-xs font-mono text-muted-foreground max-w-[250px] truncate">{event.endpoint}</td>
                        <td className="py-3">
                          {event.statusCode ? (
                            <Badge tone={event.statusCode < 400 ? "success" : event.statusCode < 500 ? "warning" : "default"}>
                              {event.statusCode}
                            </Badge>
                          ) : "-"}
                        </td>
                        <td className="py-3 text-muted-foreground text-xs">{event.latencyMs ? `${event.latencyMs}ms` : "-"}</td>
                        <td className="py-3 text-muted-foreground text-xs font-mono">{event.userId || "-"}</td>
                        <td className="py-3 text-xs font-mono text-muted-foreground">{event.ipAddress || "-"}</td>
                        <td className="py-3">{event.rateLimited ? <Badge tone="warning">Yes</Badge> : <Badge tone="muted">No</Badge>}</td>
                        <td className="py-3 text-muted-foreground text-xs">{event.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>

          {slowEndpoints.length > 0 && (
            <DashboardCard title={t("security.slowEndpoints", "Slow Endpoints")}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">Method</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Endpoint</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Avg Latency</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slowEndpoints.map((ep: any, idx: number) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-3"><Badge tone="muted">{ep.method}</Badge></td>
                        <td className="py-3 text-xs font-mono text-muted-foreground">{ep.endpoint}</td>
                        <td className="py-3 font-medium">{Math.round(ep.avgLatency)}ms</td>
                        <td className="py-3 text-muted-foreground">{ep.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "uploads" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("security.uploadEvents", "Upload Security Events")}</h3>
              <Button variant="outline" size="sm" onClick={() => mutateUploads()}>
                <RefreshCw className="mr-2 size-4" />
                {t("common.refresh", "Refresh")}
              </Button>
            </div>

            {uploadsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : uploads.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("security.noUploads", "No upload events")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">User</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Filename</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">MIME Type</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Size</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Valid</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Suspicious</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">IP</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.date", "Time")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploads.map((upload: any) => (
                      <tr key={upload.id} className="border-b border-border/50">
                        <td className="py-3 text-xs font-mono text-muted-foreground">{upload.userId}</td>
                        <td className="py-3 font-medium">{upload.filename}</td>
                        <td className="py-3 text-muted-foreground text-xs">{upload.mimeType || "-"}</td>
                        <td className="py-3 text-muted-foreground text-xs">{upload.fileSize ? `${(upload.fileSize / 1024).toFixed(1)}KB` : "-"}</td>
                        <td className="py-3">{upload.isValid ? <Badge tone="success">Yes</Badge> : <Badge tone="default">No</Badge>}</td>
                        <td className="py-3">{upload.isSuspicious ? <Badge tone="warning">Yes</Badge> : <Badge tone="muted">No</Badge>}</td>
                        <td className="py-3 text-xs font-mono text-muted-foreground">{upload.ipAddress || "-"}</td>
                        <td className="py-3 text-muted-foreground text-xs">{upload.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>
        </div>
      )}

      {tab === "compliance" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("security.complianceStatus", "Compliance Status")}</h3>
              <Button variant="outline" size="sm" onClick={() => mutateCompliance()}>
                <RefreshCw className="mr-2 size-4" />
                {t("common.refresh", "Refresh")}
              </Button>
            </div>

            {complianceLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : complianceControls.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("security.noComplianceData", "No compliance controls configured")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">Framework</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Control</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.description", "Description")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.status", "Status")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Notes</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Last Verified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceControls.map((control: any) => (
                      <tr key={control.id} className="border-b border-border/50">
                        <td className="py-3"><Badge tone="info">{control.framework}</Badge></td>
                        <td className="py-3 font-medium font-mono text-xs">{control.control}</td>
                        <td className="py-3 text-muted-foreground text-xs max-w-[250px] truncate">{control.description || "-"}</td>
                        <td className="py-3"><ComplianceBadge status={control.status} /></td>
                        <td className="py-3 text-muted-foreground text-xs max-w-[200px] truncate">{control.notes || "-"}</td>
                        <td className="py-3 text-muted-foreground text-xs">{control.lastVerifiedAt || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("security.securityReports", "Security Reports")}</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setShowCreateReport(true)}>
                  <Plus className="mr-2 size-4" />
                  {t("security.generateReport", "Generate Report")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => mutateReports()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
              </div>
            </div>

            {selectedReport ? (
              <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>
                  ← {t("common.back", "Back")}
                </Button>
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold">{selectedReport.title}</h4>
                    <div className="flex items-center gap-2">
                      <Badge tone="info">{selectedReport.reportType}</Badge>
                      {selectedReport.period && <Badge tone="muted">{selectedReport.period}</Badge>}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mb-4">
                    Generated: {selectedReport.generatedAt}
                  </div>
                  {selectedReport.summary && (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-4">
                      {Object.entries(selectedReport.summary as Record<string, number>).map(([key, value]) => (
                        <div key={key} className="rounded-lg bg-muted/20 p-3">
                          <p className="text-xs text-muted-foreground">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                          <p className="text-lg font-semibold">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedReport.data && (
                    <div className="rounded-lg bg-muted/10 p-4">
                      <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedReport.data, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteReport(selectedReport.id)}>
                      <Trash2 className="mr-2 size-4" />
                      {t("common.delete", "Delete")}
                    </Button>
                  </div>
                </div>
              </div>
            ) : reportsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : reports.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("security.noReports", "No security reports")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("security.title", "Title")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Type</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Period</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.date", "Generated")}</th>
                      <th className="pb-2 text-right font-medium text-muted-foreground">{t("common.actions", "Actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report: any) => (
                      <tr
                        key={report.id}
                        className="border-b border-border/50 cursor-pointer hover:bg-muted/30"
                        onClick={() => setSelectedReport(report)}
                      >
                        <td className="py-3 font-medium">{report.title}</td>
                        <td className="py-3"><Badge tone="info">{report.reportType}</Badge></td>
                        <td className="py-3 text-muted-foreground text-xs">{report.period || "-"}</td>
                        <td className="py-3 text-muted-foreground text-xs">{report.generatedAt}</td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteReport(report.id); }}>
                            <Trash2 className="size-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>

          {showCreateReport && (
            <DashboardCard title={t("security.generateReport", "Generate Report")}>
              <div className="grid gap-4">
                <div>
                  <Label>{t("security.title", "Title")}</Label>
                  <Input
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    placeholder="e.g. Monthly Security Report"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Report Type</Label>
                    <select
                      value={newReport.reportType}
                      onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="security_overview">Security Overview</option>
                      <option value="threat_analysis">Threat Analysis</option>
                      <option value="compliance_audit">Compliance Audit</option>
                      <option value="incident_summary">Incident Summary</option>
                    </select>
                  </div>
                  <div>
                    <Label>Period</Label>
                    <select
                      value={newReport.period}
                      onChange={(e) => setNewReport({ ...newReport, period: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Current</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowCreateReport(false)}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleCreateReport}>
                  {t("common.create", "Generate")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {tab === "settings" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("security.securitySettings", "Security Settings")}</h3>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveSettings} disabled={!settingsForm}>
                  <Settings className="mr-2 size-4" />
                  {t("common.save", "Save Settings")}
                </Button>
                <Button variant="outline" size="sm" onClick={() => mutateSettings()}>
                  <RefreshCw className="mr-2 size-4" />
                  {t("common.refresh", "Refresh")}
                </Button>
              </div>
            </div>

            {settingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : !settingsForm ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("common.noData", "No settings available")}</p>
            ) : (
              <div className="space-y-6">
                <div className="rounded-xl border border-border p-4">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Lock className="size-4" />
                    {t("security.bruteForceProtection", "Brute Force Protection")}
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between">
                      <Label>{t("security.enabled", "Enabled")}</Label>
                      <button
                        onClick={() => setSettingsForm({ ...settingsForm, bruteForceProtection: !settingsForm.bruteForceProtection })}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          settingsForm.bruteForceProtection ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          settingsForm.bruteForceProtection ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                    <div>
                      <Label>{t("security.maxLoginAttempts", "Max Login Attempts")}</Label>
                      <Input
                        type="number"
                        value={settingsForm.maxLoginAttempts || 5}
                        onChange={(e) => setSettingsForm({ ...settingsForm, maxLoginAttempts: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t("security.lockoutDuration", "Lockout Duration (minutes)")}</Label>
                      <Input
                        type="number"
                        value={settingsForm.lockoutDurationMinutes || 15}
                        onChange={(e) => setSettingsForm({ ...settingsForm, lockoutDurationMinutes: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Clock className="size-4" />
                    {t("security.sessionManagement", "Session Management")}
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>{t("security.sessionTimeout", "Session Timeout (minutes)")}</Label>
                      <Input
                        type="number"
                        value={settingsForm.sessionTimeoutMinutes || 60}
                        onChange={(e) => setSettingsForm({ ...settingsForm, sessionTimeoutMinutes: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t("security.maxConcurrentSessions", "Max Concurrent Sessions")}</Label>
                      <Input
                        type="number"
                        value={settingsForm.maxConcurrentSessions || 5}
                        onChange={(e) => setSettingsForm({ ...settingsForm, maxConcurrentSessions: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Zap className="size-4" />
                    {t("security.rateLimiting", "Rate Limiting")}
                  </h4>
                  <div className="flex items-center justify-between">
                    <Label>{t("security.enabled", "Enabled")}</Label>
                    <button
                      onClick={() => setSettingsForm({ ...settingsForm, rateLimitEnabled: !settingsForm.rateLimitEnabled })}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        settingsForm.rateLimitEnabled ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <span className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        settingsForm.rateLimitEnabled ? "translate-x-6" : "translate-x-1"
                      )} />
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Shield className="size-4" />
                    {t("security.securityHeaders", "Security Headers")}
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center justify-between">
                      <Label>{t("security.csp", "Content Security Policy (CSP)")}</Label>
                      <button
                        onClick={() => setSettingsForm({ ...settingsForm, cspEnabled: !settingsForm.cspEnabled })}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          settingsForm.cspEnabled ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          settingsForm.cspEnabled ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>{t("security.hsts", "HTTP Strict Transport Security (HSTS)")}</Label>
                      <button
                        onClick={() => setSettingsForm({ ...settingsForm, hstsEnabled: !settingsForm.hstsEnabled })}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          settingsForm.hstsEnabled ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          settingsForm.hstsEnabled ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Upload className="size-4" />
                    {t("security.uploadSecurity", "Upload Security")}
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>{t("security.maxUploadSize", "Max Upload Size (MB)")}</Label>
                      <Input
                        type="number"
                        value={settingsForm.uploadMaxSizeMb || 10}
                        onChange={(e) => setSettingsForm({ ...settingsForm, uploadMaxSizeMb: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t("security.allowedTypes", "Allowed MIME Types")}</Label>
                      <Input
                        value={(settingsForm.uploadAllowedTypes || []).join(", ")}
                        onChange={(e) => setSettingsForm({ ...settingsForm, uploadAllowedTypes: e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean) })}
                        placeholder="image/png, image/jpeg, ..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <Globe className="size-4" />
                    {t("security.ipControl", "IP Access Control")}
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>{t("security.ipWhitelist", "IP Whitelist")}</Label>
                      <textarea
                        value={(settingsForm.ipWhitelist || []).join("\n")}
                        onChange={(e) => setSettingsForm({ ...settingsForm, ipWhitelist: e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean) })}
                        placeholder={"192.168.1.1\n10.0.0.0/8"}
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                      />
                    </div>
                    <div>
                      <Label>{t("security.ipBlacklist", "IP Blacklist")}</Label>
                      <textarea
                        value={(settingsForm.ipBlacklist || []).join("\n")}
                        onChange={(e) => setSettingsForm({ ...settingsForm, ipBlacklist: e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean) })}
                        placeholder={"1.2.3.4\n5.6.7.0/24"}
                        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DashboardCard>
        </div>
      )}

      {tab === "audit" && (
        <div className="space-y-6">
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t("security.auditLogs", "Audit Logs")}</h3>
              <Button variant="outline" size="sm" onClick={() => mutateAudit()}>
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

            {auditLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAuditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">{t("security.noAuditLogs", "No audit entries")}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.action", "Action")}</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">Entity</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">User</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">IP</th>
                      <th className="pb-2 text-left font-medium text-muted-foreground">{t("common.date", "Timestamp")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLogs.map((log: any) => (
                      <tr key={log.id} className="border-b border-border/50">
                        <td className="py-3 font-medium">{log.action}</td>
                        <td className="py-3 text-muted-foreground">
                          <code className="text-xs bg-muted/50 px-2 py-0.5 rounded">{log.entityType}</code>
                        </td>
                        <td className="py-3 text-muted-foreground text-xs font-mono">{log.userId || "-"}</td>
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
    </div>
  );
}
