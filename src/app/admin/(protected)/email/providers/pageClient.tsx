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
import { Server, Send, RefreshCw, Save, TestTube } from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type ProviderConfig = {
  id: string;
  name: string;
  description: string;
  type: string;
  enabled: boolean;
  status: "healthy" | "warning" | "offline" | "disabled";
  config: Record<string, string>;
  configFields: { key: string; label: string; placeholder: string; secret: boolean }[];
};

type ProviderFormData = Record<string, string>;

const DEFAULT_PROVIDERS: ProviderConfig[] = [
  {
    id: "smtp",
    name: "SMTP",
    description: "Standard SMTP relay for transactional email delivery.",
    type: "smtp",
    enabled: false,
    status: "disabled",
    config: { host: "", port: "587", username: "", password: "", fromAddress: "" },
    configFields: [
      { key: "host", label: "Host", placeholder: "smtp.example.com", secret: false },
      { key: "port", label: "Port", placeholder: "587", secret: false },
      { key: "username", label: "Username", placeholder: "user@example.com", secret: false },
      { key: "password", label: "Password", placeholder: "••••••••", secret: true },
      { key: "fromAddress", label: "From Address", placeholder: "noreply@example.com", secret: false },
    ],
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Cloud-based email delivery platform with detailed analytics.",
    type: "sendgrid",
    enabled: false,
    status: "disabled",
    config: { apiKey: "", fromAddress: "", senderName: "" },
    configFields: [
      { key: "apiKey", label: "API Key", placeholder: "SG.••••••••", secret: true },
      { key: "fromAddress", label: "From Address", placeholder: "noreply@example.com", secret: false },
      { key: "senderName", label: "Sender Name", placeholder: "Tamer Studio", secret: false },
    ],
  },
  {
    id: "resend",
    name: "Resend",
    description: "Modern email API for developers with real-time event tracking.",
    type: "resend",
    enabled: false,
    status: "disabled",
    config: { apiKey: "", fromAddress: "" },
    configFields: [
      { key: "apiKey", label: "API Key", placeholder: "re_••••••••", secret: true },
      { key: "fromAddress", label: "From Address", placeholder: "noreply@example.com", secret: false },
    ],
  },
  {
    id: "amazonses",
    name: "Amazon SES",
    description: "Amazon Simple Email Service for scalable email delivery.",
    type: "amazonses",
    enabled: false,
    status: "disabled",
    config: { accessKey: "", secretKey: "", region: "us-east-1", fromAddress: "" },
    configFields: [
      { key: "accessKey", label: "Access Key", placeholder: "AKIA••••••••", secret: true },
      { key: "secretKey", label: "Secret Key", placeholder: "••••••••••••", secret: true },
      { key: "region", label: "Region", placeholder: "us-east-1", secret: false },
      { key: "fromAddress", label: "From Address", placeholder: "noreply@example.com", secret: false },
    ],
  },
  {
    id: "mailgun",
    name: "Mailgun",
    description: "Email delivery and analytics platform for web applications.",
    type: "mailgun",
    enabled: false,
    status: "disabled",
    config: { apiKey: "", domain: "", fromAddress: "" },
    configFields: [
      { key: "apiKey", label: "API Key", placeholder: "key-••••••••", secret: true },
      { key: "domain", label: "Domain", placeholder: "mg.example.com", secret: false },
      { key: "fromAddress", label: "From Address", placeholder: "mailer@mg.example.com", secret: false },
    ],
  },
  {
    id: "postmark",
    name: "Postmark",
    description: "Reliable transactional email delivery with delivery analytics.",
    type: "postmark",
    enabled: false,
    status: "disabled",
    config: { serverToken: "", fromAddress: "" },
    configFields: [
      { key: "serverToken", label: "Server Token", placeholder: "••••••••", secret: true },
      { key: "fromAddress", label: "From Address", placeholder: "noreply@example.com", secret: false },
    ],
  },
  {
    id: "brevo",
    name: "Brevo (formerly Sendinblue)",
    description: "All-in-one marketing and transactional email platform.",
    type: "brevo",
    enabled: false,
    status: "disabled",
    config: { apiKey: "", fromAddress: "", senderName: "" },
    configFields: [
      { key: "apiKey", label: "API Key", placeholder: "xkeysib-••••••••", secret: true },
      { key: "fromAddress", label: "From Address", placeholder: "noreply@example.com", secret: false },
      { key: "senderName", label: "Sender Name", placeholder: "Tamer Studio", secret: false },
    ],
  },
  {
    id: "sparkpost",
    name: "SparkPost",
    description: "High-performance email delivery platform with analytics.",
    type: "sparkpost",
    enabled: false,
    status: "disabled",
    config: { apiKey: "", fromAddress: "" },
    configFields: [
      { key: "apiKey", label: "API Key", placeholder: "••••••••••••", secret: true },
      { key: "fromAddress", label: "From Address", placeholder: "noreply@example.com", secret: false },
    ],
  },
];

const STATUS_TONE_MAP: Record<string, "success" | "warning" | "muted" | "default"> = {
  healthy: "success",
  warning: "warning",
  offline: "default",
  disabled: "muted",
};

function SortableProviderCard({
  provider,
  formData,
  setFormData,
  onToggle,
  onConfigChange,
  onTest,
  onSave,
  savingId,
  testingId,
  t,
  adminToken,
}: {
  provider: ProviderConfig;
  formData: ProviderFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProviderFormData>>;
  onToggle: (id: string) => void;
  onConfigChange: (id: string, key: string, value: string) => void;
  onTest: (id: string) => void;
  onSave: (id: string) => void;
  savingId: string | null;
  testingId: string | null;
  t: ReturnType<typeof useLocalizationContext>["t"];
  adminToken: string | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: provider.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const authHeaders: Record<string, string> = {};
  if (adminToken) authHeaders["Authorization"] = `Bearer ${adminToken}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "rounded-xl border border-border bg-card transition-shadow",
        isDragging && "shadow-lg ring-2 ring-ring/50",
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Drag to reorder ${provider.name}`}
        >
          <Server className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-base">{provider.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>
        </div>
        <Badge tone={STATUS_TONE_MAP[provider.status]}>{provider.status}</Badge>
        <button
          type="button"
          onClick={() => onToggle(provider.id)}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
            provider.enabled ? "bg-primary" : "bg-input",
          )}
          role="switch"
          aria-checked={provider.enabled}
          aria-label={`Toggle ${provider.name}`}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
              provider.enabled ? "translate-x-6" : "translate-x-1",
            )}
          />
        </button>
      </div>

      {provider.enabled && (
        <div className="border-t border-border px-4 py-4 space-y-3">
          {provider.configFields.map(field => (
            <div key={field.key}>
              <Label>{field.label}</Label>
              <Input
                type={field.secret ? "password" : "text"}
                placeholder={field.placeholder}
                value={formData[`${provider.id}.${field.key}`] ?? provider.config[field.key]}
                onChange={e => onConfigChange(provider.id, field.key, e.target.value)}
                className="mt-1"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTest(provider.id)}
              disabled={testingId === provider.id}
            >
              <TestTube className="mr-1.5 size-3.5" />
              {testingId === provider.id ? t("email.testing") : t("email.testConnection")}
            </Button>
            <Button
              size="sm"
              onClick={() => onSave(provider.id)}
              disabled={savingId === provider.id}
            >
              <Save className="mr-1.5 size-3.5" />
              {savingId === provider.id ? t("admin.saving") : t("admin.save")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

type ProvidersPageProps = {
  adminToken: string | null;
};

export function ProvidersPage({ adminToken }: ProvidersPageProps) {
  const { t } = useLocalizationContext();
  const [providers, setProviders] = React.useState<ProviderConfig[]>(DEFAULT_PROVIDERS);
  const [formData, setFormData] = React.useState<ProviderFormData>({});
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [testingId, setTestingId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const authHeaders: Record<string, string> = {};
  if (adminToken) authHeaders["Authorization"] = `Bearer ${adminToken}`;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  React.useEffect(() => {
    fetch("/api/admin/email/providers", {
      headers: authHeaders,
    })
      .then(r => {
        if (!r.ok) throw new Error("Failed to load providers");
        return r.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setProviders(prev => prev.map(p => {
            const found = data.find((d: ProviderConfig) => d.id === p.id);
            return found ? { ...p, ...found } : p;
          }));
        }
      })
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load providers"))
      .finally(() => setLoading(false));
  }, [authHeaders]);

  const handleToggle = (id: string) => {
    setProviders(prev =>
      prev.map(p => {
        if (p.id === id) {
          const newEnabled = !p.enabled;
          const newStatus = newEnabled ? "healthy" : "disabled";
          return { ...p, enabled: newEnabled, status: newStatus as ProviderConfig["status"] };
        }
        return p;
      }),
    );
  };

  const handleConfigChange = (id: string, key: string, value: string) => {
    setFormData(prev => ({ ...prev, [`${id}.${key}`]: value }));
  };

  const handleTest = (id: string) => {
    setTestingId(id);
    toast.info(t("email.testingConnection"));
    fetch("/api/admin/email/providers", {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ id, action: "test" }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          toast.success(t("email.testSuccess"));
        } else {
          toast.error(data.error || t("email.testFailed"));
        }
      })
      .catch(() => toast.error(t("email.testFailed")))
      .finally(() => setTestingId(null));
  };

  const handleSave = (id: string) => {
    setSavingId(id);
    const provider = providers.find(p => p.id === id);
    if (!provider) { setSavingId(null); return; }

    const config: Record<string, string> = {};
    provider.configFields.forEach(field => {
      config[field.key] = formData[`${id}.${field.key}`] ?? provider.config[field.key];
    });

    fetch("/api/admin/email/providers", {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ id, config, enabled: provider.enabled }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          toast.success(`${provider.name} ${t("email.saved")}`);
        } else {
          toast.error(data.error || t("email.saveFailed"));
        }
      })
      .catch(() => toast.error(t("email.saveFailed")))
      .finally(() => setSavingId(null));
  };

  const handleSaveAll = () => {
    setSavingId("all");
    fetch("/api/admin/email/providers", {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({ providers }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          toast.success(t("email.allSaved"));
        } else {
          toast.error(data.error || t("email.saveFailed"));
        }
      })
      .catch(() => toast.error(t("email.saveFailed")))
      .finally(() => setSavingId(null));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setProviders(prev => {
        const oldIndex = prev.findIndex(p => p.id === active.id);
        const newIndex = prev.findIndex(p => p.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: t("admin.email") }, { label: t("email.providers") }]} />
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
        <Breadcrumbs items={[{ label: t("admin.email") }, { label: t("email.providers") }]} />
        <DashboardCard>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Server className="size-12 text-destructive mb-4" />
            <p className="text-foreground font-medium">{t("email.loadError")}</p>
            <p className="text-muted-foreground text-sm mt-1">{error}</p>
          </div>
        </DashboardCard>
      </div>
    );
  }

  const statusOrder: Record<string, number> = { healthy: 0, warning: 1, offline: 2, disabled: 3 };
  const sortedProviders = [...providers].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: t("admin.email") }, { label: t("email.providers") }]} />
      <PageHeader
        title={t("email.providers")}
        description={t("email.providersDescription")}
        actions={
          <Button onClick={handleSaveAll} disabled={savingId === "all"}>
            <Save className="mr-2 size-4" />
            {savingId === "all" ? t("admin.saving") : t("admin.saveAll")}
          </Button>
        }
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={providers.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {sortedProviders.map(provider => (
              <SortableProviderCard
                key={provider.id}
                provider={provider}
                formData={formData}
                setFormData={setFormData}
                onToggle={handleToggle}
                onConfigChange={handleConfigChange}
                onTest={handleTest}
                onSave={handleSave}
                savingId={savingId}
                testingId={testingId}
                t={t}
                adminToken={adminToken}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
