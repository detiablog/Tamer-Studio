"use client";

import * as React from "react";
import useSWR from "swr";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Film,
  Plus,
  Clapperboard,
  Users,
  CreditCard,
  Loader2,
  ExternalLink,
  Clock,
  Sparkles,
  BookOpen,
  MapPin,
  Layers,
  LayoutGrid,
  Mic,
  Image,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Tab = "dashboard" | "projects" | "characters" | "episodes" | "templates" | "history";

const PROJECT_STATUS_COLORS: Record<string, string> = {
  active: "success",
  draft: "muted",
  completed: "info",
  archived: "warning",
};

const EPISODE_STATUS_COLORS: Record<string, string> = {
  published: "success",
  draft: "muted",
  in_progress: "warning",
  scheduled: "info",
};

export function DramaStudioPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<Tab>("dashboard");

  const { data: statsData, isLoading: statsLoading } = useSWR("/api/drama/stats", fetcher);
  const { data: projectsData, isLoading: projectsLoading } = useSWR("/api/drama/projects", fetcher);
  const { data: charactersData, isLoading: charactersLoading } = useSWR("/api/drama/characters", fetcher);
  const { data: episodesData, isLoading: episodesLoading } = useSWR("/api/drama/episodes", fetcher);
  const { data: templatesData, isLoading: templatesLoading } = useSWR("/api/drama/templates", fetcher);
  const { data: historyData, isLoading: historyLoading } = useSWR("/api/drama/history", fetcher);

  const stats = statsData?.data ?? {};
  const projects = projectsData?.data ?? [];
  const characters = charactersData?.data ?? [];
  const episodes = episodesData?.data ?? [];
  const templates = templatesData?.data ?? [];
  const historyJobs = historyData?.data ?? [];

  const tabs = [
    { id: "dashboard" as Tab, label: t("dramaStudio.dashboard"), icon: LayoutGrid },
    { id: "projects" as Tab, label: t("dramaStudio.projects"), icon: Film },
    { id: "characters" as Tab, label: t("dramaStudio.characters"), icon: Users },
    { id: "episodes" as Tab, label: t("dramaStudio.episodes"), icon: Clapperboard },
    { id: "templates" as Tab, label: t("dramaStudio.templates"), icon: Layers },
    { id: "history" as Tab, label: t("dramaStudio.history"), icon: Clock },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("dramaStudio.totalProjects")} value={stats.totalProjects ?? 0} />
        <StatCard title={t("dramaStudio.totalEpisodes")} value={stats.totalEpisodes ?? 0} />
        <StatCard title={t("dramaStudio.totalCharacters")} value={stats.totalCharacters ?? 0} />
        <StatCard title={t("dramaStudio.creditsUsed")} value={stats.creditsUsed ?? 0} />
      </div>

      <DashboardCard title={t("dramaStudio.dashboard")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/drama/project/new">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/20 p-6 hover:bg-muted/40 transition-colors cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Plus className="size-6 text-primary" />
              </div>
              <span className="font-medium">{t("dramaStudio.createProject")}</span>
            </div>
          </Link>
          <button
            onClick={() => toast.info(t("dramaStudio.generateStory"))}
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/20 p-6 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="size-6 text-primary" />
            </div>
            <span className="font-medium">{t("dramaStudio.generateStory")}</span>
          </button>
          <Link href="/drama/project/new">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/20 p-6 hover:bg-muted/40 transition-colors cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="size-6 text-primary" />
              </div>
              <span className="font-medium">{t("dramaStudio.templates")}</span>
            </div>
          </Link>
        </div>
      </DashboardCard>

      <DashboardCard title={t("dramaStudio.projects")}>
        {projectsLoading ? (
          <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Film className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{t("dramaStudio.noProjects")}</p>
            <Link href="/drama/project/new">
              <Button size="sm"><Plus className="mr-2 size-4" />{t("dramaStudio.createProject")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 5).map((project: any) => (
              <div key={project.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <Film className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-xs text-muted-foreground">{project.genre} · {project.episodeCount ?? 0} {t("dramaStudio.episodes")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={(PROJECT_STATUS_COLORS[project.status] as any) || "muted"}>{project.status}</Badge>
                  <Link href={`/drama/project/${project.id}`}>
                    <Button variant="ghost" size="icon-sm"><ExternalLink className="size-3.5" /></Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      <DashboardCard title={t("dramaStudio.episodes")}>
        {episodesLoading ? (
          <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : episodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clapperboard className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">{t("dramaStudio.noEpisodes")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {episodes.slice(0, 5).map((episode: any) => (
              <div key={episode.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <Clapperboard className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{episode.title}</p>
                    <p className="text-xs text-muted-foreground">{t("dramaStudio.season")} {episode.season} · {t("dramaStudio.episodeNumber")} {episode.number}</p>
                  </div>
                </div>
                <Badge tone={(EPISODE_STATUS_COLORS[episode.status] as any) || "muted"}>{episode.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );

  const renderProjects = () => (
    <DashboardCard title={t("dramaStudio.projects")}>
      {projectsLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Film className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">{t("dramaStudio.noProjects")}</p>
          <Link href="/drama/project/new">
            <Button size="sm"><Plus className="mr-2 size-4" />{t("dramaStudio.createProject")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <div key={project.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.genre}</p>
                </div>
                <Badge tone={(PROJECT_STATUS_COLORS[project.status] as any) || "muted"}>{project.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
              <div className="flex items-center gap-2 pt-1">
                <Link href={`/drama/project/${project.id}`}>
                  <Button variant="outline" size="sm">{t("common.view")}</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderCharacters = () => (
    <DashboardCard title={t("dramaStudio.characters")}>
      {charactersLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : characters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("dramaStudio.noCharacters")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {characters.map((character: any) => (
            <div key={character.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {character.avatar ? (
                    <img src={character.avatar} alt={character.name} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    character.name?.charAt(0) ?? "?"
                  )}
                </div>
                <div>
                  <p className="font-medium">{character.name}</p>
                  <p className="text-xs text-muted-foreground">{character.role}</p>
                </div>
              </div>
              {character.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{character.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderEpisodes = () => (
    <DashboardCard title={t("dramaStudio.episodes")}>
      {episodesLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : episodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clapperboard className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("dramaStudio.noEpisodes")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((episode: any) => (
            <div key={episode.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <Clapperboard className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{episode.title}</p>
                  <p className="text-xs text-muted-foreground">{t("dramaStudio.season")} {episode.season} · {t("dramaStudio.episodeNumber")} {episode.number}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={(EPISODE_STATUS_COLORS[episode.status] as any) || "muted"}>{episode.status}</Badge>
                {episode.projectId && (
                  <Link href={`/drama/project/${episode.projectId}`}>
                    <Button variant="ghost" size="icon-sm"><ExternalLink className="size-3.5" /></Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderTemplates = () => (
    <DashboardCard title={t("dramaStudio.templates")}>
      {templatesLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Layers className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("dramaStudio.noProjects")}</p>
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
                <Badge tone={(PROJECT_STATUS_COLORS[template.status] as any) || "muted"}>{template.status || "active"}</Badge>
              </div>
              {template.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderHistory = () => (
    <DashboardCard title={t("dramaStudio.history")}>
      {historyLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : historyJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("dramaStudio.noProjects")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("dramaStudio.projects")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.type", "Type")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.status")}</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">{t("common.date")}</th>
              </tr>
            </thead>
            <tbody>
              {historyJobs.map((job: any) => (
                <tr key={job.id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-2 font-medium">{job.name || "—"}</td>
                  <td className="py-3 px-2">{job.type || "—"}</td>
                  <td className="py-3 px-2">
                    <Badge tone={(PROJECT_STATUS_COLORS[job.status] as any) || "muted"}>{job.status}</Badge>
                  </td>
                  <td className="py-3 px-2 text-muted-foreground">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dramaStudio.title")}
        description={t("dramaStudio.description")}
        actions={
          <Link href="/drama/project/new">
            <Button><Plus className="mr-2 size-4" />{t("dramaStudio.newStory")}</Button>
          </Link>
        }
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

      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "projects" && renderProjects()}
      {activeTab === "characters" && renderCharacters()}
      {activeTab === "episodes" && renderEpisodes()}
      {activeTab === "templates" && renderTemplates()}
      {activeTab === "history" && renderHistory()}
    </div>
  );
}
