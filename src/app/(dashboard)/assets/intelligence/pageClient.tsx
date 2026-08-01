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
  BarChart3,
  Brain,
  FolderTree,
  GitBranch,
  Hash,
  Image,
  LayoutDashboard,
  Library,
  Link,
  Loader,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Tag,
  Trash2,
  X,
  Zap,
  FileText,
  Film,
  AlertTriangle,
  CheckCircle,
  Copy,
  Folder,
  ArrowRight,
  Download,
  Eye,
  Sparkles,
  TrendingUp,
  Star,
  Layers,
  Users,
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

type TabKey = "dashboard" | "library" | "tags" | "collections" | "categories" | "duplicates" | "quality" | "relationships" | "search" | "analytics";

const TABS: { key: TabKey; labelKey: string; icon: React.ElementType }[] = [
  { key: "dashboard", labelKey: "assetIntelligence.dashboard", icon: LayoutDashboard },
  { key: "library", labelKey: "assetIntelligence.library", icon: Library },
  { key: "tags", labelKey: "assetIntelligence.tags", icon: Tag },
  { key: "collections", labelKey: "assetIntelligence.collections", icon: Folder },
  { key: "categories", labelKey: "assetIntelligence.categories", icon: FolderTree },
  { key: "duplicates", labelKey: "assetIntelligence.duplicates", icon: Copy },
  { key: "quality", labelKey: "assetIntelligence.quality", icon: Star },
  { key: "relationships", labelKey: "assetIntelligence.relationships", icon: GitBranch },
  { key: "search", labelKey: "assetIntelligence.search", icon: Search },
  { key: "analytics", labelKey: "assetIntelligence.analytics", icon: BarChart3 },
];

type AssetMeta = {
  id: string;
  assetId: string;
  name?: string;
  filename?: string;
  kind?: string;
  type?: string;
  mimeType?: string;
  sizeBytes?: number;
  tags?: string[];
  categories?: string[];
  qualityScore?: number;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

type TagItem = {
  id: string;
  name: string;
  color?: string;
  auto?: boolean;
  count?: number;
  createdAt?: string;
};

type CategoryItem = {
  id: string;
  name: string;
  parentId?: string;
  slug?: string;
  description?: string;
  icon?: string;
  assetCount?: number;
  children?: CategoryItem[];
  createdAt?: string;
};

type CollectionItem = {
  id: string;
  name: string;
  description?: string;
  assetCount?: number;
  assets?: AssetMeta[];
  createdAt?: string;
  updatedAt?: string;
};

type DuplicateGroup = {
  id: string;
  assets: AssetMeta[];
  similarity?: number;
  status?: string;
  createdAt?: string;
};

type QualityItem = {
  id: string;
  assetId: string;
  score: number;
  breakdown?: Record<string, number>;
  details?: string;
  asset?: AssetMeta;
  createdAt?: string;
};

type RelationshipItem = {
  id: string;
  sourceAssetId: string;
  targetAssetId: string;
  type: string;
  metadata?: Record<string, unknown>;
  sourceAsset?: AssetMeta;
  targetAsset?: AssetMeta;
  createdAt?: string;
};

type RecommendationItem = {
  id: string;
  type: string;
  title: string;
  description?: string;
  assetId?: string;
  priority?: string;
};

type StatsData = {
  totalAssets?: number;
  totalTags?: number;
  totalCollections?: number;
  totalCategories?: number;
  duplicateGroups?: number;
  avgQualityScore?: number;
  assetsByType?: { type: string; count: number }[];
  recentActivity?: { action: string; count: number }[];
  qualityDistribution?: { range: string; count: number }[];
};

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

function qualityColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 60) return "text-amber-500";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function qualityBadgeTone(score: number): "success" | "warning" | "default" {
  if (score >= 80) return "success";
  if (score >= 60) return "warning";
  return "default";
}

const KIND_ICONS: Record<string, React.ReactNode> = {
  image: <Image className="size-4" />,
  video: <Film className="size-4" />,
  document: <FileText className="size-4" />,
};

export function AssetIntelligencePageClient() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabKey>("dashboard");
  const [search, setSearch] = React.useState("");
  const [tagSearch, setTagSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [qualityFilter, setQualityFilter] = React.useState("");
  const [relationshipTypeFilter, setRelationshipTypeFilter] = React.useState("");
  const [selectedCollection, setSelectedCollection] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  const [newTagName, setNewTagName] = React.useState("");
  const [newTagColor, setNewTagColor] = React.useState("#6366f1");
  const [editingTag, setEditingTag] = React.useState<TagItem | null>(null);

  const [newCollectionName, setNewCollectionName] = React.useState("");
  const [newCollectionDesc, setNewCollectionDesc] = React.useState("");
  const [editingCollection, setEditingCollection] = React.useState<CollectionItem | null>(null);
  const [showCollectionForm, setShowCollectionForm] = React.useState(false);
  const [addAssetToCollection, setAddAssetToCollection] = React.useState("");
  const [removeAssetFromCollection, setRemoveAssetFromCollection] = React.useState("");

  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [newCategoryParent, setNewCategoryParent] = React.useState("");
  const [newCategoryDesc, setNewCategoryDesc] = React.useState("");
  const [editingCategory, setEditingCategory] = React.useState<CategoryItem | null>(null);

  const [newRelSource, setNewRelSource] = React.useState("");
  const [newRelTarget, setNewRelTarget] = React.useState("");
  const [newRelType, setNewRelType] = React.useState("");

  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchTypeFilter, setSearchTypeFilter] = React.useState("");
  const [searchTagFilter, setSearchTagFilter] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<AssetMeta[]>([]);

  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

  const { data: statsData, isLoading: statsLoading, mutate: mutateStats } = useSWR("/api/asset-intelligence/stats", fetcher, { revalidateOnFocus: false });
  const { data: metadataData, isLoading: metadataLoading, mutate: mutateMetadata } = useSWR("/api/asset-intelligence/metadata", fetcher, { revalidateOnFocus: false });
  const { data: tagsData, isLoading: tagsLoading, mutate: mutateTags } = useSWR("/api/asset-intelligence/tags", fetcher, { revalidateOnFocus: false });
  const { data: collectionsData, isLoading: collectionsLoading, mutate: mutateCollections } = useSWR("/api/asset-intelligence/collections", fetcher, { revalidateOnFocus: false });
  const { data: categoriesData, isLoading: categoriesLoading, mutate: mutateCategories } = useSWR("/api/asset-intelligence/categories", fetcher, { revalidateOnFocus: false });
  const { data: duplicatesData, isLoading: duplicatesLoading, mutate: mutateDuplicates } = useSWR("/api/asset-intelligence/duplicates", fetcher, { revalidateOnFocus: false });
  const { data: qualityData, isLoading: qualityLoading, mutate: mutateQuality } = useSWR("/api/asset-intelligence/quality", fetcher, { revalidateOnFocus: false });
  const { data: relationshipsData, isLoading: relationshipsLoading, mutate: mutateRelationships } = useSWR("/api/asset-intelligence/relationships", fetcher, { revalidateOnFocus: false });
  const { data: recommendationsData, isLoading: recommendationsLoading } = useSWR("/api/asset-intelligence/recommendations", fetcher, { revalidateOnFocus: false });

  const stats: StatsData | null = statsData?.data ?? statsData ?? null;
  const metadataList: AssetMeta[] = React.useMemo(() => {
    const raw = metadataData?.data ?? metadataData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [metadataData]);
  const tagsList: TagItem[] = React.useMemo(() => {
    const raw = tagsData?.data ?? tagsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [tagsData]);
  const collectionsList: CollectionItem[] = React.useMemo(() => {
    const raw = collectionsData?.data ?? collectionsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [collectionsData]);
  const categoriesList: CategoryItem[] = React.useMemo(() => {
    const raw = categoriesData?.data ?? categoriesData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [categoriesData]);
  const duplicatesList: DuplicateGroup[] = React.useMemo(() => {
    const raw = duplicatesData?.data ?? duplicatesData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [duplicatesData]);
  const qualityList: QualityItem[] = React.useMemo(() => {
    const raw = qualityData?.data ?? qualityData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [qualityData]);
  const relationshipsList: RelationshipItem[] = React.useMemo(() => {
    const raw = relationshipsData?.data ?? relationshipsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [relationshipsData]);
  const recommendationsList: RecommendationItem[] = React.useMemo(() => {
    const raw = recommendationsData?.data ?? recommendationsData ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [recommendationsData]);

  const isLoading = statsLoading || metadataLoading;

  const filteredMetadata = React.useMemo(() => {
    let list = metadataList;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.name?.toLowerCase().includes(q) || a.filename?.toLowerCase().includes(q) || a.assetId?.toLowerCase().includes(q));
    }
    if (typeFilter) list = list.filter((a) => a.kind === typeFilter || a.type === typeFilter);
    if (categoryFilter) list = list.filter((a) => a.categories?.includes(categoryFilter));
    return list;
  }, [metadataList, search, typeFilter, categoryFilter]);

  const filteredTags = React.useMemo(() => {
    if (!tagSearch) return tagsList;
    const q = tagSearch.toLowerCase();
    return tagsList.filter((tag) => tag.name?.toLowerCase().includes(q));
  }, [tagsList, tagSearch]);

  const filteredRelationships = React.useMemo(() => {
    let list = relationshipsList;
    if (relationshipTypeFilter) list = list.filter((r) => r.type === relationshipTypeFilter);
    return list;
  }, [relationshipsList, relationshipTypeFilter]);

  const filteredQuality = React.useMemo(() => {
    let list = qualityList;
    if (qualityFilter) {
      if (qualityFilter === "high") list = list.filter((q) => q.score >= 80);
      else if (qualityFilter === "medium") list = list.filter((q) => q.score >= 50 && q.score < 80);
      else if (qualityFilter === "low") list = list.filter((q) => q.score < 50);
    }
    return list;
  }, [qualityList, qualityFilter]);

  const refreshAll = () => {
    mutateStats();
    mutateMetadata();
    mutateTags();
    mutateCollections();
    mutateCategories();
    mutateDuplicates();
    mutateQuality();
    mutateRelationships();
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await fetch("/api/asset-intelligence/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.tagCreated", "Tag created"));
        setNewTagName("");
        setNewTagColor("#6366f1");
        mutateTags();
      } else {
        toast.error(t("assetIntelligence.tagCreateError", "Failed to create tag"));
      }
    } catch {
      toast.error(t("assetIntelligence.tagCreateError", "Failed to create tag"));
    }
  };

  const handleUpdateTag = async () => {
    if (!editingTag) return;
    try {
      const res = await fetch(`/api/asset-intelligence/tags/${editingTag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingTag.name, color: editingTag.color }),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.tagUpdated", "Tag updated"));
        setEditingTag(null);
        mutateTags();
      } else {
        toast.error(t("assetIntelligence.tagUpdateError", "Failed to update tag"));
      }
    } catch {
      toast.error(t("assetIntelligence.tagUpdateError", "Failed to update tag"));
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const res = await fetch(`/api/asset-intelligence/tags/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("assetIntelligence.tagDeleted", "Tag deleted"));
        mutateTags();
      } else {
        toast.error(t("assetIntelligence.tagDeleteError", "Failed to delete tag"));
      }
    } catch {
      toast.error(t("assetIntelligence.tagDeleteError", "Failed to delete tag"));
    }
  };

  const handleTagAsset = async (assetId: string, tagName: string) => {
    try {
      const res = await fetch("/api/asset-intelligence/tags/asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, tagName }),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.assetTagged", "Tag added to asset"));
        mutateMetadata();
        mutateTags();
      } else {
        toast.error(t("assetIntelligence.tagAssetError", "Failed to tag asset"));
      }
    } catch {
      toast.error(t("assetIntelligence.tagAssetError", "Failed to tag asset"));
    }
  };

  const handleUntagAsset = async (assetId: string, tagName: string) => {
    try {
      const res = await fetch("/api/asset-intelligence/tags/asset", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, tagName }),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.assetUntagged", "Tag removed from asset"));
        mutateMetadata();
        mutateTags();
      } else {
        toast.error(t("assetIntelligence.untagAssetError", "Failed to remove tag"));
      }
    } catch {
      toast.error(t("assetIntelligence.untagAssetError", "Failed to remove tag"));
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
      const res = await fetch("/api/asset-intelligence/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollectionName.trim(), description: newCollectionDesc.trim() }),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.collectionCreated", "Collection created"));
        setNewCollectionName("");
        setNewCollectionDesc("");
        setShowCollectionForm(false);
        mutateCollections();
      } else {
        toast.error(t("assetIntelligence.collectionCreateError", "Failed to create collection"));
      }
    } catch {
      toast.error(t("assetIntelligence.collectionCreateError", "Failed to create collection"));
    }
  };

  const handleUpdateCollection = async () => {
    if (!editingCollection) return;
    try {
      const res = await fetch(`/api/asset-intelligence/collections/${editingCollection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingCollection.name, description: editingCollection.description }),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.collectionUpdated", "Collection updated"));
        setEditingCollection(null);
        mutateCollections();
      } else {
        toast.error(t("assetIntelligence.collectionUpdateError", "Failed to update collection"));
      }
    } catch {
      toast.error(t("assetIntelligence.collectionUpdateError", "Failed to update collection"));
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      const res = await fetch(`/api/asset-intelligence/collections/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("assetIntelligence.collectionDeleted", "Collection deleted"));
        mutateCollections();
      } else {
        toast.error(t("assetIntelligence.collectionDeleteError", "Failed to delete collection"));
      }
    } catch {
      toast.error(t("assetIntelligence.collectionDeleteError", "Failed to delete collection"));
    }
  };

  const handleAddAssetToCollection = async (collectionId: string, assetId: string) => {
    if (!assetId.trim()) return;
    try {
      const res = await fetch(`/api/asset-intelligence/collections/${collectionId}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: assetId.trim() }),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.assetAddedToCollection", "Asset added to collection"));
        setAddAssetToCollection("");
        mutateCollections();
      } else {
        toast.error(t("assetIntelligence.assetAddError", "Failed to add asset"));
      }
    } catch {
      toast.error(t("assetIntelligence.assetAddError", "Failed to add asset"));
    }
  };

  const handleRemoveAssetFromCollection = async (collectionId: string, assetId: string) => {
    if (!assetId.trim()) return;
    try {
      const res = await fetch(`/api/asset-intelligence/collections/${collectionId}/assets`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: assetId.trim() }),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.assetRemovedFromCollection", "Asset removed from collection"));
        setRemoveAssetFromCollection("");
        mutateCollections();
      } else {
        toast.error(t("assetIntelligence.assetRemoveError", "Failed to remove asset"));
      }
    } catch {
      toast.error(t("assetIntelligence.assetRemoveError", "Failed to remove asset"));
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("/api/asset-intelligence/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          parentId: newCategoryParent || undefined,
          description: newCategoryDesc.trim() || undefined,
        }),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.categoryCreated", "Category created"));
        setNewCategoryName("");
        setNewCategoryParent("");
        setNewCategoryDesc("");
        mutateCategories();
      } else {
        toast.error(t("assetIntelligence.categoryCreateError", "Failed to create category"));
      }
    } catch {
      toast.error(t("assetIntelligence.categoryCreateError", "Failed to create category"));
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      const res = await fetch(`/api/asset-intelligence/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingCategory.name, description: editingCategory.description, parentId: editingCategory.parentId }),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.categoryUpdated", "Category updated"));
        setEditingCategory(null);
        mutateCategories();
      } else {
        toast.error(t("assetIntelligence.categoryUpdateError", "Failed to update category"));
      }
    } catch {
      toast.error(t("assetIntelligence.categoryUpdateError", "Failed to update category"));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/asset-intelligence/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("assetIntelligence.categoryDeleted", "Category deleted"));
        mutateCategories();
      } else {
        toast.error(t("assetIntelligence.categoryDeleteError", "Failed to delete category"));
      }
    } catch {
      toast.error(t("assetIntelligence.categoryDeleteError", "Failed to delete category"));
    }
  };

  const handleResolveDuplicate = async (id: string, action: "keep" | "merge" | "dismiss") => {
    try {
      const res = await fetch(`/api/asset-intelligence/duplicates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.duplicateResolved", "Duplicate resolved"));
        mutateDuplicates();
      } else {
        toast.error(t("assetIntelligence.duplicateResolveError", "Failed to resolve duplicate"));
      }
    } catch {
      toast.error(t("assetIntelligence.duplicateResolveError", "Failed to resolve duplicate"));
    }
  };

  const handleDeleteDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/asset-intelligence/duplicates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("assetIntelligence.duplicateDeleted", "Duplicate removed"));
        mutateDuplicates();
      } else {
        toast.error(t("assetIntelligence.duplicateDeleteError", "Failed to remove duplicate"));
      }
    } catch {
      toast.error(t("assetIntelligence.duplicateDeleteError", "Failed to remove duplicate"));
    }
  };

  const handleCreateRelationship = async () => {
    if (!newRelSource.trim() || !newRelTarget.trim() || !newRelType.trim()) return;
    try {
      const res = await fetch("/api/asset-intelligence/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceAssetId: newRelSource.trim(), targetAssetId: newRelTarget.trim(), type: newRelType.trim() }),
      });
      if (res.ok) {
        toast.success(t("assetIntelligence.relationshipCreated", "Relationship created"));
        setNewRelSource("");
        setNewRelTarget("");
        setNewRelType("");
        mutateRelationships();
      } else {
        toast.error(t("assetIntelligence.relationshipCreateError", "Failed to create relationship"));
      }
    } catch {
      toast.error(t("assetIntelligence.relationshipCreateError", "Failed to create relationship"));
    }
  };

  const handleDeleteRelationship = async (id: string) => {
    try {
      const res = await fetch(`/api/asset-intelligence/relationships/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("assetIntelligence.relationshipDeleted", "Relationship deleted"));
        mutateRelationships();
      } else {
        toast.error(t("assetIntelligence.relationshipDeleteError", "Failed to delete relationship"));
      }
    } catch {
      toast.error(t("assetIntelligence.relationshipDeleteError", "Failed to delete relationship"));
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const params = new URLSearchParams({ q: searchQuery });
      if (searchTypeFilter) params.set("type", searchTypeFilter);
      if (searchTagFilter) params.set("tag", searchTagFilter);
      const res = await fetch(`/api/asset-intelligence/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data?.data ?? data ?? []);
      } else {
        toast.error(t("assetIntelligence.searchError", "Search failed"));
      }
    } catch {
      toast.error(t("assetIntelligence.searchError", "Search failed"));
    }
  };

  const handleDeleteMetadata = async (id: string) => {
    try {
      const res = await fetch(`/api/asset-intelligence/metadata/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(t("assetIntelligence.metadataDeleted", "Metadata deleted"));
        mutateMetadata();
        mutateStats();
      } else {
        toast.error(t("assetIntelligence.metadataDeleteError", "Failed to delete metadata"));
      }
    } catch {
      toast.error(t("assetIntelligence.metadataDeleteError", "Failed to delete metadata"));
    }
  };

  const renderCategoryTree = (items: CategoryItem[], depth: number = 0) => {
    return items.map((cat) => (
      <div key={cat.id} style={{ paddingLeft: `${depth * 20}px` }}>
        <div className={`flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3 mb-2 ${selectedCategory === cat.id ? "border-primary/50 bg-primary/5" : ""}`}>
          <div className="flex items-center gap-2 min-w-0">
            <FolderTree className="size-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <span className="font-medium text-sm truncate block">{cat.name}</span>
              {cat.description && <span className="text-xs text-muted-foreground truncate block">{cat.description}</span>}
            </div>
            {cat.assetCount != null && <Badge tone="muted">{cat.assetCount}</Badge>}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon-sm" onClick={() => { setSelectedCategory(selectedCategory === cat.id ? null : cat.id); }}>
              <Eye className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setEditingCategory(cat)}>
              <Settings className="size-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteCategory(cat.id)}>
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
        {cat.children && cat.children.length > 0 && renderCategoryTree(cat.children, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("assetIntelligence.title", "Smart Asset Intelligence")}
        description={t("assetIntelligence.description", "AI-powered asset management, tagging, and quality analysis")}
        actions={
          <Button variant="outline" size="sm" onClick={refreshAll}>
            <RefreshCw className="mr-2 size-4" />
            {t("common.refresh", "Refresh")}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {TABS.map(({ key, labelKey, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{t(labelKey, key.charAt(0).toUpperCase() + key.slice(1))}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</span>
        </div>
      ) : (
        <>
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("assetIntelligence.totalAssets", "Total Assets")}</span>
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{stats?.totalAssets ?? metadataList.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("assetIntelligence.totalTags", "Total Tags")}</span>
                    <Tag className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{stats?.totalTags ?? tagsList.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("assetIntelligence.totalCollections", "Collections")}</span>
                    <Folder className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{stats?.totalCollections ?? collectionsList.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("assetIntelligence.duplicateGroups", "Duplicate Groups")}</span>
                    <Copy className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{stats?.duplicateGroups ?? duplicatesList.length}</p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <DashboardCard title={t("assetIntelligence.recentAssets", "Recent Assets")}>
                  {metadataList.length > 0 ? (
                    <div className="space-y-2">
                      {metadataList.slice(0, 8).map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-muted/40">
                              {KIND_ICONS[asset.kind ?? asset.type ?? ""] ?? <FileText className="size-4 text-muted-foreground" />}
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium text-sm truncate block">{asset.name || asset.filename || asset.assetId}</span>
                              <span className="text-xs text-muted-foreground">{timeAgo(asset.createdAt ?? "")}</span>
                            </div>
                          </div>
                          {asset.qualityScore != null && (
                            <Badge tone={qualityBadgeTone(asset.qualityScore)}>{asset.qualityScore}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">{t("assetIntelligence.noAssets", "No assets yet")}</div>
                  )}
                </DashboardCard>

                <DashboardCard title={t("assetIntelligence.recommendations", "Recommendations")}>
                  {recommendationsList.length > 0 ? (
                    <div className="space-y-2">
                      {recommendationsList.slice(0, 8).map((rec) => (
                        <div key={rec.id} className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3">
                          <Sparkles className="size-4 text-amber-500 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-medium text-sm">{rec.title}</span>
                            {rec.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rec.description}</p>}
                            <div className="flex items-center gap-2 mt-1">
                              <Badge tone={rec.type === "tag" ? "info" : rec.type === "quality" ? "success" : "muted"}>{rec.type}</Badge>
                              {rec.priority && <Badge tone={rec.priority === "high" ? "warning" : "muted"}>{rec.priority}</Badge>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">{t("assetIntelligence.noRecommendations", "No recommendations")}</div>
                  )}
                </DashboardCard>
              </div>

              {stats?.assetsByType && stats.assetsByType.length > 0 && (
                <DashboardCard title={t("assetIntelligence.assetsByType", "Assets by Type")}>
                  <div className="space-y-2">
                    {stats.assetsByType.map((item, i) => {
                      const maxCount = Math.max(...stats.assetsByType!.map((a) => a.count), 1);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-24 text-sm">{item.type || "unknown"}</span>
                          <div className="h-2 flex-1 rounded-full bg-muted/40">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </DashboardCard>
              )}

              {stats?.qualityDistribution && stats.qualityDistribution.length > 0 && (
                <DashboardCard title={t("assetIntelligence.qualityDistribution", "Quality Distribution")}>
                  <div className="space-y-2">
                    {stats.qualityDistribution.map((item, i) => {
                      const maxCount = Math.max(...stats.qualityDistribution!.map((a) => a.count), 1);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-24 text-sm">{item.range}</span>
                          <div className="h-2 flex-1 rounded-full bg-muted/40">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </DashboardCard>
              )}
            </div>
          )}

          {activeTab === "library" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("assetIntelligence.searchAssets", "Search assets...")} className="pl-9" />
                </div>
                <div className="flex gap-1">
                  {["", "image", "video", "document"].map((type) => (
                    <Button key={type} variant={typeFilter === type ? "default" : "outline"} size="sm" onClick={() => setTypeFilter(type)}>
                      {type || t("assetIntelligence.all", "All")}
                    </Button>
                  ))}
                </div>
              </div>

              {metadataLoading ? (
                <div className="flex items-center justify-center py-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
              ) : filteredMetadata.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Library className="mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{t("assetIntelligence.noAssetsFound", "No assets found")}</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredMetadata.map((asset) => (
                    <div key={asset.id} className="rounded-xl border border-border bg-muted/20 p-4 transition hover:border-foreground/10">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted/40">
                          {KIND_ICONS[asset.kind ?? asset.type ?? ""] ?? <FileText className="size-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{asset.name || asset.filename || asset.assetId}</h4>
                          <p className="text-xs text-muted-foreground">{formatSize(asset.sizeBytes ?? 0)} &bull; {timeAgo(asset.createdAt ?? "")}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-1 flex-wrap">
                        <Badge tone={asset.kind === "image" ? "info" : asset.kind === "video" ? "warning" : "muted"}>{asset.kind ?? asset.type ?? "unknown"}</Badge>
                        {asset.qualityScore != null && <Badge tone={qualityBadgeTone(asset.qualityScore)}>{asset.qualityScore}</Badge>}
                        {asset.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} tone="muted">{tag}</Badge>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteMetadata(asset.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "tags" && (
            <div className="space-y-4">
              <DashboardCard title={t("assetIntelligence.createTag", "Create Tag")}>
                <div className="flex items-center gap-2 flex-wrap">
                  <Input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder={t("assetIntelligence.tagName", "Tag name")} className="max-w-xs" />
                  <input type="color" value={newTagColor} onChange={(e) => setNewTagColor(e.target.value)} className="size-8 rounded-lg border border-border cursor-pointer" />
                  <Button size="sm" onClick={handleCreateTag} disabled={!newTagName.trim()}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>
              </DashboardCard>

              {editingTag && (
                <DashboardCard title={t("assetIntelligence.editTag", "Edit Tag")}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Input value={editingTag.name} onChange={(e) => setEditingTag((p) => p ? { ...p, name: e.target.value } : null)} className="max-w-xs" />
                    <input type="color" value={editingTag.color ?? "#6366f1"} onChange={(e) => setEditingTag((p) => p ? { ...p, color: e.target.value } : null)} className="size-8 rounded-lg border border-border cursor-pointer" />
                    <Button size="sm" onClick={handleUpdateTag}>{t("common.save", "Save")}</Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingTag(null)}><X className="size-4" /></Button>
                  </div>
                </DashboardCard>
              )}

              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={tagSearch} onChange={(e) => setTagSearch(e.target.value)} placeholder={t("assetIntelligence.searchTags", "Search tags...")} className="pl-9" />
                </div>
              </div>

              {tagsLoading ? (
                <div className="flex items-center justify-center py-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
              ) : filteredTags.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Tag className="mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{t("assetIntelligence.noTags", "No tags yet")}</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredTags.map((tag) => (
                    <div key={tag.id} className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2">
                      <div className="size-3 rounded-full" style={{ backgroundColor: tag.color || "#6366f1" }} />
                      <span className="font-medium text-sm">{tag.name}</span>
                      {tag.count != null && <Badge tone="muted">{tag.count}</Badge>}
                      {tag.auto && <Badge tone="info">{t("assetIntelligence.auto", "Auto")}</Badge>}
                      <Button variant="ghost" size="icon-xs" onClick={() => setEditingTag(tag)}>
                        <Settings className="size-3" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => handleDeleteTag(tag.id)}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "collections" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t("assetIntelligence.yourCollections", "Your Collections")}</h2>
                <Button size="sm" onClick={() => setShowCollectionForm(!showCollectionForm)}>
                  <Plus className="mr-2 size-4" />
                  {t("assetIntelligence.newCollection", "New Collection")}
                </Button>
              </div>

              {showCollectionForm && (
                <DashboardCard title={editingCollection ? t("assetIntelligence.editCollection", "Edit Collection") : t("assetIntelligence.createCollection", "Create Collection")}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input value={editingCollection ? editingCollection.name : newCollectionName} onChange={(e) => editingCollection ? setEditingCollection((p) => p ? { ...p, name: e.target.value } : null) : setNewCollectionName(e.target.value)} placeholder={t("assetIntelligence.collectionName", "Collection name")} />
                    <Input value={editingCollection ? (editingCollection.description ?? "") : newCollectionDesc} onChange={(e) => editingCollection ? setEditingCollection((p) => p ? { ...p, description: e.target.value } : null) : setNewCollectionDesc(e.target.value)} placeholder={t("assetIntelligence.collectionDescription", "Description")} />
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => { setShowCollectionForm(false); setEditingCollection(null); setNewCollectionName(""); setNewCollectionDesc(""); }}>
                      <X className="mr-2 size-4" />
                      {t("common.cancel", "Cancel")}
                    </Button>
                    <Button size="sm" onClick={editingCollection ? handleUpdateCollection : handleCreateCollection} disabled={editingCollection ? !editingCollection.name.trim() : !newCollectionName.trim()}>
                      {t("common.save", "Save")}
                    </Button>
                  </div>
                </DashboardCard>
              )}

              {collectionsLoading ? (
                <div className="flex items-center justify-center py-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
              ) : collectionsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Folder className="mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{t("assetIntelligence.noCollections", "No collections yet")}</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {collectionsList.map((col) => (
                    <div key={col.id} className={`rounded-xl border border-border bg-muted/20 p-4 transition hover:border-foreground/10 ${selectedCollection === col.id ? "border-primary/50" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-muted/40">
                            <Folder className="size-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">{col.name}</h4>
                            {col.description && <p className="text-xs text-muted-foreground line-clamp-1">{col.description}</p>}
                            <p className="text-xs text-muted-foreground mt-0.5">{col.assetCount ?? 0} {t("assetIntelligence.assets", "assets")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon-sm" onClick={() => { setSelectedCollection(selectedCollection === col.id ? null : col.id); }}>
                            <Eye className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => { setEditingCollection(col); setShowCollectionForm(true); }}>
                            <Settings className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteCollection(col.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>

                      {selectedCollection === col.id && (
                        <div className="mt-3 space-y-3 border-t border-border pt-3">
                          <div className="flex items-center gap-2">
                            <Input value={addAssetToCollection} onChange={(e) => setAddAssetToCollection(e.target.value)} placeholder={t("assetIntelligence.assetIdToAdd", "Asset ID to add")} className="flex-1 text-xs" />
                            <Button size="sm" onClick={() => handleAddAssetToCollection(col.id, addAssetToCollection)} disabled={!addAssetToCollection.trim()}>
                              <Plus className="size-3.5" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input value={removeAssetFromCollection} onChange={(e) => setRemoveAssetFromCollection(e.target.value)} placeholder={t("assetIntelligence.assetIdToRemove", "Asset ID to remove")} className="flex-1 text-xs" />
                            <Button variant="outline" size="sm" onClick={() => handleRemoveAssetFromCollection(col.id, removeAssetFromCollection)} disabled={!removeAssetFromCollection.trim()}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                          {col.assets && col.assets.length > 0 && (
                            <div className="space-y-1">
                              {col.assets.map((asset) => (
                                <div key={asset.id} className="flex items-center gap-2 rounded-lg bg-muted/30 px-2 py-1.5 text-xs">
                                  <FileText className="size-3 text-muted-foreground" />
                                  <span className="truncate">{asset.name || asset.filename || asset.assetId}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-4">
              <DashboardCard title={t("assetIntelligence.createCategory", "Create Category")}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder={t("assetIntelligence.categoryName", "Category name")} />
                  <select value={newCategoryParent} onChange={(e) => setNewCategoryParent(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm h-8">
                    <option value="">{t("assetIntelligence.noParent", "No parent")}</option>
                    {categoriesList.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Input value={newCategoryDesc} onChange={(e) => setNewCategoryDesc(e.target.value)} placeholder={t("assetIntelligence.description", "Description")} />
                    <Button onClick={handleCreateCategory} disabled={!newCategoryName.trim()}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
              </DashboardCard>

              {editingCategory && (
                <DashboardCard title={t("assetIntelligence.editCategory", "Edit Category")}>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input value={editingCategory.name} onChange={(e) => setEditingCategory((p) => p ? { ...p, name: e.target.value } : null)} />
                    <select value={editingCategory.parentId ?? ""} onChange={(e) => setEditingCategory((p) => p ? { ...p, parentId: e.target.value || undefined } : null)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm h-8">
                      <option value="">{t("assetIntelligence.noParent", "No parent")}</option>
                      {categoriesList.filter((c) => c.id !== editingCategory.id).map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <Input value={editingCategory.description ?? ""} onChange={(e) => setEditingCategory((p) => p ? { ...p, description: e.target.value } : null)} placeholder={t("assetIntelligence.description", "Description")} />
                      <Button onClick={handleUpdateCategory}>{t("common.save", "Save")}</Button>
                      <Button variant="outline" onClick={() => setEditingCategory(null)}><X className="size-4" /></Button>
                    </div>
                  </div>
                </DashboardCard>
              )}

              {categoriesLoading ? (
                <div className="flex items-center justify-center py-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
              ) : categoriesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <FolderTree className="mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{t("assetIntelligence.noCategories", "No categories yet")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {renderCategoryTree(categoriesList)}
                </div>
              )}
            </div>
          )}

          {activeTab === "duplicates" && (
            <div className="space-y-4">
              {duplicatesLoading ? (
                <div className="flex items-center justify-center py-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
              ) : duplicatesList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Copy className="mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{t("assetIntelligence.noDuplicates", "No duplicates detected")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {duplicatesList.map((group) => (
                    <DashboardCard key={group.id} title={t("assetIntelligence.duplicateGroup", "Duplicate Group") + ` (${group.assets.length} ${t("assetIntelligence.assets", "assets")})`}>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          {group.similarity != null && <Badge tone={group.similarity >= 90 ? "warning" : "info"}>{t("assetIntelligence.similarity", "Similarity")}: {group.similarity}%</Badge>}
                          {group.status && <Badge tone={group.status === "resolved" ? "success" : "muted"}>{group.status}</Badge>}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {group.assets.map((asset) => (
                            <div key={asset.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3">
                              <div className="flex size-8 items-center justify-center rounded-lg bg-muted/40">
                                {KIND_ICONS[asset.kind ?? ""] ?? <FileText className="size-4 text-muted-foreground" />}
                              </div>
                              <div className="min-w-0">
                                <span className="text-sm font-medium truncate block">{asset.name || asset.filename || asset.assetId}</span>
                                <span className="text-xs text-muted-foreground">{formatSize(asset.sizeBytes ?? 0)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleResolveDuplicate(group.id, "keep")}>
                            <CheckCircle className="mr-1 size-3.5" />
                            {t("assetIntelligence.keepAll", "Keep All")}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleResolveDuplicate(group.id, "merge")}>
                            <Link className="mr-1 size-3.5" />
                            {t("assetIntelligence.merge", "Merge")}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleResolveDuplicate(group.id, "dismiss")}>
                            <X className="mr-1 size-3.5" />
                            {t("assetIntelligence.dismiss", "Dismiss")}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteDuplicate(group.id)}>
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </DashboardCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "quality" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("assetIntelligence.searchQuality", "Search by asset...")} className="pl-9" />
                </div>
                <div className="flex gap-1">
                  {["", "high", "medium", "low"].map((level) => (
                    <Button key={level} variant={qualityFilter === level ? "default" : "outline"} size="sm" onClick={() => setQualityFilter(level)}>
                      {level ? t(`assetIntelligence.${level}`, level.charAt(0).toUpperCase() + level.slice(1)) : t("assetIntelligence.all", "All")}
                    </Button>
                  ))}
                </div>
              </div>

              {qualityLoading ? (
                <div className="flex items-center justify-center py-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
              ) : filteredQuality.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Star className="mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{t("assetIntelligence.noQualityData", "No quality data yet")}</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredQuality.map((q) => (
                    <div key={q.id} className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm truncate">{q.asset?.name || q.asset?.filename || q.assetId}</span>
                        <Badge tone={qualityBadgeTone(q.score)}>
                          <span className={qualityColor(q.score)}>{q.score}</span>
                        </Badge>
                      </div>
                      {q.breakdown && Object.keys(q.breakdown).length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          {Object.entries(q.breakdown).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground w-20 truncate">{key}</span>
                              <div className="h-1.5 flex-1 rounded-full bg-muted/40">
                                <div className={`h-1.5 rounded-full ${qualityColor(val)}`} style={{ width: `${Math.min(val, 100)}%` }} />
                              </div>
                              <span className="text-xs w-6 text-right">{val}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.details && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{q.details}</p>}
                      {q.createdAt && <p className="text-xs text-muted-foreground mt-1">{new Date(q.createdAt).toLocaleDateString()}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "relationships" && (
            <div className="space-y-4">
              <DashboardCard title={t("assetIntelligence.createRelationship", "Create Relationship")}>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Input value={newRelSource} onChange={(e) => setNewRelSource(e.target.value)} placeholder={t("assetIntelligence.sourceAssetId", "Source Asset ID")} />
                  <Input value={newRelTarget} onChange={(e) => setNewRelTarget(e.target.value)} placeholder={t("assetIntelligence.targetAssetId", "Target Asset ID")} />
                  <Input value={newRelType} onChange={(e) => setNewRelType(e.target.value)} placeholder={t("assetIntelligence.relationshipType", "Type (e.g. variant_of)")} />
                  <Button onClick={handleCreateRelationship} disabled={!newRelSource.trim() || !newRelTarget.trim() || !newRelType.trim()}>
                    <Plus className="mr-2 size-4" />
                    {t("common.create", "Create")}
                  </Button>
                </div>
              </DashboardCard>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={relationshipTypeFilter} onChange={(e) => setRelationshipTypeFilter(e.target.value)} placeholder={t("assetIntelligence.filterByType", "Filter by type...")} className="pl-9" />
                </div>
              </div>

              {relationshipsLoading ? (
                <div className="flex items-center justify-center py-8"><Loader className="size-6 animate-spin text-muted-foreground" /></div>
              ) : filteredRelationships.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <GitBranch className="mb-3 size-10 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">{t("assetIntelligence.noRelationships", "No relationships yet")}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRelationships.map((rel) => (
                    <div key={rel.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-sm font-medium truncate">{rel.sourceAsset?.name || rel.sourceAssetId}</span>
                        <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                        <Badge tone="info">{rel.type}</Badge>
                        <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">{rel.targetAsset?.name || rel.targetAssetId}</span>
                      </div>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteRelationship(rel.id)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "search" && (
            <div className="space-y-4">
              <DashboardCard title={t("assetIntelligence.advancedSearch", "Advanced Search")}>
                <div className="grid gap-3 sm:grid-cols-4">
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("assetIntelligence.searchQuery", "Search query...")} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                  <select value={searchTypeFilter} onChange={(e) => setSearchTypeFilter(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm h-8">
                    <option value="">{t("assetIntelligence.allTypes", "All Types")}</option>
                    <option value="image">{t("assetIntelligence.image", "Image")}</option>
                    <option value="video">{t("assetIntelligence.video", "Video")}</option>
                    <option value="document">{t("assetIntelligence.document", "Document")}</option>
                  </select>
                  <Input value={searchTagFilter} onChange={(e) => setSearchTagFilter(e.target.value)} placeholder={t("assetIntelligence.filterByTag", "Filter by tag...")} />
                  <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
                    <Search className="mr-2 size-4" />
                    {t("common.search", "Search")}
                  </Button>
                </div>
              </DashboardCard>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{searchResults.length} {t("assetIntelligence.results", "results")}</p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {searchResults.map((asset) => (
                      <div key={asset.id} className="rounded-xl border border-border bg-muted/20 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-muted/40">
                            {KIND_ICONS[asset.kind ?? ""] ?? <FileText className="size-5 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{asset.name || asset.filename || asset.assetId}</h4>
                            <p className="text-xs text-muted-foreground">{formatSize(asset.sizeBytes ?? 0)} &bull; {timeAgo(asset.createdAt ?? "")}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-1 flex-wrap">
                          {asset.tags?.map((tag) => <Badge key={tag} tone="muted">{tag}</Badge>)}
                          {asset.qualityScore != null && <Badge tone={qualityBadgeTone(asset.qualityScore)}>{asset.qualityScore}</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("assetIntelligence.totalAssets", "Total Assets")}</span>
                    <FileText className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{stats?.totalAssets ?? metadataList.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("assetIntelligence.avgQuality", "Avg Quality")}</span>
                    <Star className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{stats?.avgQualityScore?.toFixed(1) ?? qualityList.length > 0 ? (qualityList.reduce((sum, q) => sum + q.score, 0) / qualityList.length).toFixed(1) : "0"}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("assetIntelligence.totalRelationships", "Relationships")}</span>
                    <GitBranch className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{relationshipsList.length}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("assetIntelligence.autoTags", "Auto Tags")}</span>
                    <Zap className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{tagsList.filter((tag) => tag.auto).length}</p>
                </div>
              </div>

              {stats?.assetsByType && stats.assetsByType.length > 0 && (
                <DashboardCard title={t("assetIntelligence.assetsByType", "Assets by Type")}>
                  <div className="space-y-2">
                    {stats.assetsByType.map((item, i) => {
                      const maxCount = Math.max(...stats.assetsByType!.map((a) => a.count), 1);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-24 text-sm">{item.type || "unknown"}</span>
                          <div className="h-2 flex-1 rounded-full bg-muted/40">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </DashboardCard>
              )}

              {stats?.qualityDistribution && stats.qualityDistribution.length > 0 && (
                <DashboardCard title={t("assetIntelligence.qualityDistribution", "Quality Distribution")}>
                  <div className="space-y-2">
                    {stats.qualityDistribution.map((item, i) => {
                      const maxCount = Math.max(...stats.qualityDistribution!.map((a) => a.count), 1);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-24 text-sm">{item.range}</span>
                          <div className="h-2 flex-1 rounded-full bg-muted/40">
                            <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min((item.count / maxCount) * 100, 100)}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">{item.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </DashboardCard>
              )}

              {stats?.recentActivity && stats.recentActivity.length > 0 && (
                <DashboardCard title={t("assetIntelligence.recentActivity", "Recent Activity")}>
                  <div className="space-y-2">
                    {stats.recentActivity.map((item, i) => (
                      <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                        <span className="text-sm">{item.action}</span>
                        <Badge tone="muted">{item.count}</Badge>
                      </div>
                    ))}
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
