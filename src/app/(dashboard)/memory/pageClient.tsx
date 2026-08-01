"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Users,
  Sliders,
  GraduationCap,
  Lightbulb,
  Eye,
  Star,
  Plus,
  Search,
  RefreshCw,
  Loader,
  Pin,
  Trash2,
  Edit,
  ChevronRight,
  Shield,
  Wand2,
  Image,
  BookOpen,
  User,
  LayoutGrid,
  Type,
  Workflow,
  Send,
  History,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

type TabKey =
  | "dashboard"
  | "brand"
  | "visual"
  | "story"
  | "character"
  | "thumbnail"
  | "caption"
  | "memory"
  | "preferences"
  | "workflow"
  | "publishing"
  | "generations"
  | "learning"
  | "insights";

const TABS: { key: TabKey; icon: React.ElementType }[] = [
  { key: "dashboard", icon: Eye },
  { key: "brand", icon: Shield },
  { key: "visual", icon: Image },
  { key: "story", icon: BookOpen },
  { key: "character", icon: User },
  { key: "thumbnail", icon: LayoutGrid },
  { key: "caption", icon: Type },
  { key: "memory", icon: Brain },
  { key: "preferences", icon: Sliders },
  { key: "workflow", icon: Workflow },
  { key: "publishing", icon: Send },
  { key: "generations", icon: History },
  { key: "learning", icon: GraduationCap },
  { key: "insights", icon: Lightbulb },
];

const MEMORY_CATEGORIES = ["prompt", "visual", "story", "character", "workflow", "publishing"];

export function MemoryPageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("dashboard");
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<any>({});
  const [formLoading, setFormLoading] = React.useState(false);

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR(
    "/api/memory/stats",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: brandsData, isLoading: brandsLoading, mutate: mutateBrands } = useSWR(
    "/api/memory/brand",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: visualData, isLoading: visualLoading, mutate: mutateVisual } = useSWR(
    `/api/memory/visual${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: storyData, isLoading: storyLoading, mutate: mutateStory } = useSWR(
    `/api/memory/story${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: characterData, isLoading: characterLoading, mutate: mutateCharacter } = useSWR(
    `/api/memory/character${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: thumbnailData, isLoading: thumbnailLoading, mutate: mutateThumbnail } = useSWR(
    `/api/memory/thumbnail${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: captionData, isLoading: captionLoading, mutate: mutateCaption } = useSWR(
    `/api/memory/caption${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: memoryData, isLoading: memoryLoading, mutate: mutateMemory } = useSWR(
    `/api/memory${categoryFilter !== "all" ? `?category=${categoryFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: preferencesData, isLoading: preferencesLoading, mutate: mutatePreferences } = useSWR(
    "/api/memory/preferences",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: workflowData, isLoading: workflowLoading, mutate: mutateWorkflow } = useSWR(
    `/api/memory/workflow${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: publishingData, isLoading: publishingLoading, mutate: mutatePublishing } = useSWR(
    "/api/memory/publishing",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: generationsData, isLoading: generationsLoading, mutate: mutateGenerations } = useSWR(
    "/api/memory/generation",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: learningData, isLoading: learningLoading, mutate: mutateLearning } = useSWR(
    "/api/memory/learning",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const { data: insightsData, isLoading: insightsLoading } = useSWR(
    "/api/memory/insights",
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  const stats = statsData?.success ? statsData.data : null;
  const brands = brandsData?.success ? brandsData.data?.brands ?? [] : [];
  const visualItems = visualData?.success ? visualData.data?.memories ?? visualData.data ?? [] : [];
  const storyItems = storyData?.success ? storyData.data?.memories ?? storyData.data ?? [] : [];
  const characterItems = characterData?.success ? characterData.data?.memories ?? characterData.data ?? [] : [];
  const thumbnailItems = thumbnailData?.success ? thumbnailData.data?.memories ?? thumbnailData.data ?? [] : [];
  const captionItems = captionData?.success ? captionData.data?.memories ?? captionData.data ?? [] : [];
  const memoryEntries = memoryData?.success ? memoryData.data?.entries ?? memoryData.data?.memories ?? [] : [];
  const preferences = preferencesData?.success ? preferencesData.data?.preferences ?? [] : [];
  const workflowItems = workflowData?.success ? workflowData.data?.memories ?? workflowData.data ?? [] : [];
  const publishingItem = publishingData?.success ? publishingData.data : null;
  const generationItems = generationsData?.success ? generationsData.data?.generations ?? generationsData.data ?? [] : [];
  const learningEvents = learningData?.success ? learningData.data?.events ?? [] : [];
  const insights = insightsData?.success ? insightsData.data : null;

  const isLoading = statsLoading || brandsLoading || visualLoading || storyLoading || characterLoading || thumbnailLoading || captionLoading || memoryLoading || preferencesLoading || workflowLoading || publishingLoading || generationsLoading || learningLoading || insightsLoading;

  const filteredMemory = React.useMemo(
    () =>
      memoryEntries.filter(
        (e: any) =>
          e.key?.toLowerCase().includes(search.toLowerCase()) ||
          e.content?.toLowerCase().includes(search.toLowerCase())
      ),
    [memoryEntries, search]
  );

  const filteredPreferences = React.useMemo(
    () =>
      preferences.filter(
        (p: any) =>
          p.key?.toLowerCase().includes(search.toLowerCase()) ||
          p.value?.toLowerCase().includes(search.toLowerCase())
      ),
    [preferences, search]
  );

  const filteredLearning = React.useMemo(
    () =>
      learningEvents.filter(
        (e: any) =>
          e.type?.toLowerCase().includes(search.toLowerCase()) ||
          e.category?.toLowerCase().includes(search.toLowerCase())
      ),
    [learningEvents, search]
  );

  const resetForm = () => {
    setForm({});
    setEditId(null);
    setShowForm(false);
  };

  const openCreate = (defaults: any = {}) => {
    setForm(defaults);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (item: any, fields: string[]) => {
    const data: any = {};
    fields.forEach((f) => (data[f] = item[f] ?? ""));
    setForm(data);
    setEditId(item.id);
    setShowForm(true);
  };

  const handleSave = async (url: string, mutate: () => Promise<any>, fields: string[]) => {
    setFormLoading(true);
    try {
      const payload: any = {};
      fields.forEach((f) => {
        if (form[f] !== undefined && form[f] !== null) payload[f] = form[f];
      });
      const method = editId ? "PUT" : "POST";
      const target = editId ? `${url}/${editId}` : url;
      const res = await fetch(target, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(t("common.success", "Saved"));
        resetForm();
        mutate();
        mutateStats();
      } else {
        toast.error(t("common.error", "Error"));
      }
    } catch {
      toast.error(t("common.error", "Error"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (url: string, id: string, mutate: () => Promise<any>) => {
    try {
      const res = await fetch(`${url}/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Deleted"));
        mutate();
        mutateStats();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleDeleteEntry = (id: string) => handleDelete("/api/memory", id, mutateMemory);
  const handleDeleteBrand = (id: string) => handleDelete("/api/memory/brand", id, mutateBrands);
  const handleDeleteVisual = (id: string) => handleDelete("/api/memory/visual", id, mutateVisual);
  const handleDeleteStory = (id: string) => handleDelete("/api/memory/story", id, mutateStory);
  const handleDeleteCharacter = (id: string) => handleDelete("/api/memory/character", id, mutateCharacter);
  const handleDeleteThumbnail = (id: string) => handleDelete("/api/memory/thumbnail", id, mutateThumbnail);
  const handleDeleteCaption = (id: string) => handleDelete("/api/memory/caption", id, mutateCaption);
  const handleDeletePreference = (id: string) => handleDelete("/api/memory/preferences", id, mutatePreferences);
  const handleDeleteWorkflow = (id: string) => handleDelete("/api/memory/workflow", id, mutateWorkflow);
  const handleDeleteGeneration = (id: string) => handleDelete("/api/memory/generation", id, mutateGenerations);
  const handleDeleteLearning = (id: string) => handleDelete("/api/memory/learning", id, mutateLearning);

  const renderForm = (fields: { key: string; label: string; type?: string; options?: string[]; multiline?: boolean }[], onSave: () => void) => (
    <DashboardCard>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{editId ? "Edit" : "Create"}</h3>
          <Button variant="ghost" size="sm" onClick={resetForm}><X className="size-4" /></Button>
        </div>
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <label className="text-xs text-muted-foreground">{field.label}</label>
            {field.type === "select" && field.options ? (
              <select
                value={form[field.key] ?? ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">Select...</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.multiline ? (
              <textarea
                value={form[field.key] ?? ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            ) : (
              <Input
                value={form[field.key] ?? ""}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.label}
              />
            )}
          </div>
        ))}
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={resetForm}>Cancel</Button>
          <Button size="sm" disabled={formLoading} onClick={onSave}>
            {formLoading ? <Loader className="size-4 animate-spin" /> : <Check className="size-4" />}
            {editId ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </DashboardCard>
  );

  const renderSearchBar = () => (
    <div className="relative flex-1 min-w-[250px]">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("common.search", "Search...")} className="pl-9" />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("creativeMemory.title", "Creative Memory")}
        description={t("creativeMemory.description", "Your AI-powered creative intelligence and brand consistency engine")}
      />

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {TABS.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setSearch(""); setCategoryFilter("all"); resetForm(); }}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {t(`creativeMemory.${key}`, key.charAt(0).toUpperCase() + key.slice(1))}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="size-6 animate-spin text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
        </div>
      ) : (
        <>
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Brain className="size-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("creativeMemory.totalMemories", "Total Memories")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalMemories ?? memoryEntries.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Users className="size-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("creativeMemory.brandProfiles", "Brand Profiles")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalBrandProfiles ?? brands.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Sliders className="size-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("creativeMemory.totalPreferences", "Preferences")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalPreferences ?? preferences.length}</p>
                    </div>
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <GraduationCap className="size-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("creativeMemory.learningEvents", "Learning Events")}</p>
                      <p className="mt-1 text-2xl font-semibold">{stats?.totalLearningEvents ?? learningEvents.length}</p>
                    </div>
                  </div>
                </DashboardCard>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  { label: "Visual", count: stats?.totalVisualMemories, icon: Image, color: "cyan" },
                  { label: "Story", count: stats?.totalStoryMemories, icon: BookOpen, color: "pink" },
                  { label: "Character", count: stats?.totalCharacterMemories, icon: User, color: "indigo" },
                  { label: "Thumbnail", count: stats?.totalThumbnailMemories, icon: LayoutGrid, color: "amber" },
                  { label: "Caption", count: stats?.totalCaptionMemories, icon: Type, color: "teal" },
                  { label: "Workflow", count: stats?.totalWorkflowMemories, icon: Workflow, color: "violet" },
                  { label: "Generation", count: stats?.totalGenerationMemories, icon: History, color: "rose" },
                  { label: "Publishing", count: publishingItem ? 1 : 0, icon: Send, color: "emerald" },
                ].map((item) => (
                  <DashboardCard key={item.label}>
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 items-center justify-center rounded-lg bg-${item.color}-500/10`}>
                        <item.icon className={`size-5 text-${item.color}-500`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="mt-1 text-2xl font-semibold">{item.count ?? 0}</p>
                      </div>
                    </div>
                  </DashboardCard>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard title={t("creativeMemory.memory", "Recent Memory")}>
                  {memoryEntries.length > 0 ? (
                    <div className="space-y-3">
                      {memoryEntries.slice(0, 5).map((entry: any) => (
                        <div key={entry.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{entry.key}</span>
                              <Badge tone="info">{entry.category}</Badge>
                              {entry.pinned && <Pin className="size-3 text-primary" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate">{entry.content}</p>
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground ml-2 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("creativeMemory.noMemory", "No memory entries yet")}
                    </div>
                  )}
                </DashboardCard>

                <DashboardCard title={t("creativeMemory.brand", "Brand Profiles")}>
                  {brands.length > 0 ? (
                    <div className="space-y-3">
                      {brands.slice(0, 5).map((brand: any) => (
                        <div key={brand.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{brand.name}</span>
                              {brand.colors && brand.colors.length > 0 && (
                                <div className="flex gap-1">
                                  {brand.colors.slice(0, 3).map((color: string, i: number) => (
                                    <span key={i} className="size-3 rounded-full border" style={{ backgroundColor: color }} />
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{brand.voice}</p>
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground ml-2 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      {t("creativeMemory.noBrands", "No brand profiles created")}
                    </div>
                  )}
                </DashboardCard>
              </div>

              {insights && (
                <DashboardCard title={t("creativeMemory.insights", "Insights")}>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-xs text-muted-foreground">{t("creativeMemory.brandConsistency", "Brand Consistency Score")}</p>
                      <p className="mt-2 text-2xl font-semibold">{insights.brandConsistencyScore ?? 0}%</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-xs text-muted-foreground">Most Used Style</p>
                      <p className="mt-2 text-sm font-medium">{insights.mostUsedStyle ?? "-"}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/20 p-4">
                      <p className="text-xs text-muted-foreground">Favorite Prompt</p>
                      <p className="mt-2 text-sm font-medium truncate">{insights.favoritePrompt ?? "-"}</p>
                    </div>
                  </div>
                </DashboardCard>
              )}

              <DashboardCard title={t("common.actions", "Quick Actions")}>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("memory")}>
                    <Plus className="mr-2 size-4" />
                    {t("creativeMemory.addMemory", "Add Memory")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("brand")}>
                    <Plus className="mr-2 size-4" />
                    {t("creativeMemory.addBrand", "Add Brand Profile")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => mutateStats()}>
                    <RefreshCw className="mr-2 size-4" />
                    {t("common.refresh", "Refresh")}
                  </Button>
                </div>
              </DashboardCard>
            </div>
          )}

          {activeTab === "brand" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ name: "", voice: "", tone: "", colors: [], audience: "", values: "" })}>
                  <Plus className="mr-2 size-4" />
                  {t("creativeMemory.addBrand", "Add Brand Profile")}
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "name", label: "Name" },
                  { key: "voice", label: "Voice" },
                  { key: "tone", label: "Tone" },
                  { key: "audience", label: "Audience" },
                  { key: "values", label: "Values" },
                ],
                () => handleSave("/api/memory/brand", mutateBrands, ["name", "voice", "tone", "audience", "values"])
              )}
              {brands.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {brands.map((brand: any) => (
                    <DashboardCard key={brand.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{brand.name}</h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-16">Voice:</span>
                              <span className="text-sm">{brand.voice}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-16">Tone:</span>
                              <Badge tone="info">{brand.tone}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-16">Colors:</span>
                              <div className="flex gap-1">
                                {(brand.colors ?? []).map((color: string, i: number) => (
                                  <span key={i} className="size-5 rounded-full border" style={{ backgroundColor: color }} />
                                ))}
                              </div>
                            </div>
                            {brand.audience && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground w-16">Audience:</span>
                                <span className="text-sm truncate">{brand.audience}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(brand, ["name", "voice", "tone", "audience", "values"])}><Edit className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteBrand(brand.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("creativeMemory.noBrands", "No brand profiles created")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "visual" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ style: "", description: "", tags: "", projectId: "" })}>
                  <Plus className="mr-2 size-4" />
                  Add Visual Memory
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "style", label: "Style" },
                  { key: "description", label: "Description", multiline: true },
                  { key: "tags", label: "Tags" },
                  { key: "projectId", label: "Project ID" },
                ],
                () => handleSave("/api/memory/visual", mutateVisual, ["style", "description", "tags", "projectId"])
              )}
              {visualItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {visualItems.map((item: any) => (
                    <DashboardCard key={item.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Image className="size-4 text-cyan-500" />
                            <span className="font-semibold text-sm">{item.style}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                          {item.tags && <div className="mt-2"><Badge tone="info">{item.tags}</Badge></div>}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item, ["style", "description", "tags", "projectId"])}><Edit className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteVisual(item.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">No visual memories</div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "story" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ title: "", content: "", theme: "", tags: "" })}>
                  <Plus className="mr-2 size-4" />
                  Add Story Memory
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "title", label: "Title" },
                  { key: "content", label: "Content", multiline: true },
                  { key: "theme", label: "Theme" },
                  { key: "tags", label: "Tags" },
                ],
                () => handleSave("/api/memory/story", mutateStory, ["title", "content", "theme", "tags"])
              )}
              {storyItems.length > 0 ? (
                <div className="space-y-3">
                  {storyItems.map((item: any) => (
                    <DashboardCard key={item.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <BookOpen className="size-4 text-pink-500" />
                            <span className="font-semibold text-sm">{item.title}</span>
                            {item.theme && <Badge tone="info">{item.theme}</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                          {item.tags && <div className="mt-2"><Badge tone="default">{item.tags}</Badge></div>}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item, ["title", "content", "theme", "tags"])}><Edit className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteStory(item.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">No story memories</div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "character" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ name: "", description: "", personality: "", appearance: "" })}>
                  <Plus className="mr-2 size-4" />
                  Add Character Memory
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "name", label: "Name" },
                  { key: "description", label: "Description", multiline: true },
                  { key: "personality", label: "Personality" },
                  { key: "appearance", label: "Appearance" },
                ],
                () => handleSave("/api/memory/character", mutateCharacter, ["name", "description", "personality", "appearance"])
              )}
              {characterItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {characterItems.map((item: any) => (
                    <DashboardCard key={item.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <User className="size-4 text-indigo-500" />
                            <span className="font-semibold text-sm">{item.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                          {item.personality && (
                            <div className="mt-2 flex gap-1 flex-wrap">
                              {String(item.personality).split(",").map((p: string, i: number) => (
                                <Badge key={i} tone="info">{p.trim()}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item, ["name", "description", "personality", "appearance"])}><Edit className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCharacter(item.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">No character memories</div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "thumbnail" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ title: "", style: "", description: "", tags: "" })}>
                  <Plus className="mr-2 size-4" />
                  Add Thumbnail Memory
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "title", label: "Title" },
                  { key: "style", label: "Style" },
                  { key: "description", label: "Description", multiline: true },
                  { key: "tags", label: "Tags" },
                ],
                () => handleSave("/api/memory/thumbnail", mutateThumbnail, ["title", "style", "description", "tags"])
              )}
              {thumbnailItems.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {thumbnailItems.map((item: any) => (
                    <DashboardCard key={item.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <LayoutGrid className="size-4 text-amber-500" />
                            <span className="font-semibold text-sm">{item.title}</span>
                          </div>
                          {item.style && <Badge tone="info">{item.style}</Badge>}
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item, ["title", "style", "description", "tags"])}><Edit className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteThumbnail(item.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">No thumbnail memories</div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "caption" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ text: "", tone: "", platform: "", tags: "" })}>
                  <Plus className="mr-2 size-4" />
                  Add Caption Memory
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "text", label: "Text", multiline: true },
                  { key: "tone", label: "Tone" },
                  { key: "platform", label: "Platform" },
                  { key: "tags", label: "Tags" },
                ],
                () => handleSave("/api/memory/caption", mutateCaption, ["text", "tone", "platform", "tags"])
              )}
              {captionItems.length > 0 ? (
                <div className="space-y-3">
                  {captionItems.map((item: any) => (
                    <DashboardCard key={item.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Type className="size-4 text-teal-500" />
                            {item.tone && <Badge tone="info">{item.tone}</Badge>}
                            {item.platform && <Badge tone="default">{item.platform}</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.text}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item, ["text", "tone", "platform", "tags"])}><Edit className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCaption(item.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">No caption memories</div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "memory" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {renderSearchBar()}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">{t("common.all", "All")}</option>
                    {MEMORY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <Button size="sm" onClick={() => openCreate({ key: "", content: "", category: "prompt", pinned: false })}>
                  <Plus className="mr-2 size-4" />
                  {t("creativeMemory.addMemory", "Add Memory")}
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "key", label: "Key" },
                  { key: "content", label: "Content", multiline: true },
                  { key: "category", label: "Category", type: "select", options: MEMORY_CATEGORIES },
                ],
                () => handleSave("/api/memory", mutateMemory, ["key", "content", "category"])
              )}
              {filteredMemory.length > 0 ? (
                <div className="space-y-3">
                  {filteredMemory.map((entry: any) => (
                    <DashboardCard key={entry.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">{entry.key}</span>
                            <Badge tone="info">{entry.category}</Badge>
                            {entry.pinned && <Pin className="size-3 text-primary" />}
                            {entry.score != null && (
                              <Badge tone={entry.score >= 80 ? "success" : entry.score >= 50 ? "warning" : "default"}>
                                {entry.score}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{entry.content}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(entry, ["key", "content", "category"])}><Edit className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEntry(entry.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("creativeMemory.noMemory", "No memory entries yet")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ key: "", value: "", category: "", confidence: 0.5 })}>
                  <Plus className="mr-2 size-4" />
                  Add Preference
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "key", label: "Key" },
                  { key: "value", label: "Value" },
                  { key: "category", label: "Category" },
                ],
                () => handleSave("/api/memory/preferences", mutatePreferences, ["key", "value", "category"])
              )}
              {filteredPreferences.length > 0 ? (
                <div className="space-y-3">
                  {filteredPreferences.map((pref: any) => (
                    <DashboardCard key={pref.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <span className="font-medium text-sm">{pref.key}</span>
                              <p className="text-xs text-muted-foreground mt-0.5">{pref.value}</p>
                            </div>
                            {pref.confidence != null && (
                              <div className="text-right shrink-0">
                                <p className="text-xs text-muted-foreground">Confidence</p>
                                <p className="text-sm font-semibold">{Math.round(pref.confidence * 100)}%</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(pref, ["key", "value", "category"])}><Edit className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePreference(pref.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("creativeMemory.noPreferences", "No preferences inferred")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "workflow" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ name: "", steps: "", description: "", category: "" })}>
                  <Plus className="mr-2 size-4" />
                  Add Workflow Memory
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "name", label: "Name" },
                  { key: "steps", label: "Steps", multiline: true },
                  { key: "description", label: "Description", multiline: true },
                  { key: "category", label: "Category" },
                ],
                () => handleSave("/api/memory/workflow", mutateWorkflow, ["name", "steps", "description", "category"])
              )}
              {workflowItems.length > 0 ? (
                <div className="space-y-3">
                  {workflowItems.map((item: any) => (
                    <DashboardCard key={item.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Workflow className="size-4 text-violet-500" />
                            <span className="font-semibold text-sm">{item.name}</span>
                            {item.category && <Badge tone="info">{item.category}</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description || item.steps}</p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item, ["name", "steps", "description", "category"])}><Edit className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteWorkflow(item.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">No workflow memories</div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "publishing" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Publishing Settings</h3>
                <Button size="sm" onClick={() => {
                  openCreate({
                    platforms: publishingItem?.platforms ?? "",
                    bestTimes: publishingItem?.bestTimes ?? "",
                    hashtags: publishingItem?.hashtags ?? "",
                    notes: publishingItem?.notes ?? "",
                  });
                }}>
                  {publishingItem ? <><Edit className="mr-2 size-4" />Edit</> : <><Plus className="mr-2 size-4" />Configure</>}
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "platforms", label: "Platforms", multiline: true },
                  { key: "bestTimes", label: "Best Posting Times", multiline: true },
                  { key: "hashtags", label: "Hashtags Strategy", multiline: true },
                  { key: "notes", label: "Notes", multiline: true },
                ],
                () => handleSave("/api/memory/publishing", mutatePublishing, ["platforms", "bestTimes", "hashtags", "notes"])
              )}
              {publishingItem ? (
                <DashboardCard>
                  <div className="space-y-3">
                    {publishingItem.platforms && (
                      <div>
                        <p className="text-xs text-muted-foreground">Platforms</p>
                        <p className="text-sm mt-1">{publishingItem.platforms}</p>
                      </div>
                    )}
                    {publishingItem.bestTimes && (
                      <div>
                        <p className="text-xs text-muted-foreground">Best Posting Times</p>
                        <p className="text-sm mt-1">{publishingItem.bestTimes}</p>
                      </div>
                    )}
                    {publishingItem.hashtags && (
                      <div>
                        <p className="text-xs text-muted-foreground">Hashtags Strategy</p>
                        <p className="text-sm mt-1">{publishingItem.hashtags}</p>
                      </div>
                    )}
                    {publishingItem.notes && (
                      <div>
                        <p className="text-xs text-muted-foreground">Notes</p>
                        <p className="text-sm mt-1">{publishingItem.notes}</p>
                      </div>
                    )}
                  </div>
                </DashboardCard>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">No publishing memory configured</div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "generations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ prompt: "", moduleType: "", output: "", projectId: "", isFavorite: false })}>
                  <Plus className="mr-2 size-4" />
                  Add Generation Record
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "prompt", label: "Prompt", multiline: true },
                  { key: "moduleType", label: "Module Type", type: "select", options: ["image", "video", "text", "audio"] },
                  { key: "output", label: "Output URL" },
                  { key: "projectId", label: "Project ID" },
                ],
                () => handleSave("/api/memory/generation", mutateGenerations, ["prompt", "moduleType", "output", "projectId"])
              )}
              {generationItems.length > 0 ? (
                <div className="space-y-3">
                  {generationItems.map((item: any) => (
                    <DashboardCard key={item.id}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <History className="size-4 text-rose-500" />
                            <span className="font-medium text-sm">{item.moduleType}</span>
                            {item.isFavorite && <Star className="size-3 text-yellow-500 fill-yellow-500" />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.prompt}</p>
                          {item.projectId && <div className="mt-1"><Badge tone="info">{item.projectId}</Badge></div>}
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item, ["prompt", "moduleType", "output", "projectId"])}><Edit className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteGeneration(item.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">No generation history</div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "learning" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {renderSearchBar()}
                <Button size="sm" onClick={() => openCreate({ type: "", category: "", description: "", impact: "" })}>
                  <Plus className="mr-2 size-4" />
                  Add Learning Event
                </Button>
              </div>
              {showForm && renderForm(
                [
                  { key: "type", label: "Type" },
                  { key: "category", label: "Category" },
                  { key: "description", label: "Description", multiline: true },
                  { key: "impact", label: "Impact" },
                ],
                () => handleSave("/api/memory/learning", mutateLearning, ["type", "category", "description", "impact"])
              )}
              {filteredLearning.length > 0 ? (
                <div className="space-y-3">
                  {filteredLearning.map((event: any) => (
                    <DashboardCard key={event.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                            <GraduationCap className="size-4 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{event.type}</span>
                              <Badge tone="info">{event.category}</Badge>
                            </div>
                            {event.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{event.description}</p>
                            )}
                            {event.timestamp && (
                              <p className="text-xs text-muted-foreground mt-0.5">{event.timestamp}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(event, ["type", "category", "description", "impact"])}><Edit className="size-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteLearning(event.id)}><Trash2 className="size-3" /></Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              ) : (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("creativeMemory.noLearning", "No learning events recorded")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "insights" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <DashboardCard>
                  <p className="text-xs text-muted-foreground">Brand Consistency Score</p>
                  <p className="mt-2 text-3xl font-semibold">{insights?.brandConsistencyScore ?? 0}%</p>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted/40">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(insights?.brandConsistencyScore ?? 0, 100)}%` }}
                    />
                  </div>
                </DashboardCard>
                <DashboardCard>
                  <p className="text-xs text-muted-foreground">Most Used Style</p>
                  <p className="mt-2 text-lg font-semibold">{insights?.mostUsedStyle ?? "-"}</p>
                </DashboardCard>
                <DashboardCard>
                  <p className="text-xs text-muted-foreground">Favorite Prompt</p>
                  <p className="mt-2 text-sm truncate">{insights?.favoritePrompt ?? "-"}</p>
                </DashboardCard>
              </div>

              {insights?.topStyles && insights.topStyles.length > 0 && (
                <DashboardCard title="Most Used Styles">
                  <div className="space-y-2">
                    {insights.topStyles.map((style: any, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                        <div className="flex items-center gap-2">
                          <Wand2 className="size-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{style.name ?? style}</span>
                        </div>
                        {style.count != null && (
                          <Badge tone="info">{style.count} uses</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </DashboardCard>
              )}

              {insights?.topPrompts && insights.topPrompts.length > 0 && (
                <DashboardCard title="Favorite Prompts">
                  <div className="space-y-2">
                    {insights.topPrompts.map((prompt: any, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <Star className="size-4 text-yellow-500 shrink-0" />
                          <span className="text-sm truncate">{prompt.text ?? prompt}</span>
                        </div>
                        {prompt.count != null && (
                          <Badge tone="info">{prompt.count} uses</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </DashboardCard>
              )}

              {!insights?.topStyles && !insights?.topPrompts && (
                <DashboardCard>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("common.noData", "No data available")}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
