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

export default function AdminOrganizationsPage() {
  const { t } = useLocalizationContext();
  const { data, error, isLoading, mutate } = useSWR("/api/admin/organizations", fetcher, { 
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  
  const [orgs, setOrgs] = React.useState<any[]>([]);
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

  const hasActiveFilters = search.trim() || planFilter !== "all";

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
        toast.error(typeof result.error === "string" ? result.error : (result.error?.message || result.error?.toString?.() || t("admin.failedToCreateOrg", "Failed to create organization")));
        return;
      }

      toast.success(t("admin.orgCreatedSuccess", "Organization created successfully!"));
      setFormData({ name: "", plan: "Starter", status: "Active" });
      setAddOpen(false);
      mutate();
    } catch (error) {
      toast.error(t("admin.errorCreatingOrg", "Error creating organization"));
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
        toast.error(typeof result.error === "string" ? result.error : (result.error?.message || result.error?.toString?.() || t("admin.failedToUpdateOrg", "Failed to update organization")));
        return;
      }

      toast.success(t("admin.orgUpdatedSuccess", "Organization updated successfully!"));
      setFormData({ name: "", plan: "Starter", status: "Active" });
      setEditing(null);
      setEditOpen(false);
      mutate();
    } catch (error) {
      toast.error(t("admin.errorUpdatingOrg", "Error updating organization"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t("admin.confirmDeleteOrg", `Delete "{{name}}"?`).replace("{{name}}", name))) return;

    try {
      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error(t("admin.failedToDeleteOrg", "Failed to delete organization"));
        return;
      }

      toast.success(t("admin.orgDeletedSuccess", "Organization deleted successfully!"));
      mutate();
    } catch (error) {
      toast.error(t("admin.errorDeletingOrg", "Error deleting organization"));
    }
  };

  const openEdit = (org: any) => {
    setEditing(org);
    setFormData({ name: org.name, plan: org.plan, status: org.status });
    setEditOpen(true);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.organizations", "Organizations") }]} />
      
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("admin.organizations", "Organizations")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.manageOrganizations", "Manage organizations and teams")}</p>
        </div>

        <div className="flex items-center gap-2 pb-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.searchOrganizations", "Search organizations...")}
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
              <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
                <select 
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="all">{t("admin.allPlans", "All Plans")}</option>
                  <option value="Starter">{t("planStarter", "Starter")}</option>
                  <option value="Pro">{t("planPro", "Pro")}</option>
                  <option value="Enterprise">{t("planEnterprise", "Enterprise")}</option>
                </select>
              </div>
            )}
          </div>

          <Button size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus className="mr-2 size-4" />
            {t("admin.addOrganization", "Add Organization")}
          </Button>
        </div>

        {isLoading && !data ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("admin.loadingOrganizations", "Loading organizations...")}</p>
          </div>
        ) : (
          <>
            {isUsingMockData && (
              <div className="mb-4 rounded-lg border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs text-amber-700 dark:text-amber-300">
                {t("admin.databaseError", "Database connection failed. Please check your connection and try again.")}
              </div>
            )}
            <AdminDataTable
              data={filtered}
              keyExtractor={(o) => o.id}
              columns={[
                { key: "name", header: t("admin.organization", "Organization"), render: (o: any) => <span className="font-medium text-sm">{o.name}</span> },
                { key: "plan", header: t("admin.plan", "Plan"), render: (o: any) => <Badge>{t(`plan${o.plan}`, o.plan)}</Badge> },
                { key: "status", header: t("admin.status", "Status"), render: (o: any) => <Badge tone={o.status === "Active" ? "success" : "muted"}>{t(`admin.${o.status.toLowerCase()}`, o.status)}</Badge> },
                { key: "members", header: t("admin.members", "Members"), align: "center", render: (o: any) => <span className="text-sm">{o.members}</span> },
                { key: "created", header: t("admin.createdAt", "Created"), render: (o: any) => <span className="text-sm">{o.createdAt}</span> },
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

      {addOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setAddOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t("admin.addOrganization", "Add Organization")}</h2>
              <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("common.name", "Name")}</label>
                <Input type="text" placeholder={t("admin.organizationName", "Organization name")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("admin.plan", "Plan")}</label>
                <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="Starter">{t("planStarter", "Starter")}</option>
                  <option value="Pro">{t("planPro", "Pro")}</option>
                  <option value="Enterprise">{t("planEnterprise", "Enterprise")}</option>
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

      {editOpen && editing && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setEditOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t("admin.editOrganization", "Edit Organization")}</h2>
              <button onClick={() => setEditOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("common.name", "Name")}</label>
                <Input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("admin.plan", "Plan")}</label>
                <select value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="Starter">{t("planStarter", "Starter")}</option>
                  <option value="Pro">{t("planPro", "Pro")}</option>
                  <option value="Enterprise">{t("planEnterprise", "Enterprise")}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">{t("admin.status", "Status")}</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="Active">{t("admin.active", "Active")}</option>
                  <option value="Suspended">{t("admin.suspended", "Suspended")}</option>
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
