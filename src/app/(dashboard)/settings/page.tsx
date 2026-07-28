"use client";

import * as React from "react"
import useSWR from "swr"
import { AppShell } from "@/components/ui/AppShell"
import { PageLayout } from "@/components/ui/PageLayout"
import { DashboardCard } from "@/components/ui/DashboardCard"
import { Button } from "@/components/ui/button"
import { Settings, Palette, Bell, Shield, Zap, Database } from "lucide-react"
import { useLocalizationContext } from "@/providers/localization"

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const SETTINGS_SECTIONS = [
  { id: "general", labelKey: "settings.generalLabel", descKey: "settings.generalSectionDesc", icon: Settings },
  { id: "appearance", labelKey: "settings.appearanceLabel", descKey: "settings.appearanceSectionDesc", icon: Palette },
  { id: "notifications", labelKey: "settings.notificationsLabel", descKey: "settings.notificationsSectionDesc", icon: Bell },
  { id: "security", labelKey: "settings.securityLabel", descKey: "settings.securitySectionDesc", icon: Shield },
  { id: "integrations", labelKey: "settings.integrationsLabel", descKey: "settings.integrationsSectionDesc", icon: Zap },
  { id: "data", labelKey: "settings.dataStorageLabel", descKey: "settings.dataStorageSectionDesc", icon: Database },
]

export default function SettingsPage() {
  const { t } = useLocalizationContext();
  const { data: profileData, isLoading: profileLoading } = useSWR("/api/profile", fetcher);
  const { data: prefsData, isLoading: prefsLoading } = useSWR("/api/preferences", fetcher);
  const [saving, setSaving] = React.useState(false);

  const profile = profileData?.data;
  const prefs = prefsData?.data;

  const [workspaceName, setWorkspaceName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [language, setLanguage] = React.useState("en");
  const [currency, setCurrency] = React.useState("USD");
  const [country, setCountry] = React.useState("US");
  const [timezone, setTimezone] = React.useState("UTC");

  React.useEffect(() => {
    if (profile) {
      setWorkspaceName(profile.workspace ?? t("brand.name"));
      setDescription(profile.workspaceDescription ?? t("settings.workspaceAndAccountConfig"));
    }
  }, [profile, t]);

  React.useEffect(() => {
    if (prefs) {
      setLanguage(prefs.preferredLanguage ?? "en");
      setCurrency(prefs.preferredCurrency ?? "USD");
      setCountry(prefs.preferredCountry ?? "US");
      setTimezone(prefs.preferredTimezone ?? "UTC");
    }
  }, [prefs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName }),
      });
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, currency, country, timezone }),
      });
    } finally {
      setSaving(false);
    }
  };

  const isLoading = profileLoading || prefsLoading;

  return (
    <AppShell>
      <PageLayout
        title={t("settings.pageTitle", "Settings")}
        description={t("settings.workspaceAndAccountConfig", "Workspace and account configuration.")}
        breadcrumb={[{ label: t("settings.pageTitle", "Settings") }]}
        actions={
          <Button onClick={handleSave} disabled={saving || isLoading}>
            {saving ? t("settings.saving", "Saving...") : t("settings.saveChanges", "Save Changes")}
          </Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <DashboardCard title={t("settings.pageTitle", "Settings")}>
              <nav className="space-y-1">
                {SETTINGS_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition hover:bg-muted/40"
                  >
                    <section.icon className="size-4 text-muted-foreground" />
                    {t(section.labelKey, section.labelKey)}
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
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.descriptionLabel", "Description")}</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="en">{t("settings.english", "English")}</option>
                    <option value="th">{t("settings.thai", "Thai")}</option>
                    <option value="ja">{t("settings.japanese", "Japanese")}</option>
                  </select>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title={t("settings.language", "Language & Region")} description={t("settings.languageDesc", "Manage your localization preferences")}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.language", "Language")}</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="en">{t("settings.languageEnglish", "English")}</option>
                    <option value="id">{t("settings.languageIndonesian", "Bahasa Indonesia")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.currency", "Currency")}</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="IDR">IDR (Rp)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.country", "Country")}</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <option value="US">{t("settings.countryUS", "United States")}</option>
                    <option value="ID">{t("settings.countryID", "Indonesia")}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("settings.timezone", "Timezone")}</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
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
