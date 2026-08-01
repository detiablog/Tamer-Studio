"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import {
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Loader,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  Sliders,
  Trash2,
  TrendingUp,
  Wrench,
  X,
  Zap,
  AlertTriangle,
  Power,
  RotateCcw,
  Target,
  Star,
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

type TabKey = "overview" | "patterns" | "recommendations" | "confidenceThresholds" | "analytics" | "settings" | "maintenance";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "overview", icon: BarChart3 },
  { key: "patterns", icon: Brain },
  { key: "recommendations", icon: Zap },
  { key: "confidenceThresholds", icon: Sliders },
  { key: "analytics", icon: TrendingUp },
  { key: "settings", icon: Settings },
  { key: "maintenance", icon: Wrench },
];

type StatsData = {
  totalEvents?: number;
  totalPatterns?: number;
  totalPreferences?: number;
  totalRecommendations?: number;
  totalGoals?: number;
  totalFeedback?: number;
  avgConfidence?: number;
  acceptanceRate?: number;
  goalProgress?: number;
  eventsByType?: { type: string; count: number }[];
  patternsByCategory?: { category: string; count: number }[];
};

type PatternItem = {
  id: string;
  name: string;
  category: string;
  confidence: number;
  description: string;
  discoveredAt: string;
  occurrences: number;
  status: string;
};

type RecommendationItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  confidence: number;
  status: string;
  createdAt: string;
  reasoning?: string;
};

type ConfidenceThreshold = {
  id: string;
  name: string;
  category: string;
  minValue: number;
  maxValue: number;
  weight: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

type GlobalSettings = {
  learningEnabled: boolean;
  learningPaused: boolean;
  privacyMode: boolean;
  anonymousData: boolean;
  shareInsights: boolean;
  retentionDays: number;
  confidenceThreshold: number;
  autoRecommendations: boolean;
  maxPatterns: number;
  maxPreferences: number;
  processingInterval: number;
};

export function LearningAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");
  const [search, setSearch] = React.useState("");

  const [showCreateThreshold, setShowCreateThreshold] = React.useState(false);
  const [editingThreshold, setEditingThreshold] = React.useState<ConfidenceThreshold | null>(null);
  const [newThreshold, setNewThreshold] = React.useState<Partial<ConfidenceThreshold>>({
    name: "",
    category: "general",
    minValue: 0.5,
    maxValue: 1.0,
    weight: 1,
    description: "",
  });

  const [settingsDraft, setSettingsDraft] = React.useState<Partial<GlobalSettings>>({});
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [resetType, setResetType] = React.useState("");

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR("/api/learning/stats", fetcher, { revalidateOnFocus: false });
  const { data: patternsData, isLoading: patternsLoading, mutate: mutatePatterns } = useSWR("/api/learning/patterns", fetcher, { revalidateOnFocus: false });
  const { data: recommendationsData, isLoading: recommendationsLoading, mutate: mutateRecommendations } = useSWR("/api/learning/recommendations", fetcher, { revalidateOnFocus: false });
  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR("/api/learning/settings", fetcher, { revalidateOnFocus: false });
  const { data: historyData, isLoading: historyLoading } = useSWR("/api/learning/history", fetcher, { revalidateOnFocus: false });
  const { data: eventsData } = useSWR("/api/learning/events", fetcher, { revalidateOnFocus: false });

  const stats: StatsData | null = statsData?.data ?? statsData ?? null;
  const patternsList: PatternItem[] = React.useMemo(() => {
    const raw = patternsData?.data ?? patternsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [patternsData]);
  const recommendationsList: RecommendationItem[] = React.useMemo(() => {
    const raw = recommendationsData?.data ?? recommendationsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [recommendationsData]);
  const settings: GlobalSettings = React.useMemo(() => {
    return { ...(settingsData?.data ?? settingsData ?? {}), ...settingsDraft };
  }, [settingsData, settingsDraft]);

  const isLoading = statsLoading;

  const refreshAll = () => {
    mutateStats();
    mutatePatterns();
    mutateRecommendations();
    mutateSettings();
  };

  const filteredPatterns = React.useMemo(() => {
    if (!search) return patternsList;
    const q = search.toLowerCase();
    return patternsList.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    );
  }, [patternsList, search]);

  const filteredRecommendations = React.useMemo(() => {
    if (!search) return recommendationsList;
    const q = search.toLowerCase();
    return recommendationsList.filter(
      (r) => r.title?.toLowerCase().includes(q) || r.status?.toLowerCase().includes(q)
    );
  }, [recommendationsList, search]);

  const handleDeletePattern = async (id: string) => {
    try {
      const res = await fetch(`/api/learning/patterns/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("learningEngine.patternDeleted", "Pattern deleted"));
        mutatePatterns();
        mutateStats();
      } else {
        toast.error(t("learningEngine.patternDeleteError", "Failed to delete pattern"));
      }
    } catch {
      toast.error(t("learningEngine.patternDeleteError", "Failed to delete pattern"));
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    try {
      const res = await fetch(`/api/learning/recommendations/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("learningEngine.recommendationDeleted", "Recommendation deleted"));
        mutateRecommendations();
        mutateStats();
      } else {
        toast.error(t("learningEngine.recommendationDeleteError", "Failed to delete recommendation"));
      }
    } catch {
      toast.error(t("learningEngine.recommendationDeleteError", "Failed to delete recommendation"));
    }
  };

  const handleDetectPatterns = async () => {
    try {
      const res = await fetch("/api/learning/patterns/detect", { method: "POST" });
      if (res.ok) {
        toast.success(t("learningEngine.patternsDetected", "Pattern detection started"));
        mutatePatterns();
        mutateStats();
      } else {
        toast.error(t("learningEngine.patternDetectError", "Failed to detect patterns"));
      }
    } catch {
      toast.error(t("learningEngine.patternDetectError", "Failed to detect patterns"));
    }
  };

  const handleCreateThreshold = async () => {
    if (!newThreshold.name?.trim()) return;
    try {
      const res = await fetch("/api/learning/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thresholds: newThreshold }),
      });
      if (res.ok) {
        toast.success(t("learningEngine.thresholdCreated", "Threshold created"));
        setShowCreateThreshold(false);
        setNewThreshold({ name: "", category: "general", minValue: 0.5, maxValue: 1.0, weight: 1, description: "" });
        mutateSettings();
      } else {
        toast.error(t("learningEngine.thresholdCreateError", "Failed to create threshold"));
      }
    } catch {
      toast.error(t("learningEngine.thresholdCreateError", "Failed to create threshold"));
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/learning/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success(t("learningEngine.settingsSaved", "Settings saved"));
        setSettingsDraft({});
        mutateSettings();
      } else {
        toast.error(t("learningEngine.settingsSaveError", "Failed to save settings"));
      }
    } catch {
      toast.error(t("learningEngine.settingsSaveError", "Failed to save settings"));
    }
  };

  const handleResetData = async (type: string) => {
    try {
      const res = await fetch(`/api/learning/settings`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetType: type }),
      });
      if (res.ok) {
        toast.success(t("learningEngine.dataReset", "Data reset successfully"));
        setConfirmReset(false);
        setResetType("");
        refreshAll();
      } else {
        toast.error(t("learningEngine.resetError", "Failed to reset data"));
      }
    } catch {
      toast.error(t("learningEngine.resetError", "Failed to reset data"));
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
      <Breadcrumbs items={[{ label: t("learningEngine.adminTitle", "Learning Engine") }]} />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("learningEngine.adminTitle", "Learning Engine Admin")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("learningEngine.adminDescription", "Manage learning patterns, recommendations, and global settings")}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDetectPatterns}>
              <Brain className="mr-2 size-4" />
              {t("learningEngine.detectPatterns", "Detect Patterns")}
            </Button>
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
              onClick={() => { setActiveTab(key); setSearch(""); }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {t(`learningEngine.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderStatCard(t("learningEngine.totalEvents", "Total Events"), stats?.totalEvents ?? 0, Clock)}
                  {renderStatCard(t("learningEngine.totalPatterns", "Patterns"), stats?.totalPatterns ?? patternsList.length, Brain)}
                  {renderStatCard(t("learningEngine.totalRecommendations", "Recommendations"), stats?.totalRecommendations ?? recommendationsList.length, Zap)}
                  {renderStatCard(t("learningEngine.avgConfidence", "Avg Confidence"), `${((stats?.avgConfidence ?? 0) * 100).toFixed(0)}%`, TrendingUp)}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {renderStatCard(t("learningEngine.totalPreferences", "Preferences"), stats?.totalPreferences ?? 0, Star)}
                  {renderStatCard(t("learningEngine.totalGoals", "Goals"), stats?.totalGoals ?? 0, Target)}
                  {renderStatCard(t("learningEngine.acceptanceRate", "Acceptance Rate"), `${((stats?.acceptanceRate ?? 0) * 100).toFixed(0)}%`, CheckCircle)}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("learningEngine.eventsByType", "Events by Type")}>
                    {(stats?.eventsByType?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {stats!.eventsByType!.map((item, i) => {
                          const maxCount = Math.max(...stats!.eventsByType!.map((a) => a.count), 1);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-32 text-sm">{item.type}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("learningEngine.noData", "No data yet")}
                      </div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("learningEngine.patternsByCategory", "Patterns by Category")}>
                    {(stats?.patternsByCategory?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {stats!.patternsByCategory!.map((item, i) => {
                          const maxCount = Math.max(...stats!.patternsByCategory!.map((a) => a.count), 1);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-32 text-sm">{item.category}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("learningEngine.noData", "No data yet")}
                      </div>
                    )}
                  </DashboardCard>
                </div>
              </div>
            )}

            {activeTab === "patterns" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", "Search...")} className="pl-9" />
                  </div>
                  <Button size="sm" onClick={handleDetectPatterns}>
                    <Brain className="mr-2 size-4" />
                    {t("learningEngine.detectPatterns", "Detect Patterns")}
                  </Button>
                </div>

                <AdminDataTable
                  data={filteredPatterns}
                  keyExtractor={(item: PatternItem) => item.id}
                  columns={[
                    {
                      key: "name",
                      header: t("common.name", "Name"),
                      sortable: true,
                      render: (item: PatternItem) => <span className="font-medium text-sm">{item.name}</span>,
                    },
                    {
                      key: "category",
                      header: t("learningEngine.category", "Category"),
                      sortable: true,
                      render: (item: PatternItem) => <Badge tone="info">{item.category}</Badge>,
                    },
                    {
                      key: "confidence",
                      header: t("learningEngine.confidence", "Confidence"),
                      sortable: true,
                      render: (item: PatternItem) => (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted/40">
                            <div
                              className={`h-2 rounded-full ${
                                item.confidence >= 0.8 ? "bg-green-500" : item.confidence >= 0.5 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${item.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs">{(item.confidence * 100).toFixed(0)}%</span>
                        </div>
                      ),
                    },
                    {
                      key: "occurrences",
                      header: t("learningEngine.occurrences", "Occurrences"),
                      sortable: true,
                      render: (item: PatternItem) => <span className="text-sm">{item.occurrences}</span>,
                    },
                    {
                      key: "status",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: PatternItem) => (
                        <Badge tone={item.status === "active" ? "success" : "muted"}>{item.status}</Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: PatternItem) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDeletePattern(item.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {activeTab === "recommendations" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", "Search...")} className="pl-9" />
                  </div>
                </div>

                <AdminDataTable
                  data={filteredRecommendations}
                  keyExtractor={(item: RecommendationItem) => item.id}
                  columns={[
                    {
                      key: "title",
                      header: t("common.title", "Title"),
                      sortable: true,
                      render: (item: RecommendationItem) => <span className="font-medium text-sm">{item.title}</span>,
                    },
                    {
                      key: "type",
                      header: t("learningEngine.type", "Type"),
                      sortable: true,
                      render: (item: RecommendationItem) => <Badge tone="info">{item.type}</Badge>,
                    },
                    {
                      key: "priority",
                      header: t("learningEngine.priority", "Priority"),
                      sortable: true,
                      render: (item: RecommendationItem) => (
                        <Badge tone={item.priority === "high" ? "warning" : item.priority === "medium" ? "info" : "muted"}>
                          {item.priority}
                        </Badge>
                      ),
                    },
                    {
                      key: "confidence",
                      header: t("learningEngine.confidence", "Confidence"),
                      sortable: true,
                      render: (item: RecommendationItem) => (
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 rounded-full bg-muted/40">
                            <div
                              className={`h-2 rounded-full ${
                                item.confidence >= 0.8 ? "bg-green-500" : item.confidence >= 0.5 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${item.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs">{(item.confidence * 100).toFixed(0)}%</span>
                        </div>
                      ),
                    },
                    {
                      key: "status",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: RecommendationItem) => (
                        <Badge tone={item.status === "accepted" ? "success" : item.status === "ignored" ? "default" : "info"}>
                          {item.status}
                        </Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: RecommendationItem) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteRecommendation(item.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {activeTab === "confidenceThresholds" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{t("learningEngine.confidenceThresholds", "Confidence Thresholds")}</h3>
                  <Button size="sm" onClick={() => setShowCreateThreshold(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateThreshold && (
                  <DashboardCard title={t("learningEngine.newThreshold", "New Threshold")}>
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                          <Input value={newThreshold.name ?? ""} onChange={(e) => setNewThreshold((p) => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.category", "Category")}</label>
                          <Input value={newThreshold.category ?? ""} onChange={(e) => setNewThreshold((p) => ({ ...p, category: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.minValue", "Min Value")}</label>
                          <Input type="number" step="0.1" min="0" max="1" value={newThreshold.minValue ?? 0.5} onChange={(e) => setNewThreshold((p) => ({ ...p, minValue: Number(e.target.value) }))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.maxValue", "Max Value")}</label>
                          <Input type="number" step="0.1" min="0" max="1" value={newThreshold.maxValue ?? 1.0} onChange={(e) => setNewThreshold((p) => ({ ...p, maxValue: Number(e.target.value) }))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.weight", "Weight")}</label>
                          <Input type="number" step="0.1" value={newThreshold.weight ?? 1} onChange={(e) => setNewThreshold((p) => ({ ...p, weight: Number(e.target.value) }))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                          <Input value={newThreshold.description ?? ""} onChange={(e) => setNewThreshold((p) => ({ ...p, description: e.target.value }))} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowCreateThreshold(false)}>
                          {t("common.cancel", "Cancel")}
                        </Button>
                        <Button size="sm" onClick={handleCreateThreshold} disabled={!newThreshold.name?.trim()}>
                          <Save className="mr-2 size-4" />
                          {t("common.save", "Save")}
                        </Button>
                      </div>
                    </div>
                  </DashboardCard>
                )}

                <DashboardCard title={t("learningEngine.globalThreshold", "Global Confidence Threshold")}>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.confidenceThreshold", "Confidence Threshold")}</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={settings.confidenceThreshold ?? 0.7}
                        onChange={(e) => setSettingsDraft((p) => ({ ...p, confidenceThreshold: Number(e.target.value) }))}
                      />
                      <p className="text-xs text-muted-foreground">{t("learningEngine.thresholdDescription", "Minimum confidence level required for patterns and recommendations to be considered valid")}</p>
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleSaveSettings}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderStatCard(t("learningEngine.totalEvents", "Total Events"), stats?.totalEvents ?? 0, Clock)}
                  {renderStatCard(t("learningEngine.totalPatterns", "Patterns"), stats?.totalPatterns ?? patternsList.length, Brain)}
                  {renderStatCard(t("learningEngine.acceptanceRate", "Acceptance Rate"), `${((stats?.acceptanceRate ?? 0) * 100).toFixed(0)}%`, CheckCircle)}
                  {renderStatCard(t("learningEngine.goalProgress", "Goal Progress"), `${((stats?.goalProgress ?? 0) * 100).toFixed(0)}%`, Target)}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("learningEngine.eventsByType", "Events by Type")}>
                    {(stats?.eventsByType?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {stats!.eventsByType!.map((item, i) => {
                          const maxCount = Math.max(...stats!.eventsByType!.map((a) => a.count), 1);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-32 text-sm">{item.type}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("learningEngine.noData", "No data yet")}
                      </div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("learningEngine.patternsByCategory", "Patterns by Category")}>
                    {(stats?.patternsByCategory?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {stats!.patternsByCategory!.map((item, i) => {
                          const maxCount = Math.max(...stats!.patternsByCategory!.map((a) => a.count), 1);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-32 text-sm">{item.category}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("learningEngine.noData", "No data yet")}
                      </div>
                    )}
                  </DashboardCard>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <DashboardCard title={t("learningEngine.globalSettings", "Global Learning Settings")}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium">{t("learningEngine.learningEnabled", "Learning Enabled")}</p>
                        <p className="text-xs text-muted-foreground">{t("learningEngine.learningEnabledDesc", "Enable or disable the continuous learning engine globally")}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.learningEnabled ?? true}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, learningEnabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium">{t("learningEngine.autoRecommendations", "Auto Recommendations")}</p>
                        <p className="text-xs text-muted-foreground">{t("learningEngine.autoRecommendationsDesc", "Automatically generate recommendations based on learned patterns")}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.autoRecommendations ?? true}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, autoRecommendations: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium">{t("learningEngine.privacyMode", "Privacy Mode")}</p>
                        <p className="text-xs text-muted-foreground">{t("learningEngine.privacyModeDesc", "Limit data collection to essential learning data only")}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.privacyMode ?? false}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, privacyMode: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.confidenceThreshold", "Confidence Threshold")}</label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="1"
                          value={settings.confidenceThreshold ?? 0.7}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, confidenceThreshold: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.retentionDays", "Retention Days")}</label>
                        <Input
                          type="number"
                          min="1"
                          value={settings.retentionDays ?? 90}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, retentionDays: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.maxPatterns", "Max Patterns")}</label>
                        <Input
                          type="number"
                          min="1"
                          value={settings.maxPatterns ?? 1000}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, maxPatterns: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.processingInterval", "Processing Interval (min)")}</label>
                        <Input
                          type="number"
                          min="1"
                          value={settings.processingInterval ?? 30}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, processingInterval: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleSaveSettings}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            )}

            {activeTab === "maintenance" && (
              <div className="space-y-6">
                <DashboardCard title={t("learningEngine.dataMaintenance", "Data Maintenance")}>
                  <div className="space-y-4">
                    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="size-4 text-destructive" />
                        <p className="text-sm font-medium text-destructive">{t("learningEngine.dangerZone", "Danger Zone")}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">{t("learningEngine.dangerZoneDesc", "These actions are irreversible. Please be careful.")}</p>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div>
                            <p className="text-sm font-medium">{t("learningEngine.resetPatterns", "Reset Patterns")}</p>
                            <p className="text-xs text-muted-foreground">{t("learningEngine.resetPatternsDesc", "Delete all discovered patterns and start fresh")}</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => { setResetType("patterns"); setConfirmReset(true); }}>
                            <RotateCcw className="mr-2 size-4" />
                            {t("common.reset", "Reset")}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div>
                            <p className="text-sm font-medium">{t("learningEngine.resetPreferences", "Reset Preferences")}</p>
                            <p className="text-xs text-muted-foreground">{t("learningEngine.resetPreferencesDesc", "Delete all inferred preferences")}</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => { setResetType("preferences"); setConfirmReset(true); }}>
                            <RotateCcw className="mr-2 size-4" />
                            {t("common.reset", "Reset")}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div>
                            <p className="text-sm font-medium">{t("learningEngine.resetRecommendations", "Reset Recommendations")}</p>
                            <p className="text-xs text-muted-foreground">{t("learningEngine.resetRecommendationsDesc", "Delete all recommendations")}</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => { setResetType("recommendations"); setConfirmReset(true); }}>
                            <RotateCcw className="mr-2 size-4" />
                            {t("common.reset", "Reset")}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div>
                            <p className="text-sm font-medium">{t("learningEngine.resetAll", "Reset All Learning Data")}</p>
                            <p className="text-xs text-muted-foreground">{t("learningEngine.resetAllDesc", "Delete all learning data including events, patterns, preferences, and recommendations")}</p>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => { setResetType("all"); setConfirmReset(true); }}>
                            <Trash2 className="mr-2 size-4" />
                            {t("learningEngine.resetAll", "Reset All")}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {confirmReset && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                        <p className="text-sm font-medium text-destructive">
                          {t("learningEngine.confirmReset", "Are you sure you want to reset")} {resetType}?
                        </p>
                        <p className="text-xs text-muted-foreground">{t("learningEngine.confirmResetDesc", "This action cannot be undone.")}</p>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setConfirmReset(false); setResetType(""); }}>
                            {t("common.cancel", "Cancel")}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleResetData(resetType)}>
                            <Trash2 className="mr-2 size-4" />
                            {t("learningEngine.confirmResetAction", "Yes, Reset")}
                          </Button>
                        </div>
                      </div>
                    )}
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
