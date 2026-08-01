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
  GitBranch,
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
  Zap,
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
  | "pipelines"
  | "executions"
  | "tasks"
  | "queue"
  | "templates"
  | "automation"
  | "analytics";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "dashboard", icon: BarChart3 },
  { key: "pipelines", icon: GitBranch },
  { key: "executions", icon: Play },
  { key: "tasks", icon: CheckCircle },
  { key: "queue", icon: ListOrdered },
  { key: "templates", icon: FileText },
  { key: "automation", icon: Zap },
  { key: "analytics", icon: Activity },
];

const PIPELINE_TYPES = ["content", "image", "video", "audio", "text", "custom"];
const EXECUTION_STATUSES = ["all", "running", "completed", "failed", "pending"];
const TASK_STATUSES = ["all", "pending", "running", "completed", "failed", "cancelled"];
const TEMPLATE_TYPES = ["content", "image", "video", "audio", "text", "custom"];
const TRIGGER_TYPES = ["schedule", "event", "webhook", "manual", "condition"];

export function OrchestratorPageClient() {
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
    "/api/orchestrator/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: pipelinesData, isLoading: pipelinesLoading, mutate: mutatePipelines } = useSWR(
    `/api/orchestrator${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: executionsData, isLoading: executionsLoading, mutate: mutateExecutions } = useSWR(
    `/api/orchestrator/executions${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: tasksData, isLoading: tasksLoading, mutate: mutateTasks } = useSWR(
    `/api/orchestrator/tasks${statusFilter !== "all" && activeTab === "tasks" ? `?status=${statusFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: queueData, isLoading: queueLoading, mutate: mutateQueue } = useSWR(
    "/api/orchestrator/queue",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: templatesData, isLoading: templatesLoading, mutate: mutateTemplates } = useSWR(
    `/api/orchestrator/templates${typeFilter !== "all" && activeTab === "templates" ? `?type=${typeFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: rulesData, isLoading: rulesLoading, mutate: mutateRules } = useSWR(
    `/api/orchestrator/rules${search && activeTab === "automation" ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: analyticsData, isLoading: analyticsLoading } = useSWR(
    "/api/orchestrator/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const stats = statsData?.success ? statsData.data : null;
  const pipelines = pipelinesData?.success ? (Array.isArray(pipelinesData.data) ? pipelinesData.data : pipelinesData.data?.pipelines ?? []) : [];
  const executions = executionsData?.success ? (Array.isArray(executionsData.data) ? executionsData.data : executionsData.data?.executions ?? []) : [];
  const tasks = tasksData?.success ? (Array.isArray(tasksData.data) ? tasksData.data : tasksData.data?.tasks ?? []) : [];
  const queueItems = queueData?.success ? (Array.isArray(queueData.data) ? queueData.data : queueData.data?.items ?? []) : [];
  const templates = templatesData?.success ? (Array.isArray(templatesData.data) ? templatesData.data : templatesData.data?.templates ?? []) : [];
  const rules = rulesData?.success ? (Array.isArray(rulesData.data) ? rulesData.data : rulesData.data?.rules ?? []) : [];
  const analytics = analyticsData?.success ? analyticsData.data : null;

  const isLoading = activeTab === "dashboard"
    ? statsLoading || executionsLoading || pipelinesLoading
    : activeTab === "pipelines"
      ? pipelinesLoading
      : activeTab === "executions"
        ? executionsLoading
        : activeTab === "tasks"
          ? tasksLoading
          : activeTab === "queue"
            ? queueLoading
            : activeTab === "templates"
              ? templatesLoading
              : activeTab === "automation"
                ? rulesLoading
                : analyticsLoading;

  const filteredPipelines = React.useMemo(
    () =>
      pipelines.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase())
      ),
    [pipelines, search]
  );

  const filteredRules = React.useMemo(
    () =>
      rules.filter(
        (r: any) =>
          r.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase())
      ),
    [rules, search]
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
      const res = await fetch(`/api/orchestrator/rules/${id}/toggle`, { method: "POST" });
      if (res.ok) {
        toast.success(t("common.success", "Updated"));
        mutateRules();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleExecutePipeline = async (id: string) => {
    try {
      const res = await fetch(`/api/orchestrator/${id}/execute`, { method: "POST" });
      if (res.ok) {
        toast.success(t("orchestrator.pipelineStarted", "Pipeline started"));
        mutateExecutions();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleCancelExecution = async (id: string) => {
    try {
      const res = await fetch(`/api/orchestrator/executions/${id}/cancel`, { method: "POST" });
      if (res.ok) {
        toast.success(t("orchestrator.executionCancelled", "Execution cancelled"));
        mutateExecutions();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleRetryTask = async (id: string) => {
    try {
      const res = await fetch(`/api/orchestrator/tasks/${id}/retry`, { method: "POST" });
      if (res.ok) {
        toast.success(t("orchestrator.taskRetried", "Task retried"));
        mutateTasks();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleCancelTask = async (id: string) => {
    try {
      const res = await fetch(`/api/orchestrator/tasks/${id}/cancel`, { method: "POST" });
      if (res.ok) {
        toast.success(t("orchestrator.taskCancelled", "Task cancelled"));
        mutateTasks();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleExecuteTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/orchestrator/templates/${id}/execute`, { method: "POST" });
      if (res.ok) {
        toast.success(t("orchestrator.templateExecuted", "Template execution started"));
        mutateExecutions();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleClearQueue = async () => {
    try {
      const res = await fetch("/api/orchestrator/queue", { method: "DELETE" });
      if (res.ok) {
        toast.success(t("orchestrator.queueCleared", "Queue cleared"));
        mutateQueue();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const renderForm = (fields: { key: string; label: string; type?: string; options?: string[]; multiline?: boolean }[], onSave: () => void) => (
    <DashboardCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{editId ? "Edit" : "Create"}</h3>
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
                <option value="">Select...</option>
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
          <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
          <Button size="sm" disabled={formLoading} onClick={onSave}>
            {formLoading ? <Loader className="size-4 animate-spin" /> : <Check className="size-4" />}
            {editId ? "Update" : "Save"}
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "done":
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
        return <Badge tone="default">{status}</Badge>;
      default:
        return <Badge tone="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("orchestrator.title", "AI Orchestrator")}
        description={t("orchestrator.description", "Manage pipelines, executions, tasks, and automation rules")}
      />

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSearch(""); setStatusFilter("all"); setTypeFilter("all"); resetForm(); setShowDetail(false); setSelectedItem(null); }}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {t(`orchestrator.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
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
                      <GitBranch className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("orchestrator.totalPipelines", "Total Pipelines")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalPipelines ?? pipelines.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Play className="size-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("orchestrator.activeExecutions", "Active Executions")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.activeExecutions ?? executions.filter((e: any) => e.status === "running").length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <Clock className="size-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("orchestrator.queueSize", "Queue Size")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.queueSize ?? queueItems.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <CreditCard className="size-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("orchestrator.creditsUsed", "Credits Used")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.creditsUsed ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <CheckCircle className="size-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("orchestrator.successRate", "Success Rate")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.successRate ?? 0}%</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10">
                      <FileText className="size-5 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("orchestrator.templates", "Templates")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalTemplates ?? templates.length}</p>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard title={t("orchestrator.recentExecutions", "Recent Executions")}>
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
                              <span className="font-medium text-sm truncate">{exec.name || exec.id}</span>
                              {getStatusBadge(exec.status)}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              {exec.pipeline && <span className="text-xs text-muted-foreground">{exec.pipeline}</span>}
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
                      {t("orchestrator.noExecutions", "No executions yet")}
                    </div>
                  )}
                </DashboardCard>

                <DashboardCard title={t("orchestrator.pipelines", "Pipelines")}>
                  {pipelines.length > 0 ? (
                    <div className="space-y-3">
                      {pipelines.slice(0, 5).map((pipeline: any) => (
                        <div
                          key={pipeline.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => openDetail(pipeline)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{pipeline.name}</span>
                              <Badge tone="info">{pipeline.type}</Badge>
                            </div>
                            {pipeline.description && <p className="text-xs text-muted-foreground mt-1 truncate">{pipeline.description}</p>}
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground ml-2 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("orchestrator.noPipelines", "No pipelines created")}
                    </div>
                  )}
                </DashboardCard>
              </div>

              <DashboardCard title={t("common.actions", "Quick Actions")}>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("pipelines")}>
                    <Plus className="mr-2 size-4" />
                    {t("orchestrator.newPipeline", "New Pipeline")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("queue")}>
                    <ListOrdered className="mr-2 size-4" />
                    {t("orchestrator.viewQueue", "View Queue")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("templates")}>
                    <FileText className="mr-2 size-4" />
                    {t("orchestrator.templates", "Templates")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => mutateStats()}>
                    <RefreshCw className="mr-2 size-4" />
                    {t("common.refresh", "Refresh")}
                  </Button>
                </div>
              </DashboardCard>
            </div>
          )}

          {activeTab === "pipelines" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ name: "", type: "content", description: "", steps: "" })}>
                  <Plus className="mr-2 size-4" />
                  {t("orchestrator.createPipeline", "Create Pipeline")}
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "name", label: "Name" },
                  { key: "type", label: "Type", type: "select", options: PIPELINE_TYPES },
                  { key: "description", label: "Description", multiline: true },
                ],
                () => handleSave("/api/orchestrator", mutatePipelines, ["name", "type", "description"])
              )}
              {filteredPipelines.length > 0 ? (
                <div className="space-y-3">
                  {filteredPipelines.map((pipeline: any) => (
                    <DashboardCard key={pipeline.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <GitBranch className="size-4 text-blue-500" />
                            <span className="font-semibold text-sm">{pipeline.name}</span>
                            <Badge tone="info">{pipeline.type}</Badge>
                          </div>
                          {pipeline.description && <p className="text-xs text-muted-foreground mt-1">{pipeline.description}</p>}
                          {pipeline.steps && Array.isArray(pipeline.steps) && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {pipeline.steps.map((step: any, i: number) => (
                                <Badge key={i} tone="default">{step.name || `Step ${i + 1}`}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => handleExecutePipeline(pipeline.id)}>
                            <Play className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDetail(pipeline)}>
                            <Eye className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(pipeline, ["name", "type", "description"])}>
                            <RotateCcw className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("/api/orchestrator", pipeline.id, mutatePipelines)}>
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
                    {t("orchestrator.noPipelines", "No pipelines found")}
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
                            <span className="font-semibold text-sm">{exec.name || exec.id}</span>
                            {getStatusBadge(exec.status)}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            {exec.pipeline && <span>Pipeline: {exec.pipeline}</span>}
                            {exec.credits != null && <span>{exec.credits} credits</span>}
                            {exec.progress != null && <span>{exec.progress}%</span>}
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
                    {t("orchestrator.noExecutions", "No executions found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                  {TASK_STATUSES.map((status) => (
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
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task: any) => (
                    <DashboardCard key={task.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="size-4 text-emerald-500" />
                            <span className="font-semibold text-sm">{task.name || task.id}</span>
                            {getStatusBadge(task.status)}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            {task.pipeline && <span>Pipeline: {task.pipeline}</span>}
                            {task.type && <span>Type: {task.type}</span>}
                            {task.credits != null && <span>{task.credits} credits</span>}
                            {task.createdAt && <span>{new Date(task.createdAt).toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(task)}>
                            <Eye className="size-3" />
                          </Button>
                          {task.status === "failed" && (
                            <Button variant="ghost" size="sm" onClick={() => handleRetryTask(task.id)}>
                              <RotateCcw className="size-3" />
                            </Button>
                          )}
                          {(task.status === "pending" || task.status === "running") && (
                            <Button variant="ghost" size="sm" onClick={() => handleCancelTask(task.id)}>
                              <X className="size-3" />
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
                    {t("orchestrator.noTasks", "No tasks found")}
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
                      <p className="text-xs text-muted-foreground">{t("orchestrator.waiting", "Waiting")}</p>
                      <p className="mt-1 text-2xl font-semibold text-amber-500">{queueData?.data?.stats?.waiting ?? queueItems.filter((q: any) => q.status === "waiting" || q.status === "pending").length}</p>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{t("orchestrator.processing", "Processing")}</p>
                      <p className="mt-1 text-2xl font-semibold text-blue-500">{queueData?.data?.stats?.processing ?? queueItems.filter((q: any) => q.status === "processing" || q.status === "running").length}</p>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{t("orchestrator.completed", "Completed")}</p>
                      <p className="mt-1 text-2xl font-semibold text-green-500">{queueData?.data?.stats?.completed ?? queueItems.filter((q: any) => q.status === "completed").length}</p>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">{t("orchestrator.failed", "Failed")}</p>
                      <p className="mt-1 text-2xl font-semibold text-red-500">{queueData?.data?.stats?.failed ?? queueItems.filter((q: any) => q.status === "failed").length}</p>
                    </div>
                  </DashboardCard>
                </div>
                <Button variant="outline" size="sm" onClick={handleClearQueue}>
                  <Trash2 className="mr-2 size-4" />
                  {t("orchestrator.clearQueue", "Clear Queue")}
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
                            <span className="font-semibold text-sm">{item.name || item.id}</span>
                            {getStatusBadge(item.status)}
                            {item.priority && (
                              <Badge tone={item.priority === "high" ? "warning" : item.priority === "medium" ? "info" : "default"}>
                                {item.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            {item.pipeline && <span>Pipeline: {item.pipeline}</span>}
                            {item.type && <span>Type: {item.type}</span>}
                            {item.estimatedCredits != null && <span>Est. {item.estimatedCredits} credits</span>}
                          </div>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("orchestrator.queueEmpty", "Queue is empty")}
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
                    {["all", ...TEMPLATE_TYPES].map((type) => (
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
                <Button size="sm" onClick={() => openCreate({ name: "", type: "content", description: "", config: "" })}>
                  <Plus className="mr-2 size-4" />
                  {t("orchestrator.createTemplate", "Create Template")}
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "name", label: "Name" },
                  { key: "type", label: "Type", type: "select", options: TEMPLATE_TYPES },
                  { key: "description", label: "Description", multiline: true },
                ],
                () => handleSave("/api/orchestrator/templates", mutateTemplates, ["name", "type", "description"])
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
                            <Badge tone="info">{template.type}</Badge>
                          </div>
                          {template.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => handleExecuteTemplate(template.id)}>
                            <Play className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDetail(template)}>
                            <Eye className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(template, ["name", "type", "description"])}>
                            <RotateCcw className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("/api/orchestrator/templates", template.id, mutateTemplates)}>
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
                    {t("orchestrator.noTemplates", "No templates found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "automation" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ name: "", triggerType: "manual", conditions: "", actions: "", description: "" })}>
                  <Plus className="mr-2 size-4" />
                  {t("orchestrator.createRule", "Create Rule")}
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "name", label: "Name" },
                  { key: "triggerType", label: "Trigger Type", type: "select", options: TRIGGER_TYPES },
                  { key: "conditions", label: "Conditions", multiline: true },
                  { key: "actions", label: "Actions", multiline: true },
                  { key: "description", label: "Description", multiline: true },
                ],
                () => handleSave("/api/orchestrator/rules", mutateRules, ["name", "triggerType", "conditions", "actions", "description"])
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
                          {rule.conditions && <p className="text-xs text-muted-foreground mt-1">Conditions: {rule.conditions}</p>}
                          {rule.actions && <p className="text-xs text-muted-foreground mt-1">Actions: {rule.actions}</p>}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(rule)}>
                            <Eye className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(rule, ["name", "triggerType", "conditions", "actions", "description"])}>
                            <RotateCcw className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("/api/orchestrator/rules", rule.id, mutateRules)}>
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
                    {t("orchestrator.noRules", "No automation rules")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <CheckCircle className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("orchestrator.successRate", "Success Rate")}</p>
                      <p className="mt-1 text-2xl font-semibold">{analytics?.successRate ?? stats?.successRate ?? 0}%</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <CreditCard className="size-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("orchestrator.creditsUsed", "Credits Used")}</p>
                      <p className="mt-1 text-2xl font-semibold">{analytics?.creditsUsed ?? stats?.creditsUsed ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Target className="size-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("orchestrator.totalExecutions", "Total Executions")}</p>
                      <p className="mt-1 text-2xl font-semibold">{analytics?.totalExecutions ?? executions.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Layers className="size-5 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("orchestrator.avgCreditsPerExec", "Avg Credits/Exec")}</p>
                      <p className="mt-1 text-2xl font-semibold">{analytics?.avgCreditsPerExec ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard title={t("orchestrator.executionSuccessRate", "Execution Success Rate")}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Success</span>
                      <span className="text-sm font-semibold">{analytics?.successRate ?? stats?.successRate ?? 0}%</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-muted/40">
                      <div
                        className="h-3 rounded-full bg-green-500 transition-all"
                        style={{ width: `${Math.min(analytics?.successRate ?? stats?.successRate ?? 0, 100)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("orchestrator.completed", "Completed")}</p>
                        <p className="text-lg font-semibold text-green-500">{analytics?.completedExecutions ?? executions.filter((e: any) => e.status === "completed").length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("orchestrator.failed", "Failed")}</p>
                        <p className="text-lg font-semibold text-red-500">{analytics?.failedExecutions ?? executions.filter((e: any) => e.status === "failed").length}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("orchestrator.running", "Running")}</p>
                        <p className="text-lg font-semibold text-blue-500">{analytics?.runningExecutions ?? executions.filter((e: any) => e.status === "running").length}</p>
                      </div>
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard title={t("orchestrator.creditsUsage", "Credits Usage Over Time")}>
                  {analytics?.creditsTimeline && analytics.creditsTimeline.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.creditsTimeline.slice(0, 7).map((entry: any, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                          <span className="text-sm font-medium">{entry.date || entry.label}</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 rounded-full bg-muted/40">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${Math.min((entry.credits / (analytics?.maxCredits || 1)) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-12 text-right">{entry.credits}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { label: "Total Credits Used", value: stats?.creditsUsed ?? 0, icon: CreditCard, color: "purple" },
                        { label: "Credits Remaining", value: stats?.creditsRemaining ?? "-", icon: CreditCard, color: "green" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                          <div className="flex items-center gap-2">
                            <item.icon className={`size-4 text-${item.color}-500`} />
                            <span className="text-sm">{item.label}</span>
                          </div>
                          <span className="text-sm font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </DashboardCard>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard title={t("orchestrator.moduleUsage", "Module Usage Breakdown")}>
                  {analytics?.moduleUsage && analytics.moduleUsage.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.moduleUsage.map((mod: any, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                          <div className="flex items-center gap-2">
                            <Workflow className="size-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{mod.name || mod.module}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-muted/40">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${Math.min((mod.count / (analytics?.maxModuleCount || 1)) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8 text-right">{mod.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("common.noData", "No data available")}
                    </div>
                  )}
                </DashboardCard>

                <DashboardCard title={t("orchestrator.pipelinePerformance", "Pipeline Performance")}>
                  {analytics?.pipelinePerformance && analytics.pipelinePerformance.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.pipelinePerformance.map((pipeline: any, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate">{pipeline.name}</span>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">{pipeline.executions} runs</span>
                              <span className="text-xs text-muted-foreground">{pipeline.avgCredits} avg credits</span>
                              <span className="text-xs text-muted-foreground">{pipeline.successRate}% success</span>
                            </div>
                          </div>
                          <div className={`flex size-8 items-center justify-center rounded-lg ${pipeline.successRate >= 90 ? "bg-green-500/10" : pipeline.successRate >= 70 ? "bg-amber-500/10" : "bg-red-500/10"}`}>
                            {pipeline.successRate >= 90 ? (
                              <ArrowUp className="size-4 text-green-500" />
                            ) : pipeline.successRate >= 70 ? (
                              <ArrowDown className="size-4 text-amber-500" />
                            ) : (
                              <AlertCircle className="size-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : pipelines.length > 0 ? (
                    <div className="space-y-3">
                      {pipelines.slice(0, 5).map((pipeline: any) => (
                        <div key={pipeline.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate">{pipeline.name}</span>
                          </div>
                          <Badge tone="info">{pipeline.type}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("common.noData", "No data available")}
                    </div>
                  )}
                </DashboardCard>
              </div>

              <DashboardCard title={t("orchestrator.recentActivity", "Recent Activity")}>
                {executions.length > 0 ? (
                  <div className="space-y-3">
                    {executions.slice(0, 10).map((exec: any) => (
                      <div key={exec.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-8 items-center justify-center rounded-lg ${
                            exec.status === "completed" ? "bg-green-500/10" :
                            exec.status === "failed" ? "bg-red-500/10" :
                            exec.status === "running" ? "bg-blue-500/10" : "bg-muted/40"
                          }`}>
                            {exec.status === "completed" ? <CheckCircle className="size-4 text-green-500" /> :
                             exec.status === "failed" ? <AlertCircle className="size-4 text-red-500" /> :
                             exec.status === "running" ? <Play className="size-4 text-blue-500" /> :
                             <Clock className="size-4 text-muted-foreground" />}
                          </div>
                          <div>
                            <span className="text-sm font-medium">{exec.name || exec.id}</span>
                            <p className="text-xs text-muted-foreground">{exec.createdAt ? new Date(exec.createdAt).toLocaleString() : "-"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {exec.credits != null && <span className="text-xs text-muted-foreground">{exec.credits} cr</span>}
                          {getStatusBadge(exec.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                    {t("common.noData", "No recent activity")}
                  </div>
                )}
              </DashboardCard>
            </div>
          )}
        </>
      )}

      {showDetail && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-background p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t("orchestrator.details", "Details")}</h3>
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
