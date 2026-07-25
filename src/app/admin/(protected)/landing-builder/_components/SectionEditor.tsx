"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, Plus } from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

export type SectionFormData = {
  key: string;
  type: string;
  title: string;
  subtitle: string;
  content: Record<string, unknown>;
  isVisible: boolean;
  order: number;
};

type SectionEditorProps = {
  open: boolean;
  section: SectionFormData | null;
  saving: boolean;
  onClose: () => void;
  onSave: (data: SectionFormData) => void;
};

const CONTENT_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "features", label: "Features" },
  { value: "pricing", label: "Pricing" },
  { value: "credit-packs", label: "Credit Packs" },
  { value: "credit-usage", label: "Credit Usage" },
  { value: "faq", label: "FAQ" },
  { value: "cta", label: "Call to Action" },
  { value: "footer", label: "Footer" },
  { value: "custom", label: "Custom" },
] as const;

function PricingForm({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const plans = (content.plans as Array<Record<string, unknown>>) || [];

  const updatePlan = (index: number, field: string, value: unknown) => {
    const newPlans = [...plans];
    newPlans[index] = { ...(newPlans[index] || {}), [field]: value };
    onChange({ ...content, plans: newPlans });
  };

  const addPlan = () => {
    onChange({
      ...content,
      plans: [
        ...plans,
        {
          key: "",
          priceMonthly: "",
          priceYearly: "",
          includedCreditsMonthly: "",
          includedCreditsYearly: "",
          description: "",
          features: [],
          cta: "",
          href: "",
          popular: false,
          topUp: false,
        },
      ],
    });
  };

  const removePlan = (index: number) => {
    onChange({ ...content, plans: plans.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Pricing Plans</Label>
      {plans.map((plan: Record<string, unknown>, index: number) => (
        <div key={index} className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Plan {index + 1}</span>
            <button
              type="button"
              onClick={() => removePlan(index)}
              className="text-xs text-destructive hover:underline"
            >
              Remove
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={(plan.key as string) || ""}
              onChange={(e) => updatePlan(index, "key", e.target.value)}
              placeholder="Plan key"
            />
            <Input
              value={(plan.priceMonthly as string) || ""}
              onChange={(e) => updatePlan(index, "priceMonthly", e.target.value)}
              placeholder="Monthly price"
            />
            <Input
              value={(plan.priceYearly as string) || ""}
              onChange={(e) => updatePlan(index, "priceYearly", e.target.value)}
              placeholder="Yearly price"
            />
            <Input
              value={(plan.includedCreditsMonthly as string) || ""}
              onChange={(e) => updatePlan(index, "includedCreditsMonthly", e.target.value)}
              placeholder="Monthly credits"
            />
            <Input
              value={(plan.includedCreditsYearly as string) || ""}
              onChange={(e) => updatePlan(index, "includedCreditsYearly", e.target.value)}
              placeholder="Yearly credits"
            />
            <Input
              value={(plan.description as string) || ""}
              onChange={(e) => updatePlan(index, "description", e.target.value)}
              placeholder="Description"
            />
            <Input
              value={(plan.cta as string) || ""}
              onChange={(e) => updatePlan(index, "cta", e.target.value)}
              placeholder="CTA text"
            />
            <Input
              value={(plan.href as string) || ""}
              onChange={(e) => updatePlan(index, "href", e.target.value)}
              placeholder="CTA link"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={!!plan.popular}
                onChange={(e) => updatePlan(index, "popular", e.target.checked)}
              />
              Popular
            </label>
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                checked={!!plan.topUp}
                onChange={(e) => updatePlan(index, "topUp", e.target.checked)}
              />
              Top-up
            </label>
          </div>
          <div>
            <Label className="text-xs">Features (one per line)</Label>
            <textarea
              value={(Array.isArray(plan.features) ? plan.features : []).join("\n")}
              onChange={(e) => updatePlan(index, "features", e.target.value.split("\n").filter(Boolean))}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      ))}
      <Button type="button" onClick={addPlan} variant="outline" size="sm">
        <Plus className="mr-2 size-4" />
        Add Plan
      </Button>
    </div>
  );
}

function CreditPacksForm({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const packs = (content.packs as Array<Record<string, unknown>>) || [];

  const updatePack = (index: number, field: string, value: unknown) => {
    const newPacks = [...packs];
    newPacks[index] = { ...(newPacks[index] || {}), [field]: value };
    onChange({ ...content, packs: newPacks });
  };

  const addPack = () => {
    onChange({
      ...content,
      packs: [...packs, { key: "", credits: "", price: "", description: "", href: "" }],
    });
  };

  const removePack = (index: number) => {
    onChange({ ...content, packs: packs.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Credit Packs</Label>
      {packs.map((pack: Record<string, unknown>, index: number) => (
        <div key={index} className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pack {index + 1}</span>
            <button
              type="button"
              onClick={() => removePack(index)}
              className="text-xs text-destructive hover:underline"
            >
              Remove
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={(pack.key as string) || ""}
              onChange={(e) => updatePack(index, "key", e.target.value)}
              placeholder="Pack key"
            />
            <Input
              value={(pack.credits as string) || ""}
              onChange={(e) => updatePack(index, "credits", e.target.value)}
              placeholder="Credits amount"
            />
            <Input
              value={(pack.price as string) || ""}
              onChange={(e) => updatePack(index, "price", e.target.value)}
              placeholder="Price"
            />
            <Input
              value={(pack.description as string) || ""}
              onChange={(e) => updatePack(index, "description", e.target.value)}
              placeholder="Description"
            />
            <Input
              value={(pack.href as string) || ""}
              onChange={(e) => updatePack(index, "href", e.target.value)}
              placeholder="Link"
              className="sm:col-span-2"
            />
          </div>
        </div>
      ))}
      <Button type="button" onClick={addPack} variant="outline" size="sm">
        <Plus className="mr-2 size-4" />
        Add Pack
      </Button>
    </div>
  );
}

function CreditUsageForm({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const rows = (content.rows as Array<Record<string, unknown>>) || [];

  const updateRow = (index: number, field: string, value: unknown) => {
    const newRows = [...rows];
    newRows[index] = { ...(newRows[index] || {}), [field]: value };
    onChange({ ...content, rows: newRows });
  };

  const addRow = () => {
    onChange({
      ...content,
      rows: [...rows, { action: "", model: "", credits: "", notes: "" }],
    });
  };

  const removeRow = (index: number) => {
    onChange({ ...content, rows: rows.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Credit Usage Rows</Label>
      {rows.map((row: Record<string, unknown>, index: number) => (
        <div key={index} className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Row {index + 1}</span>
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="text-xs text-destructive hover:underline"
            >
              Remove
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={(row.action as string) || ""}
              onChange={(e) => updateRow(index, "action", e.target.value)}
              placeholder="Action"
            />
            <Input
              value={(row.model as string) || ""}
              onChange={(e) => updateRow(index, "model", e.target.value)}
              placeholder="Model"
            />
            <Input
              value={(row.credits as string) || ""}
              onChange={(e) => updateRow(index, "credits", e.target.value)}
              placeholder="Credits"
            />
            <Input
              value={(row.notes as string) || ""}
              onChange={(e) => updateRow(index, "notes", e.target.value)}
              placeholder="Notes"
              className="sm:col-span-2"
            />
          </div>
        </div>
      ))}
      <Button type="button" onClick={addRow} variant="outline" size="sm">
        <Plus className="mr-2 size-4" />
        Add Row
      </Button>
    </div>
  );
}

function FAQForm({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const items = (content.items as Array<Record<string, unknown>>) || [];

  const updateItem = (index: number, field: string, value: unknown) => {
    const newItems = [...items];
    newItems[index] = { ...(newItems[index] || {}), [field]: value };
    onChange({ ...content, items: newItems });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [...items, { questionKey: "", answerKey: "" }],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">FAQ Items</Label>
      {items.map((item: Record<string, unknown>, index: number) => (
        <div key={index} className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Item {index + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="text-xs text-destructive hover:underline"
            >
              Remove
            </button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={(item.questionKey as string) || ""}
              onChange={(e) => updateItem(index, "questionKey", e.target.value)}
              placeholder="Question key"
            />
            <Input
              value={(item.answerKey as string) || ""}
              onChange={(e) => updateItem(index, "answerKey", e.target.value)}
              placeholder="Answer key"
            />
          </div>
        </div>
      ))}
      <Button type="button" onClick={addItem} variant="outline" size="sm">
        <Plus className="mr-2 size-4" />
        Add FAQ Item
      </Button>
    </div>
  );
}

export function SectionEditor({ open, section, saving, onClose, onSave }: SectionEditorProps) {
  const isNew = !section?.key;
  const { t } = useLocalizationContext();

  const [form, setForm] = React.useState<SectionFormData>({
    key: "",
    type: "hero",
    title: "",
    subtitle: "",
    content: {},
    isVisible: true,
    order: 0,
  });

  React.useEffect(() => {
    if (section) {
      setForm({
        key: section.key ?? "",
        type: section.type ?? "hero",
        title: section.title ?? "",
        subtitle: section.subtitle ?? "",
        content: (section.content as Record<string, unknown>) ?? {},
        isVisible: section.isVisible ?? true,
        order: section.order ?? 0,
      });
    } else {
      setForm({
        key: "",
        type: "hero",
        title: "",
        subtitle: "",
        content: {},
        isVisible: true,
        order: 0,
      });
    }
  }, [section]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.key.trim() || !form.title.trim()) {
      toast.error("Key and title are required");
      return;
    }
    onSave(form);
  };

  const contentJson = JSON.stringify(form.content, null, 2);

  const handleTypeChange = (newType: string) => {
    setForm((f) => {
      const content = { ...f.content };
      switch (newType) {
        case "pricing":
          if (!Array.isArray(content.plans)) {
            content.plans = [
              {
                key: "",
                priceMonthly: "",
                priceYearly: "",
                includedCreditsMonthly: "",
                includedCreditsYearly: "",
                description: "",
                features: [],
                cta: "",
                href: "",
                popular: false,
                topUp: false,
              },
            ];
          }
          break;
        case "credit-packs":
          if (!Array.isArray(content.packs)) {
            content.packs = [{ key: "", credits: "", price: "", description: "", href: "" }];
          }
          break;
        case "credit-usage":
          if (!Array.isArray(content.rows)) {
            content.rows = [{ action: "", model: "", credits: "", notes: "" }];
          }
          break;
        case "faq":
          if (!Array.isArray(content.items)) {
            content.items = [{ questionKey: "", answerKey: "" }];
          }
          break;
      }
      return { ...f, type: newType, content };
    });
  };

  const renderTypeSpecificForm = () => {
    switch (form.type) {
      case "pricing":
        return <PricingForm content={form.content} onChange={(content) => setForm({ ...form, content })} />;
      case "credit-packs":
        return <CreditPacksForm content={form.content} onChange={(content) => setForm({ ...form, content })} />;
      case "credit-usage":
        return <CreditUsageForm content={form.content} onChange={(content) => setForm({ ...form, content })} />;
      case "faq":
        return <FAQForm content={form.content} onChange={(content) => setForm({ ...form, content })} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {isNew ? "New Section" : `Edit: ${section?.title ?? section?.key}`}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close editor"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="section-key">Key *</Label>
              <Input
                id="section-key"
                value={form.key}
                onChange={(e) => setForm({ ...form, key: e.target.value })}
                placeholder="e.g. hero, features, footer"
                disabled={!isNew}
                required
              />
            </div>
            <div>
              <Label htmlFor="section-type">Content Type</Label>
              <select
                id="section-type"
                value={form.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {CONTENT_TYPES.map((ct) => (
                  <option key={ct.value} value={ct.value}>
                    {ct.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="section-title">Title *</Label>
            <Input
              id="section-title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Section title"
              required
            />
          </div>

          <div>
            <Label htmlFor="section-subtitle">Subtitle</Label>
            <textarea
              id="section-subtitle"
              value={form.subtitle}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="Optional subtitle"
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          {renderTypeSpecificForm()}

          <div>
            <Label htmlFor="section-content">Content (JSON)</Label>
            <textarea
              id="section-content"
              value={contentJson}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setForm({ ...form, content: parsed });
                } catch {
                  setForm({ ...form, content: form.content });
                }
              }}
              placeholder='{"heading": "Welcome", "description": "..."}'
              rows={8}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="section-visible"
                type="checkbox"
                checked={form.isVisible}
                onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                className="size-4 rounded border border-border accent-primary"
              />
              <Label htmlFor="section-visible" className="cursor-pointer">
                {form.isVisible ? "Visible" : "Hidden"}
              </Label>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 size-4" />
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
