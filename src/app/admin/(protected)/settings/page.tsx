"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw, User, Mail, Shield, Bell, Database, Sparkles, CreditCard, Key, Server, Lock } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { useLocalizationContext } from "@/providers/localization";

type TabId = "general" | "security" | "email" | "storage" | "ai" | "billing" | "api" | "advanced";

const TABS: { id: TabId; labelKey: string; icon: React.ReactNode }[] = [
  { id: "general", labelKey: "admin.general", icon: <User className="size-4" /> },
  { id: "security", labelKey: "admin.security", icon: <Shield className="size-4" /> },
  { id: "email", labelKey: "admin.email", icon: <Mail className="size-4" /> },
  { id: "storage", labelKey: "admin.storage", icon: <Database className="size-4" /> },
  { id: "ai", labelKey: "admin.ai", icon: <Sparkles className="size-4" /> },
  { id: "billing", labelKey: "admin.billing", icon: <CreditCard className="size-4" /> },
  { id: "api", labelKey: "admin.api", icon: <Key className="size-4" /> },
  { id: "advanced", labelKey: "admin.advanced", icon: <Server className="size-4" /> },
];

export default function SettingsPage() {
  const { t } = useLocalizationContext();
  const [activeTab, setActiveTab] = React.useState<TabId>("general");
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    siteName: "Tamer Studio",
    timezone: "UTC",
    language: "en",
    twoFactor: true,
    sessionTimeout: "30",
    emailNotifications: true,
    storageLimit: "10",
    aiProvider: "openai",
    apiRateLimit: "1000",
    debugMode: false,
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); toast.success(t("settings.saved")); }, 600);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.settings") }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t("admin.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("admin.description")}</p>
        </div>

        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeTab === "general" && (
            <>
              <div><Label>{t("admin.siteName")}</Label><Input value={formData.siteName} onChange={(e) => setFormData({ ...formData, siteName: e.target.value })} className="mt-1" /></div>
              <div><Label>{t("admin.timezone")}</Label><Input value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} className="mt-1" /></div>
              <div><Label>{t("admin.language")}</Label><Input value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="mt-1" /></div>
            </>
          )}
          {activeTab === "security" && (
            <>
              <div className="flex items-center justify-between"><Label>{t("admin.twoFactor")}</Label><Button variant={formData.twoFactor ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, twoFactor: !formData.twoFactor })}>{formData.twoFactor ? t("admin.enabled") : t("admin.disabled")}</Button></div>
              <div><Label>{t("admin.sessionTimeout")}</Label><Input type="number" value={formData.sessionTimeout} onChange={(e) => setFormData({ ...formData, sessionTimeout: e.target.value })} className="mt-1" /></div>
            </>
          )}
          {activeTab === "email" && (
            <div className="flex items-center justify-between"><Label>{t("admin.emailNotifications")}</Label><Button variant={formData.emailNotifications ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, emailNotifications: !formData.emailNotifications })}>{formData.emailNotifications ? t("admin.enabled") : t("admin.disabled")}</Button></div>
          )}
          {activeTab === "storage" && (
            <div><Label>{t("admin.storageLimit")}</Label><Input type="number" value={formData.storageLimit} onChange={(e) => setFormData({ ...formData, storageLimit: e.target.value })} className="mt-1" /></div>
          )}
          {activeTab === "ai" && (
            <div><Label>{t("admin.defaultAIProvider")}</Label><select value={formData.aiProvider} onChange={(e) => setFormData({ ...formData, aiProvider: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mt-1"><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="google">Google</option><option value="cohere">Cohere</option></select></div>
          )}
          {activeTab === "billing" && (
            <div className="text-center py-8 text-muted-foreground"><CreditCard className="size-8 mx-auto mb-2 opacity-40" /><p>{t("admin.noBillingConfigured")}</p><Button variant="link" className="mt-2">{t("admin.manageBilling")}</Button></div>
          )}
          {activeTab === "api" && (
            <div><Label>{t("admin.apiRateLimit")}</Label><Input type="number" value={formData.apiRateLimit} onChange={(e) => setFormData({ ...formData, apiRateLimit: e.target.value })} className="mt-1" /></div>
          )}
          {activeTab === "advanced" && (
            <div className="flex items-center justify-between"><Label>{t("admin.debugMode")}</Label><Button variant={formData.debugMode ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, debugMode: !formData.debugMode })}>{formData.debugMode ? t("admin.enabled") : t("admin.disabled")}</Button></div>
          )}
        </div>

        <div className="flex gap-2 pt-6 border-t border-border mt-6">
          <Button onClick={handleSave} disabled={saving}><Save className="mr-2 size-4" />{saving ? t("admin.saving") : t("admin.saveChanges")}</Button>
          <Button variant="outline" onClick={() => { if (confirm("Reset all settings to defaults? This cannot be undone.")) { setFormData({ siteName: "Tamer Studio", timezone: "UTC", language: "en", twoFactor: true, sessionTimeout: "30", emailNotifications: true, storageLimit: "10", aiProvider: "openai", apiRateLimit: "1000", debugMode: false }); toast.success(t("settings.saved")); } }}><RefreshCw className="mr-2 size-4" />{t("admin.reset")}</Button>
        </div>
      </DashboardCard>
    </div>
  );
}