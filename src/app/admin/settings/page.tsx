import * as React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Globe, Shield, Server, Zap } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <RoleGuard allowedRoles={["super_admin"]}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="System Status" value="Healthy" delta="All services operational" />
          <StatCard title="Database" value="Online" delta="12ms avg latency" />
          <StatCard title="Cache" value="Hit Rate 94%" delta="Redis cluster" />
          <StatCard title="Uptime" value="99.98%" delta="Last 30 days" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardCard title="General Settings" description="Platform-wide configuration">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform Name</label>
                <input
                  type="text"
                  defaultValue="Tamer Studio"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Support Email</label>
                <input
                  type="email"
                  defaultValue="support@tamer.studio"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Language</label>
                <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                  <option>English</option>
                  <option>Thai</option>
                  <option>Japanese</option>
                </select>
              </div>
              <Button>Save Changes</Button>
            </div>
          </DashboardCard>

          <DashboardCard title="Security Settings" description="Authentication and access control">
            <div className="space-y-4">
              {[
                { label: "Two-Factor Authentication", description: "Require 2FA for all admin accounts", icon: Shield },
                { label: "IP Allowlist", description: "Restrict admin access to trusted IPs", icon: Globe },
                { label: "Session Timeout", description: "Auto-logout after 24 hours of inactivity", icon: Server },
                { label: "Rate Limiting", description: "API rate limits per user and endpoint", icon: Zap },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <setting.icon className="size-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium text-sm">{setting.label}</h4>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <Badge tone="success">Enabled</Badge>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>

        <DashboardCard title="Danger Zone">
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <div>
                <h4 className="font-medium text-destructive">Reset All Feature Flags</h4>
                <p className="text-xs text-muted-foreground">Reset all feature flags to their default values.</p>
              </div>
              <Button variant="destructive" size="sm">Reset</Button>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-4">
              <div>
                <h4 className="font-medium text-destructive">Clear Cache</h4>
                <p className="text-xs text-muted-foreground">Clear all cached data across the platform.</p>
              </div>
              <Button variant="destructive" size="sm">Clear</Button>
            </div>
          </div>
        </DashboardCard>
      </div>
    </RoleGuard>
  );
}
