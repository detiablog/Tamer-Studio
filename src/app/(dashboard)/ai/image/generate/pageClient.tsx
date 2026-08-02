"use client";

import * as React from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import {
  Sparkles, Loader2, Heart, Download, Copy, Trash2, Image, Settings2,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4", "2:3", "3:2"];
const RESOLUTIONS = ["512x512", "768x768", "1024x1024", "1536x1536", "1920x1080", "1080x1920"];
const QUALITY_OPTIONS = ["standard", "hd"];
const BATCH_COUNTS = [1, 2, 4, 8];

export default function GeneratePageClient() {
  const { t } = useLocalizationContext();
  const [prompt, setPrompt] = React.useState("");
  const [negativePrompt, setNegativePrompt] = React.useState("");
  const [selectedStyle, setSelectedStyle] = React.useState("");
  const [aspectRatio, setAspectRatio] = React.useState("1:1");
  const [resolution, setResolution] = React.useState("1024x1024");
  const [quality, setQuality] = React.useState("standard");
  const [seed, setSeed] = React.useState("");
  const [batchCount, setBatchCount] = React.useState(1);
  const [generating, setGenerating] = React.useState(false);
  const [results, setResults] = React.useState<Array<{ id: string; images: string[]; prompt: string; status: string }>>([]);
  const [showSettings, setShowSettings] = React.useState(false);

  const { data: stylesData } = useSWR("/api/image-studio/styles", fetcher);
  const styles = stylesData?.data || [];

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast.error(t("imageStudio.enterPrompt", "Please enter a prompt")); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/image-studio/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          type: "text_to_image",
          style: selectedStyle || undefined,
          aspectRatio,
          resolution,
          quality,
          seed: seed ? parseInt(seed) : undefined,
          batchCount,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setResults(prev => [{ id: data.data.id, images: data.data.outputImages || [], prompt: data.data.prompt, status: data.data.status }, ...prev]);
        toast.success(t("imageStudio.generationQueued", "Generation queued successfully"));
      } else {
        toast.error(data.error || t("imageStudio.generationFailed", "Generation failed"));
      }
    } catch { toast.error(t("imageStudio.generationFailed", "Generation failed")); }
    finally { setGenerating(false); }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: t("dashboard.title", "Dashboard") },
        { label: t("imageStudio.title"), href: "/ai/image" },
        { label: t("imageStudio.newGeneration") },
      ]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <DashboardCard>
            <h3 className="font-heading font-semibold mb-4">{t("imageStudio.prompt")}</h3>
            <textarea
              className="w-full min-h-[120px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              placeholder={t("imageStudio.promptPlaceholder", "Describe the image you want to generate...")}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">{prompt.length} chars</span>
              <span className="text-xs text-muted-foreground">{t("imageStudio.maxChars", "Max 2000")}</span>
            </div>

            <div className="mt-4">
              <Label className="text-xs font-medium text-muted-foreground">{t("imageStudio.negativePrompt")}</Label>
              <textarea
                className="w-full min-h-[60px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-y mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                placeholder={t("imageStudio.negativePromptPlaceholder", "Things to avoid...")}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
              />
            </div>
          </DashboardCard>

          <DashboardCard>
            <h3 className="font-heading font-semibold mb-4">{t("imageStudio.style")}</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {styles.map((style: { id: string; name: string; isActive?: boolean }) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(selectedStyle === style.id ? "" : style.id)}
                  className={cn(
                    "rounded-lg border p-3 text-center text-xs transition-all",
                    selectedStyle === style.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                  )}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold">{t("imageStudio.settings")}</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)}>
                <Settings2 className="mr-2 size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">{t("imageStudio.aspectRatio")}</Label>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  {ASPECT_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">{t("imageStudio.resolution")}</Label>
                <select value={resolution} onChange={(e) => setResolution(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  {RESOLUTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">{t("imageStudio.quality")}</Label>
                <select value={quality} onChange={(e) => setQuality(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  {QUALITY_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">{t("imageStudio.seed")}</Label>
                <Input type="number" value={seed} onChange={(e) => setSeed(e.target.value)}
                  placeholder="Random" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">{t("imageStudio.batchCount")}</Label>
                <select value={batchCount} onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  {BATCH_COUNTS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
          </DashboardCard>

          <Button onClick={handleGenerate} disabled={generating || !prompt.trim()} className="w-full" size="lg">
            {generating ? <Loader2 className="mr-2 size-5 animate-spin" /> : <Sparkles className="mr-2 size-5" />}
            {generating ? t("imageStudio.generating") : t("imageStudio.generate")}
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="font-heading font-semibold">{t("imageStudio.results", "Results")}</h3>
          {results.length === 0 ? (
            <DashboardCard><div className="py-12 text-center text-muted-foreground"><Image className="size-12 mx-auto mb-2 opacity-30" /><p>{t("imageStudio.noResults", "No results yet. Generate your first image!")}</p></div></DashboardCard>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <DashboardCard key={result.id}>
                  <div className="aspect-square bg-muted/30 flex items-center justify-center">
                    <div className="text-4xl">🎨</div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">{result.prompt}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge tone={result.status === "completed" ? "default" : "muted"}>{result.status}</Badge>
                      <div className="flex gap-1 ml-auto">
                        <Button variant="ghost" size="icon" className="size-7"><Heart className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="size-7"><Download className="size-3.5" /></Button>
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
