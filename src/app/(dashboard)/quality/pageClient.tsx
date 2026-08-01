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
  Image as ImageIcon,
  Video as VideoIcon,
  ShieldCheck,
  ListChecks,
  Lightbulb,
  BarChart3,
  Plus,
  Search,
  Loader,
  Check,
  X,
  Eye,
  Trash2,
  Pencil,
  RefreshCw,
  ChevronRight,
  Filter,
  Activity,
  TrendingUp,
  AlertTriangle,
  Settings,
  Power,
  Play,
  Gauge,
  RotateCcw,
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
  | "reports"
  | "images"
  | "videos"
  | "validate"
  | "rules"
  | "recommendations"
  | "analytics";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "dashboard", icon: LayoutDashboard },
  { key: "reports", icon: FileText },
  { key: "images", icon: ImageIcon },
  { key: "videos", icon: VideoIcon },
  { key: "validate", icon: ShieldCheck },
  { key: "rules", icon: ListChecks },
  { key: "recommendations", icon: Lightbulb },
  { key: "analytics", icon: BarChart3 },
];

const ASSET_TYPES = ["all", "image", "video", "story", "affiliate", "drama", "publishing", "prompt"];
const REPORT_STATUSES = ["all", "pending", "passed", "failed", "approved", "regenerate", "manual_review", "stopped"];
const REC_STATUSES = ["all", "open", "resolved", "ignored"];
const RULE_MODES = ["balanced", "strict", "lenient"];
const RULE_CATEGORIES = ["general", "image", "video", "story", "drama", "affiliate", "publishing", "prompt", "brand", "technical"];
const IMAGE_METRICS = [
  "resolution",
  "sharpness",
  "blur",
  "noise",
  "compression",
  "artifacts",
  "lighting",
  "exposure",
  "contrast",
  "cropping",
  "composition",
  "subjectVisibility",
  "textReadability",
  "watermarkPresence",
];
const VIDEO_METRICS = [
  "resolution",
  "fps",
  "frameConsistency",
  "sceneContinuity",
  "audioPresence",
  "subtitleTiming",
  "renderingErrors",
  "transitionQuality",
  "endingQuality",
  "thumbnailAvailability",
];

export function QualityPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("dashboard");
  const [reportSearch, setReportSearch] = React.useState("");
  const [reportTypeFilter, setReportTypeFilter] = React.useState("all");
  const [reportStatusFilter, setReportStatusFilter] = React.useState("all");
  const [recFilter, setRecFilter] = React.useState("all");
  const [ruleSearch, setRuleSearch] = React.useState("");
  const [ruleCategoryFilter, setRuleCategoryFilter] = React.useState("all");

  const [showRuleForm, setShowRuleForm] = React.useState(false);
  const [editRuleId, setEditRuleId] = React.useState<string | null>(null);
  const [ruleForm, setRuleForm] = React.useState<any>({});
  const [ruleFormLoading, setRuleFormLoading] = React.useState(false);

  const [selectedReport, setSelectedReport] = React.useState<any>(null);
  const [detailData, setDetailData] = React.useState<any>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [showDetail, setShowDetail] = React.useState(false);

  const [validateAssetType, setValidateAssetType] = React.useState("image");
  const [validateModuleType, setValidateModuleType] = React.useState("manual");
  const [validateAssetId, setValidateAssetId] = React.useState("");
  const [validateProjectId, setValidateProjectId] = React.useState("");
  const [validateMinScore, setValidateMinScore] = React.useState("");
  const [validateAsset, setValidateAsset] = React.useState(
    JSON.stringify({ width: 1024, height: 1024, blur: 5, noise: 10, lighting: 80, contrast: 55, composition: 75, subjectVisibility: 70 }, null, 2)
  );
  const [validateResult, setValidateResult] = React.useState<any>(null);
  const [validating, setValidating] = React.useState(false);

  const [settingsForm, setSettingsForm] = React.useState<any>({});

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR(
    "/api/quality/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: dashboardReportsData, isLoading: dashboardReportsLoading } = useSWR(
    "/api/quality?limit=6",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: reportsData, isLoading: reportsLoading, mutate: mutateReports } = useSWR(
    (() => {
      const params = new URLSearchParams();
      if (activeTab === "reports" && reportSearch) params.set("search", reportSearch);
      if (activeTab === "reports" && reportTypeFilter !== "all") params.set("assetType", reportTypeFilter);
      if (activeTab === "reports" && reportStatusFilter !== "all") params.set("status", reportStatusFilter);
      params.set("limit", "50");
      return `/api/quality?${params.toString()}`;
    })(),
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: imagesData, isLoading: imagesLoading } = useSWR(
    "/api/quality?assetType=image&limit=50",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: videosData, isLoading: videosLoading } = useSWR(
    "/api/quality?assetType=video&limit=50",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: rulesData, isLoading: rulesLoading, mutate: mutateRules } = useSWR(
    (() => {
      const params = new URLSearchParams();
      if (ruleSearch) params.set("search", ruleSearch);
      if (ruleCategoryFilter !== "all") params.set("category", ruleCategoryFilter);
      params.set("limit", "100");
      return `/api/quality/rules?${params.toString()}`;
    })(),
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: settingsData, mutate: mutateSettings } = useSWR(
    "/api/quality/settings",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: thresholdsData } = useSWR(
    "/api/quality/thresholds",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const stats = statsData?.success ? statsData.data : null;
  const reports = reportsData?.success
    ? Array.isArray(reportsData.data)
      ? reportsData.data
      : reportsData.data?.data ?? []
    : [];
  const dashboardReports = dashboardReportsData?.success
    ? Array.isArray(dashboardReportsData.data)
      ? dashboardReportsData.data
      : dashboardReportsData.data?.data ?? []
    : [];
  const images = imagesData?.success
    ? Array.isArray(imagesData.data)
      ? imagesData.data
      : imagesData.data?.data ?? []
    : [];
  const videos = videosData?.success
    ? Array.isArray(videosData.data)
      ? videosData.data
      : videosData.data?.data ?? []
    : [];
  const rules = rulesData?.success
    ? Array.isArray(rulesData.data)
      ? rulesData.data
      : rulesData.data?.data ?? []
    : [];
  const settings = settingsData?.success ? settingsData.data : null;
  const thresholds = thresholdsData?.success
    ? Array.isArray(thresholdsData.data)
      ? thresholdsData.data
      : thresholdsData.data?.thresholds ?? []
    : [];

  const [reportDetails, setReportDetails] = React.useState<any[]>([]);
  const [reportDetailsLoading, setReportDetailsLoading] = React.useState(false);
  const [detailsRefresh, setDetailsRefresh] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const ids = reports.map((r: any) => r.id).slice(0, 20);
      if (ids.length === 0) {
        setReportDetails([]);
        return;
      }
      setReportDetailsLoading(true);
      const results = await Promise.all(
        ids.map(async (id: string) => {
          try {
            const res = await fetch(`/api/quality/${id}`);
            const json = await res.json();
            return json?.success ? json.data : null;
          } catch {
            return null;
          }
        })
      );
      if (!cancelled) setReportDetails(results.filter(Boolean));
      setReportDetailsLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [reports, detailsRefresh]);

  const mutateReportDetails = () => setDetailsRefresh((x) => x + 1);
  const recommendations = React.useMemo(
    () =>
      reportDetails.flatMap((r: any) =>
        (r.recommendations || []).map((rec: any) => ({
          ...rec,
          reportId: r.id,
          assetType: r.assetType,
          reportSummary: r.summary,
        }))
      ),
    [reportDetails]
  );

  const filteredRecommendations = React.useMemo(
    () =>
      recommendations.filter((rec: any) =>
        recFilter === "all" ? true : rec.status === recFilter
      ),
    [recommendations, recFilter]
  );

  const isLoading = activeTab === "dashboard"
    ? statsLoading || dashboardReportsLoading
    : activeTab === "reports"
      ? reportsLoading
      : activeTab === "images"
        ? imagesLoading
        : activeTab === "videos"
          ? videosLoading
          : activeTab === "rules"
            ? rulesLoading
            : activeTab === "recommendations"
              ? reportsLoading || reportDetailsLoading
              : activeTab === "analytics"
                ? statsLoading
                : false;

  React.useEffect(() => {
    if (settings && Object.keys(settingsForm).length === 0) {
      setSettingsForm({
        strictMode: settings.strictMode ?? false,
        autoRetryEnabled: settings.autoRetryEnabled ?? true,
        autoRetryThreshold: settings.autoRetryThreshold ?? 50,
        maxRetryCount: settings.maxRetryCount ?? 3,
        defaultMinScore: settings.defaultMinScore ?? 70,
        skipValidation: settings.skipValidation ?? false,
        notifyOnPass: settings.notifyOnPass ?? false,
        notifyOnFail: settings.notifyOnFail ?? true,
      });
    }
  }, [settings, settingsForm]);

  const resetRuleForm = () => {
    setRuleForm({});
    setEditRuleId(null);
    setShowRuleForm(false);
  };

  const openCreateRule = () => {
    setRuleForm({
      name: "",
      description: "",
      category: "general",
      minScore: 70,
      autoRetryThreshold: 50,
      maxRetryCount: 3,
      ignoredValidators: "",
      mode: "balanced",
    });
    setEditRuleId(null);
    setShowRuleForm(true);
  };

  const openEditRule = (rule: any) => {
    setRuleForm({
      name: rule.name ?? "",
      description: rule.description ?? "",
      category: rule.category ?? "general",
      minScore: rule.minScore ?? 70,
      autoRetryThreshold: rule.autoRetryThreshold ?? 50,
      maxRetryCount: rule.maxRetryCount ?? 3,
      ignoredValidators: Array.isArray(rule.ignoredValidators) ? rule.ignoredValidators.join(", ") : "",
      mode: rule.mode ?? "balanced",
    });
    setEditRuleId(rule.id);
    setShowRuleForm(true);
  };

  const openReportDetail = async (report: any) => {
    setSelectedReport(report);
    setShowDetail(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await fetch(`/api/quality/${report.id}`);
      const json = await res.json();
      setDetailData(json?.success ? json.data : report);
    } catch {
      setDetailData(report);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const res = await fetch(`/api/quality/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Deleted"));
        mutateReports();
        mutateStats();
        mutateReportDetails();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleSaveRule = async () => {
    if (!ruleForm.name?.trim()) {
      toast.error(t("qualityAssurance.ruleNameRequired", "Rule name is required"));
      return;
    }
    setRuleFormLoading(true);
    try {
      const payload: any = {
        name: ruleForm.name,
        description: ruleForm.description,
        category: ruleForm.category,
        minScore: Number(ruleForm.minScore) || 70,
        autoRetryThreshold: Number(ruleForm.autoRetryThreshold) || 50,
        maxRetryCount: Number(ruleForm.maxRetryCount) || 3,
        ignoredValidators: String(ruleForm.ignoredValidators || "")
          .split(",")
          .map((v: string) => v.trim())
          .filter(Boolean),
        mode: ruleForm.mode,
      };
      const method = editRuleId ? "PUT" : "POST";
      const target = editRuleId ? `/api/quality/rules/${editRuleId}` : "/api/quality/rules";
      const res = await fetch(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(t("common.success", "Saved"));
        resetRuleForm();
        mutateRules();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    } finally {
      setRuleFormLoading(false);
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      const res = await fetch(`/api/quality/rules/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Deleted"));
        mutateRules();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleToggleRule = async (rule: any) => {
    try {
      const res = await fetch(`/api/quality/rules/${rule.id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: !rule.isEnabled }),
      });
      if (res.ok) {
        toast.success(t("common.success", "Success"));
        mutateRules();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/quality/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (res.ok) {
        toast.success(t("common.success", "Saved"));
        mutateSettings();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleUpdateRecStatus = async (reportId: string, recId: string, status: string) => {
    try {
      const res = await fetch(`/api/quality/${reportId}/recommendations/${recId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(t("common.success", "Success"));
        mutateReportDetails();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleRunValidation = async () => {
    let asset: Record<string, unknown>;
    try {
      asset = JSON.parse(validateAsset || "{}");
    } catch {
      toast.error(t("qualityAssurance.invalidJson", "Invalid JSON in asset data"));
      return;
    }
    setValidating(true);
    try {
      const res = await fetch("/api/quality/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetType: validateAssetType,
          moduleType: validateModuleType || "manual",
          assetId: validateAssetId || undefined,
          projectId: validateProjectId || undefined,
          minScore: validateMinScore ? Number(validateMinScore) : undefined,
          asset,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setValidateResult(data.data);
        mutateReports();
        mutateStats();
        toast.success(t("qualityAssurance.validationComplete", "Validation complete"));
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    } finally {
      setValidating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
      case "approved":
      case "success":
      case "completed":
      case "resolved":
      case "enabled":
        return <Badge tone="success">{status}</Badge>;
      case "failed":
      case "error":
      case "stopped":
      case "critical":
        return <Badge tone="warning">{status}</Badge>;
      case "pending":
      case "running":
      case "processing":
      case "open":
      case "regenerate":
      case "manual_review":
      case "in_review":
      case "review":
      case "info":
        return <Badge tone="info">{status}</Badge>;
      case "ignored":
      case "disabled":
      case "default":
        return <Badge tone="muted">{status}</Badge>;
      default:
        return <Badge tone="default">{status}</Badge>;
    }
  };

  const getRecSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge tone="warning">{severity}</Badge>;
      case "warning":
        return <Badge tone="warning">{severity}</Badge>;
      case "success":
        return <Badge tone="success">{severity}</Badge>;
      case "info":
        return <Badge tone="info">{severity}</Badge>;
      default:
        return <Badge tone="default">{severity}</Badge>;
    }
  };

  const renderScoreBar = (value: number, label: string) => {
    const clamped = Math.max(0, Math.min(value ?? 0, 100));
    const color = clamped >= 70 ? "bg-green-500" : clamped >= 50 ? "bg-amber-500" : "bg-red-500";
    return (
      <div className="flex items-center gap-3">
        <span className="w-28 text-sm capitalize">{label}</span>
        <div className="h-2 flex-1 rounded-full bg-muted/40">
          <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${clamped}%` }} />
        </div>
        <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(value)}</span>
      </div>
    );
  };

  const renderMetricGrid = (source: any, metrics: string[]) => (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m) => {
        const val = typeof source?.[m] === "number" ? source[m] : null;
        const clamped = val != null ? Math.max(0, Math.min(val, 100)) : 0;
        return (
          <div key={m} className="rounded-lg border border-border bg-muted/20 p-2.5">
            <p className="text-xs text-muted-foreground capitalize">{m.replace(/([A-Z])/g, " $1").trim()}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-muted/40">
                {val != null && (
                  <div
                    className={`h-1.5 rounded-full ${clamped >= 70 ? "bg-green-500" : clamped >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${clamped}%` }}
                  />
                )}
              </div>
              <span className="w-8 text-right text-xs font-medium">{val != null ? `${Math.round(val)}` : "—"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderIssues = (issues: string[]) =>
    issues.length > 0 ? (
      <div className="space-y-1">
        {issues.map((issue, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-red-500">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>{issue}</span>
          </div>
        ))}
      </div>
    ) : null;

  const renderRecommendationsList = (recs: string[]) =>
    recs.length > 0 ? (
      <div className="space-y-1">
        {recs.map((rec, i) => (
          <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
            <span>{rec}</span>
          </div>
        ))}
      </div>
    ) : null;

  const renderValidatorResult = (key: string, v: any) => {
    if (!v) return null;
    const isImage = key === "image";
    const isVideo = key === "video";
    const overall =
      v.overallScore ?? v.overallBrandScore ?? v.overallStoryScore ?? v.publishingReadinessScore ?? v.overallVideoScore;
    const issues = Array.isArray(v.issues) ? v.issues : [];
    const recs = Array.isArray(v.recommendations) ? v.recommendations : [];
    return (
      <div key={key} className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm capitalize">{key}</span>
          {overall != null && (
            <div className="flex items-center gap-2">
              <Gauge className="size-4 text-muted-foreground" />
              <span className="text-xl font-semibold">{Math.round(overall)}</span>
            </div>
          )}
        </div>
        {isImage && renderMetricGrid(v, IMAGE_METRICS)}
        {isVideo && renderMetricGrid(v, VIDEO_METRICS)}
        {issues.length > 0 && <div className="border-t border-border pt-3">{renderIssues(issues)}</div>}
        {recs.length > 0 && <div className="border-t border-border pt-3">{renderRecommendationsList(recs)}</div>}
      </div>
    );
  };

  const renderSearchBar = (value: string, onChange: (v: string) => void) => (
    <div className="relative flex-1 min-w-[250px]">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("common.search", "Search...")}
        className="pl-9"
      />
    </div>
  );

  const renderRuleForm = () => (
    <DashboardCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            {editRuleId ? t("common.edit", "Edit") : t("common.create", "Create")} {t("qualityAssurance.rule", "Rule")}
          </h3>
          <Button variant="ghost" size="sm" onClick={resetRuleForm}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("qualityAssurance.ruleName", "Rule Name")}</label>
          <Input
            value={ruleForm.name ?? ""}
            onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
            placeholder={t("qualityAssurance.ruleName", "Rule Name")}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("qualityAssurance.description", "Description")}</label>
          <textarea
            value={ruleForm.description ?? ""}
            onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("qualityAssurance.category", "Category")}</label>
          <select
            value={ruleForm.category ?? "general"}
            onChange={(e) => setRuleForm({ ...ruleForm, category: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {RULE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t("qualityAssurance.minScore", "Min Score")}</label>
            <Input
              type="number"
              value={ruleForm.minScore ?? 70}
              onChange={(e) => setRuleForm({ ...ruleForm, minScore: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t("qualityAssurance.autoRetryThreshold", "Retry Threshold")}</label>
            <Input
              type="number"
              value={ruleForm.autoRetryThreshold ?? 50}
              onChange={(e) => setRuleForm({ ...ruleForm, autoRetryThreshold: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{t("qualityAssurance.maxRetryCount", "Max Retries")}</label>
            <Input
              type="number"
              value={ruleForm.maxRetryCount ?? 3}
              onChange={(e) => setRuleForm({ ...ruleForm, maxRetryCount: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("qualityAssurance.mode", "Mode")}</label>
          <select
            value={ruleForm.mode ?? "balanced"}
            onChange={(e) => setRuleForm({ ...ruleForm, mode: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {RULE_MODES.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">{t("qualityAssurance.ignoredValidators", "Ignored Validators (comma separated)")}</label>
          <Input
            value={ruleForm.ignoredValidators ?? ""}
            onChange={(e) => setRuleForm({ ...ruleForm, ignoredValidators: e.target.value })}
            placeholder="audio, watermark"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={resetRuleForm}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button size="sm" disabled={ruleFormLoading} onClick={handleSaveRule}>
            {ruleFormLoading ? <Loader className="size-4 animate-spin" /> : <Check className="size-4" />}
            {editRuleId ? t("common.update", "Update") : t("common.save", "Save")}
          </Button>
        </div>
      </div>
    </DashboardCard>
  );

  const renderReportMeta = (report: any) => (
    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
      {report.assetType && <Badge tone="info">{report.assetType}</Badge>}
      {report.moduleType && <span>{report.moduleType}</span>}
      {report.assetId && <span className="font-mono">{report.assetId}</span>}
      {report.createdAt && <span>{new Date(report.createdAt).toLocaleString()}</span>}
    </div>
  );

  const renderReportCard = (report: any) => {
    const scoreSource = typeof report.scores === "object" && report.scores ? report.scores : {};
    return (
      <DashboardCard key={report.id}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <FileText className="size-4 text-blue-500" />
              <button onClick={() => openReportDetail(report)}>
                <span className="font-semibold text-sm">{report.id}</span>
              </button>
              {getStatusBadge(report.status || "pending")}
              {report.passed && <Badge tone="success">{t("qualityAssurance.passed", "Passed")}</Badge>}
              {report.requiresReview && <Badge tone="warning">{t("qualityAssurance.requiresReview", "Requires Review")}</Badge>}
            </div>
            {report.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.summary}</p>}
            {renderReportMeta(report)}
            {Object.keys(scoreSource).length > 0 && (
              <div className="mt-3 space-y-1.5">
                {Object.entries(scoreSource).slice(0, 4).map(([key, value]) => (
                  <div key={key}>{renderScoreBar(Number(value), key)}</div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button variant="ghost" size="sm" onClick={() => openReportDetail(report)}>
              <Eye className="size-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(report.id)}>
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
      </DashboardCard>
    );
  };

  const renderMetricReportCard = (report: any, metrics: string[]) => {
    const scoreSource = typeof report.scores === "object" && report.scores ? report.scores : {};
    const keyScores = Object.fromEntries(
      metrics.map((m) => [m, typeof scoreSource[m] === "number" ? scoreSource[m] : null])
    );
    const filled = metrics.filter((m) => keyScores[m] != null);
    return (
      <DashboardCard key={report.id}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {report.assetType === "video" ? (
                <VideoIcon className="size-4 text-purple-500" />
              ) : (
                <ImageIcon className="size-4 text-cyan-500" />
              )}
              <button onClick={() => openReportDetail(report)}>
                <span className="font-semibold text-sm">{report.id}</span>
              </button>
              {getStatusBadge(report.status || "pending")}
              <Badge tone="muted">{report.moduleType || report.assetType}</Badge>
            </div>
            {report.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.summary}</p>}
            {renderReportMeta(report)}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button variant="ghost" size="sm" onClick={() => openReportDetail(report)}>
              <Eye className="size-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDeleteReport(report.id)}>
              <Trash2 className="size-3" />
            </Button>
          </div>
        </div>
        {filled.length > 0 ? (
          <div className="mt-4">{renderMetricGrid(keyScores, metrics)}</div>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="size-3.5" />
            {t("qualityAssurance.noMetricData", "No per-metric data stored for this report. Run validation to populate metrics.")}
          </div>
        )}
      </DashboardCard>
    );
  };

  const renderSettingsCard = () => (
    <DashboardCard title={t("qualityAssurance.settings", "Quality Settings")}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["strictMode", t("qualityAssurance.strictMode", "Strict Mode")],
            ["autoRetryEnabled", t("qualityAssurance.autoRetryEnabled", "Auto Retry")],
            ["skipValidation", t("qualityAssurance.skipValidation", "Skip Validation")],
            ["notifyOnPass", t("qualityAssurance.notifyOnPass", "Notify on Pass")],
            ["notifyOnFail", t("qualityAssurance.notifyOnFail", "Notify on Fail")],
          ].map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
              <span className="text-sm">{label}</span>
              <button
                onClick={() => setSettingsForm({ ...settingsForm, [key]: !settingsForm[key] })}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  settingsForm[key] ? "bg-green-500" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-5 rounded-full bg-white transition-all ${
                    settingsForm[key] ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["autoRetryThreshold", t("qualityAssurance.autoRetryThreshold", "Retry Threshold")],
            ["maxRetryCount", t("qualityAssurance.maxRetryCount", "Max Retries")],
            ["defaultMinScore", t("qualityAssurance.minScore", "Min Score")],
          ].map(([key, label]) => (
            <div key={key} className="space-y-1">
              <label className="text-xs text-muted-foreground">{label}</label>
              <Input
                type="number"
                value={settingsForm[key] ?? ""}
                onChange={(e) => setSettingsForm({ ...settingsForm, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={handleSaveSettings}>
            <Check className="mr-2 size-4" />
            {t("common.save", "Save")}
          </Button>
        </div>
      </div>
    </DashboardCard>
  );

  const renderThreshholdCard = () => (
    <DashboardCard title={t("qualityAssurance.thresholds", "Quality Thresholds")}>
      {thresholds.length > 0 ? (
        <div className="space-y-2">
          {thresholds.map((th: any) => (
            <div key={th.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-2 min-w-0">
                <Badge tone="info">{th.category}</Badge>
                <span className="text-sm truncate">{th.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{th.minValue} - {th.maxValue}</span>
                <span>x{th.weight ?? 1}</span>
                {th.isEnabled ? (
                  <Badge tone="success">{t("common.enabled", "Enabled")}</Badge>
                ) : (
                  <Badge tone="muted">{t("common.disabled", "Disabled")}</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          {t("qualityAssurance.noThresholds", "No thresholds defined")}
        </div>
      )}
    </DashboardCard>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("qualityAssurance.title", "AI Quality Assurance")}
        description={t("qualityAssurance.description", "Validate AI-generated assets, manage quality rules, and track recommendations")}
      />

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key);
              setShowDetail(false);
              setSelectedReport(null);
              setDetailData(null);
              resetRuleForm();
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
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <FileText className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.totalReports", "Total Reports")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalReports ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Check className="size-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.passed", "Passed")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.passedReports ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10">
                      <X className="size-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.failed", "Failed")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.failedReports ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Gauge className="size-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.avgScore", "Avg Score")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.avgOverallScore ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <TrendingUp className="size-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.approvalRate", "Approval Rate")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.approvalRate ?? 0}%</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Lightbulb className="size-5 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.recommendations", "Recommendations")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalRecommendations ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              <DashboardCard title={t("qualityAssurance.recentReports", "Recent Reports")}>
                {dashboardReports.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardReports.map((report: any) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                        onClick={() => openReportDetail(report)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <FileText className="size-4 text-blue-500" />
                            <span className="font-medium text-sm truncate">{report.id}</span>
                            {getStatusBadge(report.status || "pending")}
                            <Badge tone="info">{report.assetType}</Badge>
                          </div>
                          {report.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{report.summary}</p>}
                        </div>
                        <div className="flex items-center gap-3 ml-2 shrink-0">
                          <span className="text-lg font-semibold">{report.overallScore ?? 0}</span>
                          <ChevronRight className="size-4 text-muted-foreground" />
                        </div>
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
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("validate")}>
                    <Play className="mr-2 size-4" />
                    {t("qualityAssurance.runValidation", "Run Validation")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("reports")}>
                    <FileText className="mr-2 size-4" />
                    {t("qualityAssurance.reports", "Quality Reports")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("rules")}>
                    <ListChecks className="mr-2 size-4" />
                    {t("qualityAssurance.rules", "Rules")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("recommendations")}>
                    <Lightbulb className="mr-2 size-4" />
                    {t("qualityAssurance.recommendations", "Recommendations")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      mutateStats();
                      mutateReports();
                    }}
                  >
                    <RefreshCw className="mr-2 size-4" />
                    {t("common.refresh", "Refresh")}
                  </Button>
                </div>
              </DashboardCard>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                {renderSearchBar(reportSearch, setReportSearch)}
                <Button size="sm" onClick={() => setActiveTab("validate")}>
                  <Play className="mr-2 size-4" />
                  {t("qualityAssurance.runValidation", "Run Validation")}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                  <Filter className="ml-1 size-3.5 text-muted-foreground" />
                  <select
                    value={reportTypeFilter}
                    onChange={(e) => setReportTypeFilter(e.target.value)}
                    className="bg-transparent px-2 py-1.5 text-xs font-medium"
                  >
                    {ASSET_TYPES.map((type) => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                  <Filter className="ml-1 size-3.5 text-muted-foreground" />
                  <select
                    value={reportStatusFilter}
                    onChange={(e) => setReportStatusFilter(e.target.value)}
                    className="bg-transparent px-2 py-1.5 text-xs font-medium"
                  >
                    {REPORT_STATUSES.map((status) => (
                      <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              {reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((report: any) => renderReportCard(report))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("qualityAssurance.noReportsFound", "No reports found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "images" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-5 text-cyan-500" />
                  <h3 className="font-semibold text-sm">{t("qualityAssurance.imageResults", "Image Validation Results")}</h3>
                </div>
                <Badge tone="info">{images.length} {t("qualityAssurance.reports", "reports")}</Badge>
              </div>
              {images.length > 0 ? (
                <div className="space-y-3">
                  {images.map((report: any) => renderMetricReportCard(report, IMAGE_METRICS))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("qualityAssurance.noImages", "No image reports found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "videos" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <VideoIcon className="size-5 text-purple-500" />
                  <h3 className="font-semibold text-sm">{t("qualityAssurance.videoResults", "Video Validation Results")}</h3>
                </div>
                <Badge tone="info">{videos.length} {t("qualityAssurance.reports", "reports")}</Badge>
              </div>
              {videos.length > 0 ? (
                <div className="space-y-3">
                  {videos.map((report: any) => renderMetricReportCard(report, VIDEO_METRICS))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("qualityAssurance.noVideos", "No video reports found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "validate" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <DashboardCard title={t("qualityAssurance.runValidation", "Run Validation")}>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">{t("qualityAssurance.assetType", "Asset Type")}</label>
                      <select
                        value={validateAssetType}
                        onChange={(e) => setValidateAssetType(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        {ASSET_TYPES.filter((a) => a !== "all").map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">{t("qualityAssurance.moduleType", "Module Type")}</label>
                      <Input
                        value={validateModuleType}
                        onChange={(e) => setValidateModuleType(e.target.value)}
                        placeholder="manual"
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">{t("qualityAssurance.assetId", "Asset ID")}</label>
                      <Input
                        value={validateAssetId}
                        onChange={(e) => setValidateAssetId(e.target.value)}
                        placeholder={t("qualityAssurance.optional", "Optional")}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">{t("qualityAssurance.projectId", "Project ID")}</label>
                      <Input
                        value={validateProjectId}
                        onChange={(e) => setValidateProjectId(e.target.value)}
                        placeholder={t("qualityAssurance.optional", "Optional")}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">{t("qualityAssurance.minScore", "Min Score")}</label>
                      <Input
                        type="number"
                        value={validateMinScore}
                        onChange={(e) => setValidateMinScore(e.target.value)}
                        placeholder="70"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{t("qualityAssurance.assetData", "Asset Data (JSON)")}</label>
                    <textarea
                      value={validateAsset}
                      onChange={(e) => setValidateAsset(e.target.value)}
                      rows={10}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button size="sm" disabled={validating} onClick={handleRunValidation}>
                      {validating ? <Loader className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                      {t("qualityAssurance.validate", "Validate")}
                    </Button>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title={t("qualityAssurance.validationResult", "Validation Result")}>
                {validateResult ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-4">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("qualityAssurance.overallScore", "Overall Score")}</p>
                        <p className="text-3xl font-semibold">{validateResult.overallScore}</p>
                      </div>
                      {validateResult.passed ? (
                        <Badge tone="success">{t("qualityAssurance.passed", "Passed")}</Badge>
                      ) : (
                        <Badge tone="warning">{t("qualityAssurance.failed", "Failed")}</Badge>
                      )}
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{t("qualityAssurance.minScore", "Min Score")}</p>
                        <p className="text-lg font-semibold">{validateResult.minScore}</p>
                      </div>
                    </div>
                    {validateResult.reportId && (
                      <p className="text-xs text-muted-foreground">
                        {t("qualityAssurance.reportId", "Report")}: <span className="font-mono">{validateResult.reportId}</span>
                      </p>
                    )}
                    {validateResult.recovery && (
                      <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <div className="flex items-center gap-2">
                          <Activity className="size-4 text-muted-foreground" />
                          <Badge tone="info">{validateResult.recovery.action}</Badge>
                          <span className="text-xs text-muted-foreground">{validateResult.recovery.reason}</span>
                        </div>
                        {validateResult.recovery.retryCount != null && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t("qualityAssurance.retryCount", "Retry count")}: {validateResult.recovery.retryCount}
                          </p>
                        )}
                      </div>
                    )}
                    {validateResult.scores && Object.keys(validateResult.scores).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase">{t("qualityAssurance.scores", "Scores")}</p>
                        {Object.entries(validateResult.scores).map(([key, value]) => (
                          <div key={key}>{renderScoreBar(Number(value), key)}</div>
                        ))}
                      </div>
                    )}
                    {validateResult.validators &&
                      Object.entries(validateResult.validators)
                        .filter(([, v]) => v)
                        .map(([key, v]) => renderValidatorResult(key, v))}
                    {validateResult.recommendations?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase">{t("qualityAssurance.recommendations", "Recommendations")}</p>
                        {validateResult.recommendations.map((rec: any, i: number) => (
                          <div key={rec.id || i} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{rec.title}</p>
                              {rec.description && <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {getRecSeverityBadge(rec.severity)}
                              {rec.impact != null && <span className="text-xs text-muted-foreground">impact {rec.impact}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("qualityAssurance.runValidationHint", "Fill in the form and run validation to see results")}
                  </div>
                )}
              </DashboardCard>
            </div>
          )}

          {activeTab === "rules" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                {renderSearchBar(ruleSearch, setRuleSearch)}
                <Button size="sm" onClick={openCreateRule}>
                  <Plus className="mr-2 size-4" />
                  {t("qualityAssurance.createRule", "Create Rule")}
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                  <Filter className="ml-1 size-3.5 text-muted-foreground" />
                  <select
                    value={ruleCategoryFilter}
                    onChange={(e) => setRuleCategoryFilter(e.target.value)}
                    className="bg-transparent px-2 py-1.5 text-xs font-medium"
                  >
                    {RULE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              {showRuleForm && renderRuleForm()}
              <div className="grid gap-6 lg:grid-cols-2">
                {renderSettingsCard()}
                {renderThreshholdCard()}
              </div>
              {rules.length > 0 ? (
                <div className="space-y-3">
                  {rules.map((rule: any) => (
                    <DashboardCard key={rule.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <ListChecks className="size-4 text-blue-500" />
                            <span className="font-semibold text-sm">{rule.name || rule.id}</span>
                            {rule.isEnabled ? (
                              <Badge tone="success">{t("common.enabled", "Enabled")}</Badge>
                            ) : (
                              <Badge tone="muted">{t("common.disabled", "Disabled")}</Badge>
                            )}
                            {rule.isDefault && <Badge tone="purple">{t("qualityAssurance.default", "Default")}</Badge>}
                            {rule.category && <Badge tone="info">{rule.category}</Badge>}
                          </div>
                          {rule.description && <p className="text-xs text-muted-foreground mt-1">{rule.description}</p>}
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                            {rule.minScore != null && <span>{t("qualityAssurance.minScore", "Min Score")}: {rule.minScore}</span>}
                            <span>{t("qualityAssurance.mode", "Mode")}: {rule.mode}</span>
                            <span>{t("qualityAssurance.maxRetryCount", "Max Retries")}: {rule.maxRetryCount}</span>
                            {rule.createdAt && <span>{new Date(rule.createdAt).toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => handleToggleRule(rule)} title={t("qualityAssurance.toggleRule", "Toggle")}>
                            <Power className={`size-3 ${rule.isEnabled ? "text-green-500" : "text-muted-foreground"}`} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEditRule(rule)}>
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)}>
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
                    {t("qualityAssurance.noRules", "No rules found")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="size-5 text-amber-500" />
                  <h3 className="font-semibold text-sm">{t("qualityAssurance.recommendations", "Recommendations")}</h3>
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
                  {REC_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => setRecFilter(status)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        recFilter === status
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {filteredRecommendations.length > 0 ? (
                <div className="space-y-3">
                  {filteredRecommendations.map((rec: any) => (
                    <DashboardCard key={rec.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Lightbulb className="size-4 text-amber-500" />
                            <span className="font-semibold text-sm">{rec.title}</span>
                            {getRecSeverityBadge(rec.severity)}
                            {getStatusBadge(rec.status)}
                            {rec.impact != null && <Badge tone="muted">impact {rec.impact}</Badge>}
                          </div>
                          {rec.description && <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>}
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {rec.assetType && <Badge tone="info">{rec.assetType}</Badge>}
                            {rec.type && <span>{rec.type}</span>}
                            {rec.action && <span>{rec.action}</span>}
                            {rec.reportId && <span className="font-mono">{rec.reportId}</span>}
                            {rec.createdAt && <span>{new Date(rec.createdAt).toLocaleString()}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {rec.status !== "resolved" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateRecStatus(rec.reportId, rec.id, "resolved")}
                              title={t("qualityAssurance.markResolved", "Mark resolved")}
                            >
                              <Check className="size-3 text-green-500" />
                            </Button>
                          )}
                          {rec.status !== "ignored" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateRecStatus(rec.reportId, rec.id, "ignored")}
                              title={t("qualityAssurance.markIgnored", "Mark ignored")}
                            >
                              <X className="size-3 text-muted-foreground" />
                            </Button>
                          )}
                          {rec.status !== "open" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateRecStatus(rec.reportId, rec.id, "open")}
                              title={t("qualityAssurance.reopen", "Reopen")}
                            >
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
                    {t("qualityAssurance.noRecommendations", "No recommendations found")}
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
                      <FileText className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.totalReports", "Total Reports")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalReports ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                      <TrendingUp className="size-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.approvalRate", "Approval Rate")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.approvalRate ?? 0}%</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <AlertTriangle className="size-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.failedValidations", "Failed Validations")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.failedValidations ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Gauge className="size-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.totalRetries", "Total Retries")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalRetries ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard title={t("qualityAssurance.qualityDistribution", "Quality Distribution")}>
                  {(stats?.totalReports ?? 0) > 0 ? (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{t("qualityAssurance.passed", "Passed")}</span>
                          <span>{stats.passedReports} ({stats?.totalReports > 0 ? Math.round((stats.passedReports / stats.totalReports) * 100) : 0}%)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted/40">
                          <div
                            className="h-2.5 rounded-full bg-green-500 transition-all"
                            style={{ width: `${stats?.totalReports > 0 ? Math.min((stats.passedReports / stats.totalReports) * 100, 100) : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{t("qualityAssurance.failed", "Failed")}</span>
                          <span>{stats.failedReports} ({stats?.totalReports > 0 ? Math.round((stats.failedReports / stats.totalReports) * 100) : 0}%)</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted/40">
                          <div
                            className="h-2.5 rounded-full bg-red-500 transition-all"
                            style={{ width: `${stats?.totalReports > 0 ? Math.min((stats.failedReports / stats.totalReports) * 100, 100) : 0}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{t("qualityAssurance.requiredReview", "Requires Review")}</span>
                          <span>{stats?.pendingReviews ?? 0}</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-muted/40">
                          <div className="h-2.5 rounded-full bg-amber-500 transition-all" style={{ width: `${Math.min((stats?.pendingReviews ?? 0) / Math.max(stats?.totalReports ?? 1, 1) * 100, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("qualityAssurance.noData", "No data yet")}
                    </div>
                  )}
                </DashboardCard>

                <DashboardCard title={t("qualityAssurance.scoresByAssetType", "Scores by Asset Type")}>
                  {(stats?.typeBreakdown?.length ?? 0) > 0 ? (
                    <div className="space-y-2">
                      {stats.typeBreakdown.map((item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-24 text-sm">{item.assetType}</span>
                          <div className="h-2 flex-1 rounded-full bg-muted/40">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${Math.min(item.avgScore ?? 0, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {Math.round(item.avgScore ?? 0)} ({item.count})
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("qualityAssurance.noData", "No data yet")}
                    </div>
                  )}
                </DashboardCard>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-500/10">
                      <Activity className="size-5 text-cyan-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.totalValidations", "Total Validations")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalValidations ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Lightbulb className="size-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.recommendations", "Recommendations")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalRecommendations ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <ListChecks className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.avgScore", "Avg Score")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.avgOverallScore ?? 0}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Settings className="size-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.enabledRules", "Enabled Rules")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.activeRules ?? rules.filter((r: any) => r.isEnabled).length}</p>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              <DashboardCard title={t("qualityAssurance.failureBreakdown", "Failure Breakdown")}>
                {(stats?.totalReports ?? 0) > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.passed", "Passed")}</p>
                      <p className="mt-1 text-3xl font-semibold text-green-500">{stats?.passedReports ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.failed", "Failed")}</p>
                      <p className="mt-1 text-3xl font-semibold text-red-500">{stats?.failedReports ?? 0}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
                      <p className="text-xs text-muted-foreground">{t("qualityAssurance.totalValidations", "Total Validations")}</p>
                      <p className="mt-1 text-3xl font-semibold text-blue-500">{stats?.totalValidations ?? 0}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                    {t("qualityAssurance.noData", "No data yet")}
                  </div>
                )}
              </DashboardCard>
            </div>
          )}
        </>
      )}

      {showDetail && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-background p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{t("qualityAssurance.reportDetails", "Report Details")}</h3>
              <Button variant="ghost" size="sm" onClick={() => { setShowDetail(false); setSelectedReport(null); setDetailData(null); }}>
                <X className="size-4" />
              </Button>
            </div>
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(detailData?.status || selectedReport.status || "pending")}
                  <Badge tone="info">{detailData?.assetType || selectedReport.assetType}</Badge>
                  {detailData?.passed || selectedReport.passed ? (
                    <Badge tone="success">{t("qualityAssurance.passed", "Passed")}</Badge>
                  ) : (
                    <Badge tone="warning">{t("qualityAssurance.failed", "Failed")}</Badge>
                  )}
                </div>
                {detailData?.summary || selectedReport.summary ? (
                  <p className="text-xs text-muted-foreground">{detailData?.summary || selectedReport.summary}</p>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                    <p className="text-xs text-muted-foreground">{t("qualityAssurance.overallScore", "Overall Score")}</p>
                    <p className="mt-1 text-2xl font-semibold">{detailData?.overallScore ?? selectedReport.overallScore ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                    <p className="text-xs text-muted-foreground">{t("qualityAssurance.moduleType", "Module")}</p>
                    <p className="mt-1 text-sm font-medium truncate">{detailData?.moduleType || selectedReport.moduleType || "-"}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                    <p className="text-xs text-muted-foreground">{t("qualityAssurance.createdAt", "Created")}</p>
                    <p className="mt-1 text-xs text-muted-foreground break-words">
                      {detailData?.createdAt ? new Date(detailData.createdAt).toLocaleString() : "-"}
                    </p>
                  </div>
                </div>

                {(detailData?.scores?.length ?? 0) > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">{t("qualityAssurance.scores", "Scores")}</p>
                    <div className="space-y-1.5">
                      {detailData.scores.map((score: any) => (
                        <div key={score.id} className="rounded-lg border border-border bg-muted/20 p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm capitalize">{score.category}</span>
                            <span className="text-sm font-semibold">{score.score}</span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted/40">
                            <div
                              className={`h-1.5 rounded-full ${score.score >= 70 ? "bg-green-500" : score.score >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(score.score ?? 0, 100)}%` }}
                            />
                          </div>
                          {score.explanation && <p className="mt-1 text-xs text-muted-foreground">{score.explanation}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {imageReportMetrics(detailData, IMAGE_METRICS) && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">{t("qualityAssurance.imageMetrics", "Image Metrics")}</p>
                    {renderMetricGrid(imageReportMetrics(detailData, IMAGE_METRICS), IMAGE_METRICS)}
                  </div>
                )}

                {videoReportMetrics(detailData, VIDEO_METRICS) && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">{t("qualityAssurance.videoMetrics", "Video Metrics")}</p>
                    {renderMetricGrid(videoReportMetrics(detailData, VIDEO_METRICS), VIDEO_METRICS)}
                  </div>
                )}

                {(detailData?.validations?.length ?? 0) > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">{t("qualityAssurance.validations", "Validations")}</p>
                    <div className="space-y-2">
                      {detailData.validations.map((validation: any) => (
                        <div key={validation.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium">{validation.name}</span>
                              {validation.passed ? (
                                <Badge tone="success">{t("qualityAssurance.passed", "Passed")}</Badge>
                              ) : (
                                <Badge tone="warning">{t("qualityAssurance.failed", "Failed")}</Badge>
                              )}
                              <Badge tone="muted">{validation.severity}</Badge>
                            </div>
                            {validation.message && <p className="text-xs text-muted-foreground mt-0.5">{validation.message}</p>}
                            {validation.validatorType && <p className="text-xs text-muted-foreground mt-0.5">{validation.validatorType}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(detailData?.recommendations?.length ?? 0) > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">{t("qualityAssurance.recommendations", "Recommendations")}</p>
                    <div className="space-y-2">
                      {detailData.recommendations.map((rec: any) => (
                        <div key={rec.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium">{rec.title}</span>
                              {getRecSeverityBadge(rec.severity)}
                              {getStatusBadge(rec.status)}
                            </div>
                            {rec.description && <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>}
                            {rec.impact != null && <p className="text-xs text-muted-foreground mt-0.5">impact {rec.impact}</p>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {rec.status !== "resolved" && (
                              <Button variant="ghost" size="sm" onClick={() => handleUpdateRecStatus(detailData.id, rec.id, "resolved")}>
                                <Check className="size-3 text-green-500" />
                              </Button>
                            )}
                            {rec.status !== "ignored" && (
                              <Button variant="ghost" size="sm" onClick={() => handleUpdateRecStatus(detailData.id, rec.id, "ignored")}>
                                <X className="size-3 text-muted-foreground" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(detailData?.retries?.length ?? 0) > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">{t("qualityAssurance.retries", "Retry History")}</p>
                    <div className="space-y-2">
                      {detailData.retries.map((retry: any) => (
                        <div key={retry.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/20 p-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium">{t("qualityAssurance.retry", "Retry")} #{retry.retryCount}</span>
                              {getStatusBadge(retry.status)}
                            </div>
                            {retry.reason && <p className="text-xs text-muted-foreground mt-0.5">{retry.reason}</p>}
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{t("qualityAssurance.scoreBefore", "Before")}: {retry.scoreBefore}</span>
                              <span>{t("qualityAssurance.scoreAfter", "After")}: {retry.scoreAfter}</span>
                              {retry.provider && <span>{retry.provider}</span>}
                              {retry.model && <span>{retry.model}</span>}
                              {retry.createdAt && <span>{new Date(retry.createdAt).toLocaleString()}</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detailData?.metadata && Object.keys(detailData.metadata).length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">{t("qualityAssurance.metadata", "Metadata")}</p>
                    <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                      {JSON.stringify(detailData.metadata, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex justify-end gap-2 border-t border-border pt-4">
                  <Button variant="outline" size="sm" onClick={() => handleDeleteReport(selectedReport.id)}>
                    <Trash2 className="mr-2 size-3" />
                    {t("common.delete", "Delete")}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setShowDetail(false); setSelectedReport(null); setDetailData(null); }}>
                    {t("common.close", "Close")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function imageReportMetrics(detailData: any, metrics: string[]): Record<string, number> | null {
  if (!detailData) return null;
  const source: any = { ...(detailData.scores ?? {}), ...(detailData.metadata ?? {}) };
  if (Array.isArray(detailData.scores)) {
    for (const score of detailData.scores) {
      if (typeof score.score === "number") source[score.category] = score.score;
      if (score.details && typeof score.details === "object") Object.assign(source, score.details);
    }
  }
  const result: Record<string, number> = {};
  let count = 0;
  for (const m of metrics) {
    if (typeof source[m] === "number") {
      result[m] = source[m];
      count++;
    }
  }
  return count > 0 ? result : null;
}

function videoReportMetrics(detailData: any, metrics: string[]): Record<string, number> | null {
  return imageReportMetrics(detailData, metrics);
}
