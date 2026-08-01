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
  BookOpen,
  Plus,
  Users,
  Film,
  Clock,
  Loader2,
  ExternalLink,
  MapPin,
  Calendar,
  Shield,
  LayoutGrid,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Tab = "dashboard" | "stories" | "characters" | "timeline" | "episodes" | "locations" | "rules";

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

const EVENT_TYPE_COLORS: Record<string, string> = {
  battle: "warning",
  romance: "info",
  mystery: "purple",
  revelation: "success",
  default: "muted",
};

export function StoryCenterPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<Tab>("dashboard");

  const { data: statsData, isLoading: statsLoading } = useSWR("/api/stories/stats", fetcher);
  const { data: storiesData, isLoading: storiesLoading } = useSWR("/api/stories", fetcher);
  const { data: charactersData, isLoading: charactersLoading } = useSWR("/api/stories/characters", fetcher);
  const { data: timelineData, isLoading: timelineLoading } = useSWR("/api/stories/timeline", fetcher);
  const { data: episodesData, isLoading: episodesLoading } = useSWR("/api/stories/episodes", fetcher);
  const { data: locationsData, isLoading: locationsLoading } = useSWR("/api/stories/locations", fetcher);
  const { data: rulesData, isLoading: rulesLoading } = useSWR("/api/stories/rules", fetcher);

  const stats = statsData?.data ?? {};
  const stories = storiesData?.data ?? [];
  const characters = charactersData?.data ?? [];
  const timeline = timelineData?.data ?? [];
  const episodes = episodesData?.data ?? [];
  const locations = locationsData?.data ?? [];
  const rules = rulesData?.data ?? [];

  const tabs = [
    { id: "dashboard" as Tab, label: t("storyEngine.dashboard"), icon: LayoutGrid },
    { id: "stories" as Tab, label: t("storyEngine.stories"), icon: BookOpen },
    { id: "characters" as Tab, label: t("storyEngine.characters"), icon: Users },
    { id: "timeline" as Tab, label: t("storyEngine.timeline"), icon: Clock },
    { id: "episodes" as Tab, label: t("storyEngine.episodes"), icon: Film },
    { id: "locations" as Tab, label: t("storyEngine.locations"), icon: MapPin },
    { id: "rules" as Tab, label: t("storyEngine.rules"), icon: Shield },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("storyEngine.totalStories")} value={stats.totalStories ?? 0} />
        <StatCard title={t("storyEngine.totalCharacters")} value={stats.totalCharacters ?? 0} />
        <StatCard title={t("storyEngine.totalEpisodes")} value={stats.totalEpisodes ?? 0} />
        <StatCard title={t("storyEngine.totalEvents")} value={stats.totalEvents ?? 0} />
      </div>

      <DashboardCard title={t("storyEngine.dashboard")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/story/new">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/20 p-6 hover:bg-muted/40 transition-colors cursor-pointer">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Plus className="size-6 text-primary" />
              </div>
              <span className="font-medium">{t("storyEngine.createStory")}</span>
            </div>
          </Link>
          <button
            onClick={() => toast.info(t("storyEngine.stories"))}
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/20 p-6 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="size-6 text-primary" />
            </div>
            <span className="font-medium">{t("storyEngine.characters")}</span>
          </button>
          <button
            onClick={() => toast.info(t("storyEngine.timeline"))}
            className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/20 p-6 hover:bg-muted/40 transition-colors cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Clock className="size-6 text-primary" />
            </div>
            <span className="font-medium">{t("storyEngine.timeline")}</span>
          </button>
        </div>
      </DashboardCard>

      <DashboardCard title={t("storyEngine.stories")}>
        {storiesLoading ? (
          <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{t("storyEngine.noStories")}</p>
            <Link href="/story/new">
              <Button size="sm"><Plus className="mr-2 size-4" />{t("storyEngine.createStory")}</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stories.slice(0, 5).map((story: any) => (
              <div key={story.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{story.title}</p>
                    <p className="text-xs text-muted-foreground">{story.genre} · {story.characterCount ?? 0} {t("storyEngine.characters")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={(STORY_STATUS_COLORS[story.status] as any) || "muted"}>{story.status}</Badge>
                  <Link href={`/story/${story.id}`}>
                    <Button variant="ghost" size="icon-sm"><ExternalLink className="size-3.5" /></Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      <DashboardCard title={t("storyEngine.episodes")}>
        {episodesLoading ? (
          <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
        ) : episodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Film className="size-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">{t("storyEngine.noEpisodes")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {episodes.slice(0, 5).map((episode: any) => (
              <div key={episode.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <Film className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{episode.title}</p>
                    <p className="text-xs text-muted-foreground">{t("storyEngine.season")} {episode.season} · {t("storyEngine.episodeNumber")} {episode.number}</p>
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

  const renderStories = () => (
    <DashboardCard title={t("storyEngine.stories")}>
      <div className="flex justify-end mb-4">
        <Link href="/story/new">
          <Button size="sm"><Plus className="mr-2 size-4" />{t("storyEngine.createStory")}</Button>
        </Link>
      </div>
      {storiesLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="size-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-4">{t("storyEngine.noStories")}</p>
          <Link href="/story/new">
            <Button size="sm"><Plus className="mr-2 size-4" />{t("storyEngine.createStory")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story: any) => (
            <div key={story.id} className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{story.title}</p>
                  <p className="text-xs text-muted-foreground">{story.genre}</p>
                </div>
                <Badge tone={(STORY_STATUS_COLORS[story.status] as any) || "muted"}>{story.status}</Badge>
              </div>
              {story.synopsis && (
                <p className="text-sm text-muted-foreground line-clamp-2">{story.synopsis}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{story.characterCount ?? 0} {t("storyEngine.characters")}</span>
                <span>{story.episodeCount ?? 0} {t("storyEngine.episodes")}</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Link href={`/story/${story.id}`}>
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
    <DashboardCard title={t("storyEngine.characters")}>
      {charactersLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
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
                  <p className="text-xs text-muted-foreground">{character.role}</p>
                </div>
              </div>
              {character.storyTitle && (
                <p className="text-xs text-muted-foreground">{character.storyTitle}</p>
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
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
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
                <Calendar className="size-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">{event.date} {event.time ? `· ${event.time}` : ""}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={(EVENT_TYPE_COLORS[event.type] as any) || "muted"}>{event.type}</Badge>
                {event.storyTitle && (
                  <span className="text-xs text-muted-foreground">{event.storyTitle}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  const renderEpisodes = () => (
    <DashboardCard title={t("storyEngine.episodes")}>
      {episodesLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
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
                {episode.storyId && (
                  <Link href={`/story/${episode.storyId}`}>
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

  const renderLocations = () => (
    <DashboardCard title={t("storyEngine.locations")}>
      {locationsLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
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

  const renderRules = () => (
    <DashboardCard title={t("storyEngine.rules")}>
      {rulesLoading ? (
        <div className="flex items-center justify-center p-8"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
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
                <div>
                  <p className="font-medium">{rule.title || rule.text}</p>
                  {rule.storyTitle && (
                    <p className="text-xs text-muted-foreground">{rule.storyTitle}</p>
                  )}
                </div>
              </div>
              <Badge tone={rule.enabled ? "success" : "muted"}>{rule.enabled ? "Active" : "Inactive"}</Badge>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("storyEngine.title")}
        description={t("storyEngine.description")}
        actions={
          <Link href="/story/new">
            <Button><Plus className="mr-2 size-4" />{t("storyEngine.createStory")}</Button>
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
      {activeTab === "stories" && renderStories()}
      {activeTab === "characters" && renderCharacters()}
      {activeTab === "timeline" && renderTimeline()}
      {activeTab === "episodes" && renderEpisodes()}
      {activeTab === "locations" && renderLocations()}
      {activeTab === "rules" && renderRules()}
    </div>
  );
}
