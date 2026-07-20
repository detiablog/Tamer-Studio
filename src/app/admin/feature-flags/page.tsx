import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { Flag, ToggleLeft, ToggleRight } from "lucide-react";

const FEATURE_FLAGS = [
  { id: "1", key: "new_dashboard", name: "New Dashboard", description: "Enable the redesigned dashboard experience", enabled: true, rollout: "100%", environment: "Production" },
  { id: "2", key: "ai_playground", name: "AI Playground", description: "Enable AI prompt playground for all users", enabled: true, rollout: "50%", environment: "Production" },
  { id: "3", key: "advanced_analytics", name: "Advanced Analytics", description: "Enable advanced analytics dashboard", enabled: false, rollout: "0%", environment: "Staging" },
  { id: "4", key: "team_collaboration", name: "Team Collaboration", description: "Enable real-time collaboration features", enabled: true, rollout: "25%", environment: "Production" },
  { id: "5", key: "api_v2", name: "API v2", description: "Enable new API v2 endpoints", enabled: false, rollout: "0%", environment: "Development" },
  { id: "6", key: "beta_billing", name: "Beta Billing", description: "Enable new billing experience", enabled: true, rollout: "10%", environment: "Production" },
];

export default function AdminFeatureFlagsPage() {
  const [filter, setFilter] = React.useState<string>("all");

  const filtered = filter === "all" ? FEATURE_FLAGS : FEATURE_FLAGS.filter((f) => f.environment.toLowerCase() === filter);

  return (
    <RoleGuard allowedRoles={["super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Flags" value={6} delta="2 enabled" />
          <StatCard title="Enabled" value={3} delta="50% rollout" />
          <StatCard title="In Staging" value={1} delta="Testing" />
          <StatCard title="In Dev" value={1} delta="Development" />
        </div>

        <DashboardCard title="Feature Flags" description="Toggle features and run experiments">
          <div className="flex items-center gap-2 pb-4">
            {["all", "production", "staging", "development"].map((env) => (
              <Button
                key={env}
                variant={filter === env ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(env)}
              >
                {env.charAt(0).toUpperCase() + env.slice(1)}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((flag) => (
              <div key={flag.id} className="rounded-xl border border-border bg-muted/20 p-5 transition hover:border-foreground/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Flag className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-medium">{flag.name}</h4>
                      <p className="text-xs text-muted-foreground font-mono">{flag.key}</p>
                    </div>
                  </div>
                  {flag.enabled ? (
                    <ToggleRight className="size-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <ToggleLeft className="size-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-3">{flag.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge tone={flag.environment === "Production" ? "success" : flag.environment === "Staging" ? "warning" : "muted"}>
                      {flag.environment}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{flag.rollout} rollout</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    {flag.enabled ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </RoleGuard>
  );
}
