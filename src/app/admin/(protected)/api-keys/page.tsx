"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCw, Key, Copy, Trash2, X, Loader } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

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

export default function APIKeysPage() {
  const { t } = useLocalizationContext();
  const [search, setSearch] = React.useState("");
  const [addOpen, setAddOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({ name: "", prefix: "" });
  const [formLoading, setFormLoading] = React.useState(false);

  const { data, error, isLoading, mutate } = useSWR("/api/admin/api-keys", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 0,
  });

  const keys = React.useMemo(() => {
    if (data?.success && Array.isArray(data.data)) return data.data;
    return [];
  }, [data]);

  const filtered = React.useMemo(
    () => keys.filter((k: any) => (k.name || "").toLowerCase().includes(search.toLowerCase())),
    [keys, search]
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create API key");
      setFormData({ name: "", prefix: "" });
      setAddOpen(false);
      toast.success(t("admin.apiKeys.created", "API key created"));
      mutate();
    } catch {
      toast.error(t("admin.apiKeys.createFailed", "Failed to create API key"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(t("admin.apiKeys.revokeConfirm", 'Revoke "{0}"?').replace("{0}", name))) return;
    try {
      const res = await fetch(`/api/admin/api-keys/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke API key");
      toast.success(t("admin.apiKeys.revoked", "API key revoked"));
      mutate();
    } catch {
      toast.error(t("admin.apiKeys.revokeFailed", "Failed to revoke API key"));
    }
  };

  const handleCopy = (prefix: string) => {
    navigator.clipboard?.writeText(prefix);
    toast.success(t("admin.apiKeys.copied", "Copied to clipboard"));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.apiKeys", "API Keys") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.apiKeys", "API Keys")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.apiKeys.description", "Manage API keys and tokens")}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.apiKeys", "API Keys") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.apiKeys", "API Keys")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.apiKeys.description", "Manage API keys and tokens")}</p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-2">{t("common.error", "Failed to load data")}</p>
            <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              <RefreshCw className="mr-2 size-4" />
              {t("common.retry", "Retry")}
            </Button>
          </div>
        </DashboardCard>
      </div>
    );
  }

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

        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {t("admin.apiKeys.noKeys", "No API keys found")}
          </div>
        ) : (
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
        )}
      </DashboardCard>

      {addOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setAddOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t("admin.apiKeys.createApiKey", "Create API Key")}</h2>
              <button onClick={() => setAddOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div><label className="text-sm font-medium mb-1.5 block">{t("common.name", "Name")}</label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t("admin.apiKeys.keyName", "Key name")} required /></div>
              <div><label className="text-sm font-medium mb-1.5 block">{t("admin.apiKeys.prefix", "Prefix")}</label><Input value={formData.prefix} onChange={(e) => setFormData({ ...formData, prefix: e.target.value })} placeholder="sk-..." required /></div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1">{t("common.cancel", "Cancel")}</Button>
                <Button type="submit" disabled={formLoading} className="flex-1">{formLoading ? t("admin.creating", "Creating...") : t("admin.create", "Create")}</Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
