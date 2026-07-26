"use client";

import * as React from "react"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { Button } from "@/components/ui/button"
import { Settings, Palette, Bell, Shield, Zap, Database } from "lucide-react"
import { useLocalizationContext } from "@/providers/localization"

const SETTINGS_SECTIONS = [
  { id: "general", label: "General", description: "Workspace name, description, and visibility", icon: Settings },
  { id: "appearance", label: "Appearance", description: "Customize your interface", icon: Palette },
  { id: "notifications", label: "Notifications", description: "Email, push, and in-app notification settings", icon: Bell },
  { id: "security", label: "Security", description: "Password, 2FA, and session management", icon: Shield },
  { id: "integrations", label: "Integrations", description: "Connected apps and API configurations", icon: Zap },
  { id: "data", label: "Data & Storage", description: "Export, backup, and storage settings", icon: Database },
]

export default function SettingsPage() {
  const { t } = useLocalizationContext();
  return (
    <AppShell>
      <PageLayout
        title="Settings"
        description="Workspace and account configuration."
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
            <DashboardCard title={t("settings.general", "General Settings")} description={t("settings.generalDesc", "Workspace configuration")}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.workspaceName", "Workspace Name")}</label>
                  <input
                    type="text"
                    defaultValue="Acme Studio"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.descriptionLabel", "Description")}</label>
                  <textarea
                    rows={3}
                    defaultValue="AI content production workspace for the marketing team."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.visibility", "Visibility")}</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="visibility" defaultChecked className="rounded" />
                      {t("settings.private", "Private")}
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="visibility" className="rounded" />
                      {t("settings.public", "Public")}
                    </label>
                  </div>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title={t("settings.appearance", "Appearance")} description={t("settings.appearanceDesc", "Customize your interface")}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.theme", "Theme")}</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="theme" defaultChecked className="rounded" />
                      {t("settings.dark", "Dark")}
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="theme" className="rounded" />
                      {t("settings.light", "Light")}
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="radio" name="theme" className="rounded" />
                      {t("settings.system", "System")}
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.language", "Language")}</label>
                  <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                    <option>{t("settings.english", "English")}</option>
                    <option>{t("settings.thai", "Thai")}</option>
                    <option>{t("settings.japanese", "Japanese")}</option>
                  </select>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title={t("settings.language", "Language & Region")} description={t("settings.languageDesc", "Manage your localization preferences")}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.language", "Language")}</label>
                  <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                    <option value="en">English</option>
                    <option value="id">Bahasa Indonesia</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.currency", "Currency")}</label>
                  <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                    <option value="USD">USD ($)</option>
                    <option value="IDR">IDR (Rp)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.country", "Country")}</label>
                  <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                    <option value="US">United States</option>
                    <option value="ID">Indonesia</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.timezone", "Timezone")}</label>
                  <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                    <option value="UTC">UTC</option>
                    <option value="Asia/Jakarta">Asia/Jakarta</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title={t("settings.dangerZone", "Danger Zone")}>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                  <div>
                    <h4 className="font-medium text-destructive">{t("settings.deleteWorkspace", "Delete Workspace")}</h4>
                    <p className="text-xs text-muted-foreground">{t("settings.deleteWorkspaceDesc", "Permanently delete this workspace and all associated data.")}</p>
                  </div>
                  <Button variant="destructive" size="sm">{t("settings.delete", "Delete")}</Button>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </PageLayout>
    </AppShell>
  )
}