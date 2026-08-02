"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader,
  Search,
  Plus,
  Bookmark,
  Bell,
  Zap,
  Hash,
  Key,
  Sparkles,
  Target,
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

type ActiveTab = "dashboard" | "trending" | "keywords" | "hashtags" | "hooks" | "recommendations" | "saved" | "alerts";

const TABS: { id: ActiveTab; key: string; icon: any }[] = [
  { id: "dashboard", key: "trendAnalyzer.dashboard", icon: Target },
  { id: "trending", key: "trendAnalyzer.trending", icon: TrendingUp },
  { id: "keywords", key: "trendAnalyzer.keywords", icon: Key },
  { id: "hashtags", key: "trendAnalyzer.hashtags", icon: Hash },
  { id: "hooks", key: "trendAnalyzer.hooks", icon: Sparkles },
  { id: "recommendations", key: "trendAnalyzer.recommendations", icon: Zap },
  { id: "saved", key: "trendAnalyzer.saved", icon: Bookmark },
  { id: "alerts", key: "trendAnalyzer.alerts", icon: Bell },
];

export function TrendAnalyzerPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("dashboard");
  const [search, setSearch] = React.useState("");
  const [hookType, setHookType] = React.useState("question");

  const {
    data: topicsData,
    isLoading: topicsLoading,
    mutate: mutateTopics,
  } = useSWR("/api/trends/topics", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const {
    data: keywordsData,
    isLoading: keywordsLoading,
  } = useSWR("/api/trends/keywords", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const {
    data: hashtagsData,
    isLoading: hashtagsLoading,
  } = useSWR("/api/trends/hashtags", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const {
    data: recommendationsData,
    isLoading: recommendationsLoading,
  } = useSWR("/api/trends/recommendations", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const {
    data: savedData,
    isLoading: savedLoading,
    mutate: mutateSaved,
  } = useSWR("/api/trends/saved", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const {
    data: alertsData,
    isLoading: alertsLoading,
    mutate: mutateAlerts,
  } = useSWR("/api/trends/alerts", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const topics = topicsData?.success ? topicsData.data?.topics ?? [] : [];
  const keywords = keywordsData?.success ? keywordsData.data?.keywords ?? [] : [];
  const hashtags = hashtagsData?.success ? hashtagsData.data?.hashtags ?? [] : [];
  const recommendations = recommendationsData?.success ? recommendationsData.data?.recommendations ?? [] : [];
  const saved = savedData?.success ? savedData.data?.saved ?? [] : [];
  const alerts = alertsData?.success ? alertsData.data?.alerts ?? [] : [];

  const totalTopics = topics.length;
  const totalKeywords = keywords.length;
  const totalHashtags = hashtags.length;
  const totalRecommendations = recommendations.length;

  const filteredTopics = React.useMemo(
    () => topics.filter((topic: any) => topic.title?.toLowerCase().includes(search.toLowerCase())),
    [topics, search]
  );

  const filteredKeywords = React.useMemo(
    () => keywords.filter((kw: any) => kw.keyword?.toLowerCase().includes(search.toLowerCase())),
    [keywords, search]
  );

  const filteredHashtags = React.useMemo(
    () => hashtags.filter((ht: any) => ht.tag?.toLowerCase().includes(search.toLowerCase())),
    [hashtags, search]
  );

  const handleGenerateHooks = async () => {
    try {
      const res = await fetch("/api/trends/hooks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: hookType }),
      });
      if (res.ok) {
        toast.success("Hooks generated successfully");
      }
    } catch {
      toast.error("Failed to generate hooks");
    }
  };

  const handleToggleSave = async (topicId: string) => {
    try {
      const res = await fetch("/api/trends/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });
      if (res.ok) {
        mutateSaved();
        toast.success("Trend saved");
      }
    } catch {
      toast.error("Failed to save trend");
    }
  };

  const handleToggleAlert = async (alertId: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/trends/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        mutateAlerts();
      }
    } catch {
      toast.error("Failed to update alert");
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard>
          <p className="text-xs text-muted-foreground">{t("trendAnalyzer.totalTopics", "Topics")}</p>
          <p className="mt-2 text-2xl font-semibold">{totalTopics}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-xs text-muted-foreground">{t("trendAnalyzer.totalKeywords", "Keywords")}</p>
          <p className="mt-2 text-2xl font-semibold">{totalKeywords}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-xs text-muted-foreground">{t("trendAnalyzer.totalHashtags", "Hashtags")}</p>
          <p className="mt-2 text-2xl font-semibold">{totalHashtags}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-xs text-muted-foreground">{t("trendAnalyzer.totalRecommendations", "Recommendations")}</p>
          <p className="mt-2 text-2xl font-semibold">{totalRecommendations}</p>
        </DashboardCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard title={t("trendAnalyzer.trending", "Trending")}>
          {topics.length > 0 ? (
            <div className="space-y-3">
              {topics.slice(0, 5).map((topic: any) => (
                <div key={topic.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{topic.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge tone="info">{topic.category}</Badge>
                      <span className="text-xs text-muted-foreground">{topic.score}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {topic.velocity > 0 ? <TrendingUp className="size-3 text-green-500" /> : <TrendingDown className="size-3 text-red-500" />}
                    {Math.abs(topic.velocity)}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              {t("trendAnalyzer.noTopics", "No trending topics found")}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title={t("trendAnalyzer.recommendations", "Recommendations")}>
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((rec: any) => (
                <div key={rec.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{rec.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge tone="info">{rec.type}</Badge>
                      <Badge tone="success">{rec.platform}</Badge>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{rec.score}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              {t("trendAnalyzer.noRecommendations", "No recommendations yet")}
            </div>
          )}
        </DashboardCard>
      </div>

      <DashboardCard title={t("trendAnalyzer.keywords", "Keywords")}>
        {keywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {keywords.slice(0, 20).map((kw: any) => (
              <Badge key={kw.id} tone="default">
                {kw.keyword}
                <span className="ml-1 text-xs text-muted-foreground">({kw.popularity})</span>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            {t("trendAnalyzer.noKeywords", "No keywords tracked")}
          </div>
        )}
      </DashboardCard>
    </div>
  );

  const renderTrending = () => (
    <DashboardCard>
      <div className="flex items-center gap-2 pb-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search", "Search") + "..."}
            className="pl-9"
          />
        </div>
        <Button size="sm" onClick={() => mutateTopics()}>
          <RefreshCw className="mr-2 size-4" />
          {t("common.refresh", "Refresh")}
        </Button>
      </div>

      {topicsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTopics.length > 0 ? (
        <div className="space-y-3">
          {filteredTopics.map((topic: any) => (
            <div key={topic.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex-1">
                <p className="font-medium text-sm">{topic.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge tone="info">{topic.category}</Badge>
                  {(topic.platforms ?? []).map((p: string) => (
                    <Badge key={p} tone="default">{p}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("trendAnalyzer.topicScore", "Score")}</p>
                  <p className="font-semibold text-sm">{topic.score}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("trendAnalyzer.topicVelocity", "Velocity")}</p>
                  <p className={`text-sm font-semibold flex items-center gap-1 ${topic.velocity > 0 ? "text-green-500" : "text-red-500"}`}>
                    {topic.velocity > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {Math.abs(topic.velocity)}%
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleToggleSave(topic.id)}>
                  <Bookmark className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          {t("trendAnalyzer.noTopics", "No trending topics found")}
        </div>
      )}
    </DashboardCard>
  );

  const renderKeywords = () => (
    <DashboardCard>
      <div className="flex items-center gap-2 pb-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search", "Search") + "..."}
            className="pl-9"
          />
        </div>
      </div>

      {keywordsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : filteredKeywords.length > 0 ? (
        <div className="space-y-3">
          {filteredKeywords.map((kw: any) => (
            <div key={kw.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex-1">
                <p className="font-medium text-sm">{kw.keyword}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge tone="info">{kw.competition}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("trendAnalyzer.keywordPopularity", "Popularity")}</p>
                  <p className="font-semibold text-sm">{kw.popularity}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("trendAnalyzer.keywordGrowth", "Growth")}</p>
                  <p className={`text-sm font-semibold flex items-center gap-1 ${kw.growth > 0 ? "text-green-500" : "text-red-500"}`}>
                    {kw.growth > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {Math.abs(kw.growth)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("trendAnalyzer.keywordCompetition", "Competition")}</p>
                  <Badge tone={kw.competition === "high" ? "warning" : kw.competition === "medium" ? "warning" : "success"}>
                    {kw.competition}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          {t("trendAnalyzer.noKeywords", "No keywords tracked")}
        </div>
      )}
    </DashboardCard>
  );

  const renderHashtags = () => (
    <DashboardCard>
      <div className="flex items-center gap-2 pb-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.search", "Search") + "..."}
            className="pl-9"
          />
        </div>
      </div>

      {hashtagsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : filteredHashtags.length > 0 ? (
        <div className="space-y-3">
          {filteredHashtags.map((ht: any) => (
            <div key={ht.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex-1">
                <p className="font-medium text-sm">#{ht.tag}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge tone="info">{ht.confidence}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("trendAnalyzer.hashtagPostCount", "Posts")}</p>
                  <p className="font-semibold text-sm">{ht.postCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("trendAnalyzer.keywordGrowth", "Growth")}</p>
                  <p className={`text-sm font-semibold flex items-center gap-1 ${ht.growth > 0 ? "text-green-500" : "text-red-500"}`}>
                    {ht.growth > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {Math.abs(ht.growth)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{t("trendAnalyzer.hashtagConfidence", "Confidence")}</p>
                  <p className="text-sm font-semibold">{ht.confidence}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          {t("trendAnalyzer.noHashtags", "No hashtags tracked")}
        </div>
      )}
    </DashboardCard>
  );

  const renderHooks = () => (
    <DashboardCard title={t("trendAnalyzer.generateHooks", "Generate Hooks")}>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1 block">{t("trendAnalyzer.hookType", "Hook Type")}</label>
          <select
            value={hookType}
            onChange={(e) => setHookType(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="question">Question</option>
            <option value="statement">Statement</option>
            <option value="howto">How-To</option>
            <option value="list">List</option>
            <option value="controversy">Controversy</option>
          </select>
        </div>
        <Button onClick={handleGenerateHooks} className="mt-6">
          <Sparkles className="mr-2 size-4" />
          {t("trendAnalyzer.generateHooks", "Generate Hooks")}
        </Button>
      </div>
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        {t("trendAnalyzer.noTopics", "No trending topics found")}
      </div>
    </DashboardCard>
  );

  const renderRecommendations = () => (
    <DashboardCard>
      {recommendationsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-3">
          {recommendations.map((rec: any) => (
            <div key={rec.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex-1">
                <p className="font-medium text-sm">{rec.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge tone="info">{rec.type}</Badge>
                  <Badge tone="success">{rec.platform}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
              </div>
              <span className="text-lg font-semibold ml-4">{rec.score}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          {t("trendAnalyzer.noRecommendations", "No recommendations yet")}
        </div>
      )}
    </DashboardCard>
  );

  const renderSaved = () => (
    <DashboardCard>
      {savedLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : saved.length > 0 ? (
        <div className="space-y-3">
          {saved.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge tone="info">{item.category}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleToggleSave(item.id)}>
                <Bookmark className="size-4 fill-current" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          {t("trendAnalyzer.noSaved", "No saved trends")}
        </div>
      )}
    </DashboardCard>
  );

  const renderAlerts = () => (
    <DashboardCard>
      {alertsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((alert: any) => (
            <div key={alert.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex-1">
                <p className="font-medium text-sm">{alert.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.condition}</p>
              </div>
              <button
                onClick={() => handleToggleAlert(alert.id, !alert.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  alert.enabled ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                    alert.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
          {t("trendAnalyzer.noAlerts", "No alerts configured")}
        </div>
      )}
    </DashboardCard>
  );

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("trendAnalyzer.title", "AI Trend Analyzer") }]} />
      <PageHeader
        title={t("trendAnalyzer.title", "AI Trend Analyzer")}
        description={t("trendAnalyzer.description", "Discover trending content opportunities")}
      />

      <div className="flex items-center gap-1 overflow-x-auto border-b border-border">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="size-4" />
              {t(tab.key, tab.id)}
            </button>
          );
        })}
      </div>

      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "trending" && renderTrending()}
      {activeTab === "keywords" && renderKeywords()}
      {activeTab === "hashtags" && renderHashtags()}
      {activeTab === "hooks" && renderHooks()}
      {activeTab === "recommendations" && renderRecommendations()}
      {activeTab === "saved" && renderSaved()}
      {activeTab === "alerts" && renderAlerts()}
    </div>
  );
}
