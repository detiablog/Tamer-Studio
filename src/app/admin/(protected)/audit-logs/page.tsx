"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const MOCK_AUDIT_LOGS = [
  { id: "al_1", action: "User Created", user: "Alice Johnson", target: "bob@example.com", timestamp: "23/07/2026 14:30", ip: "192.168.1.1", status: "Success" },
  { id: "al_2", action: "Settings Updated", user: "Admin", target: "System", timestamp: "23/07/2026 13:15", ip: "10.0.0.1", status: "Success" },
  { id: "al_3", action: "Login Failed", user: "Unknown", target: "admin@example.com", timestamp: "23/07/2026 12:45", ip: "203.0.113.5", status: "Failed" },
  { id: "al_4", action: "Coupon Created", user: "Alice Johnson", target: "SAVE20", timestamp: "22/07/2026 16:20", ip: "192.168.1.1", status: "Success" },
  { id: "al_5", action: "User Deleted", user: "Admin", target: "inactive_user@example.com", timestamp: "22/07/2026 10:05", ip: "10.0.0.1", status: "Success" },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState(MOCK_AUDIT_LOGS);
  const [search, setSearch] = React.useState("");

  const filtered = logs.filter((l) => l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()));

  const handleViewDetails = (id: string) => {
    const log = logs.find((l) => l.id === id);
    alert(`Audit Log Details:\n\nAction: ${log?.action}\nUser: ${log?.user}\nTarget: ${log?.target}\nTimestamp: ${log?.timestamp}\nIP: ${log?.ip}\nStatus: ${log?.status}`);
  };

  const handleExport = () => {
    const headers = "Action,User,Target,Timestamp,IP,Status\n";
    const rows = logs.map((l) => `${l.action},${l.user},${l.target},${l.timestamp},${l.ip},${l.status}`).join("\n");
    const csv = headers + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Audit logs exported");
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Audit Logs" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground text-sm mt-1">View system audit and activity logs</p>
        </div>

        <div className="flex items-center gap-2 pb-4">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs..." className="pl-9" />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}><RefreshCw className="mr-2 size-4" />Export</Button>
        </div>

        <AdminDataTable
          data={filtered}
          keyExtractor={(l) => l.id}
          columns={[
            { key: "action", header: "Action", render: (l: any) => <span className="font-medium text-sm">{l.action}</span> },
            { key: "user", header: "User", render: (l: any) => <span className="text-sm">{l.user}</span> },
            { key: "target", header: "Target", render: (l: any) => <code className="text-xs bg-muted/50 px-2 py-0.5 rounded">{l.target}</code> },
            { key: "timestamp", header: "Timestamp", render: (l: any) => <span className="text-xs text-muted-foreground">{l.timestamp}</span> },
            { key: "ip", header: "IP Address", render: (l: any) => <span className="text-xs font-mono">{l.ip}</span> },
            { key: "status", header: "Status", render: (l: any) => <Badge tone={l.status === "Success" ? "success" : "warning"}>{l.status}</Badge> },
            { key: "actions", header: "", align: "right", render: (l: any) => (
              <Button variant="ghost" size="icon-xs" onClick={() => handleViewDetails(l.id)} aria-label="View details"><Eye className="size-3.5" /></Button>
            )},
          ]}
        />
      </DashboardCard>
    </div>
  );
}