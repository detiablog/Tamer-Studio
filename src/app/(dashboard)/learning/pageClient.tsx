"use client";

import * as React from "react";
const { useState } = React;
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Flag,
  Goal,
  GraduationCap,
  History,
  Lightbulb,
  Loader,
  MessageSquare,
  Pause,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Trash2,
  X,
  Zap,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Star,
  Bell,
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
  | "insights"
  | "preferences"
  | "patterns"
  | "recommendations"
  | "history"
  | "feedback"
  | "goals"
  | "reports"
  | "settings";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "dashboard", icon: Eye },
  { key: "insights", icon: Lightbulb },
  { key: "preferences", icon: Star },
  { key: "patterns", icon: Brain },
  { key: "recommendations", icon: Zap },
  { key: "history", icon: History },
  { key: "feedback", icon: MessageSquare },
  { key: "goals", icon: Target },
  { key: "reports", icon: FileText },
  { key: "settings", icon: Settings },
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
  recentActivity?: LearningEvent[];
};

type LearningEvent = {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
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

type PreferenceItem = {
  id: string;
  key: string;
  value: string;
  source: string;
  confidence: number;
  inferredAt: string;
  overridden?: boolean;
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

type GoalItem = {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  status: string;
  createdAt: string;
};

type FeedbackItem = {
  id: string;
  rating: number;
  comment: string;
  category: string;
  createdAt: string;
};

type ReportItem = {
  id: string;
  title: string;
  type: string;
  generatedAt: string;
  summary: string;
  metrics?: Record<string, number>;
};

type LearningSettings = {
  learningEnabled: boolean;
  learningPaused: boolean;
  privacyMode: boolean;
  anonymousData: boolean;
  shareInsights: boolean;
  retentionDays: number;
  confidenceThreshold: number;
  autoRecommendations: boolean;
};

type HistoryItem = {
  id: string;
  event: string;
  category: string;
  timestamp: string;
  details?: string;
};

export function LearningPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("dashboard");
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  const [showCreateGoal, setShowCreateGoal] = React.useState(false);
  const [editingGoal, setEditingGoal] = React.useState<GoalItem | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<GoalItem>>({
    title: "",
    description: "",
    targetValue: 100,
    currentValue: 0,
    unit: "count",
    status: "active",
  });

  const [feedbackForm, setFeedbackForm] = useState<Partial<FeedbackItem>>({
    rating: 5,
    comment: "",
    category: "general",
  });

  const [settingsDraft, setSettingsDraft] = useState<Partial<LearningSettings>>({});

  const [preferenceOverride, setPreferenceOverride] = useState<string | null>(null);
  const [overrideValue, setOverrideValue] = useState("");

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR("/api/learning/stats", fetcher, { revalidateOnFocus: false });
  const { data: eventsData, isLoading: eventsLoading, mutate: mutateEvents } = useSWR("/api/learning/events", fetcher, { revalidateOnFocus: false });
  const { data: patternsData, isLoading: patternsLoading, mutate: mutatePatterns } = useSWR("/api/learning/patterns", fetcher, { revalidateOnFocus: false });
  const { data: preferencesData, isLoading: preferencesLoading, mutate: mutatePreferences } = useSWR("/api/learning/preferences", fetcher, { revalidateOnFocus: false });
  const { data: recommendationsData, isLoading: recommendationsLoading, mutate: mutateRecommendations } = useSWR("/api/learning/recommendations", fetcher, { revalidateOnFocus: false });
  const { data: historyData, isLoading: historyLoading } = useSWR("/api/learning/history", fetcher, { revalidateOnFocus: false });
  const { data: feedbackData, isLoading: feedbackLoading, mutate: mutateFeedback } = useSWR("/api/learning/feedback", fetcher, { revalidateOnFocus: false });
  const { data: goalsData, isLoading: goalsLoading, mutate: mutateGoals } = useSWR("/api/learning/goals", fetcher, { revalidateOnFocus: false });
  const { data: reportsData, isLoading: reportsLoading, mutate: mutateReports } = useSWR("/api/learning/reports", fetcher, { revalidateOnFocus: false });
  const { data: settingsData, isLoading: settingsLoading, mutate: mutateSettings } = useSWR("/api/learning/settings", fetcher, { revalidateOnFocus: false });

  const stats: StatsData | null = statsData?.data ?? statsData ?? null;
  const eventsList: LearningEvent[] = React.useMemo(() => {
    const raw = eventsData?.data ?? eventsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [eventsData]);
  const patternsList: PatternItem[] = React.useMemo(() => {
    const raw = patternsData?.data ?? patternsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [patternsData]);
  const preferencesList: PreferenceItem[] = React.useMemo(() => {
    const raw = preferencesData?.data ?? preferencesData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [preferencesData]);
  const recommendationsList: RecommendationItem[] = React.useMemo(() => {
    const raw = recommendationsData?.data ?? recommendationsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [recommendationsData]);
  const historyList: HistoryItem[] = React.useMemo(() => {
    const raw = historyData?.data ?? historyData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [historyData]);
  const feedbackList: FeedbackItem[] = React.useMemo(() => {
    const raw = feedbackData?.data ?? feedbackData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [feedbackData]);
  const goalsList: GoalItem[] = React.useMemo(() => {
    const raw = goalsData?.data ?? goalsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [goalsData]);
  const reportsList: ReportItem[] = React.useMemo(() => {
    const raw = reportsData?.data ?? reportsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [reportsData]);
  const settings: LearningSettings = React.useMemo(() => {
    return { ...(settingsData?.data ?? settingsData ?? {}), ...settingsDraft };
  }, [settingsData, settingsDraft]);

  const isLoading = statsLoading;

  const refreshAll = () => {
    mutateStats();
    mutateEvents();
    mutatePatterns();
    mutatePreferences();
    mutateRecommendations();
    mutateFeedback();
    mutateGoals();
    mutateReports();
    mutateSettings();
  };

  const filteredPatterns = React.useMemo(() => {
    let result = patternsList;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p: PatternItem) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") {
      result = result.filter((p: PatternItem) => p.category === categoryFilter);
    }
    return result;
  }, [patternsList, search, categoryFilter]);

  const filteredRecommendations = React.useMemo(() => {
    if (!search) return recommendationsList;
    const q = search.toLowerCase();
    return recommendationsList.filter(
      (r) =>
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [recommendationsList, search]);

  const handleAcceptRecommendation = async (id: string) => {
    try {
      const res = await fetch(`/api/learning/recommendations/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });
      if (res.ok) {
        toast.success(t("learningEngine.recommendationAccepted", "Recommendation accepted"));
        mutateRecommendations();
        mutateStats();
      } else {
        toast.error(t("learningEngine.recommendationAcceptError", "Failed to accept recommendation"));
      }
    } catch {
      toast.error(t("learningEngine.recommendationAcceptError", "Failed to accept recommendation"));
    }
  };

  const handleIgnoreRecommendation = async (id: string) => {
    try {
      const res = await fetch(`/api/learning/recommendations/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ignored" }),
      });
      if (res.ok) {
        toast.success(t("learningEngine.recommendationIgnored", "Recommendation ignored"));
        mutateRecommendations();
      } else {
        toast.error(t("learningEngine.recommendationIgnoreError", "Failed to ignore recommendation"));
      }
    } catch {
      toast.error(t("learningEngine.recommendationIgnoreError", "Failed to ignore recommendation"));
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackForm.comment?.trim()) return;
    try {
      const res = await fetch("/api/learning/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackForm),
      });
      if (res.ok) {
        toast.success(t("learningEngine.feedbackSubmitted", "Feedback submitted"));
        setFeedbackForm({ rating: 5, comment: "", category: "general" });
        mutateFeedback();
        mutateStats();
      } else {
        toast.error(t("learningEngine.feedbackSubmitError", "Failed to submit feedback"));
      }
    } catch {
      toast.error(t("learningEngine.feedbackSubmitError", "Failed to submit feedback"));
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoal.title?.trim()) return;
    try {
      const res = await fetch("/api/learning/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });
      if (res.ok) {
        toast.success(t("learningEngine.goalCreated", "Goal created"));
        setShowCreateGoal(false);
        setNewGoal({ title: "", description: "", targetValue: 100, currentValue: 0, unit: "count", status: "active" });
        mutateGoals();
        mutateStats();
      } else {
        toast.error(t("learningEngine.goalCreateError", "Failed to create goal"));
      }
    } catch {
      toast.error(t("learningEngine.goalCreateError", "Failed to create goal"));
    }
  };

  const handleUpdateGoal = async (id: string, updates: Partial<GoalItem>) => {
    try {
      const res = await fetch(`/api/learning/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        toast.success(t("learningEngine.goalUpdated", "Goal updated"));
        setEditingGoal(null);
        mutateGoals();
      } else {
        toast.error(t("learningEngine.goalUpdateError", "Failed to update goal"));
      }
    } catch {
      toast.error(t("learningEngine.goalUpdateError", "Failed to update goal"));
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const res = await fetch(`/api/learning/goals/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("learningEngine.goalDeleted", "Goal deleted"));
        mutateGoals();
        mutateStats();
      } else {
        toast.error(t("learningEngine.goalDeleteError", "Failed to delete goal"));
      }
    } catch {
      toast.error(t("learningEngine.goalDeleteError", "Failed to delete goal"));
    }
  };

  const handleUpdateGoalProgress = async (id: string, value: number) => {
    try {
      const res = await fetch(`/api/learning/goals/${id}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentValue: value }),
      });
      if (res.ok) {
        toast.success(t("learningEngine.goalProgressUpdated", "Goal progress updated"));
        mutateGoals();
      } else {
        toast.error(t("learningEngine.goalProgressError", "Failed to update goal progress"));
      }
    } catch {
      toast.error(t("learningEngine.goalProgressError", "Failed to update goal progress"));
    }
  };

  const handleDeletePreference = async (id: string) => {
    try {
      const res = await fetch(`/api/learning/preferences/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("learningEngine.preferenceDeleted", "Preference deleted"));
        mutatePreferences();
        mutateStats();
      } else {
        toast.error(t("learningEngine.preferenceDeleteError", "Failed to delete preference"));
      }
    } catch {
      toast.error(t("learningEngine.preferenceDeleteError", "Failed to delete preference"));
    }
  };

  const handleOverridePreference = async (id: string) => {
    try {
      const res = await fetch("/api/learning/preferences/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, value: overrideValue }),
      });
      if (res.ok) {
        toast.success(t("learningEngine.preferenceOverridden", "Preference overridden"));
        setPreferenceOverride(null);
        setOverrideValue("");
        mutatePreferences();
      } else {
        toast.error(t("learningEngine.preferenceOverrideError", "Failed to override preference"));
      }
    } catch {
      toast.error(t("learningEngine.preferenceOverrideError", "Failed to override preference"));
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await fetch("/api/learning/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "summary" }),
      });
      if (res.ok) {
        toast.success(t("learningEngine.reportGenerated", "Report generated"));
        mutateReports();
      } else {
        toast.error(t("learningEngine.reportGenerateError", "Failed to generate report"));
      }
    } catch {
      toast.error(t("learningEngine.reportGenerateError", "Failed to generate report"));
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const res = await fetch(`/api/learning/reports/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("learningEngine.reportDeleted", "Report deleted"));
        mutateReports();
      } else {
        toast.error(t("learningEngine.reportDeleteError", "Failed to delete report"));
      }
    } catch {
      toast.error(t("learningEngine.reportDeleteError", "Failed to delete report"));
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

  const renderConfidenceBar = (confidence: number) => {
    const color =
      confidence >= 0.8
        ? "bg-green-500"
        : confidence >= 0.5
          ? "bg-yellow-500"
          : "bg-red-500";
    return (
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 rounded-full bg-muted/40">
          <div className={`h-2 rounded-full ${color}`} style={{ width: `${confidence * 100}%` }} />
        </div>
        <span className="text-xs text-muted-foreground">{(confidence * 100).toFixed(0)}%</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("learningEngine.title", "Continuous Learning Engine")}
        description={t("learningEngine.description", "Track learning patterns, preferences, and recommendations")}
      />

      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
            {TABS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setSearch(""); setCategoryFilter("all"); }}
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
          <Button variant="outline" size="sm" onClick={refreshAll}>
            <RefreshCw className="mr-2 size-4" />
            {t("common.refresh", "Refresh")}
          </Button>
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
                  {renderStatCard(t("learningEngine.totalEvents", "Total Events"), stats?.totalEvents ?? eventsList.length, Clock)}
                  {renderStatCard(t("learningEngine.totalPatterns", "Patterns"), stats?.totalPatterns ?? patternsList.length, Brain)}
                  {renderStatCard(t("learningEngine.totalPreferences", "Preferences"), stats?.totalPreferences ?? preferencesList.length, Star)}
                  {renderStatCard(t("learningEngine.totalRecommendations", "Recommendations"), stats?.totalRecommendations ?? recommendationsList.length, Zap)}
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {renderStatCard(t("learningEngine.avgConfidence", "Avg Confidence"), `${((stats?.avgConfidence ?? 0) * 100).toFixed(0)}%`, TrendingUp)}
                  {renderStatCard(t("learningEngine.acceptanceRate", "Acceptance Rate"), `${((stats?.acceptanceRate ?? 0) * 100).toFixed(0)}%`, ThumbsUp)}
                  {renderStatCard(t("learningEngine.goalProgress", "Goal Progress"), `${((stats?.goalProgress ?? 0) * 100).toFixed(0)}%`, Target)}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <DashboardCard title={t("learningEngine.recentActivity", "Recent Activity")}>
                    {eventsList.length > 0 ? (
                      <div className="space-y-3">
                        {eventsList.slice(0, 5).map((event) => (
                          <div key={event.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                            <div className="mt-0.5 size-2 rounded-full bg-primary shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{event.description}</p>
                              <p className="text-xs text-muted-foreground">{event.type} - {new Date(event.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("learningEngine.noActivity", "No recent activity")}
                      </div>
                    )}
                  </DashboardCard>

                  <DashboardCard title={t("learningEngine.quickRecommendations", "Quick Recommendations")}>
                    {recommendationsList.filter((r) => r.status === "pending").length > 0 ? (
                      <div className="space-y-3">
                        {recommendationsList
                          .filter((r) => r.status === "pending")
                          .slice(0, 3)
                          .map((rec) => (
                            <div key={rec.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                              <Zap className="mt-0.5 size-4 text-yellow-500 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{rec.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{rec.description}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  {renderConfidenceBar(rec.confidence)}
                                  <Badge tone={rec.priority === "high" ? "warning" : "info"}>{rec.priority}</Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Button variant="ghost" size="icon-sm" onClick={() => handleAcceptRecommendation(rec.id)}>
                                  <CheckCircle className="size-3.5 text-green-500" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" onClick={() => handleIgnoreRecommendation(rec.id)}>
                                  <X className="size-3.5 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("learningEngine.noRecommendations", "No pending recommendations")}
                      </div>
                    )}
                  </DashboardCard>
                </div>
              </div>
            )}

            {activeTab === "insights" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {renderStatCard(t("learningEngine.totalPatterns", "Discovered Patterns"), patternsList.length, Brain)}
                  {renderStatCard(t("learningEngine.avgConfidence", "Avg Confidence"), `${patternsList.length > 0 ? ((patternsList.reduce((sum, p) => sum + p.confidence, 0) / patternsList.length) * 100).toFixed(0) : 0}%`, TrendingUp)}
                    {renderStatCard(t("learningEngine.activePatterns", "Active"), patternsList.filter((p: PatternItem) => p.status === "active").length, Zap)}
                </div>

                {patternsList.filter((p: PatternItem) => p.confidence >= 0.7).length > 0 && (
                  <DashboardCard title={t("learningEngine.highConfidencePatterns", "High Confidence Insights")}>
                    <div className="space-y-3">
                      {patternsList
                        .filter((p: PatternItem) => p.confidence >= 0.7)
                        .sort((a, b) => b.confidence - a.confidence)
                        .map((pattern) => (
                          <div key={pattern.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                            <Brain className="mt-0.5 size-4 text-purple-500 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{pattern.name}</p>
                              <p className="text-xs text-muted-foreground">{pattern.description}</p>
                              <div className="mt-1 flex items-center gap-3">
                                {renderConfidenceBar(pattern.confidence)}
                                <Badge tone="info">{pattern.category}</Badge>
                                <span className="text-xs text-muted-foreground">{pattern.occurrences} {t("learningEngine.occurrences", "occurrences")}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </DashboardCard>
                )}

                <DashboardCard title={t("learningEngine.allInsights", "All Insights")}>
                  {patternsList.length > 0 ? (
                    <div className="space-y-3">
                      {patternsList.map((pattern) => (
                        <div key={pattern.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                          <Brain className="mt-0.5 size-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{pattern.name}</p>
                            <p className="text-xs text-muted-foreground">{pattern.description}</p>
                            <div className="mt-1 flex items-center gap-3">
                              {renderConfidenceBar(pattern.confidence)}
                              <Badge tone={pattern.status === "active" ? "success" : "muted"}>{pattern.status}</Badge>
                              <span className="text-xs text-muted-foreground">{new Date(pattern.discoveredAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("learningEngine.noInsights", "No insights discovered yet")}
                    </div>
                  )}
                </DashboardCard>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {renderStatCard(t("learningEngine.totalPreferences", "Inferred Preferences"), preferencesList.length, Star)}
                  {renderStatCard(t("learningEngine.overriddenPreferences", "Overridden"), preferencesList.filter((p: PreferenceItem) => p.overridden).length, Eye)}
                  {renderStatCard(t("learningEngine.avgConfidence", "Avg Confidence"), `${preferencesList.length > 0 ? ((preferencesList.reduce((sum, p) => sum + p.confidence, 0) / preferencesList.length) * 100).toFixed(0) : 0}%`, TrendingUp)}
                </div>

                <DashboardCard title={t("learningEngine.inferredPreferences", "Inferred Preferences")}>
                  {preferencesList.length > 0 ? (
                    <div className="space-y-2">
                      {preferencesList.map((pref) => (
                        <div key={pref.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Star className="size-4 text-yellow-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{pref.key}</p>
                              <p className="text-xs text-muted-foreground">{pref.value} - {pref.source}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {renderConfidenceBar(pref.confidence)}
                            {pref.overridden && <Badge tone="warning">{t("learningEngine.overridden", "Overridden")}</Badge>}
                            {preferenceOverride === pref.id ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  value={overrideValue}
                                  onChange={(e) => setOverrideValue(e.target.value)}
                                  className="h-7 w-32 text-xs"
                                  placeholder={t("learningEngine.newValue", "New value")}
                                />
                                <Button variant="ghost" size="icon-sm" onClick={() => handleOverridePreference(pref.id)}>
                                  <CheckCircle className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" onClick={() => { setPreferenceOverride(null); setOverrideValue(""); }}>
                                  <X className="size-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => { setPreferenceOverride(pref.id); setOverrideValue(pref.value); }}
                                >
                                  <Eye className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon-sm" onClick={() => handleDeletePreference(pref.id)}>
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("learningEngine.noPreferences", "No preferences inferred yet")}
                    </div>
                  )}
                </DashboardCard>
              </div>
            )}

            {activeTab === "patterns" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", "Search...")} className="pl-9" />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm h-9"
                  >
                    <option value="all">{t("common.all", "All")}</option>
                    <option value="behavior">{t("learningEngine.behavior", "Behavior")}</option>
                    <option value="content">{t("learningEngine.content", "Content")}</option>
                    <option value="workflow">{t("learningEngine.workflow", "Workflow")}</option>
                    <option value="preference">{t("learningEngine.preference", "Preference")}</option>
                    <option value="temporal">{t("learningEngine.temporal", "Temporal")}</option>
                  </select>
                </div>

                {patternsList.length > 0 ? (
                  <div className="space-y-3">
                    {filteredPatterns.map((pattern) => (
                      <div key={pattern.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
                        <Brain className="mt-0.5 size-5 text-purple-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{pattern.name}</p>
                            <Badge tone="info">{pattern.category}</Badge>
                            <Badge tone={pattern.status === "active" ? "success" : "muted"}>{pattern.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{pattern.description}</p>
                          <div className="mt-2 flex items-center gap-4">
                            {renderConfidenceBar(pattern.confidence)}
                            <span className="text-xs text-muted-foreground">{pattern.occurrences} {t("learningEngine.occurrences", "occurrences")}</span>
                            <span className="text-xs text-muted-foreground">{new Date(pattern.discoveredAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredPatterns.length === 0 && (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        {t("learningEngine.noMatchingPatterns", "No matching patterns found")}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <Brain className="mb-3 size-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("learningEngine.noPatterns", "No patterns detected yet")}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "recommendations" && (
              <div className="space-y-4">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", "Search...")} className="pl-9" />
                </div>

                {filteredRecommendations.length > 0 ? (
                  <div className="space-y-3">
                    {filteredRecommendations.map((rec) => (
                      <div key={rec.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
                        <Zap className={`mt-0.5 size-5 shrink-0 ${
                          rec.priority === "high" ? "text-red-500" : rec.priority === "medium" ? "text-yellow-500" : "text-blue-500"
                        }`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{rec.title}</p>
                            <Badge tone={rec.priority === "high" ? "warning" : rec.priority === "medium" ? "info" : "muted"}>{rec.priority}</Badge>
                            <Badge tone={rec.status === "accepted" ? "success" : rec.status === "ignored" ? "default" : "info"}>{rec.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                          {rec.reasoning && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{t("learningEngine.reasoning", "Reasoning")}: {rec.reasoning}</p>
                          )}
                          <div className="mt-2 flex items-center gap-3">
                            {renderConfidenceBar(rec.confidence)}
                            <span className="text-xs text-muted-foreground">{new Date(rec.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {rec.status === "pending" && (
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => handleAcceptRecommendation(rec.id)}>
                              <CheckCircle className="mr-1 size-3.5" />
                              {t("learningEngine.accept", "Accept")}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleIgnoreRecommendation(rec.id)}>
                              <X className="mr-1 size-3.5" />
                              {t("learningEngine.ignore", "Ignore")}
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <Zap className="mb-3 size-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("learningEngine.noRecommendations", "No recommendations available")}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-4">
                {historyList.length > 0 ? (
                  <div className="relative ml-4 border-l-2 border-border pl-6 space-y-6">
                    {historyList.map((item) => (
                      <div key={item.id} className="relative">
                        <div className="absolute -left-[31px] top-1 size-4 rounded-full border-2 border-border bg-background" />
                        <div className="rounded-lg border border-border p-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{item.event}</p>
                            <Badge tone="info">{item.category}</Badge>
                          </div>
                          {item.details && <p className="text-xs text-muted-foreground mt-1">{item.details}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <History className="mb-3 size-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("learningEngine.noHistory", "No learning history yet")}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "feedback" && (
              <div className="space-y-6">
                <DashboardCard title={t("learningEngine.submitFeedback", "Submit Feedback")}>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.rating", "Rating")}</label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setFeedbackForm((p: Partial<FeedbackItem>) => ({ ...p, rating: star }))}
                            className="p-0.5"
                          >
                            <Star
                              className={`size-5 ${
                                star <= (feedbackForm.rating ?? 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.category", "Category")}</label>
                      <select
                        value={feedbackForm.category ?? "general"}
                        onChange={(e) => setFeedbackForm((p: Partial<FeedbackItem>) => ({ ...p, category: e.target.value }))}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm h-9"
                      >
                        <option value="general">{t("learningEngine.general", "General")}</option>
                        <option value="recommendations">{t("learningEngine.recommendations", "Recommendations")}</option>
                        <option value="patterns">{t("learningEngine.patterns", "Patterns")}</option>
                        <option value="preferences">{t("learningEngine.preferences", "Preferences")}</option>
                        <option value="accuracy">{t("learningEngine.accuracy", "Accuracy")}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.comment", "Comment")}</label>
                      <textarea
                        value={feedbackForm.comment ?? ""}
                        onChange={(e) => setFeedbackForm((p: Partial<FeedbackItem>) => ({ ...p, comment: e.target.value }))}
                        rows={3}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
                        placeholder={t("learningEngine.feedbackPlaceholder", "Share your thoughts on the learning system...")}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button size="sm" onClick={handleSubmitFeedback} disabled={!feedbackForm.comment?.trim()}>
                        <Send className="mr-2 size-4" />
                        {t("learningEngine.submit", "Submit")}
                      </Button>
                    </div>
                  </div>
                </DashboardCard>

                <DashboardCard title={t("learningEngine.feedbackHistory", "Feedback History")}>
                  {feedbackList.length > 0 ? (
                    <div className="space-y-3">
                      {feedbackList.map((fb) => (
                        <div key={fb.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`size-3 ${
                                    star <= fb.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <Badge tone="info">{fb.category}</Badge>
                            <span className="text-xs text-muted-foreground">{new Date(fb.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm mt-2">{fb.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("learningEngine.noFeedback", "No feedback submitted yet")}
                    </div>
                  )}
                </DashboardCard>
              </div>
            )}

            {activeTab === "goals" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="grid gap-4 sm:grid-cols-3 flex-1">
                    {renderStatCard(t("learningEngine.totalGoals", "Total Goals"), goalsList.length, Target)}
                    {renderStatCard(t("learningEngine.activeGoals", "Active"), goalsList.filter((g) => g.status === "active").length, Zap)}
                    {renderStatCard(t("learningEngine.completedGoals", "Completed"), goalsList.filter((g) => g.status === "completed").length, CheckCircle)}
                  </div>
                  <Button size="sm" onClick={() => setShowCreateGoal(true)} className="ml-4">
                    <Plus className="mr-2 size-4" />
                    {t("learningEngine.createGoal", "Create Goal")}
                  </Button>
                </div>

                {showCreateGoal && (
                  <DashboardCard title={t("learningEngine.newGoal", "New Goal")}>
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{t("common.title", "Title")}</label>
                           <Input value={newGoal.title ?? ""} onChange={(e) => setNewGoal((p: Partial<GoalItem>) => ({ ...p, title: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{t("common.description", "Description")}</label>
                           <Input value={newGoal.description ?? ""} onChange={(e) => setNewGoal((p: Partial<GoalItem>) => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.targetValue", "Target Value")}</label>
                           <Input type="number" value={newGoal.targetValue ?? 100} onChange={(e) => setNewGoal((p: Partial<GoalItem>) => ({ ...p, targetValue: Number(e.target.value) }))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.unit", "Unit")}</label>
                           <Input value={newGoal.unit ?? ""} onChange={(e) => setNewGoal((p: Partial<GoalItem>) => ({ ...p, unit: e.target.value }))} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.deadline", "Deadline")}</label>
                           <Input type="date" value={newGoal.deadline ?? ""} onChange={(e) => setNewGoal((p: Partial<GoalItem>) => ({ ...p, deadline: e.target.value }))} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowCreateGoal(false)}>
                          {t("common.cancel", "Cancel")}
                        </Button>
                        <Button size="sm" onClick={handleCreateGoal} disabled={!newGoal.title?.trim()}>
                          <Save className="mr-2 size-4" />
                          {t("common.save", "Save")}
                        </Button>
                      </div>
                    </div>
                  </DashboardCard>
                )}

                {goalsList.length > 0 ? (
                  <div className="space-y-3">
                    {goalsList.map((goal) => {
                      const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
                      return (
                        <div key={goal.id} className="rounded-lg border border-border p-4">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium">{goal.title}</p>
                                <Badge tone={goal.status === "completed" ? "success" : goal.status === "active" ? "info" : "muted"}>
                                  {goal.status}
                                </Badge>
                              </div>
                              {goal.description && <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>}
                              <div className="mt-2 flex items-center gap-4">
                                <div className="h-2 w-32 rounded-full bg-muted/40">
                                  <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(progress, 100)}%` }} />
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {goal.currentValue}/{goal.targetValue} {goal.unit} ({progress.toFixed(0)}%)
                                </span>
                                {goal.deadline && (
                                  <span className="text-xs text-muted-foreground">
                                    {t("learningEngine.deadline", "Deadline")}: {new Date(goal.deadline).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Button variant="ghost" size="icon-sm" onClick={() => setEditingGoal(goal)}>
                                <Eye className="size-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteGoal(goal.id)}>
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <Target className="mb-3 size-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("learningEngine.noGoals", "No goals created yet")}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{t("learningEngine.learningReports", "Learning Reports")}</h3>
                  <Button size="sm" onClick={handleGenerateReport}>
                    <FileText className="mr-2 size-4" />
                    {t("learningEngine.generateReport", "Generate Report")}
                  </Button>
                </div>

                {reportsList.length > 0 ? (
                  <div className="space-y-3">
                    {reportsList.map((report) => (
                      <div key={report.id} className="rounded-lg border border-border p-4">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{report.title}</p>
                              <Badge tone="info">{report.type}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{report.summary}</p>
                            {report.metrics && (
                              <div className="mt-2 flex items-center gap-4">
                                {Object.entries(report.metrics).map(([key, value]) => (
                                  <span key={key} className="text-xs text-muted-foreground">
                                    {key}: {typeof value === "number" ? value.toFixed(1) : value}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">{new Date(report.generatedAt).toLocaleString()}</p>
                          </div>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteReport(report.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <FileText className="mb-3 size-10 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("learningEngine.noReports", "No reports generated yet")}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <DashboardCard title={t("learningEngine.learningSettings", "Learning Settings")}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium">{t("learningEngine.learningEnabled", "Learning Enabled")}</p>
                        <p className="text-xs text-muted-foreground">{t("learningEngine.learningEnabledDesc", "Enable or disable the continuous learning engine")}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.learningEnabled ?? true}
                          onChange={(e) => setSettingsDraft((p: Partial<LearningSettings>) => ({ ...p, learningEnabled: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium">{t("learningEngine.learningPaused", "Learning Paused")}</p>
                        <p className="text-xs text-muted-foreground">{t("learningEngine.learningPausedDesc", "Temporarily pause learning without disabling it")}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.learningPaused ?? false}
                          onChange={(e) => setSettingsDraft((p: Partial<LearningSettings>) => ({ ...p, learningPaused: e.target.checked }))}
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
                          onChange={(e) => setSettingsDraft((p: Partial<LearningSettings>) => ({ ...p, privacyMode: e.target.checked }))}
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
                          onChange={(e) => setSettingsDraft((p: Partial<LearningSettings>) => ({ ...p, autoRecommendations: e.target.checked }))}
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
                          onChange={(e) => setSettingsDraft((p: Partial<LearningSettings>) => ({ ...p, confidenceThreshold: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">{t("learningEngine.retentionDays", "Retention Days")}</label>
                        <Input
                          type="number"
                          min="1"
                          value={settings.retentionDays ?? 90}
                          onChange={(e) => setSettingsDraft((p: Partial<LearningSettings>) => ({ ...p, retentionDays: Number(e.target.value) }))}
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
          </>
        )}
      </DashboardCard>
    </div>
  );
}
