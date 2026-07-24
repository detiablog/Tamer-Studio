"use client";

import * as React from "react";
import useSWR from "swr";
import { AppShell } from "@/components/ui/AppShell";
import { PageLayout } from "@/components/ui/PageLayout";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/Avatar";
import { Mail, MapPin, Briefcase, Shield, Key, Bell, Globe } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProfilePage() {
  const { t } = useLocalizationContext();
  const { data, error, isLoading } = useSWR("/api/profile", fetcher);
  const [saving, setSaving] = React.useState(false);

  if (isLoading) {
    return (
      <AppShell>
        <PageLayout title={t("profile.title")} description={t("profile.description")} breadcrumb={[{ label: t("profile.title") }]}>
          <div className="flex items-center justify-center p-8">{t("common.loading")}</div>
        </PageLayout>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <PageLayout title={t("profile.title")} description={t("profile.description")} breadcrumb={[{ label: t("profile.title") }]}>
          <div className="text-destructive p-8">{t("common.failedToLoad")}</div>
        </PageLayout>
      </AppShell>
    );
  }

  const profile = data;

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageLayout
        title={t("profile.title")}
        description={t("profile.description")}
        breadcrumb={[{ label: t("profile.title") }]}
        actions={
          <Button onClick={handleSave} disabled={saving}>{saving ? t("profile.saving") : t("settings.saveChanges")}</Button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <DashboardCard title={t("profile.title")}>
              <div className="flex flex-col items-center text-center">
                <Avatar name={profile.avatar} size={80} />
                <h3 className="mt-4 text-lg font-semibold">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <div className="mt-3 flex gap-2">
                  <Badge tone="info">{profile.role}</Badge>
                  <Badge tone="success">{profile.plan}</Badge>
                </div>
                <div className="mt-4 w-full space-y-2 text-sm text-left">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="size-4" />
                    <span>{profile.workspace}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="size-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="size-4" />
                    <span>{t("profile.joined")} {profile.joined}</span>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <DashboardCard title={t("profile.accountSettings")} description={t("profile.accountSettingsDesc")}>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("profile.fullName")}</label>
                    <input type="text" defaultValue={profile.name} className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("profile.email")}</label>
                    <div className="flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground" />
                      <input type="email" defaultValue={profile.email} className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
                    </div>
                  </div>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title={t("profile.preferences")} description={t("profile.preferencesDesc")}>
              <div className="space-y-4">
                {[
                  { labelKey: "profile.emailNotifications", descriptionKey: "profile.emailNotificationsDesc", icon: Bell },
                  { labelKey: "profile.twoFactorAuth", descriptionKey: "profile.twoFactorAuthDesc", icon: Shield },
                  { labelKey: "profile.publicProfile", descriptionKey: "profile.publicProfileDesc", icon: Globe },
                  { labelKey: "profile.apiAccess", descriptionKey: "profile.apiAccessDesc", icon: Key },
                ].map((pref) => (
                  <div key={pref.labelKey} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center gap-3">
                      <pref.icon className="size-5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">{t(pref.labelKey)}</h4>
                        <p className="text-xs text-muted-foreground">{t(pref.descriptionKey)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">{t("profile.configure")}</Button>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>
        </div>
      </PageLayout>
    </AppShell>
  );
}