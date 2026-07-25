"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, RefreshCw, Edit, Trash2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const MOCK_COUPONS = [
  { id: "c_1", code: "SAVE20", discount: "20%", type: "Percentage", expires: "Dec 31, 2026", usageCount: 142, maxUsage: 500, status: "Active" },
  { id: "c_2", code: "WELCOME10", discount: "10%", type: "Percentage", expires: "Jan 31, 2027", usageCount: 89, maxUsage: 200, status: "Active" },
  { id: "c_3", code: "FLAT50", discount: "$50", type: "Fixed", expires: "Nov 15, 2026", usageCount: 23, maxUsage: 100, status: "Active" },
  { id: "c_4", code: "EXPIRED5", discount: "5%", type: "Percentage", expires: "Jun 30, 2026", usageCount: 45, maxUsage: 100, status: "Expired" },
];

export default function CouponsPage() {
  const { t } = useLocalizationContext();
  const [coupons, setCoupons] = React.useState(MOCK_COUPONS);
  const [search, setSearch] = React.useState("");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [addOpen, setAddOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ code: "", discount: "", type: "Percentage", expires: "", status: "Active" });
  const [formLoading, setFormLoading] = React.useState(false);

  const filtered = coupons.filter((c) => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setCoupons((prev) => [...prev, { ...formData, id: `c_${prev.length + 1}`, usageCount: 0, maxUsage: 100 }]);
    setFormData({ code: "", discount: "", type: "Percentage", expires: "", status: "Active" });
    setAddOpen(false);
    setFormLoading(false);
    toast.success(t("admin.coupons.created", "Coupon created"));
  };

  const handleToggle = (id: string) => {
    setCoupons((prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === "Active" ? "Expired" : "Active" } : c));
    toast.success(t("admin.coupons.statusUpdated", "Coupon status updated"));
  };

  const handleDelete = (id: string, code: string) => {
    if (!confirm(t("admin.coupons.deleteConfirm", 'Delete coupon "{0}"?').replace("{0}", code))) return;
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.success(t("admin.coupons.deleted", "Coupon deleted"));
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.coupons", "Coupons") }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.coupons", "Coupons")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.coupons.description", "Manage discount codes and promotions")}</p>
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="mr-2 size-4" />{t("admin.add", "Add")} {t("admin.coupons.coupon", "Coupon")}</Button>
        </div>

        <div className="flex items-center gap-2 pb-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.coupons.search", "Search coupons...")} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" onClick={() => setFilterOpen(!filterOpen)}><Filter className="mr-2 size-4" />{t("common.filter", "Filter")}</Button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card p-4 shadow-lg z-50">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                <option value="all">{t("admin.coupons.allStatus", "All Status")}</option>
                <option value="active">{t("admin.active", "Active")}</option>
                <option value="expired">{t("admin.inactive", "Expired")}</option>
              </select>
            </div>
          )}
        </div>

        <AdminDataTable
          data={filtered}
          keyExtractor={(c) => c.id}
          columns={[
            { key: "code", header: t("admin.coupons.code", "Code"), render: (c: any) => <p className="font-medium text-sm">{c.code}</p> },
            { key: "discount", header: t("admin.coupons.discount", "Discount"), render: (c: any) => <span className="text-sm">{c.discount} ({c.type})</span> },
            { key: "status", header: t("common.status", "Status"), render: (c: any) => <Badge tone={c.status === "Active" ? "success" : "muted"}>{c.status}</Badge> },
            { key: "usageCount", header: t("admin.coupons.usage", "Usage"), render: (c: any) => <span className="text-sm">{c.usageCount} / {c.maxUsage}</span> },
            { key: "expires", header: t("admin.coupons.expires", "Expires"), render: (c: any) => <span className="text-sm">{c.expires}</span> },
            { key: "actions", header: "", align: "right", render: (c: any) => (
              <div className="flex items-center gap-1 justify-end">
                <Button variant="ghost" size="icon-xs" onClick={() => handleToggle(c.id)} aria-label={t("admin.coupons.toggle", "Toggle coupon")}>
                  {c.status === "Active" ? <ToggleRight className="size-4 text-green-600" /> : <ToggleLeft className="size-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => handleDelete(c.id, c.code)} aria-label={t("admin.coupons.delete", "Delete coupon")} className="text-destructive hover:text-destructive"><Trash2 className="size-3.5" /></Button>
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
              <h2 className="text-xl font-semibold">{t("admin.coupons.addCoupon", "Add Coupon")}</h2>
              <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><label className="text-sm font-medium mb-1.5 block">{t("admin.coupons.code", "Code")}</label><Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="SAVE20" required /></div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("admin.coupons.discount", "Discount")}</label><Input value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: e.target.value })} placeholder="20%" required /></div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("admin.coupons.type", "Type")}</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"><option value="Percentage">{t("admin.coupons.percentage", "Percentage")}</option><option value="Fixed">{t("admin.coupons.fixed", "Fixed")}</option></select></div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("admin.coupons.expiry", "Expires")}</label><Input type="date" value={formData.expires} onChange={(e) => setFormData({ ...formData, expires: e.target.value })} required /></div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? t("admin.coupons.creating", "Creating...") : t("admin.create", "Create")}</Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}