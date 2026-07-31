"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HardDrive,
  ImageIcon,
  Film,
  FileText,
  AlertTriangle,
  Trash2,
  Upload,
  FolderPlus,
  Grid3X3,
  List,
  Search,
  Clock,
  TrendingUp,
} from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { MediaUpload } from "@/components/media/MediaUpload";
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

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function StoragePageClient() {
  const { t } = useLocalizationContext();
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("list");
  const [search, setSearch] = React.useState("");
  const [kindFilter, setKindFilter] = React.useState<string>("");
  const [showUpload, setShowUpload] = React.useState(false);
  const [folderName, setFolderName] = React.useState("");
  const [showNewFolder, setShowNewFolder] = React.useState(false);

  const { data: statsData, isLoading: statsLoading } = useSWR("/api/storage/stats", fetcher);
  const storageParams = new URLSearchParams({ limit: "50" });
  if (search) storageParams.set("search", search);
  if (kindFilter) storageParams.set("kind", kindFilter);
  const { data: filesData, isLoading: filesLoading, mutate: mutateFiles } = useSWR(
    `/api/storage?${storageParams.toString()}`,
    fetcher
  );
  const { data: foldersData, mutate: mutateFolders } = useSWR("/api/storage/folders", fetcher);

  const stats = statsData?.data;
  const files = filesData?.data ?? [];
  const folders = foldersData?.data ?? [];

  const usedBytes = stats?.totalUsed ?? 0;
  const limitBytes = stats?.limitBytes ?? 1073741824;
  const usagePercent = stats?.usagePercent ?? 0;

  const breakdown = React.useMemo(() => {
    const images = files.filter((f: any) => f.kind === "image");
    const videos = files.filter((f: any) => f.kind === "video");
    const documents = files.filter((f: any) => f.kind === "document");
    return {
      images: { count: images.length, totalSize: images.reduce((s: number, f: any) => s + (f.sizeBytes ?? 0), 0) },
      videos: { count: videos.length, totalSize: videos.reduce((s: number, f: any) => s + (f.sizeBytes ?? 0), 0) },
      documents: { count: documents.length, totalSize: documents.reduce((s: number, f: any) => s + (f.sizeBytes ?? 0), 0) },
    };
  }, [files]);

  const largestFiles = React.useMemo(
    () => [...files].sort((a: any, b: any) => (b.sizeBytes ?? 0) - (a.sizeBytes ?? 0)).slice(0, 5),
    [files]
  );

  const expiringFiles = React.useMemo(
    () =>
      files
        .filter((f: any) => f.expiresAt && new Date(f.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000)
        .slice(0, 5),
    [files]
  );

  const handleDelete = async (fileId: string) => {
    if (!window.confirm(t("storage.deleteConfirm", "Are you sure you want to delete this file?"))) return;
    try {
      const res = await fetch(`/api/storage/${fileId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Success"));
        mutateFiles();
        mutateFolders();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    try {
      const res = await fetch("/api/storage/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName.trim() }),
      });
      if (res.ok) {
        toast.success(t("common.success", "Success"));
        setFolderName("");
        setShowNewFolder(false);
        mutateFolders();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const res = await fetch(`/api/storage/folders/${folderId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("common.success", "Success"));
        mutateFolders();
      }
    } catch {
      toast.error(t("common.error", "Error"));
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/storage/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Upload failed");
    mutateFiles();
    mutateFolders();
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">{t("common.loading", "Loading...")}</div>
    );
  }

  const isNearLimit = usagePercent > 80;
  const isOverLimit = usagePercent > 95;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">{t("storage.title", "Storage")}</h1>
          <p className="text-muted-foreground mt-1">{t("storage.description", "Manage your files and storage")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowNewFolder(true)}>
            <FolderPlus className="mr-1.5 size-3.5" />
            {t("storage.createFolder", "Create Folder")}
          </Button>
          <Button size="sm" onClick={() => setShowUpload(!showUpload)}>
            <Upload className="mr-1.5 size-3.5" />
            {t("storage.uploadFiles", "Upload Files")}
          </Button>
        </div>
      </div>

      {isOverLimit && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center gap-3">
          <AlertTriangle className="size-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive">{t("storage.storageFull", "Storage is full. Please upgrade or delete files.")}</p>
        </div>
      )}

      {isNearLimit && !isOverLimit && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-center gap-3">
          <AlertTriangle className="size-5 text-yellow-500 shrink-0" />
          <p className="text-sm text-yellow-600">{t("storage.storageWarning", "Storage usage is above 80%")}</p>
        </div>
      )}

      {showUpload && (
        <DashboardCard title={t("storage.uploadFiles", "Upload Files")}>
          <MediaUpload onUpload={handleUpload} />
        </DashboardCard>
      )}

      {showNewFolder && (
        <DashboardCard title={t("storage.createFolder", "Create Folder")}>
          <div className="flex items-center gap-2">
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder={t("storage.folderName", "Folder Name")}
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <Button size="sm" onClick={handleCreateFolder}>{t("common.create", "Create")}</Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowNewFolder(false); setFolderName(""); }}>
              {t("common.cancel", "Cancel")}
            </Button>
          </div>
        </DashboardCard>
      )}

      <DashboardCard title={t("storage.title", "Storage")}>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <HardDrive className="size-7 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatSize(usedBytes)}</span>
                <span className="text-sm text-muted-foreground">/ {formatSize(limitBytes)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{usagePercent}%</p>
            </div>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isOverLimit ? "bg-destructive" : isNearLimit ? "bg-yellow-500" : "bg-primary"}`}
              style={{ width: `${Math.min(100, usagePercent)}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t("storage.usedStorage", "Used Storage")}</p>
              <p className="font-medium">{formatSize(usedBytes)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("storage.availableStorage", "Available Storage")}</p>
              <p className="font-medium">{formatSize(Math.max(0, limitBytes - usedBytes))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t("storage.totalStorage", "Total Storage")}</p>
              <p className="font-medium">{formatSize(limitBytes)}</p>
            </div>
          </div>
        </div>
      </DashboardCard>

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardCard title={t("storage.imageFiles", "Images")}>
          <div className="flex items-center gap-3">
            <ImageIcon className="size-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{breakdown.images.count}</p>
              <p className="text-xs text-muted-foreground">{formatSize(breakdown.images.totalSize)}</p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard title={t("storage.videoFiles", "Videos")}>
          <div className="flex items-center gap-3">
            <Film className="size-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{breakdown.videos.count}</p>
              <p className="text-xs text-muted-foreground">{formatSize(breakdown.videos.totalSize)}</p>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard title={t("storage.documentFiles", "Documents")}>
          <div className="flex items-center gap-3">
            <FileText className="size-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{breakdown.documents.count}</p>
              <p className="text-xs text-muted-foreground">{formatSize(breakdown.documents.totalSize)}</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {stats?.monthlyGrowth && (
        <DashboardCard title={t("storage.analytics", "Analytics")}>
          <div className="flex items-center gap-3">
            <TrendingUp className="size-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t("storage.monthlyGrowth", "Monthly Growth")}</p>
              <p className="font-medium">{stats.monthlyGrowth}</p>
            </div>
          </div>
        </DashboardCard>
      )}

      {largestFiles.length > 0 && (
        <DashboardCard title={t("storage.largestFiles", "Largest Files")}>
          <div className="space-y-3">
            {largestFiles.map((file: any) => (
              <div key={file.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                    {file.kind === "image" ? (
                      <ImageIcon className="size-5 text-blue-500" />
                    ) : file.kind === "video" ? (
                      <Film className="size-5 text-purple-500" />
                    ) : (
                      <FileText className="size-5 text-orange-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name ?? file.filename}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(file.sizeBytes ?? 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(file.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      {expiringFiles.length > 0 && (
        <DashboardCard title={t("storage.expiringFiles", "Files Near Expiry")}>
          <div className="space-y-3">
            {expiringFiles.map((file: any) => (
              <div key={file.id} className="flex items-center justify-between rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                <div className="flex items-center gap-3">
                  <Clock className="size-5 text-yellow-500" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name ?? file.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("storage.expiresAt", "Expires")}: {new Date(file.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(file.id)}>
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </DashboardCard>
      )}

      <DashboardCard title={t("storage.allFiles", "All Files")}>
        <div className="flex items-center gap-2 pb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("storage.searchFiles", "Search files...")}
              className="pl-9"
            />
          </div>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">{t("common.all", "All")}</option>
            <option value="image">{t("storage.imageFiles", "Images")}</option>
            <option value="video">{t("storage.videoFiles", "Videos")}</option>
            <option value="document">{t("storage.documentFiles", "Documents")}</option>
          </select>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-muted" : ""}`}
            >
              <Grid3X3 className="size-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-muted" : ""}`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>

        {filesLoading && files.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
            {t("common.loading", "Loading...")}
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <HardDrive className="size-8 mb-2" />
            <p className="text-sm">{t("storage.noFiles", "No files yet")}</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file: any) => (
              <div key={file.id} className="group rounded-xl border border-border bg-muted/20 p-3 relative">
                <div className="aspect-square rounded-lg bg-muted/40 flex items-center justify-center mb-2">
                  {file.kind === "image" ? (
                    <ImageIcon className="size-8 text-blue-500" />
                  ) : file.kind === "video" ? (
                    <Film className="size-8 text-purple-500" />
                  ) : (
                    <FileText className="size-8 text-orange-500" />
                  )}
                </div>
                <p className="text-sm font-medium truncate">{file.name ?? file.filename}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.sizeBytes ?? 0)}</p>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file: any) => (
              <div key={file.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                    {file.kind === "image" ? (
                      <ImageIcon className="size-5 text-blue-500" />
                    ) : file.kind === "video" ? (
                      <Film className="size-5 text-purple-500" />
                    ) : (
                      <FileText className="size-5 text-orange-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{file.name ?? file.filename}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(file.sizeBytes ?? 0)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{file.kind}</Badge>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(file.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
