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
  Plus, Trash2, Save, Play, Loader2, GripVertical, Film,
  Camera, Clock, Music, MessageSquare, Users, Wand2, Eye,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Scene = {
  id: string;
  title: string;
  prompt: string;
  cameraMotion: string;
  duration: number;
  effects: string[];
  characters: string[];
  subtitles: string;
  transition: string;
  audio: string;
  thumbnailUrl?: string;
  status: string;
  order: number;
};

type Storyboard = {
  id: string;
  name: string;
  projectId?: string;
  scenes: Scene[];
  status: string;
  createdAt: string;
};

export default function StoryboardEditorPageClient() {
  const { t } = useLocalizationContext();
  const [selectedScene, setSelectedScene] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const { data: sbData, isLoading } = useSWR("/api/video-studio/storyboards/current", fetcher);
  const storyboard: Storyboard = sbData?.data || { id: "", name: "", scenes: [], status: "draft" };

  const currentScene = storyboard.scenes.find((s) => s.id === selectedScene) || storyboard.scenes[0];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/video-studio/storyboards/current", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storyboard),
      });
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddScene = async () => {
    try {
      await fetch("/api/video-studio/storyboards/current/scenes", { method: "POST" });
      toast.success(t("videoStudio.addScene"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleDeleteScene = async (sceneId: string) => {
    try {
      await fetch(`/api/video-studio/storyboards/current/scenes/${sceneId}`, { method: "DELETE" });
      toast.success(t("videoStudio.removeScene"));
    } catch {
      toast.error(t("common.error"));
    }
  };

  const handleUpdateScene = async (sceneId: string, updates: Partial<Scene>) => {
    try {
      await fetch(`/api/video-studio/storyboards/current/scenes/${sceneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch {
      toast.error(t("common.error"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: t("dashboard.title") },
        { label: t("videoStudio.title"), href: "/ai/video" },
        { label: storyboard.name || t("videoStudio.storyboard") },
      ]} />

      <div className="flex items-center justify-between">
        <PageHeader title={storyboard.name || t("videoStudio.storyboard")} description={`${storyboard.scenes.length} scenes`} />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleAddScene}>
            <Plus className="mr-2 size-4" />{t("videoStudio.addScene")}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            {t("common.save")}
          </Button>
          <Button variant="default">
            <Play className="mr-2 size-4" />{t("videoStudio.render")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 min-h-[600px]">
        <div className="col-span-3 space-y-2">
          <h3 className="font-heading font-semibold text-sm mb-3">{t("videoStudio.storyboard")}</h3>
          {storyboard.scenes.map((scene, idx) => (
            <DashboardCard key={scene.id}
              className={cn("cursor-pointer transition-colors", selectedScene === scene.id && "border-primary")}
              onClick={() => setSelectedScene(scene.id)}>
              <div className="flex items-center gap-3">
                <GripVertical className="size-4 text-muted-foreground/50 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{scene.title || `Scene ${idx + 1}`}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{scene.duration}s</Badge>
                    <Badge variant={scene.status === "completed" ? "default" : "secondary"} className="text-xs">{scene.status}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0" onClick={(e) => { e.stopPropagation(); handleDeleteScene(scene.id); }}>
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              </div>
            </DashboardCard>
          ))}
        </div>

        <div className="col-span-6 space-y-4">
          {currentScene ? (
            <>
              <DashboardCard>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">{t("videoStudio.sceneTitle")}</label>
                    <Input className="mt-1" value={currentScene.title}
                      onChange={(e) => handleUpdateScene(currentScene.id, { title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("videoStudio.prompt")}</label>
                    <textarea className="mt-1 w-full min-h-[100px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                      value={currentScene.prompt}
                      onChange={(e) => handleUpdateScene(currentScene.id, { prompt: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">{t("videoStudio.cameraMotion")}</label>
                      <Input className="mt-1" value={currentScene.cameraMotion}
                        onChange={(e) => handleUpdateScene(currentScene.id, { cameraMotion: e.target.value })} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t("videoStudio.duration")}</label>
                      <Input className="mt-1" type="number" value={currentScene.duration}
                        onChange={(e) => handleUpdateScene(currentScene.id, { duration: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("videoStudio.subtitles")}</label>
                    <Input className="mt-1" value={currentScene.subtitles}
                      onChange={(e) => handleUpdateScene(currentScene.id, { subtitles: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("videoStudio.characters")}</label>
                    <Input className="mt-1" value={currentScene.characters.join(", ")}
                      onChange={(e) => handleUpdateScene(currentScene.id, { characters: e.target.value.split(", ").filter(Boolean) })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{t("videoStudio.effects")}</label>
                    <Input className="mt-1" value={currentScene.effects.join(", ")}
                      onChange={(e) => handleUpdateScene(currentScene.id, { effects: e.target.value.split(", ").filter(Boolean) })} />
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard>
                <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
                  {currentScene.thumbnailUrl ? (
                    <Eye className="size-12 text-muted-foreground/30" />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Film className="size-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">{t("videoStudio.sceneTitle")}</p>
                    </div>
                  )}
                </div>
              </DashboardCard>
            </>
          ) : (
            <DashboardCard>
              <div className="py-24 text-center text-muted-foreground">
                <Film className="size-12 mx-auto mb-4 opacity-30" />
                <p>{t("videoStudio.addScene")}</p>
              </div>
            </DashboardCard>
          )}
        </div>

        <div className="col-span-3 space-y-4">
          <h3 className="font-heading font-semibold text-sm">{t("videoStudio.sceneTitle")}</h3>
          {currentScene && (
            <div className="space-y-4">
              <DashboardCard>
                <div className="flex items-center gap-2 mb-3">
                  <Film className="size-4 text-primary" />
                  <span className="text-sm font-medium">{t("videoStudio.transition")}</span>
                </div>
                <Input value={currentScene.transition}
                  onChange={(e) => handleUpdateScene(currentScene.id, { transition: e.target.value })} />
              </DashboardCard>

              <DashboardCard>
                <div className="flex items-center gap-2 mb-3">
                  <Music className="size-4 text-primary" />
                  <span className="text-sm font-medium">{t("videoStudio.audio")}</span>
                </div>
                <Input value={currentScene.audio}
                  onChange={(e) => handleUpdateScene(currentScene.id, { audio: e.target.value })} />
              </DashboardCard>

              <DashboardCard>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="size-4 text-primary" />
                  <span className="text-sm font-medium">{t("videoStudio.duration")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input type="number" value={currentScene.duration}
                    onChange={(e) => handleUpdateScene(currentScene.id, { duration: Number(e.target.value) })} />
                  <span className="text-sm text-muted-foreground">s</span>
                </div>
              </DashboardCard>

              <DashboardCard>
                <div className="flex items-center gap-2 mb-3">
                  <Camera className="size-4 text-primary" />
                  <span className="text-sm font-medium">{t("videoStudio.cameraMotion")}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Static", "Pan Left", "Pan Right", "Zoom In", "Zoom Out", "Tracking"].map((m) => (
                    <Badge key={m} variant={currentScene.cameraMotion === m ? "default" : "outline"}
                      className="cursor-pointer" onClick={() => handleUpdateScene(currentScene.id, { cameraMotion: m })}>
                      {m}
                    </Badge>
                  ))}
                </div>
              </DashboardCard>

              <DashboardCard>
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 className="size-4 text-primary" />
                  <span className="text-sm font-medium">{t("videoStudio.effects")}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["None", "Blur", "Fade", "Glow", "Vintage", "Cinematic"].map((fx) => (
                    <Badge key={fx} variant={currentScene.effects.includes(fx) ? "default" : "outline"}
                      className="cursor-pointer" onClick={() => {
                        const effects = currentScene.effects.includes(fx)
                          ? currentScene.effects.filter((e) => e !== fx)
                          : [...currentScene.effects, fx];
                        handleUpdateScene(currentScene.id, { effects });
                      }}>
                      {fx}
                    </Badge>
                  ))}
                </div>
              </DashboardCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
