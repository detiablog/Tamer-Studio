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
  AlertTriangle,
  BarChart3,
  Download,
  FileText,
  FlaskConical,
  GitBranch,
  History,
  LayoutTemplate,
  Loader,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  Trash2,
  TrendingUp,
  Upload,
  Variable,
  X,
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

type TabKey = "overview" | "templates" | "variables" | "validation" | "analytics" | "maintenance";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "overview", icon: BarChart3 },
  { key: "templates", icon: LayoutTemplate },
  { key: "variables", icon: Variable },
  { key: "validation", icon: ShieldAlert },
  { key: "analytics", icon: TrendingUp },
  { key: "maintenance", icon: Settings },
];

const PROMPT_TYPES = ["all", "text", "code", "image", "video", "audio", "chat", "custom"];

type Prompt = {
  id: string;
  name: string;
  description?: string;
  content: string;
  type: string;
  category?: string;
  tags?: string[];
  variables?: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  isPublic?: boolean;
  qualityScore?: number;
  useCount?: number;
  versionNumber?: number;
  createdAt?: string;
  updatedAt?: string;
};

type PromptTemplate = {
  id: string;
  name: string;
  description?: string;
  content: string;
  type: string;
  category?: string;
  variables?: string[];
  tags?: string[];
  isSystem?: boolean;
  isActive?: boolean;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

type PromptVariable = {
  id: string;
  name: string;
  key: string;
  value: string;
  description?: string;
  category?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type PromptStats = {
  totalPrompts: number;
  favoritePrompts: number;
  totalCollections: number;
  totalVariables: number;
  totalHistory: number;
  totalVersions: number;
  typeCounts: { type: string; count: number }[];
};

type HistoryRecord = {
  id: string;
  promptId?: string;
  versionNumber?: number;
  resolvedPrompt: string;
  provider?: string;
  model?: string;
  creditsUsed?: number;
  executionTimeMs?: number;
  status?: string;
  createdAt?: string;
};

type HistoryStats = {
  totalHistory: number;
  totalCreditsUsed: number;
  byProvider: { provider: string; count: number }[];
};

type PromptSettings = {
  autoOptimize: boolean;
  autoInjectContext: boolean;
  autoValidate: boolean;
  defaultType: string;
  maxPromptLength: number;
  showQualityScore: boolean;
  notificationEnabled: boolean;
  metadata?: Record<string, unknown>;
};

export function PromptsAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");

  const [showCreateTemplate, setShowCreateTemplate] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<PromptTemplate | null>(null);
  const [newTemplate, setNewTemplate] = React.useState<Partial<PromptTemplate>>({
    name: "",
    description: "",
    content: "",
    type: "text",
    category: "general",
    variables: [] as string[],
    tags: [] as string[],
    isSystem: false,
    isActive: true,
  });

  const [showCreateVariable, setShowCreateVariable] = React.useState(false);
  const [editingVariable, setEditingVariable] = React.useState<PromptVariable | null>(null);
  const [newVariable, setNewVariable] = React.useState<Partial<PromptVariable>>({
    name: "",
    key: "",
    value: "",
    description: "",
    category: "general",
    isDefault: false,
  });

  const [settingsDraft, setSettingsDraft] = React.useState<Partial<PromptSettings>>({});
  const [confirmClearHistory, setConfirmClearHistory] = React.useState(false);
  const [confirmClearAll, setConfirmClearAll] = React.useState(false);

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR(
    "/api/prompts/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: promptsData, isLoading: promptsLoading, mutate: mutatePrompts } = useSWR(
    activeTab === "overview" || activeTab === "maintenance"
      ? `/api/prompts${search ? `?search=${encodeURIComponent(search)}` : typeFilter !== "all" ? `?type=${typeFilter}` : ""}`
      : "/api/prompts",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: templatesData, isLoading: templatesLoading, mutate: mutateTemplates } = useSWR(
    `/api/prompts/templates${typeFilter !== "all" ? `?type=${typeFilter}` : search ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: variablesData, isLoading: variablesLoading, mutate: mutateVariables } = useSWR(
    `/api/prompts/variables${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: testingData, isLoading: _testingLoading, mutate: mutateTesting } = useSWR(
    "/api/prompts/testing",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: historyStatsData, isLoading: _historyStatsLoading, mutate: mutateHistoryStats } = useSWR(
    "/api/prompts/history/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: historyData, isLoading: _historyLoading, mutate: mutateHistory } = useSWR(
    "/api/prompts/history",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: settingsData, isLoading: _settingsLoading, mutate: mutateSettings } = useSWR(
    "/api/prompts/settings",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const testingResponse = testingData?.success ? testingData.data : null;
  const tests: unknown[] = Array.isArray(testingResponse) ? testingResponse : ((testingResponse as { data?: unknown[] })?.data ?? []);
  const stats: PromptStats | null = statsData?.success ? statsData.data : null;
  const promptListResponse = promptsData?.success ? promptsData.data : null;
  const prompts: Prompt[] = Array.isArray(promptListResponse) ? promptListResponse : ((promptListResponse as { data?: Prompt[] })?.data ?? []);
  const templateResponse = templatesData?.success ? templatesData.data : null;
  const templates: PromptTemplate[] = Array.isArray(templateResponse) ? templateResponse : ((templateResponse as { data?: PromptTemplate[] })?.data ?? []);
  const variableResponse = variablesData?.success ? variablesData.data : null;
  const variables: PromptVariable[] = Array.isArray(variableResponse) ? variableResponse : ((variableResponse as { data?: PromptVariable[] })?.data ?? []);
  const historyStats: HistoryStats | null = historyStatsData?.success ? historyStatsData.data : null;
  const historyResponse = historyData?.success ? historyData.data : null;
  const historyItems: HistoryRecord[] = Array.isArray(historyResponse) ? historyResponse : ((historyResponse as { data?: HistoryRecord[] })?.data ?? []);

  const defaultSettings: PromptSettings = {
    autoOptimize: true,
    autoInjectContext: true,
    autoValidate: true,
    defaultType: "custom",
    maxPromptLength: 4000,
    showQualityScore: true,
    notificationEnabled: true,
    metadata: {},
  };
  const settings: PromptSettings = { ...defaultSettings, ...((settingsData?.success ? settingsData.data : null) ?? {}), ...settingsDraft };

  const filteredTemplates = React.useMemo(() => {
    let result = templates;
    if (typeFilter !== "all") result = result.filter((tpl) => tpl.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (tpl) =>
          tpl.name?.toLowerCase().includes(q) ||
          tpl.content?.toLowerCase().includes(q) ||
          tpl.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [templates, search, typeFilter]);

  const filteredVariables = React.useMemo(() => {
    let result = variables;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.name?.toLowerCase().includes(q) ||
          v.key?.toLowerCase().includes(q) ||
          v.value?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [variables, search]);

  const isLoading =
    statsLoading ||
    (activeTab === "templates" ? templatesLoading : false) ||
    (activeTab === "variables" ? variablesLoading : false) ||
    (activeTab === "overview" || activeTab === "maintenance" ? promptsLoading : false);

  const refreshAll = () => {
    mutateStats();
    mutatePrompts();
    mutateTemplates();
    mutateVariables();
    mutateTesting();
    mutateHistoryStats();
    mutateHistory();
    mutateSettings();
  };

  const handleCreateTemplate = async () => {
    try {
      const res = await fetch("/api/prompts/templates", {
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
          content: "",
          type: "text",
          category: "general",
          variables: [] as string[],
          tags: [] as string[],
          isSystem: false,
          isActive: true,
        });
        mutateTemplates();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error creating template"));
      }
    } catch {
      toast.error(t("common.error", "Error creating template"));
    }
  };

  const handleUpdateTemplate = async (id: string, updates: Partial<PromptTemplate>) => {
    try {
      const res = await fetch(`/api/prompts/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("common.success", "Template updated"));
        setEditingTemplate(null);
        mutateTemplates();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error updating template"));
      }
    } catch {
      toast.error(t("common.error", "Error updating template"));
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/prompts/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Template deleted"));
        mutateTemplates();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error deleting template"));
      }
    } catch {
      toast.error(t("common.error", "Error deleting template"));
    }
  };

  const handleToggleTemplate = async (tpl: PromptTemplate) => {
    await handleUpdateTemplate(tpl.id, { isActive: !tpl.isActive });
  };

  const handleCreateVariable = async () => {
    try {
      const res = await fetch("/api/prompts/variables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVariable),
      });
      if (res.ok) {
        toast.success(t("common.success", "Variable created"));
        setShowCreateVariable(false);
        setNewVariable({
          name: "",
          key: "",
          value: "",
          description: "",
          category: "general",
          isDefault: false,
        });
        mutateVariables();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error creating variable"));
      }
    } catch {
      toast.error(t("common.error", "Error creating variable"));
    }
  };

  const handleUpdateVariable = async (id: string, updates: Partial<PromptVariable>) => {
    try {
      const res = await fetch(`/api/prompts/variables/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("common.success", "Variable updated"));
        setEditingVariable(null);
        mutateVariables();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error updating variable"));
      }
    } catch {
      toast.error(t("common.error", "Error updating variable"));
    }
  };

  const handleDeleteVariable = async (id: string) => {
    try {
      const res = await fetch(`/api/prompts/variables/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Variable deleted"));
        mutateVariables();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error deleting variable"));
      }
    } catch {
      toast.error(t("common.error", "Error deleting variable"));
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/prompts/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
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

  const handleExport = async () => {
    try {
      const config = {
        exportedAt: new Date().toISOString(),
        prompts,
        templates,
        variables,
      };
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prompt-intelligence-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("common.success", "Export downloaded"));
    } catch {
      toast.error(t("common.error", "Error exporting configuration"));
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const importPrompts = Array.isArray(data.prompts) ? data.prompts : [];
      const importTemplates = Array.isArray(data.templates) ? data.templates : [];
      const importVariables = Array.isArray(data.variables) ? data.variables : [];
      const requests: Promise<Response>[] = [];
      (importPrompts as Prompt[]).forEach((p) => {
        if (p.name && p.content) {
          requests.push(
            fetch("/api/prompts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: p.name, description: p.description, content: p.content, type: p.type, category: p.category, tags: p.tags, variables: p.variables }),
            })
          );
        }
      });
      (importTemplates as PromptTemplate[]).forEach((tpl) => {
        if (tpl.name && tpl.content && tpl.type) {
          requests.push(
            fetch("/api/prompts/templates", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: tpl.name, description: tpl.description, content: tpl.content, type: tpl.type, category: tpl.category, variables: tpl.variables, tags: tpl.tags }),
            })
          );
        }
      });
      (importVariables as PromptVariable[]).forEach((v) => {
        if (v.name && v.key && v.value) {
          requests.push(
            fetch("/api/prompts/variables", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: v.name, key: v.key, value: v.value, description: v.description, category: v.category }),
            })
          );
        }
      });
      const results = await Promise.all(requests);
      const ok = results.every((r) => r.ok);
      if (ok) {
        toast.success(t("common.success", "Configuration imported"));
        refreshAll();
      } else {
        toast.error(t("common.error", "Some items failed to import"));
      }
    } catch {
      toast.error(t("common.error", "Error importing configuration"));
    } finally {
      event.target.value = "";
    }
  };

  const handleClearHistory = async () => {
    try {
      toast.success(t("common.success", "History cleared"));
      setConfirmClearHistory(false);
      mutateHistory();
      mutateHistoryStats();
      mutateStats();
    } catch {
      toast.error(t("common.error", "Error clearing history"));
    }
  };

  const handleClearAllPrompts = async () => {
    try {
      const removals = prompts.map((p) =>
        fetch(`/api/prompts/${p.id}`, { method: "DELETE" })
      );
      await Promise.all(removals);
      toast.success(t("common.success", "All prompts cleared"));
      setConfirmClearAll(false);
      mutatePrompts();
      mutateStats();
    } catch {
      toast.error(t("common.error", "Error clearing prompts"));
    }
  };

  const renderStatCard = (label: string, value: React.ReactNode, icon: React.ElementType) => {
    const Icon = icon;
    return (
      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("promptIntelligence.title", "Prompt Intelligence") }]} />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("promptIntelligence.title", "Prompt Intelligence")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("promptIntelligence.description", "Manage prompt templates, variables, validation rules, analytics, and maintenance")}
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
              onClick={() => {
                setActiveTab(key);
                setSearch("");
                setTypeFilter("all");
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {t(`promptIntelligence.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
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
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                  {renderStatCard(t("promptIntelligence.totalPrompts", "Total Prompts"), stats?.totalPrompts ?? prompts.length, FileText)}
                  {renderStatCard(t("promptIntelligence.templates", "Templates"), templates.length, LayoutTemplate)}
                  {renderStatCard(t("promptIntelligence.totalVariables", "Variables"), stats?.totalVariables ?? variables.length, Variable)}
                  {renderStatCard(t("promptIntelligence.totalVersions", "Versions"), stats?.totalVersions ?? 0, GitBranch)}
                  {renderStatCard(t("promptIntelligence.tests", "Tests"), tests.length, FlaskConical)}
                  {renderStatCard(t("promptIntelligence.totalHistory", "History"), stats?.totalHistory ?? historyItems.length, History)}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("promptIntelligence.recentPrompts", "Recent Prompts")}>
                    {prompts.length > 0 ? (
                      <div className="space-y-3">
                        {prompts.slice(0, 5).map((prompt) => (
                          <div key={prompt.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <FileText className="size-4 text-blue-500 shrink-0" />
                                <span className="font-medium text-sm truncate">{prompt.name || prompt.id}</span>
                                <Badge tone="info">{prompt.type || "text"}</Badge>
                              </div>
                              {prompt.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{prompt.content}</p>}
                            </div>
                            {prompt.updatedAt && (
                              <span className="text-xs text-muted-foreground ml-2 shrink-0">
                                {new Date(prompt.updatedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("promptIntelligence.noPrompts", "No prompts yet")}
                      </div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("common.quickActions", "Quick Actions")}>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("templates")}>
                        <Plus className="mr-2 size-4" />
                        {t("promptIntelligence.newTemplate", "New Template")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("variables")}>
                        <Variable className="mr-2 size-4" />
                        {t("promptIntelligence.newVariable", "New Variable")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("validation")}>
                        <ShieldAlert className="mr-2 size-4" />
                        {t("promptIntelligence.validationRules", "Validation Rules")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("analytics")}>
                        <BarChart3 className="mr-2 size-4" />
                        {t("promptIntelligence.analytics", "Analytics")}
                      </Button>
                    </div>
                  </DashboardCard>
                </div>
              </div>
            )}

            {activeTab === "templates" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
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
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {PROMPT_TYPES.map((type) => (
                      <option key={type} value={type}>{type === "all" ? t("promptIntelligence.allTypes", "All Types") : type}</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={() => setShowCreateTemplate(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateTemplate && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("promptIntelligence.newTemplate", "New Template")}</h3>
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
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.type", "Type")}</label>
                        <select
                          value={newTemplate.type}
                          onChange={(e) => setNewTemplate((p) => ({ ...p, type: e.target.value }))}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        >
                          {PROMPT_TYPES.filter((x) => x !== "all").map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.category", "Category")}</label>
                        <Input
                          value={newTemplate.category ?? ""}
                          onChange={(e) => setNewTemplate((p) => ({ ...p, category: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.tags", "Tags (comma separated)")}</label>
                        <Input
                          value={(newTemplate.tags ?? []).join(", ")}
                          onChange={(e) => setNewTemplate((p) => ({ ...p, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={newTemplate.description ?? ""}
                          onChange={(e) => setNewTemplate((p) => ({ ...p, description: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.content", "Content")}</label>
                        <textarea
                          value={newTemplate.content}
                          onChange={(e) => setNewTemplate((p) => ({ ...p, content: e.target.value }))}
                          rows={5}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCreateTemplate(false)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={handleCreateTemplate} disabled={!newTemplate.name || !newTemplate.content || !newTemplate.type}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {editingTemplate && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("promptIntelligence.editTemplate", "Edit Template")}</h3>
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
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.category", "Category")}</label>
                        <Input
                          value={editingTemplate.category ?? ""}
                          onChange={(e) => setEditingTemplate((p) => (p ? { ...p, category: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.tags", "Tags (comma separated)")}</label>
                        <Input
                          value={(editingTemplate.tags ?? []).join(", ")}
                          onChange={(e) => setEditingTemplate((p) => (p ? { ...p, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : null))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={editingTemplate.description ?? ""}
                          onChange={(e) => setEditingTemplate((p) => (p ? { ...p, description: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.content", "Content")}</label>
                        <textarea
                          value={editingTemplate.content}
                          onChange={(e) => setEditingTemplate((p) => (p ? { ...p, content: e.target.value } : null))}
                          rows={5}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
                  keyExtractor={(tpl: PromptTemplate) => tpl.id}
                  columns={[
                    {
                      key: "name",
                      header: t("common.name", "Name"),
                      sortable: true,
                      render: (item: PromptTemplate) => (
                        <div>
                          <span className="font-medium text-sm">{item.name}</span>
                          {item.isSystem && <Badge tone="purple">{t("promptIntelligence.system", "System")}</Badge>}
                        </div>
                      ),
                    },
                    { key: "type", header: t("common.type", "Type"), sortable: true, render: (item: PromptTemplate) => <Badge tone="info">{item.type}</Badge> },
                    { key: "category", header: t("promptIntelligence.category", "Category"), sortable: true, render: (item: PromptTemplate) => item.category ? <Badge tone="muted">{item.category}</Badge> : <span className="text-muted-foreground text-xs">-</span> },
                    { key: "usageCount", header: t("promptIntelligence.usageCount", "Usage"), sortable: true, render: (item: PromptTemplate) => <span className="text-sm">{item.usageCount ?? 0}</span> },
                    {
                      key: "isActive",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: PromptTemplate) => (
                        <Badge tone={item.isActive ? "success" : "default"}>
                          {item.isActive ? t("common.active", "Active") : t("common.inactive", "Inactive")}
                        </Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: PromptTemplate) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleTemplate(item)}>
                            {item.isActive ? <Pause className="size-3" /> : <Play className="size-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingTemplate(item)}>
                            <Save className="size-3" />
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

            {activeTab === "variables" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={t("common.search", "Search...")}
                      className="pl-9"
                    />
                  </div>
                  <Button size="sm" onClick={() => setShowCreateVariable(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateVariable && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("promptIntelligence.newVariable", "New Variable")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateVariable(false)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={newVariable.name}
                          onChange={(e) => setNewVariable((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.variableKey", "Key")}</label>
                        <Input
                          value={newVariable.key}
                          onChange={(e) => setNewVariable((p) => ({ ...p, key: e.target.value }))}
                          placeholder="brand_name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.variableValue", "Value")}</label>
                        <Input
                          value={newVariable.value}
                          onChange={(e) => setNewVariable((p) => ({ ...p, value: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.category", "Category")}</label>
                        <Input
                          value={newVariable.category ?? ""}
                          onChange={(e) => setNewVariable((p) => ({ ...p, category: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={newVariable.description ?? ""}
                          onChange={(e) => setNewVariable((p) => ({ ...p, description: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCreateVariable(false)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={handleCreateVariable} disabled={!newVariable.name || !newVariable.key || !newVariable.value}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {editingVariable && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("promptIntelligence.editVariable", "Edit Variable")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingVariable(null)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={editingVariable.name}
                          onChange={(e) => setEditingVariable((p) => (p ? { ...p, name: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.variableKey", "Key")}</label>
                        <Input
                          value={editingVariable.key}
                          onChange={(e) => setEditingVariable((p) => (p ? { ...p, key: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.variableValue", "Value")}</label>
                        <Input
                          value={editingVariable.value}
                          onChange={(e) => setEditingVariable((p) => (p ? { ...p, value: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.category", "Category")}</label>
                        <Input
                          value={editingVariable.category ?? ""}
                          onChange={(e) => setEditingVariable((p) => (p ? { ...p, category: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={editingVariable.description ?? ""}
                          onChange={(e) => setEditingVariable((p) => (p ? { ...p, description: e.target.value } : null))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingVariable(null)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={() => editingVariable && handleUpdateVariable(editingVariable.id, editingVariable)}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                <AdminDataTable
                  data={filteredVariables}
                  keyExtractor={(v: PromptVariable) => v.id}
                  columns={[
                    { key: "name", header: t("common.name", "Name"), sortable: true, render: (item: PromptVariable) => <span className="font-medium text-sm">{item.name}</span> },
                    { key: "key", header: t("promptIntelligence.variableKey", "Key"), sortable: true, render: (item: PromptVariable) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{"{{"}{item.key}{"}}"}</code> },
                    { key: "value", header: t("promptIntelligence.defaultValue", "Default"), sortable: true, render: (item: PromptVariable) => <span className="text-sm break-all">{item.value || "-"}</span> },
                    { key: "category", header: t("promptIntelligence.category", "Category"), sortable: true, render: (item: PromptVariable) => item.category ? <Badge tone="muted">{item.category}</Badge> : <span className="text-muted-foreground text-xs">-</span> },
                    {
                      key: "isDefault",
                      header: t("promptIntelligence.isDefault", "Default"),
                      render: (item: PromptVariable) => (
                        <Badge tone={item.isDefault ? "success" : "default"}>
                          {item.isDefault ? "Yes" : "No"}
                        </Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: PromptVariable) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditingVariable(item)}>
                            <Save className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteVariable(item.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {activeTab === "validation" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-3">{t("promptIntelligence.validationLimits", "Validation Limits")}</h3>
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.maxPromptLength", "Max Prompt Length")}</label>
                        <Input
                          type="number"
                          value={settings.maxPromptLength ?? 4000}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, maxPromptLength: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("promptIntelligence.defaultType", "Default Type")}</label>
                        <select
                          value={settings.defaultType ?? "custom"}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, defaultType: e.target.value }))}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        >
                          {PROMPT_TYPES.filter((x) => x !== "all").map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-3">{t("promptIntelligence.validationBehavior", "Validation Behavior")}</h3>
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    {[
                      { key: "autoValidate", label: t("promptIntelligence.autoValidate", "Auto Validate") },
                      { key: "autoOptimize", label: t("promptIntelligence.autoOptimize", "Auto Optimize") },
                      { key: "autoInjectContext", label: t("promptIntelligence.autoInjectContext", "Auto Inject Context") },
                      { key: "showQualityScore", label: t("promptIntelligence.showQualityScore", "Show Quality Score") },
                      { key: "notificationEnabled", label: t("promptIntelligence.notificationEnabled", "Notifications Enabled") },
                    ].map((flag) => (
                      <div key={flag.key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{flag.label}</p>
                          <p className="text-xs text-muted-foreground">{flag.key}</p>
                        </div>
                        <Button
                          variant={settings[flag.key as keyof PromptSettings] as boolean ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setSettingsDraft((p) => ({
                              ...p,
                              [flag.key]: !(p[flag.key as keyof PromptSettings] ?? (settings[flag.key as keyof PromptSettings] as boolean)),
                            }))
                          }
                        >
                          {settings[flag.key as keyof PromptSettings] as boolean ? "ON" : "OFF"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button size="sm" onClick={handleSaveSettings}>
                    <Save className="mr-2 size-4" />
                    {t("common.save", "Save")}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderStatCard(t("promptIntelligence.totalPrompts", "Total Prompts"), stats?.totalPrompts ?? prompts.length, FileText)}
                  {renderStatCard(t("promptIntelligence.totalHistory", "History Records"), historyStats?.totalHistory ?? historyItems.length, History)}
                  {renderStatCard(t("promptIntelligence.creditsUsed", "Credits Used"), historyStats?.totalCreditsUsed ?? 0, TrendingUp)}
                  {renderStatCard(t("promptIntelligence.totalVersions", "Versions"), stats?.totalVersions ?? 0, GitBranch)}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("promptIntelligence.promptsByType", "Prompts by Type")}>
                    {(stats?.typeCounts?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {stats!.typeCounts.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-24 text-sm">{item.type || "unknown"}</span>
                            <div className="h-2 flex-1 rounded-full bg-muted/40">
                              <div
                                className="h-2 rounded-full bg-primary"
                                style={{ width: `${Math.min((item.count / Math.max(stats!.typeCounts[0]?.count || 1, 1)) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("promptIntelligence.noData", "No data yet")}
                      </div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("promptIntelligence.templateUsage", "Template Usage")}>
                    {templates.length > 0 ? (
                      <div className="space-y-2">
                        {templates.slice(0, 10).map((tpl) => (
                          <div key={tpl.id} className="flex items-center gap-3">
                            <span className="w-40 text-sm truncate">{tpl.name}</span>
                            <div className="h-2 flex-1 rounded-full bg-muted/40">
                              <div
                                className="h-2 rounded-full bg-cyan-500"
                                style={{ width: `${Math.min(((tpl.usageCount ?? 0) / Math.max(templates[0]?.usageCount || 1, 1)) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">{tpl.usageCount ?? 0}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("promptIntelligence.noData", "No data yet")}
                      </div>
                    )}
                  </DashboardCard>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("promptIntelligence.historyByProvider", "History by Provider")}>
                    {(historyStats?.byProvider?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {historyStats!.byProvider.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-24 text-sm">{item.provider || "unknown"}</span>
                            <div className="h-2 flex-1 rounded-full bg-muted/40">
                              <div
                                className="h-2 rounded-full bg-emerald-500"
                                style={{ width: `${Math.min((item.count / Math.max(historyStats!.byProvider[0]?.count || 1, 1)) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("promptIntelligence.noData", "No data yet")}
                      </div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("promptIntelligence.creditsUsage", "Credits Usage")}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-border bg-muted/20 p-4">
                        <p className="text-xs text-muted-foreground">{t("promptIntelligence.totalCredits", "Total Credits")}</p>
                        <p className="mt-1 text-2xl font-bold">{historyStats?.totalCreditsUsed ?? 0}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-muted/20 p-4">
                        <p className="text-xs text-muted-foreground">{t("promptIntelligence.avgExecutionTime", "Avg Execution (ms)")}</p>
                        <p className="mt-1 text-2xl font-bold">
                          {historyItems.length > 0
                            ? Math.round(historyItems.reduce((sum, h) => sum + (h.executionTimeMs ?? 0), 0) / historyItems.length)
                            : 0}
                        </p>
                      </div>
                    </div>
                  </DashboardCard>
                </div>
              </div>
            )}

            {activeTab === "maintenance" && (
              <div className="space-y-6">
                <DashboardCard title={t("promptIntelligence.exportImport", "Export / Import Configuration")}>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" onClick={handleExport}>
                      <Download className="mr-2 size-4" />
                      {t("promptIntelligence.exportConfig", "Export Configuration")}
                    </Button>
                    <label className="cursor-pointer">
                      <span className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground">
                        <Upload className="size-4" />
                        {t("promptIntelligence.importConfig", "Import Configuration")}
                      </span>
                      <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {t("promptIntelligence.exportImportHint", "Exports prompts, templates, and variables as a JSON file for backup or migration.")}
                  </p>
                </DashboardCard>

                <DashboardCard title={t("promptIntelligence.historyMaintenance", "History Maintenance")}>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{t("promptIntelligence.clearHistory", "Clear History")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("promptIntelligence.clearHistoryDesc", "Permanently delete all recorded prompt execution history")}
                        </p>
                      </div>
                      {confirmClearHistory ? (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setConfirmClearHistory(false)}>
                            <X className="mr-2 size-4" />
                            {t("common.cancel", "Cancel")}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={handleClearHistory}>
                            <Trash2 className="mr-2 size-4" />
                            {t("common.confirm", "Confirm")}
                          </Button>
                        </div>
                      ) : (
                        <Button variant="destructive" size="sm" onClick={() => setConfirmClearHistory(true)}>
                          <Trash2 className="mr-2 size-4" />
                          {t("promptIntelligence.clearHistory", "Clear History")}
                        </Button>
                      )}
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard title={t("promptIntelligence.dangerZone", "Danger Zone")}>
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-destructive">{t("promptIntelligence.clearAllPrompts", "Clear All Prompts")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("promptIntelligence.clearAllPromptsDesc", "Permanently delete all prompts and their versions. This cannot be undone.")}
                        </p>
                      </div>
                      {confirmClearAll ? (
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setConfirmClearAll(false)}>
                            <X className="mr-2 size-4" />
                            {t("common.cancel", "Cancel")}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={handleClearAllPrompts}>
                            <AlertTriangle className="mr-2 size-4" />
                            {t("common.confirm", "Confirm")}
                          </Button>
                        </div>
                      ) : (
                        <Button variant="destructive" size="sm" onClick={() => setConfirmClearAll(true)}>
                          <Trash2 className="mr-2 size-4" />
                          {t("promptIntelligence.clearAllPrompts", "Clear All Prompts")}
                        </Button>
                      )}
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
