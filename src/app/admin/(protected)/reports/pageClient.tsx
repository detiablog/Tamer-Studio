"use client";

import * as React from "react";
import useSWR from "swr";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  FileBarChart,
  Plus,
  Search,
  Loader2,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Clock,
  Calendar,
  Target,
  LayoutGrid,
  List,
  BarChart3,
  DollarSign,
  Brain,
  Users,
  CreditCard,
  Megaphone,
  Share2,
  Mail,
  HardDrive,
  Activity,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Zap,
} from "lucide-react";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

type Report = {
  id: string;
  name: string;
  type: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
};

type ReportTemplate = {
  id: string;
  name: string;
  category: string;
  usageCount: number;
  isSystem: boolean;
};

type ReportSchedule = {
  id: string;
  name: string;
  templateId: string;
  scheduleType: string;
  format: string;
  recipients: string;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
};

type KpiData = {
  id: string;
  name: string;
  category: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: "up" | "down" | "flat";
  owner: string;
};

type ExportRecord = {
  id: string;
  name: string;
  format: string;
  status: string;
  createdAt: string;
  fileSize?: string;
};

type ReportForm = {
  name: string;
  type: string;
  category: string;
};

type TemplateForm = {
  name: string;
  category: string;
};

type ScheduleForm = {
  name: string;
  templateId: string;
  scheduleType: string;
  format: string;
  recipients: string;
  timezone: string;
};

type KpiForm = {
  name: string;
  category: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  owner: string;
};

const REPORT_TYPES = [
  "financial",
  "ai_usage",
  "subscription",
  "user",
  "credit",
  "campaign",
  "affiliate",
  "referral",
  "publishing",
  "storage",
  "operational",
] as const;

const KPI_CATEGORIES = ["financial", "ai", "subscription", "marketing"] as const;

const REPORT_STATUSES = ["draft", "active", "archived"] as const;

const EMPTY_REPORT_FORM: ReportForm = { name: "", type: "financial", category: "financial" };
const EMPTY_TEMPLATE_FORM: TemplateForm = { name: "", category: "financial" };
const EMPTY_SCHEDULE_FORM: ScheduleForm = { name: "", templateId: "", scheduleType: "daily", format: "csv", recipients: "", timezone: "Asia/Jakarta" };
const EMPTY_KPI_FORM: KpiForm = { name: "", category: "financial", currentValue: 0, targetValue: 0, unit: "", owner: "" };

const ITEMS_PER_PAGE = 10;

export function ReportsPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<"overview" | "reports" | "templates" | "schedules" | "kpis" | "exports">("overview");
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [kpiCategoryFilter, setKpiCategoryFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogType, setDialogType] = React.useState<"report" | "template" | "schedule" | "kpi">("report");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const [reportForm, setReportForm] = React.useState<ReportForm>({ ...EMPTY_REPORT_FORM });
  const [templateForm, setTemplateForm] = React.useState<TemplateForm>({ ...EMPTY_TEMPLATE_FORM });
  const [scheduleForm, setScheduleForm] = React.useState<ScheduleForm>({ ...EMPTY_SCHEDULE_FORM });
  const [kpiForm, setKpiForm] = React.useState<KpiForm>({ ...EMPTY_KPI_FORM });

  const { data: reportsData, isLoading: reportsLoading, mutate: mutateReports } = useSWR("/api/admin/reports", fetcher, { revalidateOnFocus: false });
  const { data: templatesData, mutate: mutateTemplates } = useSWR("/api/admin/reports/templates", fetcher, { revalidateOnFocus: false });
  const { data: schedulesData, mutate: mutateSchedules } = useSWR("/api/admin/reports/schedules", fetcher, { revalidateOnFocus: false });
  const { data: kpisData, mutate: mutateKpis } = useSWR("/api/admin/reports/kpis", fetcher, { revalidateOnFocus: false });
  const { data: exportsData, mutate: mutateExports } = useSWR("/api/admin/reports/exports", fetcher, { revalidateOnFocus: false });

  const reports: Report[] = React.useMemo(() => {
    if (Array.isArray(reportsData?.data)) return reportsData.data;
    if (Array.isArray(reportsData)) return reportsData;
    return [];
  }, [reportsData]);

  const templates: ReportTemplate[] = React.useMemo(() => {
    if (Array.isArray(templatesData?.data)) return templatesData.data;
    if (Array.isArray(templatesData)) return templatesData;
    return [];
  }, [templatesData]);

  const schedules: ReportSchedule[] = React.useMemo(() => {
    if (Array.isArray(schedulesData?.data)) return schedulesData.data;
    if (Array.isArray(schedulesData)) return schedulesData;
    return [];
  }, [schedulesData]);

  const kpis: KpiData[] = React.useMemo(() => {
    if (Array.isArray(kpisData?.data)) return kpisData.data;
    if (Array.isArray(kpisData)) return kpisData;
    return [];
  }, [kpisData]);

  const exports: ExportRecord[] = React.useMemo(() => {
    if (Array.isArray(exportsData?.data)) return exportsData.data;
    if (Array.isArray(exportsData)) return exportsData;
    return [];
  }, [exportsData]);

  const filteredReports = React.useMemo(() => {
    return reports.filter((r) => {
      const matchSearch = !search || r.name?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || r.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [reports, search, typeFilter]);

  const filteredKpis = React.useMemo(() => {
    return kpis.filter((k) => {
      return kpiCategoryFilter === "all" || k.category === kpiCategoryFilter;
    });
  }, [kpis, kpiCategoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / ITEMS_PER_PAGE));
  const paginatedReports = filteredReports.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const overviewStats = React.useMemo(() => {
    const activeSchedules = schedules.filter((s) => s.isActive).length;
    return {
      totalReports: reports.length,
      totalKpis: kpis.length,
      activeSchedules,
      totalExports: exports.length,
    };
  }, [reports, kpis, schedules, exports]);

  const openCreateReport = () => {
    setDialogType("report");
    setEditingId(null);
    setReportForm({ ...EMPTY_REPORT_FORM });
    setDialogOpen(true);
  };

  const openCreateTemplate = () => {
    setDialogType("template");
    setEditingId(null);
    setTemplateForm({ ...EMPTY_TEMPLATE_FORM });
    setDialogOpen(true);
  };

  const openCreateSchedule = () => {
    setDialogType("schedule");
    setEditingId(null);
    setScheduleForm({ ...EMPTY_SCHEDULE_FORM });
    setDialogOpen(true);
  };

  const openCreateKpi = () => {
    setDialogType("kpi");
    setEditingId(null);
    setKpiForm({ ...EMPTY_KPI_FORM });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let url = "";
      let body: Record<string, unknown> = {};
      let mutateFn = mutateReports;

      switch (dialogType) {
        case "report":
          url = editingId ? `/api/admin/reports/${editingId}` : "/api/admin/reports";
          body = reportForm;
          mutateFn = mutateReports;
          break;
        case "template":
          url = editingId ? `/api/admin/reports/templates/${editingId}` : "/api/admin/reports/templates";
          body = templateForm;
          mutateFn = mutateTemplates;
          break;
        case "schedule":
          url = editingId ? `/api/admin/reports/schedules/${editingId}` : "/api/admin/reports/schedules";
          body = scheduleForm;
          mutateFn = mutateSchedules;
          break;
        case "kpi":
          url = editingId ? `/api/admin/reports/kpis/${editingId}` : "/api/admin/reports/kpis";
          body = kpiForm;
          mutateFn = mutateKpis;
          break;
      }

      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save");
      toast.success(editingId ? t("common.updated", "Updated") : t("common.created", "Created"));
      setDialogOpen(false);
      mutateFn();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (reportId: string, format: string) => {
    toast.info(t("admin.reports.exportStarted", "Export started"));
    try {
      const res = await fetch("/api/admin/reports/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, format }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Export failed");
      toast.success(t("admin.reports.exportCompleted", "Export completed"));
      mutateExports();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const reportTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      financial: t("admin.reports.financialReports", "Financial Reports"),
      ai_usage: t("admin.reports.aiReports", "AI Usage Reports"),
      subscription: t("admin.reports.subscriptionReports", "Subscription Reports"),
      user: t("admin.reports.userReports", "User Reports"),
      credit: t("admin.reports.creditReports", "Credit Reports"),
      campaign: t("admin.reports.campaignReports", "Campaign Reports"),
      affiliate: t("admin.reports.affiliateReports", "Affiliate Reports"),
      referral: t("admin.reports.referralReports", "Referral Reports"),
      publishing: t("admin.reports.publishingReports", "Publishing Reports"),
      storage: t("admin.reports.storageReports", "Storage Reports"),
      operational: t("admin.reports.operationalReports", "Operational Reports"),
    };
    return map[type] || type;
  };

  const statusTone = (status: string): "default" | "success" | "warning" | "info" | "muted" | "purple" => {
    switch (status) {
      case "active": return "success";
      case "draft": return "warning";
      case "completed": return "success";
      case "processing": return "info";
      case "failed": return "warning";
      case "archived": return "muted";
      default: return "default";
    }
  };

  const trendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="size-4 text-emerald-500" />;
      case "down": return <TrendingDown className="size-4 text-red-500" />;
      default: return <Minus className="size-4 text-muted-foreground" />;
    }
  };

  const categoryIcon = (category: string) => {
    switch (category) {
      case "financial": return <DollarSign className="size-4" />;
      case "ai": return <Brain className="size-4" />;
      case "subscription": return <CreditCard className="size-4" />;
      case "marketing": return <Megaphone className="size-4" />;
      default: return <BarChart3 className="size-4" />;
    }
  };

  const tabs = [
    { id: "overview" as const, label: t("admin.reports.executiveOverview", "Executive Overview"), icon: LayoutGrid },
    { id: "reports" as const, label: t("admin.reports.reportList", "Reports"), icon: FileBarChart },
    { id: "templates" as const, label: t("admin.reports.reportTemplates", "Report Templates"), icon: FileText },
    { id: "schedules" as const, label: t("admin.reports.scheduledReports", "Scheduled Reports"), icon: Clock },
    { id: "kpis" as const, label: t("admin.reports.kpiCenter", "KPI Center"), icon: Target },
    { id: "exports" as const, label: t("admin.reports.exportHistory", "Export History"), icon: Download },
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("admin.reports", "Reports"), href: "/admin/reports" },
          ]}
        />
        <PageHeader
          title={t("admin.reports", "Reports")}
          description={t("admin.reports.reportsDescription", "Business Intelligence & Executive Reporting")}
          actions={
            <Button onClick={activeTab === "reports" ? openCreateReport : activeTab === "templates" ? openCreateTemplate : activeTab === "schedules" ? openCreateSchedule : activeTab === "kpis" ? openCreateKpi : undefined}>
              <Plus className="mr-2 size-4" />
              {activeTab === "reports" ? t("admin.reports.createReport") : activeTab === "templates" ? t("admin.reports.createTemplate") : activeTab === "schedules" ? t("admin.reports.createSchedule") : activeTab === "kpis" ? t("admin.reports.createKpi") : t("common.create")}
            </Button>
          }
        />

        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); setSearch(""); }}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DashboardCard>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <FileBarChart className="size-4" />
                  {t("admin.reports.totalReports", "Total Reports")}
                </div>
                <div className="text-2xl font-semibold">{overviewStats.totalReports}</div>
              </DashboardCard>
              <DashboardCard>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Target className="size-4" />
                  {t("admin.reports.kpis", "KPIs")}
                </div>
                <div className="text-2xl font-semibold">{overviewStats.totalKpis}</div>
              </DashboardCard>
              <DashboardCard>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="size-4" />
                  {t("admin.reports.activeSchedules", "Active Schedules")}
                </div>
                <div className="text-2xl font-semibold">{overviewStats.activeSchedules}</div>
              </DashboardCard>
              <DashboardCard>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Download className="size-4" />
                  {t("admin.reports.exports", "Exports")}
                </div>
                <div className="text-2xl font-semibold">{overviewStats.totalExports}</div>
              </DashboardCard>
            </div>

            <DashboardCard title={t("admin.reports.kpiCenter", "KPI Center")}>
              {kpis.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Target className="size-12 text-muted-foreground mb-4 opacity-40" />
                  <p className="text-muted-foreground">{t("admin.reports.noKpis", "No KPIs configured")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kpis.slice(0, 6).map((kpi) => (
                    <div key={kpi.id} className="flex flex-col gap-2 p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {categoryIcon(kpi.category)}
                          {kpi.name}
                        </div>
                        {trendIcon(kpi.trend)}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-semibold">{kpi.currentValue}</span>
                        {kpi.unit && <span className="text-sm text-muted-foreground">{kpi.unit}</span>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t("admin.reports.kpiTarget", "Target")}: {kpi.targetValue}{kpi.unit ? ` ${kpi.unit}` : ""}</span>
                        <Badge tone={kpi.currentValue >= kpi.targetValue ? "success" : "warning"}>
                          {kpi.currentValue >= kpi.targetValue ? "On Track" : "Below Target"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashboardCard>
          </div>
        )}

        {activeTab === "reports" && (
          <DashboardCard>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder={t("common.search", "Search") + "..."}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="pl-9"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="all">{t("common.all")}</option>
                  {REPORT_TYPES.map((tp) => (
                    <option key={tp} value={tp}>{reportTypeLabel(tp)}</option>
                  ))}
                </select>
              </div>

              {reportsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : paginatedReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileBarChart className="size-12 text-muted-foreground mb-4 opacity-40" />
                  <p className="text-muted-foreground">{t("admin.reports.noReports", "No reports generated yet")}</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.reportName", "Report Name")}</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.reportType", "Report Type")}</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.reportCategory", "Category")}</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.reportStatus", "Status")}</th>
                          <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.date", "Date")}</th>
                          <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedReports.map((report) => (
                          <tr key={report.id} className="border-b border-border hover:bg-muted/30">
                            <td className="py-3 px-2 font-medium">{report.name}</td>
                            <td className="py-3 px-2">{reportTypeLabel(report.type)}</td>
                            <td className="py-3 px-2">{report.category}</td>
                            <td className="py-3 px-2"><Badge tone={statusTone(report.status)}>{report.status}</Badge></td>
                            <td className="py-3 px-2">{formatDate(report.createdAt)}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm"><Eye className="size-4" /></Button>
                                <Button variant="ghost" size="sm"><Pencil className="size-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => handleExport(report.id, "csv")}><Download className="size-4" /></Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">
                        {t("adminDataTable.showing", `Showing ${(page - 1) * ITEMS_PER_PAGE + 1}–${Math.min(page * ITEMS_PER_PAGE, filteredReports.length)} of ${filteredReports.length}`)}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                          <ChevronLeft className="size-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </DashboardCard>
        )}

        {activeTab === "templates" && (
          <div className="space-y-4">
            {templates.length === 0 ? (
              <DashboardCard>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <LayoutGrid className="size-12 text-muted-foreground mb-4 opacity-40" />
                  <p className="text-muted-foreground">{t("admin.reports.noTemplates", "No templates yet")}</p>
                </div>
              </DashboardCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((tpl) => (
                  <DashboardCard key={tpl.id}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{tpl.name}</h3>
                        {tpl.isSystem && <Badge tone="info">{t("admin.reports.isSystem", "System Template")}</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">{tpl.category}</div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t("admin.reports.templateUsage", "Usage")}: {tpl.usageCount}</span>
                        {!tpl.isSystem && (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm"><Pencil className="size-3" /></Button>
                            <Button variant="ghost" size="sm"><Trash2 className="size-3 text-destructive" /></Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </DashboardCard>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "schedules" && (
          <DashboardCard>
            <div className="space-y-4">
              {schedules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="size-12 text-muted-foreground mb-4 opacity-40" />
                  <p className="text-muted-foreground">{t("admin.reports.noSchedules", "No scheduled reports")}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.reportName", "Name")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.type", "Type")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.format", "Format")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.recipients", "Recipients")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.reportStatus", "Active")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.lastRun", "Last Run")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.nextRun", "Next Run")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedules.map((sched) => (
                        <tr key={sched.id} className="border-b border-border hover:bg-muted/30">
                          <td className="py-3 px-2 font-medium">{sched.name}</td>
                          <td className="py-3 px-2">
                            {sched.scheduleType === "daily" ? t("admin.reports.scheduleDaily") : sched.scheduleType === "weekly" ? t("admin.reports.scheduleWeekly") : t("admin.reports.scheduleMonthly")}
                          </td>
                          <td className="py-3 px-2 uppercase">{sched.format}</td>
                          <td className="py-3 px-2">{sched.recipients}</td>
                          <td className="py-3 px-2">
                            <Badge tone={sched.isActive ? "success" : "muted"}>
                              {sched.isActive ? t("admin.active", "Active") : t("admin.inactive", "Inactive")}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">{formatDate(sched.lastRun)}</td>
                          <td className="py-3 px-2">{formatDate(sched.nextRun)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </DashboardCard>
        )}

        {activeTab === "kpis" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <select
                value={kpiCategoryFilter}
                onChange={(e) => setKpiCategoryFilter(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">{t("common.all")}</option>
                {KPI_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            {filteredKpis.length === 0 ? (
              <DashboardCard>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Target className="size-12 text-muted-foreground mb-4 opacity-40" />
                  <p className="text-muted-foreground">{t("admin.reports.noKpis", "No KPIs configured")}</p>
                </div>
              </DashboardCard>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredKpis.map((kpi) => (
                  <DashboardCard key={kpi.id}>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {categoryIcon(kpi.category)}
                          {kpi.name}
                        </div>
                        {trendIcon(kpi.trend)}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold">{kpi.currentValue}</span>
                        {kpi.unit && <span className="text-sm text-muted-foreground">{kpi.unit}</span>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t("admin.reports.kpiTarget")}: {kpi.targetValue}</span>
                        <span>{kpi.owner}</span>
                      </div>
                    </div>
                  </DashboardCard>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "exports" && (
          <DashboardCard>
            <div className="space-y-4">
              {exports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Download className="size-12 text-muted-foreground mb-4 opacity-40" />
                  <p className="text-muted-foreground">{t("admin.reports.noExports", "No exports yet")}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.reportName", "Name")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.format", "Format")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.reportStatus", "Status")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.date", "Created")}</th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("admin.reports.fileSize", "File Size")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exports.map((exp) => (
                        <tr key={exp.id} className="border-b border-border hover:bg-muted/30">
                          <td className="py-3 px-2 font-medium">{exp.name}</td>
                          <td className="py-3 px-2 uppercase">{exp.format}</td>
                          <td className="py-3 px-2"><Badge tone={statusTone(exp.status)}>{exp.status}</Badge></td>
                          <td className="py-3 px-2">{formatDate(exp.createdAt)}</td>
                          <td className="py-3 px-2">{exp.fileSize || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </DashboardCard>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-heading font-semibold">
                {dialogType === "report" ? t("admin.reports.createReport") : dialogType === "template" ? t("admin.reports.createTemplate") : dialogType === "schedule" ? t("admin.reports.createSchedule") : t("admin.reports.createKpi")}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              {dialogType === "report" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.reportName")}</Label>
                    <Input value={reportForm.name} onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.reportType")}</Label>
                      <select value={reportForm.type} onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        {REPORT_TYPES.map((tp) => (
                          <option key={tp} value={tp}>{reportTypeLabel(tp)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.reportCategory")}</Label>
                      <select value={reportForm.category} onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        {REPORT_TYPES.map((tp) => (
                          <option key={tp} value={tp}>{reportTypeLabel(tp)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {dialogType === "template" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.templateName", "Template Name")}</Label>
                    <Input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.reportCategory")}</Label>
                    <select value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                      {REPORT_TYPES.map((tp) => (
                        <option key={tp} value={tp}>{reportTypeLabel(tp)}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {dialogType === "schedule" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.scheduleName", "Schedule Name")}</Label>
                    <Input value={scheduleForm.name} onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.template", "Template")}</Label>
                      <select value={scheduleForm.templateId} onChange={(e) => setScheduleForm({ ...scheduleForm, templateId: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option value="">{t("common.select")}</option>
                        {templates.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.scheduleType", "Schedule Type")}</Label>
                      <select value={scheduleForm.scheduleType} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduleType: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option value="daily">{t("admin.reports.scheduleDaily")}</option>
                        <option value="weekly">{t("admin.reports.scheduleWeekly")}</option>
                        <option value="monthly">{t("admin.reports.scheduleMonthly")}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.format", "Format")}</Label>
                      <select value={scheduleForm.format} onChange={(e) => setScheduleForm({ ...scheduleForm, format: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option value="csv">CSV</option>
                        <option value="excel">Excel</option>
                        <option value="pdf">PDF</option>
                        <option value="json">JSON</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("common.timezone")}</Label>
                      <select value={scheduleForm.timezone} onChange={(e) => setScheduleForm({ ...scheduleForm, timezone: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        <option value="Asia/Jakarta">Asia/Jakarta</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">America/New_York</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.recipients")}</Label>
                    <Input value={scheduleForm.recipients} onChange={(e) => setScheduleForm({ ...scheduleForm, recipients: e.target.value })} placeholder="email1@example.com, email2@example.com" />
                  </div>
                </>
              )}

              {dialogType === "kpi" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.kpiName", "KPI Name")}</Label>
                    <Input value={kpiForm.name} onChange={(e) => setKpiForm({ ...kpiForm, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.kpiCategory", "Category")}</Label>
                      <select value={kpiForm.category} onChange={(e) => setKpiForm({ ...kpiForm, category: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                        {KPI_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.unit", "Unit")}</Label>
                      <Input value={kpiForm.unit} onChange={(e) => setKpiForm({ ...kpiForm, unit: e.target.value })} placeholder="%, USD, count" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.kpiCurrent", "Current Value")}</Label>
                      <Input type="number" value={kpiForm.currentValue} onChange={(e) => setKpiForm({ ...kpiForm, currentValue: parseFloat(e.target.value) || 0 })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.kpiTarget", "Target Value")}</Label>
                      <Input type="number" value={kpiForm.targetValue} onChange={(e) => setKpiForm({ ...kpiForm, targetValue: parseFloat(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.reports.kpiOwner", "Owner")}</Label>
                    <Input value={kpiForm.owner} onChange={(e) => setKpiForm({ ...kpiForm, owner: e.target.value })} />
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                {editingId ? t("common.update") : t("common.create")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
