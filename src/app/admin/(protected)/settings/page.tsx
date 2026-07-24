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

type TabId = "general" | "security" | "email" | "storage" | "ai" | "billing" | "api" | "advanced";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <User className="size-4" /> },
  { id: "security", label: "Security", icon: <Shield className="size-4" /> },
  { id: "email", label: "Email", icon: <Mail className="size-4" /> },
  { id: "storage", label: "Storage", icon: <Database className="size-4" /> },
  { id: "ai", label: "AI", icon: <Sparkles className="size-4" /> },
  { id: "billing", label: "Billing", icon: <CreditCard className="size-4" /> },
  { id: "api", label: "API", icon: <Key className="size-4" /> },
  { id: "advanced", label: "Advanced", icon: <Server className="size-4" /> },
];

export default function SettingsPage() {
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
    setTimeout(() => { setSaving(false); toast.success("Settings saved"); }, 600);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Settings" }]} />
      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage system settings and configuration</p>
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
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeTab === "general" && (
            <>
              <div><Label>Site Name</Label><Input value={formData.siteName} onChange={(e) => setFormData({ ...formData, siteName: e.target.value })} className="mt-1" /></div>
              <div><Label>Timezone</Label><Input value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} className="mt-1" /></div>
              <div><Label>Language</Label><Input value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="mt-1" /></div>
            </>
          )}
          {activeTab === "security" && (
            <>
              <div className="flex items-center justify-between"><Label>Two-Factor Authentication</Label><Button variant={formData.twoFactor ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, twoFactor: !formData.twoFactor })}>{formData.twoFactor ? "Enabled" : "Disabled"}</Button></div>
              <div><Label>Session Timeout (minutes)</Label><Input type="number" value={formData.sessionTimeout} onChange={(e) => setFormData({ ...formData, sessionTimeout: e.target.value })} className="mt-1" /></div>
            </>
          )}
          {activeTab === "email" && (
            <div className="flex items-center justify-between"><Label>Email Notifications</Label><Button variant={formData.emailNotifications ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, emailNotifications: !formData.emailNotifications })}>{formData.emailNotifications ? "Enabled" : "Disabled"}</Button></div>
          )}
          {activeTab === "storage" && (
            <div><Label>Storage Limit (GB)</Label><Input type="number" value={formData.storageLimit} onChange={(e) => setFormData({ ...formData, storageLimit: e.target.value })} className="mt-1" /></div>
          )}
          {activeTab === "ai" && (
            <div><Label>Default AI Provider</Label><select value={formData.aiProvider} onChange={(e) => setFormData({ ...formData, aiProvider: e.target.value })} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm mt-1"><option value="openai">OpenAI</option><option value="anthropic">Anthropic</option><option value="google">Google</option><option value="cohere">Cohere</option></select></div>
          )}
          {activeTab === "billing" && (
            <div className="text-center py-8 text-muted-foreground"><CreditCard className="size-8 mx-auto mb-2 opacity-40" /><p>No billing information configured</p><Button variant="link" className="mt-2">Manage billing</Button></div>
          )}
          {activeTab === "api" && (
            <div><Label>API Rate Limit (per minute)</Label><Input type="number" value={formData.apiRateLimit} onChange={(e) => setFormData({ ...formData, apiRateLimit: e.target.value })} className="mt-1" /></div>
          )}
          {activeTab === "advanced" && (
            <div className="flex items-center justify-between"><Label>Debug Mode</Label><Button variant={formData.debugMode ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, debugMode: !formData.debugMode })}>{formData.debugMode ? "Enabled" : "Disabled"}</Button></div>
          )}
        </div>

        <div className="flex gap-2 pt-6 border-t border-border mt-6">
          <Button onClick={handleSave} disabled={saving}><Save className="mr-2 size-4" />{saving ? "Saving..." : "Save Changes"}</Button>
          <Button variant="outline" onClick={() => { if (confirm("Reset all settings to defaults? This cannot be undone.")) { setFormData({ siteName: "Tamer Studio", timezone: "UTC", language: "en", twoFactor: true, sessionTimeout: "30", emailNotifications: true, storageLimit: "10", aiProvider: "openai", apiRateLimit: "1000", debugMode: false }); toast.success("Settings reset to defaults"); } }}><RefreshCw className="mr-2 size-4" />Reset</Button>
        </div>
      </DashboardCard>
    </div>
  );
}