"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader,
  Rocket,
  ClipboardCheck,
  Award,
  FileText,
  Activity,
  HeartPulse,
  Settings,
  FileCode,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
  TrendingUp,
  AlertTriangle,
  Shield,
  Server,
  Gauge,
  Calendar,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

type TabId =
  | "status"
  | "checklist"
  | "certifications"
  | "reports"
  | "events"
  | "health"
  | "settings"
  | "releaseNotes";

export function LaunchPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabId>("status");

  const { data: overviewData, isLoading: overviewLoading } = useSWR(
    "/api/launch/overview",
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: checklistData, isLoading: checklistLoading, mutate: mutateChecklist } = useSWR(
    "/api/launch/checklist?limit=200",
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: progressData, isLoading: progressLoading, mutate: mutateProgress } = useSWR(
    "/api/launch/checklist/progress",
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: certificationsData, isLoading: certificationsLoading, mutate: mutateCertifications } = useSWR(
    "/api/launch/certifications",
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: reportsData, isLoading: reportsLoading, mutate: mutateReports } = useSWR(
    "/api/launch/reports",
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: eventsData, isLoading: eventsLoading, mutate: mutateEvents } = useSWR(
    "/api/launch/events",
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR(
    "/api/launch/settings",
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: statsData, isLoading: statsLoading } = useSWR(
    "/api/launch/stats",
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: healthData, isLoading: healthLoading } = useSWR(
    "/api/health",
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 30000 }
  );

  const [checklistCategory, setChecklistCategory] = React.useState("all");
  const [newItemCategory, setNewItemCategory] = React.useState("");
  const [newItemName, setNewItemName] = React.useState("");
  const [newItemSeverity, setNewItemSeverity] = React.useState("medium");
  const [certName, setCertName] = React.useState("");
  const [certVersion, setCertVersion] = React.useState("");
  const [certScore, setCertScore] = React.useState("");
  const [certCertifiedBy, setCertCertifiedBy] = React.useState("");
  const [reportType, setReportType] = React.useState("checklist");
  const [reportTitle, setReportTitle] = React.useState("");
  const [eventType, setEventType] = React.useState("launch_started");
  const [eventTitle, setEventTitle] = React.useState("");
  const [eventSeverity, setEventSeverity] = React.useState("info");
  const [settingsDraft, setSettingsDraft] = React.useState<any>(null);
  const [releaseNotes, setReleaseNotes] = React.useState("");

  React.useEffect(() => {
    if (settingsData?.data) setSettingsDraft(settingsData.data);
  }, [settingsData]);

  const handleAddChecklistItem = async () => {
    if (!newItemCategory || !newItemName) {
      toast.error(t("launch.noChecklist", "Please fill all fields"));
      return;
    }
    try {
      await fetch("/api/launch/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newItemCategory,
          item: newItemName,
          severity: newItemSeverity,
        }),
      });
      toast.success(t("launch.itemVerified", "Item added"));
      setNewItemCategory("");
      setNewItemName("");
      mutateChecklist();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleVerifyItem = async (id: string) => {
    try {
      await fetch(`/api/launch/checklist/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      });
      toast.success(t("launch.itemVerified", "Item verified"));
      mutateChecklist();
      mutateProgress();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleBlockItem = async (id: string) => {
    try {
      await fetch(`/api/launch/checklist/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "block", notes: "Blocked by operator" }),
      });
      toast.success(t("launch.itemBlocked", "Item blocked"));
      mutateChecklist();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleCreateCertification = async () => {
    if (!certName || !certVersion) {
      toast.error(t("launch.noCertifications", "Please fill all fields"));
      return;
    }
    try {
      await fetch("/api/launch/certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: certName, version: certVersion }),
      });
      toast.success(t("launch.certificationCreated", "Certification created"));
      setCertName("");
      setCertVersion("");
      mutateCertifications();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleCertify = async (id: string) => {
    if (!certScore || !certCertifiedBy) {
      toast.error(t("common.error", "Please fill score and certified by"));
      return;
    }
    try {
      await fetch(`/api/launch/certifications/${id}/certify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: parseInt(certScore), certifiedBy: certCertifiedBy }),
      });
      toast.success(t("launch.certificationCompleted", "Certification completed"));
      setCertScore("");
      setCertCertifiedBy("");
      mutateCertifications();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleGenerateReport = async () => {
    if (!reportTitle) {
      toast.error(t("launch.noReports", "Please enter a title"));
      return;
    }
    try {
      await fetch("/api/launch/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          title: reportTitle,
          data: { generatedFrom: "dashboard" },
        }),
      });
      toast.success(t("launch.reportGenerated", "Report generated"));
      setReportTitle("");
      mutateReports();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleRecordEvent = async () => {
    if (!eventTitle) {
      toast.error(t("launch.noEvents", "Please enter a title"));
      return;
    }
    try {
      await fetch("/api/launch/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          title: eventTitle,
          severity: eventSeverity,
        }),
      });
      toast.success(t("launch.eventRecorded", "Event recorded"));
      setEventTitle("");
      mutateEvents();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleSaveSettings = async () => {
    if (!settingsDraft) return;
    try {
      await fetch("/api/launch/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsDraft),
      });
      toast.success(t("launch.settingsUpdated", "Settings updated"));
      mutateSettings();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleGenerateReleaseNotes = async () => {
    try {
      const res = await fetch("/api/launch/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: "release_notes",
          title: `Release Notes v${settingsDraft?.launchVersion || "1.0"}`,
          data: { version: settingsDraft?.launchVersion || "1.0", generatedFrom: "dashboard" },
        }),
      });
      const data = await res.json();
      const version = settingsDraft?.launchVersion || "1.0";
      setReleaseNotes(
        `# Tamer Studio v${version} - Release Notes\n\n## Overview\nTamer Studio v${version} marks the General Availability (GA) release of the platform.\n\n## Features\n- Complete AI-powered content creation suite\n- Multi-provider AI runtime with cost optimization\n- Landing page builder with drag-and-drop\n- Asset intelligence and management\n- Drama and story generation\n- Campaign and marketing tools\n- Beta program management\n- Launch readiness tracking\n\n## Infrastructure\n- Docker containerization\n- PostgreSQL database with Drizzle ORM\n- Redis caching layer\n- Multi-tier middleware architecture\n\n## Security\n- JWT-based authentication\n- Role-based access control\n- API key management\n- Input validation and sanitization\n\n## Performance\n- Server-side rendering with Next.js\n- SWR client-side data fetching\n- Optimized database queries\n- Static asset caching`
      );
      toast.success(t("launch.reportGenerated", "Release notes generated"));
      mutateReports();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const overview = overviewData?.data;
  const checklistItems = checklistData?.data?.data || [];
  const progress = progressData?.data;
  const certifications = certificationsData?.data || [];
  const reports = reportsData?.data?.data || [];
  const events = eventsData?.data?.data || [];
  const settings = settingsData?.data;
  const health = healthData;

  const categories = [...new Set(checklistItems.map((i: any) => String(i.category)))] as string[];

  const filteredChecklist =
    checklistCategory === "all"
      ? checklistItems
      : checklistItems.filter((i: any) => i.category === checklistCategory);

  const statusBadge = (status: string) => {
    if (status === "verified" || status === "certified_stable" || status === "ga_ready")
      return "success";
    if (status === "blocked" || status === "not_ready") return "warning";
    return "muted";
  };

  const severityBadge = (severity: string) => {
    if (severity === "critical") return "warning";
    if (severity === "high") return "warning";
    if (severity === "medium") return "muted";
    return "muted";
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "status", label: t("launch.launchStatus", "Launch Status"), icon: <Rocket className="size-4" /> },
    { id: "checklist", label: t("launch.goLiveChecklist", "Go-Live Checklist"), icon: <ClipboardCheck className="size-4" /> },
    { id: "certifications", label: t("launch.certifications", "Certifications"), icon: <Award className="size-4" /> },
    { id: "reports", label: t("launch.reports", "Reports"), icon: <FileText className="size-4" /> },
    { id: "events", label: t("launch.events", "Events"), icon: <Calendar className="size-4" /> },
    { id: "health", label: t("launch.health", "Health"), icon: <HeartPulse className="size-4" /> },
    { id: "settings", label: t("launch.settings", "Settings"), icon: <Settings className="size-4" /> },
    { id: "releaseNotes", label: t("launch.releaseNotes", "Release Notes"), icon: <FileCode className="size-4" /> },
  ];

  const certifyColor = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 75) return "warning";
    return "muted";
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await fetch(`/api/launch/reports/${id}`, { method: "DELETE" });
      toast.success(t("common.success", "Deleted"));
      mutateReports();
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("launch.title", "Launch Control")}
        description={t("launch.description", "GA-01 launch readiness tracking, certifications, and go-live management")}
      />

      <DashboardCard>
        <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "status" && (
          <div className="space-y-6">
            {overviewLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{t("launch.progressPercent", "Progress")}</p>
                    <p className="text-2xl font-bold">{progress?.progressPercent ?? 0}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {progress?.verified ?? 0}/{progress?.total ?? 0} {t("launch.verifiedItems", "verified")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{t("launch.totalItems", "Total Items")}</p>
                    <p className="text-2xl font-bold">{progress?.total ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {progress?.blocked ?? 0} {t("launch.blockedItems", "blocked")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{t("launch.overallScore", "Certification Score")}</p>
                    <p className="text-2xl font-bold">{overview?.certification?.score ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {overview?.certification?.status ?? t("launch.notReady", "Not Ready")}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground mb-1">{t("launch.version", "Version")}</p>
                    <p className="text-2xl font-bold">{overview?.settings?.version ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {overview?.settings?.launchDate
                        ? new Date(overview.settings.launchDate).toLocaleDateString()
                        : t("launch.launchDate", "Not set")}
                    </p>
                  </div>
                </div>
                {progress && (
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold">{t("launch.launchReadiness", "Launch Readiness")}</p>
                      <Badge tone={progress.progressPercent >= 90 ? "success" : progress.progressPercent >= 50 ? "warning" : "muted"}>
                        {progress.progressPercent >= 90
                          ? t("launch.gaReady", "GA Ready")
                          : progress.progressPercent >= 50
                          ? t("launch.releaseCandidate", "Release Candidate")
                          : t("launch.notReady", "Not Ready")}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-primary rounded-full h-3 transition-all"
                        style={{ width: `${progress.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{progress.progressPercent}%</p>
                  </div>
                )}
                {progress?.byCategory && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {progress.byCategory.map((cat: any) => (
                      <div key={cat.category} className="rounded-lg border border-border p-3">
                        <p className="text-xs text-muted-foreground mb-1">{cat.category}</p>
                        <p className="text-lg font-bold">
                          {Number(cat.verified)}/{Number(cat.total)}
                        </p>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{
                              width: `${Number(cat.total) > 0 ? (Number(cat.verified) / Number(cat.total)) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "checklist" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={checklistCategory}
                onChange={(e) => setChecklistCategory(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">{t("launch.category", "All Categories")}</option>
                {categories.map((cat: string) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Input
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                placeholder={t("launch.category", "Category")}
                className="w-40"
              />
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={t("launch.item", "Item name")}
                className="flex-1 min-w-[200px]"
              />
              <select
                value={newItemSeverity}
                onChange={(e) => setNewItemSeverity(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="low">{t("launch.low", "Low")}</option>
                <option value="medium">{t("launch.medium", "Medium")}</option>
                <option value="high">{t("launch.high", "High")}</option>
                <option value="critical">{t("launch.critical", "Critical")}</option>
              </select>
              <Button onClick={handleAddChecklistItem}>
                <Plus className="mr-1 size-4" />
                {t("common.create", "Add")}
              </Button>
            </div>
            {checklistLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredChecklist.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {t("launch.noChecklist", "No checklist items yet")}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredChecklist.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      {item.status === "verified" ? (
                        <CheckCircle className="size-4 text-green-500" />
                      ) : item.status === "blocked" ? (
                        <XCircle className="size-4 text-red-500" />
                      ) : (
                        <Clock className="size-4 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{item.item}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.category} - {t("launch.severity", "Severity")}: {item.severity || "medium"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={statusBadge(item.status)}>{item.status}</Badge>
                      {item.status === "pending" && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleVerifyItem(item.id)}>
                            <CheckCircle className="mr-1 size-3" />
                            {t("launch.verified", "Verify")}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleBlockItem(item.id)}>
                            <XCircle className="mr-1 size-3 text-destructive" />
                            {t("launch.blocked", "Block")}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "certifications" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h3 className="text-sm font-semibold">{t("launch.certifications", "New Certification")}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  placeholder={t("launch.certifications", "Certification name")}
                  className="flex-1 min-w-[200px]"
                />
                <Input
                  value={certVersion}
                  onChange={(e) => setCertVersion(e.target.value)}
                  placeholder={t("launch.version", "Version")}
                  className="w-28"
                />
                <Button onClick={handleCreateCertification}>
                  <Plus className="mr-1 size-4" />
                  {t("common.create", "Create")}
                </Button>
              </div>
            </div>
            {certificationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : certifications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {t("launch.noCertifications", "No certifications yet")}
              </p>
            ) : (
              <div className="space-y-2">
                {certifications.map((cert: any) => (
                  <div key={cert.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{cert.name}</p>
                        <Badge tone="muted">{cert.version}</Badge>
                        <Badge tone={statusBadge(cert.status)}>{cert.status}</Badge>
                      </div>
                      {cert.overallScore != null && (
                        <Badge tone={certifyColor(cert.overallScore)}>{t("launch.score", "Score")}: {cert.overallScore}</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {cert.certifiedBy && <span>{t("launch.certifiedBy", "By")}: {cert.certifiedBy}</span>}
                      {cert.certifiedAt && <span>{t("launch.certifiedAt", "At")}: {new Date(cert.certifiedAt).toLocaleString()}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        value={certScore}
                        onChange={(e) => setCertScore(e.target.value)}
                        placeholder={t("launch.score", "Score (0-100)")}
                        className="w-28"
                      />
                      <Input
                        value={certCertifiedBy}
                        onChange={(e) => setCertCertifiedBy(e.target.value)}
                        placeholder={t("launch.certifiedBy", "Certified by")}
                        className="w-40"
                      />
                      <Button variant="ghost" size="sm" onClick={() => handleCertify(cert.id)}>
                        <Award className="mr-1 size-3" />
                        {t("launch.certifications", "Certify")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h3 className="text-sm font-semibold">{t("launch.reports", "Generate Report")}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="checklist">{t("launch.launchChecklist", "Launch Checklist")}</option>
                  <option value="go_live">{t("launch.goLiveReport", "Go-Live Report")}</option>
                  <option value="infrastructure">{t("launch.infrastructureReport", "Infrastructure Report")}</option>
                  <option value="performance">{t("launch.performanceReport", "Performance Report")}</option>
                  <option value="security">{t("launch.securityReport", "Security Report")}</option>
                  <option value="beta_summary">{t("launch.betaSummary", "Beta Summary")}</option>
                </select>
                <Input
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder={t("launch.reports", "Report title")}
                  className="flex-1 min-w-[200px]"
                />
                <Button onClick={handleGenerateReport}>
                  <FileText className="mr-1 size-4" />
                  {t("launch.reports", "Generate")}
                </Button>
              </div>
            </div>
            {reportsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : reports.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {t("launch.noReports", "No reports yet")}
              </p>
            ) : (
              <div className="space-y-2">
                {reports.map((report: any) => (
                  <div key={report.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">{report.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {report.reportType} - {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : ""}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => handleDeleteReport(report.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4 space-y-3">
              <h3 className="text-sm font-semibold">{t("launch.events", "Record Event")}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="launch_started">{t("launch.launchStarted", "Launch Started")}</option>
                  <option value="launch_completed">{t("launch.launchCompleted", "Launch Completed")}</option>
                  <option value="launch_blocked">{t("launch.launchBlocked", "Launch Blocked")}</option>
                  <option value="critical_bug">{t("launch.criticalBug", "Critical Bug")}</option>
                </select>
                <Input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder={t("launch.events", "Event title")}
                  className="flex-1 min-w-[200px]"
                />
                <select
                  value={eventSeverity}
                  onChange={(e) => setEventSeverity(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
                <Button onClick={handleRecordEvent}>
                  <Calendar className="mr-1 size-4" />
                  {t("launch.events", "Record")}
                </Button>
              </div>
            </div>
            {eventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : events.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {t("launch.noEvents", "No events yet")}
              </p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {events.map((event: any) => (
                    <div key={event.id} className="flex items-start gap-4 pl-8 relative">
                      <div className="absolute left-2.5 top-1 size-3 rounded-full bg-border border-2 border-background" />
                      <div className="rounded-lg border border-border p-3 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium">{event.title}</p>
                          <div className="flex items-center gap-1">
                            <Badge tone={severityBadge(event.severity)}>{event.severity}</Badge>
                            <Badge tone="muted">{event.eventType}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {event.createdAt ? new Date(event.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "health" && (
          <div className="space-y-6">
            {healthLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <HeartPulse className="size-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{t("launch.health", "System Status")}</p>
                    </div>
                    <Badge tone={health?.status === "healthy" ? "success" : health?.status === "degraded" ? "warning" : "muted"}>
                      {health?.status ?? "unknown"}
                    </Badge>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="size-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{t("launch.version", "Version")}</p>
                    </div>
                    <p className="text-lg font-bold">{health?.version ?? "—"}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="size-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Memory</p>
                    </div>
                    <p className="text-lg font-bold">{health?.memory?.used ?? 0}MB</p>
                    <p className="text-xs text-muted-foreground">/ {health?.memory?.total ?? 0}MB</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="size-4 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Uptime</p>
                    </div>
                    <p className="text-lg font-bold">
                      {health?.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : "—"}
                    </p>
                  </div>
                </div>
                {health?.checks && (
                  <div className="space-y-2">
                    {Object.entries(health.checks).map(([name, check]: [string, any]) => (
                      <div key={name} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex items-center gap-3">
                          {check.status === "healthy" ? (
                            <CheckCircle className="size-4 text-green-500" />
                          ) : check.status === "unhealthy" ? (
                            <XCircle className="size-4 text-red-500" />
                          ) : (
                            <AlertTriangle className="size-4 text-yellow-500" />
                          )}
                          <p className="text-sm font-medium">{name}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {check.latencyMs != null && <span>{check.latencyMs}ms</span>}
                          <Badge tone={check.status === "healthy" ? "success" : check.status === "unhealthy" ? "warning" : "muted"}>
                            {check.status}
                          </Badge>
                          {check.error && <span className="text-destructive">{check.error}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4 max-w-xl">
            {settingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : settingsDraft ? (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t("launch.launchVersion", "Launch Version")}</label>
                    <Input
                      value={settingsDraft.launchVersion || ""}
                      onChange={(e) =>
                        setSettingsDraft((prev: any) => ({ ...prev, launchVersion: e.target.value }))
                      }
                      placeholder="1.0.0"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t("launch.launchDate", "Launch Date")}</label>
                    <Input
                      type="date"
                      value={settingsDraft.launchDate ? new Date(settingsDraft.launchDate).toISOString().split("T")[0] : ""}
                      onChange={(e) =>
                        setSettingsDraft((prev: any) => ({ ...prev, launchDate: e.target.value }))
                      }
                    />
                  </div>
                  {[
                    { key: "isPublicRegistrationEnabled", label: t("launch.registrationEnabled", "Registration Enabled") },
                    { key: "maintenanceMode", label: t("launch.maintenanceMode", "Maintenance Mode") },
                    { key: "launchFreeze", label: t("launch.launchFreeze", "Launch Freeze") },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <label className="text-sm font-medium">{item.label}</label>
                      <button
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          settingsDraft[item.key] ? "bg-primary" : "bg-muted"
                        }`}
                        onClick={() =>
                          setSettingsDraft((prev: any) => ({ ...prev, [item.key]: !prev[item.key] }))
                        }
                      >
                        <span
                          className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
                            settingsDraft[item.key] ? "translate-x-4.5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t("launch.emergencyBanner", "Emergency Banner")}</label>
                    <Input
                      value={settingsDraft.emergencyBanner || ""}
                      onChange={(e) =>
                        setSettingsDraft((prev: any) => ({ ...prev, emergencyBanner: e.target.value }))
                      }
                      placeholder="Enter banner message or leave empty"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t("launch.statusPage", "Status Page URL")}</label>
                    <Input
                      value={settingsDraft.statusPage || ""}
                      onChange={(e) =>
                        setSettingsDraft((prev: any) => ({ ...prev, statusPage: e.target.value }))
                      }
                      placeholder="https://status.tamerstudio.com"
                    />
                  </div>
                </div>
                <Button onClick={handleSaveSettings}>{t("common.save", "Save Settings")}</Button>
              </>
            ) : null}
          </div>
        )}

        {activeTab === "releaseNotes" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button onClick={handleGenerateReleaseNotes}>
                <FileCode className="mr-1 size-4" />
                {t("launch.releaseNotes", "Generate Release Notes")}
              </Button>
            </div>
            {releaseNotes ? (
              <div className="rounded-lg border border-border p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">{releaseNotes}</pre>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {t("launch.releaseNotes", "Click generate to create release notes for the current version")}
              </p>
            )}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
