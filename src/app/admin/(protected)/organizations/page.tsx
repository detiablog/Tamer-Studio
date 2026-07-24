"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, UserPlus, Loader, X, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const MOCK_ORGS = [
  { id: "1", name: "Acme Studio", plan: "Pro", status: "Active", members: 5, createdAt: "Oct 1, 2026" },
  { id: "2", name: "Marketing Team", plan: "Enterprise", status: "Active", members: 12, createdAt: "Sep 15, 2026" },
  { id: "3", name: "Solo Creator", plan: "Starter", status: "Active", members: 1, createdAt: "Aug 20, 2026" },
];

const fetcher = (url: string) => 
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      console.error(`[Fetcher] Failed to fetch ${url}:`, error);
      throw error;
    });

export default function AdminOrganizationsPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/admin/organizations", fetcher, { 
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  
  const [orgs, setOrgs] = React.useState(MOCK_ORGS);
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [planFilter, setPlanFilter] = React.useState<string>("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<any>(null);
  const [formLoading, setFormLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "", plan: "Starter", status: "Active" });

  React.useEffect(() => {
    if (data?.data && data.success) {
      setOrgs(data.data);
    }
  }, [data]);

  const isUsingMockData = error || (data && !data?.success);

  const filtered = orgs.filter((o: any) => {
    const matchesSearch = o.name.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === "all" || o.plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to create organization");
        return;
      }

      toast.success("Organization created successfully!");
      setFormData({ name: "", plan: "Starter", status: "Active" });
      setAddOpen(false);
      mutate(); // Refetch data dari database
    } catch (error) {
      toast.error("Error creating organization");
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    setFormLoading(true);

    try {
      const response = await fetch(`/api/admin/organizations/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to update organization");
        return;
      }

      toast.success("Organization updated successfully!");
      setFormData({ name: "", plan: "Starter", status: "Active" });
      setEditing(null);
      setEditOpen(false);
      mutate(); // Refetch data dari database
    } catch (error) {
      toast.error("Error updating organization");
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("Failed to delete organization");
        return;
      }

      toast.success("Organization deleted successfully!");
      mutate(); // Refetch data dari database
    } catch (error) {
      toast.error("Error deleting organization");
      console.error(error);
    }
  };

  const openEdit = (org: any) => {
    setEditing(org);
    setFormData({ name: org.name, plan: org.plan, status: org.status });
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Organizations" }]} />
      
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage organizations and teams</p>
        </div>

        <div className="flex items-center gap-2 pb-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search organizations..."
              className="pl-9"
              disabled={isLoading}
            />
          </div>
          
          <div className="relative">
            <Button variant="outline" size="sm" onClick={() => setFilterOpen(!filterOpen)}>
              <Filter className="mr-2 size-4" />
              Filter
            </Button>
            
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
                <select 
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Plans</option>
                  <option value="Starter">Starter</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            )}
          </div>

          <Button size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus className="mr-2 size-4" />
            Add Organization
          </Button>
        </div>

        {isLoading && !data ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Loading organizations...</p>
          </div>
        ) : (
          <>
            {isUsingMockData && (
              <div className="mb-4 rounded-lg border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs text-amber-700 dark:text-amber-300">
                ℹ️ Database connection failed, showing mock data
              </div>
            )}
            <AdminDataTable
              data={filtered}
              keyExtractor={(o) => o.id}
              columns={[
                { key: "name", header: "Organization", render: (o: any) => <span className="font-medium text-sm">{o.name}</span> },
                { key: "plan", header: "Plan", render: (o: any) => <Badge>{o.plan}</Badge> },
                { key: "status", header: "Status", render: (o: any) => <Badge tone={o.status === "Active" ? "success" : "muted"}>{o.status}</Badge> },
                { key: "members", header: "Members", align: "center", render: (o: any) => <span className="text-sm">{o.members}</span> },
                { key: "created", header: "Created", render: (o: any) => <span className="text-sm">{o.createdAt}</span> },
                { key: "actions", header: "", align: "right", render: (o: any) => (
                  <div className="flex items-center gap-1 justify-end">
                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(o)}>
                      <Edit className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => handleDelete(o.id, o.name)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                )},
              ]}
            />
          </>
        )}
      </DashboardCard>

      {/* Add Modal */}
      {addOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setAddOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Add Organization</h2>
              <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name</label>
                <Input type="text" placeholder="Organization name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Plan</label>
                <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="Starter">Starter</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? "Creating..." : "Create"}</Button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {editOpen && editing && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setEditOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Organization</h2>
              <button onClick={() => setEditOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name</label>
                <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Plan</label>
                <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="Starter">Starter</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? "Updating..." : "Update"}</Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
