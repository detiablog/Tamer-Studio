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
  Image, FolderOpen, History, Users, Palette, MessageSquare,
  FileText, Plus, Heart, Search, Loader2, Sparkles, Zap,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STYLE_CATEGORIES = [
  { key: "photorealistic", label: "Photorealistic", icon: "📷" },
  { key: "anime", label: "Anime", icon: "🎨" },
  { key: "illustration", label: "Illustration", icon: "✏️" },
  { key: "cinematic", label: "Cinematic", icon: "🎬" },
  { key: "minimalist", label: "Minimalist", icon: "◻️" },
  { key: "fantasy", label: "Fantasy", icon: "🐉" },
];

type Stats = {
  totalGenerations: number;
  completedGenerations: number;
  favoriteGenerations: number;
  totalProjects: number;
  totalCreditsUsed: number;
};

type Generation = {
  id: string;
  prompt: string;
  type: string;
  status: string;
  isFavorite: boolean;
  outputImages: string[];
  creditsUsed: number;
  createdAt: string;
};

type Project = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  status: string;
  createdAt: string;
};

export default function ImageStudioPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<"home" | "projects" | "history" | "characters" | "styles" | "prompts">("home");
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: statsData } = useSWR("/api/image-studio/stats", fetcher);
  const stats: Stats = statsData?.data || { totalGenerations: 0, completedGenerations: 0, favoriteGenerations: 0, totalProjects: 0, totalCreditsUsed: 0 };

  const { data: generationsData, isLoading: loadingGen } = useSWR("/api/image-studio/generations?limit=12", fetcher);
  const generations: Generation[] = generationsData?.data || [];

  const { data: projectsData, isLoading: loadingProj } = useSWR("/api/image-studio/projects?limit=12", fetcher);
  const projects: Project[] = projectsData?.data || [];

  const { data: stylesData } = useSWR("/api/image-studio/styles", fetcher);
  const styles = stylesData?.data || [];

  const { data: charsData } = useSWR("/api/image-studio/characters", fetcher);
  const characters = charsData?.data || [];

  const { data: promptsData } = useSWR("/api/image-studio/prompts", fetcher);
  const prompts = promptsData?.data || [];

  const tabs = [
    { key: "home" as const, label: t("imageStudio.home", "Home"), icon: Sparkles },
    { key: "projects" as const, label: t("imageStudio.projects"), icon: FolderOpen },
    { key: "history" as const, label: t("imageStudio.history"), icon: History },
    { key: "characters" as const, label: t("imageStudio.characters"), icon: Users },
    { key: "styles" as const, label: t("imageStudio.styles"), icon: Palette },
    { key: "prompts" as const, label: t("imageStudio.prompts"), icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("dashboard.title", "Dashboard") }, { label: t("imageStudio.title") }]} />
      <PageHeader title={t("imageStudio.title")} description={t("imageStudio.description")} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("imageStudio.totalGenerations"), value: stats.totalGenerations, icon: Image },
          { label: t("imageStudio.favoriteGenerations"), value: stats.favoriteGenerations, icon: Heart },
          { label: t("imageStudio.totalProjects"), value: stats.totalProjects, icon: FolderOpen },
          { label: t("imageStudio.creditsUsed"), value: stats.totalCreditsUsed, icon: Zap },
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
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{t("imageStudio.recentGenerations", "Recent Generations")}</h3>
            <Button onClick={() => window.location.href = "/ai/image/generate"}>
              <Plus className="mr-2 size-4" />{t("imageStudio.newGeneration")}
            </Button>
          </div>
          {loadingGen ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
          ) : generations.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("imageStudio.noGenerations")}</div></DashboardCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {generations.map((gen) => (
                <DashboardCard key={gen.id}>
                  <div className="aspect-square bg-muted/30 flex items-center justify-center">
                    {gen.outputImages.length > 0 ? (
                      <div className="text-4xl">🎨</div>
                    ) : (
                      <Image className="size-8 text-muted-foreground/30" />
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
              <Input placeholder={t("imageStudio.searchProjects", "Search projects...")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Button><Plus className="mr-2 size-4" />{t("imageStudio.createProject")}</Button>
          </div>
          {loadingProj ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>
          ) : projects.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("imageStudio.noProjects")}</div></DashboardCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <DashboardCard key={proj.id}>
                  <h3 className="font-heading font-semibold">{proj.name}</h3>
                  {proj.description && <p className="text-sm text-muted-foreground mt-1">{proj.description}</p>}
                  {proj.tags?.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">{proj.tags.map((tag) => <div key={tag} className="text-xs"><Badge tone="muted">{tag}</Badge></div>)}</div>
                  )}
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 max-w-sm">
            <Search className="size-4 text-muted-foreground" />
            <Input placeholder={t("imageStudio.searchPrompts", "Search prompts...")} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("imageStudio.prompt")}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("imageStudio.style")}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("common.status")}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("imageStudio.creditsUsed")}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("common.createdAt")}</th>
              </tr></thead>
              <tbody>{generations.map((gen) => (
                <tr key={gen.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="px-4 py-3 max-w-[300px] truncate">{gen.prompt}</td>
                  <td className="px-4 py-3">{gen.type}</td>
                  <td className="px-4 py-3"><Badge tone={gen.status === "completed" ? "default" : "muted"}>{gen.status}</Badge></td>
                  <td className="px-4 py-3">{gen.creditsUsed}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(gen.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "characters" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{t("imageStudio.characters")}</h3>
            <Button><Plus className="mr-2 size-4" />{t("imageStudio.createCharacter", "Create Character")}</Button>
          </div>
          {characters.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("imageStudio.noCharacters")}</div></DashboardCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((char: { id: string; name: string; description?: string; promptTags?: string[] }) => (
                <DashboardCard key={char.id}>
                  <h3 className="font-heading font-semibold">{char.name}</h3>
                  {char.description && <p className="text-sm text-muted-foreground mt-1">{char.description}</p>}
                  {char.promptTags && char.promptTags.length > 0 && <div className="flex gap-1 mt-2 flex-wrap">{char.promptTags.map((tag: string) => <div key={tag} className="text-xs"><Badge tone="muted">{tag}</Badge></div>)}</div>}
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "styles" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {styles.map((style: { id: string; name: string; category?: string; usageCount?: number; isActive?: boolean }) => (
            <DashboardCard key={style.id}>
              <div className="text-2xl mb-2">{STYLE_CATEGORIES.find(s => s.key === style.category)?.icon || "🎨"}</div>
              <h3 className="font-medium text-sm">{style.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t("imageStudio.usageCount", "Usage")}: {style.usageCount || 0}</p>
            </DashboardCard>
          ))}
        </div>
      )}

      {activeTab === "prompts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{t("imageStudio.prompts")}</h3>
            <Button><Plus className="mr-2 size-4" />{t("imageStudio.createPrompt", "Create Prompt")}</Button>
          </div>
          {prompts.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground">{t("imageStudio.noPrompts")}</div></DashboardCard>
          ) : (
            <div className="space-y-3">
              {prompts.map((prompt: { id: string; name: string; prompt: string; category?: string; useCount?: number }) => (
                <DashboardCard key={prompt.id}>
                  <div className="flex items-center justify-between">
                    <div><h3 className="font-medium text-sm">{prompt.name}</h3><p className="text-xs text-muted-foreground mt-1 line-clamp-2">{prompt.prompt}</p></div>
                    <Badge tone="default">{prompt.useCount || 0}</Badge>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
