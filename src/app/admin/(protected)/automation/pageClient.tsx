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
  Zap,
  Clock,
  AlertTriangle,
  Activity,
  ListOrdered,
  GitBranch,
  Layers,
  SplitSquareHorizontal,
  Target,
  ChevronRight,
  FileText,
  Filter,
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

type TabKey =
  | "templates"
  | "triggers"
  | "conditions"
  | "actions"
  | "queue"
  | "executions"
  | "analytics"
  | "featureFlags"
  | "maintenance";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "templates", icon: BookOpen },
  { key: "triggers", icon: Zap },
  { key: "conditions", icon: SplitSquareHorizontal },
  { key: "actions", icon: Target },
  { key: "queue", icon: ListOrdered },
  { key: "executions", icon: Activity },
  { key: "analytics", icon: BarChart3 },
  { key: "featureFlags", icon: Flag },
  { key: "maintenance", icon: Trash },
];

type AutomationTemplate = {
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

type TriggerType = {
  id: string;
  name: string;
  description?: string;
  type: string;
  isEnabled: boolean;
  config?: Record<string, unknown>;
  executionCount?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type ConditionType = {
  id: string;
  name: string;
  description?: string;
  operator: string;
  isEnabled: boolean;
  config?: Record<string, unknown>;
  usageCount?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type ActionType = {
  id: string;
  name: string;
  description?: string;
  type: string;
  isEnabled: boolean;
  config?: Record<string, unknown>;
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

type Execution = {
  id: string;
  ruleId: string;
  templateId?: string;
  status: string;
  triggerType?: string;
  creditsUsed?: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

type AutomationSettings = {
  autoRetry: boolean;
  notificationsEnabled: boolean;
  smartAutomation: boolean;
  maxConcurrentExecutions: number;
  maxQueueSize: number;
  maxRetries: number;
  creditWarningThreshold: number;
  defaultPriority: number;
  metadata?: Record<string, unknown>;
};

type AutomationStats = {
  templates: {
    total: number;
    active: number;
  };
  triggers: {
    total: number;
    enabled: number;
  };
  conditions: {
    total: number;
  };
  actions: {
    total: number;
    enabled: number;
  };
  queue: {
    total: number;
    waiting: number;
    processing: number;
  };
  executions: {
    total: number;
    completed: number;
    failed: number;
    running: number;
  };
};

type FeatureFlags = {
  autoRetry: boolean;
  notificationsEnabled: boolean;
  smartAutomation: boolean;
};

export function AutomationAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("templates");
  const [search, setSearch] = React.useState("");
  const [executionFilter, setExecutionFilter] = React.useState("all");
  const [editingTemplate, setEditingTemplate] = React.useState<AutomationTemplate | null>(null);
  const [showCreateTemplate, setShowCreateTemplate] = React.useState(false);
  const [newTemplate, setNewTemplate] = React.useState<Partial<AutomationTemplate>>({
    name: "",
    description: "",
    type: "",
    category: "",
    estimatedCredits: 0,
    estimatedDurationMs: 0,
    isActive: true,
  });
  const [editingTrigger, setEditingTrigger] = React.useState<TriggerType | null>(null);
  const [showCreateTrigger, setShowCreateTrigger] = React.useState(false);
  const [newTrigger, setNewTrigger] = React.useState<Partial<TriggerType>>({
    name: "",
    description: "",
    type: "",
    isEnabled: true,
  });
  const [editingCondition, setEditingCondition] = React.useState<ConditionType | null>(null);
  const [showCreateCondition, setShowCreateCondition] = React.useState(false);
  const [newCondition, setNewCondition] = React.useState<Partial<ConditionType>>({
    name: "",
    description: "",
    operator: "",
    isEnabled: true,
  });
  const [editingAction, setEditingAction] = React.useState<ActionType | null>(null);
  const [showCreateAction, setShowCreateAction] = React.useState(false);
  const [newAction, setNewAction] = React.useState<Partial<ActionType>>({
    name: "",
    description: "",
    type: "",
    isEnabled: true,
  });
  const [selectedExecution, setSelectedExecution] = React.useState<Execution | null>(null);
  const [confirmClearRules, setConfirmClearRules] = React.useState(false);
  const [confirmResetHistory, setConfirmResetHistory] = React.useState(false);
  const [confirmClearQueue, setConfirmClearQueue] = React.useState(false);

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR(
    "/api/automation/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR(
    "/api/automation/settings",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: templatesData, isLoading: templatesLoading, mutate: mutateTemplates } = useSWR(
    "/api/automation/templates",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: triggersData, isLoading: triggersLoading, mutate: mutateTriggers } = useSWR(
    "/api/automation/triggers",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: conditionsData, isLoading: conditionsLoading, mutate: mutateConditions } = useSWR(
    "/api/automation/conditions",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: actionsData, isLoading: actionsLoading, mutate: mutateActions } = useSWR(
    "/api/automation/actions",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: queueData, isLoading: queueLoading, mutate: mutateQueue } = useSWR(
    "/api/automation/queue",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: executionsData, isLoading: executionsLoading, mutate: mutateExecutions } = useSWR(
    "/api/automation/executions",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const stats: AutomationStats | null = statsData?.success ? statsData.data : null;
  const rawSettings = settingsData?.success ? settingsData.data : null;
  const settings: AutomationSettings = rawSettings ?? {
    autoRetry: true,
    notificationsEnabled: true,
    smartAutomation: false,
    maxConcurrentExecutions: 3,
    maxQueueSize: 50,
    maxRetries: 3,
    creditWarningThreshold: 100,
    defaultPriority: 1,
  };
  const templates: AutomationTemplate[] = templatesData?.success ? (Array.isArray(templatesData.data) ? templatesData.data : []) : [];
  const triggersResponse = triggersData?.success ? triggersData.data : null;
  const triggerTypes: TriggerType[] = triggersResponse?.items ?? (Array.isArray(triggersResponse) ? triggersResponse : []);
  const conditionsResponse = conditionsData?.success ? conditionsData.data : null;
  const conditionTypes: ConditionType[] = conditionsResponse?.items ?? (Array.isArray(conditionsResponse) ? conditionsResponse : []);
  const actionsResponse = actionsData?.success ? actionsData.data : null;
  const actionTypes: ActionType[] = actionsResponse?.items ?? (Array.isArray(actionsResponse) ? actionsResponse : []);
  const queueResponse = queueData?.success ? queueData.data : null;
  const queueItems: QueueItem[] = queueResponse?.items ?? (Array.isArray(queueResponse) ? queueResponse : []);
  const executionsResponse = executionsData?.success ? executionsData.data : null;
  const executions: Execution[] = executionsResponse?.items ?? (Array.isArray(executionsResponse) ? executionsResponse : []);

  const featureFlags: FeatureFlags = {
    autoRetry: settings.autoRetry,
    notificationsEnabled: settings.notificationsEnabled,
    smartAutomation: settings.smartAutomation,
  };

  const filteredTemplates = React.useMemo(
    () =>
      templates.filter(
        (tpl: AutomationTemplate) =>
          tpl.name?.toLowerCase().includes(search.toLowerCase()) ||
          tpl.type?.toLowerCase().includes(search.toLowerCase()) ||
          tpl.category?.toLowerCase().includes(search.toLowerCase())
      ),
    [templates, search]
  );

  const filteredTriggers = React.useMemo(
    () =>
      triggerTypes.filter(
        (tr: TriggerType) =>
          tr.name?.toLowerCase().includes(search.toLowerCase()) ||
          tr.type?.toLowerCase().includes(search.toLowerCase()) ||
          tr.description?.toLowerCase().includes(search.toLowerCase())
      ),
    [triggerTypes, search]
  );

  const filteredConditions = React.useMemo(
    () =>
      conditionTypes.filter(
        (c: ConditionType) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.operator?.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase())
      ),
    [conditionTypes, search]
  );

  const filteredActions = React.useMemo(
    () =>
      actionTypes.filter(
        (a: ActionType) =>
          a.name?.toLowerCase().includes(search.toLowerCase()) ||
          a.type?.toLowerCase().includes(search.toLowerCase()) ||
          a.description?.toLowerCase().includes(search.toLowerCase())
      ),
    [actionTypes, search]
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

  const filteredExecutions = React.useMemo(() => {
    let result = executions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e: Execution) =>
          e.id?.toLowerCase().includes(q) ||
          e.ruleId?.toLowerCase().includes(q) ||
          e.status?.toLowerCase().includes(q) ||
          e.triggerType?.toLowerCase().includes(q)
      );
    }
    if (executionFilter !== "all") {
      result = result.filter((e: Execution) => e.status === executionFilter);
    }
    return result;
  }, [executions, search, executionFilter]);

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

  const mostUsedRules = React.useMemo(() => {
    const map = new Map<string, number>();
    executions.forEach((e: Execution) => {
      if (e.ruleId) {
        map.set(e.ruleId, (map.get(e.ruleId) ?? 0) + 1);
      }
    });
    return Array.from(map.entries())
      .map(([ruleId, count]) => ({ ruleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [executions]);

  const refreshAll = () => {
    mutateStats();
    mutateSettings();
    mutateTemplates();
    mutateTriggers();
    mutateConditions();
    mutateActions();
    mutateQueue();
    mutateExecutions();
  };

  const handleCreateTemplate = async () => {
    try {
      const res = await fetch("/api/automation/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      });
      if (res.ok) {
        toast.success(t("common.success", "Template created"));
        setShowCreateTemplate(false);
        setNewTemplate({ name: "", description: "", type: "", category: "", estimatedCredits: 0, estimatedDurationMs: 0, isActive: true });
        mutateTemplates();
      } else {
        toast.error(t("common.error", "Error creating template"));
      }
    } catch {
      toast.error(t("common.error", "Error creating template"));
    }
  };

  const handleUpdateTemplate = async (id: string, updates: Partial<AutomationTemplate>) => {
    try {
      const res = await fetch(`/api/automation/templates/${id}`, {
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
      const res = await fetch(`/api/automation/templates/${id}`, { method: "DELETE" });
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

  const handleToggleTemplate = async (template: AutomationTemplate) => {
    await handleUpdateTemplate(template.id, { isActive: !template.isActive });
  };

  const handleCreateTrigger = async () => {
    try {
      const res = await fetch("/api/automation/triggers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTrigger),
      });
      if (res.ok) {
        toast.success(t("common.success", "Trigger created"));
        setShowCreateTrigger(false);
        setNewTrigger({ name: "", description: "", type: "", isEnabled: true });
        mutateTriggers();
      } else {
        toast.error(t("common.error", "Error creating trigger"));
      }
    } catch {
      toast.error(t("common.error", "Error creating trigger"));
    }
  };

  const handleUpdateTrigger = async (id: string, updates: Partial<TriggerType>) => {
    try {
      const res = await fetch(`/api/automation/triggers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("common.success", "Trigger updated"));
        setEditingTrigger(null);
        mutateTriggers();
      } else {
        toast.error(t("common.error", "Error updating trigger"));
      }
    } catch {
      toast.error(t("common.error", "Error updating trigger"));
    }
  };

  const handleDeleteTrigger = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/triggers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Trigger deleted"));
        mutateTriggers();
      } else {
        toast.error(t("common.error", "Error deleting trigger"));
      }
    } catch {
      toast.error(t("common.error", "Error deleting trigger"));
    }
  };

  const handleToggleTrigger = async (trigger: TriggerType) => {
    await handleUpdateTrigger(trigger.id, { isEnabled: !trigger.isEnabled });
  };

  const handleCreateCondition = async () => {
    try {
      const res = await fetch("/api/automation/conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCondition),
      });
      if (res.ok) {
        toast.success(t("common.success", "Condition created"));
        setShowCreateCondition(false);
        setNewCondition({ name: "", description: "", operator: "", isEnabled: true });
        mutateConditions();
      } else {
        toast.error(t("common.error", "Error creating condition"));
      }
    } catch {
      toast.error(t("common.error", "Error creating condition"));
    }
  };

  const handleUpdateCondition = async (id: string, updates: Partial<ConditionType>) => {
    try {
      const res = await fetch(`/api/automation/conditions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("common.success", "Condition updated"));
        setEditingCondition(null);
        mutateConditions();
      } else {
        toast.error(t("common.error", "Error updating condition"));
      }
    } catch {
      toast.error(t("common.error", "Error updating condition"));
    }
  };

  const handleDeleteCondition = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/conditions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Condition deleted"));
        mutateConditions();
      } else {
        toast.error(t("common.error", "Error deleting condition"));
      }
    } catch {
      toast.error(t("common.error", "Error deleting condition"));
    }
  };

  const handleCreateAction = async () => {
    try {
      const res = await fetch("/api/automation/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAction),
      });
      if (res.ok) {
        toast.success(t("common.success", "Action created"));
        setShowCreateAction(false);
        setNewAction({ name: "", description: "", type: "", isEnabled: true });
        mutateActions();
      } else {
        toast.error(t("common.error", "Error creating action"));
      }
    } catch {
      toast.error(t("common.error", "Error creating action"));
    }
  };

  const handleUpdateAction = async (id: string, updates: Partial<ActionType>) => {
    try {
      const res = await fetch(`/api/automation/actions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("common.success", "Action updated"));
        setEditingAction(null);
        mutateActions();
      } else {
        toast.error(t("common.error", "Error updating action"));
      }
    } catch {
      toast.error(t("common.error", "Error updating action"));
    }
  };

  const handleDeleteAction = async (id: string) => {
    try {
      const res = await fetch(`/api/automation/actions/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Action deleted"));
        mutateActions();
      } else {
        toast.error(t("common.error", "Error deleting action"));
      }
    } catch {
      toast.error(t("common.error", "Error deleting action"));
    }
  };

  const handleToggleAction = async (action: ActionType) => {
    await handleUpdateAction(action.id, { isEnabled: !action.isEnabled });
  };

  const handleSaveSettings = async (updates: Partial<AutomationSettings>) => {
    try {
      const res = await fetch("/api/automation/settings", {
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
      const res = await fetch("/api/automation/settings", {
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
      const res = await fetch(`/api/automation/queue/${id}`, { method: "DELETE" });
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
        fetch(`/api/automation/queue/${item.id}`, { method: "DELETE" })
      );
      await Promise.all(removals);
      toast.success(t("common.success", "Queue cleared"));
      setConfirmClearQueue(false);
      mutateQueue();
    } catch {
      toast.error(t("common.error", "Error clearing queue"));
    }
  };

  const handleClearRules = async () => {
    try {
      const removals = templates.map((tpl: AutomationTemplate) =>
        fetch(`/api/automation/templates/${tpl.id}`, { method: "DELETE" })
      );
      await Promise.all(removals);
      toast.success(t("common.success", "All templates cleared"));
      setConfirmClearRules(false);
      mutateTemplates();
      mutateStats();
    } catch {
      toast.error(t("common.error", "Error clearing templates"));
    }
  };

  const handleResetHistory = async () => {
    try {
      const removals = executions.map((e: Execution) =>
        fetch(`/api/automation/executions/${e.id}`, { method: "DELETE" })
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
        templates: templates.map((tpl: AutomationTemplate) => ({
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
        triggers: triggerTypes.map((tr: TriggerType) => ({
          name: tr.name,
          description: tr.description,
          type: tr.type,
          isEnabled: tr.isEnabled,
          config: tr.config,
        })),
        conditions: conditionTypes.map((c: ConditionType) => ({
          name: c.name,
          description: c.description,
          operator: c.operator,
          isEnabled: c.isEnabled,
          config: c.config,
        })),
        actions: actionTypes.map((a: ActionType) => ({
          name: a.name,
          description: a.description,
          type: a.type,
          isEnabled: a.isEnabled,
          config: a.config,
        })),
        exportedAt: new Date().toISOString(),
      };
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `automation-export-${new Date().toISOString().slice(0, 10)}.json`;
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
        await fetch("/api/automation/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data.settings),
        });
      }
      if (Array.isArray(data.templates)) {
        for (const tpl of data.templates) {
          await fetch("/api/automation/templates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tpl),
          });
        }
      }
      if (Array.isArray(data.triggers)) {
        for (const trigger of data.triggers) {
          await fetch("/api/automation/triggers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(trigger),
          });
        }
      }
      if (Array.isArray(data.conditions)) {
        for (const condition of data.conditions) {
          await fetch("/api/automation/conditions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(condition),
          });
        }
      }
      if (Array.isArray(data.actions)) {
        for (const action of data.actions) {
          await fetch("/api/automation/actions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action),
          });
        }
      }
      toast.success(t("common.success", "Configuration imported"));
      mutateTemplates();
      mutateTriggers();
      mutateConditions();
      mutateActions();
      mutateSettings();
    } catch {
      toast.error(t("common.error", "Invalid import file"));
    }
    event.target.value = "";
  };

  const isLoading = statsLoading || settingsLoading || templatesLoading || triggersLoading || conditionsLoading || actionsLoading || queueLoading || executionsLoading;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("automation.title", "Intelligent Automation Center") }]} />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("automation.title", "Intelligent Automation Center")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("automation.description", "Manage automation templates, triggers, conditions, actions, queue, executions, and settings")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshAll}>
              <RefreshCw className="mr-2 size-4" />
              {t("common.refresh", "Refresh")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 mb-6">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setSearch(""); setExecutionFilter("all"); }}
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
                      <h3 className="font-medium">{t("automation.newTemplate", "New Automation Template")}</h3>
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
                        <label className="text-xs font-medium text-muted-foreground">{t("automation.estimatedCredits", "Est. Credits")}</label>
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
                      <h3 className="font-medium">{t("automation.editTemplate", "Edit Template")}</h3>
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
                        <label className="text-xs font-medium text-muted-foreground">{t("automation.estimatedCredits", "Est. Credits")}</label>
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
                  keyExtractor={(tpl: AutomationTemplate) => tpl.id}
                  columns={[
                    {
                      key: "name",
                      header: t("common.name", "Name"),
                      sortable: true,
                      render: (item: AutomationTemplate) => <span className="text-sm font-medium">{item.name}</span>,
                    },
                    { key: "type", header: "Type", sortable: true, render: (item: AutomationTemplate) => <Badge tone="info">{item.type}</Badge> },
                    { key: "category", header: "Category", sortable: true, render: (item: AutomationTemplate) => item.category ? <Badge tone="purple">{item.category}</Badge> : <span className="text-muted-foreground text-xs">-</span> },
                    { key: "estimatedCredits", header: "Credits", sortable: true, render: (item: AutomationTemplate) => <span className="text-sm">{item.estimatedCredits ?? 0}</span> },
                    { key: "usageCount", header: "Usage", sortable: true, render: (item: AutomationTemplate) => <span className="text-sm">{item.usageCount ?? 0}</span> },
                    {
                      key: "isActive",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: AutomationTemplate) => (
                        <Badge tone={item.isActive ? "success" : "default"}>
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: AutomationTemplate) => (
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

            {activeTab === "triggers" && (
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
                  <Button size="sm" onClick={() => setShowCreateTrigger(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateTrigger && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("automation.newTrigger", "New Trigger Type")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateTrigger(false)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={newTrigger.name}
                          onChange={(e) => setNewTrigger((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Trigger name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.type", "Type")}</label>
                        <Input
                          value={newTrigger.type}
                          onChange={(e) => setNewTrigger((p) => ({ ...p, type: e.target.value }))}
                          placeholder="e.g. schedule, event, webhook"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={newTrigger.description}
                          onChange={(e) => setNewTrigger((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCreateTrigger(false)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={handleCreateTrigger} disabled={!newTrigger.name || !newTrigger.type}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {editingTrigger && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("automation.editTrigger", "Edit Trigger")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingTrigger(null)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={editingTrigger.name}
                          onChange={(e) => setEditingTrigger((p) => (p ? { ...p, name: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.type", "Type")}</label>
                        <Input
                          value={editingTrigger.type}
                          onChange={(e) => setEditingTrigger((p) => (p ? { ...p, type: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={editingTrigger.description ?? ""}
                          onChange={(e) => setEditingTrigger((p) => (p ? { ...p, description: e.target.value } : null))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingTrigger(null)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={() => editingTrigger && handleUpdateTrigger(editingTrigger.id, editingTrigger)}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                <AdminDataTable
                  data={filteredTriggers}
                  keyExtractor={(tr: TriggerType) => tr.id}
                  columns={[
                    {
                      key: "name",
                      header: t("common.name", "Name"),
                      sortable: true,
                      render: (item: TriggerType) => <span className="text-sm font-medium">{item.name}</span>,
                    },
                    { key: "type", header: "Type", sortable: true, render: (item: TriggerType) => <Badge tone="info">{item.type}</Badge> },
                    { key: "executionCount", header: "Executions", sortable: true, render: (item: TriggerType) => <span className="text-sm">{item.executionCount ?? 0}</span> },
                    {
                      key: "isEnabled",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: TriggerType) => (
                        <Badge tone={item.isEnabled ? "success" : "default"}>
                          {item.isEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: TriggerType) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleTrigger(item)}>
                            {item.isEnabled ? <Pause className="size-3" /> : <Play className="size-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingTrigger(item)}>
                            <Edit className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTrigger(item.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {activeTab === "conditions" && (
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
                  <Button size="sm" onClick={() => setShowCreateCondition(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateCondition && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("automation.newCondition", "New Condition Type")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateCondition(false)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={newCondition.name}
                          onChange={(e) => setNewCondition((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Condition name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("automation.operator", "Operator")}</label>
                        <Input
                          value={newCondition.operator}
                          onChange={(e) => setNewCondition((p) => ({ ...p, operator: e.target.value }))}
                          placeholder="e.g. equals, greater_than, contains"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={newCondition.description}
                          onChange={(e) => setNewCondition((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCreateCondition(false)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={handleCreateCondition} disabled={!newCondition.name || !newCondition.operator}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {editingCondition && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("automation.editCondition", "Edit Condition")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingCondition(null)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={editingCondition.name}
                          onChange={(e) => setEditingCondition((p) => (p ? { ...p, name: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("automation.operator", "Operator")}</label>
                        <Input
                          value={editingCondition.operator}
                          onChange={(e) => setEditingCondition((p) => (p ? { ...p, operator: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={editingCondition.description ?? ""}
                          onChange={(e) => setEditingCondition((p) => (p ? { ...p, description: e.target.value } : null))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingCondition(null)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={() => editingCondition && handleUpdateCondition(editingCondition.id, editingCondition)}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                <AdminDataTable
                  data={filteredConditions}
                  keyExtractor={(c: ConditionType) => c.id}
                  columns={[
                    {
                      key: "name",
                      header: t("common.name", "Name"),
                      sortable: true,
                      render: (item: ConditionType) => <span className="text-sm font-medium">{item.name}</span>,
                    },
                    { key: "operator", header: "Operator", sortable: true, render: (item: ConditionType) => <Badge tone="purple">{item.operator}</Badge> },
                    { key: "usageCount", header: "Usage", sortable: true, render: (item: ConditionType) => <span className="text-sm">{item.usageCount ?? 0}</span> },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: ConditionType) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditingCondition(item)}>
                            <Edit className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCondition(item.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {activeTab === "actions" && (
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
                  <Button size="sm" onClick={() => setShowCreateAction(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateAction && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("automation.newAction", "New Action Type")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateAction(false)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={newAction.name}
                          onChange={(e) => setNewAction((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Action name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.type", "Type")}</label>
                        <Input
                          value={newAction.type}
                          onChange={(e) => setNewAction((p) => ({ ...p, type: e.target.value }))}
                          placeholder="e.g. send-email, update-record, notify"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={newAction.description}
                          onChange={(e) => setNewAction((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Optional description"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCreateAction(false)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={handleCreateAction} disabled={!newAction.name || !newAction.type}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {editingAction && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("automation.editAction", "Edit Action")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingAction(null)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={editingAction.name}
                          onChange={(e) => setEditingAction((p) => (p ? { ...p, name: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.type", "Type")}</label>
                        <Input
                          value={editingAction.type}
                          onChange={(e) => setEditingAction((p) => (p ? { ...p, type: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={editingAction.description ?? ""}
                          onChange={(e) => setEditingAction((p) => (p ? { ...p, description: e.target.value } : null))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingAction(null)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={() => editingAction && handleUpdateAction(editingAction.id, editingAction)}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                <AdminDataTable
                  data={filteredActions}
                  keyExtractor={(a: ActionType) => a.id}
                  columns={[
                    {
                      key: "name",
                      header: t("common.name", "Name"),
                      sortable: true,
                      render: (item: ActionType) => <span className="text-sm font-medium">{item.name}</span>,
                    },
                    { key: "type", header: "Type", sortable: true, render: (item: ActionType) => <Badge tone="info">{item.type}</Badge> },
                    { key: "executionCount", header: "Executions", sortable: true, render: (item: ActionType) => <span className="text-sm">{item.executionCount ?? 0}</span> },
                    {
                      key: "isEnabled",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: ActionType) => (
                        <Badge tone={item.isEnabled ? "success" : "default"}>
                          {item.isEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: ActionType) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleAction(item)}>
                            {item.isEnabled ? <Pause className="size-3" /> : <Play className="size-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingAction(item)}>
                            <Edit className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteAction(item.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
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
                          <p className="text-xs text-muted-foreground">{t("automation.totalQueued", "Total Queued")}</p>
                          <p className="mt-1 text-2xl font-semibold">{stats.queue.total}</p>
                        </div>
                      </div>
                    </DashboardCard>
                    <DashboardCard>
                      <div className="flex items-center gap-3">
                        <Clock className="size-5 text-amber-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("automation.waiting", "Waiting")}</p>
                          <p className="mt-1 text-2xl font-semibold">{stats.queue.waiting}</p>
                        </div>
                      </div>
                    </DashboardCard>
                    <DashboardCard>
                      <div className="flex items-center gap-3">
                        <Activity className="size-5 text-green-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("automation.processing", "Processing")}</p>
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
                        {t("automation.confirmClearQueue", "Confirm Clear")}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="destructive" size="sm" onClick={() => setConfirmClearQueue(true)} disabled={queueItems.length === 0}>
                      <Trash className="mr-2 size-4" />
                      {t("automation.clearQueue", "Clear Queue")}
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

            {activeTab === "executions" && (
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
                  <select
                    value={executionFilter}
                    onChange={(e) => setExecutionFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="running">Running</option>
                    <option value="pending">Pending</option>
                  </select>
                  <Button variant="outline" size="sm" onClick={() => { mutateExecutions(); mutateStats(); }}>
                    <RefreshCw className="mr-2 size-4" />
                    {t("common.refresh", "Refresh")}
                  </Button>
                </div>

                {stats?.executions && (
                  <div className="grid gap-4 sm:grid-cols-4">
                    <DashboardCard>
                      <div className="flex items-center gap-3">
                        <Activity className="size-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("automation.totalExecutions", "Total")}</p>
                          <p className="mt-1 text-2xl font-semibold">{stats.executions.total}</p>
                        </div>
                      </div>
                    </DashboardCard>
                    <DashboardCard>
                      <div className="flex items-center gap-3">
                        <div className="size-3 rounded-full bg-green-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("automation.completed", "Completed")}</p>
                          <p className="mt-1 text-2xl font-semibold">{stats.executions.completed}</p>
                        </div>
                      </div>
                    </DashboardCard>
                    <DashboardCard>
                      <div className="flex items-center gap-3">
                        <div className="size-3 rounded-full bg-red-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("automation.failed", "Failed")}</p>
                          <p className="mt-1 text-2xl font-semibold">{stats.executions.failed}</p>
                        </div>
                      </div>
                    </DashboardCard>
                    <DashboardCard>
                      <div className="flex items-center gap-3">
                        <div className="size-3 rounded-full bg-amber-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">{t("automation.running", "Running")}</p>
                          <p className="mt-1 text-2xl font-semibold">{stats.executions.running}</p>
                        </div>
                      </div>
                    </DashboardCard>
                  </div>
                )}

                {selectedExecution && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("automation.executionDetails", "Execution Details")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedExecution(null)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">ID</span>
                          <span className="font-mono text-xs">{selectedExecution.id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rule ID</span>
                          <span className="font-mono text-xs">{selectedExecution.ruleId}</span>
                        </div>
                        {selectedExecution.templateId && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Template ID</span>
                            <span className="font-mono text-xs">{selectedExecution.templateId}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status</span>
                          <Badge tone={selectedExecution.status === "completed" ? "success" : selectedExecution.status === "failed" ? "warning" : "info"}>
                            {selectedExecution.status}
                          </Badge>
                        </div>
                        {selectedExecution.triggerType && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Trigger</span>
                            <Badge tone="purple">{selectedExecution.triggerType}</Badge>
                          </div>
                        )}
                        {selectedExecution.creditsUsed != null && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Credits Used</span>
                            <span>{selectedExecution.creditsUsed}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedExecution.error && (
                      <div className="rounded-lg bg-destructive/10 p-3">
                        <p className="text-xs font-medium text-destructive mb-1">Error</p>
                        <p className="text-sm text-muted-foreground font-mono">{selectedExecution.error}</p>
                      </div>
                    )}
                  </div>
                )}

                <AdminDataTable
                  data={filteredExecutions}
                  keyExtractor={(e: Execution) => e.id}
                  columns={[
                    { key: "id", header: "ID", sortable: true, render: (item: Execution) => <span className="text-sm font-mono">{item.id.slice(0, 8)}...</span> },
                    { key: "ruleId", header: "Rule", sortable: true, render: (item: Execution) => <span className="text-sm font-mono">{item.ruleId.slice(0, 8)}...</span> },
                    { key: "triggerType", header: "Trigger", sortable: true, render: (item: Execution) => item.triggerType ? <Badge tone="purple">{item.triggerType}</Badge> : <span className="text-muted-foreground text-xs">-</span> },
                    { key: "creditsUsed", header: "Credits", sortable: true, render: (item: Execution) => <span className="text-sm">{item.creditsUsed ?? 0}</span> },
                    {
                      key: "status",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: Execution) => (
                        <Badge tone={item.status === "completed" ? "success" : item.status === "failed" ? "warning" : item.status === "running" ? "info" : "default"}>
                          {item.status}
                        </Badge>
                      ),
                    },
                    {
                      key: "createdAt",
                      header: "Created",
                      sortable: true,
                      render: (item: Execution) => item.createdAt ? (
                        <span className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      ),
                    },
                    {
                      key: "actions",
                      header: "",
                      render: (item: Execution) => (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedExecution(item)}>
                          <ChevronRight className="size-3" />
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
                      <Activity className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("automation.totalExecutions", "Total Executions")}</p>
                        <p className="mt-1 text-2xl font-semibold">{stats?.executions?.total ?? executions.length}</p>
                      </div>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="flex items-center gap-3">
                      <Zap className="size-5 text-amber-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("automation.creditsConsumed", "Credits Consumed")}</p>
                        <p className="mt-1 text-2xl font-semibold">{totalCreditsUsed}</p>
                      </div>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="flex items-center gap-3">
                      <div className="size-3 rounded-full bg-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("automation.successRate", "Success Rate")}</p>
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
                        <p className="text-xs text-muted-foreground">{t("automation.failureRate", "Failure Rate")}</p>
                        <p className="mt-1 text-2xl font-semibold">
                          {executions.length > 0
                            ? `${Math.round((failedExecutions / executions.length) * 100)}%`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </DashboardCard>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DashboardCard>
                    <div className="flex items-center gap-3">
                      <Layers className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("automation.totalTemplates", "Templates")}</p>
                        <p className="mt-1 text-2xl font-semibold">{stats?.templates?.total ?? templates.length}</p>
                      </div>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="flex items-center gap-3">
                      <Zap className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("automation.activeTriggers", "Active Triggers")}</p>
                        <p className="mt-1 text-2xl font-semibold">{stats?.triggers?.enabled ?? 0}</p>
                      </div>
                    </div>
                  </DashboardCard>
                  <DashboardCard>
                    <div className="flex items-center gap-3">
                      <Target className="size-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("automation.activeActions", "Active Actions")}</p>
                        <p className="mt-1 text-2xl font-semibold">{stats?.actions?.enabled ?? 0}</p>
                      </div>
                    </div>
                  </DashboardCard>
                </div>

                {mostUsedRules.length > 0 && (
                  <DashboardCard title={t("automation.mostUsedRules", "Most Used Rules")}>
                    <div className="space-y-2">
                      {mostUsedRules.map(({ ruleId, count }, index) => (
                        <div
                          key={ruleId}
                          className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-5">#{index + 1}</span>
                            <span className="text-sm font-mono">{ruleId.slice(0, 12)}...</span>
                          </div>
                          <span className="text-sm font-medium">{count} executions</span>
                        </div>
                      ))}
                    </div>
                  </DashboardCard>
                )}
              </div>
            )}

            {activeTab === "featureFlags" && (
              <div className="space-y-4">
                <DashboardCard title={t("automation.featureFlags", "Feature Flags")}>
                  <div className="space-y-4">
                    {([
                      {
                        key: "autoRetry" as const,
                        label: "Auto-Retry",
                        desc: "Automatically retry failed automation tasks based on configured retry policy",
                      },
                      {
                        key: "notificationsEnabled" as const,
                        label: "Notifications",
                        desc: "Send notifications on automation completion, failure, and queue events",
                      },
                      {
                        key: "smartAutomation" as const,
                        label: "Smart Automation",
                        desc: "Use AI-powered optimization for trigger routing, condition evaluation, and action scheduling",
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

                <DashboardCard title={t("automation.executionLimits", "Execution Limits")}>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("automation.maxConcurrent", "Max Concurrent Executions")}</label>
                        <Input
                          type="number"
                          value={settings.maxConcurrentExecutions}
                          onChange={(e) => handleSaveSettings({ maxConcurrentExecutions: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("automation.maxQueueSize", "Max Queue Size")}</label>
                        <Input
                          type="number"
                          value={settings.maxQueueSize}
                          onChange={(e) => handleSaveSettings({ maxQueueSize: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("automation.maxRetries", "Max Retries")}</label>
                        <Input
                          type="number"
                          value={settings.maxRetries}
                          onChange={(e) => handleSaveSettings({ maxRetries: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("automation.creditWarningThreshold", "Credit Warning Threshold")}</label>
                        <Input
                          type="number"
                          value={settings.creditWarningThreshold}
                          onChange={(e) => handleSaveSettings({ creditWarningThreshold: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("automation.defaultPriority", "Default Priority")}</label>
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

            {activeTab === "maintenance" && (
              <div className="space-y-4">
                <DashboardCard title={t("automation.exportImport", "Export & Import")}>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t("automation.exportConfig", "Export Configuration")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("automation.exportConfigDesc", "Download settings, templates, triggers, conditions, and actions as a JSON file")}
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
                          <h3 className="font-medium">{t("automation.importConfig", "Import Configuration")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("automation.importConfigDesc", "Restore settings, templates, triggers, conditions, and actions from a backup file")}
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

                <DashboardCard title={t("automation.resetOperations", "Reset Operations")}>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t("automation.resetHistory", "Reset Execution History")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("automation.resetHistoryDesc", "Clear all execution records and logs")}
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
                              {t("automation.confirmReset", "Confirm Reset")}
                            </Button>
                          </div>
                        ) : (
                          <Button variant="destructive" size="sm" onClick={() => setConfirmResetHistory(true)}>
                            <RotateCcw className="mr-2 size-4" />
                            {t("automation.resetHistory", "Reset History")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard title={t("automation.dangerZone", "Danger Zone")}>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-destructive">{t("automation.clearAllRules", "Clear All Rules")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("automation.clearAllRulesDesc", "Permanently delete all automation templates and rules")}
                          </p>
                        </div>
                        {confirmClearRules ? (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setConfirmClearRules(false)}>
                              <X className="mr-2 size-4" />
                              {t("common.cancel", "Cancel")}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleClearRules}>
                              <Trash className="mr-2 size-4" />
                              {t("automation.confirmClear", "Confirm Clear")}
                            </Button>
                          </div>
                        ) : (
                          <Button variant="destructive" size="sm" onClick={() => setConfirmClearRules(true)}>
                            <Trash className="mr-2 size-4" />
                            {t("automation.clearAllRules", "Clear All Rules")}
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
