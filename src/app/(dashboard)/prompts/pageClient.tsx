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
  LayoutDashboard,
  FileText,
  LayoutTemplate,
  Folder,
  Variable,
  GitBranch,
  FlaskConical,
  Sparkles,
  History,
  BarChart3,
  Plus,
  Search,
  Loader,
  Check,
  X,
  Eye,
  Trash2,
  RotateCcw,
  Star,
  Pin,
  Copy,
  RefreshCw,
  Send,
  ChevronRight,
  Bookmark,
  Wand2,
  TrendingUp,
  Layers,
  Boxes,
  CircleDollarSign,
  Pencil,
  Play,
  ArrowLeftRight,
  Activity,
  Clock,
  Tag,
  Filter,
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
  | "prompts"
  | "templates"
  | "collections"
  | "variables"
  | "versions"
  | "testing"
  | "optimization"
  | "history"
  | "analytics";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "dashboard", icon: LayoutDashboard },
  { key: "prompts", icon: FileText },
  { key: "templates", icon: LayoutTemplate },
  { key: "collections", icon: Folder },
  { key: "variables", icon: Variable },
  { key: "versions", icon: GitBranch },
  { key: "testing", icon: FlaskConical },
  { key: "optimization", icon: Sparkles },
  { key: "history", icon: History },
  { key: "analytics", icon: BarChart3 },
];

const PROMPT_TYPES = ["all", "text", "code", "image", "video", "audio", "chat", "custom"];
const PROMPT_CATEGORIES = ["all", "general", "content", "coding", "creative", "business", "education", "marketing"];
const COLLECTION_TAGS = ["all", "work", "personal", "project", "favorites"];
const VARIABLE_TYPES = ["text", "number", "boolean", "list"];

export function PromptsPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("dashboard");
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<any>({});
  const [formLoading, setFormLoading] = React.useState(false);

  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [showDetail, setShowDetail] = React.useState(false);

  const [versionsPromptId, setVersionsPromptId] = React.useState<string | null>(null);
  const [testPrompt, setTestPrompt] = React.useState("");
  const [testResults, setTestResults] = React.useState<any[]>([]);
  const [comparePrompt, setComparePrompt] = React.useState<string | null>(null);
  const [analyzeText, setAnalyzeText] = React.useState("");
  const [optimizeText, setOptimizeText] = React.useState("");
  const [analysis, setAnalysis] = React.useState<any>(null);
  const [optimization, setOptimization] = React.useState<any>(null);
  const [processing, setProcessing] = React.useState(false);

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR(
    "/api/prompts/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: promptsData, isLoading: promptsLoading, mutate: mutatePrompts } = useSWR(
    `/api/prompts${search && activeTab === "prompts" ? `?search=${encodeURIComponent(search)}` : typeFilter !== "all" && activeTab === "prompts" ? `?type=${typeFilter}` : categoryFilter !== "all" && activeTab === "prompts" ? `?category=${categoryFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: templatesData, isLoading: templatesLoading, mutate: mutateTemplates } = useSWR(
    `/api/prompts/templates${typeFilter !== "all" && activeTab === "templates" ? `?type=${typeFilter}` : search && activeTab === "templates" ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: collectionsData, isLoading: collectionsLoading, mutate: mutateCollections } = useSWR(
    "/api/prompts/collections",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: variablesData, isLoading: variablesLoading, mutate: mutateVariables } = useSWR(
    `/api/prompts/variables${search && activeTab === "variables" ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: versionsData, isLoading: versionsLoading, mutate: mutateVersions } = useSWR(
    versionsPromptId ? `/api/prompts/${versionsPromptId}/versions` : null,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: testingData, isLoading: testingLoading, mutate: mutateTesting } = useSWR(
    "/api/prompts/testing",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: historyData, isLoading: historyLoading, mutate: mutateHistory } = useSWR(
    `/api/prompts/history${search && activeTab === "history" ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: analyticsData, isLoading: analyticsLoading, mutate: mutateAnalytics } = useSWR(
    "/api/prompts/settings",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const stats = statsData?.success ? statsData.data : null;
  const prompts = promptsData?.success ? (Array.isArray(promptsData.data) ? promptsData.data : promptsData.data?.prompts ?? []) : [];
  const templates = templatesData?.success ? (Array.isArray(templatesData.data) ? templatesData.data : templatesData.data?.templates ?? []) : [];
  const collections = collectionsData?.success ? (Array.isArray(collectionsData.data) ? collectionsData.data : collectionsData.data?.collections ?? []) : [];
  const variables = variablesData?.success ? (Array.isArray(variablesData.data) ? variablesData.data : variablesData.data?.variables ?? []) : [];
  const versions = versionsData?.success ? (Array.isArray(versionsData.data) ? versionsData.data : versionsData.data?.versions ?? []) : [];
  const tests = testingData?.success ? (Array.isArray(testingData.data) ? testingData.data : testingData.data?.tests ?? []) : [];
  const historyItems = historyData?.success ? (Array.isArray(historyData.data) ? historyData.data : historyData.data?.history ?? []) : [];

  const isLoading = activeTab === "dashboard"
    ? statsLoading || promptsLoading || collectionsLoading
    : activeTab === "prompts"
      ? promptsLoading
      : activeTab === "templates"
        ? templatesLoading
        : activeTab === "collections"
          ? collectionsLoading
          : activeTab === "variables"
            ? variablesLoading
            : activeTab === "versions"
              ? versionsLoading
              : activeTab === "testing"
                ? testingLoading
                : activeTab === "history"
                  ? historyLoading
                  : false;

  const filteredPrompts = React.useMemo(
    () =>
      prompts.filter(
        (p: any) =>
          p.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.content?.toLowerCase().includes(search.toLowerCase())
      ),
    [prompts, search]
  );

  const filteredTemplates = React.useMemo(
    () =>
      templates.filter(
        (tpl: any) =>
          tpl.name?.toLowerCase().includes(search.toLowerCase()) ||
          tpl.content?.toLowerCase().includes(search.toLowerCase())
      ),
    [templates, search]
  );

  const filteredCollections = React.useMemo(
    () =>
      collections.filter(
        (c: any) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase())
      ),
    [collections, search]
  );

  const filteredVariables = React.useMemo(
    () =>
      variables.filter(
        (v: any) =>
          v.key?.toLowerCase().includes(search.toLowerCase()) ||
          v.value?.toString().toLowerCase().includes(search.toLowerCase())
      ),
    [variables, search]
  );

  const filteredHistory = React.useMemo(
    () =>
      historyItems.filter(
        (h: any) =>
          h.prompt?.toLowerCase().includes(search.toLowerCase()) ||
          h.resolved?.toLowerCase().includes(search.toLowerCase()) ||
          h.promptName?.toLowerCase().includes(search.toLowerCase())
      ),
    [historyItems, search]
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
      } else {
        toast.error(t("common.error", "Error"));
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

  const handleToggle = async (url: string, mutate: () => Promise<any>) => {
    try {
      const res = await fetch(url, { method: "POST" });
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

  const handleRollback = async (id: string) => {
    try {
      const res = await fetch(`/api/prompts/${id}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId: selectedItem?.id }),
      });
      if (res.ok) {
        toast.success(t("promptIntelligence.rolledBack", "Rolled back successfully"));
        mutateVersions();
        mutatePrompts();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleEstimate = async () => {
    if (!testPrompt.trim()) {
      toast.error(t("promptIntelligence.enterPrompt", "Enter a prompt first"));
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch("/api/prompts/testing/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: testPrompt }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalysis(data.data || data.estimate || data);
        toast.success(t("promptIntelligence.estimateReady", "Estimate calculated"));
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateTest = async () => {
    if (!testPrompt.trim()) {
      toast.error(t("promptIntelligence.enterPrompt", "Enter a prompt first"));
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch("/api/prompts/testing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: testPrompt }),
      });
      if (res.ok) {
        toast.success(t("promptIntelligence.testCreated", "Test run created"));
        mutateTesting();
        setTestPrompt("");
        setTestResults([]);
        setAnalysis(null);
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analyzeText.trim()) {
      toast.error(t("promptIntelligence.enterPrompt", "Enter a prompt first"));
      return;
    }
    setProcessing(true);
    setOptimization(null);
    try {
      const res = await fetch("/api/prompts/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: analyzeText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAnalysis(data.data || data.analysis || data);
        toast.success(t("promptIntelligence.analyzed", "Analysis complete"));
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleOptimize = async () => {
    if (!optimizeText.trim()) {
      toast.error(t("promptIntelligence.enterPrompt", "Enter a prompt first"));
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch("/api/prompts/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: optimizeText }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOptimization(data.data || data.optimized || data.optimization || data);
        toast.success(t("promptIntelligence.optimized", "Prompt optimized"));
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    } finally {
      setProcessing(false);
    }
  };

  const handleDuplicateTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/prompts/templates/${id}`, { method: "GET" });
      const data = await res.json();
      if (res.ok && data.success) {
        const tpl = data.data || data.template || data;
        const payload = {
          name: `${tpl.name} (Copy)`,
          content: tpl.content || "",
          type: tpl.type || "text",
          category: tpl.category || "general",
          tags: tpl.tags || [],
        };
        await handlePost("/api/prompts", mutatePrompts, payload);
        setActiveTab("prompts");
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
      case "success":
      case "passed":
        return <Badge tone="success">{status}</Badge>;
      case "running":
      case "processing":
      case "pending":
        return <Badge tone="info">{status}</Badge>;
      case "failed":
      case "error":
        return <Badge tone="warning">{status}</Badge>;
      default:
        return <Badge tone="default">{status}</Badge>;
    }
  };

  const renderForm = (
    fields: { key: string; label: string; type?: string; options?: string[]; multiline?: boolean }[],
    onSave: () => void
  ) => (
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
                rows={4}
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
        title={t("promptIntelligence.title", "Prompt Intelligence Center")}
        description={t("promptIntelligence.description", "Manage prompts, templates, collections, variables, and track usage analytics")}
      />

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key);
              setSearch("");
              setTypeFilter("all");
              setCategoryFilter("all");
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
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <FileText className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("promptIntelligence.totalPrompts", "Total Prompts")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalPrompts ?? prompts.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <Star className="size-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("promptIntelligence.favorites", "Favorites")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.favorites ?? prompts.filter((p: any) => p.favorite).length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Folder className="size-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("promptIntelligence.collections", "Collections")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.collections ?? collections.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Variable className="size-5 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("promptIntelligence.totalVariables", "Total Variables")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalVariables ?? variables.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                      <FlaskConical className="size-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("promptIntelligence.tests", "Tests")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalTests ?? tests.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <GitBranch className="size-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("promptIntelligence.versions", "Versions")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalVersions ?? versions.length}</p>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard title={t("promptIntelligence.recentPrompts", "Recent Prompts")}>
                  {prompts.length > 0 ? (
                    <div className="space-y-3">
                      {prompts.slice(0, 5).map((prompt: any) => (
                        <div
                          key={prompt.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => openDetail(prompt)}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{prompt.name || prompt.id}</span>
                              {prompt.favorite && <Star className="size-3.5 text-amber-500 shrink-0" />}
                              {prompt.pinned && <Pin className="size-3.5 text-blue-500 shrink-0" />}
                              <Badge tone="info">{prompt.type || "text"}</Badge>
                            </div>
                            {prompt.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{prompt.content}</p>}
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground ml-2 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("promptIntelligence.noPrompts", "No prompts yet")}
                    </div>
                  )}
                </DashboardCard>

                <DashboardCard title={t("promptIntelligence.popularCollections", "Collections")}>
                  {collections.length > 0 ? (
                    <div className="space-y-3">
                      {collections.slice(0, 5).map((collection: any) => (
                        <div
                          key={collection.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => openDetail(collection)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10">
                              <Folder className="size-4 text-purple-500" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">{collection.name || collection.id}</span>
                                {collection.promptsCount != null && <Badge tone="muted">{collection.promptsCount} prompts</Badge>}
                              </div>
                              {collection.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{collection.description}</p>}
                            </div>
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground ml-2 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("promptIntelligence.noCollections", "No collections yet")}
                    </div>
                  )}
                </DashboardCard>
              </div>

              <DashboardCard title={t("common.quickActions", "Quick Actions")}>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("prompts")}>
                    <Plus className="mr-2 size-4" />
                    {t("promptIntelligence.newPrompt", "New Prompt")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("templates")}>
                    <LayoutTemplate className="mr-2 size-4" />
                    {t("promptIntelligence.templates", "Templates")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("testing")}>
                    <FlaskConical className="mr-2 size-4" />
                    {t("promptIntelligence.testing", "Testing")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("optimization")}>
                    <Sparkles className="mr-2 size-4" />
                    {t("promptIntelligence.optimization", "Optimization")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => mutateStats()}>
                    <RefreshCw className="mr-2 size-4" />
                    {t("common.refresh", "Refresh")}
                  </Button>
                </div>
              </DashboardCard>
            </div>
          )}

          {activeTab === "prompts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ name: "", content: "", type: "text", category: "general", tags: "" })}>
                  <Plus className="mr-2 size-4" />
                  {t("promptIntelligence.createPrompt", "Create Prompt")}
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                  {PROMPT_TYPES.map((type) => (
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
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                  <Filter className="ml-1 size-3.5 text-muted-foreground" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-transparent px-2 py-1.5 text-xs font-medium"
                  >
                    {PROMPT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              {showForm && renderForm(
                [
                  { key: "name", label: t("promptIntelligence.promptName", "Prompt Name") },
                  { key: "type", label: t("promptIntelligence.type", "Type"), type: "select", options: PROMPT_TYPES.filter((x) => x !== "all") },
                  { key: "category", label: t("promptIntelligence.category", "Category"), type: "select", options: PROMPT_CATEGORIES.filter((x) => x !== "all") },
                  { key: "content", label: t("promptIntelligence.content", "Content"), multiline: true },
                  { key: "tags", label: t("promptIntelligence.tags", "Tags (comma separated)") },
                ],
                () => handleSave("/api/prompts", mutatePrompts, ["name", "type", "category", "content", "tags"])
              )}
              {filteredPrompts.length > 0 ? (
                <div className="space-y-3">
                  {filteredPrompts.map((prompt: any) => (
                    <DashboardCard key={prompt.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 text-blue-500" />
                            <button onClick={() => openDetail(prompt)}>
                              <span className="font-semibold text-sm">{prompt.name || prompt.id}</span>
                            </button>
                            <Badge tone="info">{prompt.type || "text"}</Badge>
                            {prompt.category && <Badge tone="muted">{prompt.category}</Badge>}
                          </div>
                          {prompt.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{prompt.content}</p>}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {prompt.tags?.length > 0 && (
                              <span>{t("promptIntelligence.tags", "Tags")}: {Array.isArray(prompt.tags) ? prompt.tags.join(", ") : prompt.tags}</span>
                            )}
                            {prompt.updatedAt && <span>{new Date(prompt.updatedAt).toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => handleToggle(`/api/prompts/${prompt.id}/favorite`, mutatePrompts)} title={t("promptIntelligence.favorite", "Favorite")}>
                            <Star className={`size-3 ${prompt.favorite ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleToggle(`/api/prompts/${prompt.id}/pin`, mutatePrompts)} title={t("promptIntelligence.pin", "Pin")}>
                            <Pin className={`size-3 ${prompt.pinned ? "text-blue-500 fill-blue-500" : "text-muted-foreground"}`} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDetail(prompt)}>
                            <Eye className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(prompt, ["name", "type", "category", "content", "tags"])}>
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("/api/prompts", prompt.id, mutatePrompts)}>
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
                    {t("promptIntelligence.noPrompts", "No prompts found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                {renderSearchBar()}
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                  {PROMPT_TYPES.map((type) => (
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
              {filteredTemplates.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredTemplates.map((template: any) => (
                    <DashboardCard key={template.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <LayoutTemplate className="size-4 text-cyan-500" />
                            <span className="font-semibold text-sm">{template.name || template.id}</span>
                            <Badge tone="info">{template.type || "text"}</Badge>
                          </div>
                          {template.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>}
                          {template.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.content}</p>}
                          {template.tags?.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {(Array.isArray(template.tags) ? template.tags : []).slice(0, 3).map((tag: string, i: number) => (
                                <Badge key={i} tone="muted">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => handleDuplicateTemplate(template.id)} title={t("promptIntelligence.duplicate", "Duplicate to my prompts")}>
                            <Copy className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDetail(template)}>
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
                    {t("promptIntelligence.noTemplates", "No templates found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "collections" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ name: "", description: "", tag: "work" })}>
                  <Plus className="mr-2 size-4" />
                  {t("promptIntelligence.createCollection", "Create Collection")}
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "name", label: t("promptIntelligence.collectionName", "Collection Name") },
                  { key: "tag", label: t("promptIntelligence.collectionTag", "Tag"), type: "select", options: COLLECTION_TAGS.filter((x) => x !== "all") },
                  { key: "description", label: t("promptIntelligence.description", "Description"), multiline: true },
                ],
                () => handleSave("/api/prompts/collections", mutateCollections, ["name", "tag", "description"])
              )}
              {filteredCollections.length > 0 ? (
                <div className="space-y-3">
                  {filteredCollections.map((collection: any) => (
                    <DashboardCard key={collection.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Folder className="size-4 text-purple-500" />
                            <span className="font-semibold text-sm">{collection.name || collection.id}</span>
                            {collection.promptsCount != null && <Badge tone="muted">{collection.promptsCount} prompts</Badge>}
                          </div>
                          {collection.description && <p className="text-xs text-muted-foreground mt-1">{collection.description}</p>}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {collection.tag && <span>{t("promptIntelligence.collectionTag", "Tag")}: {collection.tag}</span>}
                            {collection.updatedAt && <span>{new Date(collection.updatedAt).toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(collection)}>
                            <Eye className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(collection, ["name", "tag", "description"])}>
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("/api/prompts/collections", collection.id, mutateCollections)}>
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
                    {t("promptIntelligence.noCollections", "No collections found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "variables" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ key: "", value: "", type: "text", description: "" })}>
                  <Plus className="mr-2 size-4" />
                  {t("promptIntelligence.createVariable", "Create Variable")}
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "key", label: t("promptIntelligence.variableKey", "Variable Key") },
                  { key: "value", label: t("promptIntelligence.variableValue", "Value") },
                  { key: "type", label: t("promptIntelligence.type", "Type"), type: "select", options: VARIABLE_TYPES },
                  { key: "description", label: t("promptIntelligence.description", "Description") },
                ],
                () => handleSave("/api/prompts/variables", mutateVariables, ["key", "value", "type", "description"])
              )}
              {filteredVariables.length > 0 ? (
                <div className="space-y-3">
                  {filteredVariables.map((variable: any) => (
                    <DashboardCard key={variable.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Variable className="size-4 text-cyan-500" />
                            <span className="font-mono font-semibold text-sm">{"{{"}{variable.key}{"}}"}</span>
                            {variable.type && <Badge tone="info">{variable.type}</Badge>}
                          </div>
                          <div className="mt-1 text-sm break-all">{String(variable.value ?? "-")}</div>
                          {variable.description && <p className="text-xs text-muted-foreground mt-0.5">{variable.description}</p>}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(variable, ["key", "value", "type", "description"])}>
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete("/api/prompts/variables", variable.id, mutateVariables)}>
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
                    {t("promptIntelligence.noVariables", "No variables found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "versions" && (
            <div className="space-y-4">
              <DashboardCard title={t("promptIntelligence.selectPrompt", "Select a Prompt")}>
                <div className="flex flex-wrap gap-2">
                  {prompts.slice(0, 10).map((prompt: any) => (
                    <button
                      key={prompt.id}
                      onClick={() => setVersionsPromptId(prompt.id)}
                      className={`rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors ${
                        versionsPromptId === prompt.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-background hover:bg-muted"
                      }`}
                    >
                      {prompt.name || prompt.id}
                    </button>
                  ))}
                </div>
              </DashboardCard>
              {versionsPromptId && (
                versions.length > 0 ? (
                  <div className="space-y-3">
                    {versions.map((version: any) => (
                      <DashboardCard key={version.id}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <GitBranch className="size-4 text-emerald-500" />
                              <span className="font-semibold text-sm">{version.version ? `v${version.version}` : version.id}</span>
                              <Badge tone={version.current ? "success" : "default"}>{version.current ? "Current" : version.status || "version"}</Badge>
                            </div>
                            {version.content && <pre className="mt-1 whitespace-pre-wrap break-words text-xs text-muted-foreground">{version.content}</pre>}
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {version.createdAt && <span>{new Date(version.createdAt).toLocaleString()}</span>}
                              {version.message && <span>{version.message}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedItem(version); openDetail(version); }}>
                              <Eye className="size-3" />
                            </Button>
                            {!version.current && (
                              <Button variant="ghost" size="sm" onClick={() => handleRollback(versionsPromptId)} title={t("promptIntelligence.rollback", "Rollback")}>
                                <RotateCcw className="size-3" />
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
                      {t("promptIntelligence.noVersions", "No versions found for this prompt")}
                    </div>
                  </DashboardCard>
                )
              )}
            </div>
          )}

          {activeTab === "testing" && (
            <div className="space-y-4">
              <DashboardCard title={t("promptIntelligence.testingTitle", "Prompt Test Lab")}>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{t("promptIntelligence.enterPrompt", "Enter Prompt")}</label>
                    <textarea
                      value={testPrompt}
                      onChange={(e) => setTestPrompt(e.target.value)}
                      rows={5}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" disabled={processing} onClick={handleEstimate}>
                      {processing ? <Loader className="size-4 animate-spin" /> : <CircleDollarSign className="size-4" />}
                      {t("promptIntelligence.estimate", "Estimate")}
                    </Button>
                    <Button size="sm" disabled={processing} onClick={handleCreateTest}>
                      {processing ? <Loader className="size-4 animate-spin" /> : <Play className="size-4" />}
                      {t("promptIntelligence.runTest", "Create Test Run")}
                    </Button>
                  </div>
                  {analysis?.tokens != null && (
                    <div className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("promptIntelligence.estimatedTokens", "Estimated Tokens")}</p>
                        <p className="mt-1 text-xl font-semibold">{analysis.tokens}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("promptIntelligence.estimatedCredits", "Estimated Credits")}</p>
                        <p className="mt-1 text-xl font-semibold">{analysis.credits ?? analysis.estimatedCredits ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("promptIntelligence.characterCount", "Character Count")}</p>
                        <p className="mt-1 text-xl font-semibold">{analysis.characterCount ?? testPrompt.length}</p>
                      </div>
                    </div>
                  )}
                </div>
              </DashboardCard>

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{t("promptIntelligence.testResults", "Test Results")}</h3>
                {testResults.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setTestResults([])}>
                    <X className="size-3" />
                    {t("common.clear", "Clear")}
                  </Button>
                )}
              </div>
              {testResults.length > 0 && (
                <DashboardCard title={t("promptIntelligence.compareResults", "Compare Results")}>
                  <div className="space-y-3">
                    {testResults.map((result: any, i: number) => (
                      <div key={result.id || i} className="rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{result.promptName || result.name || `Run ${i + 1}`}</span>
                          {getStatusBadge(result.status)}
                        </div>
                        {result.output && <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-muted-foreground">{result.output}</pre>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {result.tokens != null && <span>{result.tokens} tokens</span>}
                          {result.credits != null && <span>{result.credits} credits</span>}
                          {result.durationMs != null && <span>{result.durationMs}ms</span>}
                          {result.createdAt && <span>{new Date(result.createdAt).toLocaleString()}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardCard>
              )}

              {tests.length > 0 ? (
                <div className="space-y-3">
                  {tests.slice(0, 20).map((test: any) => (
                    <DashboardCard key={test.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <FlaskConical className="size-4 text-green-500" />
                            <span className="font-semibold text-sm">{test.name || test.promptName || test.id}</span>
                            {getStatusBadge(test.status)}
                            {test.promptId && <Badge tone="muted">{test.promptId}</Badge>}
                          </div>
                          {test.prompt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{test.prompt}</p>}
                          {test.output && <pre className="mt-1 whitespace-pre-wrap break-words text-xs text-muted-foreground line-clamp-3">{test.output}</pre>}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {test.tokens != null && <span>{test.tokens} tokens</span>}
                            {test.credits != null && <span>{test.credits} credits</span>}
                            {test.model && <span>{test.model}</span>}
                            {test.createdAt && <span>{new Date(test.createdAt).toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setComparePrompt(test.id);
                            setTestResults((prev) => [...prev, test].filter((x, idx, arr) => arr.findIndex((y) => y.id === x.id) === idx));
                          }} title={t("promptIntelligence.addToCompare", "Add to compare")}>
                            <ArrowLeftRight className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDetail(test)}>
                            <Eye className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                    {t("promptIntelligence.noTests", "No test runs yet")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "optimization" && (
            <div className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard title={t("promptIntelligence.analyzeTitle", "Analyze Prompt")}>
                  <div className="space-y-3">
                    <textarea
                      value={analyzeText}
                      onChange={(e) => setAnalyzeText(e.target.value)}
                      rows={6}
                      placeholder={t("promptIntelligence.enterPromptHint", "Paste your prompt here...")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" disabled={processing} onClick={handleAnalyze}>
                        {processing ? <Loader className="size-4 animate-spin" /> : <Activity className="size-4" />}
                        {t("promptIntelligence.analyze", "Analyze")}
                      </Button>
                    </div>
                    {analysis?.score != null && (
                      <div className="rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{t("promptIntelligence.qualityScore", "Quality Score")}</span>
                          <span className="text-2xl font-semibold">{analysis.score}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-muted/40">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(analysis.score, 100)}%` }}
                          />
                        </div>
                        <div className="mt-3 space-y-1">
                          {analysis.clarity != null && (
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{t("promptIntelligence.clarity", "Clarity")}</span>
                              <span>{analysis.clarity}%</span>
                            </div>
                          )}
                          {analysis.specificity != null && (
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{t("promptIntelligence.specificity", "Specificity")}</span>
                              <span>{analysis.specificity}%</span>
                            </div>
                          )}
                          {analysis.actionability != null && (
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{t("promptIntelligence.actionability", "Actionability")}</span>
                              <span>{analysis.actionability}%</span>
                            </div>
                          )}
                        </div>
                        {analysis.feedback && <p className="text-xs text-muted-foreground mt-3">{analysis.feedback}</p>}
                        {analysis.suggestions?.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {(Array.isArray(analysis.suggestions) ? analysis.suggestions : []).map((s: string, i: number) => (
                              <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                                <Sparkles className="size-3.5 shrink-0" />
                                {s}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </div>
                </DashboardCard>

                <DashboardCard title={t("promptIntelligence.optimizeTitle", "Optimize Prompt")}>
                  <div className="space-y-3">
                    <textarea
                      value={optimizeText}
                      onChange={(e) => setOptimizeText(e.target.value)}
                      rows={6}
                      placeholder={t("promptIntelligence.enterPromptHint", "Paste your prompt here...")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <Button size="sm" disabled={processing} onClick={handleOptimize}>
                      {processing ? <Loader className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                      {t("promptIntelligence.optimize", "Optimize")}
                    </Button>
                  </div>
                </DashboardCard>
              </div>

              {optimization && (
                <DashboardCard title={t("promptIntelligence.optimizedResult", "Optimized Result")}>
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="size-3.5" />
                        {t("promptIntelligence.original", "Original")}
                      </div>
                      <pre className="whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/20 p-4 text-xs">{optimizeText}</pre>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-xs text-emerald-500">
                        <Sparkles className="size-3.5" />
                        {t("promptIntelligence.optimized", "Optimized")}
                      </div>
                      <pre className="whitespace-pre-wrap break-words rounded-xl border border-border bg-muted/20 p-4 text-xs">
                        {optimization.content || optimization.optimized || optimization.prompt || JSON.stringify(optimization, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      const text = optimization.content || optimization.optimized || optimization.prompt || "";
                      navigator.clipboard?.writeText(text);
                      toast.success(t("promptIntelligence.copied", "Copied to clipboard"));
                    }}>
                      <Copy className="size-3" />
                      {t("promptIntelligence.copyOptimized", "Copy Optimized")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openCreate({
                      name: t("promptIntelligence.optimizedPrompt", "Optimized Prompt"),
                      content: optimization.content || optimization.optimized || optimization.prompt || optimizeText,
                      type: "text",
                      category: "general",
                    })}>
                      <Plus className="size-3" />
                      {t("promptIntelligence.saveToPrompts", "Save to My Prompts")}
                    </Button>
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                {renderSearchBar()}
              </div>
              {filteredHistory.length > 0 ? (
                <div className="space-y-3">
                  {filteredHistory.map((item: any) => (
                    <DashboardCard key={item.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <History className="size-4 text-blue-500" />
                            <span className="font-semibold text-sm">{item.promptName || item.name || item.id}</span>
                            {getStatusBadge(item.status || "completed")}
                            {item.provider && <Badge tone="info">{item.provider}</Badge>}
                          </div>
                          {item.prompt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.prompt}</p>}
                          {item.resolved && <pre className="mt-1 whitespace-pre-wrap break-words text-xs text-muted-foreground line-clamp-3">{item.resolved}</pre>}
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {item.tokens != null && <span>{item.tokens} tokens</span>}
                            {item.credits != null && <span>{item.credits} credits</span>}
                            {item.model && <span>{item.model}</span>}
                            {item.createdAt && <span>{new Date(item.createdAt).toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openDetail(item)}>
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
                    {t("promptIntelligence.noHistory", "No history found")}
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
                      <BarChart3 className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("promptIntelligence.totalUsage", "Total Usage")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalUsage ?? historyItems.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Activity className="size-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("promptIntelligence.currentCredits", "Credits Used")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.creditsUsed ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Layers className="size-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("promptIntelligence.avgTokens", "Avg Tokens / Prompt")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.avgTokens ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <TrendingUp className="size-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("promptIntelligence.successRate", "Success Rate")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.successRate ?? 0}%</p>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard title={t("promptIntelligence.mostUsedTypes", "Most Used Types")}>
                  {(stats?.byType?.length ?? 0) > 0 ? (
                    <div className="space-y-2">
                      {stats.byType.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-24 text-sm">{item.type || item.name}</span>
                          <div className="h-2 flex-1 rounded-full bg-muted/40">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${Math.min((item.count / Math.max(stats.byType[0]?.count || 1, 1)) * 100, 100)}%` }}
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

                <DashboardCard title={t("promptIntelligence.historyByProvider", "History by Provider")}>
                  {(stats?.byProvider?.length ?? 0) > 0 ? (
                    <div className="space-y-2">
                      {stats.byProvider.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-24 text-sm">{item.provider || item.name}</span>
                          <div className="h-2 flex-1 rounded-full bg-muted/40">
                            <div
                              className="h-2 rounded-full bg-emerald-500"
                              style={{ width: `${Math.min((item.count / Math.max(stats.byProvider[0]?.count || 1, 1)) * 100, 100)}%` }}
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
              </div>

              <DashboardCard title={t("promptIntelligence.recentActivity", "Recent Activity")}>
                {historyItems.length > 0 ? (
                  <div className="space-y-3">
                    {historyItems.slice(0, 10).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Activity className="size-4 text-muted-foreground" />
                            <span className="font-medium text-sm truncate">{item.promptName || item.name || item.id}</span>
                            {item.provider && <Badge tone="muted">{item.provider}</Badge>}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {item.tokens != null && <span>{item.tokens} tokens</span>}
                            {item.credits != null && <span>{item.credits} credits</span>}
                            {item.createdAt && <span>{new Date(item.createdAt).toLocaleString()}</span>}
                          </div>
                        </div>
                        <Badge tone="success">{item.status || "completed"}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                    {t("promptIntelligence.noActivity", "No activity yet")}
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
              <h3 className="font-semibold">{t("promptIntelligence.details", "Details")}</h3>
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
