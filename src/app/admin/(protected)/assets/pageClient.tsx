"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Loader, Trash2, Eye, Archive, Download, HardDrive, ImageIcon, Film, FileText } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

const KIND_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon className="size-4" />,
  video: <Film className="size-4" />,
  document: <FileText className="size-4" />,
};

export function AssetsAdminPageClient() {
  const { t } = useLocalizationContext();
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [kindFilter, setKindFilter] = React.useState<string>("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = React.useState(false);

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (kindFilter) params.set("kind", kindFilter);
  if (statusFilter) params.set("status", statusFilter);
  if (search) params.set("search", search);

  const { data, error, isLoading, mutate } = useSWR(`/api/assets?${params.toString()}`, fetcher);

  const items = data?.data ?? [];
  const pagination = data?.pagination;

  const stats = React.useMemo(() => {
    const allItems = data?.allData ?? items;
    const total = pagination?.total ?? allItems.length;
    const active = allItems.filter((i: any) => i.status === "active").length;
    const images = allItems.filter((i: any) => i.kind === "image").length;
    const videos = allItems.filter((i: any) => i.kind === "video").length;
    const totalDownloads = allItems.reduce((sum: number, i: any) => sum + (i.downloadCount ?? 0), 0);
    const totalSize = allItems.reduce((sum: number, i: any) => {
      const meta = (i.metadata || {}) as Record<string, unknown>;
      return sum + (typeof meta.sizeBytes === "number" ? meta.sizeBytes : 0);
    }, 0);
    return { total, active, images, videos, totalDownloads, totalSize };
  }, [items, data, pagination]);

  const handleDelete = async (assetId: string) => {
    try {
      const res = await fetch(`/api/media/${assetId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Success"));
        mutate();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleArchive = async (assetId: string) => {
    try {
      const res = await fetch(`/api/assets/${assetId}/archive`, { method: "POST" });
      if (res.ok) {
        toast.success(t("common.success", "Success"));
        mutate();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleBulkAction = async (action: "delete" | "archive") => {
    if (selectedIds.size === 0) return;
    setBulkActionLoading(true);
    try {
      const endpoint = action === "delete" ? "/api/assets/bulk-delete" : "/api/assets/bulk-archive";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        toast.success(t("common.success", "Success"));
        setSelectedIds(new Set());
        mutate();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    } finally {
      setBulkActionLoading(false);
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

  const columns = [
    {
      key: "select",
      header: "",
      width: "40px",
      render: (item: any) => (
        <input
          type="checkbox"
          checked={selectedIds.has(item.assetId)}
          onChange={() => toggleSelect(item.assetId)}
          className="size-4 rounded border-border"
        />
      ),
    },
    {
      key: "assetId",
      header: "ID",
      render: (item: any) => (
        <span className="font-mono text-xs text-muted-foreground">{item.assetId?.slice(0, 8)}...</span>
      ),
    },
    {
      key: "kind",
      header: t("admin.assetKind", "Kind"),
      render: (item: any) => (
        <div className="flex items-center gap-2">
          {KIND_ICONS[item.kind] ?? <FileText className="size-4" />}
          <span className="text-sm capitalize">{item.kind}</span>
        </div>
      ),
    },
    {
      key: "owner",
      header: t("admin.assetOwner", "Owner"),
      render: (item: any) => (
        <span className="text-sm">{item.userId ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: t("common.status", "Status"),
      align: "center" as const,
      render: (item: any) => (
        <Badge tone={item.status === "active" ? "success" : item.status === "archived" ? "warning" : "muted"}>
          {item.status ?? "active"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: t("admin.assetCreated", "Created"),
      render: (item: any) => (
        <span className="text-sm">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</span>
      ),
    },
    {
      key: "size",
      header: t("admin.assetSize", "Size"),
      render: (item: any) => {
        const meta = (item.metadata || {}) as Record<string, unknown>;
        const sizeBytes = typeof meta.sizeBytes === "number" ? meta.sizeBytes : 0;
        return <span className="text-sm">{formatSize(sizeBytes)}</span>;
      },
    },
    {
      key: "actions",
      header: "",
      align: "right" as const,
      render: (item: any) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => window.open(`/media/${item.assetId}`, "_blank")}>
            <Eye className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={() => handleArchive(item.assetId)}>
            <Archive className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={() => handleDelete(item.assetId)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.assets", "Assets") }]} />

      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("admin.assetsManagement", "Asset Management")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.assetsDescription", "Manage all AI-generated assets")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">{t("admin.totalAssets", "Total Assets")}</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-xs text-muted-foreground mb-1">{t("admin.activeAssets", "Active Assets")}</p>
            <p className="text-2xl font-bold">{stats.active}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ImageIcon className="size-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t("assets.images", "Images")}</p>
            </div>
            <p className="text-2xl font-bold">{stats.images}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Film className="size-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t("assets.videos", "Videos")}</p>
            </div>
            <p className="text-2xl font-bold">{stats.videos}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Download className="size-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t("admin.totalDownloads", "Total Downloads")}</p>
            </div>
            <p className="text-2xl font-bold">{stats.totalDownloads}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <HardDrive className="size-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{t("admin.storageUsed", "Storage Used")}</p>
            </div>
            <p className="text-2xl font-bold">{formatSize(stats.totalSize)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pb-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder={t("common.search", "Search") + "..."}
              className="pl-9"
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setFilterOpen(!filterOpen)}>
              <Filter className="mr-2 size-4" />
              {t("common.filter", "Filter")}
            </Button>
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t("admin.assetKind", "Kind")}</label>
                    <select
                      value={kindFilter}
                      onChange={(e) => { setKindFilter(e.target.value); setPage(1); }}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">{t("admin.status", "All")}</option>
                      <option value="image">{t("assets.images", "Images")}</option>
                      <option value="video">{t("assets.videos", "Videos")}</option>
                      <option value="document">{t("assets.documents", "Documents")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">{t("common.status", "Status")}</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">{t("admin.status", "All")}</option>
                      <option value="active">{t("admin.active", "Active")}</option>
                      <option value="archived">{t("admin.archived", "Archived")}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-muted/50">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Button
              variant="outline"
              size="sm"
              disabled={bulkActionLoading}
              onClick={() => handleBulkAction("delete")}
            >
              <Trash2 className="mr-1.5 size-3.5" />
              {t("admin.bulkDelete", "Bulk Delete")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={bulkActionLoading}
              onClick={() => handleBulkAction("archive")}
            >
              <Archive className="mr-1.5 size-3.5" />
              {t("admin.bulkArchive", "Bulk Archive")}
            </Button>
          </div>
        )}

        {isLoading && items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <AdminDataTable
            data={items}
            keyExtractor={(item: any) => item.assetId}
            columns={columns}
          />
        )}

        {pagination && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("adminDataTable.showing", "Showing {0}–{1} of {2}")
                .replace("{0}", String((page - 1) * 20 + 1))
                .replace("{1}", String(Math.min(page * 20, pagination.total)))
                .replace("{2}", String(pagination.total))}
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                {t("common.previous", "Previous")}
              </Button>
              <Button variant="ghost" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                {t("common.next", "Next")}
              </Button>
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
