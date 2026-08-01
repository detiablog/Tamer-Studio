"use client";

import * as React from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Search, Plus, MoreVertical, Edit, Archive, Copy, Trash2, Star, Folder, Clock, Activity, LayoutDashboard, Image as ImageIcon, GitBranch, Share2, FileText } from "lucide-react";
import { toast } from "sonner";
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

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  tags: string[];
  description: string;
  favorited: boolean;
  archived: boolean;
  creditsUsed: number;
  storageUsed: number;
  createdAt: string;
  updatedAt: string;
}

type TabKey = "dashboard" | "projects" | "favorites" | "archived" | "templates" | "timeline" | "activity";

const TABS: { key: TabKey; icon: React.ReactNode }[] = [
  { key: "dashboard", icon: <LayoutDashboard className="size-4" /> },
  { key: "projects", icon: <Folder className="size-4" /> },
  { key: "favorites", icon: <Star className="size-4" /> },
  { key: "archived", icon: <Archive className="size-4" /> },
  { key: "templates", icon: <FileText className="size-4" /> },
  { key: "timeline", icon: <Clock className="size-4" /> },
  { key: "activity", icon: <Activity className="size-4" /> },
];

const PROJECT_TYPES = ["Content", "Marketing", "Production", "Research", "Design", "Video"];

const MOCK_TEMPLATES = [
  { id: "t1", name: "Social Media Campaign", type: "Marketing", description: "Pre-built template for social media content campaigns" },
  { id: "t2", name: "Video Production", type: "Production", description: "End-to-end video production workflow" },
  { id: "t3", name: "Blog Content Series", type: "Content", description: "Template for creating blog content series" },
  { id: "t4", name: "Product Launch", type: "Marketing", description: "Complete product launch content package" },
  { id: "t5", name: "AI Image Batch", type: "Production", description: "Batch generate images with consistent style" },
  { id: "t6", name: "Research Report", type: "Research", description: "Structured research and reporting template" },
];

const STATUS_COLORS: Record<string, "success" | "warning" | "muted" | "info"> = {
  active: "success",
  draft: "muted",
  in_progress: "warning",
  completed: "info",
  archived: "muted",
};

export function ProjectStudioPageClient() {
  const { t } = useLocalizationContext();
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR("/api/projects", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [activeTab, setActiveTab] = React.useState<TabKey>("dashboard");
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("all");
  const [actionsOpen, setActionsOpen] = React.useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [archiveConfirmId, setArchiveConfirmId] = React.useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectType, setNewProjectType] = React.useState("Content");

  React.useEffect(() => {
    if (data?.data && data.success) {
      setProjects(data.data);
    } else if (error) {
      setProjects([]);
    }
  }, [data, error]);

  const filtered = React.useMemo(() => {
    let result = [...projects];
    if (activeTab === "favorites") result = result.filter((p) => p.favorited);
    if (activeTab === "archived") result = result.filter((p) => p.archived);
    if (activeTab === "projects") result = result.filter((p) => !p.archived);
    result = result.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || p.type === typeFilter;
      return matchesSearch && matchesType;
    });
    return result;
  }, [projects, activeTab, search, typeFilter]);

  const stats = React.useMemo(() => {
    const total = projects.length;
    const active = projects.filter((p) => p.status === "active" || p.status === "in_progress").length;
    const archived = projects.filter((p) => p.archived).length;
    const creditsUsed = projects.reduce((sum, p) => sum + (p.creditsUsed || 0), 0);
    return { total, active, archived, creditsUsed };
  }, [projects]);

  const recentProjects = React.useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);
  }, [projects]);

  const typeDistribution = React.useMemo(() => {
    const dist: Record<string, number> = {};
    projects.forEach((p) => { dist[p.type] = (dist[p.type] || 0) + 1; });
    return dist;
  }, [projects]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error(t("common.error", "Error"));
      return;
    }
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName, type: newProjectType }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("projectStudio.createProject", "Create Project") + "!");
      setCreateDialogOpen(false);
      setNewProjectName("");
      setNewProjectType("Content");
      mutate();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!response.ok) {
        toast.error(t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("common.delete", "Delete") + "!");
      setDeleteConfirmId(null);
      mutate();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleArchiveProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}/archive`, { method: "POST" });
      if (!response.ok) {
        toast.error(t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("projectStudio.confirmArchive", "Archive this project?"));
      setArchiveConfirmId(null);
      mutate();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleDuplicateProject = async (project: Project) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${project.name} (Copy)`, type: project.type, duplicateFrom: project.id }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("common.success", "Success"));
      setActionsOpen(null);
      mutate();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      await fetch(`/api/projects/${id}/favorite`, { method: "POST" });
      mutate();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const renderTabContent = () => {
    if (activeTab === "dashboard") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title={t("projectStudio.totalProjects", "Projects")} value={isLoading ? "—" : stats.total} delta={t("projectStudio.description", "Manage all your creative projects in one place")} />
            <StatCard title={t("projectStudio.activeProjects", "Active")} value={isLoading ? "—" : stats.active} delta={t("projectStudio.projectStatus", "Status")} />
            <StatCard title={t("projectStudio.archivedProjects", "Archived")} value={isLoading ? "—" : stats.archived} delta={t("projectStudio.archived", "Archived")} />
            <StatCard title={t("projectStudio.creditsUsed", "Credits Used")} value={isLoading ? "—" : stats.creditsUsed} delta={t("projectStudio.creditsUsed", "Credits Used")} />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <DashboardCard title={t("dashboard.quickActions", "Quick Actions")} description={t("projectStudio.description", "Manage all your creative projects in one place")}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" className="h-auto flex-col items-start p-4" onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="size-5 mb-2" />
                    <span className="text-sm font-medium">{t("projectStudio.createProject", "Create Project")}</span>
                    <span className="text-xs text-muted-foreground">{t("projectStudio.projects", "Projects")}</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-start p-4" onClick={() => router.push("/ai" as any)}>
                    <ImageIcon className="size-5 mb-2" />
                    <span className="text-sm font-medium">{t("imageStudio.newGeneration", "New Generation")}</span>
                    <span className="text-xs text-muted-foreground">{t("projectStudio.images", "Images")}</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-start p-4" onClick={() => router.push("/workflows" as any)}>
                    <GitBranch className="size-5 mb-2" />
                    <span className="text-sm font-medium">{t("projectStudio.workflows", "Workflows")}</span>
                    <span className="text-xs text-muted-foreground">{t("workflows.title", "Workflows")}</span>
                  </Button>
                  <Button variant="outline" className="h-auto flex-col items-start p-4" onClick={() => router.push("/publishing" as any)}>
                    <Share2 className="size-5 mb-2" />
                    <span className="text-sm font-medium">{t("projectStudio.publishing", "Publishing")}</span>
                    <span className="text-xs text-muted-foreground">{t("publishing.title", "Publishing Hub")}</span>
                  </Button>
                </div>
              </DashboardCard>
              <DashboardCard title={t("dashboard.recentProjects", "Recent Projects")} description={t("dashboard.recentProjectsDesc", "Your latest production projects")}>
                {recentProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">{t("projectStudio.noProjects", "No projects yet. Create your first project!")}</p>
                ) : (
                  <div className="space-y-3">
                    {recentProjects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => router.push(`/projects/${project.id}` as any)}>
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                            <Folder className="size-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{project.name}</p>
                            <p className="text-xs text-muted-foreground">{project.type}</p>
                          </div>
                        </div>
                        <Badge tone={STATUS_COLORS[project.status] || "muted"}>{project.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </DashboardCard>
            </div>
            <div className="space-y-6">
              <DashboardCard title={t("projectStudio.projectType", "Project Type")}>
                <div className="space-y-3">
                  {Object.entries(typeDistribution).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{type}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                  {Object.keys(typeDistribution).length === 0 && (
                    <p className="text-xs text-muted-foreground">{t("projectStudio.noProjects", "No projects yet. Create your first project!")}</p>
                  )}
                </div>
              </DashboardCard>
              <DashboardCard title={t("dashboard.recentActivity", "Recent Activity")}>
                <p className="text-sm text-muted-foreground text-center py-4">{t("projectStudio.noActivity", "No recent activity")}</p>
              </DashboardCard>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "templates") {
      return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_TEMPLATES.map((template) => (
            <DashboardCard key={template.id}>
              <div className="flex items-start justify-between mb-3">
                <Badge tone="muted">{template.type}</Badge>
              </div>
              <h3 className="text-sm font-semibold mb-1">{template.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
              <Button size="sm" variant="outline" className="w-full" onClick={() => { setNewProjectName(`${template.name} (Copy)`); setNewProjectType(template.type); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 size-3" />
                {t("projectStudio.createProject", "Create Project")}
              </Button>
            </DashboardCard>
          ))}
        </div>
      );
    }

    if (activeTab === "timeline") {
      return (
        <DashboardCard title={t("projectStudio.timeline", "Timeline")}>
          <div className="space-y-4">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="flex items-start gap-3">
                <div className="relative">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="size-4 text-primary" />
                  </div>
                  <div className="absolute left-1/2 top-8 -ml-px h-full w-px bg-border" />
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.type} - {project.status}</p>
                  <p className="text-xs text-muted-foreground">{new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">{t("projectStudio.noTimeline", "No timeline events")}</p>
            )}
          </div>
        </DashboardCard>
      );
    }

    if (activeTab === "activity") {
      return (
        <DashboardCard title={t("projectStudio.activity", "Activity")}>
          <p className="text-sm text-muted-foreground text-center py-6">{t("projectStudio.noActivity", "No recent activity")}</p>
        </DashboardCard>
      );
    }

    return (
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <DashboardCard>
            <div className="flex flex-col items-center justify-center py-12">
              <Folder className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground text-center">{t("projectStudio.noProjects", "No projects yet. Create your first project!")}</p>
              <Button className="mt-4" size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 size-4" />
                {t("projectStudio.createProject", "Create Project")}
              </Button>
            </div>
          </DashboardCard>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <DashboardCard key={project.id}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                      <Folder className="size-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{project.name}</h3>
                      <span className="text-xs text-muted-foreground">{project.type}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => setActionsOpen(actionsOpen === project.id ? null : project.id)}>
                      <MoreVertical className="size-4" />
                    </Button>
                    {actionsOpen === project.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActionsOpen(null)} />
                        <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-card p-1 shadow-lg z-50">
                          <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={() => { router.push(`/projects/${project.id}` as any); setActionsOpen(null); }}>
                            <Edit className="size-4" />
                            {t("projectStudio.editProject", "Edit Project")}
                          </button>
                          <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={() => { handleToggleFavorite(project.id); setActionsOpen(null); }}>
                            <Star className="size-4" />
                            {t("projectStudio.favorites", "Favorites")}
                          </button>
                          <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={() => { handleDuplicateProject(project); }}>
                            <Copy className="size-4" />
                            {t("common.copy", "Copy")}
                          </button>
                          <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={() => { setArchiveConfirmId(project.id); setActionsOpen(null); }}>
                            <Archive className="size-4" />
                            {t("projectStudio.archived", "Archived")}
                          </button>
                          <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10" onClick={() => { setDeleteConfirmId(project.id); setActionsOpen(null); }}>
                            <Trash2 className="size-4" />
                            {t("common.delete", "Delete")}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground">#{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <Badge tone={STATUS_COLORS[project.status] || "muted"}>{project.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <div className="flex items-center gap-1">
                    <Clock className="size-3" />
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <span>{project.creditsUsed || 0} credits</span>
                </div>
              </DashboardCard>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("projectStudio.title", "Project Studio")}
        description={t("projectStudio.description", "Manage all your creative projects in one place")}
        actions={
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            {t("projectStudio.createProject", "Create Project")}
          </Button>
        }
      />

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.key ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {t(`projectStudio.${tab.key}`, tab.key.charAt(0).toUpperCase() + tab.key.slice(1))}
          </button>
        ))}
      </div>

      {activeTab !== "dashboard" && activeTab !== "templates" && activeTab !== "timeline" && activeTab !== "activity" && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("common.search", "Search") + "..."}
              className="pl-9"
              disabled={isLoading}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">{t("common.all", "All")}</option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      )}

      {renderTabContent()}

      {createDialogOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setCreateDialogOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{t("projectStudio.createProject", "Create Project")}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("projectStudio.projectName", "Project Name")}</label>
                <Input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder={t("projectStudio.projectName", "Project Name")} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t("projectStudio.projectType", "Project Type")}</label>
                <select value={newProjectType} onChange={(e) => setNewProjectType(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
              <Button onClick={handleCreateProject} className="flex-1">{t("projectStudio.save", "Save")}</Button>
            </div>
          </div>
        </>
      )}

      {deleteConfirmId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setDeleteConfirmId(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">{t("common.delete", "Delete")}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t("projectStudio.confirmDelete", "Are you sure you want to delete this project?")}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
              <Button variant="destructive" onClick={() => handleDeleteProject(deleteConfirmId)} className="flex-1">{t("common.delete", "Delete")}</Button>
            </div>
          </div>
        </>
      )}

      {archiveConfirmId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setArchiveConfirmId(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">{t("projectStudio.archived", "Archived")}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t("projectStudio.confirmArchive", "Archive this project?")}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setArchiveConfirmId(null)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
              <Button onClick={() => handleArchiveProject(archiveConfirmId)} className="flex-1">{t("projectStudio.archived", "Archived")}</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}