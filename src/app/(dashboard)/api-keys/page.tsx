import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { StatCard } from "@/components/ui/StatCard"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { ActionButton } from "@/components/ui/ActionButton"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { Key, Copy, Trash2, Shield, Clock } from "lucide-react"

export const metadata = { title: "API Keys - Tamer Studio", description: "Manage API keys for integrations." }

const API_KEYS = [
  { id: "1", name: "Production Integration", key: "ts_live_••••••••••••••••", created: "Sep 15, 2026", lastUsed: "2 hours ago", status: "Active" },
  { id: "2", name: "CI/CD Pipeline", key: "ts_live_••••••••••••••••", created: "Aug 22, 2026", lastUsed: "1 day ago", status: "Active" },
  { id: "3", name: "Development", key: "ts_test_•••••••••••••••", created: "Jul 10, 2026", lastUsed: "Never", status: "Inactive" },
]

export default function ApiKeysPage() {
  return (
    <AppShell>
      <PageLayout
        title={"API Keys"}
        description={"Create and manage API keys for external access."}
        breadcrumb={[{ label: "API Keys" }]}
        actions={<ActionButton>Create Key</ActionButton>}
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Keys" value={2} delta="1 inactive" />
            <StatCard title="Total Requests" value="3,420" delta="+120 today" />
            <StatCard title="Last Rotation" value="30 days ago" delta="Recommended: 90 days" />
            <StatCard title="Security Score" value="Good" delta="No exposed keys" />
          </div>

          <DashboardCard title="Your API Keys" description="Manage keys for external integrations">
            <div className="space-y-3">
              {API_KEYS.map((apiKey) => (
                <div key={apiKey.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40">
                      <Key className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <Badge tone={apiKey.status === "Active" ? "success" : "muted"}>
                          {apiKey.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-1">{apiKey.key}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          Created {apiKey.created}
                        </span>
                        <span>Last used {apiKey.lastUsed}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="size-8">
                      <Copy className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8">
                      <Shield className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-destructive">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard title="Security Best Practices">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: "Rotate Keys Regularly", description: "Rotate your API keys every 90 days for optimal security." },
                { title: "Use Environment Variables", description: "Never hardcode keys. Use env vars or secret managers." },
                { title: "Monitor Usage", description: "Set up alerts for unusual API activity." },
              ].map((practice) => (
                <div key={practice.title} className="rounded-xl border border-border bg-muted/20 p-4">
                  <h4 className="font-medium text-sm">{practice.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{practice.description}</p>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </PageLayout>
    </AppShell>
  )
}
