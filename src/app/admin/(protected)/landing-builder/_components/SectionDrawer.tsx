"use client";

import * as React from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetCloseButton } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Unlock, Copy, Trash2 } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { TranslationKeyPicker } from "@/components/admin/TranslationKeyPicker";

import type { LandingSection } from "./SectionList";

const CONTENT_TYPES = [
  { key: "hero", label: "Hero", description: "Main hero section with CTA" },
  { key: "features", label: "Features", description: "Feature showcase grid" },
  { key: "ai-platform", label: "AI Platform", description: "AI capabilities overview" },
  { key: "screenshots", label: "Screenshots", description: "Product screenshots carousel" },
  { key: "realtime-stats", label: "Statistics", description: "Real-time stats counter" },
  { key: "pricing", label: "Pricing", description: "Pricing plans table" },
  { key: "credit-packs", label: "Credit Packs", description: "Credit packages" },
  { key: "credit-usage", label: "Credit Usage", description: "Credit usage tracking" },
  { key: "testimonials", label: "Testimonials", description: "Customer testimonials" },
  { key: "faq", label: "FAQ", description: "Frequently asked questions" },
  { key: "cta", label: "Call to Action", description: "Final call to action" },
  { key: "footer", label: "Footer", description: "Site footer" },
  { key: "custom-html", label: "Custom HTML", description: "Embed custom HTML" },
  { key: "custom-section", label: "Custom Section", description: "Empty custom section" },
];

type SectionDrawerProps = {
  open: boolean;
  section: LandingSection | null;
  onClose: () => void;
  onSave: (section: LandingSection) => void;
  onDelete: (section: LandingSection) => void;
  onDuplicate: (section: LandingSection) => void;
};

export function SectionDrawer({ open, section, onClose, onSave, onDelete, onDuplicate }: SectionDrawerProps) {
  const { t } = useLocalizationContext();
  const [form, setForm] = React.useState<Partial<LandingSection>>({});
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("general");
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => {
    if (section) {
      setForm({ ...section });
    }
    setActiveTab("general");
  }, [section]);

  const autoSave = React.useCallback(async () => {
    if (!form.sectionKey || !form.title) return;
    setSaving(true);
    try {
      const isNew = !section?.id;
      const method = isNew ? "POST" : "PATCH";
      const url = isNew ? "/api/landing/sections" : `/api/landing/sections/${encodeURIComponent(form.sectionKey)}`;

      const payload: Record<string, unknown> = {
        sectionKey: form.sectionKey,
        title: form.title,
        description: form.description ?? null,
        component: form.component ?? "",
        type: form.type,
        visible: form.visible,
        locked: form.locked,
        order: form.order,
        config: form.config ?? {},
        styles: form.styles ?? {},
      };

      if (!isNew) {
        delete payload.sectionKey;
        delete payload.order;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || t("sectionDrawer.failedToSave", "Failed to save section"));
        return;
      }

      onSave({
        id: result.data.id || section!.id,
        sectionKey: result.data.sectionKey || form.sectionKey!,
        title: result.data.title || form.title!,
        description: result.data.description ?? form.description ?? null,
        component: result.data.component || form.component || "",
        type: result.data.type || form.type || "hero",
        visible: result.data.visible ?? form.visible ?? true,
        locked: result.data.locked ?? form.locked ?? false,
        order: result.data.order ?? form.order ?? 0,
        config: (result.data.config ?? form.config) as Record<string, unknown>,
        styles: (result.data.styles ?? form.styles) as Record<string, unknown>,
        media: result.data.media ?? section?.media ?? [],
      });
    } catch {
      toast.error(t("sectionDrawer.errorSaving", "Error saving section"));
    } finally {
      setSaving(false);
    }
  }, [form, section, onSave]);

  React.useEffect(() => {
    if (!open) return;
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open || !section) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      autoSave();
    }, 800);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [form, open, section, autoSave]);

  const handleClose = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    autoSave().then(() => onClose());
  };

  const handleChange = (field: keyof LandingSection, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      config: { ...(prev.config ?? {}), [key]: value },
    }));
  };

  const handleStylesChange = (key: string, value: unknown) => {
    setForm((prev) => ({
      ...prev,
      styles: { ...(prev.styles ?? {}), [key]: value },
    }));
  };

  if (!open || !section) return null;

  const isNew = !section.id;

  return (
    <Sheet open={open} onClose={handleClose}>
      <SheetHeader>
        <SheetTitle>{isNew ? t("sectionDrawer.newSection", "New Section") : t("sectionDrawer.edit", "Edit") + ": " + (section.title || section.sectionKey)}</SheetTitle>
        <SheetCloseButton onClick={handleClose} />
      </SheetHeader>
      <SheetContent>
        <div className="space-y-6 p-4">
          {saving && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <span className="inline-block animate-spin">⏳</span>
              {t("sectionDrawer.saving", "Saving...")}
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-b border-border pb-2">
            {["general", "layout", "style", "seo", "advanced"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === tab
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === "general" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("sectionDrawer.general", "General")}</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title">{t("sectionDrawer.title", "Title")}</Label>
                  <Input
                    id="title"
                    value={form.title ?? ""}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Section title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">{t("sectionDrawer.description", "Description")}</Label>
                  <textarea
                    id="description"
                    value={form.description ?? ""}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Section description"
                    rows={3}
                    className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
                <div>
                  <Label htmlFor="sectionKey">{t("sectionDrawer.sectionKey", "Section Key")}</Label>
                  <Input
                    id="sectionKey"
                    value={form.sectionKey ?? ""}
                    onChange={(e) => handleChange("sectionKey", e.target.value.replace(/\s+/g, "-").toLowerCase())}
                    placeholder="hero, features, footer"
                    disabled={!isNew}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t("sectionDrawer.uniqueIdentifier", "Unique identifier for this section")}</p>
                </div>
                <div>
                  <Label htmlFor="primary-button">{t("sectionDrawer.primaryButtonText", "Primary Button Text")}</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="primary-button"
                      value={(form.config?.primaryButtonText as string) ?? ""}
                      onChange={(e) => handleConfigChange("primaryButtonText", e.target.value)}
                      placeholder="Get Started"
                      className="flex-1"
                    />
                    <TranslationKeyPicker
                      value={(form.config?.primaryButtonText as string) ?? ""}
                      onChange={(key) => handleConfigChange("primaryButtonText", key)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-button">{t("sectionDrawer.secondaryButtonText", "Secondary Button Text")}</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="secondary-button"
                      value={(form.config?.secondaryButtonText as string) ?? ""}
                      onChange={(e) => handleConfigChange("secondaryButtonText", e.target.value)}
                      placeholder="Learn More"
                      className="flex-1"
                    />
                    <TranslationKeyPicker
                      value={(form.config?.secondaryButtonText as string) ?? ""}
                      onChange={(key) => handleConfigChange("secondaryButtonText", key)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="primary-url">{t("sectionDrawer.primaryButtonUrl", "Primary Button URL")}</Label>
                  <Input
                    id="primary-url"
                    value={(form.config?.primaryButtonUrl as string) ?? ""}
                    onChange={(e) => handleConfigChange("primaryButtonUrl", e.target.value)}
                    placeholder="/signup"
                  />
                </div>
                <div>
                  <Label htmlFor="secondary-url">{t("sectionDrawer.secondaryButtonUrl", "Secondary Button URL")}</Label>
                  <Input
                    id="secondary-url"
                    value={(form.config?.secondaryButtonUrl as string) ?? ""}
                    onChange={(e) => handleConfigChange("secondaryButtonUrl", e.target.value)}
                    placeholder="/pricing"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "layout" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("sectionDrawer.layout", "Layout")}</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="padding">{t("sectionDrawer.padding", "Padding")}</Label>
                  <Input
                    id="padding"
                    value={(form.styles?.padding as string) ?? ""}
                    onChange={(e) => handleStylesChange("padding", e.target.value)}
                    placeholder="64px 0"
                  />
                </div>
                <div>
                  <Label htmlFor="margin">{t("sectionDrawer.margin", "Margin")}</Label>
                  <Input
                    id="margin"
                    value={(form.styles?.margin as string) ?? ""}
                    onChange={(e) => handleStylesChange("margin", e.target.value)}
                    placeholder="0 auto"
                  />
                </div>
                <div>
                  <Label htmlFor="gap">{t("sectionDrawer.gap", "Gap")}</Label>
                  <Input
                    id="gap"
                    value={(form.styles?.gap as string) ?? ""}
                    onChange={(e) => handleStylesChange("gap", e.target.value)}
                    placeholder="24px"
                  />
                </div>
                <div>
                  <Label htmlFor="columns">{t("sectionDrawer.columns", "Columns")}</Label>
                  <Input
                    id="columns"
                    type="number"
                    value={(form.config?.columns as number) ?? 1}
                    onChange={(e) => handleConfigChange("columns", parseInt(e.target.value) || 1)}
                    placeholder="1"
                  />
                </div>
                <div>
                  <Label htmlFor="container-width">{t("sectionDrawer.containerWidth", "Container Width")}</Label>
                  <Input
                    id="container-width"
                    value={(form.styles?.containerWidth as string) ?? ""}
                    onChange={(e) => handleStylesChange("containerWidth", e.target.value)}
                    placeholder="max-w-7xl"
                  />
                </div>
                <div>
                  <Label htmlFor="alignment">{t("sectionDrawer.alignment", "Alignment")}</Label>
                  <select
                    id="alignment"
                    value={(form.config?.alignment as string) ?? "center"}
                    onChange={(e) => handleConfigChange("alignment", e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "style" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("sectionDrawer.style", "Style")}</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="background">{t("sectionDrawer.background", "Background")}</Label>
                  <Input
                    id="background"
                    value={(form.styles?.background as string) ?? ""}
                    onChange={(e) => handleStylesChange("background", e.target.value)}
                    placeholder="#ffffff or bg-gradient-to-r"
                  />
                </div>
                <div>
                  <Label htmlFor="border-radius">{t("sectionDrawer.borderRadius", "Border Radius")}</Label>
                  <Input
                    id="border-radius"
                    value={(form.styles?.borderRadius as string) ?? ""}
                    onChange={(e) => handleStylesChange("borderRadius", e.target.value)}
                    placeholder="0.5rem"
                  />
                </div>
                <div>
                  <Label htmlFor="shadow">{t("sectionDrawer.shadow", "Shadow")}</Label>
                  <Input
                    id="shadow"
                    value={(form.styles?.shadow as string) ?? ""}
                    onChange={(e) => handleStylesChange("shadow", e.target.value)}
                    placeholder="0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  />
                </div>
                <div>
                  <Label htmlFor="gradient">{t("sectionDrawer.gradient", "Gradient")}</Label>
                  <Input
                    id="gradient"
                    value={(form.styles?.gradient as string) ?? ""}
                    onChange={(e) => handleStylesChange("gradient", e.target.value)}
                    placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  />
                </div>
                <div>
                  <Label htmlFor="typography">{t("sectionDrawer.typography", "Typography")}</Label>
                  <Input
                    id="typography"
                    value={(form.styles?.typography as string) ?? ""}
                    onChange={(e) => handleStylesChange("typography", e.target.value)}
                    placeholder="font-sans text-4xl font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("sectionDrawer.seo", "SEO")}</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="heading-tag">{t("sectionDrawer.headingTag", "Heading Tag")}</Label>
                  <select
                    id="heading-tag"
                    value={(form.config?.headingTag as string) ?? "h2"}
                    onChange={(e) => handleConfigChange("headingTag", e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                    <option value="h4">H4</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="aria-label">{t("sectionDrawer.ariaLabel", "ARIA Label")}</Label>
                  <Input
                    id="aria-label"
                    value={(form.config?.ariaLabel as string) ?? ""}
                    onChange={(e) => handleConfigChange("ariaLabel", e.target.value)}
                    placeholder="Descriptive label for screen readers"
                  />
                </div>
                <div>
                  <Label htmlFor="schema">{t("sectionDrawer.schema", "Schema JSON")}</Label>
                  <textarea
                    id="schema"
                    value={JSON.stringify(form.config?.schema ?? {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleConfigChange("schema", parsed);
                      } catch {
                        // ignore invalid json while typing
                      }
                    }}
                    rows={4}
                    className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("sectionDrawer.advanced", "Advanced")}</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="component">{t("sectionDrawer.component", "Component")}</Label>
                  <Input
                    id="component"
                    value={form.component ?? ""}
                    onChange={(e) => handleChange("component", e.target.value)}
                    placeholder="hero"
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="type">{t("sectionDrawer.type", "Type")}</Label>
                  <select
                    id="type"
                    value={form.type ?? "hero"}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    {CONTENT_TYPES.map((ct) => (
                      <option key={ct.key} value={ct.key}>
                        {ct.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="visibility">{t("sectionDrawer.visibility", "Visibility")}</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Button
                      type="button"
                      variant={form.visible ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange("visible", true)}
                      className="gap-2"
                    >
                      <Eye className="size-4" /> Visible
                    </Button>
                    <Button
                      type="button"
                      variant={!form.visible ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange("visible", false)}
                      className="gap-2"
                    >
                      <EyeOff className="size-4" /> Hidden
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="locked">{t("sectionDrawer.locked", "Locked")}</Label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Button
                      type="button"
                      variant={form.locked ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange("locked", true)}
                      className="gap-2"
                    >
                      <Lock className="size-4" /> Locked
                    </Button>
                    <Button
                      type="button"
                      variant={!form.locked ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange("locked", false)}
                      className="gap-2"
                    >
                      <Unlock className="size-4" /> Unlocked
                    </Button>
                  </div>
                   <p className="text-xs text-muted-foreground mt-1">
                     {t("sectionDrawer.lockedMessage", "Locked sections cannot be dragged, deleted, or hidden. Content can still be edited.")}
                   </p>
                </div>
                <div>
                  <Label htmlFor="order">{t("sectionDrawer.order", "Order")}</Label>
                  <Input
                    id="order"
                    type="number"
                    value={form.order ?? 0}
                    onChange={(e) => handleChange("order", parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label>{t("sectionDrawer.jsonConfig", "JSON Config")}</Label>
                  <textarea
                    value={JSON.stringify(form.config ?? {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleChange("config", parsed);
                      } catch {
                        // ignore
                      }
                    }}
                    rows={6}
                    className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
                <div>
                  <Label>{t("sectionDrawer.jsonStyles", "JSON Styles")}</Label>
                  <textarea
                    value={JSON.stringify(form.styles ?? {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleChange("styles", parsed);
                      } catch {
                        // ignore
                      }
                    }}
                    rows={6}
                    className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-border">
            {!isNew && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDuplicate(section)}
                  className="gap-2"
                >
                  <Copy className="size-4" /> {t("sectionDrawer.duplicate", "Duplicate")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(section)}
                  disabled={section.locked}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" /> {t("sectionDrawer.delete", "Delete")}
                </Button>
              </>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={handleClose}>
              {t("sectionDrawer.close", "Close")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
