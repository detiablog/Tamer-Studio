"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Settings,
  Plus,
  Search,
  RefreshCw,
  Loader,
  Edit,
  Trash2,
  Trash,
  RotateCcw,
  Download,
  Upload,
  BookOpen,
  Flag,
  Pause,
  Play,
  Save,
  X,
  GitBranch,
  ListOrdered,
  Activity,
  Wrench,
  Gauge,
  Zap,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

type TabKey = "templates" | "rules" | "limits" | "queue" | "analytics" | "featureFlags" | "maintenance";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "templates", icon: BookOpen },
  { key: "rules", icon: Zap },
  { key: "limits", icon: Gauge },
  { key: "queue", icon: ListOrdered },
  { key: "analytics", icon: BarChart3 },
  { key: "featureFlags", icon: Flag },
  { key: "maintenance", icon: Trash },
];

type OrchestratorTemplate = {
  id: string;
  name: string;
  description?: string;
  type: string;
  category?: string;
  icon?: string;
  pipelineConfig?: Record<string, unknown>;
  steps?: unknown[];
  estimatedCredits?: number;
  estimatedDurationMs?: number;
  tags?: string[];
  isActive?: boolean;
  usageCount?: number;
  isSystem?: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type AutomationRule = {
  id: string;
  name: string;
  description?: string;
  triggerType: string;
  triggerConfig?: Record<string, unknown>;
  conditions?: Record<string, unknown>[];
  actions?: Record<string, unknown>[];
  isEnabled: boolean;
  executionCount?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type QueueItem = {
  id: string;
  taskId: string;
  position: number;
  priority: number;
  status: string;
  estimatedCredits?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type OrchestratorSettings = {
  maxConcurrentExecutions: number;
  maxQueueSize: number;
  maxRetries: number;
  autoRetry: boolean;
  autoOptimize: boolean;
  notificationsEnabled: boolean;
  creditWarningThreshold: number;
  defaultPriority: number;
  allowedModules?: string[];
  metadata?: Record<string, unknown>;
};

type FeatureFlags = {
  autoRetry: boolean;
  autoOptimize: boolean;
  notificationsEnabled: boolean;
};

type OrchestratorStats = {
  pipelines: {
    totalPipelines: number;
    activePipelines: number;
    totalExecutions: number;
    runningExecutions: number;
    totalSteps: number;
    templates: number;
  };
  queue: {
    total: number;
    waiting: number;
    processing: number;
  };
  rules: {
    total: number;
    enabled: number;
    disabled: number;
  };
};

type Execution = {
  id: string;
  pipelineId: string;
  status: string;
  creditsUsed?: number;
  startedAt?: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

export function OrchestratorAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("templates");
  const [search, setSearch] = React.useState("");
  const [editingTemplate, setEditingTemplate] = React.useState<OrchestratorTemplate | null>(null);
  const [showCreateTemplate, setShowCreateTemplate] = React.useState(false);
  const [newTemplate, setNewTemplate] = React.useState<Partial<OrchestratorTemplate>>({
    name: "",
    description: "",
    type: "",
    category: "",
    estimatedCredits: 0,
    estimatedDurationMs: 0,
    isActive: true,
  });
  const [editingRule, setEditingRule] = React.useState<AutomationRule | null>(null);
  const [showCreateRule, setShowCreateRule] = React.useState(false);
  const [newRule, setNewRule] = React.useState<Partial<AutomationRule>>({
    name: "",
    description: "",
    triggerType: "",
    isEnabled: true,
  });
  const [confirmClearPipelines, setConfirmClearPipelines] = React.useState(false);
  const [confirmResetHistory, setConfirmResetHistory] = React.useState(false);
  const [confirmClearQueue, setConfirmClearQueue] = React.useState(false);

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR(
    "/api/orchestrator/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR(
    "/api/orchestrator/settings",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: templatesData, isLoading: templatesLoading, mutate: mutateTemplates } = useSWR(
    "/api/orchestrator/templates",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: rulesData, isLoading: rulesLoading, mutate: mutateRules } = useSWR(
    "/api/orchestrator/rules",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: queueData, isLoading: queueLoading, mutate: mutateQueue } = useSWR(
    "/api/orchestrator/queue",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: executionsData, isLoading: executionsLoading, mutate: mutateExecutions } = useSWR(
    "/api/orchestrator/executions",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const stats: OrchestratorStats | null = statsData?.success ? statsData.data : null;
  const rawSettings = settingsData?.success ? settingsData.data : null;
  const settings: OrchestratorSettings = rawSettings ?? {
    maxConcurrentExecutions: 3,
    maxQueueSize: 50,
    maxRetries: 3,
    autoRetry: true,
    autoOptimize: false,
    notificationsEnabled: true,
    creditWarningThreshold: 100,
    defaultPriority: 1,
  };
  const templates: OrchestratorTemplate[] = templatesData?.success ? (Array.isArray(templatesData.data) ? templatesData.data : []) : [];
  const rulesResponse = rulesData?.success ? rulesData.data : null;
  const rules: AutomationRule[] = rulesResponse?.rules ?? (Array.isArray(rulesResponse) ? rulesResponse : []);
  const queueResponse = queueData?.success ? queueData.data : null;
  const queueItems: QueueItem[] = queueResponse?.items ?? (Array.isArray(queueResponse) ? queueResponse : []);
  const executionsResponse = executionsData?.success ? executionsData.data : null;
  const executions: Execution[] = executionsResponse?.items ?? (Array.isArray(executionsResponse) ? executionsResponse : []);

  const featureFlags: FeatureFlags = {
    autoRetry: settings.autoRetry,
    autoOptimize: settings.autoOptimize,
    notificationsEnabled: settings.notificationsEnabled,
  };

  const filteredTemplates = React.useMemo(
    () =>
      templates.filter(
        (tpl: OrchestratorTemplate) =>
          tpl.name?.toLowerCase().includes(search.toLowerCase()) ||
          tpl.type?.toLowerCase().includes(search.toLowerCase()) ||
          tpl.category?.toLowerCase().includes(search.toLowerCase())
      ),
    [templates, search]
  );

  const filteredRules = React.useMemo(
    () =>
      rules.filter(
        (r: AutomationRule) =>
          r.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.triggerType?.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase())
      ),
    [rules, search]
  );

  const filteredQueue = React.useMemo(
    () =>
      queueItems.filter(
        (q: QueueItem) =>
          q.taskId?.toLowerCase().includes(search.toLowerCase()) ||
          q.status?.toLowerCase().includes(search.toLowerCase())
      ),
    [queueItems, search]
  );

  const totalCreditsUsed = React.useMemo(
    () => executions.reduce((sum: number, e: Execution) => sum + (e.creditsUsed ?? 0), 0),
    [executions]
  );

  const successExecutions = React.useMemo(
    () => executions.filter((e: Execution) => e.status === "completed").length,
    [executions]
  );

  const failedExecutions = React.useMemo(
    () => executions.filter((e: Execution) => e.status === "failed").length,
    [executions]
  );

  const moduleUsage = React.useMemo(() => {
    const map = new Map<string, number>();
    executions.forEach((e: Execution) => {
      const pipeline = templates.find((tpl: OrchestratorTemplate) => tpl.id === e.pipelineId);
      const moduleName = pipeline?.category ?? pipeline?.type ?? "unknown";
      map.set(moduleName, (map.get(moduleName) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([module, count]) => ({ module, count }));
  }, [executions, templates]);

  const handleCreateTemplate = async () => {
    try {
      const res = await fetch("/api/orchestrator/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      });
      if (res.ok) {
        toast.success(t("common.success", "Template created"));
        setShowCreateTemplate(false);
        setNewTemplate({
          name: "",
          description: "",
          type: "",
          category: "",
          estimatedCredits: 0,
          estimatedDurationMs: 0,
          isActive: true,
        });
        mutateTemplates();
      } else {
        toast.error(t("common.error", "Error creating template"));
      }
    } catch {
      toast.error(t("common.error", "Error creating template"));
    }
  };

  const handleUpdateTemplate = async (id: string, updates: Partial<OrchestratorTemplate>) => {
    try {
      const res = await fetch(`/api/orchestrator/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("common.success", "Template updated"));
        setEditingTemplate(null);
        mutateTemplates();
      } else {
        toast.error(t("common.error", "Error updating template"));
      }
    } catch {
      toast.error(t("common.error", "Error updating template"));
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/orchestrator/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Template deleted"));
        mutateTemplates();
      } else {
        toast.error(t("common.error", "Error deleting template"));
      }
    } catch {
      toast.error(t("common.error", "Error deleting template"));
    }
  };

  const handleToggleTemplate = async (template: OrchestratorTemplate) => {
    await handleUpdateTemplate(template.id, { isActive: !template.isActive });
  };

  const handleCreateRule = async () => {
    try {
      const res = await fetch("/api/orchestrator/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule),
      });
      if (res.ok) {
        toast.success(t("common.success", "Rule created"));
        setShowCreateRule(false);
        setNewRule({
          name: "",
          description: "",
          triggerType: "",
          isEnabled: true,
        });
        mutateRules();
      } else {
        toast.error(t("common.error", "Error creating rule"));
      }
    } catch {
      toast.error(t("common.error", "Error creating rule"));
    }
  };

  const handleUpdateRule = async (id: string, updates: Partial<AutomationRule>) => {
    try {
      const res = await fetch(`/api/orchestrator/rules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("common.success", "Rule updated"));
        setEditingRule(null);
        mutateRules();
      } else {
        toast.error(t("common.error", "Error updating rule"));
      }
    } catch {
      toast.error(t("common.error", "Error updating rule"));
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/orchestrator/rules/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Rule deleted"));
        mutateRules();
      } else {
        toast.error(t("common.error", "Error deleting rule"));
      }
    } catch {
      toast.error(t("common.error", "Error deleting rule"));
    }
  };

  const handleToggleRule = async (rule: AutomationRule) => {
    try {
      const res = await fetch(`/api/orchestrator/rules/${rule.id}/toggle`, { method: "POST" });
      if (res.ok) {
        toast.success(t("common.success", "Rule toggled"));
        mutateRules();
      } else {
        toast.error(t("common.error", "Error toggling rule"));
      }
    } catch {
      toast.error(t("common.error", "Error toggling rule"));
    }
  };

  const handleSaveSettings = async (updates: Partial<OrchestratorSettings>) => {
    try {
      const res = await fetch("/api/orchestrator/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, ...updates }),
      });
      if (res.ok) {
        toast.success(t("common.success", "Settings saved"));
        mutateSettings();
      } else {
        toast.error(t("common.error", "Error saving settings"));
      }
    } catch {
      toast.error(t("common.error", "Error saving settings"));
    }
  };

  const handleSaveFeatureFlags = async (updates: Partial<FeatureFlags>) => {
    try {
      const res = await fetch("/api/orchestrator/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, ...updates }),
      });
      if (res.ok) {
        toast.success(t("common.success", "Feature flags saved"));
        mutateSettings();
      } else {
        toast.error(t("common.error", "Error saving feature flags"));
      }
    } catch {
      toast.error(t("common.error", "Error saving feature flags"));
    }
  };

  const handleRemoveQueueItem = async (id: string) => {
    try {
      const res = await fetch(`/api/orchestrator/queue/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Queue item removed"));
        mutateQueue();
      } else {
        toast.error(t("common.error", "Error removing queue item"));
      }
    } catch {
      toast.error(t("common.error", "Error removing queue item"));
    }
  };

  const handleClearQueue = async () => {
    try {
      const removals = queueItems.map((item: QueueItem) =>
        fetch(`/api/orchestrator/queue/${item.id}`, { method: "DELETE" })
      );
      await Promise.all(removals);
      toast.success(t("common.success", "Queue cleared"));
      setConfirmClearQueue(false);
      mutateQueue();
    } catch {
      toast.error(t("common.error", "Error clearing queue"));
    }
  };

  const handleClearPipelines = async () => {
    try {
      const removals = templates.map((tpl: OrchestratorTemplate) =>
        fetch(`/api/orchestrator/templates/${tpl.id}`, { method: "DELETE" })
      );
      await Promise.all(removals);
      toast.success(t("common.success", "All pipelines cleared"));
      setConfirmClearPipelines(false);
      mutateTemplates();
      mutateStats();
    } catch {
      toast.error(t("common.error", "Error clearing pipelines"));
    }
  };

  const handleResetHistory = async () => {
    try {
      const removals = executions.map((e: Execution) =>
        fetch(`/api/orchestrator/executions/${e.id}`, { method: "DELETE" })
      );
      await Promise.all(removals);
      toast.success(t("common.success", "Execution history reset"));
      setConfirmResetHistory(false);
      mutateExecutions();
      mutateStats();
    } catch {
      toast.error(t("common.error", "Error resetting execution history"));
    }
  };

  const handleExportConfig = async () => {
    try {
      const config = {
        settings,
        templates: templates.map((tpl: OrchestratorTemplate) => ({
          name: tpl.name,
          description: tpl.description,
          type: tpl.type,
          category: tpl.category,
          pipelineConfig: tpl.pipelineConfig,
          steps: tpl.steps,
          estimatedCredits: tpl.estimatedCredits,
          estimatedDurationMs: tpl.estimatedDurationMs,
          tags: tpl.tags,
          isActive: tpl.isActive,
        })),
        rules: rules.map((r: AutomationRule) => ({
          name: r.name,
          description: r.description,
          triggerType: r.triggerType,
          triggerConfig: r.triggerConfig,
          conditions: r.conditions,
          actions: r.actions,
          isEnabled: r.isEnabled,
        })),
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orchestrator-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("common.success", "Export downloaded"));
    } catch {
      toast.error(t("common.error", "Error exporting configuration"));
    }
  };

  const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.settings) {
        await fetch("/api/orchestrator/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.settings),
        });
      }
      if (Array.isArray(data.templates)) {
        for (const tpl of data.templates) {
          await fetch("/api/orchestrator/templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tpl),
          });
        }
      }
      if (Array.isArray(data.rules)) {
        for (const rule of data.rules) {
          await fetch("/api/orchestrator/rules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rule),
          });
        }
      }
      toast.success(t("common.success", "Configuration imported"));
      mutateTemplates();
      mutateRules();
      mutateSettings();
    } catch {
      toast.error(t("common.error", "Invalid import file"));
    }
    event.target.value = "";
  };

  const isLoading = statsLoading || settingsLoading || templatesLoading || rulesLoading || queueLoading || executionsLoading;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("aiOrchestrator.title", "AI Orchestrator") }]} />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("aiOrchestrator.title", "AI Orchestrator")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("aiOrchestrator.description", "Manage pipelines, automation rules, queues, and orchestrator settings")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { mutateStats(); mutateSettings(); mutateTemplates(); mutateRules(); mutateQueue(); mutateExecutions(); }}>
              <RefreshCw className="mr-2 size-4" />
              {t("common.refresh", "Refresh")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 mb-6">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearch(""); }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {t(`aiOrchestrator.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
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
            {activeTab === "templates" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("common.search", "Search...")}
                      className="pl-9"
                    />
                  </div>
                  <Button size="sm" onClick={() => setShowCreateTemplate(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateTemplate && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("aiOrchestrator.newTemplate", "New Pipeline Template")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateTemplate(false)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Template name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.type", "Type")}</label>
                        <Input
                          value={newTemplate.type}
                          onChange={(e) => setNewTemplate((p) => ({ ...p, type: e.target.value }))}
                          placeholder="e.g. content-generation"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.category", "Category")}</label>
                        <Input
                          value={newTemplate.category}
                          onChange={(e) => setNewTemplate((p) => ({ ...p, category: e.target.value }))}
                          placeholder="general"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiOrchestrator.estimatedCredits", "Est. Credits")}</label>
                        <Input
                          type="number"
                          value={newTemplate.estimatedCredits}
                          onChange={(e) => setNewTemplate((p) => ({ ...p, estimatedCredits: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={newTemplate.description}
                          onChange={(e) => setNewTemplate((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCreateTemplate(false)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={handleCreateTemplate} disabled={!newTemplate.name || !newTemplate.type}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {editingTemplate && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("aiOrchestrator.editTemplate", "Edit Template")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(null)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={editingTemplate.name}
                          onChange={(e) => setEditingTemplate((p) => (p ? { ...p, name: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.type", "Type")}</label>
                        <Input
                          value={editingTemplate.type}
                          onChange={(e) => setEditingTemplate((p) => (p ? { ...p, type: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.category", "Category")}</label>
                        <Input
                          value={editingTemplate.category ?? ""}
                          onChange={(e) => setEditingTemplate((p) => (p ? { ...p, category: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiOrchestrator.estimatedCredits", "Est. Credits")}</label>
                        <Input
                          type="number"
                          value={editingTemplate.estimatedCredits ?? 0}
                          onChange={(e) => setEditingTemplate((p) => (p ? { ...p, estimatedCredits: Number(e.target.value) } : null))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={editingTemplate.description ?? ""}
                          onChange={(e) => setEditingTemplate((p) => (p ? { ...p, description: e.target.value } : null))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingTemplate(null)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={() => editingTemplate && handleUpdateTemplate(editingTemplate.id, editingTemplate)}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                <AdminDataTable
                  data={filteredTemplates}
                  keyExtractor={(tpl: OrchestratorTemplate) => tpl.id}
                  columns={[
                    {
                      key: "name",
                      header: t("common.name", "Name"),
                      sortable: true,
                      render: (item: OrchestratorTemplate) => <span className="text-sm font-medium">{item.name}</span>,
                    },
                    { key: "type", header: "Type", sortable: true, render: (item: OrchestratorTemplate) => <Badge tone="info">{item.type}</Badge> },
                    { key: "category", header: "Category", sortable: true, render: (item: OrchestratorTemplate) => item.category ? <Badge tone="purple">{item.category}</Badge> : <span className="text-muted-foreground text-xs">-</span> },
                    { key: "estimatedCredits", header: "Credits", sortable: true, render: (item: OrchestratorTemplate) => <span className="text-sm">{item.estimatedCredits ?? 0}</span> },
                    { key: "usageCount", header: "Usage", sortable: true, render: (item: OrchestratorTemplate) => <span className="text-sm">{item.usageCount ?? 0}</span> },
                    {
                      key: "isActive",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: OrchestratorTemplate) => (
                        <Badge tone={item.isActive ? "success" : "default"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: OrchestratorTemplate) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleTemplate(item)}>
                            {item.isActive ? <Pause className="size-3" /> : <Play className="size-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(item)}>
                            <Edit className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(item.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {activeTab === "rules" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("common.search", "Search...")}
                      className="pl-9"
                    />
                  </div>
                  <Button size="sm" onClick={() => setShowCreateRule(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateRule && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("aiOrchestrator.newRule", "New Automation Rule")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateRule(false)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={newRule.name}
                          onChange={(e) => setNewRule((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Rule name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiOrchestrator.triggerType", "Trigger Type")}</label>
                        <Input
                          value={newRule.triggerType}
                          onChange={(e) => setNewRule((p) => ({ ...p, triggerType: e.target.value }))}
                          placeholder="e.g. task.created, execution.completed"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={newRule.description}
                          onChange={(e) => setNewRule((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCreateRule(false)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={handleCreateRule} disabled={!newRule.name || !newRule.triggerType}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {editingRule && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("aiOrchestrator.editRule", "Edit Rule")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingRule(null)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={editingRule.name}
                          onChange={(e) => setEditingRule((p) => (p ? { ...p, name: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiOrchestrator.triggerType", "Trigger Type")}</label>
                        <Input
                          value={editingRule.triggerType}
                          onChange={(e) => setEditingRule((p) => (p ? { ...p, triggerType: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={editingRule.description ?? ""}
                          onChange={(e) => setEditingRule((p) => (p ? { ...p, description: e.target.value } : null))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingRule(null)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={() => editingRule && handleUpdateRule(editingRule.id, editingRule)}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                <AdminDataTable
                  data={filteredRules}
                  keyExtractor={(r: AutomationRule) => r.id}
                  columns={[
                    {
                      key: "name",
                      header: t("common.name", "Name"),
                      sortable: true,
                      render: (item: AutomationRule) => <span className="text-sm font-medium">{item.name}</span>,
                    },
                    { key: "triggerType", header: "Trigger", sortable: true, render: (item: AutomationRule) => <Badge tone="info">{item.triggerType}</Badge> },
                    { key: "executionCount", header: "Executions", sortable: true, render: (item: AutomationRule) => <span className="text-sm">{item.executionCount ?? 0}</span> },
                    {
                      key: "isEnabled",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: AutomationRule) => (
                        <Badge tone={item.isEnabled ? "success" : "default"}>
                          {item.isEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: AutomationRule) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleRule(item)}>
                            {item.isEnabled ? <Pause className="size-3" /> : <Play className="size-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingRule(item)}>
                            <Edit className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(item.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {activeTab === "limits" && (
              <div className="space-y-4">
                <DashboardCard title={t("aiOrchestrator.executionLimits", "Execution Limits")}>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiOrchestrator.maxConcurrent", "Max Concurrent Executions")}</label>
                        <Input
                          type="number"
                          value={settings.maxConcurrentExecutions}
                          onChange={(e) => handleSaveSettings({ maxConcurrentExecutions: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiOrchestrator.maxQueueSize", "Max Queue Size")}</label>
                        <Input
                          type="number"
                          value={settings.maxQueueSize}
                          onChange={(e) => handleSaveSettings({ maxQueueSize: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiOrchestrator.maxRetries", "Max Retries")}</label>
                        <Input
                          type="number"
                          value={settings.maxRetries}
                          onChange={(e) => handleSaveSettings({ maxRetries: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {t("aiOrchestrator.creditWarningThreshold", "Credit Warning Threshold")}
                        </label>
                        <Input
                          type="number"
                          value={settings.creditWarningThreshold}
                          onChange={(e) => handleSaveSettings({ creditWarningThreshold: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("aiOrchestrator.defaultPriority", "Default Priority")}</label>
                        <Input
                          type="number"
                          value={settings.defaultPriority}
                          onChange={(e) => handleSaveSettings({ defaultPriority: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            )}

            {activeTab === "queue" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("common.search", "Search...")}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { mutateQueue(); mutateStats(); }}>
                    <RefreshCw className="mr-2 size-4" />
                    {t("common.refresh", "Refresh")}
                  </Button>
                </div>

                {stats?.queue && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <DashboardCard>
                      <div className="flex items-center gap-3">
                        <ListOrdered className="size-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("aiOrchestrator.totalQueued", "Total Queued")}</p>
                          <p className="mt-1 text-2xl font-semibold">{stats.queue.total}</p>
                        </div>
                      </div>
                    </DashboardCard>
                    <DashboardCard>
                      <div className="flex items-center gap-3">
                        <Clock className="size-5 text-amber-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("aiOrchestrator.waiting", "Waiting")}</p>
                          <p className="mt-1 text-2xl font-semibold">{stats.queue.waiting}</p>
                        </div>
                      </div>
                    </DashboardCard>
                    <DashboardCard>
                      <div className="flex items-center gap-3">
                        <Activity className="size-5 text-green-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("aiOrchestrator.processing", "Processing")}</p>
                          <p className="mt-1 text-2xl font-semibold">{stats.queue.processing}</p>
                        </div>
                      </div>
                    </DashboardCard>
                  </div>
                )}

                <div className="flex justify-end">
                  {confirmClearQueue ? (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setConfirmClearQueue(false)}>
                        <X className="mr-2 size-4" />
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleClearQueue}>
                        <Trash className="mr-2 size-4" />
                        {t("aiOrchestrator.confirmClearQueue", "Confirm Clear")}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="destructive" size="sm" onClick={() => setConfirmClearQueue(true)} disabled={queueItems.length === 0}>
                      <Trash className="mr-2 size-4" />
                      {t("aiOrchestrator.clearQueue", "Clear Queue")}
                    </Button>
                  )}
                </div>

                <AdminDataTable
                  data={filteredQueue}
                  keyExtractor={(q: QueueItem) => q.id}
                  columns={[
                    { key: "taskId", header: "Task ID", sortable: true, render: (item: QueueItem) => <span className="text-sm font-medium font-mono">{item.taskId}</span> },
                    { key: "position", header: "Position", sortable: true, render: (item: QueueItem) => <span className="text-sm">{item.position}</span> },
                    { key: "priority", header: "Priority", sortable: true, render: (item: QueueItem) => <Badge tone="purple">{item.priority}</Badge> },
                    { key: "estimatedCredits", header: "Credits", sortable: true, render: (item: QueueItem) => <span className="text-sm">{item.estimatedCredits ?? "-"}</span> },
                    {
                      key: "status",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: QueueItem) => (
                        <Badge tone={item.status === "processing" ? "success" : item.status === "waiting" ? "warning" : "default"}>
                          {item.status}
                        </Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: QueueItem) => (
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveQueueItem(item.id)}>
                          <Trash2 className="size-3" />
                        </Button>
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <DashboardCard>
                    <div className="flex items-center gap-3">
                      <GitBranch className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("aiOrchestrator.totalPipelines", "Total Pipelines")}</p>
                        <p className="mt-1 text-2xl font-semibold">{stats?.pipelines?.totalPipelines ?? 0}</p>
                      </div>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="flex items-center gap-3">
                      <Activity className="size-5 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("aiOrchestrator.totalExecutions", "Total Executions")}</p>
                        <p className="mt-1 text-2xl font-semibold">{stats?.pipelines?.totalExecutions ?? 0}</p>
                      </div>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="flex items-center gap-3">
                      <Zap className="size-5 text-amber-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("aiOrchestrator.creditsConsumed", "Credits Consumed")}</p>
                        <p className="mt-1 text-2xl font-semibold">{totalCreditsUsed}</p>
                      </div>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="flex items-center gap-3">
                      <BookOpen className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("aiOrchestrator.templatesCount", "Templates")}</p>
                        <p className="mt-1 text-2xl font-semibold">{stats?.pipelines?.templates ?? templates.length}</p>
                      </div>
                    </div>
                  </DashboardCard>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DashboardCard>
                    <div className="flex items-center gap-3">
                      <div className="size-3 rounded-full bg-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("aiOrchestrator.successRate", "Success Rate")}</p>
                        <p className="mt-1 text-2xl font-semibold">
                          {executions.length > 0
                            ? `${Math.round((successExecutions / executions.length) * 100)}%`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="flex items-center gap-3">
                      <div className="size-3 rounded-full bg-red-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("aiOrchestrator.failureRate", "Failure Rate")}</p>
                        <p className="mt-1 text-2xl font-semibold">
                          {executions.length > 0
                            ? `${Math.round((failedExecutions / executions.length) * 100)}%`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="flex items-center gap-3">
                      <Activity className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("aiOrchestrator.runningNow", "Running Now")}</p>
                        <p className="mt-1 text-2xl font-semibold">{stats?.pipelines?.runningExecutions ?? 0}</p>
                      </div>
                    </div>
                  </DashboardCard>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("aiOrchestrator.activePipelines", "Active Pipelines")}</p>
                    <p className="mt-2 text-2xl font-semibold">{stats?.pipelines?.activePipelines ?? 0}</p>
                  </DashboardCard>
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("aiOrchestrator.activeRules", "Active Rules")}</p>
                    <p className="mt-2 text-2xl font-semibold">{stats?.rules?.enabled ?? 0}</p>
                  </DashboardCard>
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("aiOrchestrator.totalSteps", "Total Steps")}</p>
                    <p className="mt-2 text-2xl font-semibold">{stats?.pipelines?.totalSteps ?? 0}</p>
                  </DashboardCard>
                </div>

                {moduleUsage.length > 0 && (
                  <DashboardCard title={t("aiOrchestrator.moduleUsage", "Module Usage Breakdown")}>
                    <div className="space-y-2">
                      {moduleUsage.map(({ module, count }) => (
                        <div
                          key={module}
                          className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <Badge tone="info">{module}</Badge>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </DashboardCard>
                )}
              </div>
            )}

            {activeTab === "featureFlags" && (
              <div className="space-y-4">
                <DashboardCard title={t("aiOrchestrator.featureFlags", "Feature Flags")}>
                  <div className="space-y-4">
                    {([
                      {
                        key: "autoRetry" as const,
                        label: "Auto-Retry",
                        desc: "Automatically retry failed tasks based on configured retry policy",
                      },
                      {
                        key: "autoOptimize" as const,
                        label: "Auto-Optimize",
                        desc: "Automatically optimize pipeline execution order and resource allocation",
                      },
                      {
                        key: "notificationsEnabled" as const,
                        label: "Notifications",
                        desc: "Send notifications on pipeline completion, failure, and queue events",
                      },
                    ] as const).map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                        <div>
                          <h3 className="font-medium">{label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{desc}</p>
                        </div>
                        <Button
                          variant={featureFlags[key] ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSaveFeatureFlags({ [key]: !featureFlags[key] })}
                        >
                          {featureFlags[key] ? "Enabled" : "Disabled"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </DashboardCard>
              </div>
            )}

            {activeTab === "maintenance" && (
              <div className="space-y-4">
                <DashboardCard title={t("aiOrchestrator.exportImport", "Export & Import")}>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t("aiOrchestrator.exportConfig", "Export Configuration")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("aiOrchestrator.exportConfigDesc", "Download settings, templates, and rules as a JSON file")}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleExportConfig}>
                          <Download className="mr-2 size-4" />
                          {t("common.export", "Export")}
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t("aiOrchestrator.importConfig", "Import Configuration")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("aiOrchestrator.importConfigDesc", "Restore settings, templates, and rules from a backup file")}
                          </p>
                        </div>
                        <label>
                          <input type="file" accept=".json" className="hidden" onChange={handleImportConfig} />
                          <Button variant="outline" size="sm">
                            <Upload className="mr-2 size-4" />
                            {t("common.import", "Import")}
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard title={t("aiOrchestrator.resetOperations", "Reset Operations")}>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t("aiOrchestrator.resetHistory", "Reset Execution History")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("aiOrchestrator.resetHistoryDesc", "Clear all execution records and logs")}
                          </p>
                        </div>
                        {confirmResetHistory ? (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setConfirmResetHistory(false)}>
                              <X className="mr-2 size-4" />
                              {t("common.cancel", "Cancel")}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleResetHistory}>
                              <RotateCcw className="mr-2 size-4" />
                              {t("aiOrchestrator.confirmReset", "Confirm Reset")}
                            </Button>
                          </div>
                        ) : (
                          <Button variant="destructive" size="sm" onClick={() => setConfirmResetHistory(true)}>
                            <RotateCcw className="mr-2 size-4" />
                            {t("aiOrchestrator.resetHistory", "Reset History")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard title={t("aiOrchestrator.dangerZone", "Danger Zone")}>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-destructive">{t("aiOrchestrator.clearAllPipelines", "Clear All Pipelines")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("aiOrchestrator.clearAllPipelinesDesc", "Permanently delete all pipeline templates")}
                          </p>
                        </div>
                        {confirmClearPipelines ? (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setConfirmClearPipelines(false)}>
                              <X className="mr-2 size-4" />
                              {t("common.cancel", "Cancel")}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleClearPipelines}>
                              <Trash className="mr-2 size-4" />
                              {t("aiOrchestrator.confirmClear", "Confirm Clear")}
                            </Button>
                          </div>
                        ) : (
                          <Button variant="destructive" size="sm" onClick={() => setConfirmClearPipelines(true)}>
                            <Trash className="mr-2 size-4" />
                            {t("aiOrchestrator.clearPipelines", "Clear Pipelines")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            )}
          </>
        )}
      </DashboardCard>
    </div>
  );
}
