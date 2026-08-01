"use client";

import * as React from "react";
import useSWR from "swr";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  BookOpen,
  Layers,
  Tag,
  BarChart3,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  TrendingUp,
  Users,
  Film,
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

type Tab = "genres" | "templates" | "analytics";

const TEMPLATE_STATUS_COLORS: Record<string, string> = {
  active: "success",
  draft: "muted",
  archived: "warning",
};

export function AdminStoryEnginePageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<Tab>("genres");

  const { data: genresData, isLoading: genresLoading, mutate: mutateGenres } = useSWR("/api/admin/story/genres", fetcher);
  const { data: templatesData, isLoading: templatesLoading, mutate: mutateTemplates } = useSWR("/api/admin/story/templates", fetcher);
  const { data: analyticsData, isLoading: analyticsLoading } = useSWR("/api/admin/story/analytics", fetcher);

  const genres = genresData?.data ?? [];
  const templates = templatesData?.data ?? [];
  const analytics = analyticsData?.data ?? {};

  const tabs = [
    { id: "genres" as Tab, label: t("dramaStudio.genre"), icon: Tag },
    { id: "templates" as Tab, label: t("dramaStudio.templates"), icon: Layers },
    { id: "analytics" as Tab, label: t("admin.analytics.label"), icon: BarChart3 },
  ];

  const handleDeleteGenre = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/story/genres/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success"));
        mutateGenres();
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/story/templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success"));
        mutateTemplates();
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const renderGenres = () => (
    <DashboardCard title={t("dramaStudio.genre")}>
      <div className="flex justify-end mb-4">
        <Button size="sm"><Plus className="mr-2 size-4" />{t("dramaStudio.genre")}</Button>
      </div>
      {genresLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : genres.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Tag className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">{t("dramaStudio.noProjects")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("dramaStudio.genre")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.description")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("dramaStudio.projects")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.status")}</th>
                <th className="text-right py-3 px-2 font-medium text-muted-foreground">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {genres.map((genre: any) => (
                <tr key={genre.id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-2 font-medium">{genre.name}</td>
                  <td className="py-3 px-2 text-muted-foreground">{genre.description || "—"}</td>
                  <td className="py-3 px-2">{genre.storyCount ?? 0}</td>
                  <td className="py-3 px-2">
                    <Badge tone={(TEMPLATE_STATUS_COLORS[genre.status] as any) || "muted"}>{genre.status || "active"}</Badge>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon-sm"><Pencil className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteGenre(genre.id)}>
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );

  const renderTemplates = () => (
    <DashboardCard title={t("dramaStudio.templates")}>
      <div className="flex justify-end mb-4">
        <Button size="sm"><Plus className="mr-2 size-4" />{t("dramaStudio.createProject")}</Button>
      </div>
      {templatesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Layers className="size-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">{t("dramaStudio.noProjects")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template: any) => (
            <div key={template.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-xs text-muted-foreground">{template.genre}</p>
                </div>
                <Badge tone={(TEMPLATE_STATUS_COLORS[template.status] as any) || "muted"}>{template.status || "active"}</Badge>
              </div>
              {template.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Button variant="ghost" size="sm"><Pencil className="size-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <BookOpen className="size-4" />
            {t("storyEngine.totalStories")}
          </div>
          <div className="text-2xl font-semibold">{analytics.totalStories ?? 0}</div>
        </DashboardCard>
        <DashboardCard>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Film className="size-4" />
            {t("storyEngine.totalEpisodes")}
          </div>
          <div className="text-2xl font-semibold">{analytics.totalEpisodes ?? 0}</div>
        </DashboardCard>
        <DashboardCard>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Users className="size-4" />
            {t("storyEngine.totalCharacters")}
          </div>
          <div className="text-2xl font-semibold">{analytics.totalCharacters ?? 0}</div>
        </DashboardCard>
        <DashboardCard>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="size-4" />
            {t("storyEngine.totalEvents")}
          </div>
          <div className="text-2xl font-semibold">{analytics.totalEvents ?? 0}</div>
        </DashboardCard>
      </div>

      <DashboardCard title={t("admin.analytics.label")} description={t("storyEngine.description")}>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-3">
            <BarChart3 className="size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{t("admin.analytics.last7Days")}</p>
          </div>
        </div>
      </DashboardCard>
    </div>
  );

  return (
    <PageContainer>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t("storyEngine.title"), href: "/admin/story" },
          ]}
        />
        <PageHeader
          title={t("storyEngine.title")}
          description={t("storyEngine.description")}
        />

        <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "genres" && renderGenres()}
        {activeTab === "templates" && renderTemplates()}
        {activeTab === "analytics" && renderAnalytics()}
      </div>
    </PageContainer>
  );
}
