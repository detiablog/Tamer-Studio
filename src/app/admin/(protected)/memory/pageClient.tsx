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
  Brain,
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

type TabKey = "rules" | "learning" | "templates" | "analytics" | "featureFlags" | "maintenance";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "rules", icon: Settings },
  { key: "learning", icon: Brain },
  { key: "templates", icon: BookOpen },
  { key: "analytics", icon: BarChart3 },
  { key: "featureFlags", icon: Flag },
  { key: "maintenance", icon: Trash },
];

type LearningRule = {
  id: string;
  name: string;
  type: string;
  category: string;
  priority: number;
  enabled: boolean;
  pattern?: string;
  action?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

type BrandTemplate = {
  id: string;
  name: string;
  brandId: string;
  type: string;
  content: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type FeatureFlags = {
  learningEnabled: boolean;
  autoCleanup: boolean;
  persistenceEnabled: boolean;
  crossSessionEnabled: boolean;
  analyticsEnabled: boolean;
  importExportEnabled: boolean;
};

type LearningSettings = {
  enabled: boolean;
  paused: boolean;
  maxEntriesPerDay: number;
  maxTotalEntries: number;
  autoCleanupDays: number;
  learningRate: number;
  confidenceThreshold: number;
};

type MemoryStats = {
  totalEntries: number;
  totalBrands: number;
  totalPreferences: number;
  totalLearning: number;
  totalTemplates: number;
  totalRules: number;
  storageUsed: string;
  categoryBreakdown: { category: string; count: number }[];
  recentActivity: { date: string; count: number }[];
};

export function MemoryAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("rules");
  const [search, setSearch] = React.useState("");
  const [editingRule, setEditingRule] = React.useState<LearningRule | null>(null);
  const [showCreateRule, setShowCreateRule] = React.useState(false);
  const [newRule, setNewRule] = React.useState<Partial<LearningRule>>({
    name: "",
    type: "preference",
    category: "general",
    priority: 1,
    enabled: true,
    pattern: "",
    action: "",
    description: "",
  });
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [clearCategories, setClearCategories] = React.useState("");

  const { data: rulesData, isLoading: rulesLoading, mutate: mutateRules } = useSWR(
    "/api/memory/admin/rules",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: analyticsData, isLoading: analyticsLoading } = useSWR(
    "/api/memory/admin/analytics",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: statsData, isLoading: statsLoading } = useSWR(
    "/api/memory/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR(
    "/api/memory/settings",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const rules = rulesData?.success ? rulesData.data?.rules ?? [] : [];
  const analytics = analyticsData?.success ? analyticsData.data : null;
  const stats = statsData?.success ? statsData.data : null;
  const settings = settingsData?.success ? settingsData.data : null;

  const learningSettings: LearningSettings = settings?.learning ?? {
    enabled: true,
    paused: false,
    maxEntriesPerDay: 100,
    maxTotalEntries: 10000,
    autoCleanupDays: 90,
    learningRate: 0.1,
    confidenceThreshold: 0.7,
  };

  const featureFlags: FeatureFlags = settings?.featureFlags ?? {
    learningEnabled: true,
    autoCleanup: true,
    persistenceEnabled: true,
    crossSessionEnabled: true,
    analyticsEnabled: true,
    importExportEnabled: true,
  };

  const filteredRules = React.useMemo(
    () =>
      rules.filter(
        (r: LearningRule) =>
          r.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.type?.toLowerCase().includes(search.toLowerCase()) ||
          r.category?.toLowerCase().includes(search.toLowerCase())
      ),
    [rules, search]
  );

  const handleCreateRule = async () => {
    try {
      const res = await fetch("/api/memory/admin/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule),
      });
      if (res.ok) {
        toast.success(t("common.success", "Rule created"));
        setShowCreateRule(false);
        setNewRule({
          name: "",
          type: "preference",
          category: "general",
          priority: 1,
          enabled: true,
          pattern: "",
          action: "",
          description: "",
        });
        mutateRules();
      } else {
        toast.error(t("common.error", "Error creating rule"));
      }
    } catch {
      toast.error(t("common.error", "Error creating rule"));
    }
  };

  const handleUpdateRule = async (id: string, updates: Partial<LearningRule>) => {
    try {
      const res = await fetch(`/api/memory/admin/rules/${id}`, {
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
      const res = await fetch(`/api/memory/admin/rules/${id}`, { method: "DELETE" });
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

  const handleToggleRule = async (rule: LearningRule) => {
    await handleUpdateRule(rule.id, { enabled: !rule.enabled });
  };

  const handleSaveLearningSettings = async (updates: Partial<LearningSettings>) => {
    try {
      const res = await fetch("/api/memory/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ learning: { ...learningSettings, ...updates } }),
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
      const res = await fetch("/api/memory/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureFlags: { ...featureFlags, ...updates } }),
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

  const handleClearMemory = async () => {
    try {
      const body: Record<string, unknown> = {};
      if (clearCategories.trim()) {
        body.categories = clearCategories.split(",").map((c) => c.trim()).filter(Boolean);
      }
      const res = await fetch("/api/memory/admin/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(t("common.success", "Memory cleared"));
        setConfirmClear(false);
        setClearCategories("");
      } else {
        toast.error(t("common.error", "Error clearing memory"));
      }
    } catch {
      toast.error(t("common.error", "Error clearing memory"));
    }
  };

  const handleResetLearning = async () => {
    try {
      const res = await fetch("/api/memory/admin/reset-learning", { method: "POST" });
      if (res.ok) {
        toast.success(t("common.success", "Learning data reset"));
        setConfirmReset(false);
      } else {
        toast.error(t("common.error", "Error resetting learning"));
      }
    } catch {
      toast.error(t("common.error", "Error resetting learning"));
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch("/api/memory/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `memory-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t("common.success", "Export downloaded"));
      }
    } catch {
      toast.error(t("common.error", "Error exporting data"));
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const res = await fetch("/api/memory/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success(t("common.success", "Data imported"));
        mutateRules();
      } else {
        toast.error(t("common.error", "Error importing data"));
      }
    } catch {
      toast.error(t("common.error", "Invalid import file"));
    }
    event.target.value = "";
  };

  const isLoading = rulesLoading || analyticsLoading || statsLoading || settingsLoading;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("creativeMemory.title", "Creative Memory") }]} />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("creativeMemory.title", "Creative Memory")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("creativeMemory.description", "Your AI-powered creative intelligence and brand consistency engine")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { mutateRules(); mutateSettings(); }}>
              <RefreshCw className="mr-2 size-4" />
              {t("common.refresh", "Refresh")}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1 mb-6">
          {TABS.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {t(`creativeMemory.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
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
                      <h3 className="font-medium">{t("creativeMemory.newRule", "New Learning Rule")}</h3>
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
                        <label className="text-xs font-medium text-muted-foreground">{t("common.type", "Type")}</label>
                        <Input
                          value={newRule.type}
                          onChange={(e) => setNewRule((p) => ({ ...p, type: e.target.value }))}
                          placeholder="preference"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.category", "Category")}</label>
                        <Input
                          value={newRule.category}
                          onChange={(e) => setNewRule((p) => ({ ...p, category: e.target.value }))}
                          placeholder="general"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.priority", "Priority")}</label>
                        <Input
                          type="number"
                          value={newRule.priority}
                          onChange={(e) => setNewRule((p) => ({ ...p, priority: Number(e.target.value) }))}
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
                      <Button size="sm" onClick={handleCreateRule} disabled={!newRule.name}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {editingRule && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("creativeMemory.editRule", "Edit Rule")}</h3>
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
                        <label className="text-xs font-medium text-muted-foreground">{t("common.type", "Type")}</label>
                        <Input
                          value={editingRule.type}
                          onChange={(e) => setEditingRule((p) => (p ? { ...p, type: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.category", "Category")}</label>
                        <Input
                          value={editingRule.category}
                          onChange={(e) => setEditingRule((p) => (p ? { ...p, category: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.priority", "Priority")}</label>
                        <Input
                          type="number"
                          value={editingRule.priority}
                          onChange={(e) => setEditingRule((p) => (p ? { ...p, priority: Number(e.target.value) } : null))}
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
                  keyExtractor={(r: LearningRule) => r.id}
                  columns={[
                    {
                      key: "name",
                      header: t("common.name", "Name"),
                      sortable: true,
                      render: (item: LearningRule) => <span className="text-sm font-medium">{item.name}</span>,
                    },
                    { key: "type", header: "Type", sortable: true, render: (item: LearningRule) => <Badge tone="info">{item.type}</Badge> },
                    { key: "category", header: "Category", sortable: true, render: (item: LearningRule) => <Badge tone="info">{item.category}</Badge> },
                    { key: "priority", header: "Priority", sortable: true, render: (item: LearningRule) => <span className="text-sm">{item.priority}</span> },
                    {
                      key: "status",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: LearningRule) => (
                        <Badge tone={item.enabled ? "success" : "default"}>
                          {item.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: LearningRule) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleRule(item)}>
                            {item.enabled ? <Pause className="size-3" /> : <Play className="size-3" />}
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

            {activeTab === "learning" && (
              <div className="space-y-4">
                <DashboardCard title={t("creativeMemory.learningSettings", "Learning Settings")}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                      <div>
                        <h3 className="font-medium">{t("creativeMemory.learningEnabled", "Learning Enabled")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("creativeMemory.learningEnabledDesc", "Allow the system to learn from user interactions")}
                        </p>
                      </div>
                      <Button
                        variant={learningSettings.enabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSaveLearningSettings({ enabled: !learningSettings.enabled })}
                      >
                        {learningSettings.enabled ? <Play className="mr-2 size-4" /> : <Pause className="mr-2 size-4" />}
                        {learningSettings.enabled ? "Active" : "Disabled"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                      <div>
                        <h3 className="font-medium">{t("creativeMemory.learningPaused", "Pause Learning")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("creativeMemory.learningPausedDesc", "Temporarily pause learning without disabling it")}
                        </p>
                      </div>
                      <Button
                        variant={learningSettings.paused ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleSaveLearningSettings({ paused: !learningSettings.paused })}
                      >
                        {learningSettings.paused ? <Play className="mr-2 size-4" /> : <Pause className="mr-2 size-4" />}
                        {learningSettings.paused ? "Resume" : "Pause"}
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {t("creativeMemory.maxEntriesPerDay", "Max Entries Per Day")}
                        </label>
                        <Input
                          type="number"
                          value={learningSettings.maxEntriesPerDay}
                          onChange={(e) =>
                            handleSaveLearningSettings({ maxEntriesPerDay: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {t("creativeMemory.maxTotalEntries", "Max Total Entries")}
                        </label>
                        <Input
                          type="number"
                          value={learningSettings.maxTotalEntries}
                          onChange={(e) =>
                            handleSaveLearningSettings({ maxTotalEntries: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {t("creativeMemory.autoCleanupDays", "Auto Cleanup After (Days)")}
                        </label>
                        <Input
                          type="number"
                          value={learningSettings.autoCleanupDays}
                          onChange={(e) =>
                            handleSaveLearningSettings({ autoCleanupDays: Number(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                          {t("creativeMemory.confidenceThreshold", "Confidence Threshold")}
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={learningSettings.confidenceThreshold}
                          onChange={(e) =>
                            handleSaveLearningSettings({ confidenceThreshold: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            )}

            {activeTab === "templates" && (
              <div className="space-y-4">
                <DashboardCard title={t("creativeMemory.brandTemplates", "Brand Templates")}>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t("creativeMemory.templatesDesc", "Brand templates are managed through brand profiles. Create and configure brand profiles to define your templates.")}
                    </p>
                    {stats?.totalTemplates !== undefined && (
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-xs text-muted-foreground">{t("creativeMemory.totalTemplates", "Total Templates")}</p>
                          <p className="mt-2 text-2xl font-semibold">{stats.totalTemplates}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-xs text-muted-foreground">{t("creativeMemory.totalBrands", "Brand Profiles")}</p>
                          <p className="mt-2 text-2xl font-semibold">{stats.totalBrands}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-muted/20 p-4">
                          <p className="text-xs text-muted-foreground">{t("creativeMemory.totalEntries", "Total Entries")}</p>
                          <p className="mt-2 text-2xl font-semibold">{stats.totalEntries}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <BookOpen className="mr-2 size-4" />
                        {t("creativeMemory.manageBrands", "Manage Brand Profiles")}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-2 size-4" />
                        {t("creativeMemory.createTemplate", "Create Template")}
                      </Button>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("creativeMemory.totalEntries", "Total Entries")}</p>
                    <p className="mt-2 text-2xl font-semibold">{analytics?.totalEntries ?? stats?.totalEntries ?? 0}</p>
                  </DashboardCard>
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("creativeMemory.brandProfiles", "Brand Profiles")}</p>
                    <p className="mt-2 text-2xl font-semibold">{analytics?.totalBrands ?? stats?.totalBrands ?? 0}</p>
                  </DashboardCard>
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("creativeMemory.totalPreferences", "Preferences")}</p>
                    <p className="mt-2 text-2xl font-semibold">{analytics?.totalPreferences ?? stats?.totalPreferences ?? 0}</p>
                  </DashboardCard>
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("creativeMemory.learningEvents", "Learning Events")}</p>
                    <p className="mt-2 text-2xl font-semibold">{analytics?.totalLearning ?? stats?.totalLearning ?? 0}</p>
                  </DashboardCard>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("creativeMemory.activeRules", "Active Rules")}</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {rules.filter((r: LearningRule) => r.enabled).length}
                    </p>
                  </DashboardCard>
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("creativeMemory.storageUsed", "Storage Used")}</p>
                    <p className="mt-2 text-2xl font-semibold">{stats?.storageUsed ?? "N/A"}</p>
                  </DashboardCard>
                  <DashboardCard>
                    <p className="text-xs text-muted-foreground">{t("creativeMemory.totalRules", "Total Rules")}</p>
                    <p className="mt-2 text-2xl font-semibold">{stats?.totalRules ?? rules.length}</p>
                  </DashboardCard>
                </div>

                {(analytics?.categoryBreakdown ?? stats?.categoryBreakdown) && (
                  <DashboardCard title={t("creativeMemory.memoryByCategory", "Memory by Category")}>
                    <div className="space-y-2">
                      {(analytics?.categoryBreakdown ?? stats?.categoryBreakdown ?? []).map(
                        (cat: { category: string; count: number }) => (
                          <div
                            key={cat.category}
                            className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3"
                          >
                            <div className="flex items-center gap-2">
                              <Badge tone="info">{cat.category}</Badge>
                            </div>
                            <span className="text-sm font-medium">{cat.count}</span>
                          </div>
                        )
                      )}
                    </div>
                  </DashboardCard>
                )}
              </div>
            )}

            {activeTab === "featureFlags" && (
              <div className="space-y-4">
                <DashboardCard title={t("creativeMemory.featureFlags", "Memory Feature Flags")}>
                  <div className="space-y-4">
                    {([
                      { key: "learningEnabled", label: "Learning Enabled", desc: "Enable the learning system to capture and process user interactions" },
                      { key: "autoCleanup", label: "Auto Cleanup", desc: "Automatically clean up old memory entries based on retention policies" },
                      { key: "persistenceEnabled", label: "Persistence", desc: "Persist memory data across sessions and page reloads" },
                      { key: "crossSessionEnabled", label: "Cross-Session Memory", desc: "Share memory data across different user sessions" },
                      { key: "analyticsEnabled", label: "Analytics", desc: "Track and store analytics data for memory usage" },
                      { key: "importExportEnabled", label: "Import/Export", desc: "Allow users to import and export memory data" },
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
                <DashboardCard title={t("creativeMemory.exportImport", "Export & Import")}>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t("creativeMemory.exportData", "Export Memory Data")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("creativeMemory.exportDataDesc", "Download a complete backup of all memory data")}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleExportData}>
                          <Download className="mr-2 size-4" />
                          {t("common.export", "Export")}
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t("creativeMemory.importData", "Import Memory Data")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("creativeMemory.importDataDesc", "Restore memory data from a backup file")}
                          </p>
                        </div>
                        <label>
                          <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                          <Button variant="outline" size="sm">
                            <Upload className="mr-2 size-4" />
                            {t("common.import", "Import")}
                          </Button>
                        </label>
                      </div>
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard title={t("creativeMemory.resetOperations", "Reset Operations")}>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{t("creativeMemory.resetLearning", "Reset Learning Data")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("creativeMemory.resetLearningDesc", "Reset all learning events and inferred preferences")}
                          </p>
                        </div>
                        {confirmReset ? (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setConfirmReset(false)}>
                              <X className="mr-2 size-4" />
                              {t("common.cancel", "Cancel")}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleResetLearning}>
                              <RotateCcw className="mr-2 size-4" />
                              {t("creativeMemory.confirmReset", "Confirm Reset")}
                            </Button>
                          </div>
                        ) : (
                          <Button variant="destructive" size="sm" onClick={() => setConfirmReset(true)}>
                            <RotateCcw className="mr-2 size-4" />
                            {t("creativeMemory.resetLearning", "Reset Learning")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard title={t("creativeMemory.dangerZone", "Danger Zone")}>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-destructive">{t("creativeMemory.clearAllMemory", "Clear All Memory")}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {t("creativeMemory.clearAllMemoryDesc", "Permanently delete all memory entries, brand profiles, and preferences")}
                          </p>
                        </div>
                        {confirmClear ? (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setConfirmClear(false)}>
                              <X className="mr-2 size-4" />
                              {t("common.cancel", "Cancel")}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleClearMemory}>
                              <Trash className="mr-2 size-4" />
                              {t("creativeMemory.confirmClear", "Confirm Clear")}
                            </Button>
                          </div>
                        ) : (
                          <Button variant="destructive" size="sm" onClick={() => setConfirmClear(true)}>
                            <Trash className="mr-2 size-4" />
                            {t("creativeMemory.clearMemory", "Clear Memory")}
                          </Button>
                        )}
                      </div>
                      {confirmClear && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {t("creativeMemory.clearCategoriesHint", "Optionally specify categories to clear (comma-separated), or leave empty to clear all")}
                          </p>
                          <Input
                            value={clearCategories}
                            onChange={(e) => setClearCategories(e.target.value)}
                            placeholder={t("creativeMemory.categoriesPlaceholder", "e.g. preference, behavior (leave empty for all)")}
                          />
                        </div>
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
