"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, RefreshCw, ToggleLeft, ToggleRight, Clock, History, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const MOCK_FEATURE_FLAGS = [
  { id: "ff_1", key: "dark_mode", name: "Dark Mode", description: "Enable dark mode UI", status: "Enabled", rollout: "100%", lastModified: "23/07/2026", version: "v2.1.0" },
  { id: "ff_2", key: "new_dashboard", name: "New Dashboard", description: "Redesigned dashboard layout", status: "Enabled", rollout: "50%", lastModified: "22/07/2026", version: "v2.0.0" },
  { id: "ff_3", key: "ai_suggestions", name: "AI Suggestions", description: "AI-powered content suggestions", status: "Disabled", rollout: "0%", lastModified: "20/07/2026", version: "v1.9.0" },
  { id: "ff_4", key: "beta_export", name: "Beta Export", description: "Beta export feature for reports", status: "Enabled", rollout: "25%", lastModified: "19/07/2026", version: "v2.1.0" },
  { id: "ff_5", key: "maintenance_mode", name: "Maintenance Mode", description: "Enable site maintenance mode", status: "Disabled", rollout: "0%", lastModified: "18/07/2026", version: "v1.8.0" },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = React.useState(MOCK_FEATURE_FLAGS);
  const [search, setSearch] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ key: "", name: "", description: "", status: "Enabled", rollout: "100%" });

  const filtered = flags.filter((f) => f.key.toLowerCase().includes(search.toLowerCase()) || f.name.toLowerCase().includes(search.toLowerCase()));

  const handleToggle = (id: string) => {
    setFlags((prev) => prev.map((f) => f.id === id ? { ...f, status: f.status === "Enabled" ? "Disabled" : "Enabled" } : f));
    toast.success("Feature flag toggled");
  };

  const handleAdd = () => {
    setFlags((prev) => [...prev, { ...formData, id: `ff_${prev.length + 1}`, rollout: formData.rollout || "0%", lastModified: new Date().toLocaleDateString("en-GB"), version: "v1.0.0" }]);
    setFormData({ key: "", name: "", description: "", status: "Enabled", rollout: "100%" });
    setAddOpen(false);
    toast.success("Feature flag created");
  };

  const handleViewHistory = (id: string) => {
    const flag = flags.find((f) => f.id === id);
    const mockHistory = [
      { date: "23/07/2026", action: "Enabled", user: "Admin" },
      { date: "20/07/2026", action: "Disabled", user: "Admin" },
      { date: "18/07/2026", action: "Created", user: "Admin" },
    ];
    alert(`History for "${flag?.name}":\n\n${mockHistory.map((h) => `${h.date} — ${h.action} by ${h.user}`).join("\n")}`);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Feature Flags" }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Feature Flags</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage feature toggles and rollouts</p>
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="mr-2 size-4" />Add Flag</Button>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search flags..." className="pl-9" />
          </div>
        </div>

        <AdminDataTable
          data={filtered}
          keyExtractor={(f) => f.id}
          columns={[
            { key: "key", header: "Key", render: (f: any) => <code className="text-xs bg-muted/50 px-2 py-0.5 rounded">{f.key}</code> },
            { key: "name", header: "Name", render: (f: any) => <span className="font-medium text-sm">{f.name}</span> },
            { key: "status", header: "Status", render: (f: any) => <Badge tone={f.status === "Enabled" ? "success" : "muted"}>{f.status}</Badge> },
            { key: "rollout", header: "Rollout", render: (f: any) => <div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/40"><div className="h-full rounded-full bg-primary transition-all" style={{ width: f.rollout }} /></div><span className="text-xs">{f.rollout}</span></div> },
            { key: "lastModified", header: "Last Modified", render: (f: any) => <span className="text-xs text-muted-foreground">{f.lastModified}</span> },
            { key: "actions", header: "", align: "right", render: (f: any) => (
              <div className="flex items-center gap-1 justify-end">
                <Button variant="ghost" size="icon-xs" onClick={() => handleToggle(f.id)} aria-label="Toggle flag">
                  {f.status === "Enabled" ? <ToggleRight className="size-4 text-green-600" /> : <ToggleLeft className="size-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => handleViewHistory(f.id)} aria-label="View history"><History className="size-3.5" /></Button>
              </div>
            )},
          ]}
        />
      </DashboardCard>

      {addOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setAddOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Feature Flag</h2>
              <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }} className="space-y-4">
              <div><label className="text-sm font-medium mb-1.5 block">Key</label><Input value={formData.key} onChange={(e) => setFormData({ ...formData, key: e.target.value })} placeholder="feature_key" required /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Name</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Feature Name" required /></div>
              <div><label className="text-sm font-medium mb-1.5 block">Description</label><Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" /></div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">Create</Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}