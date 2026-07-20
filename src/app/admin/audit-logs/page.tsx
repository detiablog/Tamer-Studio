import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { Shield, AlertTriangle, User } from "lucide-react";

const AUDIT_LOGS = [
  { id: "1", action: "User Login", user: "alice@example.com", ip: "192.168.1.1", timestamp: "Oct 21, 2026 14:32", severity: "info" },
  { id: "2", action: "Role Changed", user: "admin@example.com", ip: "192.168.1.2", timestamp: "Oct 21, 2026 13:15", severity: "warning" },
  { id: "3", action: "Payment Processed", user: "system", ip: "10.0.0.1", timestamp: "Oct 21, 2026 12:00", severity: "success" },
  { id: "4", action: "Failed Login Attempt", user: "unknown@example.com", ip: "203.0.113.5", timestamp: "Oct 21, 2026 11:45", severity: "error" },
  { id: "5", action: "Workspace Deleted", user: "admin@example.com", ip: "192.168.1.2", timestamp: "Oct 21, 2026 10:20", severity: "warning" },
  { id: "6", action: "API Key Generated", user: "bob@example.com", ip: "192.168.1.3", timestamp: "Oct 21, 2026 09:10", severity: "info" },
  { id: "7", action: "Settings Updated", user: "admin@example.com", ip: "192.168.1.2", timestamp: "Oct 20, 2026 16:45", severity: "info" },
  { id: "8", action: "Data Export", user: "carol@example.com", ip: "192.168.1.4", timestamp: "Oct 20, 2026 15:30", severity: "info" },
];

export default function AdminAuditLogsPage() {
  const [severityFilter, setSeverityFilter] = React.useState<string>("all");

  const filtered = severityFilter === "all" ? AUDIT_LOGS : AUDIT_LOGS.filter((log) => log.severity === severityFilter);

  return (
    <RoleGuard allowedRoles={["admin", "super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Events" value={12847} delta="Last 30 days" />
          <StatCard title="Warnings" value={234} delta="Requires attention" />
          <StatCard title="Errors" value={18} delta="Critical issues" />
          <StatCard title="Success Rate" value="99.8%" delta="System health" />
        </div>

        <DashboardCard title="Audit Logs" description="Track admin actions, security events, and system changes">
          <div className="flex items-center gap-2 pb-4">
            {["all", "info", "success", "warning", "error"].map((severity) => (
              <Button
                key={severity}
                variant={severityFilter === severity ? "default" : "ghost"}
                size="sm"
                onClick={() => setSeverityFilter(severity)}
              >
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </Button>
            ))}
          </div>

          <AdminDataTable
            data={filtered}
            keyExtractor={(log) => log.id}
            columns={[
              { key: "severity", header: "", align: "center", width: "40px", render: (log: typeof AUDIT_LOGS[0]) => {
                const icons = {
                  info: <Shield className="size-4 text-sky-500" />,
                  success: <Shield className="size-4 text-green-500" />,
                  warning: <AlertTriangle className="size-4 text-amber-500" />,
                  error: <AlertTriangle className="size-4 text-red-500" />,
                };
                return icons[log.severity as keyof typeof icons] ?? icons.info;
              }},
              { key: "action", header: "Action", render: (log: typeof AUDIT_LOGS[0]) => (
                <div>
                  <p className="font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="size-3" />
                    {log.user}
                  </p>
                </div>
              )},
              { key: "ip", header: "IP Address", render: (log: typeof AUDIT_LOGS[0]) => (
                <span className="font-mono text-xs">{log.ip}</span>
              )},
              { key: "timestamp", header: "Timestamp" },
              { key: "severity", header: "Severity", align: "center", render: (log: typeof AUDIT_LOGS[0]) => <Badge tone={log.severity === "error" ? "warning" : log.severity === "warning" ? "warning" : log.severity === "success" ? "success" : "info"}>{log.severity}</Badge> },
            ]}
          />
        </DashboardCard>
      </div>
    </RoleGuard>
  );
}
