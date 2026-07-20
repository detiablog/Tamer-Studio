import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { Button } from "@/components/ui/button"
import { Settings, Palette, Bell, Shield, Zap, Database } from "lucide-react"

export const metadata = { title: "Settings - Tamer Studio", description: "Manage workspace and account settings." }

const SETTINGS_SECTIONS = [
  { id: "general", label: "General", description: "Workspace name, description, and visibility", icon: Settings },
  { id: "appearance", label: "Appearance", description: "Theme, language, and display preferences", icon: Palette },
  { id: "notifications", label: "Notifications", description: "Email, push, and in-app notification settings", icon: Bell },
  { id: "security", label: "Security", description: "Password, 2FA, and session management", icon: Shield },
  { id: "integrations", label: "Integrations", description: "Connected apps and API configurations", icon: Zap },
  { id: "data", label: "Data & Storage", description: "Export, backup, and storage settings", icon: Database },
]

export default function SettingsPage() {
  return (
    <AppShell>
      <PageLayout
        title={"Settings"}
        description={"Workspace and account configuration."}
        breadcrumb={[{ label: "Settings" }]}
        actions={<Button>Save Changes</Button>}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <DashboardCard title="Settings">
              <nav className="space-y-1">
                {SETTINGS_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition hover:bg-muted/40"
                  >
                    <section.icon className="size-4 text-muted-foreground" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </DashboardCard>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <DashboardCard title="General Settings" description="Workspace configuration">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Workspace Name</label>
                  <input
                    type="text"
                    defaultValue="Acme Studio"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    rows={3}
                    defaultValue="AI content production workspace for the marketing team."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Visibility</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="visibility" defaultChecked className="rounded" />
                      Private
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="visibility" className="rounded" />
                      Public
                    </label>
                  </div>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Appearance" description="Customize your interface">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="theme" defaultChecked className="rounded" />
                      Dark
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="theme" className="rounded" />
                      Light
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="theme" className="rounded" />
                      System
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                    <option>English</option>
                    <option>Thai</option>
                    <option>Japanese</option>
                  </select>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Danger Zone">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                  <div>
                    <h4 className="font-medium text-destructive">Delete Workspace</h4>
                    <p className="text-xs text-muted-foreground">Permanently delete this workspace and all associated data.</p>
                  </div>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </PageLayout>
    </AppShell>
  )
}
