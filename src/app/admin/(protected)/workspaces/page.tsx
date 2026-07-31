"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, Loader, X, Trash2, Edit } from "lucide-react";
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

export default function AdminWorkspacesPage() {
  const { t } = useLocalizationContext();
  const { data, error, isLoading, mutate } = useSWR("/api/admin/workspaces", fetcher, { 
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });
  
  const [workspaces, setWorkspaces] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingWorkspace, setEditingWorkspace] = React.useState<any>(null);
  const [originalData, setOriginalData] = React.useState<any>(null);
  const [formLoading, setFormLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "", slug: "", description: "", status: "active" });

  React.useEffect(() => {
    if (data?.data && data.success) {
      setWorkspaces(data.data);
    } else if (error) {
      setWorkspaces([]);
    }
  }, [data, error]);

  const isUsingMockData = !data && error;

  const filtered = (workspaces || []).filter((w: any) => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) || w.slug.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || w.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const hasActiveFilters = search.trim() || statusFilter !== "all";

  const openEditModal = (workspace: any) => {
    setEditingWorkspace(workspace);
    setOriginalData({ name: workspace.name, slug: workspace.slug, description: workspace.description, status: workspace.status });
    setFormData({ name: workspace.name, slug: workspace.slug, description: workspace.description, status: workspace.status });
    setEditOpen(true);
  };

  const handleAddWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch("/api/admin/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : (result.error?.message || result.error?.toString?.() || t("admin.failedToCreateWorkspace", "Failed to create workspace")));
        return;
      }

      toast.success(t("admin.workspaceCreatedSuccess", "Workspace created successfully!"));
      setFormData({ name: "", slug: "", description: "", status: "active" });
      setAddOpen(false);
      mutate();
    } catch (error) {
      toast.error(t("admin.errorCreatingWorkspace", "Error creating workspace"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkspace?.id) {
      toast.error(t("admin.workspaceIdNotFound", "Workspace ID not found"));
      return;
    }

    setFormLoading(true);

    try {
      const changedFields: any = {};

      if (formData.name !== originalData?.name) {
        changedFields.name = formData.name;
      }
      if (formData.slug !== originalData?.slug) {
        changedFields.slug = formData.slug;
      }
      if (formData.description !== originalData?.description) {
        changedFields.description = formData.description;
      }
      if (formData.status !== originalData?.status) {
        changedFields.status = formData.status;
      }

      if (Object.keys(changedFields).length === 0) {
        toast.info(t("admin.noChanges", "No changes made"));
        return;
      }

      const response = await fetch(`/api/admin/workspaces/${editingWorkspace.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedFields),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : (result.error?.message || result.error?.toString?.() || t("admin.failedToUpdateWorkspace", "Failed to update workspace")));
        return;
      }

      toast.success(t("admin.workspaceUpdatedSuccess", "Workspace updated successfully!"));
      setFormData({ name: "", slug: "", description: "", status: "active" });
      setOriginalData(null);
      setEditingWorkspace(null);
      setEditOpen(false);
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("admin.errorUpdatingWorkspace", "Error updating workspace"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!confirm(t("admin.confirmDeleteWorkspace", `Delete "{{name}}"?`).replace("{{name}}", workspaceName))) return;

    try {
      const response = await fetch(`/api/admin/workspaces/${workspaceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: t("admin.failedToDeleteWorkspace", "Failed to delete workspace") }));
        toast.error(errorData.error || t("admin.failedToDeleteWorkspace", "Failed to delete workspace"));
        return;
      }

      toast.success(t("admin.workspaceDeletedSuccess", "Workspace deleted successfully!"));
      mutate();
    } catch (error) {
      toast.error(t("admin.errorDeletingWorkspace", "Error deleting workspace"));
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.workspaces", "Workspaces") }]} />
      
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("admin.workspaces", "Workspaces")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.manageWorkspaces", "Manage organization workspaces")}</p>
        </div>

        <div className="flex items-center gap-2 pb-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.searchWorkspaces", "Search workspaces...")}
              className="pl-9"
              disabled={isLoading}
            />
          </div>
          
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter className="mr-2 size-4" />
              {t("common.filter", "Filter")}
            </Button>
            
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t("admin.status", "Status")}</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">{t("admin.allStatus", "All Status")}</option>
                      <option value="active">{t("admin.active", "Active")}</option>
                      <option value="inactive">{t("admin.inactive", "Inactive")}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 size-4" />
            {t("admin.addWorkspace", "Add Workspace")}
          </Button>
        </div>

        {isLoading && workspaces.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("admin.loadingWorkspaces", "Loading workspaces...")}</p>
          </div>
        ) : (
          <>
            {isUsingMockData && (
              <div className="mb-4 rounded-lg border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs text-amber-700 dark:text-amber-300">
                ℹ️ {t("admin.databaseError", "Database connection failed. Please check your connection and try again.")}
              </div>
            )}
            {workspaces.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">{t("admin.noWorkspaces", "No workspaces found")}</p>
              </div>
            ) : (
              <AdminDataTable
                data={filtered}
                keyExtractor={(w) => w.id}
                columns={[
                  { key: "name", header: t("common.name", "Name"), render: (w: any) => <p className="font-medium text-sm">{w.name}</p> },
                   { key: "slug", header: t("admin.slug", "Slug"), render: (w: any) => <p className="text-sm">{w.slug}</p> },
                  { key: "description", header: t("common.description", "Description"), render: (w: any) => <p className="text-sm text-muted-foreground">{w.description}</p> },
                  { key: "status", header: t("admin.status", "Status"), align: "center", render: (w: any) => <Badge tone={w.status === "active" ? "success" : "muted"}>{w.status}</Badge> },
                  { key: "createdAt", header: t("admin.createdAt", "Created"), render: (w: any) => <span className="text-sm">{w.createdAt}</span> },
                  { key: "actions", header: "", align: "right", render: (w: any) => (
                    <div className="flex items-center gap-1 justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8"
                        onClick={() => openEditModal(w)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteWorkspace(w.id, w.name)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )},
                ]}
              />
            )}
          </>
        )}
      </DashboardCard>

      {addOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setAddOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t("admin.addWorkspace", "Add Workspace")}</h2>
              <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddWorkspace} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("common.name", "Name")}</label>
                <Input type="text" placeholder={t("admin.workspaceName", "Workspace name")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("admin.slug", "Slug")}</label>
                <Input type="text" placeholder={t("admin.slugPlaceholder", "workspace-slug")} value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("common.description", "Description")}</label>
                <Input type="text" placeholder={t("admin.workspaceDescription", "Workspace description")} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("admin.status", "Status")}</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="active">{t("admin.active", "Active")}</option>
                  <option value="inactive">{t("admin.inactive", "Inactive")}</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? t("admin.creating", "Creating...") : t("admin.create", "Create")}</Button>
              </div>
            </form>
          </div>
        </>
      )}

      {editOpen && editingWorkspace && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setEditOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t("admin.editWorkspace", "Edit Workspace")}</h2>
              <button onClick={() => setEditOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditWorkspace} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("common.name", "Name")}</label>
                <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("admin.slug", "Slug")}</label>
                <Input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("common.description", "Description")}</label>
                <Input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("admin.status", "Status")}</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="active">{t("admin.active", "Active")}</option>
                  <option value="inactive">{t("admin.inactive", "Inactive")}</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? t("admin.updating", "Updating...") : t("admin.update", "Update")}</Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
