"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, RefreshCw, User, Mail, Shield, Database, Sparkles, CreditCard, Key, Server, ChevronDown, ChevronRight, Trash2, TestTube, Loader2 } from "lucide-react";
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

const PROVIDER_TYPES = [
  { type: "smtp", labelKey: "email.smtp", descKey: "email.smtpDescription" },
  { type: "sendgrid", labelKey: "email.sendgrid", descKey: "email.sendgridDescription" },
  { type: "resend", labelKey: "email.resend", descKey: "email.resendDescription" },
  { type: "amazon", labelKey: "email.amazonSes", descKey: "email.amazonSesDescription" },
  { type: "mailgun", labelKey: "email.mailgun", descKey: "email.mailgunDescription" },
  { type: "postmark", labelKey: "email.postmark", descKey: "email.postmarkDescription" },
  { type: "brevo", labelKey: "email.brevo", descKey: "email.brevoDescription" },
  { type: "sparkpost", labelKey: "email.sparkpost", descKey: "email.sparkpostDescription" },
] as const;

type ProviderType = (typeof PROVIDER_TYPES)[number]["type"];

const EMPTY_CREDENTIALS: Record<ProviderType, Record<string, string>> = {
  smtp: { host: "", port: "587", secure: "false", username: "", password: "" },
  sendgrid: { apiKey: "" },
  resend: { apiKey: "" },
  amazon: { accessKey: "", secret: "", region: "us-east-1" },
  mailgun: { apiKey: "", domain: "" },
  postmark: { serverToken: "" },
  brevo: { apiKey: "" },
  sparkpost: { apiKey: "" },
};

function FieldWrap({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

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

  const [providers, setProviders] = React.useState<Array<{
    id: string;
    name: string;
    type: string;
    isActive: boolean;
    senderName: string;
    senderEmail: string;
    replyTo?: string | null;
    dailyLimit?: number;
    monthlyLimit?: number;
    timeout?: number;
    retryCount?: number;
    domain?: string | null;
    credentials?: Record<string, unknown>;
  }>>([]);
  const [loadingProviders, setLoadingProviders] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [providerForms, setProviderForms] = React.useState<Record<string, Record<string, string>>>({});
  const [testingId, setTestingId] = React.useState<string | null>(null);
  const [creatingType, setCreatingType] = React.useState<ProviderType | null>(null);

  const fetchProviders = React.useCallback(async () => {
    setLoadingProviders(true);
    try {
      const res = await fetch("/api/admin/email/providers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load providers");
      const list = (data.data || []) as Array<{
        id: string;
        name: string;
        type: string;
        isActive: boolean;
        senderName: string;
        senderEmail: string;
        replyTo?: string | null;
        dailyLimit?: number;
        monthlyLimit?: number;
        timeout?: number;
        retryCount?: number;
        domain?: string | null;
        credentials?: Record<string, unknown>;
      }>;
      setProviders(list);
      setProviderForms((prev) => {
        const next: Record<string, Record<string, string>> = { ...prev };
        for (const p of list) {
          if (!next[p.id]) {
            const creds = typeof p.credentials === "object" && p.credentials !== null ? p.credentials as Record<string, unknown> : {};
            next[p.id] = {
              name: p.name || "",
              senderName: p.senderName || "",
              senderEmail: p.senderEmail || "",
              replyTo: p.replyTo || "",
              ...(Object.fromEntries(
                Object.entries(creds).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => [k, String(v)])
              ) as Record<string, string>),
            };
          }
        }
        return next;
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load providers");
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        providers.map((p) => {
          const form = providerForms[p.id] || {};
          const body: Record<string, unknown> = {
            name: form.name || p.name,
            senderName: form.senderName || p.senderName,
            senderEmail: form.senderEmail || p.senderEmail,
            replyTo: form.replyTo || p.replyTo || "",
            isActive: p.isActive,
            dailyLimit: p.dailyLimit ?? 0,
            monthlyLimit: p.monthlyLimit ?? 0,
            timeout: p.timeout ?? 30,
            retryCount: p.retryCount ?? 3,
          };

          const existingCreds = typeof p.credentials === "object" && p.credentials !== null ? p.credentials : {};
          const mergedCreds: Record<string, string> = { ...existingCreds } as Record<string, string>;

          for (const k of Object.keys(EMPTY_CREDENTIALS[p.type as ProviderType] || {})) {
            if (form[k] !== undefined && form[k] !== "") {
              mergedCreds[k] = form[k];
            }
          }

          body.credentials = mergedCreds;

          return fetch(`/api/admin/email/providers/${encodeURIComponent(p.id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        })
      );
      toast.success(t("settings.saved"));
      await fetchProviders();
    } catch {
      toast.error(t("settings.saveFailed", "Failed to save settings"));
    } finally {
      setSaving(false);
    }
  };

  const toggleProvider = async (provider: typeof providers[0]) => {
    const prev = providers;
    setProviders((list) => list.map((p) => (p.id === provider.id ? { ...p, isActive: !p.isActive } : p)));
    try {
      const res = await fetch(`/api/admin/email/providers/${encodeURIComponent(provider.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !provider.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update provider");
      toast.success(data.message || t("email.statusUpdated"));
      await fetchProviders();
    } catch (err) {
      setProviders(prev);
      toast.error(err instanceof Error ? err.message : "Failed to update provider");
    }
  };

  const testProvider = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/admin/email/providers/${encodeURIComponent(id)}/test`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Test failed");
      toast.success(data.data?.response?.message || data.message || t("email.testSuccess"));
      await fetchProviders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("email.testFailed"));
    } finally {
      setTestingId(null);
    }
  };

  const createProvider = async (type: ProviderType) => {
    setCreatingType(type);
    try {
      const meta = PROVIDER_TYPES.find((item) => item.type === type);
      const res = await fetch("/api/admin/email/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: `${meta?.labelKey ? t(meta.labelKey) : type} ${providers.filter((p) => p.type === type).length + 1}`,
          description: meta?.descKey ? t(meta.descKey) : "",
          senderName: formData.siteName,
          senderEmail: "",
          isActive: false,
          priority: providers.length + 1,
          routingMode: "priority",
          credentials: EMPTY_CREDENTIALS[type],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create provider");
      toast.success(data.message || t("email.providerCreated"));
      setExpandedId(data.data?.id || null);
      await fetchProviders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create provider");
    } finally {
      setCreatingType(null);
    }
  };

  const deleteProvider = async (id: string) => {
    const prev = providers;
    setProviders((list) => list.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/admin/email/providers/${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete provider");
      toast.success(data.message || t("email.deleted"));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      setProviders(prev);
      toast.error(err instanceof Error ? err.message : "Failed to delete provider");
    }
  };

  const updateFormField = (providerId: string, field: string, value: string) => {
    setProviderForms((prev) => ({
      ...prev,
      [providerId]: { ...(prev[providerId] || {}), [field]: value },
    }));
  };

  const renderProviderForm = (provider: typeof providers[0]) => {
    const form = providerForms[provider.id] || {};
    const creds = (typeof provider.credentials === "object" && provider.credentials !== null ? provider.credentials : {}) as Record<string, unknown>;

    const commonFields = (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrap label={t("email.senderName")}>
            <Input value={form.senderName ?? provider.senderName ?? ""} onChange={(e) => updateFormField(provider.id, "senderName", e.target.value)} />
          </FieldWrap>
          <FieldWrap label={t("email.senderEmail")}>
            <Input type="email" value={form.senderEmail ?? provider.senderEmail ?? ""} onChange={(e) => updateFormField(provider.id, "senderEmail", e.target.value)} />
          </FieldWrap>
        </div>
        <FieldWrap label={t("email.replyTo")}>
          <Input value={form.replyTo ?? (provider.replyTo || "")} onChange={(e) => updateFormField(provider.id, "replyTo", e.target.value)} />
        </FieldWrap>
      </>
    );

    const typeFields: Record<string, React.ReactNode> = {
      smtp: (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FieldWrap label={t("email.host")} className="sm:col-span-2">
              <Input value={form.host ?? (creds.host as string) ?? ""} onChange={(e) => updateFormField(provider.id, "host", e.target.value)} />
            </FieldWrap>
            <FieldWrap label={t("email.port")}>
              <Input value={form.port ?? (String(creds.port) || "587")} onChange={(e) => updateFormField(provider.id, "port", e.target.value)} />
            </FieldWrap>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.encryption")} (SSL/TLS)</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{t("email.ssl", "Secure Socket Layer")}</p>
            </div>
            <Button
              variant={String(form.secure ?? creds.secure) === "true" ? "default" : "outline"}
              size="sm"
              onClick={() => updateFormField(provider.id, "secure", String(form.secure ?? creds.secure) === "true" ? "false" : "true")}
              className="min-w-[72px]"
            >
              {String(form.secure ?? creds.secure) === "true" ? t("email.ssl") : t("email.none")}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldWrap label={t("email.username")}>
              <Input value={form.username ?? (creds.username as string) ?? ""} onChange={(e) => updateFormField(provider.id, "username", e.target.value)} />
            </FieldWrap>
            <FieldWrap label={t("email.password")}>
              <Input type="password" value={form.password ?? (creds.password as string) ?? ""} onChange={(e) => updateFormField(provider.id, "password", e.target.value)} />
            </FieldWrap>
          </div>
        </>
      ),
      sendgrid: (
        <FieldWrap label="SendGrid API Key">
          <Input type="password" value={form.apiKey ?? (creds.apiKey as string) ?? ""} onChange={(e) => updateFormField(provider.id, "apiKey", e.target.value)} />
        </FieldWrap>
      ),
      resend: (
        <FieldWrap label="Resend API Key">
          <Input type="password" value={form.apiKey ?? (creds.apiKey as string) ?? ""} onChange={(e) => updateFormField(provider.id, "apiKey", e.target.value)} />
        </FieldWrap>
      ),
      amazon: (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FieldWrap label={t("email.region")}>
              <Input value={form.region ?? (creds.region as string) ?? "us-east-1"} onChange={(e) => updateFormField(provider.id, "region", e.target.value)} />
            </FieldWrap>
            <FieldWrap label={t("email.accessKey")}>
              <Input value={form.accessKey ?? (creds.accessKey as string) ?? ""} onChange={(e) => updateFormField(provider.id, "accessKey", e.target.value)} />
            </FieldWrap>
            <FieldWrap label={t("email.secret")}>
              <Input type="password" value={form.secret ?? (creds.secret as string) ?? ""} onChange={(e) => updateFormField(provider.id, "secret", e.target.value)} />
            </FieldWrap>
          </div>
        </>
      ),
      mailgun: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrap label="Mailgun API Key">
            <Input type="password" value={form.apiKey ?? (creds.apiKey as string) ?? ""} onChange={(e) => updateFormField(provider.id, "apiKey", e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Mailgun Domain">
            <Input value={form.domain ?? (creds.domain as string) ?? ""} onChange={(e) => updateFormField(provider.id, "domain", e.target.value)} />
          </FieldWrap>
        </div>
      ),
      postmark: (
        <FieldWrap label="Postmark Server Token">
          <Input type="password" value={form.serverToken ?? (creds.serverToken as string) ?? ""} onChange={(e) => updateFormField(provider.id, "serverToken", e.target.value)} />
        </FieldWrap>
      ),
      brevo: (
        <FieldWrap label="Brevo API Key">
          <Input type="password" value={form.apiKey ?? (creds.apiKey as string) ?? ""} onChange={(e) => updateFormField(provider.id, "apiKey", e.target.value)} />
        </FieldWrap>
      ),
      sparkpost: (
        <FieldWrap label="SparkPost API Key">
          <Input type="password" value={form.apiKey ?? (creds.apiKey as string) ?? ""} onChange={(e) => updateFormField(provider.id, "apiKey", e.target.value)} />
        </FieldWrap>
      ),
    };

    return (
      <div className="space-y-5">
        {commonFields}
        {typeFields[provider.type] || null}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FieldWrap label={t("email.timeout") + " (s)"}>
            <Input type="number" value={String(form.timeout ?? provider.timeout ?? 30)} onChange={(e) => updateFormField(provider.id, "timeout", e.target.value)} />
          </FieldWrap>
          <FieldWrap label={t("email.retryCount")}>
            <Input type="number" value={String(form.retryCount ?? provider.retryCount ?? 3)} onChange={(e) => updateFormField(provider.id, "retryCount", e.target.value)} />
          </FieldWrap>
          <FieldWrap label={t("email.dailyLimit")}>
            <Input type="number" value={String(form.dailyLimit ?? provider.dailyLimit ?? 0)} onChange={(e) => updateFormField(provider.id, "dailyLimit", e.target.value)} />
          </FieldWrap>
        </div>
      </div>
    );
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.settings") }]} />
        <PageHeader
          title={t("admin.title")}
          description={t("admin.description")}
          actions={
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
                {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
                {saving ? t("admin.saving") : t("admin.saveChanges")}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm(t("admin.resetConfirm", "Reset all settings to defaults? This cannot be undone."))) {
                    setFormData({ siteName: "Tamer Studio", timezone: "UTC", language: "en", twoFactor: true, sessionTimeout: "30", emailNotifications: true, storageLimit: "10", aiProvider: "openai", apiRateLimit: "1000", debugMode: false });
                    toast.success(t("settings.saved"));
                  }
                }}
              >
                <RefreshCw className="mr-2 size-4" />
                {t("admin.reset")}
              </Button>
            </div>
          }
        />

        <div className="flex gap-1 border-b border-border overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
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

        <div className="space-y-6">
          {activeTab === "general" && (
            <DashboardCard>
              <div className="space-y-5">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.siteName")}</Label>
                  <Input value={formData.siteName} onChange={(e) => setFormData({ ...formData, siteName: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.timezone")}</Label>
                  <Input value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.language")}</Label>
                  <select value={formData.language} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <option value="en">{t("admin.language", "English")}</option>
                  </select>
                </div>
              </div>
            </DashboardCard>
          )}

          {activeTab === "security" && (
            <DashboardCard>
              <div className="space-y-5">
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
                  <div>
                    <Label className="text-sm font-medium">{t("admin.twoFactor")}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("admin.securityDesc", "Add an extra layer of security")}</p>
                  </div>
                  <Button variant={formData.twoFactor ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, twoFactor: !formData.twoFactor })} className="min-w-[88px]">
                    {formData.twoFactor ? t("admin.enabled") : t("admin.disabled")}
                  </Button>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.sessionTimeout")} (minutes)</Label>
                  <Input type="number" value={formData.sessionTimeout} onChange={(e) => setFormData({ ...formData, sessionTimeout: e.target.value })} className="mt-1.5" />
                </div>
              </div>
            </DashboardCard>
          )}

          {activeTab === "email" && (
            <div className="space-y-6">
              <DashboardCard>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-base font-medium">{t("admin.emailNotifications")}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("admin.emailNotifications", "Master switch for email notifications")}</p>
                  </div>
                  <Button variant={formData.emailNotifications ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, emailNotifications: !formData.emailNotifications })} className="min-w-[88px]">
                    {formData.emailNotifications ? t("admin.enabled") : t("admin.disabled")}
                  </Button>
                </div>
              </DashboardCard>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-base font-medium">{t("email.providers")}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("email.providersDescription")}</p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) createProvider(e.target.value as ProviderType);
                      }}
                      disabled={!!creatingType}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <option value="">+ {t("email.addProvider", "Add Provider")}</option>
                      {PROVIDER_TYPES.map((pt) => (
                        <option key={pt.type} value={pt.type}>{t(pt.labelKey)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {loadingProviders ? (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {t("common.loading")}
                  </div>
                ) : providers.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                    {t("email.noProviders")}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {providers.map((provider) => {
                      const isExpanded = expandedId === provider.id;
                      const meta = PROVIDER_TYPES.find((item) => item.type === provider.type);
                      return (
                        <div key={provider.id} className="rounded-xl border border-border bg-card">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                            <div className="flex items-center gap-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                onClick={() => setExpandedId(isExpanded ? null : provider.id)}
                              >
                                {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                              </Button>
                              <div>
                                <p className="font-medium text-sm">{provider.name}</p>
                                <p className="text-xs text-muted-foreground">{meta ? t(meta.labelKey) : provider.type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-11 sm:ml-0">
                              <Button
                                variant={provider.isActive ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleProvider(provider)}
                                className="min-w-[88px]"
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className={cn("size-1.5 rounded-full", provider.isActive ? "bg-green-500" : "bg-muted-foreground")} />
                                  {provider.isActive ? t("email.enabled") : t("email.disabled")}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => testProvider(provider.id)}
                                disabled={testingId === provider.id}
                                className="min-w-[110px]"
                              >
                                {testingId === provider.id ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <TestTube className="mr-1.5 size-3.5" />}
                                {testingId === provider.id ? t("email.testing") : t("email.testConnection")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm(t("email.deleteConfirm", `Delete provider "${provider.name}"?`))) {
                                    deleteProvider(provider.id);
                                  }
                                }}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="border-t border-border bg-muted/10 p-4 space-y-4">
                              {renderProviderForm(provider)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "storage" && (
            <DashboardCard>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.storageLimit")} (GB)</Label>
                <Input type="number" value={formData.storageLimit} onChange={(e) => setFormData({ ...formData, storageLimit: e.target.value })} className="max-w-xs" />
              </div>
            </DashboardCard>
          )}

          {activeTab === "ai" && (
            <DashboardCard>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.defaultAIProvider")}</Label>
                <select value={formData.aiProvider} onChange={(e) => setFormData({ ...formData, aiProvider: e.target.value })} className="max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm">
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google</option>
                  <option value="cohere">Cohere</option>
                </select>
              </div>
            </DashboardCard>
          )}

          {activeTab === "billing" && (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              <CreditCard className="size-8 mx-auto mb-3 opacity-40" />
              <p>{t("admin.noBillingConfigured")}</p>
              <Button variant="link" className="mt-2">{t("admin.manageBilling")}</Button>
            </div>
          )}

          {activeTab === "api" && (
            <DashboardCard>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("admin.apiRateLimit")} / minute</Label>
                <Input type="number" value={formData.apiRateLimit} onChange={(e) => setFormData({ ...formData, apiRateLimit: e.target.value })} className="max-w-xs" />
              </div>
            </DashboardCard>
          )}

          {activeTab === "advanced" && (
            <DashboardCard>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4">
                <div>
                  <Label className="text-sm font-medium">{t("admin.debugMode")}</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">{t("admin.debugMode", "Enable debug mode")}</p>
                </div>
                <Button variant={formData.debugMode ? "default" : "outline"} size="sm" onClick={() => setFormData({ ...formData, debugMode: !formData.debugMode })} className="min-w-[88px]">
                  {formData.debugMode ? t("admin.enabled") : t("admin.disabled")}
                </Button>
              </div>
            </DashboardCard>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
