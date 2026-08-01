"use client";

import * as React from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  Film,
  Clapperboard,
  Users,
  MapPin,
  Globe,
  Layers,
  Image,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Tab = "episodes" | "characters" | "locations" | "universe" | "storyboard" | "assets";

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

export function DramaProjectDetailPageClient() {
  const { t } = useLocalizationContext();
  const params = useParams();
  const projectId = params.id as string;

  const [activeTab, setActiveTab] = React.useState<Tab>("episodes");

  const { data: projectData, isLoading: projectLoading } = useSWR(`/api/drama/projects/${projectId}`, fetcher);
  const { data: episodesData, isLoading: episodesLoading } = useSWR(`/api/drama/projects/${projectId}/episodes`, fetcher);
  const { data: charactersData, isLoading: charactersLoading } = useSWR(`/api/drama/projects/${projectId}/characters`, fetcher);
  const { data: locationsData, isLoading: locationsLoading } = useSWR(`/api/drama/projects/${projectId}/locations`, fetcher);
  const { data: universeData, isLoading: universeLoading } = useSWR(`/api/drama/projects/${projectId}/universe`, fetcher);
  const { data: storyboardData, isLoading: storyboardLoading } = useSWR(`/api/drama/projects/${projectId}/storyboard`, fetcher);
  const { data: assetsData, isLoading: assetsLoading } = useSWR(`/api/drama/projects/${projectId}/assets`, fetcher);

  const project = projectData?.data ?? {};
  const episodes = episodesData?.data ?? [];
  const characters = charactersData?.data ?? [];
  const locations = locationsData?.data ?? [];
  const universe = universeData?.data ?? {};
  const storyboards = storyboardData?.data ?? [];
  const assets = assetsData?.data ?? [];

  const tabs = [
    { id: "episodes" as Tab, label: t("dramaStudio.episodes"), icon: Clapperboard },
    { id: "characters" as Tab, label: t("dramaStudio.characters"), icon: Users },
    { id: "locations" as Tab, label: t("dramaStudio.locations"), icon: MapPin },
    { id: "universe" as Tab, label: t("dramaStudio.universes"), icon: Globe },
    { id: "storyboard" as Tab, label: t("dramaStudio.storyboards"), icon: Layers },
    { id: "assets" as Tab, label: t("dramaStudio.assets"), icon: Image },
  ];

  const handleDeleteEpisode = async (episodeId: string) => {
    try {
      const res = await fetch(`/api/drama/episodes/${episodeId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success"));
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const renderEpisodes = () => (
    <DashboardCard title={t("dramaStudio.episodes")}>
      <div className="flex justify-end mb-4">
        <Button size="sm"><Plus className="mr-2 size-4" />{t("dramaStudio.episodes")}</Button>
      </div>
      {episodesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
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
                <Button variant="ghost" size="icon-sm"><Pencil className="size-3.5" /></Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteEpisode(episode.id)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderCharacters = () => (
    <DashboardCard title={t("dramaStudio.characters")}>
      <div className="flex justify-end mb-4">
        <Button size="sm"><Plus className="mr-2 size-4" />{t("dramaStudio.characters")}</Button>
      </div>
      {charactersLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
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
                  <Badge tone="info">{character.role}</Badge>
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

  const renderLocations = () => (
    <DashboardCard title={t("dramaStudio.locations")}>
      <div className="flex justify-end mb-4">
        <Button size="sm"><Plus className="mr-2 size-4" />{t("dramaStudio.locations")}</Button>
      </div>
      {locationsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("dramaStudio.noProjects")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location: any) => (
            <div key={location.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{location.name}</p>
                  <p className="text-xs text-muted-foreground">{location.type}</p>
                </div>
              </div>
              {location.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{location.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderUniverse = () => (
    <DashboardCard title={t("dramaStudio.universes")}>
      {universeLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !universe.name ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Globe className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("dramaStudio.noProjects")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
            <p className="font-medium">{universe.name}</p>
            {universe.description && <p className="text-sm text-muted-foreground">{universe.description}</p>}
            {universe.era && <p className="text-xs text-muted-foreground">{universe.era}</p>}
          </div>
        </div>
      )}
    </DashboardCard>
  );

  const renderStoryboard = () => (
    <DashboardCard title={t("dramaStudio.storyboards")}>
      {storyboardLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : storyboards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Layers className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("dramaStudio.noProjects")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {storyboards.map((sb: any) => (
            <div key={sb.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Layers className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{sb.name || sb.title}</p>
                  <p className="text-xs text-muted-foreground">{sb.sceneCount ?? 0} {t("dramaStudio.scenes")}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderAssets = () => (
    <DashboardCard title={t("dramaStudio.assets")}>
      {assetsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Image className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("dramaStudio.noProjects")}</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset: any) => (
            <div key={asset.id} className="rounded-xl border border-border bg-muted/20 overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                {asset.url ? (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                ) : (
                  <Image className="size-8 text-muted-foreground/50" />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">{asset.name || "Asset"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/drama">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="size-4" /></Button>
        </Link>
        <PageHeader
          title={project.name || t("dramaStudio.projects")}
          description={project.description || project.genre}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {project.genre && <Badge tone="info">{project.genre}</Badge>}
        {project.status && <Badge tone={(PROJECT_STATUS_COLORS[project.status] as any) || "muted"}>{project.status}</Badge>}
      </div>

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

      {activeTab === "episodes" && renderEpisodes()}
      {activeTab === "characters" && renderCharacters()}
      {activeTab === "locations" && renderLocations()}
      {activeTab === "universe" && renderUniverse()}
      {activeTab === "storyboard" && renderStoryboard()}
      {activeTab === "assets" && renderAssets()}
    </div>
  );
}
