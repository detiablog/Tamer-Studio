"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, Loader, X, Trash2, Edit, Play, Pause, BarChart3, Settings2, GitBranch } from "lucide-react";
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

const MOCK_EXECUTION_ANALYTICS = {
  totalRuns: 1247,
  successRate: 94.2,
  avgDuration: "2m 34s",
  totalCreditsUsed: 8420,
  recentRuns: [
    { id: "run-1", workflow: "Image Pipeline", status: "completed", duration: "1m 42s", credits: 12, date: "2026-07-31T12:00:00Z" },
    { id: "run-2", workflow: "Content Scheduler", status: "running", duration: "0m 30s", credits: 5, date: "2026-07-31T12:05:00Z" },
    { id: "run-3", workflow: "Video Caption", status: "failed", duration: "3m 10s", credits: 25, date: "2026-07-31T11:30:00Z" },
    { id: "run-4", workflow: "Batch Resize", status: "completed", duration: "0m 45s", credits: 3, date: "2026-07-31T10:00:00Z" },
    { id: "run-5", workflow: "Storyboard Gen", status: "completed", duration: "5m 20s", credits: 40, date: "2026-07-31T09:00:00Z" },
  ],
};

const MOCK_NODE_LIBRARY = [
  { id: "prompt", name: "Prompt", category: "Input", enabled: true, usageCount: 892 },
  { id: "reference_image", name: "Reference Image", category: "Input", enabled: true, usageCount: 456 },
  { id: "upload", name: "Upload", category: "Input", enabled: true, usageCount: 234 },
  { id: "ai_image", name: "AI Image", category: "AI", enabled: true, usageCount: 789 },
  { id: "ai_video", name: "AI Video", category: "AI", enabled: true, usageCount: 345 },
  { id: "ai_storyboard", name: "Storyboard", category: "AI", enabled: true, usageCount: 167 },
  { id: "ai_caption", name: "Caption", category: "AI", enabled: true, usageCount: 234 },
  { id: "resize", name: "Resize", category: "Processing", enabled: true, usageCount: 567 },
  { id: "condition", name: "Condition", category: "Logic", enabled: true, usageCount: 123 },
  { id: "delay", name: "Delay", category: "Logic", enabled: false, usageCount: 45 },
  { id: "storage", name: "Storage", category: "Output", enabled: true, usageCount: 678 },
  { id: "notification", name: "Notification", category: "Output", enabled: true, usageCount: 345 },
  { id: "publish", name: "Publish", category: "Output", enabled: true, usageCount: 234 },
];

const MOCK_SYSTEM_LIMITS = {
  maxWorkflows: 50,
  maxNodesPerWorkflow: 100,
  maxConcurrentRuns: 5,
  maxExecutionTime: 300,
  creditCostPerNode: 1,
  enableCustomNodes: true,
};

export function AdminWorkflowsPageClient() {
  const { t } = useLocalizationContext();
  const { data, error, isLoading } = useSWR("/api/workflows", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });

  const [workflows, setWorkflows] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"workflows" | "templates" | "analytics" | "nodes" | "limits">("workflows");
  const [limits, setLimits] = React.useState(MOCK_SYSTEM_LIMITS);
  const [nodeLibrary, setNodeLibrary] = React.useState(MOCK_NODE_LIBRARY);
  const [savingLimits, setSavingLimits] = React.useState(false);

  React.useEffect(() => {
    if (data?.data && data.success) {
      setWorkflows(data.data);
    } else if (error) {
      setWorkflows([]);
    }
  }, [data, error]);

  const filtered = (workflows || []).filter((w: any) => {
    const matchesSearch = w.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || w.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleToggleNode = (nodeId: string) => {
    setNodeLibrary((prev) => prev.map((n) => (n.id === nodeId ? { ...n, enabled: !n.enabled } : n)));
    toast.success(t("common.success", "Success"));
  };

  const handleSaveLimits = async () => {
    setSavingLimits(true);
    try {
      const response = await fetch("/api/admin/workflow-limits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(limits),
      });
      if (!response.ok) {
        toast.error(t("common.error", "Error"));
        return;
      }
      toast.success(t("admin.settings.saved", "Settings saved"));
    } catch {
      toast.error(t("common.error", "Error"));
    } finally {
      setSavingLimits(false);
    }
  };

  const tabs = [
    { id: "workflows", label: t("workflows.title", "Workflows") },
    { id: "templates", label: t("workflows.templates", "Templates") },
    { id: "analytics", label: t("admin.analytics.label", "Analytics") },
    { id: "nodes", label: "Node Library" },
    { id: "limits", label: "System Limits" },
  ] as const;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.workflows", "Workflows") }]} />

      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("workflows.title", "Workflows")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.workflowsDescription", "Manage workflow templates, analytics, and system configuration")}</p>
        </div>

        <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "workflows" && (
          <>
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
                <Button variant="outline" size="sm" onClick={() => setFilterOpen(!filterOpen)}>
                  <Filter className="mr-2 size-4" />
                  {t("common.filter", "Filter")}
                </Button>
                {filterOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t("workflows.workflowStatus", "Status")}</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="all">{t("admin.allStatus", "All Status")}</option>
                        <option value="active">{t("admin.active", "Active")}</option>
                        <option value="draft">{t("workflows.execution.queued", "Queued")}</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isLoading && workflows.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <AdminDataTable
                data={filtered}
                keyExtractor={(w: any) => w.id}
                columns={[
                  { key: "name", header: t("workflows.workflowName", "Workflow Name"), render: (w: any) => <p className="font-medium text-sm">{w.name}</p> },
                  { key: "status", header: t("workflows.workflowStatus", "Status"), align: "center", render: (w: any) => <Badge tone={w.status === "active" ? "success" : "muted"}>{w.status}</Badge> },
                  { key: "nodeCount", header: t("workflows.workflowNodes", "Nodes"), render: (w: any) => <span className="text-sm">{w.nodeCount || 0}</span> },
                  { key: "runCount", header: t("workflows.workflowRuns", "Runs"), render: (w: any) => <span className="text-sm">{w.runCount || 0}</span> },
                  { key: "lastRun", header: t("workflows.lastRun", "Last Run"), render: (w: any) => <span className="text-sm">{w.lastRun ? new Date(w.lastRun).toLocaleDateString() : "—"}</span> },
                  { key: "actions", header: "", align: "right", render: (w: any) => (
                    <div className="flex items-center gap-1 justify-end">
                      <Button variant="ghost" size="icon" className="size-8">
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8">
                        <Play className="size-4" />
                      </Button>
                    </div>
                  )},
                ]}
              />
            )}
          </>
        )}

        {activeTab === "templates" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">{t("workflows.templateLibrary", "Template Library")}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Image Generation Pipeline", category: "AI", nodes: 5, uses: 234 },
                { name: "Content Scheduler", category: "Output", nodes: 4, uses: 189 },
                { name: "Storyboard Generator", category: "AI", nodes: 6, uses: 156 },
                { name: "Batch Resize & Upload", category: "Processing", nodes: 3, uses: 312 },
                { name: "Conditional AI Router", category: "Logic", nodes: 4, uses: 78 },
                { name: "Video Caption Workflow", category: "AI", nodes: 4, uses: 145 },
              ].map((tpl, i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge tone="muted">{tpl.category}</Badge>
                    <span className="text-xs text-muted-foreground">{tpl.uses} uses</span>
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{tpl.name}</h3>
                  <p className="text-xs text-muted-foreground">{tpl.nodes} nodes</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Runs</p>
                <p className="text-2xl font-bold">{MOCK_EXECUTION_ANALYTICS.totalRuns.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                <p className="text-2xl font-bold">{MOCK_EXECUTION_ANALYTICS.successRate}%</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Avg Duration</p>
                <p className="text-2xl font-bold">{MOCK_EXECUTION_ANALYTICS.avgDuration}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Credits Used</p>
                <p className="text-2xl font-bold">{MOCK_EXECUTION_ANALYTICS.totalCreditsUsed.toLocaleString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3">Recent Executions</h3>
              <AdminDataTable
                data={MOCK_EXECUTION_ANALYTICS.recentRuns}
                keyExtractor={(r: any) => r.id}
                columns={[
                  { key: "workflow", header: "Workflow", render: (r: any) => <p className="font-medium text-sm">{r.workflow}</p> },
                  { key: "status", header: "Status", align: "center", render: (r: any) => <Badge tone={r.status === "completed" ? "success" : r.status === "running" ? "warning" : "muted"}>{r.status}</Badge> },
                  { key: "duration", header: "Duration", render: (r: any) => <span className="text-sm">{r.duration}</span> },
                  { key: "credits", header: "Credits", render: (r: any) => <span className="text-sm">{r.credits}</span> },
                  { key: "date", header: "Date", render: (r: any) => <span className="text-sm">{new Date(r.date).toLocaleString()}</span> },
                ]}
              />
            </div>
          </div>
        )}

        {activeTab === "nodes" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">Enable or disable node types available to users</p>
            <AdminDataTable
              data={nodeLibrary}
              keyExtractor={(n: any) => n.id}
              columns={[
                { key: "name", header: "Node", render: (n: any) => <p className="font-medium text-sm">{n.name}</p> },
                { key: "category", header: "Category", render: (n: any) => <Badge tone="muted">{n.category}</Badge> },
                { key: "usageCount", header: "Usage Count", render: (n: any) => <span className="text-sm">{n.usageCount}</span> },
                { key: "enabled", header: "Enabled", align: "center", render: (n: any) => (
                  <button
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${n.enabled ? "bg-primary" : "bg-muted"}`}
                    onClick={() => handleToggleNode(n.id)}
                  >
                    <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${n.enabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
                  </button>
                )},
              ]}
            />
          </div>
        )}

        {activeTab === "limits" && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-semibold">System Limits Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Max Workflows per Workspace</label>
                <Input
                  type="number"
                  value={limits.maxWorkflows}
                  onChange={(e) => setLimits((prev) => ({ ...prev, maxWorkflows: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Max Nodes per Workflow</label>
                <Input
                  type="number"
                  value={limits.maxNodesPerWorkflow}
                  onChange={(e) => setLimits((prev) => ({ ...prev, maxNodesPerWorkflow: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Max Concurrent Runs</label>
                <Input
                  type="number"
                  value={limits.maxConcurrentRuns}
                  onChange={(e) => setLimits((prev) => ({ ...prev, maxConcurrentRuns: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Max Execution Time (seconds)</label>
                <Input
                  type="number"
                  value={limits.maxExecutionTime}
                  onChange={(e) => setLimits((prev) => ({ ...prev, maxExecutionTime: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Credit Cost per Node</label>
                <Input
                  type="number"
                  value={limits.creditCostPerNode}
                  onChange={(e) => setLimits((prev) => ({ ...prev, creditCostPerNode: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${limits.enableCustomNodes ? "bg-primary" : "bg-muted"}`}
                  onClick={() => setLimits((prev) => ({ ...prev, enableCustomNodes: !prev.enableCustomNodes }))}
                >
                  <span className={`inline-block size-3.5 rounded-full bg-white transition-transform ${limits.enableCustomNodes ? "translate-x-4.5" : "translate-x-0.5"}`} />
                </button>
                <label className="text-sm font-medium">Enable Custom Nodes</label>
              </div>
              <Button onClick={handleSaveLimits} disabled={savingLimits}>
                {savingLimits ? <Loader className="mr-2 size-4 animate-spin" /> : null}
                {t("admin.saveChanges", "Save Changes")}
              </Button>
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
