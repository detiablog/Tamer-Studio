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
  CheckCircle,
  Download,
  FileText,
  History,
  Loader,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldCheck,
  ShieldX,
  Sliders,
  Star,
  Trash2,
  TrendingUp,
  Upload,
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

type TabKey = "overview" | "rules" | "thresholds" | "analytics" | "settings" | "maintenance";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "overview", icon: BarChart3 },
  { key: "rules", icon: ShieldCheck },
  { key: "thresholds", icon: Sliders },
  { key: "analytics", icon: TrendingUp },
  { key: "settings", icon: Settings },
  { key: "maintenance", icon: History },
];

type QualityReport = {
  id: string;
  assetId?: string;
  assetType?: string;
  score?: number;
  passed?: boolean;
  status?: string;
  details?: string;
  ruleId?: string;
  ruleName?: string;
  createdAt?: string;
  updatedAt?: string;
};

type QualityRule = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  enabled?: boolean;
  minScore?: number;
  maxRetry?: number;
  mode?: string;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
};

type QualityThreshold = {
  id: string;
  category: string;
  name: string;
  minScore: number;
  maxScore: number;
  weight: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

type QualityStats = {
  totalReports: number;
  passed: number;
  failed: number;
  avgScore: number;
  approvalRate: number;
  byAssetType?: { type: string; count: number }[];
  validationBreakdown?: { label: string; count: number; percentage: number }[];
};

type QualitySettings = {
  strictMode: boolean;
  autoRetry: boolean;
  defaultMinScore: number;
  maxRetryCount: number;
  notificationOnFailure: boolean;
  notificationOnPass: boolean;
  enableDetailedLogging: boolean;
};

export function QualityAdminPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");
  const [search, setSearch] = React.useState("");

  const [showCreateRule, setShowCreateRule] = React.useState(false);
  const [editingRule, setEditingRule] = React.useState<QualityRule | null>(null);
  const [newRule, setNewRule] = React.useState<Partial<QualityRule>>({
    name: "",
    description: "",
    category: "general",
    enabled: true,
    minScore: 70,
    maxRetry: 3,
    mode: "strict",
    priority: 0,
  });

  const [showCreateThreshold, setShowCreateThreshold] = React.useState(false);
  const [editingThreshold, setEditingThreshold] = React.useState<QualityThreshold | null>(null);
  const [newThreshold, setNewThreshold] = React.useState<Partial<QualityThreshold>>({
    category: "general",
    name: "",
    minScore: 0,
    maxScore: 100,
    weight: 1,
    description: "",
  });

  const [settingsDraft, setSettingsDraft] = React.useState<Partial<QualitySettings>>({});
  const [confirmClearReports, setConfirmClearReports] = React.useState(false);
  const [clearDays, setClearDays] = React.useState(30);

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR(
    "/api/quality/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: reportsData, isLoading: reportsLoading, mutate: mutateReports } = useSWR(
    "/api/quality",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: rulesData, isLoading: rulesLoading, mutate: mutateRules } = useSWR(
    "/api/quality/rules",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: thresholdsData, isLoading: thresholdsLoading, mutate: mutateThresholds } = useSWR(
    "/api/quality/thresholds",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR(
    "/api/quality/settings",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const stats: QualityStats | null = statsData?.success ? statsData.data : null;
  const reportsResponse = reportsData?.success ? reportsData.data : null;
  const reports: QualityReport[] = Array.isArray(reportsResponse)
    ? reportsResponse
    : ((reportsResponse as { data?: QualityReport[] })?.data ?? []);
  const rulesResponse = rulesData?.success ? rulesData.data : null;
  const rules: QualityRule[] = Array.isArray(rulesResponse)
    ? rulesResponse
    : ((rulesResponse as { data?: QualityRule[] })?.data ?? []);
  const thresholdsResponse = thresholdsData?.success ? thresholdsData.data : null;
  const thresholds: QualityThreshold[] = Array.isArray(thresholdsResponse)
    ? thresholdsResponse
    : ((thresholdsResponse as { data?: QualityThreshold[] })?.data ?? []);

  const defaultSettings: QualitySettings = {
    strictMode: false,
    autoRetry: true,
    defaultMinScore: 70,
    maxRetryCount: 3,
    notificationOnFailure: true,
    notificationOnPass: false,
    enableDetailedLogging: true,
  };
  const settings: QualitySettings = {
    ...defaultSettings,
    ...((settingsData?.success ? settingsData.data : null) ?? {}),
    ...settingsDraft,
  };

  const filteredRules = React.useMemo(() => {
    if (!search) return rules;
    const q = search.toLowerCase();
    return rules.filter(
      (r) =>
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q)
    );
  }, [rules, search]);

  const isLoading =
    statsLoading ||
    reportsLoading ||
    (activeTab === "rules" ? rulesLoading : false) ||
    (activeTab === "thresholds" ? thresholdsLoading : false) ||
    (activeTab === "settings" ? settingsLoading : false);

  const refreshAll = () => {
    mutateStats();
    mutateReports();
    mutateRules();
    mutateThresholds();
    mutateSettings();
  };

  const handleCreateRule = async () => {
    try {
      const res = await fetch("/api/quality/rules", {
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
          category: "general",
          enabled: true,
          minScore: 70,
          maxRetry: 3,
          mode: "strict",
          priority: 0,
        });
        mutateRules();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error creating rule"));
      }
    } catch {
      toast.error(t("common.error", "Error creating rule"));
    }
  };

  const handleUpdateRule = async (id: string, updates: Partial<QualityRule>) => {
    try {
      const res = await fetch(`/api/quality/rules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("common.success", "Rule updated"));
        setEditingRule(null);
        mutateRules();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error updating rule"));
      }
    } catch {
      toast.error(t("common.error", "Error updating rule"));
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/quality/rules/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Rule deleted"));
        mutateRules();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error deleting rule"));
      }
    } catch {
      toast.error(t("common.error", "Error deleting rule"));
    }
  };

  const handleToggleRule = async (rule: QualityRule) => {
    try {
      const res = await fetch(`/api/quality/rules/${rule.id}/toggle`, {
        method: "POST",
      });
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

  const handleDeleteReport = async (id: string) => {
    try {
      const res = await fetch(`/api/quality/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Report deleted"));
        mutateReports();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error deleting report"));
      }
    } catch {
      toast.error(t("common.error", "Error deleting report"));
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/quality/settings", {
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
      const data = {
        exportedAt: new Date().toISOString(),
        reports,
        rules,
        thresholds,
        settings,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quality-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(t("common.success", "Export downloaded"));
    } catch {
      toast.error(t("common.error", "Error exporting data"));
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const importRules = Array.isArray(data.rules) ? data.rules : [];
      const importThresholds = Array.isArray(data.thresholds) ? data.thresholds : [];
      const requests: Promise<Response>[] = [];
      importRules.forEach((rule: QualityRule) => {
        if (rule.name) {
          requests.push(
            fetch("/api/quality/rules", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: rule.name,
                description: rule.description,
                category: rule.category,
                enabled: rule.enabled,
                minScore: rule.minScore,
                maxRetry: rule.maxRetry,
                mode: rule.mode,
                priority: rule.priority,
              }),
            })
          );
        }
      });
      importThresholds.forEach((threshold: QualityThreshold) => {
        if (threshold.name && threshold.category) {
          requests.push(
            fetch("/api/quality/thresholds", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                category: threshold.category,
                name: threshold.name,
                minScore: threshold.minScore,
                maxScore: threshold.maxScore,
                weight: threshold.weight,
                description: threshold.description,
              }),
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
      toast.error(t("common.error", "Error importing data"));
    } finally {
      event.target.value = "";
    }
  };

  const handleClearOldReports = async () => {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - clearDays);
      const res = await fetch(`/api/quality?before=${cutoff.toISOString()}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Old reports cleared"));
        setConfirmClearReports(false);
        mutateReports();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error clearing reports"));
      }
    } catch {
      toast.error(t("common.error", "Error clearing reports"));
    }
  };

  const handleCreateThreshold = async () => {
    try {
      const res = await fetch("/api/quality/thresholds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newThreshold),
      });
      if (res.ok) {
        toast.success(t("common.success", "Threshold created"));
        setShowCreateThreshold(false);
        setNewThreshold({
          category: "general",
          name: "",
          minScore: 0,
          maxScore: 100,
          weight: 1,
          description: "",
        });
        mutateThresholds();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error creating threshold"));
      }
    } catch {
      toast.error(t("common.error", "Error creating threshold"));
    }
  };

  const handleUpdateThreshold = async (id: string, updates: Partial<QualityThreshold>) => {
    try {
      const res = await fetch(`/api/quality/thresholds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("common.success", "Threshold updated"));
        setEditingThreshold(null);
        mutateThresholds();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error updating threshold"));
      }
    } catch {
      toast.error(t("common.error", "Error updating threshold"));
    }
  };

  const handleDeleteThreshold = async (id: string) => {
    try {
      const res = await fetch(`/api/quality/thresholds/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Threshold deleted"));
        mutateThresholds();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error deleting threshold"));
      }
    } catch {
      toast.error(t("common.error", "Error deleting threshold"));
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
      <Breadcrumbs items={[{ label: t("qualityAssurance.title", "AI Quality Assurance") }]} />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("qualityAssurance.title", "AI Quality Assurance")}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("qualityAssurance.description", "Monitor, manage, and enforce quality standards for AI outputs")}
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
              }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {t(`qualityAssurance.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  {renderStatCard(t("qualityAssurance.totalReports", "Total Reports"), stats?.totalReports ?? reports.length, FileText)}
                  {renderStatCard(t("qualityAssurance.passed", "Passed"), stats?.passed ?? reports.filter((r) => r.passed).length, CheckCircle)}
                  {renderStatCard(t("qualityAssurance.failed", "Failed"), stats?.failed ?? reports.filter((r) => !r.passed).length, ShieldX)}
                  {renderStatCard(t("qualityAssurance.avgScore", "Avg Score"), stats?.avgScore?.toFixed(1) ?? "0", Star)}
                  {renderStatCard(t("qualityAssurance.approvalRate", "Approval Rate"), `${stats?.approvalRate?.toFixed(1) ?? "0"}%`, TrendingUp)}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("qualityAssurance.recentReports", "Recent Reports")}>
                    {reports.length > 0 ? (
                      <div className="space-y-3">
                        {reports.slice(0, 8).map((report) => (
                          <div key={report.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {report.passed ? (
                                  <CheckCircle className="size-4 text-green-500 shrink-0" />
                                ) : (
                                  <ShieldX className="size-4 text-red-500 shrink-0" />
                                )}
                                <span className="font-medium text-sm truncate">{report.ruleName || report.assetId || report.id}</span>
                                <Badge tone={report.passed ? "success" : "warning"}>
                                  {report.score?.toFixed(0) ?? "-"}
                                </Badge>
                                {report.assetType && <Badge tone="info">{report.assetType}</Badge>}
                              </div>
                              {report.details && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{report.details}</p>}
                            </div>
                            {report.createdAt && (
                              <span className="text-xs text-muted-foreground ml-2 shrink-0">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("qualityAssurance.noReports", "No reports yet")}
                      </div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("common.quickActions", "Quick Actions")}>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("rules")}>
                        <ShieldCheck className="mr-2 size-4" />
                        {t("qualityAssurance.manageRules", "Manage Rules")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("thresholds")}>
                        <Sliders className="mr-2 size-4" />
                        {t("qualityAssurance.manageThresholds", "Manage Thresholds")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("analytics")}>
                        <BarChart3 className="mr-2 size-4" />
                        {t("qualityAssurance.viewAnalytics", "View Analytics")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab("settings")}>
                        <Settings className="mr-2 size-4" />
                        {t("qualityAssurance.settings", "Settings")}
                      </Button>
                    </div>
                  </DashboardCard>
                </div>
              </div>
            )}

            {activeTab === "rules" && (
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
                  <Button size="sm" onClick={() => setShowCreateRule(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateRule && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("qualityAssurance.newRule", "New Rule")}</h3>
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
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.category", "Category")}</label>
                        <Input
                          value={newRule.category ?? ""}
                          onChange={(e) => setNewRule((p) => ({ ...p, category: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.minScore", "Min Score")}</label>
                        <Input
                          type="number"
                          value={newRule.minScore ?? 70}
                          onChange={(e) => setNewRule((p) => ({ ...p, minScore: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.maxRetry", "Max Retry")}</label>
                        <Input
                          type="number"
                          value={newRule.maxRetry ?? 3}
                          onChange={(e) => setNewRule((p) => ({ ...p, maxRetry: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.mode", "Mode")}</label>
                        <select
                          value={newRule.mode ?? "strict"}
                          onChange={(e) => setNewRule((p) => ({ ...p, mode: e.target.value }))}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        >
                          <option value="strict">{t("qualityAssurance.strict", "Strict")}</option>
                          <option value="lenient">{t("qualityAssurance.lenient", "Lenient")}</option>
                          <option value="adaptive">{t("qualityAssurance.adaptive", "Adaptive")}</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.priority", "Priority")}</label>
                        <Input
                          type="number"
                          value={newRule.priority ?? 0}
                          onChange={(e) => setNewRule((p) => ({ ...p, priority: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={newRule.description ?? ""}
                          onChange={(e) => setNewRule((p) => ({ ...p, description: e.target.value }))}
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
                      <h3 className="font-medium">{t("qualityAssurance.editRule", "Edit Rule")}</h3>
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
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.category", "Category")}</label>
                        <Input
                          value={editingRule.category ?? ""}
                          onChange={(e) => setEditingRule((p) => (p ? { ...p, category: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.minScore", "Min Score")}</label>
                        <Input
                          type="number"
                          value={editingRule.minScore ?? 70}
                          onChange={(e) => setEditingRule((p) => (p ? { ...p, minScore: Number(e.target.value) } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.maxRetry", "Max Retry")}</label>
                        <Input
                          type="number"
                          value={editingRule.maxRetry ?? 3}
                          onChange={(e) => setEditingRule((p) => (p ? { ...p, maxRetry: Number(e.target.value) } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.mode", "Mode")}</label>
                        <select
                          value={editingRule.mode ?? "strict"}
                          onChange={(e) => setEditingRule((p) => (p ? { ...p, mode: e.target.value } : null))}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        >
                          <option value="strict">{t("qualityAssurance.strict", "Strict")}</option>
                          <option value="lenient">{t("qualityAssurance.lenient", "Lenient")}</option>
                          <option value="adaptive">{t("qualityAssurance.adaptive", "Adaptive")}</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.priority", "Priority")}</label>
                        <Input
                          type="number"
                          value={editingRule.priority ?? 0}
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
                  keyExtractor={(rule: QualityRule) => rule.id}
                  columns={[
                    {
                      key: "name",
                      header: t("common.name", "Name"),
                      sortable: true,
                      render: (item: QualityRule) => (
                        <span className="font-medium text-sm">{item.name}</span>
                      ),
                    },
                    {
                      key: "category",
                      header: t("qualityAssurance.category", "Category"),
                      sortable: true,
                      render: (item: QualityRule) =>
                        item.category ? (
                          <Badge tone="muted">{item.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        ),
                    },
                    {
                      key: "minScore",
                      header: t("qualityAssurance.minScore", "Min Score"),
                      sortable: true,
                      render: (item: QualityRule) => <span className="text-sm">{item.minScore ?? "-"}</span>,
                    },
                    {
                      key: "maxRetry",
                      header: t("qualityAssurance.maxRetry", "Max Retry"),
                      sortable: true,
                      render: (item: QualityRule) => <span className="text-sm">{item.maxRetry ?? "-"}</span>,
                    },
                    {
                      key: "mode",
                      header: t("qualityAssurance.mode", "Mode"),
                      sortable: true,
                      render: (item: QualityRule) => <Badge tone="info">{item.mode ?? "strict"}</Badge>,
                    },
                    {
                      key: "enabled",
                      header: t("common.status", "Status"),
                      sortable: true,
                      render: (item: QualityRule) => (
                        <Badge tone={item.enabled ? "success" : "default"}>
                          {item.enabled ? t("common.enabled", "Enabled") : t("common.disabled", "Disabled")}
                        </Badge>
                      ),
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: QualityRule) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleRule(item)}>
                            {item.enabled ? <Pause className="size-3" /> : <Play className="size-3" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditingRule(item)}>
                            <Save className="size-3" />
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

            {activeTab === "thresholds" && (
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
                  <Button size="sm" onClick={() => setShowCreateThreshold(true)}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>

                {showCreateThreshold && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("qualityAssurance.newThreshold", "New Threshold")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setShowCreateThreshold(false)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.category", "Category")}</label>
                        <Input
                          value={newThreshold.category ?? ""}
                          onChange={(e) => setNewThreshold((p) => ({ ...p, category: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={newThreshold.name ?? ""}
                          onChange={(e) => setNewThreshold((p) => ({ ...p, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.minScore", "Min Score")}</label>
                        <Input
                          type="number"
                          value={newThreshold.minScore ?? 0}
                          onChange={(e) => setNewThreshold((p) => ({ ...p, minScore: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.maxScore", "Max Score")}</label>
                        <Input
                          type="number"
                          value={newThreshold.maxScore ?? 100}
                          onChange={(e) => setNewThreshold((p) => ({ ...p, maxScore: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.weight", "Weight")}</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={newThreshold.weight ?? 1}
                          onChange={(e) => setNewThreshold((p) => ({ ...p, weight: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={newThreshold.description ?? ""}
                          onChange={(e) => setNewThreshold((p) => ({ ...p, description: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowCreateThreshold(false)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={handleCreateThreshold} disabled={!newThreshold.name || !newThreshold.category}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                {editingThreshold && (
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{t("qualityAssurance.editThreshold", "Edit Threshold")}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setEditingThreshold(null)}>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.category", "Category")}</label>
                        <Input
                          value={editingThreshold.category}
                          onChange={(e) => setEditingThreshold((p) => (p ? { ...p, category: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.name", "Name")}</label>
                        <Input
                          value={editingThreshold.name}
                          onChange={(e) => setEditingThreshold((p) => (p ? { ...p, name: e.target.value } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.minScore", "Min Score")}</label>
                        <Input
                          type="number"
                          value={editingThreshold.minScore}
                          onChange={(e) => setEditingThreshold((p) => (p ? { ...p, minScore: Number(e.target.value) } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.maxScore", "Max Score")}</label>
                        <Input
                          type="number"
                          value={editingThreshold.maxScore}
                          onChange={(e) => setEditingThreshold((p) => (p ? { ...p, maxScore: Number(e.target.value) } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.weight", "Weight")}</label>
                        <Input
                          type="number"
                          step="0.1"
                          value={editingThreshold.weight}
                          onChange={(e) => setEditingThreshold((p) => (p ? { ...p, weight: Number(e.target.value) } : null))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                        <Input
                          value={editingThreshold.description ?? ""}
                          onChange={(e) => setEditingThreshold((p) => (p ? { ...p, description: e.target.value } : null))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingThreshold(null)}>
                        {t("common.cancel", "Cancel")}
                      </Button>
                      <Button size="sm" onClick={() => editingThreshold && handleUpdateThreshold(editingThreshold.id, editingThreshold)}>
                        <Save className="mr-2 size-4" />
                        {t("common.save", "Save")}
                      </Button>
                    </div>
                  </div>
                )}

                <AdminDataTable
                  data={thresholds.filter((th) => !search || th.name?.toLowerCase().includes(search.toLowerCase()) || th.category?.toLowerCase().includes(search.toLowerCase()))}
                  keyExtractor={(th: QualityThreshold) => th.id}
                  columns={[
                    {
                      key: "category",
                      header: t("qualityAssurance.category", "Category"),
                      sortable: true,
                      render: (item: QualityThreshold) => <Badge tone="muted">{item.category}</Badge>,
                    },
                    {
                      key: "name",
                      header: t("common.name", "Name"),
                      sortable: true,
                      render: (item: QualityThreshold) => <span className="font-medium text-sm">{item.name}</span>,
                    },
                    {
                      key: "minScore",
                      header: t("qualityAssurance.minScore", "Min"),
                      sortable: true,
                      render: (item: QualityThreshold) => <span className="text-sm">{item.minScore}</span>,
                    },
                    {
                      key: "maxScore",
                      header: t("qualityAssurance.maxScore", "Max"),
                      sortable: true,
                      render: (item: QualityThreshold) => <span className="text-sm">{item.maxScore}</span>,
                    },
                    {
                      key: "weight",
                      header: t("qualityAssurance.weight", "Weight"),
                      sortable: true,
                      render: (item: QualityThreshold) => <span className="text-sm">{item.weight}</span>,
                    },
                    {
                      key: "actions",
                      header: t("common.actions", "Actions"),
                      render: (item: QualityThreshold) => (
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setEditingThreshold(item)}>
                            <Save className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteThreshold(item.id)}>
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {renderStatCard(t("qualityAssurance.totalReports", "Total Reports"), stats?.totalReports ?? reports.length, FileText)}
                  {renderStatCard(t("qualityAssurance.approvalRate", "Approval Rate"), `${stats?.approvalRate?.toFixed(1) ?? "0"}%`, TrendingUp)}
                  {renderStatCard(t("qualityAssurance.avgScore", "Avg Score"), stats?.avgScore?.toFixed(1) ?? "0", Star)}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("qualityAssurance.reportsByAssetType", "Reports by Asset Type")}>
                    {(stats?.byAssetType?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {stats!.byAssetType!.map((item, i) => {
                          const maxCount = Math.max(...stats!.byAssetType!.map((a) => a.count), 1);
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-24 text-sm">{item.type || "unknown"}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div
                                  className="h-2 rounded-full bg-primary"
                                  style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : reports.length > 0 ? (
                      <div className="space-y-2">
                        {(() => {
                          const typeMap = new Map<string, number>();
                          reports.forEach((r) => {
                            const type = r.assetType || "unknown";
                            typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
                          });
                          const sorted = Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1]);
                          const maxCount = sorted[0]?.[1] ?? 1;
                          return sorted.map(([type, count], i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-24 text-sm">{type}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div
                                  className="h-2 rounded-full bg-primary"
                                  style={{ width: `${Math.min((count / maxCount) * 100, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-10 text-right">{count}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("qualityAssurance.noData", "No data yet")}
                      </div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("qualityAssurance.validationBreakdown", "Validation Breakdown")}>
                    {(stats?.validationBreakdown?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {stats!.validationBreakdown!.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="w-32 text-sm truncate">{item.label}</span>
                            <div className="h-2 flex-1 rounded-full bg-muted/40">
                              <div
                                className="h-2 rounded-full bg-cyan-500"
                                style={{ width: `${Math.min(item.percentage, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-16 text-right">{item.count} ({item.percentage.toFixed(1)}%)</span>
                          </div>
                        ))}
                      </div>
                    ) : reports.length > 0 ? (
                      <div className="space-y-2">
                        {[
                          { label: t("qualityAssurance.passed", "Passed"), count: reports.filter((r) => r.passed).length },
                          { label: t("qualityAssurance.failed", "Failed"), count: reports.filter((r) => !r.passed).length },
                        ].map((item, i) => {
                          const pct = reports.length > 0 ? (item.count / reports.length) * 100 : 0;
                          return (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-32 text-sm">{item.label}</span>
                              <div className="h-2 flex-1 rounded-full bg-muted/40">
                                <div
                                  className={`h-2 rounded-full ${i === 0 ? "bg-green-500" : "bg-red-500"}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-16 text-right">{item.count} ({pct.toFixed(1)}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("qualityAssurance.noData", "No data yet")}
                      </div>
                    )}
                  </DashboardCard>
                </div>

                <DashboardCard title={t("qualityAssurance.recentReports", "Recent Reports")}>
                  <AdminDataTable
                    data={reports.slice(0, 20)}
                    keyExtractor={(report: QualityReport) => report.id}
                    columns={[
                      {
                        key: "passed",
                        header: t("common.status", "Status"),
                        sortable: true,
                        render: (item: QualityReport) => (
                          <Badge tone={item.passed ? "success" : "warning"}>
                            {item.passed ? t("qualityAssurance.passed", "Passed") : t("qualityAssurance.failed", "Failed")}
                          </Badge>
                        ),
                      },
                      {
                        key: "assetType",
                        header: t("qualityAssurance.assetType", "Asset Type"),
                        sortable: true,
                        render: (item: QualityReport) =>
                          item.assetType ? <Badge tone="info">{item.assetType}</Badge> : <span className="text-muted-foreground text-xs">-</span>,
                      },
                      {
                        key: "score",
                        header: t("qualityAssurance.score", "Score"),
                        sortable: true,
                        render: (item: QualityReport) => <span className="text-sm font-medium">{item.score?.toFixed(1) ?? "-"}</span>,
                      },
                      {
                        key: "ruleName",
                        header: t("qualityAssurance.rule", "Rule"),
                        sortable: true,
                        render: (item: QualityReport) => <span className="text-sm">{item.ruleName ?? "-"}</span>,
                      },
                      {
                        key: "createdAt",
                        header: t("common.date", "Date"),
                        sortable: true,
                        render: (item: QualityReport) => (
                          <span className="text-xs text-muted-foreground">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                          </span>
                        ),
                      },
                      {
                        key: "actions",
                        header: t("common.actions", "Actions"),
                        render: (item: QualityReport) => (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(item.id)}>
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        ),
                      },
                    ]}
                  />
                </DashboardCard>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <DashboardCard title={t("qualityAssurance.qualitySettings", "Quality Settings")}>
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.defaultMinScore", "Default Min Score")}</label>
                        <Input
                          type="number"
                          value={settings.defaultMinScore}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, defaultMinScore: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("qualityAssurance.maxRetryCount", "Max Retry Count")}</label>
                        <Input
                          type="number"
                          value={settings.maxRetryCount}
                          onChange={(e) => setSettingsDraft((p) => ({ ...p, maxRetryCount: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { key: "strictMode", label: t("qualityAssurance.strictMode", "Strict Mode"), desc: t("qualityAssurance.strictModeDesc", "Enforce strict quality validation on all outputs") },
                        { key: "autoRetry", label: t("qualityAssurance.autoRetry", "Auto Retry"), desc: t("qualityAssurance.autoRetryDesc", "Automatically retry failed outputs") },
                        { key: "notificationOnFailure", label: t("qualityAssurance.notifyOnFailure", "Notify on Failure"), desc: t("qualityAssurance.notifyOnFailureDesc", "Send notifications when quality checks fail") },
                        { key: "notificationOnPass", label: t("qualityAssurance.notifyOnPass", "Notify on Pass"), desc: t("qualityAssurance.notifyOnPassDesc", "Send notifications when quality checks pass") },
                        { key: "enableDetailedLogging", label: t("qualityAssurance.detailedLogging", "Detailed Logging"), desc: t("qualityAssurance.detailedLoggingDesc", "Log detailed quality validation information") },
                      ].map((flag) => (
                        <div key={flag.key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                          <div>
                            <p className="text-sm font-medium">{flag.label}</p>
                            <p className="text-xs text-muted-foreground">{flag.desc}</p>
                          </div>
                          <Button
                            variant={settings[flag.key as keyof QualitySettings] as boolean ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              setSettingsDraft((p) => ({
                                ...p,
                                [flag.key]: !(p[flag.key as keyof QualitySettings] ?? (settings[flag.key as keyof QualitySettings] as boolean)),
                              }))
                            }
                          >
                            {settings[flag.key as keyof QualitySettings] as boolean ? "ON" : "OFF"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button size="sm" onClick={handleSaveSettings}>
                      <Save className="mr-2 size-4" />
                      {t("common.save", "Save")}
                    </Button>
                  </div>
                </DashboardCard>
              </div>
            )}

            {activeTab === "maintenance" && (
              <div className="space-y-6">
                <DashboardCard title={t("qualityAssurance.exportImport", "Export / Import Quality Data")}>
                  <div className="flex flex-wrap gap-3">
                    <Button size="sm" onClick={handleExport}>
                      <Download className="mr-2 size-4" />
                      {t("qualityAssurance.exportData", "Export Quality Data")}
                    </Button>
                    <label className="cursor-pointer">
                      <span className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground">
                        <Upload className="size-4" />
                        {t("qualityAssurance.importData", "Import Quality Data")}
                      </span>
                      <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {t("qualityAssurance.exportImportHint", "Export rules, thresholds, and settings as a JSON file for backup or migration.")}
                  </p>
                </DashboardCard>

                <DashboardCard title={t("qualityAssurance.clearOldReports", "Clear Old Reports")}>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{t("qualityAssurance.clearOldReportsTitle", "Clear Reports Older Than")}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("qualityAssurance.clearOldReportsDesc", "Permanently delete quality reports older than the specified number of days")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={clearDays}
                          onChange={(e) => setClearDays(Number(e.target.value))}
                          className="w-20"
                          min={1}
                        />
                        <span className="text-sm text-muted-foreground">{t("qualityAssurance.days", "days")}</span>
                        {confirmClearReports ? (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setConfirmClearReports(false)}>
                              <X className="mr-2 size-4" />
                              {t("common.cancel", "Cancel")}
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleClearOldReports}>
                              <Trash2 className="mr-2 size-4" />
                              {t("common.confirm", "Confirm")}
                            </Button>
                          </>
                        ) : (
                          <Button variant="destructive" size="sm" onClick={() => setConfirmClearReports(true)}>
                            <Trash2 className="mr-2 size-4" />
                            {t("qualityAssurance.clearOld", "Clear Old")}
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
