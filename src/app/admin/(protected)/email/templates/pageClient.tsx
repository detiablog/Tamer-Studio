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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail, Save, RefreshCw, Edit3, Eye, Plus, Copy, Trash2, Search,
  ChevronDown, ChevronUp, X, Send, AlertTriangle, FileCode,
  CheckCircle, Loader2, Monitor, Tablet, Smartphone, Sun, Moon,
} from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

type TemplateData = {
  id: string;
  key: string;
  name: string;
  type: string;
  subject: string;
  html: string;
  text: string;
  variables: string[];
  isActive: boolean;
  isSystem: boolean;
  description: string | null;
  language: string | null;
  category: string | null;
  version: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

type TemplateForm = {
  key: string;
  name: string;
  type: string;
  subject: string;
  html: string;
  text: string;
  variables: string[];
  isActive: boolean;
  category: string;
  language: string;
};

const TEMPLATE_TYPES = [
  "verification", "reset_password", "payment_success", "welcome",
  "credits_purchased", "subscription", "affiliate_approval", "affiliate_rejected",
  "invoice", "contact_form", "support_reply", "announcement", "subscription_expired",
];

const TEMPLATE_CATEGORIES = [
  "authentication", "billing", "marketing", "notification",
  "support", "affiliate", "system", "announcement",
];

const TEMPLATE_LANGUAGES = ["en", "id"];

const EMPTY_FORM: TemplateForm = {
  key: "",
  name: "",
  type: "verification",
  subject: "",
  html: "",
  text: "",
  variables: [],
  isActive: true,
  category: "system",
  language: "en",
};

const SAMPLE_VARIABLES: Record<string, string> = {
  name: "John Doe",
  email: "john@example.com",
  site_name: "Tamer Studio",
  support_email: "support@tamer.studio",
  current_year: String(new Date().getFullYear()),
  verification_url: "https://app.example.com/verify?token=abc",
  reset_url: "https://app.example.com/reset?token=abc",
  invoice_number: "INV-2026-001",
  transaction_number: "TXN-2026-001",
  payment_method: "Credit Card",
  payment_date: "July 30, 2026",
  purchased_item: "Pro Plan",
  total_payment: "$29.99",
  invoice_url: "https://app.example.com/invoices/1",
  dashboard_url: "https://app.example.com/dashboard",
  plan_name: "Pro Plan",
  credits_amount: "500",
  credits_balance: "1,200",
  subscription_status: "Active",
  renewal_date: "August 30, 2026",
  affiliate_name: "John Doe",
  affiliate_code: "AFF-001",
  commission_rate: "20%",
  cancel_url: "https://app.example.com/cancel",
  resubscribe_url: "https://app.example.com/resubscribe",
  expiry_date: "July 30, 2026",
  ticket_id: "TK-001",
  reply_message: "Thank you for contacting us.",
  reply_url: "https://app.example.com/tickets/1",
  announcement_title: "New Feature",
  announcement_body: "We have exciting news.",
  announcement_url: "https://app.example.com/announcements/1",
  contact_name: "John Doe",
  contact_email: "john@example.com",
  contact_subject: "Inquiry",
  contact_message: "Hello!",
  admin_dashboard_url: "https://app.example.com/admin",
  reason: "Content did not meet guidelines.",
  application_url: "https://app.example.com/affiliate/apply",
};

type SortField = "name" | "type" | "updatedAt";
type SortDir = "asc" | "desc";

type TemplatesPageProps = {
  adminToken: string | null;
};

export default function TemplatesPage({ adminToken }: TemplatesPageProps) {
  const { t } = useLocalizationContext();
  const [templates, setTemplates] = React.useState<TemplateData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filterType, setFilterType] = React.useState("");
  const [filterCategory, setFilterCategory] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [filterSystem, setFilterSystem] = React.useState("");
  const [sortField, setSortField] = React.useState<SortField>("updatedAt");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [expandedVars, setExpandedVars] = React.useState<Set<string>>(new Set());

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<TemplateForm>(EMPTY_FORM);
  const [saving, setSaving] = React.useState(false);
  const [varErrors, setVarErrors] = React.useState<string[]>([]);

  const [previewTemplate, setPreviewTemplate] = React.useState<TemplateData | null>(null);
  const [previewHtml, setPreviewHtml] = React.useState("");
  const [previewText, setPreviewText] = React.useState("");
  const [previewSubject, setPreviewSubject] = React.useState("");
  const [previewWidth, setPreviewWidth] = React.useState(600);
  const [previewDark, setPreviewDark] = React.useState(false);
  const [previewTab, setPreviewTab] = React.useState<"html" | "text">("html");
  const [previewLoading, setPreviewLoading] = React.useState(false);

  const [testModalOpen, setTestModalOpen] = React.useState(false);
  const [testEmail, setTestEmail] = React.useState("");
  const [testSending, setTestSending] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string; details?: string } | null>(null);

  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  const authHeaders: Record<string, string> = {};
  if (adminToken) authHeaders["Authorization"] = `Bearer ${adminToken}`;

  const fetchTemplates = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType) params.set("type", filterType);
      if (filterStatus) params.set("isActive", filterStatus);
      const qs = params.toString();
      const res = await fetch(`/api/admin/email/templates${qs ? `?${qs}` : ""}`, { headers: authHeaders });
      if (!res.ok) throw new Error("Failed to load templates");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTemplates(data.data);
      }
    } catch {
      toast.error(t("email.loadError", "Failed to load templates"));
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, authHeaders, t]);

  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filteredTemplates = React.useMemo(() => {
    let result = templates;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (tpl) =>
          tpl.name.toLowerCase().includes(q) ||
          tpl.key.toLowerCase().includes(q) ||
          tpl.subject.toLowerCase().includes(q) ||
          tpl.type.toLowerCase().includes(q)
      );
    }
    if (filterCategory) {
      result = result.filter((tpl) => tpl.category === filterCategory);
    }
    if (filterSystem) {
      const isSystem = filterSystem === "system";
      result = result.filter((tpl) => tpl.isSystem === isSystem);
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "type") cmp = a.type.localeCompare(b.type);
      else if (sortField === "updatedAt") cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [templates, search, filterCategory, filterSystem, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredTemplates.map((tpl) => tpl.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleVars = (id: string) => {
    setExpandedVars((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const validateVariables = (html: string, subject: string) => {
    const regex = /\{\{(\w+)\}\}/g;
    const found = new Set<string>();
    let match: RegExpExecArray | null;
    const htmlRegex = new RegExp(regex.source, "g");
    while ((match = htmlRegex.exec(html)) !== null) found.add(match[1]);
    htmlRegex.lastIndex = 0;
    while ((match = htmlRegex.exec(subject)) !== null) found.add(match[1]);
    return Array.from(found);
  };

  const openCreateEditor = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setVarErrors([]);
    setEditorOpen(true);
  };

  const openEditEditor = (tpl: TemplateData) => {
    setEditingId(tpl.id);
    setForm({
      key: tpl.key,
      name: tpl.name,
      type: tpl.type,
      subject: tpl.subject,
      html: tpl.html,
      text: tpl.text || "",
      variables: tpl.variables || [],
      isActive: tpl.isActive,
      category: tpl.category || "system",
      language: tpl.language || "en",
    });
    setVarErrors([]);
    setEditorOpen(true);
  };

  const handleFormChange = (field: keyof TemplateForm, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "html" || field === "subject") {
        const vars = validateVariables(
          field === "html" ? (value as string) : prev.html,
          field === "subject" ? (value as string) : prev.subject
        );
        setVarErrors(vars.filter((v) => !Object.prototype.hasOwnProperty.call(SAMPLE_VARIABLES, v)));
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.name || !form.key || !form.subject || !form.html) {
      toast.error(t("email.fillRequired", "Please fill all required fields"));
      return;
    }
    setSaving(true);
    try {
      const vars = validateVariables(form.html, form.subject);
      const body = {
        ...form,
        variables: vars,
      };
      let res: Response;
      if (editingId) {
        res = await fetch(`/api/admin/email/templates/${editingId}`, {
          method: "PUT",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/admin/email/templates", {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? t("email.templateUpdated", "Template updated") : t("email.templateCreated", "Template created"));
        setEditorOpen(false);
        fetchTemplates();
      } else {
        toast.error(data.error || t("email.saveFailed", "Failed to save"));
      }
    } catch {
      toast.error(t("email.saveFailed", "Failed to save"));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (tpl: TemplateData) => {
    try {
      const res = await fetch(`/api/admin/email/templates/${tpl.id}`, {
        method: "PUT",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !tpl.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setTemplates((prev) =>
          prev.map((t) => (t.id === tpl.id ? { ...t, isActive: !t.isActive } : t))
        );
        toast.success(t("email.statusUpdated", "Status updated"));
      }
    } catch {
      toast.error(t("email.toggleFailed", "Failed to toggle status"));
    }
  };

  const handleDuplicate = async (tpl: TemplateData) => {
    try {
      const res = await fetch(`/api/admin/email/templates`, {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          key: `${tpl.key}-copy-${Date.now()}`,
          name: `${tpl.name} (Copy)`,
          type: tpl.type,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
          variables: tpl.variables,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("email.templateDuplicated", "Template duplicated"));
        fetchTemplates();
      } else {
        toast.error(data.error || t("email.duplicateFailed", "Failed to duplicate"));
      }
    } catch {
      toast.error(t("email.duplicateFailed", "Failed to duplicate"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/email/templates/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("email.templateDeleted", "Template deleted"));
        setTemplates((prev) => prev.filter((tpl) => tpl.id !== id));
        setDeleteConfirmId(null);
      } else {
        toast.error(data.error || t("email.deleteFailed", "Failed to delete"));
      }
    } catch {
      toast.error(t("email.deleteFailed", "Failed to delete"));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    let successCount = 0;
    for (const id of selectedIds) {
      const tpl = templates.find((t) => t.id === id);
      if (tpl?.isSystem) continue;
      try {
        const res = await fetch(`/api/admin/email/templates/${id}`, {
          method: "DELETE",
          headers: authHeaders,
        });
        const data = await res.json();
        if (data.success) successCount++;
      } catch { /* skip */ }
    }
    if (successCount > 0) {
      toast.success(t("email.bulkDeleted", `${successCount} template(s) deleted`));
      setSelectedIds(new Set());
      fetchTemplates();
    }
  };

  const handleBulkExport = () => {
    const selected = filteredTemplates.filter((tpl) => selectedIds.has(tpl.id));
    const data = selected.length > 0 ? selected : filteredTemplates;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-templates-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t("email.templatesExported", "Templates exported"));
  };

  const handlePreview = async (tpl: TemplateData) => {
    setPreviewTemplate(tpl);
    setPreviewLoading(true);
    setPreviewTab("html");
    try {
      const res = await fetch(`/api/admin/email/smtp/preview?key=${tpl.key}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success && data.data) {
        setPreviewHtml(data.data.html);
        setPreviewText(data.data.text);
        setPreviewSubject(data.data.subject);
      } else {
        let html = tpl.html;
        let text = tpl.text;
        let subject = tpl.subject;
        for (const [k, v] of Object.entries(SAMPLE_VARIABLES)) {
          const regex = new RegExp(`\\{\\{${k}\\}\\}`, "g");
          html = html.replace(regex, v);
          text = text.replace(regex, v);
          subject = subject.replace(regex, v);
        }
        setPreviewHtml(html);
        setPreviewText(text);
        setPreviewSubject(subject);
      }
    } catch {
      let html = tpl.html;
      let text = tpl.text;
      let subject = tpl.subject;
      for (const [k, v] of Object.entries(SAMPLE_VARIABLES)) {
        const regex = new RegExp(`\\{\\{${k}\\}\\}`, "g");
        html = html.replace(regex, v);
        text = text.replace(regex, v);
        subject = subject.replace(regex, v);
      }
      setPreviewHtml(html);
      setPreviewText(text);
      setPreviewSubject(subject);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) return;
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/email/smtp/send-test", {
        method: "POST",
        headers: { ...authHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: testEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: t("email.testSent", "Test email sent successfully"),
          details: data.data?.messageId ? `Message ID: ${data.data.messageId}` : undefined,
        });
        toast.success(t("email.testSent", "Test email sent"));
      } else {
        setTestResult({
          success: false,
          message: data.error || t("email.testFailed", "Failed to send test email"),
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: t("email.testFailed", "Failed to send test email"),
      });
    } finally {
      setTestSending(false);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />;
  };

  const typeBadgeTone = (type: string): "default" | "success" | "warning" | "info" | "muted" | "purple" => {
    const map: Record<string, "default" | "success" | "warning" | "info" | "muted" | "purple"> = {
      verification: "info",
      reset_password: "warning",
      payment_success: "success",
      welcome: "success",
      credits_purchased: "success",
      subscription: "purple",
      affiliate_approval: "info",
      affiliate_rejected: "warning",
      invoice: "default",
      contact_form: "info",
      support_reply: "default",
      announcement: "purple",
      subscription_expired: "warning",
    };
    return map[type] || "default";
  };

  if (loading && templates.length === 0) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.email", "Email") }, { label: t("email.templates", "Templates") }]} />
        <DashboardCard>
          <div className="h-64 flex items-center justify-center">
            <RefreshCw className="size-8 animate-spin text-muted-foreground" />
          </div>
        </DashboardCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.email", "Email") }, { label: t("email.templates", "Templates") }]} />
      <PageHeader
        title={t("email.templates", "Templates")}
        description={t("email.templatesDescription", "Manage email templates for all notification types")}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchTemplates()} disabled={loading}>
              <RefreshCw className={cn("mr-1.5 size-3.5", loading && "animate-spin")} />
              {t("email.refresh", "Refresh")}
            </Button>
            <Button onClick={openCreateEditor}>
              <Plus className="mr-1.5 size-3.5" />
              {t("email.createTemplate", "Create Template")}
            </Button>
          </div>
        }
      />

      <DashboardCard>
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={t("email.searchTemplates", "Search templates...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="sm:w-40">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-transparent px-2.5 text-sm"
              >
                <option value="">{t("email.allTypes", "All Types")}</option>
                {TEMPLATE_TYPES.map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div className="sm:w-40">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-transparent px-2.5 text-sm"
              >
                <option value="">{t("email.allCategories", "All Categories")}</option>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="sm:w-36">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-transparent px-2.5 text-sm"
              >
                <option value="">{t("email.allStatus", "All Status")}</option>
                <option value="true">{t("email.active", "Active")}</option>
                <option value="false">{t("email.inactive", "Inactive")}</option>
              </select>
            </div>
            <div className="sm:w-36">
              <select
                value={filterSystem}
                onChange={(e) => setFilterSystem(e.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-transparent px-2.5 text-sm"
              >
                <option value="">{t("email.allTemplates", "All")}</option>
                <option value="system">{t("email.system", "System")}</option>
                <option value="custom">{t("email.custom", "Custom")}</option>
              </select>
            </div>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-muted/30 border border-border">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} {t("email.selected", "selected")}
            </span>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-1 size-3" />
              {t("email.deleteSelected", "Delete Selected")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleBulkExport}>
              <FileCode className="mr-1 size-3" />
              {t("email.exportSelected", "Export")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              <X className="mr-1 size-3" />
              {t("email.clearSelection", "Clear")}
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">
            {filteredTemplates.length} {t("email.templatesCount", "template(s)")}
          </span>
          <Button variant="outline" size="sm" onClick={handleBulkExport}>
            <FileCode className="mr-1 size-3" />
            {t("email.exportAll", "Export All")}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={selectedIds.size === filteredTemplates.length && filteredTemplates.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1">{t("email.name", "Name")}<SortIcon field="name" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("type")}>
                  <div className="flex items-center gap-1">{t("email.type", "Type")}<SortIcon field="type" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.category", "Category")}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.status", "Status")}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.version", "Version")}</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort("updatedAt")}>
                  <div className="flex items-center gap-1">{t("email.updated", "Updated")}<SortIcon field="updatedAt" /></div>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">{t("email.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <Mail className="size-8 mx-auto mb-2 opacity-50" />
                    {t("email.noTemplates", "No templates found")}
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((tpl) => (
                  <React.Fragment key={tpl.id}>
                    <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds.has(tpl.id)}
                          onCheckedChange={(checked) => handleSelectOne(tpl.id, !!checked)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{tpl.name}</span>
                          <span className="text-xs text-muted-foreground font-mono">{tpl.key}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={typeBadgeTone(tpl.type)}>{tpl.type.replace(/_/g, " ")}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="muted">{tpl.category || "system"}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(tpl)}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            tpl.isActive ? "bg-primary" : "bg-input"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                              tpl.isActive ? "translate-x-6" : "translate-x-1"
                            )}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">v{tpl.version}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                        {tpl.updatedAt ? new Date(tpl.updatedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon-xs" onClick={() => handlePreview(tpl)} title={t("email.preview", "Preview")}>
                            <Eye className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-xs" onClick={() => openEditEditor(tpl)} title={t("email.edit", "Edit")}>
                            <Edit3 className="size-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon-xs" onClick={() => handleDuplicate(tpl)} title={t("email.duplicate", "Duplicate")}>
                            <Copy className="size-3.5" />
                          </Button>
                          {!tpl.isSystem && (
                            <Button variant="ghost" size="icon-xs" onClick={() => setDeleteConfirmId(tpl.id)} title={t("email.delete", "Delete")}>
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {tpl.variables && tpl.variables.length > 0 && (
                      <tr className="border-b border-border/50">
                        <td colSpan={8} className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => toggleVars(tpl.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {expandedVars.has(tpl.id) ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                            {tpl.variables.length} {t("email.variables", "variable(s)")}
                          </button>
                          {expandedVars.has(tpl.id) && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tpl.variables.map((v) => (
                                <span key={v} className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">
                                  {`{{${v}}}`}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-sm w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="size-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-heading font-semibold">{t("email.confirmDelete", "Delete Template")}</h3>
                <p className="text-sm text-muted-foreground">{t("email.confirmDeleteDesc", "This action cannot be undone")}</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
                {t("admin.cancel", "Cancel")}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(deleteConfirmId)}>
                <Trash2 className="mr-1 size-3" />
                {t("email.delete", "Delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto pt-10 pb-10" onClick={() => setEditorOpen(false)}>
          <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-heading font-semibold text-lg">
                {editingId ? t("email.editTemplate", "Edit Template") : t("email.createTemplate", "Create Template")}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setEditorOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t("email.templateName", "Name")} *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="mt-1"
                    placeholder="Email Verification"
                  />
                </div>
                <div>
                  <Label>{t("email.templateKey", "Key")} *</Label>
                  <Input
                    value={form.key}
                    onChange={(e) => handleFormChange("key", e.target.value)}
                    className="mt-1 font-mono"
                    placeholder="verification"
                    disabled={!!editingId}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label>{t("email.type", "Type")}</Label>
                  <select
                    value={form.type}
                    onChange={(e) => handleFormChange("type", e.target.value)}
                    className="mt-1 w-full h-8 rounded-lg border border-border bg-transparent px-2.5 text-sm"
                  >
                    {TEMPLATE_TYPES.map((type) => (
                      <option key={type} value={type}>{type.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>{t("email.category", "Category")}</Label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormChange("category", e.target.value)}
                    className="mt-1 w-full h-8 rounded-lg border border-border bg-transparent px-2.5 text-sm"
                  >
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>{t("email.language", "Language")}</Label>
                  <select
                    value={form.language}
                    onChange={(e) => handleFormChange("language", e.target.value)}
                    className="mt-1 w-full h-8 rounded-lg border border-border bg-transparent px-2.5 text-sm"
                  >
                    {TEMPLATE_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label>{t("email.subject", "Subject")} *</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => handleFormChange("subject", e.target.value)}
                  className="mt-1"
                  placeholder="Verify your {{site_name}} account"
                />
              </div>
              {varErrors.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{t("email.unknownVariables", "Unknown variables found:")}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {varErrors.map((v) => (
                        <code key={v} className="text-xs bg-destructive/10 px-1 rounded">{`{{${v}}}`}</code>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <Label>{t("email.htmlBody", "HTML Body")} *</Label>
                <textarea
                  value={form.html}
                  onChange={(e) => handleFormChange("html", e.target.value)}
                  className="mt-1 w-full min-h-[300px] rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  placeholder="<!DOCTYPE html>..."
                />
              </div>
              <div>
                <Label>{t("email.textBody", "Plain Text Body")}</Label>
                <textarea
                  value={form.text}
                  onChange={(e) => handleFormChange("text", e.target.value)}
                  className="mt-1 w-full min-h-[150px] rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  placeholder="Plain text version of the email..."
                />
              </div>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-border">
              <div className="flex items-center gap-2">
                {editingId && (
                  <span className="text-xs text-muted-foreground">
                    v{templates.find((tpl) => tpl.id === editingId)?.version ?? 1}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditorOpen(false)}>
                  {t("admin.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Save className="mr-1.5 size-3.5" />}
                  {t("email.saveTemplate", "Save")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-heading font-semibold">{t("email.templatePreview", "Template Preview")}</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button type="button" onClick={() => setPreviewWidth(600)} className={cn("px-2 py-1 text-xs", previewWidth === 600 ? "bg-muted" : "")} title="Desktop">
                    <Monitor className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => setPreviewWidth(480)} className={cn("px-2 py-1 text-xs", previewWidth === 480 ? "bg-muted" : "")} title="Tablet">
                    <Tablet className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => setPreviewWidth(320)} className={cn("px-2 py-1 text-xs", previewWidth === 320 ? "bg-muted" : "")} title="Mobile">
                    <Smartphone className="size-3.5" />
                  </button>
                </div>
                <Button variant="ghost" size="icon-xs" onClick={() => setPreviewDark(!previewDark)}>
                  {previewDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setPreviewTemplate(null)}>
                  <X className="size-4" />
                </Button>
              </div>
            </div>
            <div className="px-6 pt-4">
              <div className="flex gap-2 border-b border-border">
                <button
                  type="button"
                  onClick={() => setPreviewTab("html")}
                  className={cn("px-3 py-2 text-sm border-b-2 -mb-px", previewTab === "html" ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}
                >
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("text")}
                  className={cn("px-3 py-2 text-sm border-b-2 -mb-px", previewTab === "text" ? "border-primary text-foreground" : "border-transparent text-muted-foreground")}
                >
                  {t("email.text", "Text")}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-3">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("email.subject", "Subject")}</Label>
                <p className="text-sm mt-1">{previewSubject}</p>
              </div>
              {previewLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : previewTab === "html" ? (
                <div className="flex justify-center">
                  <div
                    className={cn("border border-border rounded-lg overflow-hidden transition-all", previewDark && "bg-white")}
                    style={{ width: previewWidth, maxWidth: "100%" }}
                  >
                    <iframe
                      srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;padding:0;}</style></head><body>${previewHtml}</body></html>`}
                      className="w-full border-0"
                      style={{ height: 500 }}
                      title="HTML Preview"
                    />
                  </div>
                </div>
              ) : (
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/30 rounded-lg p-4 max-h-[500px] overflow-auto">
                  {previewText}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}

      {testModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setTestModalOpen(false); setTestResult(null); }}>
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold">{t("email.sendTest", "Send Test Email")}</h3>
              <Button variant="ghost" size="icon-xs" onClick={() => { setTestModalOpen(false); setTestResult(null); }}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label>{t("email.recipientEmail", "Recipient Email")}</Label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="mt-1"
                  placeholder="test@example.com"
                />
              </div>
              {testResult && (
                <div className={cn(
                  "p-3 rounded-lg text-sm",
                  testResult.success ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-destructive/10 text-destructive"
                )}>
                  <div className="flex items-center gap-2">
                    {testResult.success ? <CheckCircle className="size-4 shrink-0" /> : <AlertTriangle className="size-4 shrink-0" />}
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.details && (
                    <p className="mt-1 text-xs opacity-70 font-mono">{testResult.details}</p>
                  )}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => { setTestModalOpen(false); setTestResult(null); }}>
                  {t("admin.cancel", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleSendTest} disabled={testSending || !testEmail}>
                  {testSending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : <Send className="mr-1.5 size-3.5" />}
                  {t("email.sendTest", "Send Test")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
