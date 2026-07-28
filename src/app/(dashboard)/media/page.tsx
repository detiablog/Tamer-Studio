"use client";

import * as React from "react";
import useSWR from "swr";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { ActionButton } from "@/components/ui/ActionButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { MediaUpload } from "@/components/media/MediaUpload";
import { ImageIcon, Film, Music, FileText, Search, Filter, Trash2, Download } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

const KIND_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon className="size-6 text-muted-foreground" />,
  video: <Film className="size-6 text-muted-foreground" />,
  audio: <Music className="size-6 text-muted-foreground" />,
  document: <FileText className="size-6 text-muted-foreground" />,
  archive: <FileText className="size-6 text-muted-foreground" />,
  custom: <FileText className="size-6 text-muted-foreground" />,
};

export default function MediaPage() {
  const { t } = useLocalizationContext();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [showUpload, setShowUpload] = React.useState(false);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/media?page=${page}&limit=20`,
    fetcher
  );

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const filteredItems = React.useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item: any) =>
        item.filename.toLowerCase().includes(q) ||
        item.kind.toLowerCase().includes(q) ||
        item.mimeType.toLowerCase().includes(q)
    );
  }, [items, search]);

  const stats = React.useMemo(() => {
    const total = items.length;
    const images = items.filter((i: any) => i.kind === "image").length;
    const videos = items.filter((i: any) => i.kind === "video").length;
    const audios = items.filter((i: any) => i.kind === "audio").length;
    const totalSize = items.reduce((sum: number, i: any) => sum + (i.sizeBytes || 0), 0);
    return { total, images, videos, audios, totalSize };
  }, [items]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/media", { method: "POST", body: formData });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message || "Upload failed");
    }
    mutate();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) mutate();
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (item: any) => {
    try {
      const res = await fetch(`/api/media/${item.id}`);
      const json = await res.json();
      if (json.data?.storageKey) {
        window.open(`/api/media/${item.id}`, "_blank");
      }
    } catch {
      // fallback: just open the page
    }
  };

  return (
    <AppShell>
      <PageLayout
        title={t("dashboard.mediaLibrary")}
        description={t("dashboard.mediaLibraryDesc")}
        breadcrumb={[{ label: t("dashboard.media") }]}
        actions={
          <ActionButton onClick={() => setShowUpload(!showUpload)}>
            {showUpload ? t("common.close", "Close") : t("dashboard.uploadMedia")}
          </ActionButton>
        }
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t("media.totalAssets", "Total Assets")}
              value={stats.total}
              delta={t("dashboard.delta.thisWeek", "+6 this week")}
            />
            <StatCard
              title={t("media.images", "Images")}
              value={stats.images}
              delta={t("media.imagesAvg", "12 MB avg")}
            />
            <StatCard
              title={t("media.videos", "Videos")}
              value={stats.videos}
              delta={t("media.videosAvg", "45 MB avg")}
            />
            <StatCard
              title={t("media.audio", "Audio")}
              value={stats.audios}
              delta={formatSize(stats.totalSize)}
            />
          </div>

          {showUpload && (
            <DashboardCard title={t("media.uploadTitle", "Upload Media")} description={t("media.uploadDesc", "Upload files to your media library")}>
              <MediaUpload onUpload={handleUpload} />
            </DashboardCard>
          )}

          <DashboardCard
            title={t("dashboard.mediaLibrary")}
            description={t("media.browseAndManage", "Browse and manage your media assets")}
          >
            <div className="flex items-center gap-2 pb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("media.searchPlaceholder", "Search media...")}
                  aria-label={t("media.searchAria", "Search media")}
                  className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 size-4" />
                {t("common.filter")}
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
                {t("common.loading")}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-8 text-sm text-destructive">
                {t("media.failedToLoad", "Failed to load media")}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <ImageIcon className="mb-3 size-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {search
                    ? t("media.noResults", "No media matches your search")
                    : t("media.empty", "No media uploaded yet")}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowUpload(true)}
                >
                  {t("dashboard.uploadMedia")}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-muted/20 p-4 transition hover:border-foreground/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/40">
                        {KIND_ICONS[item.kind] ?? KIND_ICONS.custom}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.filename}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatSize(item.sizeBytes)} • {timeAgo(item.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge
                        tone={
                          item.kind === "image"
                            ? "info"
                            : item.kind === "video"
                              ? "warning"
                              : item.kind === "audio"
                                ? "success"
                                : "muted"
                        }
                      >
                        {item.kind}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDownload(item)}
                        >
                          <Download className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          disabled={deleting === item.id}
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {t("media.showingCount", "Showing {0} of {1} assets")
                    .replace("{0}", String(filteredItems.length))
                    .replace("{1}", String(pagination.total))}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    {t("common.previous")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </div>
            )}
          </DashboardCard>
        </div>
      </PageLayout>
    </AppShell>
  );
}
