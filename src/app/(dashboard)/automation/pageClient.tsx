"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import {
  Zap,
  Play,
  Clock,
  CreditCard,
  CheckCircle,
  FileText,
  Plus,
  Search,
  RefreshCw,
  Loader,
  Trash2,
  Eye,
  X,
  Check,
  ChevronRight,
  Pause,
  RotateCcw,
  ListOrdered,
  BarChart3,
  Settings,
  ToggleLeft,
  ToggleRight,
  Send,
  AlertCircle,
  Workflow,
  Calendar,
  Target,
  Activity,
  Layers,
  ArrowUp,
  ArrowDown,
  GitBranch,
  Timer,
  Bell,
  History,
  FileBarChart,
  Filter,
  Copy,
  Bookmark,
  CalendarClock,
  AlertTriangle,
  Cog,
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

type TabKey =
  | "dashboard"
  | "automations"
  | "templates"
  | "triggers"
  | "schedules"
  | "queue"
  | "executions"
  | "history"
  | "reports";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "dashboard", icon: BarChart3 },
  { key: "automations", icon: Zap },
  { key: "templates", icon: FileText },
  { key: "triggers", icon: Bell },
  { key: "schedules", icon: Calendar },
  { key: "queue", icon: ListOrdered },
  { key: "executions", icon: Play },
  { key: "history", icon: History },
  { key: "reports", icon: FileBarChart },
];

const TRIGGER_TYPES = ["schedule", "event", "webhook", "manual", "condition", "cron"];
const SCHEDULE_TYPES = ["cron", "interval", "daily", "weekly", "monthly"];
const EXECUTION_STATUSES = ["all", "running", "completed", "failed", "pending"];
const EVENT_TYPES = ["all", "execution", "schedule", "trigger", "system", "error"];
const TEMPLATE_CATEGORIES = ["all", "content", "image", "video", "audio", "text", "automation", "custom"];

export function AutomationPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("dashboard");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");

  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<any>({});
  const [formLoading, setFormLoading] = React.useState(false);

  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [showDetail, setShowDetail] = React.useState(false);

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR(
    "/api/automation/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: rulesData, isLoading: rulesLoading, mutate: mutateRules } = useSWR(
    `/api/automation${search && activeTab === "automations" ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: templatesData, isLoading: templatesLoading, mutate: mutateTemplates } = useSWR(
    `/api/automation/templates${typeFilter !== "all" && activeTab === "templates" ? `?category=${typeFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: schedulesData, isLoading: schedulesLoading, mutate: mutateSchedules } = useSWR(
    `/api/automation/schedules${search && activeTab === "schedules" ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: queueData, isLoading: queueLoading, mutate: mutateQueue } = useSWR(
    "/api/automation/queue",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: queueStatusData, mutate: mutateQueueStatus } = useSWR(
    "/api/automation/queue/status",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: executionsData, isLoading: executionsLoading, mutate: mutateExecutions } = useSWR(
    `/api/automation/executions${statusFilter !== "all" && activeTab === "executions" ? `?status=${statusFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: eventsData, isLoading: eventsLoading, mutate: mutateEvents } = useSWR(
    `/api/automation/events${typeFilter !== "all" && activeTab === "history" ? `?type=${typeFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: reportsData, isLoading: reportsLoading, mutate: mutateReports } = useSWR(
    "/api/automation/reports",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const stats = statsData?.success ? statsData.data : null;
  const rules = rulesData?.success ? (Array.isArray(rulesData.data) ? rulesData.data : rulesData.data?.rules ?? []) : [];
  const templates = templatesData?.success ? (Array.isArray(templatesData.data) ? templatesData.data : templatesData.data?.templates ?? []) : [];
  const schedules = schedulesData?.success ? (Array.isArray(schedulesData.data) ? schedulesData.data : schedulesData.data?.schedules ?? []) : [];
  const queueItems = queueData?.success ? (Array.isArray(queueData.data) ? queueData.data : queueData.data?.items ?? []) : [];
  const queueStatus = queueStatusData?.success ? queueStatusData.data : null;
  const executions = executionsData?.success ? (Array.isArray(executionsData.data) ? executionsData.data : executionsData.data?.executions ?? []) : [];
  const events = eventsData?.success ? (Array.isArray(eventsData.data) ? eventsData.data : eventsData.data?.events ?? []) : [];
  const reports = reportsData?.success ? (Array.isArray(reportsData.data) ? reportsData.data : reportsData.data?.reports ?? []) : [];

  const isLoading = activeTab === "dashboard"
    ? statsLoading || executionsLoading || rulesLoading
    : activeTab === "automations"
      ? rulesLoading
      : activeTab === "templates"
        ? templatesLoading
        : activeTab === "schedules"
          ? schedulesLoading
          : activeTab === "queue"
            ? queueLoading
            : activeTab === "executions"
              ? executionsLoading
              : activeTab === "history"
                ? eventsLoading
                : activeTab === "reports"
                  ? reportsLoading
                  : false;

  const filteredRules = React.useMemo(
    () =>
      rules.filter(
        (r: any) =>
          r.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase())
      ),
    [rules, search]
  );

  const filteredSchedules = React.useMemo(
    () =>
      schedules.filter(
        (s: any) =>
          s.name?.toLowerCase().includes(search.toLowerCase()) ||
          s.description?.toLowerCase().includes(search.toLowerCase())
      ),
    [schedules, search]
  );

  const resetForm = () => {
    setForm({});
    setEditId(null);
    setShowForm(false);
  };

  const openCreate = (defaults: any = {}) => {
    setForm(defaults);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (item: any, fields: string[]) => {
    const data: any = {};
    fields.forEach((f) => (data[f] = item[f] ?? ""));
    setForm(data);
    setEditId(item.id);
    setShowForm(true);
  };

  const openDetail = (item: any) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const handleSave = async (url: string, mutate: () => Promise<any>, fields: string[]) => {
    setFormLoading(true);
    try {
      const payload: any = {};
      fields.forEach((f) => {
        if (form[f] !== undefined && form[f] !== null) payload[f] = form[f];
      });
      const method = editId ? "PUT" : "POST";
      const target = editId ? `${url}/${editId}` : url;
      const res = await fetch(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(t("common.success", "Saved"));
        resetForm();
        mutate();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (url: string, id: string, mutate: () => Promise<any>) => {
    try {
      const res = await fetch(`${url}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Deleted"));
        mutate();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handlePost = async (url: string, mutate: () => Promise<any>, payload?: any) => {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload ? JSON.stringify(payload) : undefined,
      });
      if (res.ok) {
        toast.success(t("common.success", "Success"));
        mutate();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleToggleRule = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/${id}/toggle`, { method: "POST" });
      if (res.ok) {
        toast.success(t("automation.ruleToggled", "Rule toggled"));
        mutateRules();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleExecuteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/${id}/execute`, { method: "POST" });
      if (res.ok) {
        toast.success(t("automation.ruleExecuted", "Rule execution started"));
        mutateExecutions();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleUseTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/templates/${id}/use`, { method: "POST" });
      if (res.ok) {
        toast.success(t("automation.templateUsed", "Template applied"));
        mutateRules();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleToggleSchedule = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/schedules/${id}/toggle`, { method: "POST" });
      if (res.ok) {
        toast.success(t("automation.scheduleToggled", "Schedule toggled"));
        mutateSchedules();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleRetryQueueItem = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/queue/${id}/retry`, { method: "POST" });
      if (res.ok) {
        toast.success(t("automation.queueItemRetried", "Item retried"));
        mutateQueue();
        mutateQueueStatus();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleClearQueue = async () => {
    try {
      const res = await fetch("/api/automation/queue", { method: "DELETE" });
      if (res.ok) {
        toast.success(t("automation.queueCleared", "Queue cleared"));
        mutateQueue();
        mutateQueueStatus();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleRemoveQueueItem = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/queue/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("automation.queueItemRemoved", "Item removed"));
        mutateQueue();
        mutateQueueStatus();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleCancelExecution = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/executions/${id}/cancel`, { method: "POST" });
      if (res.ok) {
        toast.success(t("automation.executionCancelled", "Execution cancelled"));
        mutateExecutions();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await fetch("/api/automation/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "overview", period: "7d" }),
      });
      if (res.ok) {
        toast.success(t("automation.reportGenerated", "Report generated"));
        mutateReports();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "done":
      case "active":
        return <Badge tone="success">{status}</Badge>;
      case "running":
      case "processing":
        return <Badge tone="info">{status}</Badge>;
      case "failed":
      case "error":
        return <Badge tone="warning">{status}</Badge>;
      case "pending":
      case "queued":
      case "waiting":
        return <Badge tone="warning">{status}</Badge>;
      case "cancelled":
      case "inactive":
      case "disabled":
        return <Badge tone="default">{status}</Badge>;
      default:
        return <Badge tone="default">{status}</Badge>;
    }
  };

  const renderForm = (fields: { key: string; label: string; type?: string; options?: string[]; multiline?: boolean }[], onSave: () => void) => (
    <DashboardCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{editId ? t("common.edit", "Edit") : t("common.create", "Create")}</h3>
          <Button variant="ghost" size="sm" onClick={resetForm}><X className="size-4" /></Button>
        </div>
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="text-xs text-muted-foreground">{field.label}</label>
            {field.type === "select" && field.options ? (
              <select
                value={form[field.key] ?? ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">{t("common.select", "Select...")}</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.multiline ? (
              <textarea
                value={form[field.key] ?? ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            ) : (
              <Input
                value={form[field.key] ?? ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.label}
              />
            )}
          </div>
        ))}
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={resetForm}>{t("common.cancel", "Cancel")}</Button>
          <Button size="sm" disabled={formLoading} onClick={onSave}>
            {formLoading ? <Loader className="size-4 animate-spin" /> : <Check className="size-4" />}
            {editId ? t("common.update", "Update") : t("common.save", "Save")}
          </Button>
        </div>
      </div>
    </DashboardCard>
  );

  const renderSearchBar = () => (
    <div className="relative flex-1 min-w-[250px]">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", "Search...")} className="pl-9" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("automation.title", "Intelligent Automation Center")}
        description={t("automation.description", "Manage automation rules, triggers, schedules, and monitor execution")}
      />

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key);
              setSearch("");
              setStatusFilter("all");
              setTypeFilter("all");
              resetForm();
              setShowDetail(false);
              setSelectedItem(null);
            }}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {t(`automation.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
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
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Zap className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("automation.totalRules", "Total Rules")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalRules ?? rules.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                      <CheckCircle className="size-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("automation.activeRules", "Active Rules")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.activeRules ?? rules.filter((r: any) => r.enabled).length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Play className="size-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("automation.executions", "Executions")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalExecutions ?? executions.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Activity className="size-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("automation.successRate", "Success Rate")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.successRate ?? 0}%</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <ListOrdered className="size-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("automation.queueSize", "Queue Size")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.queueSize ?? queueItems.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Bell className="size-5 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("automation.events", "Events")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalEvents ?? events.length}</p>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard title={t("automation.recentExecutions", "Recent Executions")}>
                  {executions.length > 0 ? (
                    <div className="space-y-3">
                      {executions.slice(0, 5).map((exec: any) => (
                        <div
                          key={exec.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => openDetail(exec)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{exec.name || exec.ruleName || exec.id}</span>
                              {getStatusBadge(exec.status)}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              {exec.ruleName && <span className="text-xs text-muted-foreground">{exec.ruleName}</span>}
                              {exec.credits != null && <span className="text-xs text-muted-foreground">{exec.credits} credits</span>}
                              {exec.createdAt && <span className="text-xs text-muted-foreground">{new Date(exec.createdAt).toLocaleString()}</span>}
                            </div>
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground ml-2 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("automation.noExecutions", "No executions yet")}
                    </div>
                  )}
                </DashboardCard>

                <DashboardCard title={t("automation.activeRules", "Active Rules")}>
                  {rules.filter((r: any) => r.enabled).length > 0 ? (
                    <div className="space-y-3">
                      {rules.filter((r: any) => r.enabled).slice(0, 5).map((rule: any) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => openDetail(rule)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Zap className="size-4 text-amber-500" />
                              <span className="font-medium text-sm truncate">{rule.name}</span>
                              <Badge tone="info">{rule.triggerType}</Badge>
                            </div>
                            {rule.description && <p className="text-xs text-muted-foreground mt-1 truncate">{rule.description}</p>}
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground ml-2 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("automation.noActiveRules", "No active rules")}
                    </div>
                  )}
                </DashboardCard>
              </div>

              <DashboardCard title={t("common.quickActions", "Quick Actions")}>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("automations")}>
                    <Plus className="mr-2 size-4" />
                    {t("automation.newRule", "New Rule")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("queue")}>
                    <ListOrdered className="mr-2 size-4" />
                    {t("automation.viewQueue", "View Queue")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("templates")}>
                    <FileText className="mr-2 size-4" />
                    {t("automation.templates", "Templates")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => mutateStats()}>
                    <RefreshCw className="mr-2 size-4" />
                    {t("common.refresh", "Refresh")}
                  </Button>
                </div>
              </DashboardCard>
            </div>
          )}

          {activeTab === "automations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ name: "", triggerType: "manual", conditions: "", actions: "", description: "" })}>
                  <Plus className="mr-2 size-4" />
                  {t("automation.createRule", "Create Rule")}
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "name", label: t("automation.ruleName", "Rule Name") },
                  { key: "triggerType", label: t("automation.triggerType", "Trigger Type"), type: "select", options: TRIGGER_TYPES },
                  { key: "conditions", label: t("automation.conditions", "Conditions"), multiline: true },
                  { key: "actions", label: t("automation.actions", "Actions"), multiline: true },
                  { key: "description", label: t("automation.description", "Description"), multiline: true },
                ],
                () => handleSave("/api/automation", mutateRules, ["name", "triggerType", "conditions", "actions", "description"])
              )}
              {filteredRules.length > 0 ? (
                <div className="space-y-3">
                  {filteredRules.map((rule: any) => (
                    <DashboardCard key={rule.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Zap className="size-4 text-amber-500" />
                            <span className="font-semibold text-sm">{rule.name}</span>
                            <Badge tone="info">{rule.triggerType}</Badge>
                            <button onClick={() => handleToggleRule(rule.id)}>
                              {rule.enabled ? (
                                <ToggleRight className="size-5 text-green-500" />
                              ) : (
                                <ToggleLeft className="size-5 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                          {rule.description && <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>}
                          {rule.conditions && <p className="text-xs text-muted-foreground mt-1">{t("automation.conditions", "Conditions")}: {rule.conditions}</p>}
                          {rule.actions && <p className="text-xs text-muted-foreground mt-1">{t("automation.actions", "Actions")}: {rule.actions}</p>}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => handleExecuteRule(rule.id)} title={t("automation.execute", "Execute")}>
                            <Play className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDetail(rule)}>
                            <Eye className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(rule, ["name", "triggerType", "conditions", "actions", "description"])}>
                            <RotateCcw className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("/api/automation", rule.id, mutateRules)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("automation.noRules", "No automation rules found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setTypeFilter(cat)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                          typeFilter === cat
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <Button size="sm" onClick={() => openCreate({ name: "", category: "content", description: "", config: "" })}>
                  <Plus className="mr-2 size-4" />
                  {t("automation.createTemplate", "Create Template")}
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "name", label: t("automation.templateName", "Template Name") },
                  { key: "category", label: t("automation.category", "Category"), type: "select", options: TEMPLATE_CATEGORIES.filter((c) => c !== "all") },
                  { key: "description", label: t("automation.description", "Description"), multiline: true },
                ],
                () => handleSave("/api/automation/templates", mutateTemplates, ["name", "category", "description"])
              )}
              {templates.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {templates.map((template: any) => (
                    <DashboardCard key={template.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-cyan-500" />
                            <span className="font-semibold text-sm">{template.name}</span>
                            <Badge tone="info">{template.category || template.type}</Badge>
                          </div>
                          {template.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => handleUseTemplate(template.id)} title={t("automation.useTemplate", "Use Template")}>
                            <Copy className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDetail(template)}>
                            <Eye className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(template, ["name", "category", "description"])}>
                            <RotateCcw className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("/api/automation/templates", template.id, mutateTemplates)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("automation.noTemplates", "No templates found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "triggers" && (
            <div className="space-y-4">
              <DashboardCard title={t("automation.availableTriggers", "Available Trigger Types")}>
                <div className="space-y-3">
                  {TRIGGER_TYPES.map((triggerType) => (
                    <div key={triggerType} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex size-10 items-center justify-center rounded-lg ${
                          triggerType === "schedule" ? "bg-blue-500/10" :
                          triggerType === "event" ? "bg-green-500/10" :
                          triggerType === "webhook" ? "bg-purple-500/10" :
                          triggerType === "cron" ? "bg-amber-500/10" :
                          triggerType === "condition" ? "bg-cyan-500/10" :
                          "bg-muted/40"
                        }`}>
                          {triggerType === "schedule" ? <Calendar className="size-5 text-blue-500" /> :
                           triggerType === "event" ? <Bell className="size-5 text-green-500" /> :
                           triggerType === "webhook" ? <Send className="size-5 text-purple-500" /> :
                           triggerType === "cron" ? <Timer className="size-5 text-amber-500" /> :
                           triggerType === "condition" ? <Target className="size-5 text-cyan-500" /> :
                           <Zap className="size-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <span className="font-semibold text-sm capitalize">{triggerType}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {triggerType === "schedule" && t("automation.triggerScheduleDesc", "Triggers based on time schedules")}
                            {triggerType === "event" && t("automation.triggerEventDesc", "Triggers on system or external events")}
                            {triggerType === "webhook" && t("automation.triggerWebhookDesc", "Triggers via HTTP webhook calls")}
                            {triggerType === "manual" && t("automation.triggerManualDesc", "Manually triggered by user action")}
                            {triggerType === "condition" && t("automation.triggerConditionDesc", "Triggers when conditions are met")}
                            {triggerType === "cron" && t("automation.triggerCronDesc", "Triggers based on cron expressions")}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openCreate({ name: "", triggerType, conditions: "", actions: "", description: "" })}>
                        <Plus className="mr-1 size-3" />
                        {t("automation.createRule", "Create Rule")}
                      </Button>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </div>
          )}

          {activeTab === "schedules" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ name: "", type: "cron", cron: "", interval: "", timezone: "UTC", description: "" })}>
                  <Plus className="mr-2 size-4" />
                  {t("automation.createSchedule", "Create Schedule")}
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "name", label: t("automation.scheduleName", "Schedule Name") },
                  { key: "type", label: t("automation.scheduleType", "Schedule Type"), type: "select", options: SCHEDULE_TYPES },
                  { key: "cron", label: t("automation.cronExpression", "Cron Expression") },
                  { key: "interval", label: t("automation.interval", "Interval (seconds)") },
                  { key: "timezone", label: t("automation.timezone", "Timezone") },
                  { key: "description", label: t("automation.description", "Description"), multiline: true },
                ],
                () => handleSave("/api/automation/schedules", mutateSchedules, ["name", "type", "cron", "interval", "timezone", "description"])
              )}
              {filteredSchedules.length > 0 ? (
                <div className="space-y-3">
                  {filteredSchedules.map((schedule: any) => (
                    <DashboardCard key={schedule.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CalendarClock className="size-4 text-blue-500" />
                            <span className="font-semibold text-sm">{schedule.name}</span>
                            <Badge tone="info">{schedule.type}</Badge>
                            <button onClick={() => handleToggleSchedule(schedule.id)}>
                              {schedule.active !== false ? (
                                <ToggleRight className="size-5 text-green-500" />
                              ) : (
                                <ToggleLeft className="size-5 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                          {schedule.description && <p className="text-xs text-muted-foreground mt-1">{schedule.description}</p>}
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            {schedule.cron && <span>{t("automation.cron", "Cron")}: {schedule.cron}</span>}
                            {schedule.interval && <span>{t("automation.interval", "Interval")}: {schedule.interval}s</span>}
                            {schedule.timezone && <span>{t("automation.timezone", "TZ")}: {schedule.timezone}</span>}
                            {schedule.nextRun && <span>{t("automation.nextRun", "Next Run")}: {new Date(schedule.nextRun).toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(schedule)}>
                            <Eye className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(schedule, ["name", "type", "cron", "interval", "timezone", "description"])}>
                            <RotateCcw className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("/api/automation/schedules", schedule.id, mutateSchedules)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("automation.noSchedules", "No schedules found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "queue" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="grid gap-4 sm:grid-cols-4">
                  <DashboardCard>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{t("automation.waiting", "Waiting")}</p>
                      <p className="mt-1 text-2xl font-semibold text-amber-500">{queueStatus?.waiting ?? queueItems.filter((q: any) => q.status === "waiting" || q.status === "pending").length}</p>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{t("automation.running", "Running")}</p>
                      <p className="mt-1 text-2xl font-semibold text-blue-500">{queueStatus?.running ?? queueItems.filter((q: any) => q.status === "running" || q.status === "processing").length}</p>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{t("automation.completed", "Completed")}</p>
                      <p className="mt-1 text-2xl font-semibold text-green-500">{queueStatus?.completed ?? queueItems.filter((q: any) => q.status === "completed").length}</p>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{t("automation.failed", "Failed")}</p>
                      <p className="mt-1 text-2xl font-semibold text-red-500">{queueStatus?.failed ?? queueItems.filter((q: any) => q.status === "failed").length}</p>
                    </div>
                  </DashboardCard>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearQueue}>
                  <Trash2 className="mr-2 size-4" />
                  {t("automation.clearQueue", "Clear Queue")}
                </Button>
              </div>
              {queueItems.length > 0 ? (
                <div className="space-y-3">
                  {queueItems.map((item: any, index: number) => (
                    <DashboardCard key={item.id || index}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-semibold">{item.position ?? index + 1}</span>
                            <span className="font-semibold text-sm">{item.name || item.ruleName || item.id}</span>
                            {getStatusBadge(item.status)}
                            {item.priority && (
                              <Badge tone={item.priority === "high" ? "warning" : item.priority === "medium" ? "info" : "default"}>
                                {item.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            {item.ruleName && <span>{t("automation.rule", "Rule")}: {item.ruleName}</span>}
                            {item.type && <span>{t("automation.type", "Type")}: {item.type}</span>}
                            {item.estimatedCredits != null && <span>{t("automation.estCredits", "Est.")} {item.estimatedCredits} credits</span>}
                            {item.createdAt && <span>{new Date(item.createdAt).toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {item.status === "failed" && (
                            <Button variant="ghost" size="sm" onClick={() => handleRetryQueueItem(item.id)} title={t("automation.retry", "Retry")}>
                              <RotateCcw className="size-3" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveQueueItem(item.id)} title={t("automation.remove", "Remove")}>
                            <X className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("automation.queueEmpty", "Queue is empty")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "executions" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                  {EXECUTION_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        statusFilter === status
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {executions.length > 0 ? (
                <div className="space-y-3">
                  {executions.map((exec: any) => (
                    <DashboardCard key={exec.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Play className="size-4 text-green-500" />
                            <span className="font-semibold text-sm">{exec.name || exec.ruleName || exec.id}</span>
                            {getStatusBadge(exec.status)}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            {exec.ruleName && <span>{t("automation.rule", "Rule")}: {exec.ruleName}</span>}
                            {exec.credits != null && <span>{exec.credits} credits</span>}
                            {exec.progress != null && <span>{exec.progress}%</span>}
                            {exec.actions != null && <span>{exec.actions} {t("automation.actionsExecuted", "actions")}</span>}
                            {exec.createdAt && <span>{new Date(exec.createdAt).toLocaleString()}</span>}
                          </div>
                          {exec.progress != null && (
                            <div className="mt-2 h-1.5 w-full rounded-full bg-muted/40">
                              <div
                                className="h-1.5 rounded-full bg-primary transition-all"
                                style={{ width: `${Math.min(exec.progress, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(exec)}>
                            <Eye className="size-3" />
                          </Button>
                          {exec.status === "running" && (
                            <Button variant="ghost" size="sm" onClick={() => handleCancelExecution(exec.id)}>
                              <Pause className="size-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("automation.noExecutions", "No executions found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                  {EVENT_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        typeFilter === type
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((event: any) => (
                    <DashboardCard key={event.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {event.type === "execution" ? <Play className="size-4 text-blue-500" /> :
                             event.type === "schedule" ? <Calendar className="size-4 text-green-500" /> :
                             event.type === "trigger" ? <Bell className="size-4 text-purple-500" /> :
                             event.type === "error" ? <AlertCircle className="size-4 text-red-500" /> :
                             <Activity className="size-4 text-muted-foreground" />}
                            <span className="font-semibold text-sm">{event.name || event.message || event.id}</span>
                            <Badge tone={event.type === "error" ? "warning" : "info"}>{event.type}</Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            {event.ruleName && <span>{t("automation.rule", "Rule")}: {event.ruleName}</span>}
                            {event.source && <span>{t("automation.source", "Source")}: {event.source}</span>}
                            {event.createdAt && <span>{new Date(event.createdAt).toLocaleString()}</span>}
                          </div>
                          {event.details && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.details}</p>}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(event)}>
                            <Eye className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("automation.noEvents", "No events found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <DashboardCard>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                          <BarChart3 className="size-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("automation.totalReports", "Total Reports")}</p>
                          <p className="mt-1 text-2xl font-semibold">{reports.length}</p>
                        </div>
                      </div>
                    </DashboardCard>
                    <DashboardCard>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                          <CheckCircle className="size-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("automation.successRate", "Success Rate")}</p>
                          <p className="mt-1 text-2xl font-semibold">{stats?.successRate ?? 0}%</p>
                        </div>
                      </div>
                    </DashboardCard>
                    <DashboardCard>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                          <CreditCard className="size-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t("automation.creditsUsed", "Credits Used")}</p>
                          <p className="mt-1 text-2xl font-semibold">{stats?.creditsUsed ?? 0}</p>
                        </div>
                      </div>
                    </DashboardCard>
                  </div>
                </div>
                <Button size="sm" onClick={handleGenerateReport}>
                  <FileBarChart className="mr-2 size-4" />
                  {t("automation.generateReport", "Generate Report")}
                </Button>
              </div>
              {reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((report: any) => (
                    <DashboardCard key={report.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileBarChart className="size-4 text-blue-500" />
                            <span className="font-semibold text-sm">{report.name || report.type || report.id}</span>
                            {getStatusBadge(report.status || "completed")}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            {report.type && <span>{t("automation.type", "Type")}: {report.type}</span>}
                            {report.period && <span>{t("automation.period", "Period")}: {report.period}</span>}
                            {report.successRate != null && <span>{t("automation.successRate", "Success Rate")}: {report.successRate}%</span>}
                            {report.creditsUsed != null && <span>{report.creditsUsed} credits</span>}
                            {report.createdAt && <span>{new Date(report.createdAt).toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(report)}>
                            <Eye className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("/api/automation/reports", report.id, mutateReports)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("automation.noReports", "No reports generated yet")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}
        </>
      )}

      {showDetail && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-background p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t("automation.details", "Details")}</h3>
              <Button variant="ghost" size="sm" onClick={() => { setShowDetail(false); setSelectedItem(null); }}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {Object.entries(selectedItem).filter(([key]) => key !== "id").map(([key, value]) => (
                <div key={key} className="flex items-start gap-3">
                  <span className="text-xs text-muted-foreground w-32 shrink-0 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                  <div className="flex-1 min-w-0">
                    {typeof value === "boolean" ? (
                      <Badge tone={value ? "success" : "default"}>{value ? "Yes" : "No"}</Badge>
                    ) : typeof value === "object" && value !== null ? (
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>
                    ) : (
                      <span className="text-sm break-words">{String(value ?? "-")}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
