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
  BookOpen,
  Users,
  MapPin,
  Globe,
  Clock,
  Film,
  Shield,
  Settings,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  ArrowLeft,
  Heart,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Tab = "bible" | "characters" | "relationships" | "locations" | "timeline" | "episodes" | "rules" | "settings";

const STORY_STATUS_COLORS: Record<string, string> = {
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

const RELATIONSHIP_TYPE_COLORS: Record<string, string> = {
  ally: "success",
  enemy: "warning",
  family: "info",
  romantic: "purple",
  mentor: "info",
  default: "muted",
};

export function StoryDetailPageClient() {
  const { t } = useLocalizationContext();
  const params = useParams();
  const storyId = params.id as string;

  const [activeTab, setActiveTab] = React.useState<Tab>("bible");

  const { data: storyData, isLoading: storyLoading } = useSWR(`/api/stories/${storyId}`, fetcher);
  const { data: charactersData, isLoading: charactersLoading } = useSWR(`/api/stories/${storyId}/characters`, fetcher);
  const { data: relationshipsData, isLoading: relationshipsLoading } = useSWR(`/api/stories/${storyId}/relationships`, fetcher);
  const { data: locationsData, isLoading: locationsLoading } = useSWR(`/api/stories/${storyId}/locations`, fetcher);
  const { data: timelineData, isLoading: timelineLoading } = useSWR(`/api/stories/${storyId}/timeline`, fetcher);
  const { data: episodesData, isLoading: episodesLoading } = useSWR(`/api/stories/${storyId}/episodes`, fetcher);
  const { data: rulesData, isLoading: rulesLoading } = useSWR(`/api/stories/${storyId}/rules`, fetcher);

  const story = storyData?.data ?? {};
  const characters = charactersData?.data ?? [];
  const relationships = relationshipsData?.data ?? [];
  const locations = locationsData?.data ?? [];
  const timeline = timelineData?.data ?? [];
  const episodes = episodesData?.data ?? [];
  const rules = rulesData?.data ?? [];

  const tabs = [
    { id: "bible" as Tab, label: t("storyEngine.bible"), icon: BookOpen },
    { id: "characters" as Tab, label: t("storyEngine.characters"), icon: Users },
    { id: "relationships" as Tab, label: t("storyEngine.relationships"), icon: Heart },
    { id: "locations" as Tab, label: t("storyEngine.locations"), icon: MapPin },
    { id: "timeline" as Tab, label: t("storyEngine.timeline"), icon: Clock },
    { id: "episodes" as Tab, label: t("storyEngine.episodes"), icon: Film },
    { id: "rules" as Tab, label: t("storyEngine.rules"), icon: Shield },
    { id: "settings" as Tab, label: t("common.settings"), icon: Settings },
  ];

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      const res = await fetch(`/api/stories/characters/${characterId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success"));
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    try {
      const res = await fetch(`/api/stories/episodes/${episodeId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success"));
      }
    } catch {
      toast.error(t("common.error"));
    }
  };

  const renderBible = () => (
    <div className="space-y-6">
      <DashboardCard title={t("storyEngine.bible")}>
        {storyLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("storyEngine.storyTitle")}</label>
                <Input defaultValue={story.title} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">{t("storyEngine.storyGenre")}</label>
                <Input defaultValue={story.genre} className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("storyEngine.storyTheme")}</label>
              <Input defaultValue={story.theme} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("storyEngine.storySynopsis")}</label>
              <textarea
                className="mt-1 flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={story.synopsis}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">{t("storyEngine.storyTone")}</label>
              <Input defaultValue={story.tone} className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm">{t("common.save")}</Button>
            </div>
          </div>
        )}
      </DashboardCard>

      <DashboardCard title={t("storyEngine.rules")}>
        {rulesLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : rules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t("storyEngine.noRules")}</p>
        ) : (
          <div className="space-y-2">
            {rules.map((rule: any) => (
              <div key={rule.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-sm">{rule.text || rule.title}</p>
                <Badge tone={rule.enabled ? "success" : "muted"}>{rule.enabled ? "Active" : "Inactive"}</Badge>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );

  const renderCharacters = () => (
    <DashboardCard title={t("storyEngine.characters")}>
      <div className="flex justify-end mb-4">
        <Button size="sm"><Plus className="mr-2 size-4" />{t("storyEngine.characters")}</Button>
      </div>
      {charactersLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : characters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("storyEngine.noCharacters")}</p>
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
              <div className="flex items-center gap-2 pt-1">
                <Button variant="ghost" size="sm"><Pencil className="size-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteCharacter(character.id)}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderRelationships = () => (
    <DashboardCard title={t("storyEngine.relationships")}>
      {relationshipsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : relationships.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Heart className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("storyEngine.noCharacters")}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relationships.map((rel: any) => (
            <div key={rel.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{rel.character1Name}</span>
                  <span className="text-muted-foreground text-xs">↔</span>
                  <span className="font-medium">{rel.character2Name}</span>
                </div>
              </div>
              <Badge tone={(RELATIONSHIP_TYPE_COLORS[rel.type] as any) || "muted"}>{rel.type}</Badge>
              {rel.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{rel.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderLocations = () => (
    <DashboardCard title={t("storyEngine.locations")}>
      <div className="flex justify-end mb-4">
        <Button size="sm"><Plus className="mr-2 size-4" />{t("storyEngine.locations")}</Button>
      </div>
      {locationsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : locations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("storyEngine.noLocations")}</p>
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

  const renderTimeline = () => (
    <DashboardCard title={t("storyEngine.timeline")}>
      {timelineLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : timeline.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("storyEngine.noEvents")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {timeline.map((event: any) => (
            <div key={event.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date} {event.time ? `· ${event.time}` : ""}</p>
                </div>
              </div>
              <Badge tone="info">{event.type}</Badge>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderEpisodes = () => (
    <DashboardCard title={t("storyEngine.episodes")}>
      <div className="flex justify-end mb-4">
        <Button size="sm"><Plus className="mr-2 size-4" />{t("storyEngine.episodes")}</Button>
      </div>
      {episodesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : episodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Film className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("storyEngine.noEpisodes")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((episode: any) => (
            <div key={episode.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <Film className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{episode.title}</p>
                  <p className="text-xs text-muted-foreground">{t("storyEngine.season")} {episode.season} · {t("storyEngine.episodeNumber")} {episode.number}</p>
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

  const renderRules = () => (
    <DashboardCard title={t("storyEngine.rules")}>
      <div className="flex justify-end mb-4">
        <Button size="sm"><Plus className="mr-2 size-4" />{t("storyEngine.rules")}</Button>
      </div>
      {rulesLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Shield className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">{t("storyEngine.noRules")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule: any) => (
            <div key={rule.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <Shield className="size-5 text-muted-foreground" />
                <p className="font-medium">{rule.text || rule.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={rule.enabled ? "success" : "muted"}>{rule.enabled ? "Active" : "Inactive"}</Badge>
                <Button variant="ghost" size="icon-sm"><Pencil className="size-3.5" /></Button>
                <Button variant="ghost" size="icon-sm">
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderSettings = () => (
    <DashboardCard title={t("common.settings")}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t("storyEngine.storyStatus")}</label>
            <Input defaultValue={story.status} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t("storyEngine.storyGenre")}</label>
            <Input defaultValue={story.genre} className="mt-1" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm">{t("common.save")}</Button>
        </div>
      </div>
    </DashboardCard>
  );

  if (storyLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/story">
          <Button variant="ghost" size="icon-sm"><ArrowLeft className="size-4" /></Button>
        </Link>
        <PageHeader
          title={story.title || t("storyEngine.stories")}
          description={story.synopsis || story.genre}
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {story.genre && <Badge tone="info">{story.genre}</Badge>}
        {story.status && <Badge tone={(STORY_STATUS_COLORS[story.status] as any) || "muted"}>{story.status}</Badge>}
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

      {activeTab === "bible" && renderBible()}
      {activeTab === "characters" && renderCharacters()}
      {activeTab === "relationships" && renderRelationships()}
      {activeTab === "locations" && renderLocations()}
      {activeTab === "timeline" && renderTimeline()}
      {activeTab === "episodes" && renderEpisodes()}
      {activeTab === "rules" && renderRules()}
      {activeTab === "settings" && renderSettings()}
    </div>
  );
}
