"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, RefreshCw, Activity, CheckCircle, XCircle, Clock, Zap, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const MOCK_AI_PROVIDERS = [
  { id: "p_1", name: "OpenAI", model: "GPT-4o", status: "Connected", latency: "120ms", usage: "78%", lastChecked: "23/07/2026 14:30" },
  { id: "p_2", name: "Anthropic", model: "Claude 3.5", status: "Connected", latency: "95ms", usage: "45%", lastChecked: "23/07/2026 14:28" },
  { id: "p_3", name: "Google", model: "Gemini 1.5", status: "Disconnected", latency: "—", usage: "0%", lastChecked: "23/07/2026 14:15" },
  { id: "p_4", name: "Cohere", model: "Command R+", status: "Connected", latency: "180ms", usage: "32%", lastChecked: "23/07/2026 14:29" },
];

export default function AIProvidersPage() {
  const [providers, setProviders] = React.useState(MOCK_AI_PROVIDERS);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const filtered = providers.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleConnect = (id: string) => {
    setProviders((prev) => prev.map((p) => p.id === id ? { ...p, status: "Connected", usage: "0%", latency: "—" } : p));
    toast.success("Provider connected");
  };

  const handleDisconnect = (id: string) => {
    if (!confirm("Disconnect this provider?")) return;
    setProviders((prev) => prev.map((p) => p.id === id ? { ...p, status: "Disconnected", usage: "0%", latency: "—" } : p));
    toast.success("Provider disconnected");
  };

  const handleTest = (id: string) => {
    const provider = providers.find((p) => p.id === id);
    setLoading(true);
    setTimeout(() => {
      const latency = Math.floor(Math.random() * 200) + 50;
      setProviders((prev) => prev.map((p) => p.id === id ? { ...p, latency: `${latency}ms`, lastChecked: new Date().toLocaleString("en-GB") } : p));
      toast.success(`Connection to ${provider?.name} healthy — latency: ${latency}ms`);
      setLoading(false);
    }, 1000);
  };

  const handleValidate = (id: string) => {
    const provider = providers.find((p) => p.id === id);
    setLoading(true);
    setTimeout(() => {
      toast.success(`API key for ${provider?.name} validated successfully`);
      setLoading(false);
    }, 800);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => { setProviders(MOCK_AI_PROVIDERS); setLoading(false); toast.success("Providers refreshed"); }, 800);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "AI Providers" }]} />
      <DashboardCard>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Providers</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage AI provider integrations</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}><RefreshCw className={cn("mr-2 size-4", loading && "animate-spin")} />Refresh</Button>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search providers..." className="pl-9" />
          </div>
        </div>

        <AdminDataTable
          data={filtered}
          keyExtractor={(p) => p.id}
          columns={[
            { key: "name", header: "Provider", render: (p: any) => <div className="flex items-center gap-2"><Zap className="size-4 text-primary" /><span className="font-medium text-sm">{p.name}</span></div> },
            { key: "model", header: "Model", render: (p: any) => <span className="text-sm">{p.model}</span> },
            { key: "status", header: "Status", render: (p: any) => <Badge tone={p.status === "Connected" ? "success" : "muted"}>{p.status}</Badge> },
            { key: "latency", header: "Latency", render: (p: any) => <span className="text-sm">{p.latency}</span> },
            { key: "usage", header: "Usage", render: (p: any) => <div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted/40"><div className="h-full rounded-full bg-primary transition-all" style={{ width: p.usage }} /></div><span className="text-xs">{p.usage}</span></div> },
            { key: "lastChecked", header: "Last Checked", render: (p: any) => <span className="text-xs text-muted-foreground">{p.lastChecked}</span> },
            { key: "actions", header: "", align: "right", render: (p: any) => (
              <div className="flex items-center gap-1 justify-end">
                <Button variant="ghost" size="icon-xs" onClick={() => handleTest(p.id)} aria-label="Test connection"><Activity className="size-3.5" /></Button>
                <Button variant="ghost" size="icon-xs" onClick={() => handleValidate(p.id)} aria-label="Validate API key"><CheckCircle className="size-3.5" /></Button>
                {p.status === "Connected" ? <Button variant="ghost" size="icon-xs" onClick={() => handleDisconnect(p.id)} aria-label="Disconnect" className="text-destructive hover:text-destructive"><XCircle className="size-3.5" /></Button> : <Button variant="ghost" size="icon-xs" onClick={() => handleConnect(p.id)} aria-label="Connect"><CheckCircle className="size-3.5 text-green-600" /></Button>}
              </div>
            )},
          ]}
        />
      </DashboardCard>
    </div>
  );
}