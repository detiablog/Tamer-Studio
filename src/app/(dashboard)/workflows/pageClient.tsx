"use client";

import * as React from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { Search, Filter, Plus, Loader, X, Play, Copy, Trash2, Edit, GitBranch, Clock, MoreVertical } from "lucide-react";
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

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: string;
  nodeCount: number;
  lastRun: string | null;
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  nodeCount: number;
  icon: string;
}

const MOCK_TEMPLATES: WorkflowTemplate[] = [
  { id: "tpl-1", name: "Image Generation Pipeline", description: "Generate images from prompts with post-processing", category: "AI", nodeCount: 5, icon: "ai_image" },
  { id: "tpl-2", name: "Content Scheduler", description: "Auto-publish content to multiple platforms", category: "Output", nodeCount: 4, icon: "publish" },
  { id: "tpl-3", name: "Story Board Generator", description: "Create storyboard sequences from scripts", category: "AI", nodeCount: 6, icon: "ai_storyboard" },
  { id: "tpl-4", name: "Batch Resize & Upload", description: "Resize images and upload to storage", category: "Processing", nodeCount: 3, icon: "resize" },
  { id: "tpl-5", name: "Conditional AI Router", description: "Route tasks based on conditions", category: "Logic", nodeCount: 4, icon: "condition" },
  { id: "tpl-6", name: "Video Caption Workflow", description: "Generate and overlay captions on video", category: "AI", nodeCount: 4, icon: "ai_caption" },
];

const STATUS_COLORS: Record<string, "success" | "warning" | "muted" | "info"> = {
  active: "success",
  draft: "muted",
  running: "warning",
  failed: "info",
};

export function WorkflowsPageClient() {
  const { t } = useLocalizationContext();
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR("/api/workflows", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });

  const [workflows, setWorkflows] = React.useState<Workflow[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("updatedAt");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = React.useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);
  const [actionsOpen, setActionsOpen] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (data?.data && data.success) {
      setWorkflows(data.data);
    } else if (error) {
      setWorkflows([]);
    }
  }, [data, error]);

  const filtered = React.useMemo(() => {
    let result = (workflows || []).filter((w) => {
      const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase()) ||
        (w.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || w.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "nodeCount") return b.nodeCount - a.nodeCount;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return result;
  }, [workflows, search, statusFilter, sortBy]);

  const handleCreateWorkflow = async (template?: WorkflowTemplate) => {
    try {
      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template ? `${template.name} (Copy)` : t("workflows.createWorkflow", "Create Workflow"),
          description: template?.description || "",
          templateId: template?.id,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("workflows.createWorkflow", "Create Workflow") + "!");
      setTemplateDialogOpen(false);
      mutate();
      if (result.data?.id) {
        router.push(`/workflows/${result.data.id}` as any);
      }
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleDuplicateWorkflow = async (workflow: Workflow) => {
    try {
      const response = await fetch(`/api/workflows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${workflow.name} (Copy)`, duplicateFrom: workflow.id }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("workflows.duplicateWorkflow", "Duplicate Workflow") + "!");
      mutate();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      const response = await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      if (!response.ok) {
        toast.error(t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("workflows.deleteWorkflow", "Delete Workflow") + "!");
      setDeleteConfirmId(null);
      mutate();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleRunWorkflow = async (id: string) => {
    try {
      const response = await fetch(`/api/workflows/${id}/run`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("workflows.runWorkflow", "Run Workflow") + "!");
      mutate();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("workflows.title", "Workflows")}
        description={t("workflows.description", "Create and manage AI automation workflows")}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setTemplateDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              {t("workflows.createWorkflow", "Create Workflow")}
            </Button>
          </div>
        }
      />

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
        <div className="relative">
          <Button variant="outline" size="sm" onClick={() => setFilterOpen(!filterOpen)}>
            <Filter className="mr-2 size-4" />
            {t("common.filter", "Filter")}
          </Button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("workflows.workflowStatus", "Status")}</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">{t("common.all", "All")}</option>
                    <option value="active">{t("admin.active", "Active")}</option>
                    <option value="draft">{t("workflows.execution.queued", "Queued")}</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("common.filter", "Filter")}</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="updatedAt">{t("workflows.lastRun", "Last Run")}</option>
                    <option value="name">{t("workflows.workflowName", "Workflow Name")}</option>
                    <option value="nodeCount">{t("workflows.workflowNodes", "Nodes")}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading && workflows.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="size-6 animate-spin text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
        </div>
      ) : filtered.length === 0 ? (
        <DashboardCard>
          <div className="flex flex-col items-center justify-center py-12">
            <GitBranch className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-center">{t("workflows.noWorkflows", "No workflows yet. Create your first workflow!")}</p>
            <Button className="mt-4" size="sm" onClick={() => setTemplateDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              {t("workflows.createWorkflow", "Create Workflow")}
            </Button>
          </div>
        </DashboardCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((workflow) => (
            <DashboardCard key={workflow.id}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                    <GitBranch className="size-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{workflow.name}</h3>
                  </div>
                </div>
                <div className="relative">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => setActionsOpen(actionsOpen === workflow.id ? null : workflow.id)}>
                    <MoreVertical className="size-4" />
                  </Button>
                  {actionsOpen === workflow.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActionsOpen(null)} />
                      <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-border bg-card p-1 shadow-lg z-50">
                        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={() => { router.push(`/workflows/${workflow.id}` as any); setActionsOpen(null); }}>
                          <Edit className="size-4" />
                          {t("workflows.editWorkflow", "Edit Workflow")}
                        </button>
                        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={() => { handleRunWorkflow(workflow.id); setActionsOpen(null); }}>
                          <Play className="size-4" />
                          {t("workflows.runWorkflow", "Run Workflow")}
                        </button>
                        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={() => { handleDuplicateWorkflow(workflow); setActionsOpen(null); }}>
                          <Copy className="size-4" />
                          {t("workflows.duplicateWorkflow", "Duplicate Workflow")}
                        </button>
                        <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10" onClick={() => { setDeleteConfirmId(workflow.id); setActionsOpen(null); }}>
                          <Trash2 className="size-4" />
                          {t("workflows.deleteWorkflow", "Delete Workflow")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {workflow.description && (
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{workflow.description}</p>
              )}
              <div className="flex items-center gap-2 mb-3">
                <Badge tone={STATUS_COLORS[workflow.status] || "muted"}>{workflow.status}</Badge>
                <span className="text-xs text-muted-foreground">{workflow.nodeCount} {t("workflows.workflowNodes", "Nodes")}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{workflow.lastRun ? new Date(workflow.lastRun).toLocaleDateString() : t("common.never", "Never")}</span>
                </div>
                <span>{workflow.runCount} {t("workflows.workflowRuns", "Runs")}</span>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      {deleteConfirmId && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setDeleteConfirmId(null)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">{t("workflows.deleteWorkflow", "Delete Workflow")}</h2>
            <p className="text-sm text-muted-foreground mb-6">{t("workflows.confirmDelete", "Are you sure you want to delete this workflow?")}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
              <Button variant="destructive" onClick={() => handleDeleteWorkflow(deleteConfirmId)} className="flex-1">{t("common.delete", "Delete")}</Button>
            </div>
          </div>
        </>
      )}

      {templateDialogOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setTemplateDialogOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t("workflows.templateLibrary", "Template Library")}</h2>
              <button onClick={() => setTemplateDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {MOCK_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  className="flex flex-col items-start gap-2 rounded-lg border border-border p-4 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => handleCreateWorkflow(template)}
                >
                  <div className="flex items-center gap-2">
                    <Badge tone="muted">{template.category}</Badge>
                    <span className="text-xs text-muted-foreground">{template.nodeCount} nodes</span>
                  </div>
                  <h3 className="text-sm font-semibold">{template.name}</h3>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" className="w-full" onClick={() => handleCreateWorkflow()}>
                <Plus className="mr-2 size-4" />
                {t("workflows.createWorkflow", "Create Workflow")}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
