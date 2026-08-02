"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/Badge";
import {
  Save,
  TestTube,
  Loader2,
  Send,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

type SmtpSettings = {
  id?: string;
  enabled: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  encryption: string;
  senderName: string;
  senderEmail: string;
  replyTo: string;
  connectionTimeout: number;
  enableEmailQueue: boolean;
  rateLimit: number;
  maxRetry: number;
  retryDelay: number;
  dailySendLimit: number;
};

type TestResult = {
  success: boolean;
  host: string;
  port: number;
  encryption: string;
  responseTime: number;
  serverResponse?: string;
  error?: string;
  errorType?: string;
};

type SendTestResult = {
  success: boolean;
  messageId?: string;
  responseTime: number;
  recipient: string;
};

type TemplatePreview = {
  subject: string;
  html: string;
  text: string;
};

type TemplateInfo = {
  key: string;
  name: string;
  type: string;
  subject: string;
  variables: string[];
};

type HealthData = {
  smtpEnabled: boolean;
  connectionStatus: string;
  lastSuccess: string | null;
  lastFailure: string | null;
  queueSize: number;
  avgSendTime: number;
  failedEmails: number;
  successRate: number;
};

type EmailSettingsTabProps = {
  adminToken: string | null;
  t: (key: string, fallback?: string) => string;
  siteName: string;
};

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
        checked ? "bg-primary" : "bg-input",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}

export function EmailSettingsTab({ adminToken, t, siteName }: EmailSettingsTabProps) {
  const [settings, setSettings] = React.useState<SmtpSettings>({
    enabled: false,
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    encryption: "none",
    senderName: siteName || "Tamer Studio",
    senderEmail: "",
    replyTo: "",
    connectionTimeout: 30,
    enableEmailQueue: false,
    rateLimit: 60,
    maxRetry: 3,
    retryDelay: 30,
    dailySendLimit: 1000,
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [testingSmtp, setTestingSmtp] = React.useState(false);
  const [testResult, setTestResult] = React.useState<TestResult | null>(null);
  const [sendTestEmail, setSendTestEmail] = React.useState("");
  const [sendingTest, setSendingTest] = React.useState(false);
  const [sendResult, setSendResult] = React.useState<SendTestResult | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [previewKey, setPreviewKey] = React.useState("verification");
  const [preview, setPreview] = React.useState<TemplatePreview | null>(null);
  const [templates, setTemplates] = React.useState<TemplateInfo[]>([]);
  const [health, setHealth] = React.useState<HealthData>({
    smtpEnabled: false,
    connectionStatus: "unknown",
    lastSuccess: null,
    lastFailure: null,
    queueSize: 0,
    avgSendTime: 0,
    failedEmails: 0,
    successRate: 0,
  });

  const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
  if (adminToken) authHeaders["Authorization"] = `Bearer ${adminToken}`;

  React.useEffect(() => {
    fetch("/api/admin/email/smtp/settings", { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings((prev) => ({ ...prev, ...data.data }));
          setHealth((prev) => ({
            ...prev,
            smtpEnabled: data.data.enabled,
            connectionStatus: data.data.enabled ? "operational" : "disabled",
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/admin/email/smtp/preview?action=list", { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.templates) {
          setTemplates(data.data.templates);
        }
      })
      .catch(() => {});

    fetch("/api/admin/email/smtp/preview?key=verification", { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) setPreview(data.data);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (previewKey) {
      fetch(`/api/admin/email/smtp/preview?key=${previewKey}`, { headers: authHeaders })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.data) setPreview(data.data);
        })
        .catch(() => {});
    }
  }, [previewKey]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/email/smtp/settings", {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("email.settingsSaved", "SMTP settings saved successfully"));
      } else {
        toast.error(data.error || t("email.settingsSaveFailed", "Failed to save settings"));
      }
    } catch {
      toast.error(t("email.settingsSaveFailed", "Failed to save settings"));
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    setTestingSmtp(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/email/smtp/test", {
        method: "POST",
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTestResult(data.data);
        if (data.data.success) {
          toast.success(t("email.connectionSuccess", "Connection successful"));
          setHealth((prev) => ({
            ...prev,
            connectionStatus: "operational",
            lastSuccess: new Date().toISOString(),
          }));
        } else {
          toast.error(data.data.error || t("email.connectionFailed", "Connection failed"));
          setHealth((prev) => ({
            ...prev,
            connectionStatus: "error",
            lastFailure: new Date().toISOString(),
          }));
        }
      } else {
        toast.error(data.error || t("email.connectionFailed", "Connection failed"));
      }
    } catch {
      toast.error(t("email.connectionFailed", "Connection failed"));
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleSendTest = async () => {
    if (!sendTestEmail) return;
    setSendingTest(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/email/smtp/send-test", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ recipientEmail: sendTestEmail }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSendResult(data.data);
        toast.success(t("email.testEmailSent", "Test email sent successfully"));
      } else {
        toast.error(data.error || t("email.testEmailFailed", "Failed to send test email"));
      }
    } catch {
      toast.error(t("email.testEmailFailed", "Failed to send test email"));
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardCard>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-heading text-base font-medium">{t("email.smtpConfiguration", "SMTP Configuration")}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{t("email.smtpConfigurationDesc", "Configure your SMTP server settings")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium">{t("email.enableSmtp", "Enable SMTP")}</Label>
            <Toggle
              checked={settings.enabled}
              onChange={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.smtpHost", "SMTP Host")}</Label>
              <Input
                value={settings.smtpHost}
                onChange={(e) => setSettings((prev) => ({ ...prev, smtpHost: e.target.value }))}
                placeholder="smtp.gmail.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.smtpPort", "SMTP Port")}</Label>
              <Input
                type="number"
                value={settings.smtpPort}
                onChange={(e) => setSettings((prev) => ({ ...prev, smtpPort: e.target.value }))}
                placeholder="587"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.smtpUsername", "SMTP Username")}</Label>
              <Input
                value={settings.smtpUsername}
                onChange={(e) => setSettings((prev) => ({ ...prev, smtpUsername: e.target.value }))}
                placeholder="user@example.com"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.smtpPassword", "SMTP Password")}</Label>
              <div className="relative mt-1.5">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={settings.smtpPassword}
                  onChange={(e) => setSettings((prev) => ({ ...prev, smtpPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.encryption", "Encryption")}</Label>
              <select
                value={settings.encryption}
                onChange={(e) => setSettings((prev) => ({ ...prev, encryption: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="none">{t("email.none", "None")}</option>
                <option value="ssl">{t("email.ssl", "SSL")}</option>
                <option value="tls">{t("email.tls", "TLS")}</option>
                <option value="starttls">{t("email.starttls", "STARTTLS")}</option>
              </select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.connectionTimeout", "Connection Timeout")} (s)</Label>
              <Input
                type="number"
                value={settings.connectionTimeout}
                onChange={(e) => setSettings((prev) => ({ ...prev, connectionTimeout: Number(e.target.value) }))}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard>
        <h3 className="font-heading text-base font-medium mb-4">{t("email.senderConfiguration", "Sender Configuration")}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.senderName", "Sender Name")}</Label>
              <Input
                value={settings.senderName}
                onChange={(e) => setSettings((prev) => ({ ...prev, senderName: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.senderEmail", "Sender Email")}</Label>
              <Input
                type="email"
                value={settings.senderEmail}
                onChange={(e) => setSettings((prev) => ({ ...prev, senderEmail: e.target.value }))}
                placeholder="noreply@tamerstudio.com"
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.replyTo", "Reply-To Email")}</Label>
            <Input
              type="email"
              value={settings.replyTo}
              onChange={(e) => setSettings((prev) => ({ ...prev, replyTo: e.target.value }))}
              placeholder="support@tamerstudio.com"
              className="mt-1.5"
            />
          </div>
        </div>
      </DashboardCard>

      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-base font-medium">{t("email.queueAndLimits", "Queue & Limits")}</h3>
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium">{t("email.enableEmailQueue", "Enable Queue")}</Label>
            <Toggle
              checked={settings.enableEmailQueue}
              onChange={() => setSettings((prev) => ({ ...prev, enableEmailQueue: !prev.enableEmailQueue }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.rateLimit", "Rate Limit")} (per min)</Label>
            <Input
              type="number"
              value={settings.rateLimit}
              onChange={(e) => setSettings((prev) => ({ ...prev, rateLimit: Number(e.target.value) }))}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.maxRetry", "Maximum Retry")}</Label>
            <Input
              type="number"
              value={settings.maxRetry}
              onChange={(e) => setSettings((prev) => ({ ...prev, maxRetry: Number(e.target.value) }))}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.retryDelay", "Retry Delay")} (s)</Label>
            <Input
              type="number"
              value={settings.retryDelay}
              onChange={(e) => setSettings((prev) => ({ ...prev, retryDelay: Number(e.target.value) }))}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.dailySendLimit", "Daily Send Limit")}</Label>
            <Input
              type="number"
              value={settings.dailySendLimit}
              onChange={(e) => setSettings((prev) => ({ ...prev, dailySendLimit: Number(e.target.value) }))}
              className="mt-1.5"
            />
          </div>
        </div>
      </DashboardCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-[140px]">
          {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          {saving ? t("admin.saving") : t("admin.saveChanges")}
        </Button>
      </div>

      <DashboardCard>
        <h3 className="font-heading text-base font-medium mb-4">{t("email.testSmtp", "Test SMTP Connection")}</h3>
        <Button onClick={handleTestSmtp} disabled={testingSmtp} variant="outline">
          {testingSmtp ? <Loader2 className="mr-2 size-4 animate-spin" /> : <TestTube className="mr-2 size-4" />}
          {testingSmtp ? t("email.testing", "Testing...") : t("email.testSmtp", "Test SMTP")}
        </Button>
        {testResult && (
          <div className={cn("mt-4 rounded-lg border p-4", testResult.success ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950")}>
            <div className="flex items-center gap-2 mb-3">
              {testResult.success ? <CheckCircle className="size-5 text-green-600" /> : <XCircle className="size-5 text-red-600" />}
              <span className="font-medium">{testResult.success ? t("email.connectionSuccess") : t("email.connectionFailed")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">{t("email.smtpServer")}:</span> {testResult.host}</div>
              <div><span className="text-muted-foreground">{t("email.port")}:</span> {testResult.port}</div>
              <div><span className="text-muted-foreground">{t("email.encryption")}:</span> {testResult.encryption}</div>
              <div><span className="text-muted-foreground">{t("email.responseTime")}:</span> {testResult.responseTime}ms</div>
              {testResult.serverResponse && <div className="col-span-2"><span className="text-muted-foreground">{t("email.serverResponse")}:</span> {testResult.serverResponse}</div>}
              {testResult.error && <div className="col-span-2 text-destructive"><span className="text-muted-foreground">{t("email.error")}:</span> {testResult.error}</div>}
              {testResult.errorType && <div className="col-span-2 text-destructive"><span className="text-muted-foreground">Error Type:</span> {testResult.errorType}</div>}
            </div>
          </div>
        )}
      </DashboardCard>

      <DashboardCard>
        <h3 className="font-heading text-base font-medium mb-4">{t("email.sendTestEmail", "Send Test Email")}</h3>
        <div className="flex gap-3">
          <Input
            type="email"
            value={sendTestEmail}
            onChange={(e) => setSendTestEmail(e.target.value)}
            placeholder={t("email.testRecipientPlaceholder", "recipient@example.com")}
            className="flex-1"
          />
          <Button onClick={handleSendTest} disabled={sendingTest || !sendTestEmail} variant="outline">
            {sendingTest ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Send className="mr-2 size-4" />}
            {sendingTest ? t("email.sendingTest") : t("email.sendTest")}
          </Button>
        </div>
        {sendResult && (
          <div className={cn("mt-4 rounded-lg border p-4", sendResult.success ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950")}>
            <div className="flex items-center gap-2">
              {sendResult.success ? <CheckCircle className="size-5 text-green-600" /> : <XCircle className="size-5 text-red-600" />}
              <span className="font-medium">{sendResult.success ? t("email.testEmailSent") : t("email.testEmailFailed")}</span>
            </div>
            {sendResult.success && (
              <div className="mt-2 text-sm text-muted-foreground">
                {t("email.recipient")}: {sendResult.recipient} | {t("email.responseTime")}: {sendResult.responseTime}ms
              </div>
            )}
          </div>
        )}
      </DashboardCard>

      <DashboardCard>
        <h3 className="font-heading text-base font-medium mb-4">{t("email.smtpHealthCheck", "SMTP Health Check")}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Mail className="size-4" />{t("email.smtpEnabled")}</div>
            <Badge tone={health.smtpEnabled ? "success" : "muted"}>{health.smtpEnabled ? t("email.enabled") : t("email.disabled")}</Badge>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Activity className="size-4" />{t("email.status")}</div>
            <Badge tone={health.connectionStatus === "operational" ? "success" : "warning"}>{health.connectionStatus}</Badge>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><CheckCircle className="size-4" />{t("email.lastSuccess")}</div>
            <span className="text-sm">{health.lastSuccess ? new Date(health.lastSuccess).toLocaleString() : "—"}</span>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><AlertTriangle className="size-4" />{t("email.lastFailure")}</div>
            <span className="text-sm">{health.lastFailure ? new Date(health.lastFailure).toLocaleString() : "—"}</span>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-base font-medium">{t("email.templatePreview", "Template Preview")}</h3>
          <select
            value={previewKey}
            onChange={(e) => setPreviewKey(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {templates.map((tpl) => (
              <option key={tpl.key} value={tpl.key}>{tpl.name}</option>
            ))}
          </select>
        </div>
        {preview && (
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.subject")}</Label>
              <p className="text-sm mt-1">{preview.subject}</p>
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">{t("email.htmlPreview", "HTML Preview")}</div>
              <div
                className="p-4 max-h-[400px] overflow-auto bg-white dark:bg-background"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
            </div>
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border">{t("email.textPreview", "Text Preview")}</div>
              <pre className="p-4 text-sm text-muted-foreground whitespace-pre-wrap max-h-[200px] overflow-auto">{preview.text}</pre>
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
