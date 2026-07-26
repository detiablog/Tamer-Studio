"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Save, RefreshCw, Edit3, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

type Template = {
  id: string;
  name: string;
  type: string;
  subject: string;
  body: string;
  active: boolean;
  lastUpdated: string;
  variables: string[];
};

const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "verification-welcome",
    name: "Verification Welcome",
    type: "verification-welcome",
    subject: "Welcome to {{siteName}} — Verify Your Email",
    body: "<p>Hello {{firstName}},</p><p>Thank you for joining {{siteName}}! Please verify your email address by clicking the link below:</p><p><a href=\"{{verificationLink}}\">Verify Email</a></p><p>If you did not create an account, you can safely ignore this email.</p>",
    active: true,
    lastUpdated: "2026-07-24T10:30:00Z",
    variables: ["{{siteName}}", "{{firstName}}", "{{verificationLink}}"],
  },
  {
    id: "reset-password-request",
    name: "Reset Password Request",
    type: "reset-password-request",
    subject: "Reset Your {{siteName}} Password",
    body: "<p>Hello {{firstName}},</p><p>We received a request to reset your password for {{siteName}}. Click the link below to reset it:</p><p><a href=\"{{resetLink}}\">Reset Password</a></p><p>This link expires in {{expiryMinutes}} minutes.</p><p>If you did not request a password reset, please ignore this email.</p>",
    active: true,
    lastUpdated: "2026-07-24T10:30:00Z",
    variables: ["{{siteName}}", "{{firstName}}", "{{resetLink}}", "{{expiryMinutes}}"],
  },
  {
    id: "payment-success-invoice",
    name: "Payment Success Invoice",
    type: "payment-success-invoice",
    subject: "Payment Received — Invoice #{{invoiceNumber}}",
    body: "<p>Hello {{firstName}},</p><p>Your payment of {{amount}} has been received. Invoice #{{invoiceNumber}} is attached.</p><p>Thank you for your continued support.</p>",
    active: true,
    lastUpdated: "2026-07-24T10:30:00Z",
    variables: ["{{siteName}}", "{{firstName}}", "{{amount}}", "{{invoiceNumber}}"],
  },
];

export default function TemplatesPage() {
  const { t } = useLocalizationContext();
  const [templates, setTemplates] = React.useState<Template[]>(DEFAULT_TEMPLATES);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<Partial<Template>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/admin/email/templates")
      .then(r => {
        if (!r.ok) throw new Error("Failed to load templates");
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load templates"))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (template: Template) => {
    setEditingId(template.id);
    setEditForm({ ...template });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = () => {
    if (!editingId) return;
    setSaving(true);
    const updated = templates.map(t => (t.id === editingId ? { ...t, ...editForm } : t));
    setTemplates(updated);
    fetch("/api/admin/email/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          toast.success(t("email.templateSaved"));
        } else {
          toast.error(data.error || t("email.saveFailed"));
        }
      })
      .catch(() => toast.error(t("email.saveFailed")))
      .finally(() => {
        setSaving(false);
        setEditingId(null);
        setEditForm({});
      });
  };

  const handleToggleActive = (id: string) => {
    const updated = templates.map(t => (t.id === id ? { ...t, active: !t.active } : t));
    setTemplates(updated);
    fetch("/api/admin/email/templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    }).catch(() => {
      setTemplates(templates);
      toast.error(t("email.toggleFailed"));
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.email") }, { label: t("email.templates") }]} />
        <DashboardCard>
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="size-8 animate-spin text-muted-foreground" />
          </div>
        </DashboardCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.email") }, { label: t("email.templates") }]} />
        <DashboardCard>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="size-12 text-destructive mb-4" />
            <p className="text-foreground font-medium">{t("email.loadError")}</p>
            <p className="text-muted-foreground text-sm mt-1">{error}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.email") }, { label: t("email.templates") }]} />
      <PageHeader
        title={t("email.templates")}
        description={t("email.templatesDescription")}
        actions={
          <Button onClick={handleSave} disabled={saving || editingId === null}>
            <Save className="mr-2 size-4" />
            {saving ? t("admin.saving") : t("admin.save")}
          </Button>
        }
      />

      <div className="space-y-3">
        {templates.map(template => (
          <DashboardCard key={template.id}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-semibold">{template.name}</h3>
                  <Badge tone={template.active ? "success" : "muted"}>
                    {template.active ? t("email.active") : t("email.inactive")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{template.type}</p>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{template.subject}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("email.lastUpdated")}: {new Date(template.lastUpdated).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(template.id)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    template.active ? "bg-primary" : "bg-input",
                  )}
                  role="switch"
                  aria-checked={template.active}
                  aria-label={`Toggle ${template.name}`}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                      template.active ? "translate-x-6" : "translate-x-1",
                    )}
                  />
                </button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                  <Edit3 className="mr-1.5 size-3.5" />
                  {t("email.edit")}
                </Button>
              </div>
            </div>

            {editingId === template.id && (
              <div className="border-t border-border mt-4 pt-4 space-y-3">
                <div>
                  <Label>{t("email.subject")}</Label>
                  <Input
                    value={editForm.subject ?? template.subject}
                    onChange={e => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t("email.htmlBody")}</Label>
                  <textarea
                    className="mt-1 w-full min-h-[120px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    value={editForm.body ?? template.body}
                    onChange={e => setEditForm(prev => ({ ...prev, body: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>{t("email.variables")}</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(editForm.variables ?? template.variables).map(v => (
                      <span key={v} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={handleSave} disabled={saving}>
                    <Save className="mr-1.5 size-3.5" />
                    {t("email.saveTemplate")}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    {t("admin.cancel")}
                  </Button>
                </div>
              </div>
            )}
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}