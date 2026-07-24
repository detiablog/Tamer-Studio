"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, RefreshCw, Key, Copy, Trash2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const MOCK_API_KEYS = [
  { id: "ak_1", name: "Production Key", prefix: "sk-prod-", lastUsed: "23/07/2026 14:30", createdAt: "15/07/2026", status: "Active" },
  { id: "ak_2", name: "Staging Key", prefix: "sk-staging-", lastUsed: "22/07/2026 09:15", createdAt: "10/07/2026", status: "Active" },
  { id: "ak_3", name: "Dev Key", prefix: "sk-dev-", lastUsed: "Never", createdAt: "05/07/2026", status: "Revoked" },
];

export default function APIKeysPage() {
  const { t } = useLocalizationContext();
  const [keys, setKeys] = React.useState(MOCK_API_KEYS);
  const [search, setSearch] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "", prefix: "" });

  const filtered = keys.filter((k) => k.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = () => {
    setKeys((prev) => [...prev, { ...formData, id: `ak_${prev.length + 1}`, lastUsed: "Never", createdAt: new Date().toLocaleDateString("en-GB"), status: "Active" }]);
    setFormData({ name: "", prefix: "" });
    setAddOpen(false);
    toast.success(t("admin.apiKeys.created", "API key created"));
  };

  const handleRevoke = (id: string, name: string) => {
    if (!confirm(t("admin.apiKeys.revokeConfirm", 'Revoke "{0}"?').replace("{0}", name))) return;
    setKeys((prev) => prev.map((k) => k.id === id ? { ...k, status: "Revoked" } : k));
    toast.success(t("admin.apiKeys.revoked", "API key revoked"));
  };

  const handleCopy = (prefix: string) => {
    navigator.clipboard?.writeText(prefix);
    toast.success(t("admin.apiKeys.copied", "Copied to clipboard"));
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.apiKeys", "API Keys") }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("admin.apiKeys", "API Keys")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.apiKeys.description", "Manage API keys and tokens")}</p>
          </div>
          <Button onClick={() => setAddOpen(true)}><Plus className="mr-2 size-4" />{t("admin.apiKeys.createKey", "Create Key")}</Button>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.apiKeys.searchKeys", "Search keys...")} className="pl-9" />
          </div>
        </div>

        <AdminDataTable
          data={filtered}
          keyExtractor={(k) => k.id}
          columns={[
            { key: "name", header: t("common.name", "Name"), render: (k: any) => <span className="font-medium text-sm">{k.name}</span> },
            { key: "prefix", header: t("admin.apiKeys.prefix", "Prefix"), render: (k: any) => <code className="text-xs bg-muted/50 px-2 py-0.5 rounded">{k.prefix}</code> },
            { key: "status", header: t("common.status", "Status"), render: (k: any) => <Badge tone={k.status === "Active" ? "success" : "muted"}>{k.status}</Badge> },
            { key: "lastUsed", header: t("admin.apiKeys.lastUsed", "Last Used"), render: (k: any) => <span className="text-xs text-muted-foreground">{k.lastUsed}</span> },
            { key: "createdAt", header: t("admin.apiKeys.created", "Created"), render: (k: any) => <span className="text-xs text-muted-foreground">{k.createdAt}</span> },
            { key: "actions", header: "", align: "right", render: (k: any) => (
              <div className="flex items-center gap-1 justify-end">
                <Button variant="ghost" size="icon-xs" onClick={() => handleCopy(k.prefix)} aria-label={t("admin.apiKeys.copy", "Copy key")}><Copy className="size-3.5" /></Button>
                {k.status === "Active" && <Button variant="ghost" size="icon-xs" onClick={() => handleRevoke(k.id, k.name)} aria-label={t("admin.apiKeys.revoke", "Revoke key")} className="text-destructive hover:text-destructive"><Trash2 className="size-3.5" /></Button>}
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
              <h2 className="text-xl font-semibold">{t("admin.apiKeys.createApiKey", "Create API Key")}</h2>
              <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }} className="space-y-4">
              <div><label className="text-sm font-medium mb-1.5 block">{t("common.name", "Name")}</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t("admin.apiKeys.keyName", "Key name")} required /></div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("admin.apiKeys.prefix", "Prefix")}</label><Input value={formData.prefix} onChange={(e) => setFormData({ ...formData, prefix: e.target.value })} placeholder="sk-..." required /></div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
                <Button type="submit" className="flex-1">{t("admin.create", "Create")}</Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}