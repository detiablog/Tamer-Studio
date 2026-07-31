"use client";

import * as React from "react";
import useSWR from "swr";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { ImageIcon, Film, FileText, Search, Trash2, Download, Eye, HardDrive, Heart, Folder, Archive, CheckSquare } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
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
  document: <FileText className="size-6 text-muted-foreground" />,
};

const KIND_FILTERS = [
  { value: "", label: "All" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "document", label: "Documents" },
];

const SORT_OPTIONS = [
  { value: "newest", labelKey: "assetsManagement.sortNewest" },
  { value: "oldest", labelKey: "assetsManagement.sortOldest" },
  { value: "name", labelKey: "assetsManagement.sortName" },
  { value: "size", labelKey: "assetsManagement.sortSize" },
];

type ActiveTab = "all" | "favorites" | "collections";

export default function AssetsPageClient() {
  const { t } = useLocalizationContext();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [kindFilter, setKindFilter] = React.useState("");
  const [deleting, setDeleting] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("all");
  const [sortBy, setSortBy] = React.useState("newest");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = React.useState(false);

  const apiUrl = `/api/user/assets?page=${page}&limit=20${kindFilter ? `&kind=${kindFilter}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}${sortBy ? `&sort=${sortBy}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR(apiUrl, fetcher);

  const favoritesUrl = activeTab === "favorites" ? "/api/user/assets/favorites" : null;
  const collectionsUrl = activeTab === "collections" ? "/api/user/assets/collections" : null;

  const { data: favoritesData } = useSWR(favoritesUrl, fetcher);
  const { data: collectionsData } = useSWR(collectionsUrl, fetcher);

  const items = React.useMemo(() => {
    if (activeTab === "favorites") return favoritesData?.data ?? [];
    if (activeTab === "collections") return collectionsData?.data ?? [];
    return data?.data ?? [];
  }, [activeTab, favoritesData, collectionsData, data]);

  const pagination = data?.pagination;

  const storageUrl = "/api/user/storage";
  const { data: storageData } = useSWR(storageUrl, fetcher);
  const storage = storageData?.data;

  const stats = React.useMemo(() => {
    const total = pagination?.total ?? items.length;
    const images = items.filter((i: any) => i.kind === "image").length;
    const videos = items.filter((i: any) => i.kind === "video").length;
    const docs = items.filter((i: any) => i.kind === "document").length;
    return { total, images, videos, docs };
  }, [items, pagination]);

  const handleDelete = async (assetId: string) => {
    setDeleting(assetId);
    try {
      const res = await fetch(`/api/media/${assetId}`, { method: "DELETE" });
      if (res.ok) mutate();
    } finally {
      setDeleting(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/user/assets/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        mutate();
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/user/assets/bulk-archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        setSelectedIds(new Set());
        mutate();
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i: any) => i.assetId)));
    }
  };

  const tabs = [
    { id: "all" as ActiveTab, label: t("assetsManagement.allAssets", "All Assets"), icon: ImageIcon },
    { id: "favorites" as ActiveTab, label: t("assetsManagement.favorites", "Favorites"), icon: Heart },
    { id: "collections" as ActiveTab, label: t("assetsManagement.collections", "Collections"), icon: Folder },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("assets.title", "Assets")}</h1>
          <p className="text-muted-foreground mt-1">{t("assets.description", "Manage your digital assets")}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("assets.totalAssets", "Total Assets")}
          value={stats.total}
        />
        <StatCard
          title={t("assets.images", "Images")}
          value={stats.images}
        />
        <StatCard
          title={t("assets.videos", "Videos")}
          value={stats.videos}
        />
        <StatCard
          title={t("assets.documents", "Documents")}
          value={stats.docs}
        />
      </div>

      {storage && (
        <DashboardCard title={t("assets.storageUsage", "Storage Usage")}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="size-4 text-muted-foreground" />
                <span className="text-sm">{formatSize(parseInt(storage.totalUsed, 10) || 0)} / {formatSize(parseInt(storage.limitBytes, 10) || 1073741824)}</span>
              </div>
              <span className="text-sm font-medium">{storage.usagePercent}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, storage.usagePercent)}%` }}
              />
            </div>
          </div>
        </DashboardCard>
      )}

      <DashboardCard title={t("assets.library", "Asset Library")} description={t("assets.browseAndManage", "Browse and manage your assets")}>
        <div className="flex items-center gap-1 border-b border-border mb-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                onClick={() => { setActiveTab(tab.id); setPage(1); setSelectedIds(new Set()); }}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "all" && (
          <div className="flex items-center gap-2 pb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("assets.searchPlaceholder", "Search assets...")}
                className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
            <div className="flex gap-1">
              {KIND_FILTERS.map((f) => (
                <Button
                  key={f.value}
                  variant={kindFilter === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setKindFilter(f.value); setPage(1); }}
                >
                  {f.label}
                </Button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{t(opt.labelKey, opt.value)}</option>
              ))}
            </select>
          </div>
        )}

        {activeTab !== "all" && (
          <div className="flex items-center gap-2 pb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("assets.searchPlaceholder", "Search assets...")}
                className="w-full rounded-lg border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </div>
          </div>
        )}

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/50">
            <CheckSquare className="size-4 text-primary" />
            <span className="text-sm font-medium">
              {t("assetsManagement.selectedAssets", "{count} assets selected").replace("{count}", String(selectedIds.size))}
            </span>
            <Button variant="outline" size="sm" disabled={bulkDeleting} onClick={handleBulkArchive}>
              <Archive className="mr-1.5 size-3.5" />
              {t("assetsManagement.archived", "Archived")}
            </Button>
            <Button variant="outline" size="sm" disabled={bulkDeleting} onClick={handleBulkDelete}>
              <Trash2 className="mr-1.5 size-3.5" />
              {t("common.delete", "Delete")}
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">{t("common.loading")}</div>
        ) : error ? (
          <div className="flex items-center justify-center p-8 text-sm text-destructive">{t("assets.failedToLoad", "Failed to load assets")}</div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ImageIcon className="mb-3 size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {activeTab === "favorites"
                ? t("assetsManagement.noFavorites", "No favorite assets yet")
                : activeTab === "collections"
                  ? t("assetsManagement.noCollections", "No collections yet")
                  : search || kindFilter
                    ? t("assets.noResults", "No assets match your filters")
                    : t("assets.empty", "No assets yet")}
            </p>
          </div>
        ) : activeTab === "collections" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((collection: any) => (
              <div key={collection.id} className="rounded-xl border border-border bg-muted/20 p-4 transition hover:border-foreground/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/40">
                    <Folder className="size-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{collection.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {collection.assetCount ?? 0} {t("assets.totalAssets", "assets")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item: any) => {
              const meta = (item.metadata || {}) as Record<string, unknown>;
              const sizeBytes = typeof meta.sizeBytes === "number" ? meta.sizeBytes : 0;
              const filename = (item.metadata?.filename as string) || (item.metadata?.name as string) || item.assetId;
              const tags = (item.tags as string[]) ?? [];
              const downloadCount = (item.downloadCount as number) ?? 0;
              return (
                <div key={item.assetId} className="rounded-xl border border-border bg-muted/20 p-4 transition hover:border-foreground/10">
                  <div className="flex items-start gap-3">
                    {activeTab === "all" && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.assetId)}
                        onChange={() => toggleSelect(item.assetId)}
                        className="mt-1 size-4 rounded border-border"
                      />
                    )}
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/40">
                      {KIND_ICONS[item.kind] ?? KIND_ICONS.document}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{filename}</h4>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(sizeBytes)} &bull; {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <Badge tone={item.kind === "image" ? "info" : item.kind === "video" ? "warning" : "muted"}>
                      {item.kind}
                    </Badge>
                    {tags.length > 0 && tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} tone="muted">{tag}</Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Download className="size-3" />
                      <span>{downloadCount}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm">
                        <Eye className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        <Download className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={deleting === item.assetId}
                        onClick={() => handleDelete(item.assetId)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "all" && pagination && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("assets.showingCount", "Showing {0} of {1} assets")
                .replace("{0}", String(items.length))
                .replace("{1}", String(pagination.total))}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                {t("common.previous")}
              </Button>
              <Button variant="ghost" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                {t("common.next")}
              </Button>
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
