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

const MOCK_BILLING = [
  { id: "bill_1", workspaceId: "ws_1", plan: "Pro", price: "99.00", currency: "USD", billingCycle: "monthly", status: "active", createdAt: "23/07/2026" },
  { id: "bill_2", workspaceId: "ws_2", plan: "Starter", price: "29.00", currency: "USD", billingCycle: "monthly", status: "active", createdAt: "22/07/2026" },
  { id: "bill_3", workspaceId: "ws_3", plan: "Enterprise", price: "299.00", currency: "USD", billingCycle: "yearly", status: "active", createdAt: "21/07/2026" },
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

export default function AdminBillingPage() {
  const { data, error, isLoading, mutate } = useSWR("/api/admin/billing", fetcher, { 
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 0,
  });
  
  const [billings, setBillings] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editingBilling, setEditingBilling] = React.useState<any>(null);
  const [originalData, setOriginalData] = React.useState<any>(null);
  const [formLoading, setFormLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({ workspaceId: "", plan: "", price: "", currency: "USD", billingCycle: "monthly", status: "active" });

  React.useEffect(() => {
    if (data?.data && data.success) {
      setBillings(data.data);
    } else if (error && billings.length === 0) {
      setBillings(MOCK_BILLING);
    }
  }, [data, error]);

  const isUsingMockData = !data && error;

  const filtered = (billings || []).filter((b: any) => {
    const matchesSearch = b.plan.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const openEditModal = (billing: any) => {
    setEditingBilling(billing);
    setOriginalData({ workspaceId: billing.workspaceId, plan: billing.plan, price: billing.price, currency: billing.currency, billingCycle: billing.billingCycle, status: billing.status });
    setFormData({ workspaceId: billing.workspaceId, plan: billing.plan, price: billing.price, currency: billing.currency, billingCycle: billing.billingCycle, status: billing.status });
    setEditOpen(true);
  };

  const handleAddBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await fetch("/api/admin/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to create billing");
        return;
      }

      toast.success("Billing plan created successfully!");
      setFormData({ workspaceId: "", plan: "", price: "", currency: "USD", billingCycle: "monthly", status: "active" });
      setAddOpen(false);
      mutate();
    } catch (error) {
      toast.error("Error creating billing");
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBilling?.id) {
      toast.error("Billing ID not found");
      return;
    }

    setFormLoading(true);

    try {
      const changedFields: any = {};

      Object.keys(formData).forEach(key => {
        if (formData[key as keyof typeof formData] !== originalData?.[key]) {
          changedFields[key] = formData[key as keyof typeof formData];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        toast.info("No changes made");
        return;
      }

      const response = await fetch(`/api/admin/billing/${editingBilling.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedFields),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to update billing");
        return;
      }

      toast.success("Billing plan updated successfully!");
      setFormData({ workspaceId: "", plan: "", price: "", currency: "USD", billingCycle: "monthly", status: "active" });
      setOriginalData(null);
      setEditingBilling(null);
      setEditOpen(false);
      mutate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error updating billing");
      console.error(error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBilling = async (billingId: string, plan: string) => {
    if (!confirm(`Delete "${plan}" plan?`)) return;

    try {
      const response = await fetch(`/api/admin/billing/${billingId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete" }));
        toast.error(errorData.error || "Failed to delete billing");
        return;
      }

      toast.success("Billing plan deleted successfully!");
      mutate();
    } catch (error) {
      toast.error("Error deleting billing");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Billing" }]} />
      
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Billing Plans</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage billing plans and pricing</p>
        </div>

        <div className="flex items-center gap-2 pb-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search billing plans..."
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
              Filter
            </Button>
            
            {filterOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 size-4" />
            Add Plan
          </Button>
        </div>

        {isLoading && billings.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">Loading billing plans...</p>
          </div>
        ) : (
          <>
            {isUsingMockData && (
              <div className="mb-4 rounded-lg border border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs text-amber-700 dark:text-amber-300">
                ℹ️ Database connection failed, showing mock data
              </div>
            )}
            {billings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No billing plans found</p>
              </div>
            ) : (
              <AdminDataTable
                data={filtered}
                keyExtractor={(b) => b.id}
                columns={[
                  { key: "plan", header: "Plan", render: (b: any) => <p className="font-medium text-sm">{b.plan}</p> },
                  { key: "price", header: "Price", render: (b: any) => <p className="text-sm">{b.currency} {b.price}</p> },
                  { key: "billingCycle", header: "Cycle", render: (b: any) => <p className="text-sm">{b.billingCycle}</p> },
                  { key: "status", header: "Status", align: "center", render: (b: any) => <Badge tone={b.status === "active" ? "success" : "muted"}>{b.status}</Badge> },
                  { key: "createdAt", header: "Created", render: (b: any) => <span className="text-sm">{b.createdAt}</span> },
                  { key: "actions", header: "", align: "right", render: (b: any) => (
                    <div className="flex items-center gap-1 justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8"
                        onClick={() => openEditModal(b)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteBilling(b.id, b.plan)}
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
              <h2 className="text-xl font-semibold">Add Billing Plan</h2>
              <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleAddBilling} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Plan Name</label>
                <Input type="text" placeholder="Plan name" value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Price</label>
                <Input type="number" step="0.01" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Currency</label>
                <Input type="text" placeholder="USD" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Billing Cycle</label>
                <select value={formData.billingCycle} onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
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

      {editOpen && editingBilling && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setEditOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Billing Plan</h2>
              <button onClick={() => setEditOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleEditBilling} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Plan Name</label>
                <Input type="text" value={formData.plan} onChange={(e) => setFormData({ ...formData, plan: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Price</label>
                <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Currency</label>
                <Input type="text" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Billing Cycle</label>
                <select value={formData.billingCycle} onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
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
