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
  FolderTree,
  Hash,
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
  Tag,
  Brain,
  Eye,
  Copy,
  FileText,
  Star,
  CheckCircle,
  AlertTriangle,
  Power,
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

type TabKey = "overview" | "categories" | "tagRules" | "recognition" | "qualityThresholds" | "analytics" | "settings" | "maintenance";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "overview", icon: BarChart3 },
  { key: "categories", icon: FolderTree },
  { key: "tagRules", icon: Tag },
  { key: "recognition", icon: Brain },
  { key: "qualityThresholds", icon: Sliders },
  { key: "analytics", icon: TrendingUp },
  { key: "settings", icon: Settings },
  { key: "maintenance", icon: Wrench },
];

type StatsData = {
  totalAssets?: number;
  totalTags?: number;
  totalCategories?: number;
  totalCollections?: number;
  duplicateGroups?: number;
  avgQualityScore?: number;
  assetsByType?: { type: string; count: number }[];
  qualityDistribution?: { range: string; count: number }[];
};

type CategoryItem = {
  id: string;
  name: string;
  parentId?: string;
  slug?: string;
  description?: string;
  icon?: string;
  assetCount?: number;
  children?: CategoryItem[];
  createdAt?: string;
};

type TagRule = {
  id: string;
  name: string;
  pattern?: string;
  type?: string;
  auto?: boolean;
  priority?: number;
  enabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type RecognitionConfig = {
  id?: string;
  enabled?: boolean;
  model?: string;
  confidenceThreshold?: number;
  supportedTypes?: string[];
  autoProcess?: boolean;
  maxBatchSize?: number;
  createdAt?: string;
  updatedAt?: string;
};

type QualityThreshold = {
  id: string;
  name: string;
  category: string;
  minScore: number;
  maxScore: number;
  weight: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

type QualityStats = {
  totalReports?: number;
  passed?: number;
  failed?: number;
  avgScore?: number;
  approvalRate?: number;
  byAssetType?: { type: string; count: number }[];
};

type AppSettings = {
  autoTagging?: boolean;
  autoClassification?: boolean;
  duplicateDetection?: boolean;
  qualityScoring?: boolean;
  autoTagConfidence?: number;
  duplicateSimilarityThreshold?: number;
  qualityMinThreshold?: number;
  maxAutoTags?: number;
};

export function AssetIntelligenceAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");
  const [search, setSearch] = React.useState("");

  const [showCreateCategory, setShowCreateCategory] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<CategoryItem | null>(null);
  const [newCategory, setNewCategory] = React.useState<Partial<CategoryItem>>({ name: "", description: "", parentId: "" });

  const [showCreateTagRule, setShowCreateTagRule] = React.useState(false);
  const [editingTagRule, setEditingTagRule] = React.useState<TagRule | null>(null);
  const [newTagRule, setNewTagRule] = React.useState<Partial<TagRule>>({ name: "", pattern: "", type: "keyword", auto: true, priority: 0, enabled: true });

  const [recognitionDraft, setRecognitionDraft] = React.useState<Partial<RecognitionConfig>>({});
  const [showCreateThreshold, setShowCreateThreshold] = React.useState(false);
  const [editingThreshold, setEditingThreshold] = React.useState<QualityThreshold | null>(null);
  const [newThreshold, setNewThreshold] = React.useState<Partial<QualityThreshold>>({ name: "", category: "general", minScore: 0, maxScore: 100, weight: 1, description: "" });

  const [settingsDraft, setSettingsDraft] = React.useState<Partial<AppSettings>>({});

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR("/api/asset-intelligence/stats", fetcher, { revalidateOnFocus: false });
  const { data: categoriesData, isLoading: categoriesLoading, mutate: mutateCategories } = useSWR("/api/asset-intelligence/categories", fetcher, { revalidateOnFocus: false });
  const { data: classificationsData, isLoading: classificationsLoading, mutate: mutateClassifications } = useSWR("/api/asset-intelligence/classifications", fetcher, { revalidateOnFocus: false });
  const { data: recognitionData, isLoading: recognitionLoading, mutate: mutateRecognition } = useSWR("/api/asset-intelligence/recognition", fetcher, { revalidateOnFocus: false });
  const { data: qualityData, isLoading: qualityLoading, mutate: mutateQuality } = useSWR("/api/asset-intelligence/quality", fetcher, { revalidateOnFocus: false });
  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR("/api/asset-intelligence/settings", fetcher, { revalidateOnFocus: false });
  const { data: metadataData, isLoading: metadataLoading } = useSWR("/api/asset-intelligence/metadata", fetcher, { revalidateOnFocus: false });

  const stats: StatsData | null = statsData?.data ?? statsData ?? null;
  const categoriesList: CategoryItem[] = React.useMemo(() => {
    const raw = categoriesData?.data ?? categoriesData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [categoriesData]);
  const tagRulesList: TagRule[] = React.useMemo(() => {
    const raw = classificationsData?.data ?? classificationsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [classificationsData]);
  const recognitionConfig: RecognitionConfig = React.useMemo(() => {
    return recognitionData?.data ?? recognitionData ?? {};
  }, [recognitionData]);
  const qualityList: any[] = React.useMemo(() => {
    const raw = qualityData?.data ?? qualityData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [qualityData]);
  const settings: AppSettings = React.useMemo(() => {
    return { ...(settingsData?.data ?? settingsData ?? {}), ...settingsDraft };
  }, [settingsData, settingsDraft]);

  const isLoading = statsLoading || categoriesLoading || qualityLoading;

  const qualityStats: QualityStats = React.useMemo(() => {
    const total = qualityList.length;
    const passed = qualityList.filter((q) => q.score >= 70).length;
    const failed = total - passed;
    const avgScore = total > 0 ? qualityList.reduce((sum: number, q: any) => sum + (q.score ?? 0), 0) / total : 0;
    const approvalRate = total > 0 ? (passed / total) * 100 : 0;
    const byTypeMap = new Map<string, number>();
    qualityList.forEach((q: any) => {
      const type = q.asset?.kind || q.assetType || "unknown";
      byTypeMap.set(type, (byTypeMap.get(type) ?? 0) + 1);
    });
    return {
      totalReports: total,
      passed,
      failed,
      avgScore,
      approvalRate,
      byAssetType: Array.from(byTypeMap.entries()).map(([type, count]) => ({ type, count })),
    };
  }, [qualityList]);

  const refreshAll = () => {
    mutateStats();
    mutateCategories();
    mutateClassifications();
    mutateRecognition();
    mutateQuality();
    mutateSettings();
  };

  const filteredCategories = React.useMemo(() => {
    if (!search) return categoriesList;
    const q = search.toLowerCase();
    return categoriesList.filter((c) => c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
  }, [categoriesList, search]);

  const filteredTagRules = React.useMemo(() => {
    if (!search) return tagRulesList;
    const q = search.toLowerCase();
    return tagRulesList.filter((r) => r.name?.toLowerCase().includes(q) || r.pattern?.toLowerCase().includes(q));
  }, [tagRulesList, search]);

  const filteredThresholds = React.useMemo(() => {
    if (!search) return qualityList;
    const q = search.toLowerCase();
    return qualityList.filter((th: any) => th.name?.toLowerCase().includes(q) || th.category?.toLowerCase().includes(q));
  }, [qualityList, search]);

  const handleCreateCategory = async () => {
    if (!newCategory.name?.trim()) return;
    try {
      const res = await fetch("/api/asset-intelligence/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.categoryCreated", "Category created"));
        setShowCreateCategory(false);
        setNewCategory({ name: "", description: "", parentId: "" });
        mutateCategories();
        mutateStats();
      } else {
        toast.error(t("assetIntelligence.categoryCreateError", "Failed to create category"));
      }
    } catch {
      toast.error(t("assetIntelligence.categoryCreateError", "Failed to create category"));
    }
  };

  const handleUpdateCategory = async (id: string, updates: Partial<CategoryItem>) => {
    try {
      const res = await fetch(`/api/asset-intelligence/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.categoryUpdated", "Category updated"));
        setEditingCategory(null);
        mutateCategories();
      } else {
        toast.error(t("assetIntelligence.categoryUpdateError", "Failed to update category"));
      }
    } catch {
      toast.error(t("assetIntelligence.categoryUpdateError", "Failed to update category"));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/asset-intelligence/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("assetIntelligence.categoryDeleted", "Category deleted"));
        mutateCategories();
        mutateStats();
      } else {
        toast.error(t("assetIntelligence.categoryDeleteError", "Failed to delete category"));
      }
    } catch {
      toast.error(t("assetIntelligence.categoryDeleteError", "Failed to delete category"));
    }
  };

  const handleCreateTagRule = async () => {
    if (!newTagRule.name?.trim()) return;
    try {
      const res = await fetch("/api/asset-intelligence/classifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTagRule),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.tagRuleCreated", "Tag rule created"));
        setShowCreateTagRule(false);
        setNewTagRule({ name: "", pattern: "", type: "keyword", auto: true, priority: 0, enabled: true });
        mutateClassifications();
        mutateStats();
      } else {
        toast.error(t("assetIntelligence.tagRuleCreateError", "Failed to create tag rule"));
      }
    } catch {
      toast.error(t("assetIntelligence.tagRuleCreateError", "Failed to create tag rule"));
    }
  };

  const handleUpdateTagRule = async (id: string, updates: Partial<TagRule>) => {
    try {
      const res = await fetch(`/api/asset-intelligence/classifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.tagRuleUpdated", "Tag rule updated"));
        setEditingTagRule(null);
        mutateClassifications();
      } else {
        toast.error(t("assetIntelligence.tagRuleUpdateError", "Failed to update tag rule"));
      }
    } catch {
      toast.error(t("assetIntelligence.tagRuleUpdateError", "Failed to update tag rule"));
    }
  };

  const handleDeleteTagRule = async (id: string) => {
    try {
      const res = await fetch(`/api/asset-intelligence/classifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("assetIntelligence.tagRuleDeleted", "Tag rule deleted"));
        mutateClassifications();
        mutateStats();
      } else {
        toast.error(t("assetIntelligence.tagRuleDeleteError", "Failed to delete tag rule"));
      }
    } catch {
      toast.error(t("assetIntelligence.tagRuleDeleteError", "Failed to delete tag rule"));
    }
  };

  const handleSaveRecognition = async () => {
    try {
      const res = await fetch("/api/asset-intelligence/recognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recognitionDraft),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.recognitionSaved", "Recognition settings saved"));
        setRecognitionDraft({});
        mutateRecognition();
      } else {
        toast.error(t("assetIntelligence.recognitionSaveError", "Failed to save recognition settings"));
      }
    } catch {
      toast.error(t("assetIntelligence.recognitionSaveError", "Failed to save recognition settings"));
    }
  };

  const handleCreateThreshold = async () => {
    if (!newThreshold.name?.trim()) return;
    try {
      const res = await fetch("/api/asset-intelligence/quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newThreshold),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.thresholdCreated", "Threshold created"));
        setShowCreateThreshold(false);
        setNewThreshold({ name: "", category: "general", minScore: 0, maxScore: 100, weight: 1, description: "" });
        mutateQuality();
      } else {
        toast.error(t("assetIntelligence.thresholdCreateError", "Failed to create threshold"));
      }
    } catch {
      toast.error(t("assetIntelligence.thresholdCreateError", "Failed to create threshold"));
    }
  };

  const handleUpdateThreshold = async (id: string, updates: Partial<QualityThreshold>) => {
    try {
      const res = await fetch(`/api/asset-intelligence/quality/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.thresholdUpdated", "Threshold updated"));
        setEditingThreshold(null);
        mutateQuality();
      } else {
        toast.error(t("assetIntelligence.thresholdUpdateError", "Failed to update threshold"));
      }
    } catch {
      toast.error(t("assetIntelligence.thresholdUpdateError", "Failed to update threshold"));
    }
  };

  const handleDeleteThreshold = async (id: string) => {
    try {
      const res = await fetch(`/api/asset-intelligence/quality/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("assetIntelligence.thresholdDeleted", "Threshold deleted"));
        mutateQuality();
      } else {
        toast.error(t("assetIntelligence.thresholdDeleteError", "Failed to delete threshold"));
      }
    } catch {
      toast.error(t("assetIntelligence.thresholdDeleteError", "Failed to delete threshold"));
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/asset-intelligence/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.settingsSaved", "Settings saved"));
        setSettingsDraft({});
        mutateSettings();
      } else {
        toast.error(t("assetIntelligence.settingsSaveError", "Failed to save settings"));
      }
    } catch {
      toast.error(t("assetIntelligence.settingsSaveError", "Failed to save settings"));
    }
  };

  const handleRebuildIndex = async () => {
    try {
      const res = await fetch("/api/asset-intelligence/search/rebuild", { method: "POST" });
      if (res.ok) {
        toast.success(t("assetIntelligence.indexRebuilt", "Search index rebuilt"));
      } else {
        toast.error(t("assetIntelligence.rebuildError", "Failed to rebuild index"));
      }
    } catch {
      toast.error(t("assetIntelligence.rebuildError", "Failed to rebuild index"));
    }
  };

  const handleClearData = async (type: string) => {
    try {
      const res = await fetch(`/api/asset-intelligence/${type}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("assetIntelligence.dataCleared", "Data cleared"));
        refreshAll();
      } else {
        toast.error(t("assetIntelligence.clearError", "Failed to clear data"));
      }
    } catch {
      toast.error(t("assetIntelligence.clearError", "Failed to clear data"));
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

  const renderCategoryTree = (items: CategoryItem[], depth: number = 0) => {
    return items.map((cat) => (
      <div key={cat.id} style={{ paddingLeft: `${depth * 20}px` }}>
        <div className={`flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 mb-2 ${editingCategory?.id === cat.id ? "border-primary/50" : ""}`}>
          <div className="flex items-center gap-2 min-w-0">
            <FolderTree className="size-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <span className="font-medium text-sm truncate block">{cat.name}</span>
              {cat.description && <span className="text-xs text-muted-foreground truncate block">{cat.description}</span>}
            </div>
            {cat.assetCount != null && <Badge tone="muted">{cat.assetCount}</Badge>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon-sm" onClick={() => setEditingCategory(editingCategory?.id === cat.id ? null : cat)}>
              <Settings className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteCategory(cat.id)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
        {editingCategory?.id === cat.id && (
          <div className="ml-6 mb-2 rounded-xl border border-border bg-muted/10 p-3 space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                <Input value={editingCategory.name} onChange={(e) => setEditingCategory((p) => p ? { ...p, name: e.target.value } : null)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                <Input value={editingCategory.description ?? ""} onChange={(e) => setEditingCategory((p) => p ? { ...p, description: e.target.value } : null)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingCategory(null)}><X className="size-4" /></Button>
              <Button size="sm" onClick={() => editingCategory && handleUpdateCategory(editingCategory.id, editingCategory)}>
                <Save className="mr-2 size-4" />{t("common.save", "Save")}
              </Button>
            </div>
          </div>
        )}
        {cat.children && cat.children.length > 0 && renderCategoryTree(cat.children, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("assetIntelligence.adminTitle", "Asset Intelligence") }]} />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("assetIntelligence.adminTitle", "Asset Intelligence")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("assetIntelligence.adminDescription", "Manage asset intelligence settings, categories, and quality thresholds")}</p>
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
              onClick={() => { setActiveTab(key); setSearch(""); }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {t(`assetIntelligence.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
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
                  {renderStatCard(t("assetIntelligence.totalAssets", "Total Assets"), stats?.totalAssets ?? metadataData?.data?.length ?? 0, FileText)}
                  {renderStatCard(t("assetIntelligence.totalTags", "Tags"), stats?.totalTags ?? 0, Tag)}
                  {renderStatCard(t("assetIntelligence.totalCategories", "Categories"), stats?.totalCategories ?? categoriesList.length, FolderTree)}
                  {renderStatCard(t("assetIntelligence.duplicateGroups", "Duplicate Groups"), stats?.duplicateGroups ?? 0, Copy)}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {renderStatCard(t("assetIntelligence.avgQuality", "Avg Quality Score"), stats?.avgQualityScore?.toFixed(1) ?? qualityStats.avgScore?.toFixed(1), Star)}
                  {renderStatCard(t("assetIntelligence.totalReports", "Quality Reports"), qualityStats.totalReports ?? qualityList.length, BarChart3)}
                  {renderStatCard(t("assetIntelligence.approvalRate", "Approval Rate"), `${(qualityStats.approvalRate ?? 0).toFixed(1)}%`, CheckCircle)}
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("assetIntelligence.assetsByType", "Assets by Type")}>
                    {(stats?.assetsByType?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {stats!.assetsByType!.map((item, i) => {
                          const maxCount = Math.max(...stats!.assetsByType!.map((a) => a.count), 1);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-24 text-sm">{item.type || "unknown"}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (qualityStats.byAssetType?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {qualityStats.byAssetType?.map((item, i) => {
                          const maxCount = Math.max(...qualityStats.byAssetType!.map((a) => a.count), 1);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-24 text-sm">{item.type || "unknown"}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">{t("assetIntelligence.noData", "No data yet")}</div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("assetIntelligence.qualityDistribution", "Quality Distribution")}>
                    {(stats?.qualityDistribution?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {stats!.qualityDistribution!.map((item, i) => {
                          const maxCount = Math.max(...stats!.qualityDistribution!.map((a) => a.count), 1);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-24 text-sm">{item.range}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">{t("assetIntelligence.noData", "No data yet")}</div>
                    )}
                  </DashboardCard>
                </div>
              </div>
            )}

            {activeTab === "categories" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", "Search...")} className="pl-9" />
                  </div>
                  <Button size="sm" onClick={() => setShowCreateCategory(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateCategory && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("assetIntelligence.newCategory", "New Category")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateCategory(false)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input value={newCategory.name ?? ""} onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input value={newCategory.description ?? ""} onChange={(e) => setNewCategory((p) => ({ ...p, description: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.parentCategory", "Parent Category")}</label>
                        <select value={newCategory.parentId ?? ""} onChange={(e) => setNewCategory((p) => ({ ...p, parentId: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm h-8">
                          <option value="">{t("assetIntelligence.none", "None")}</option>
                          {categoriesList.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCreateCategory(false)}>{t("common.cancel", "Cancel")}</Button>
                      <Button size="sm" onClick={handleCreateCategory} disabled={!newCategory.name?.trim()}>
                        <Save className="mr-2 size-4" />{t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
                ) : filteredCategories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FolderTree className="mb-3 size-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("assetIntelligence.noCategories", "No categories yet")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">{renderCategoryTree(filteredCategories)}</div>
                )}
              </div>
            )}

            {activeTab === "tagRules" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", "Search...")} className="pl-9" />
                  </div>
                  <Button size="sm" onClick={() => setShowCreateTagRule(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateTagRule && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("assetIntelligence.newTagRule", "New Tag Rule")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateTagRule(false)}><X className="size-4" /></Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input value={newTagRule.name ?? ""} onChange={(e) => setNewTagRule((p) => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.pattern", "Pattern")}</label>
                        <Input value={newTagRule.pattern ?? ""} onChange={(e) => setNewTagRule((p) => ({ ...p, pattern: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.type", "Type")}</label>
                        <select value={newTagRule.type ?? "keyword"} onChange={(e) => setNewTagRule((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm h-8">
                          <option value="keyword">{t("assetIntelligence.keyword", "Keyword")}</option>
                          <option value="regex">{t("assetIntelligence.regex", "Regex")}</option>
                          <option value="ai">{t("assetIntelligence.ai", "AI")}</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.priority", "Priority")}</label>
                        <Input type="number" value={newTagRule.priority ?? 0} onChange={(e) => setNewTagRule((p) => ({ ...p, priority: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={newTagRule.auto ?? true} onChange={(e) => setNewTagRule((p) => ({ ...p, auto: e.target.checked }))} className="size-4 rounded border-border" />
                        {t("assetIntelligence.autoApply", "Auto Apply")}
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={newTagRule.enabled ?? true} onChange={(e) => setNewTagRule((p) => ({ ...p, enabled: e.target.checked }))} className="size-4 rounded border-border" />
                        {t("common.enabled", "Enabled")}
                      </label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCreateTagRule(false)}>{t("common.cancel", "Cancel")}</Button>
                      <Button size="sm" onClick={handleCreateTagRule} disabled={!newTagRule.name?.trim()}>
                        <Save className="mr-2 size-4" />{t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {editingTagRule && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("assetIntelligence.editTagRule", "Edit Tag Rule")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingTagRule(null)}><X className="size-4" /></Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input value={editingTagRule.name} onChange={(e) => setEditingTagRule((p) => p ? { ...p, name: e.target.value } : null)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.pattern", "Pattern")}</label>
                        <Input value={editingTagRule.pattern ?? ""} onChange={(e) => setEditingTagRule((p) => p ? { ...p, pattern: e.target.value } : null)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.type", "Type")}</label>
                        <select value={editingTagRule.type ?? "keyword"} onChange={(e) => setEditingTagRule((p) => p ? { ...p, type: e.target.value } : null)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm h-8">
                          <option value="keyword">{t("assetIntelligence.keyword", "Keyword")}</option>
                          <option value="regex">{t("assetIntelligence.regex", "Regex")}</option>
                          <option value="ai">{t("assetIntelligence.ai", "AI")}</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.priority", "Priority")}</label>
                        <Input type="number" value={editingTagRule.priority ?? 0} onChange={(e) => setEditingTagRule((p) => p ? { ...p, priority: Number(e.target.value) } : null)} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={editingTagRule.auto ?? false} onChange={(e) => setEditingTagRule((p) => p ? { ...p, auto: e.target.checked } : null)} className="size-4 rounded border-border" />
                        {t("assetIntelligence.autoApply", "Auto Apply")}
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={editingTagRule.enabled ?? true} onChange={(e) => setEditingTagRule((p) => p ? { ...p, enabled: e.target.checked } : null)} className="size-4 rounded border-border" />
                        {t("common.enabled", "Enabled")}
                      </label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingTagRule(null)}>{t("common.cancel", "Cancel")}</Button>
                      <Button size="sm" onClick={() => editingTagRule && handleUpdateTagRule(editingTagRule.id, editingTagRule)}>
                        <Save className="mr-2 size-4" />{t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                <AdminDataTable
                  data={filteredTagRules}
                  keyExtractor={(rule: TagRule) => rule.id}
                  columns={[
                    {
                      key: "name",
                      header: t("common.name", "Name"),
                      sortable: true,
                      render: (item: TagRule) => <span className="font-medium text-sm">{item.name}</span>,
                    },
                    {
                      key: "pattern",
                      header: t("assetIntelligence.pattern", "Pattern"),
                      sortable: true,
                      render: (item: TagRule) => <span className="text-sm font-mono">{item.pattern ?? "-"}</span>,
                    },
                    {
                      key: "type",
                      header: t("assetIntelligence.type", "Type"),
                      sortable: true,
                      render: (item: TagRule) => <Badge tone="info">{item.type ?? "keyword"}</Badge>,
                    },
                    {
                      key: "auto",
                      header: t("assetIntelligence.autoApply", "Auto"),
                      render: (item: TagRule) => <Badge tone={item.auto ? "success" : "muted"}>{item.auto ? "Yes" : "No"}</Badge>,
                    },
                    {
                      key: "enabled",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: TagRule) => <Badge tone={item.enabled ? "success" : "default"}>{item.enabled ? t("common.enabled", "Enabled") : t("common.disabled", "Disabled")}</Badge>,
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: TagRule) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditingTagRule(item)}><Settings className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteTagRule(item.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {activeTab === "recognition" && (
              <div className="space-y-4">
                <DashboardCard title={t("assetIntelligence.recognitionSettings", "Recognition Settings")}>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.model", "Model")}</label>
                        <Input value={recognitionDraft.model ?? recognitionConfig.model ?? ""} onChange={(e) => setRecognitionDraft((p) => ({ ...p, model: e.target.value }))} placeholder="e.g. gpt-4o-mini" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.confidenceThreshold", "Confidence Threshold")}</label>
                        <Input type="number" step="0.1" min="0" max="1" value={recognitionDraft.confidenceThreshold ?? recognitionConfig.confidenceThreshold ?? 0.7} onChange={(e) => setRecognitionDraft((p) => ({ ...p, confidenceThreshold: Number(e.target.value) }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.maxBatchSize", "Max Batch Size")}</label>
                        <Input type="number" value={recognitionDraft.maxBatchSize ?? recognitionConfig.maxBatchSize ?? 10} onChange={(e) => setRecognitionDraft((p) => ({ ...p, maxBatchSize: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={recognitionDraft.enabled ?? recognitionConfig.enabled ?? true} onChange={(e) => setRecognitionDraft((p) => ({ ...p, enabled: e.target.checked }))} className="size-4 rounded border-border" />
                        {t("common.enabled", "Enabled")}
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={recognitionDraft.autoProcess ?? recognitionConfig.autoProcess ?? false} onChange={(e) => setRecognitionDraft((p) => ({ ...p, autoProcess: e.target.checked }))} className="size-4 rounded border-border" />
                        {t("assetIntelligence.autoProcess", "Auto Process")}
                      </label>
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleSaveRecognition}>
                        <Save className="mr-2 size-4" />{t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            )}

            {activeTab === "qualityThresholds" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", "Search...")} className="pl-9" />
                  </div>
                  <Button size="sm" onClick={() => setShowCreateThreshold(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateThreshold && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("assetIntelligence.newThreshold", "New Threshold")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateThreshold(false)}><X className="size-4" /></Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input value={newThreshold.name ?? ""} onChange={(e) => setNewThreshold((p) => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.category", "Category")}</label>
                        <Input value={newThreshold.category ?? ""} onChange={(e) => setNewThreshold((p) => ({ ...p, category: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.minScore", "Min Score")}</label>
                        <Input type="number" value={newThreshold.minScore ?? 0} onChange={(e) => setNewThreshold((p) => ({ ...p, minScore: Number(e.target.value) }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.maxScore", "Max Score")}</label>
                        <Input type="number" value={newThreshold.maxScore ?? 100} onChange={(e) => setNewThreshold((p) => ({ ...p, maxScore: Number(e.target.value) }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.weight", "Weight")}</label>
                        <Input type="number" step="0.1" value={newThreshold.weight ?? 1} onChange={(e) => setNewThreshold((p) => ({ ...p, weight: Number(e.target.value) }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input value={newThreshold.description ?? ""} onChange={(e) => setNewThreshold((p) => ({ ...p, description: e.target.value }))} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCreateThreshold(false)}>{t("common.cancel", "Cancel")}</Button>
                      <Button size="sm" onClick={handleCreateThreshold} disabled={!newThreshold.name?.trim()}>
                        <Save className="mr-2 size-4" />{t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {editingThreshold && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("assetIntelligence.editThreshold", "Edit Threshold")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingThreshold(null)}><X className="size-4" /></Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input value={editingThreshold.name} onChange={(e) => setEditingThreshold((p) => p ? { ...p, name: e.target.value } : null)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.category", "Category")}</label>
                        <Input value={editingThreshold.category} onChange={(e) => setEditingThreshold((p) => p ? { ...p, category: e.target.value } : null)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.minScore", "Min Score")}</label>
                        <Input type="number" value={editingThreshold.minScore} onChange={(e) => setEditingThreshold((p) => p ? { ...p, minScore: Number(e.target.value) } : null)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.maxScore", "Max Score")}</label>
                        <Input type="number" value={editingThreshold.maxScore} onChange={(e) => setEditingThreshold((p) => p ? { ...p, maxScore: Number(e.target.value) } : null)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.weight", "Weight")}</label>
                        <Input type="number" step="0.1" value={editingThreshold.weight} onChange={(e) => setEditingThreshold((p) => p ? { ...p, weight: Number(e.target.value) } : null)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input value={editingThreshold.description ?? ""} onChange={(e) => setEditingThreshold((p) => p ? { ...p, description: e.target.value } : null)} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingThreshold(null)}>{t("common.cancel", "Cancel")}</Button>
                      <Button size="sm" onClick={() => editingThreshold && handleUpdateThreshold(editingThreshold.id, editingThreshold)}>
                        <Save className="mr-2 size-4" />{t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                <AdminDataTable
                  data={filteredThresholds}
                  keyExtractor={(th: any) => th.id}
                  columns={[
                    { key: "name", header: t("common.name", "Name"), sortable: true, render: (item: any) => <span className="font-medium text-sm">{item.name}</span> },
                    { key: "category", header: t("assetIntelligence.category", "Category"), sortable: true, render: (item: any) => <Badge tone="muted">{item.category}</Badge> },
                    { key: "minScore", header: t("assetIntelligence.minScore", "Min"), sortable: true, render: (item: any) => <span className="text-sm">{item.minScore ?? "-"}</span> },
                    { key: "maxScore", header: t("assetIntelligence.maxScore", "Max"), sortable: true, render: (item: any) => <span className="text-sm">{item.maxScore ?? "-"}</span> },
                    { key: "weight", header: t("assetIntelligence.weight", "Weight"), sortable: true, render: (item: any) => <span className="text-sm">{item.weight ?? "-"}</span> },
                    { key: "score", header: t("assetIntelligence.score", "Score"), sortable: true, render: (item: any) => <Badge tone={item.score >= 80 ? "success" : item.score >= 50 ? "warning" : "default"}>{item.score ?? "-"}</Badge> },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: any) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditingThreshold(item)}><Settings className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteThreshold(item.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {renderStatCard(t("assetIntelligence.totalReports", "Total Reports"), qualityStats.totalReports, FileText)}
                  {renderStatCard(t("assetIntelligence.passed", "Passed"), qualityStats.passed, CheckCircle)}
                  {renderStatCard(t("assetIntelligence.failed", "Failed"), qualityStats.failed, AlertTriangle)}
                  {renderStatCard(t("assetIntelligence.avgScore", "Avg Score"), qualityStats.avgScore?.toFixed(1), Star)}
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("assetIntelligence.reportsByType", "Reports by Type")}>
                    {(qualityStats.byAssetType?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {qualityStats.byAssetType?.map((item, i) => {
                          const maxCount = Math.max(...(qualityStats.byAssetType?.map((a) => a.count) ?? [0]), 1);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-24 text-sm">{item.type}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">{t("assetIntelligence.noData", "No data yet")}</div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("assetIntelligence.approvalRate", "Approval Rate")}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{t("assetIntelligence.approvalRate", "Approval Rate")}</span>
                        <span className="text-2xl font-bold">{(qualityStats.approvalRate ?? 0).toFixed(1)}%</span>
                      </div>
                      <div className="h-4 rounded-full bg-muted/40 overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(qualityStats.approvalRate ?? 0, 100)}%` }} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">{t("assetIntelligence.passed", "Passed")}</p>
                          <p className="text-lg font-bold text-green-500">{qualityStats.passed}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">{t("assetIntelligence.failed", "Failed")}</p>
                          <p className="text-lg font-bold text-red-500">{qualityStats.failed}</p>
                        </div>
                      </div>
                    </div>
                  </DashboardCard>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                <DashboardCard title={t("assetIntelligence.automationSettings", "Automation Settings")}>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex items-center gap-3">
                          <Zap className="size-5 text-amber-500" />
                          <div>
                            <p className="font-medium text-sm">{t("assetIntelligence.autoTagging", "Auto Tagging")}</p>
                            <p className="text-xs text-muted-foreground">{t("assetIntelligence.autoTaggingDesc", "Automatically apply tags to assets")}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSettingsDraft((p) => ({ ...p, autoTagging: !(settings.autoTagging ?? false) }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoTagging ? "bg-primary" : "bg-muted"}`}
                        >
                          <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${settings.autoTagging ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex items-center gap-3">
                          <Brain className="size-5 text-purple-500" />
                          <div>
                            <p className="font-medium text-sm">{t("assetIntelligence.autoClassification", "Auto Classification")}</p>
                            <p className="text-xs text-muted-foreground">{t("assetIntelligence.autoClassificationDesc", "Automatically classify assets into categories")}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSettingsDraft((p) => ({ ...p, autoClassification: !(settings.autoClassification ?? false) }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoClassification ? "bg-primary" : "bg-muted"}`}
                        >
                          <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${settings.autoClassification ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex items-center gap-3">
                          <Copy className="size-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">{t("assetIntelligence.duplicateDetection", "Duplicate Detection")}</p>
                            <p className="text-xs text-muted-foreground">{t("assetIntelligence.duplicateDetectionDesc", "Detect similar or duplicate assets")}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSettingsDraft((p) => ({ ...p, duplicateDetection: !(settings.duplicateDetection ?? false) }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.duplicateDetection ? "bg-primary" : "bg-muted"}`}
                        >
                          <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${settings.duplicateDetection ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex items-center gap-3">
                          <Star className="size-5 text-green-500" />
                          <div>
                            <p className="font-medium text-sm">{t("assetIntelligence.qualityScoring", "Quality Scoring")}</p>
                            <p className="text-xs text-muted-foreground">{t("assetIntelligence.qualityScoringDesc", "Automatically score asset quality")}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSettingsDraft((p) => ({ ...p, qualityScoring: !(settings.qualityScoring ?? false) }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.qualityScoring ? "bg-primary" : "bg-muted"}`}
                        >
                          <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${settings.qualityScoring ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-border">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.autoTagConfidence", "Auto Tag Confidence")}</label>
                        <Input type="number" step="0.1" min="0" max="1" value={settings.autoTagConfidence ?? 0.7} onChange={(e) => setSettingsDraft((p) => ({ ...p, autoTagConfidence: Number(e.target.value) }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.duplicateSimilarity", "Duplicate Similarity Threshold")}</label>
                        <Input type="number" step="0.1" min="0" max="1" value={settings.duplicateSimilarityThreshold ?? 0.9} onChange={(e) => setSettingsDraft((p) => ({ ...p, duplicateSimilarityThreshold: Number(e.target.value) }))} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("assetIntelligence.qualityMinThreshold", "Quality Min Threshold")}</label>
                        <Input type="number" min="0" max="100" value={settings.qualityMinThreshold ?? 50} onChange={(e) => setSettingsDraft((p) => ({ ...p, qualityMinThreshold: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <div className="flex justify-end pt-4">
                      <Button size="sm" onClick={handleSaveSettings}>
                        <Save className="mr-2 size-4" />{t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                </DashboardCard>
              </div>
            )}

            {activeTab === "maintenance" && (
              <div className="space-y-4">
                <DashboardCard title={t("assetIntelligence.searchIndex", "Search Index")}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{t("assetIntelligence.rebuildSearchIndex", "Rebuild Search Index")}</p>
                      <p className="text-xs text-muted-foreground">{t("assetIntelligence.rebuildSearchIndexDesc", "Rebuild the full-text search index for all assets")}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRebuildIndex}>
                      <RefreshCw className="mr-2 size-4" />
                      {t("assetIntelligence.rebuild", "Rebuild")}
                    </Button>
                  </div>
                </DashboardCard>

                <DashboardCard title={t("assetIntelligence.clearData", "Clear Data")}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                      <div>
                        <p className="font-medium text-sm">{t("assetIntelligence.clearMetadata", "Clear All Metadata")}</p>
                        <p className="text-xs text-muted-foreground">{t("assetIntelligence.clearMetadataDesc", "Remove all asset metadata entries")}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleClearData("metadata")}>
                        <Trash2 className="mr-2 size-3.5" />
                        {t("common.clear", "Clear")}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                      <div>
                        <p className="font-medium text-sm">{t("assetIntelligence.clearDuplicates", "Clear Duplicate Groups")}</p>
                        <p className="text-xs text-muted-foreground">{t("assetIntelligence.clearDuplicatesDesc", "Remove all duplicate detection results")}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleClearData("duplicates")}>
                        <Trash2 className="mr-2 size-3.5" />
                        {t("common.clear", "Clear")}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                      <div>
                        <p className="font-medium text-sm">{t("assetIntelligence.clearRelationships", "Clear Relationships")}</p>
                        <p className="text-xs text-muted-foreground">{t("assetIntelligence.clearRelationshipsDesc", "Remove all asset relationships")}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleClearData("relationships")}>
                        <Trash2 className="mr-2 size-3.5" />
                        {t("common.clear", "Clear")}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                      <div>
                        <p className="font-medium text-sm">{t("assetIntelligence.clearQuality", "Clear Quality Data")}</p>
                        <p className="text-xs text-muted-foreground">{t("assetIntelligence.clearQualityDesc", "Remove all quality scores and thresholds")}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleClearData("quality")}>
                        <Trash2 className="mr-2 size-3.5" />
                        {t("common.clear", "Clear")}
                      </Button>
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
