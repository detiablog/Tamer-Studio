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
  Play, Loader2, Upload, Video, Heart, Download, RefreshCw,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type GenerationResult = {
  id: string;
  prompt: string;
  status: string;
  outputUrl?: string;
  creditsUsed: number;
  createdAt: string;
};

const GENERATION_TYPES = [
  { key: "text_to_video", label: "Text to Video" },
  { key: "image_to_video", label: "Image to Video" },
  { key: "storyboard_to_video", label: "Storyboard to Video" },
];

const STYLES = [
  { key: "cinematic", label: "Cinematic" },
  { key: "anime", label: "Anime" },
  { key: "realistic", label: "Realistic" },
  { key: "3d_render", label: "3D Render" },
  { key: "cartoon", label: "Cartoon" },
  { key: "pixel_art", label: "Pixel Art" },
];

const ASPECT_RATIOS = ["16:9", "9:16", "1:1", "4:3", "3:4"];
const RESOLUTIONS = ["720p", "1080p", "4K"];
const FRAME_RATES = ["24fps", "30fps", "60fps"];
const DURATIONS = [5, 10, 15, 30, 60];
const QUALITY = ["Standard", "High", "Ultra"];

export default function VideoGeneratePageClient() {
  const { t } = useLocalizationContext();
  const [prompt, setPrompt] = React.useState("");
  const [negativePrompt, setNegativePrompt] = React.useState("");
  const [type, setType] = React.useState("text_to_video");
  const [style, setStyle] = React.useState("cinematic");
  const [aspectRatio, setAspectRatio] = React.useState("16:9");
  const [resolution, setResolution] = React.useState("1080p");
  const [frameRate, setFrameRate] = React.useState("30fps");
  const [duration, setDuration] = React.useState(10);
  const [quality, setQuality] = React.useState("High");
  const [isGenerating, setIsGenerating] = React.useState(false);

  const { data: resultsData, mutate: mutateResults } = useSWR("/api/video-studio/generations?limit=20", fetcher);
  const results: GenerationResult[] = resultsData?.data || [];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(t("videoStudio.prompt"));
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch("/api/video-studio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          type,
          style,
          aspectRatio,
          resolution,
          frameRate,
          duration,
          quality,
        }),
      });
      if (res.ok) {
        toast.success(t("videoStudio.generating"));
        mutateResults();
      } else {
        toast.error(t("common.error"));
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: t("dashboard.title") },
        { label: t("videoStudio.title"), href: "/ai/video" },
        { label: t("videoStudio.generate") },
      ]} />
      <PageHeader title={t("videoStudio.generate")} description={t("videoStudio.description")} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <DashboardCard>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("videoStudio.prompt")}</label>
                <textarea className="mt-1 w-full min-h-[120px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder={t("videoStudio.prompt") + "..."}
                  value={prompt} onChange={(e) => setPrompt(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">{t("videoStudio.negativePrompt")}</label>
                <textarea className="mt-1 w-full min-h-[60px] rounded-md border border-border bg-background px-3 py-2 text-sm"
                  placeholder={t("videoStudio.negativePrompt") + "..."}
                  value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} />
              </div>
            </div>
          </DashboardCard>

          <DashboardCard>
            <h3 className="font-heading font-semibold text-sm mb-3">{t("common.status")}</h3>
            <div className="grid grid-cols-3 gap-2">
              {GENERATION_TYPES.map((gt) => (
                <div key={gt.key} className="cursor-pointer justify-center py-2" onClick={() => setType(gt.key)}>
                <Badge tone={type === gt.key ? "default" : "muted"}>
                  {gt.label}
                </Badge>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard>
            <h3 className="font-heading font-semibold text-sm mb-3">{t("imageStudio.style")}</h3>
            <div className="grid grid-cols-3 gap-2">
              {STYLES.map((s) => (
                <div key={s.key} className="cursor-pointer justify-center py-2" onClick={() => setStyle(s.key)}>
                <Badge tone={style === s.key ? "default" : "muted"}>
                  {s.label}
                </Badge>
                </div>
              ))}
            </div>
          </DashboardCard>

          {type === "image_to_video" && (
            <DashboardCard>
              <h3 className="font-heading font-semibold text-sm mb-3">{t("videoStudio.effects")}</h3>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t("common.upload")}</p>
              </div>
            </DashboardCard>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard>
              <label className="text-xs font-medium text-muted-foreground">{t("imageStudio.aspectRatio")}</label>
              <div className="flex flex-wrap gap-1 mt-2">
                {ASPECT_RATIOS.map((ar) => (
                  <div key={ar} className="cursor-pointer text-xs" onClick={() => setAspectRatio(ar)}>
                  <Badge tone={aspectRatio === ar ? "default" : "muted"}>
                    {ar}
                  </Badge>
                  </div>
                ))}
              </div>
            </DashboardCard>
            <DashboardCard>
              <label className="text-xs font-medium text-muted-foreground">{t("imageStudio.resolution")}</label>
              <div className="flex flex-wrap gap-1 mt-2">
                {RESOLUTIONS.map((r) => (
                  <div key={r} className="cursor-pointer text-xs" onClick={() => setResolution(r)}>
                  <Badge tone={resolution === r ? "default" : "muted"}>
                    {r}
                  </Badge>
                  </div>
                ))}
              </div>
            </DashboardCard>
            <DashboardCard>
              <label className="text-xs font-medium text-muted-foreground">{t("imageStudio.style")}</label>
              <div className="flex flex-wrap gap-1 mt-2">
                {FRAME_RATES.map((fr) => (
                  <div key={fr} className="cursor-pointer text-xs" onClick={() => setFrameRate(fr)}>
                  <Badge tone={frameRate === fr ? "default" : "muted"}>
                    {fr}
                  </Badge>
                  </div>
                ))}
              </div>
            </DashboardCard>
            <DashboardCard>
              <label className="text-xs font-medium text-muted-foreground">{t("videoStudio.duration")}</label>
              <div className="flex flex-wrap gap-1 mt-2">
                {DURATIONS.map((d) => (
                  <div key={d} className="cursor-pointer text-xs" onClick={() => setDuration(d)}>
                  <Badge tone={duration === d ? "default" : "muted"}>
                    {d}s
                  </Badge>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          <DashboardCard>
            <label className="text-xs font-medium text-muted-foreground">{t("imageStudio.quality")}</label>
            <div className="flex flex-wrap gap-1 mt-2">
              {QUALITY.map((q) => (
                <div key={q} className="cursor-pointer text-xs" onClick={() => setQuality(q)}>
                <Badge tone={quality === q ? "default" : "muted"}>
                  {q}
                </Badge>
                </div>
              ))}
            </div>
          </DashboardCard>

          <Button className="w-full" size="lg" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <><Loader2 className="mr-2 size-4 animate-spin" />{t("videoStudio.generating")}</>
            ) : (
              <><Play className="mr-2 size-4" />{t("videoStudio.generate")}</>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-heading font-semibold">{t("imageStudio.results")}</h3>
          {results.length === 0 ? (
            <DashboardCard>
              <div className="py-12 text-center text-muted-foreground">
                <Video className="size-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t("videoStudio.noGenerations")}</p>
              </div>
            </DashboardCard>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <DashboardCard key={result.id}>
                  <div className="aspect-video bg-muted/30 flex items-center justify-center">
                    {result.outputUrl ? (
                      <Play className="size-6 text-muted-foreground/30" />
                    ) : (
                      <Video className="size-6 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-medium truncate">{result.prompt}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge tone={result.status === "completed" ? "default" : "muted"}>{result.status}</Badge>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="size-6 p-0"><Heart className="size-3" /></Button>
                        <Button variant="ghost" size="sm" className="size-6 p-0"><Download className="size-3" /></Button>
                      </div>
                    </div>
                  </div>
                </DashboardCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
