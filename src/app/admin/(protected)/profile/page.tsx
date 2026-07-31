"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw, Loader } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

export default function ProfilePage() {
  const { t } = useLocalizationContext();
  const [saving, setSaving] = React.useState(false);

  const { data, error, isLoading, mutate } = useSWR("/api/admin/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });

  const profile = React.useMemo(() => {
    if (data?.success && data.data) return data.data;
    return null;
  }, [data]);

  const [formData, setFormData] = React.useState({ name: "", email: "", role: "", organization: "" });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        role: profile.role || "admin",
        organization: profile.organization || "Tamer Studio",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email, organization: formData.organization }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast.success(t("admin.profile.updated", "Profile updated"));
      mutate();
    } catch {
      toast.error(t("admin.profile.updateFailed", "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.profile", "Profile") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.profile", "Profile")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.profile.description", "Manage your admin profile")}</p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.profile", "Profile") }]} />
        <DashboardCard>
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{t("admin.profile", "Profile")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("admin.profile.description", "Manage your admin profile")}</p>
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-2">{t("common.error", "Failed to load data")}</p>
            <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
            <Button variant="outline" size="sm" onClick={() => mutate()}>
              <RefreshCw className="mr-2 size-4" />
              {t("common.retry", "Retry")}
            </Button>
          </div>
        </DashboardCard>
      </div>
    );
  }

  const initials = formData.name ? formData.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "A";

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.profile", "Profile") }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("admin.profile", "Profile")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.profile.description", "Manage your admin profile")}</p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-primary text-xl font-bold">{initials}</div>
          <div>
            <h3 className="font-semibold">{formData.name || t("admin.profile.adminUser", "Admin User")}</h3>
            <p className="text-sm text-muted-foreground">{formData.email}</p>
            <div className="mt-1"><Badge tone="info">{formData.role || "Super Admin"}</Badge></div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>{t("admin.profile.fullName", "Full Name")}</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1" /></div>
          <div><Label>{t("common.email", "Email")}</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-1" /></div>
          <div><Label>{t("admin.profile.role", "Role")}</Label><Input value={formData.role} readOnly className="mt-1 bg-muted/50" /></div>
          <div><Label>{t("admin.profile.organization", "Organization")}</Label><Input value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} className="mt-1" /></div>
        </div>

        <div className="flex gap-2 pt-6 border-t border-border mt-6">
          <Button onClick={handleSave} disabled={saving}><Save className="mr-2 size-4" />{saving ? t("admin.saving", "Saving...") : t("admin.saveChanges", "Save Changes")}</Button>
        </div>
      </DashboardCard>
    </div>
  );
}
