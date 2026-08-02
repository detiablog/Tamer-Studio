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
  Target,
  TrendingUp,
  Lightbulb,
  FlaskConical,
  FileText,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader,
  ChevronRight,
  Play,
  Settings,
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

type TabKey = "dashboard" | "recommendations" | "experiments" | "reports" | "settings";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "dashboard", icon: Target },
  { key: "recommendations", icon: Lightbulb },
  { key: "experiments", icon: FlaskConical },
  { key: "reports", icon: FileText },
  { key: "settings", icon: Settings },
];

export function OptimizerPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("dashboard");
  const [scoringThreshold, setScoringThreshold] = React.useState("70");
  const [emailNotifications, setEmailNotifications] = React.useState(true);

  const { data: overviewData, isLoading: overviewLoading, mutate: mutateOverview } = useSWR(
    "/api/optimizer/overview",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: recommendationsData, isLoading: recommendationsLoading, mutate: mutateRecommendations } = useSWR(
    "/api/optimizer/recommendations",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: experimentsData, isLoading: experimentsLoading } = useSWR(
    "/api/optimizer/experiments",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: reportsData, isLoading: reportsLoading } = useSWR(
    "/api/optimizer/reports",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const overview = overviewData?.success ? overviewData.data : null;
  const recommendations = recommendationsData?.success ? recommendationsData.data?.recommendations ?? [] : [];
  const experiments = experimentsData?.success ? experimentsData.data?.experiments ?? [] : [];
  const reports = reportsData?.success ? reportsData.data?.reports ?? [] : [];

  const performanceScore = overview?.performanceScore ?? 0;
  const totalRecommendations = overview?.totalRecommendations ?? recommendations.length;
  const activeExperiments = overview?.activeExperiments ?? experiments.filter((e: any) => e.status === "running").length;
  const totalReports = overview?.totalReports ?? reports.length;

  const handleMarkImplemented = async (id: string) => {
    try {
      const res = await fetch(`/api/optimizer/recommendations/${id}/implement`, { method: "POST" });
      if (res.ok) {
        toast.success(t("conversionOptimizer.recommendationImplemented", "Recommendation marked as implemented"));
        mutateRecommendations();
        mutateOverview();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleMarkDismissed = async (id: string) => {
    try {
      const res = await fetch(`/api/optimizer/recommendations/${id}/dismiss`, { method: "POST" });
      if (res.ok) {
        toast.success(t("conversionOptimizer.recommendationDismissed", "Recommendation dismissed"));
        mutateRecommendations();
        mutateOverview();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleSaveSettings = () => {
    toast.success(t("common.success", "Settings saved"));
  };

  const isLoading = overviewLoading || recommendationsLoading || experimentsLoading || reportsLoading;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("conversionOptimizer.title", "AI Conversion Optimizer")}
        description={t("conversionOptimizer.description", "Optimize your content for better performance and conversions")}
      />

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
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
            {t(`conversionOptimizer.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
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
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardCard>
                  <p className="text-xs text-muted-foreground">{t("conversionOptimizer.performanceScore", "Performance Score")}</p>
                  <p className="mt-2 text-2xl font-semibold">{performanceScore}</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted/40">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(performanceScore, 100)}%` }}
                    />
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <p className="text-xs text-muted-foreground">{t("conversionOptimizer.totalRecommendations", "Recommendations")}</p>
                  <p className="mt-2 text-2xl font-semibold">{totalRecommendations}</p>
                </DashboardCard>
                <DashboardCard>
                  <p className="text-xs text-muted-foreground">{t("conversionOptimizer.activeExperiments", "Experiments")}</p>
                  <p className="mt-2 text-2xl font-semibold">{activeExperiments}</p>
                </DashboardCard>
                <DashboardCard>
                  <p className="text-xs text-muted-foreground">{t("conversionOptimizer.totalReports", "Reports")}</p>
                  <p className="mt-2 text-2xl font-semibold">{totalReports}</p>
                </DashboardCard>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard title={t("conversionOptimizer.recommendations", "Recommendations")}>
                  {recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {recommendations.slice(0, 5).map((rec: any) => (
                        <div key={rec.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{rec.title}</span>
                              <Badge tone={rec.priority === "high" ? "warning" : rec.priority === "medium" ? "warning" : "info"}>
                                {t(`conversionOptimizer.${rec.priority}`, rec.priority)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">{rec.problem}</p>
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground ml-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("conversionOptimizer.noRecommendations", "No optimization recommendations yet")}
                    </div>
                  )}
                </DashboardCard>

                <DashboardCard title={t("conversionOptimizer.experiments", "Experiments")}>
                  {experiments.length > 0 ? (
                    <div className="space-y-3">
                      {experiments.slice(0, 5).map((exp: any) => (
                        <div key={exp.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{exp.name}</span>
                              <Badge tone={exp.status === "running" ? "success" : "info"}>
                                {exp.status}
                              </Badge>
                            </div>
                            {exp.winner && (
                              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                {t("conversionOptimizer.winner", "Winner")}: {exp.winner}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground ml-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("conversionOptimizer.noExperiments", "No experiments running")}
                    </div>
                  )}
                </DashboardCard>
              </div>

              <DashboardCard title={t("common.actions", "Quick Actions")}>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("recommendations")}>
                    <Lightbulb className="mr-2 size-4" />
                    {t("conversionOptimizer.recommendations", "Recommendations")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("experiments")}>
                    <FlaskConical className="mr-2 size-4" />
                    {t("conversionOptimizer.createExperiment", "Create Experiment")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("reports")}>
                    <FileText className="mr-2 size-4" />
                    {t("conversionOptimizer.reports", "Reports")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => mutateOverview()}>
                    <RefreshCw className="mr-2 size-4" />
                    {t("common.refresh", "Refresh")}
                  </Button>
                </div>
              </DashboardCard>
            </div>
          )}

          {activeTab === "recommendations" && (
            <div className="space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec: any) => (
                  <DashboardCard key={rec.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{rec.title}</span>
                          <Badge tone={rec.priority === "high" ? "warning" : rec.priority === "medium" ? "warning" : "info"}>
                            {t(`conversionOptimizer.${rec.priority}`, rec.priority)}
                          </Badge>
                          <Badge tone="info">{rec.type}</Badge>
                          <Badge tone={rec.status === "implemented" ? "success" : rec.status === "dismissed" ? "default" : "info"}>
                            {t(`conversionOptimizer.${rec.status}`, rec.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{rec.problem}</p>
                        {rec.expectedBenefit && (
                          <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                            <TrendingUp className="size-3" />
                            {rec.expectedBenefit}
                          </p>
                        )}
                      </div>
                      {rec.status === "new" && (
                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm" onClick={() => handleMarkImplemented(rec.id)}>
                            <CheckCircle2 className="mr-1 size-3" />
                            {t("conversionOptimizer.markImplemented", "Mark Implemented")}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleMarkDismissed(rec.id)}>
                            <XCircle className="mr-1 size-3" />
                            {t("conversionOptimizer.markDismissed", "Dismissed")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </DashboardCard>
                ))
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("conversionOptimizer.noRecommendations", "No optimization recommendations yet")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "experiments" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button size="sm">
                  <FlaskConical className="mr-2 size-4" />
                  {t("conversionOptimizer.createExperiment", "Create Experiment")}
                </Button>
              </div>
              {experiments.length > 0 ? (
                experiments.map((exp: any) => (
                  <DashboardCard key={exp.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{exp.name}</span>
                          <Badge tone={exp.status === "running" ? "success" : exp.status === "completed" ? "info" : "default"}>
                            {exp.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="rounded-lg border border-border bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground mb-1">{t("conversionOptimizer.variantA", "Variant A")}</p>
                            <p className="text-sm font-medium">{exp.variantA}</p>
                            {exp.variantAConversions != null && (
                              <p className="text-xs text-muted-foreground mt-1">{exp.variantAConversions} conversions</p>
                            )}
                          </div>
                          <div className="rounded-lg border border-border bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground mb-1">{t("conversionOptimizer.variantB", "Variant B")}</p>
                            <p className="text-sm font-medium">{exp.variantB}</p>
                            {exp.variantBConversions != null && (
                              <p className="text-xs text-muted-foreground mt-1">{exp.variantBConversions} conversions</p>
                            )}
                          </div>
                        </div>
                        {exp.winner && (
                          <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Play className="size-3 fill-current" />
                            <span className="text-sm font-medium">
                              {t("conversionOptimizer.winner", "Winner")}: {exp.winner}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </DashboardCard>
                ))
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("conversionOptimizer.noExperiments", "No experiments running")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              {reports.length > 0 ? (
                reports.map((report: any) => (
                  <DashboardCard key={report.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{report.title}</span>
                          <Badge tone="info">{report.type}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{report.date} - {report.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <FileText className="mr-2 size-4" />
                        {t("common.view", "View")}
                      </Button>
                    </div>
                  </DashboardCard>
                ))
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("conversionOptimizer.noReports", "No reports generated")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <DashboardCard title={t("conversionOptimizer.settings", "Settings")}>
              <div className="space-y-6 max-w-xl">
                <div>
                  <label className="text-sm font-medium">{t("conversionOptimizer.performanceScore", "Performance Score")} Threshold</label>
                  <Input
                    type="number"
                    value={scoringThreshold}
                    onChange={(e) => setScoringThreshold(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t("settings.notifications", "Email Notifications")}</p>
                    <p className="text-xs text-muted-foreground">{t("conversionOptimizer.description", "Optimize your content for better performance and conversions")}</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      emailNotifications ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block size-4 rounded-full bg-white transition-transform ${
                        emailNotifications ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <Button onClick={handleSaveSettings}>
                  {t("common.save", "Save")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </>
      )}
    </div>
  );
}
