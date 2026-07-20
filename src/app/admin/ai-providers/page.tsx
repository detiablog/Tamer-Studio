import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { Cpu, Plug, RefreshCw } from "lucide-react";

const PROVIDERS = [
  { id: "1", name: "OpenAI", status: "Connected", models: 12, requests: "1,240/day", latency: "245ms", uptime: "99.9%" },
  { id: "2", name: "Anthropic", status: "Connected", models: 8, requests: "340/day", latency: "312ms", uptime: "99.8%" },
  { id: "3", name: "Google AI", status: "Disconnected", models: 15, requests: "—", latency: "—", uptime: "—" },
  { id: "4", name: "OpenRouter", status: "Connected", models: 45, requests: "890/day", latency: "189ms", uptime: "99.9%" },
  { id: "5", name: "Stability AI", status: "Degraded", models: 6, requests: "120/day", latency: "1.2s", uptime: "98.5%" },
];

export default function AdminAIProvidersPage() {
  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Providers" value={5} delta="3 connected" />
          <StatCard title="Models Available" value={86} delta="+4 this week" />
          <StatCard title="Total Requests" value="2,590" delta="+18% today" />
          <StatCard title="Avg Latency" value="236ms" delta="-12ms improvement" />
        </div>

        <DashboardCard title="AI Providers" description="Monitor provider health, usage, and connections">
          <AdminDataTable
            data={PROVIDERS}
            keyExtractor={(p) => p.id}
            columns={[
              { key: "name", header: "Provider", render: (p: typeof PROVIDERS[0]) => (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40">
                    <Cpu className="size-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium">{p.name}</span>
                </div>
              )},
              { key: "status", header: "Status", align: "center", render: (p: typeof PROVIDERS[0]) => <Badge tone={p.status === "Connected" ? "success" : p.status === "Degraded" ? "warning" : "muted"}>{p.status}</Badge> },
              { key: "models", header: "Models", align: "center" },
              { key: "requests", header: "Requests", align: "center" },
              { key: "latency", header: "Latency", align: "center" },
              { key: "uptime", header: "Uptime", align: "center" },
              { key: "actions", header: "", align: "right", render: () => (
                <div className="flex items-center gap-1 justify-end">
                  <Button variant="ghost" size="icon" className="size-8">
                    <RefreshCw className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8">
                    <Plug className="size-4" />
                  </Button>
                </div>
              )},
            ]}
          />
        </DashboardCard>
      </div>
    </RoleGuard>
  );
}
