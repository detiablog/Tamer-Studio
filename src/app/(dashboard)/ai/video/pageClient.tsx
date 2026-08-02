"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  Video, FolderOpen, History, Film, Layers, Image, Sparkles,
  Plus, Heart, Search, Loader2, Zap, Play, Wand2, LayoutGrid,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Stats = {
  totalVideos: number;
  favoriteVideos: number;
  totalProjects: number;
  totalCreditsUsed: number;
};

type VideoGeneration = {
  id: string;
  prompt: string;
  type: string;
  status: string;
  isFavorite: boolean;
  outputUrl?: string;
  creditsUsed: number;
  duration: number;
  createdAt: string;
};

type Project = {
  id: string;
  name: string;
  coverUrl?: string;
  sceneCount: number;
  createdAt: string;
};

type Storyboard = {
  id: string;
  name: string;
  projectId?: string;
  sceneCount: number;
  status: string;
  createdAt: string;
};

type Template = {
  id: string;
  name: string;
  category: string;
  usageCount: number;
};

type Effect = {
  id: string;
  name: string;
  category: string;
  thumbnailUrl?: string;
};

type Transition = {
  id: string;
  name: string;
  category: string;
  thumbnailUrl?: string;
};

export default function VideoStudioPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<"home" | "projects" | "storyboard" | "history" | "templates" | "effects" | "transitions">("home");
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: statsData } = useSWR("/api/video-studio/stats", fetcher);
  const stats: Stats = statsData?.data || { totalVideos: 0, favoriteVideos: 0, totalProjects: 0, totalCreditsUsed: 0 };

  const { data: generationsData, isLoading: loadingGen } = useSWR("/api/video-studio/generations?limit=12", fetcher);
  const generations: VideoGeneration[] = generationsData?.data || [];

  const { data: projectsData, isLoading: loadingProj } = useSWR("/api/video-studio/projects?limit=12", fetcher);
  const projects: Project[] = projectsData?.data || [];

  const { data: storyboardsData, isLoading: loadingSb } = useSWR("/api/video-studio/storyboards?limit=12", fetcher);
  const storyboards: Storyboard[] = storyboardsData?.data || [];

  const { data: templatesData } = useSWR("/api/video-studio/templates", fetcher);
  const templates: Template[] = templatesData?.data || [];

  const { data: effectsData } = useSWR("/api/video-studio/effects", fetcher);
  const effects: Effect[] = effectsData?.data || [];

  const { data: transitionsData } = useSWR("/api/video-studio/transitions", fetcher);
  const transitions: Transition[] = transitionsData?.data || [];

  const tabs = [
    { key: "home" as const, label: t("videoStudio.home"), icon: Sparkles },
    { key: "projects" as const, label: t("videoStudio.projects"), icon: FolderOpen },
    { key: "storyboard" as const, label: t("videoStudio.storyboard"), icon: Layers },
    { key: "history" as const, label: t("videoStudio.history"), icon: History },
    { key: "templates" as const, label: t("videoStudio.templates"), icon: LayoutGrid },
    { key: "effects" as const, label: t("videoStudio.effects"), icon: Wand2 },
    { key: "transitions" as const, label: t("videoStudio.transitions"), icon: Film },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("dashboard.title") }, { label: t("videoStudio.title") }]} />
      <PageHeader title={t("videoStudio.title")} description={t("videoStudio.description")} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("videoStudio.totalVideos"), value: stats.totalVideos, icon: Video },
          { label: t("videoStudio.favoriteVideos"), value: stats.favoriteVideos, icon: Heart },
          { label: t("videoStudio.totalProjects"), value: stats.totalProjects, icon: FolderOpen },
          { label: t("videoStudio.creditsUsed"), value: stats.totalCreditsUsed, icon: Zap },
        ].map((card) => (
          <DashboardCard key={card.label}>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><card.icon className="size-5 text-primary" /></div>
              <div><p className="text-2xl font-bold">{card.value}</p><p className="text-xs text-muted-foreground">{card.label}</p></div>
            </div>
          </DashboardCard>
        ))}
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn("flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
              activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            <tab.icon className="size-4" />{tab.label}
          </button>
        ))}
      </div>

      {activeTab === "home" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="cursor-pointer" onClick={() => window.location.href = "/ai/video/generate"}>
            <DashboardCard>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-3"><Play className="size-6 text-primary" /></div>
                <div>
                  <h3 className="font-heading font-semibold">{t("videoStudio.newProject")}</h3>
                  <p className="text-sm text-muted-foreground">{t("videoStudio.generate")}</p>
                </div>
              </div>
            </DashboardCard>
            </div>
            <div className="cursor-pointer" onClick={() => setActiveTab("history")}>
            <DashboardCard>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-muted p-3"><History className="size-6 text-muted-foreground" /></div>
                <div>
                  <h3 className="font-heading font-semibold">{t("videoStudio.history")}</h3>
                  <p className="text-sm text-muted-foreground">{stats.totalVideos} {t("videoStudio.totalVideos").toLowerCase()}</p>
                </div>
              </div>
            </DashboardCard>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{t("videoStudio.history")}</h3>
            <Button onClick={() => window.location.href = "/ai/video/generate"}>
              <Plus className="mr-2 size-4" />{t("videoStudio.generate")}
            </Button>
          </div>
          {loadingGen ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
          ) : generations.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("videoStudio.noGenerations")}</div></DashboardCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {generations.map((gen) => (
                <DashboardCard key={gen.id}>
                  <div className="aspect-video bg-muted/30 flex items-center justify-center">
                    {gen.outputUrl ? (
                      <Play className="size-8 text-muted-foreground/30" />
                    ) : (
                      <Video className="size-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{gen.prompt}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge tone={gen.status === "completed" ? "default" : "muted"}>{gen.status}</Badge>
                      {gen.isFavorite && <Heart className="size-4 text-red-500 fill-red-500" />}
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="size-4 text-muted-foreground" />
              <Input placeholder={t("videoStudio.projectName")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button><Plus className="mr-2 size-4" />{t("videoStudio.createProject")}</Button>
          </div>
          {loadingProj ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
          ) : projects.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("videoStudio.noProjects")}</div></DashboardCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <DashboardCard key={proj.id}>
                  <div className="aspect-video bg-muted/30 flex items-center justify-center">
                    {proj.coverUrl ? (
                      <Image className="size-8 text-muted-foreground/30" />
                    ) : (
                      <FolderOpen className="size-8 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-heading font-semibold">{proj.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{proj.sceneCount} {t("videoStudio.storyboard").toLowerCase()}</p>
                    <Button size="sm" className="mt-3 w-full" onClick={() => window.location.href = `/ai/video/generate`}>
                      <Plus className="mr-1 size-3" />{t("videoStudio.generate")}
                    </Button>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "storyboard" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{t("videoStudio.storyboard")}</h3>
            <Button><Plus className="mr-2 size-4" />{t("videoStudio.addScene")}</Button>
          </div>
          {loadingSb ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
          ) : storyboards.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("videoStudio.noStoryboards")}</div></DashboardCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storyboards.map((sb) => (
                <div key={sb.id} className="cursor-pointer"
                  onClick={() => window.location.href = `/ai/video/storyboard/${sb.id}`}>
                <DashboardCard>
                  <h3 className="font-heading font-semibold">{sb.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge tone="default">{sb.sceneCount} scenes</Badge>
                    <Badge tone={sb.status === "completed" ? "default" : "muted"}>{sb.status}</Badge>
                  </div>
                </DashboardCard>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 max-w-sm">
            <Search className="size-4 text-muted-foreground" />
            <Input placeholder={t("videoStudio.prompt")} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("videoStudio.prompt")}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("common.status")}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("videoStudio.duration")}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("videoStudio.creditsUsed")}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("common.date")}</th>
              </tr></thead>
              <tbody>{generations.map((gen) => (
                <tr key={gen.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 max-w-[300px] truncate">{gen.prompt}</td>
                  <td className="px-4 py-3"><Badge tone={gen.status === "completed" ? "default" : "muted"}>{gen.status}</Badge></td>
                  <td className="px-4 py-3">{gen.duration}s</td>
                  <td className="px-4 py-3">{gen.creditsUsed}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(gen.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {templates.map((tpl) => (
            <DashboardCard key={tpl.id}>
              <div className="text-2xl mb-2">🎬</div>
              <h3 className="font-medium text-sm">{tpl.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{tpl.category}</p>
              <p className="text-xs text-muted-foreground">{t("videoStudio.creditsUsed")}: {tpl.usageCount}</p>
            </DashboardCard>
          ))}
          {templates.length === 0 && (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("videoStudio.noTemplates")}</div></DashboardCard>
          )}
        </div>
      )}

      {activeTab === "effects" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {effects.map((fx) => (
            <DashboardCard key={fx.id}>
              <div className="text-2xl mb-2">✨</div>
              <h3 className="font-medium text-sm">{fx.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{fx.category}</p>
            </DashboardCard>
          ))}
          {effects.length === 0 && (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("videoStudio.noTemplates")}</div></DashboardCard>
          )}
        </div>
      )}

      {activeTab === "transitions" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {transitions.map((tr) => (
            <DashboardCard key={tr.id}>
              <div className="text-2xl mb-2">🔀</div>
              <h3 className="font-medium text-sm">{tr.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{tr.category}</p>
            </DashboardCard>
          ))}
          {transitions.length === 0 && (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("videoStudio.noTemplates")}</div></DashboardCard>
          )}
        </div>
      )}
    </div>
  );
}
