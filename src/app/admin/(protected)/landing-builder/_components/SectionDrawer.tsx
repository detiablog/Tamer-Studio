"use client";

import * as React from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetCloseButton } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Unlock, Copy, Trash2, Save, Settings, Palette, Type, Globe, ChevronDown } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { TranslationKeyPicker } from "@/components/admin/TranslationKeyPicker";

import type { LandingSection } from "./SectionList";

const SECTION_CONFIGS: Record<string, {
  description: string;
  fields: Array<{ key: string; label: string; placeholder: string; type?: "text" | "textarea" | "select" | "number" | "toggle"; options?: string[] }>;
}> = {
  hero: {
    description: "Main hero section with call-to-action buttons",
    fields: [
      { key: "primaryButtonText", label: "Primary Button Text", placeholder: "Get Started", type: "text" },
      { key: "primaryButtonUrl", label: "Primary Button URL", placeholder: "/signup", type: "text" },
      { key: "secondaryButtonText", label: "Secondary Button Text", placeholder: "Learn More", type: "text" },
      { key: "secondaryButtonUrl", label: "Secondary Button URL", placeholder: "/pricing", type: "text" },
      { key: "backgroundImage", label: "Background Image URL", placeholder: "https://...", type: "text" },
    ],
  },
  features: {
    description: "Feature showcase grid",
    fields: [
      { key: "columns", label: "Grid Columns", placeholder: "3", type: "select", options: ["2", "3", "4"] },
      { key: "showIcons", label: "Show Icons", type: "toggle" },
    ],
  },
  pricing: {
    description: "Pricing plans table",
    fields: [
      { key: "showToggle", label: "Show Monthly/Yearly Toggle", type: "toggle" },
      { key: "defaultPlan", label: "Highlighted Plan", placeholder: "creator", type: "select", options: ["lite", "creator", "pro", "none"] },
      { key: "plans", label: "Plans Config (JSON)", placeholder: '[{"name":"Lite","price":0},{"name":"Creator","price":29},{"name":"Pro","price":99}]', type: "textarea" },
    ],
  },
  "ai-platform": {
    description: "AI capabilities overview",
    fields: [
      { key: "showProviders", label: "Show AI Providers", type: "toggle" },
      { key: "columns", label: "Feature Columns", placeholder: "3", type: "select", options: ["2", "3", "4"] },
    ],
  },
  screenshots: {
    description: "Product screenshots carousel",
    fields: [
      { key: "autoplay", label: "Auto-play Carousel", type: "toggle" },
      { key: "interval", label: "Auto-play Interval (ms)", placeholder: "5000", type: "number" },
    ],
  },
  "realtime-stats": {
    description: "Real-time stats counter",
    fields: [
      { key: "animationDuration", label: "Animation Duration (ms)", placeholder: "2000", type: "number" },
    ],
  },
  "credit-packs": {
    description: "Credit packages display",
    fields: [
      { key: "showPopular", label: "Highlight Popular Pack", type: "toggle" },
    ],
  },
  "credit-usage": {
    description: "Credit usage tracking display",
    fields: [
      { key: "showHistory", label: "Show Usage History", type: "toggle" },
    ],
  },
  testimonials: {
    description: "Customer testimonials",
    fields: [
      { key: "columns", label: "Grid Columns", placeholder: "3", type: "select", options: ["2", "3"] },
      { key: "showAvatars", label: "Show Avatars", type: "toggle" },
    ],
  },
  faq: {
    description: "Frequently asked questions",
    fields: [
      { key: "allowMultiple", label: "Allow Multiple Open", type: "toggle" },
    ],
  },
  cta: {
    description: "Final call to action",
    fields: [
      { key: "primaryButtonText", label: "Button Text", placeholder: "Start Free Trial", type: "text" },
      { key: "primaryButtonUrl", label: "Button URL", placeholder: "/signup", type: "text" },
    ],
  },
  footer: {
    description: "Site footer",
    fields: [],
  },
  "custom-html": {
    description: "Embed custom HTML",
    fields: [
      { key: "html", label: "Custom HTML Content", placeholder: "<div>...</div>", type: "textarea" },
    ],
  },
  "custom-section": {
    description: "Empty custom section",
    fields: [],
  },
};

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
  const [activeTab, setActiveTab] = React.useState("content");
  const [isDirty, setIsDirty] = React.useState(false);
  const [showDangerZone, setShowDangerZone] = React.useState(false);

  React.useEffect(() => {
    if (section) {
      setForm({ ...section });
    }
    setIsDirty(false);
    setActiveTab("content");
    setShowDangerZone(false);
  }, [section]);

  const saveSection = React.useCallback(async () => {
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
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : (result.error?.message || t("sectionDrawer.failedToSave", "Failed to save section")));
        return false;
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
      setIsDirty(false);
      toast.success(t("sectionDrawer.saved", "Changes saved successfully"));
      return true;
    } catch {
      toast.error(t("sectionDrawer.errorSaving", "Error saving section"));
      return false;
    } finally {
      setSaving(false);
    }
  }, [form, section, onSave]);

  const handleClose = async () => {
    if (isDirty) {
      await saveSection();
    }
    onClose();
  };

  const handleChange = (field: keyof LandingSection, value: unknown) => {
    setIsDirty(true);
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setIsDirty(true);
    setForm((prev) => ({
      ...prev,
      config: { ...(prev.config ?? {}), [key]: value },
    }));
  };

  const handleStylesChange = (key: string, value: unknown) => {
    setIsDirty(true);
    setForm((prev) => ({
      ...prev,
      styles: { ...(prev.styles ?? {}), [key]: value },
    }));
  };

  if (!open || !section) return null;

  const isNew = !section.id;
  const sectionType = form.type ?? "hero";
  const sectionConfig = SECTION_CONFIGS[sectionType] || SECTION_CONFIGS["custom-section"];

  return (
    <Sheet open={open} onClose={handleClose}>
      <SheetHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary shrink-0">
              <span className="text-sm font-bold">{(sectionType?.[0] ?? "S").toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <SheetTitle className="truncate">
                {isNew ? t("sectionDrawer.newSection", "New Section") : form.title || form.sectionKey}
              </SheetTitle>
              {!isNew && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{sectionConfig.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!form.visible && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <EyeOff className="size-3" /> {t("sectionDrawer.hiddenBadge", "Hidden")}
              </span>
            )}
            {form.locked && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                <Lock className="size-3" /> {t("sectionDrawer.lockedBadge", "Locked")}
              </span>
            )}
          </div>
        </div>
        <SheetCloseButton onClick={handleClose} />
      </SheetHeader>
      <SheetContent>
        <div className="flex flex-col h-full">
          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-3 pb-2 border-b border-border overflow-x-auto">
            {[
              { key: "content", label: t("sectionDrawer.tabContent", "Content"), icon: Type },
              { key: "appearance", label: t("sectionDrawer.tabAppearance", "Appearance"), icon: Palette },
              { key: "settings", label: t("sectionDrawer.tabSettings", "Settings"), icon: Settings },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition shrink-0 ${
                  activeTab === key
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

            {/* === CONTENT TAB === */}
            {activeTab === "content" && (
              <>
                {/* Title & Description */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="title" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t("sectionDrawer.title", "Title")}
                    </Label>
                    <Input
                      id="title"
                      value={form.title ?? ""}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder={sectionConfig.fields.length > 0 ? sectionType.charAt(0).toUpperCase() + sectionType.slice(1) : "Section title"}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t("sectionDrawer.description", "Description")}
                    </Label>
                    <textarea
                      id="description"
                      value={form.description ?? ""}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder={sectionConfig.description}
                      rows={2}
                      className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                </div>

                {/* Section Key (read-only for existing) */}
                <div>
                  <Label htmlFor="sectionKey" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("sectionDrawer.sectionKey", "Section Key")}
                  </Label>
                  <Input
                    id="sectionKey"
                    value={form.sectionKey ?? ""}
                    onChange={(e) => handleChange("sectionKey", e.target.value.replace(/\s+/g, "-").toLowerCase())}
                    placeholder="hero, features, footer"
                    disabled={!isNew}
                    className="mt-1.5 font-mono text-sm"
                  />
                  {!isNew && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {t("sectionDrawer.keyReadOnly", "Key cannot be changed after creation")}
                    </p>
                  )}
                </div>

                {/* Section-type-specific fields */}
                {sectionConfig.fields.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-border/50">
                    <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {sectionType.charAt(0).toUpperCase() + sectionType.slice(1)} {t("sectionDrawer.options", "Options")}
                    </p>
                    {sectionConfig.fields.map((field) => (
                      <div key={field.key}>
                        <Label htmlFor={`config-${field.key}`} className="text-xs font-medium text-muted-foreground">
                          {field.label}
                        </Label>
                        {field.type === "toggle" ? (
                          <div className="flex items-center gap-3 mt-1.5">
                            <button
                              type="button"
                              onClick={() => handleConfigChange(field.key, true)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                form.config?.[field.key]
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {t("common.on", "On")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleConfigChange(field.key, false)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                form.config?.[field.key] === false || form.config?.[field.key] === undefined
                                  ? "bg-muted text-muted-foreground hover:bg-muted/80"
                                  : "bg-primary text-primary-foreground"
                              }`}
                            >
                              {t("common.off", "Off")}
                            </button>
                          </div>
                        ) : field.type === "select" ? (
                          <select
                            id={`config-${field.key}`}
                            value={String(form.config?.[field.key] ?? "")}
                            onChange={(e) => handleConfigChange(field.key, field.key === "columns" ? parseInt(e.target.value) : e.target.value)}
                            className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          >
                            {field.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === "textarea" ? (
                          <textarea
                            id={`config-${field.key}`}
                            value={String(form.config?.[field.key] ?? "")}
                            onChange={(e) => handleConfigChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={4}
                            className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                          />
                        ) : field.type === "number" ? (
                          <Input
                            id={`config-${field.key}`}
                            type="number"
                            value={String(form.config?.[field.key] ?? "")}
                            onChange={(e) => handleConfigChange(field.key, parseInt(e.target.value) || 0)}
                            placeholder={field.placeholder}
                            className="mt-1.5"
                          />
                        ) : (
                          <div className="flex gap-2 mt-1.5">
                            <Input
                              id={`config-${field.key}`}
                              value={String(form.config?.[field.key] ?? "")}
                              onChange={(e) => handleConfigChange(field.key, e.target.value)}
                              placeholder={field.placeholder}
                              className="flex-1"
                            />
                            <TranslationKeyPicker
                              value={String(form.config?.[field.key] ?? "")}
                              onChange={(key) => handleConfigChange(field.key, key)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* === APPEARANCE TAB === */}
            {activeTab === "appearance" && (
              <div className="space-y-4">
                {/* Section Type */}
                <div>
                  <Label htmlFor="type" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("sectionDrawer.sectionType", "Section Type")}
                  </Label>
                  <select
                    id="type"
                    value={sectionType}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {Object.entries(SECTION_CONFIGS).map(([key, cfg]) => (
                      <option key={key} value={key}>{cfg.description}</option>
                    ))}
                  </select>
                </div>

                {/* Visual Settings */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {t("sectionDrawer.visualSettings", "Visual Settings")}
                  </p>
                  <div>
                    <Label htmlFor="background" className="text-xs font-medium text-muted-foreground">
                      {t("sectionDrawer.background", "Background")}
                    </Label>
                    <Input
                      id="background"
                      value={(form.styles?.background as string) ?? ""}
                      onChange={(e) => handleStylesChange("background", e.target.value)}
                      placeholder="#ffffff or bg-gradient-to-r from-primary/5"
                      className="mt-1.5 font-mono text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {t("sectionDrawer.backgroundHint", "Color code or Tailwind class")}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="padding" className="text-xs font-medium text-muted-foreground">
                      {t("sectionDrawer.padding", "Padding")}
                    </Label>
                    <Input
                      id="padding"
                      value={(form.styles?.padding as string) ?? ""}
                      onChange={(e) => handleStylesChange("padding", e.target.value)}
                      placeholder="64px 0"
                      className="mt-1.5 font-mono text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="borderRadius" className="text-xs font-medium text-muted-foreground">
                        {t("sectionDrawer.borderRadius", "Border Radius")}
                      </Label>
                      <Input
                        id="borderRadius"
                        value={(form.styles?.borderRadius as string) ?? ""}
                        onChange={(e) => handleStylesChange("borderRadius", e.target.value)}
                        placeholder="0.5rem"
                        className="mt-1.5 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="shadow" className="text-xs font-medium text-muted-foreground">
                        {t("sectionDrawer.shadow", "Shadow")}
                      </Label>
                      <Input
                        id="shadow"
                        value={(form.styles?.shadow as string) ?? ""}
                        onChange={(e) => handleStylesChange("shadow", e.target.value)}
                        placeholder="0 4px 6px"
                        className="mt-1.5 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* === SETTINGS TAB === */}
            {activeTab === "settings" && (
              <div className="space-y-5">
                {/* Visibility */}
                <div>
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("sectionDrawer.visibility", "Visibility")}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                    {t("sectionDrawer.visibilityDesc", "Hidden sections are not shown on the public landing page")}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange("visible", true)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        form.visible
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                      }`}
                    >
                      <Eye className="size-4" />
                      {t("sectionDrawer.visible", "Visible")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange("visible", false)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        !form.visible
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                      }`}
                    >
                      <EyeOff className="size-4" />
                      {t("sectionDrawer.hidden", "Hidden")}
                    </button>
                  </div>
                </div>

                {/* Lock */}
                <div className="pt-2 border-t border-border/50">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("sectionDrawer.lockState", "Lock State")}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                    {t("sectionDrawer.lockedMessage", "Locked sections cannot be dragged, deleted, or hidden")}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleChange("locked", false)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        !form.locked
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                      }`}
                    >
                      <Unlock className="size-4" />
                      {t("sectionDrawer.unlocked", "Unlocked")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange("locked", true)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                        form.locked
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                      }`}
                    >
                      <Lock className="size-4" />
                      {t("sectionDrawer.locked", "Locked")}
                    </button>
                  </div>
                </div>

                {/* Order */}
                <div className="pt-2 border-t border-border/50">
                  <Label htmlFor="order" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t("sectionDrawer.displayOrder", "Display Order")}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5 mb-2">
                    {t("sectionDrawer.orderDesc", "Lower numbers appear first")}
                  </p>
                  <Input
                    id="order"
                    type="number"
                    value={form.order ?? 0}
                    onChange={(e) => handleChange("order", parseInt(e.target.value) || 0)}
                    className="w-24"
                    disabled={!isNew}
                  />
                </div>

                {/* SEO (collapsible) */}
                <div className="pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => {
                      const current = form.config?.headingTag;
                      if (current === undefined) handleConfigChange("headingTag", "h2");
                    }}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <div>
                      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t("sectionDrawer.seo", "SEO")}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("sectionDrawer.seoDesc", "Heading tag and accessibility settings")}
                      </p>
                    </div>
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </button>
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label htmlFor="headingTag" className="text-xs font-medium text-muted-foreground">
                        {t("sectionDrawer.headingTag", "Heading Tag")}
                      </Label>
                      <select
                        id="headingTag"
                        value={String(form.config?.headingTag ?? "h2")}
                        onChange={(e) => handleConfigChange("headingTag", e.target.value)}
                        className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="h2">H2</option>
                        <option value="h3">H3</option>
                        <option value="h4">H4</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="ariaLabel" className="text-xs font-medium text-muted-foreground">
                        {t("sectionDrawer.ariaLabel", "ARIA Label")}
                      </Label>
                      <Input
                        id="ariaLabel"
                        value={String(form.config?.ariaLabel ?? "")}
                        onChange={(e) => handleConfigChange("ariaLabel", e.target.value)}
                        placeholder="Accessibility label for screen readers"
                        className="mt-1.5"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Configuration (only for footer type) */}
                {sectionType === "footer" && (
                  <div className="pt-2 border-t border-border/50 space-y-4">
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                        {t("sectionDrawer.footerConfig", "Footer Configuration")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("sectionDrawer.footerConfigDesc", "Configure footer content, links, and contact information")}
                      </p>
                    </div>

                    {/* Company Info */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold text-foreground">Company</p>
                      <div>
                        <Label className="text-xs text-muted-foreground">{t("sectionDrawer.companyName", "Company Name")}</Label>
                        <Input value={String(form.config?.companyName ?? "")} onChange={(e) => handleConfigChange("companyName", e.target.value)} placeholder="Tamer Studio" className="mt-1.5" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">{t("sectionDrawer.tagline", "Tagline")}</Label>
                        <Input value={String(form.config?.tagline ?? "")} onChange={(e) => handleConfigChange("tagline", e.target.value)} placeholder="From intent to production." className="mt-1.5" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">{t("sectionDrawer.copyright", "Copyright Text")}</Label>
                        <Input value={String(form.config?.copyright ?? "")} onChange={(e) => handleConfigChange("copyright", e.target.value)} placeholder="2026 Tamer Studio. All rights reserved." className="mt-1.5" />
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-2 pt-2 border-t border-border/30">
                      <p className="text-[11px] font-semibold text-foreground">Contact</p>
                      <div>
                        <Label className="text-xs text-muted-foreground">{t("sectionDrawer.contactEmail", "Contact Email")}</Label>
                        <Input value={String(form.config?.contactEmail ?? "")} onChange={(e) => handleConfigChange("contactEmail", e.target.value)} placeholder="support@tamer.studio" className="mt-1.5" />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">{t("sectionDrawer.supportHref", "Support URL")}</Label>
                        <Input value={String(form.config?.supportHref ?? "")} onChange={(e) => handleConfigChange("supportHref", e.target.value)} placeholder="/support" className="mt-1.5" />
                      </div>
                    </div>

                    {/* Link Columns */}
                    {(["product", "resources", "company", "legal"] as const).map((col) => {
                      const colKey = `links.${col}`;
                      const links = Array.isArray(form.config?.links?.[col]) ? (form.config.links[col] as Array<{ label: string; href: string }>) : [];
                      return (
                        <div key={col} className="space-y-2 pt-2 border-t border-border/30">
                          <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold text-foreground capitalize">{col}</p>
                            <button
                              type="button"
                              onClick={() => {
                                const current = Array.isArray(form.config?.links?.[col]) ? [...(form.config.links[col] as Array<{ label: string; href: string }>)] : [];
                                handleConfigChange("links", { ...(form.config?.links as Record<string, unknown> ?? {}), [col]: [...current, { label: "New Link", href: "/" }] });
                              }}
                              className="text-[10px] text-primary hover:underline"
                            >
                              + Add
                            </button>
                          </div>
                          {links.map((link, idx) => (
                            <div key={idx} className="flex gap-2">
                              <Input
                                value={link.label}
                                onChange={(e) => {
                                  const updated = [...links]; updated[idx] = { ...updated[idx], label: e.target.value };
                                  handleConfigChange("links", { ...(form.config?.links as Record<string, unknown> ?? {}), [col]: updated });
                                }}
                                placeholder="Label"
                                className="flex-1 text-xs"
                              />
                              <Input
                                value={link.href}
                                onChange={(e) => {
                                  const updated = [...links]; updated[idx] = { ...updated[idx], href: e.target.value };
                                  handleConfigChange("links", { ...(form.config?.links as Record<string, unknown> ?? {}), [col]: updated });
                                }}
                                placeholder="/path"
                                className="flex-1 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = links.filter((_, i) => i !== idx);
                                  handleConfigChange("links", { ...(form.config?.links as Record<string, unknown> ?? {}), [col]: updated });
                                }}
                                className="text-destructive hover:text-destructive/80 text-xs px-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      );
                    })}

                    {/* Social Links */}
                    <div className="space-y-2 pt-2 border-t border-border/30">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-foreground">Social Links</p>
                        <button
                          type="button"
                          onClick={() => {
                            const current = Array.isArray(form.config?.socialLinks) ? [...(form.config.socialLinks as Array<{ label: string; href: string }>)] : [];
                            handleConfigChange("socialLinks", [...current, { label: "Twitter", href: "https://twitter.com/tamerstudio" }]);
                          }}
                          className="text-[10px] text-primary hover:underline"
                        >
                          + Add
                        </button>
                      </div>
                      {(Array.isArray(form.config?.socialLinks) ? (form.config.socialLinks as Array<{ label: string; href: string }>) : []).map((social, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={social.label}
                            onChange={(e) => {
                              const updated = [...(form.config?.socialLinks as Array<{ label: string; href: string }> ?? [])];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              handleConfigChange("socialLinks", updated);
                            }}
                            placeholder="Name"
                            className="flex-1 text-xs"
                          />
                          <Input
                            value={social.href}
                            onChange={(e) => {
                              const updated = [...(form.config?.socialLinks as Array<{ label: string; href: string }> ?? [])];
                              updated[idx] = { ...updated[idx], href: e.target.value };
                              handleConfigChange("socialLinks", updated);
                            }}
                            placeholder="URL"
                            className="flex-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (form.config?.socialLinks as Array<{ label: string; href: string }> ?? []).filter((_, i) => i !== idx);
                              handleConfigChange("socialLinks", updated);
                            }}
                            className="text-destructive hover:text-destructive/80 text-xs px-1"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Version & Build */}
                    <div className="space-y-2 pt-2 border-t border-border/30">
                      <p className="text-[11px] font-semibold text-foreground">Version</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">{t("sectionDrawer.version", "Version")}</Label>
                          <Input value={String(form.config?.version ?? "1.0.0")} onChange={(e) => handleConfigChange("version", e.target.value)} placeholder="1.0.0" className="mt-1.5 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">{t("sectionDrawer.build", "Build")}</Label>
                          <Input value={String(form.config?.build ?? "")} onChange={(e) => handleConfigChange("build", e.target.value)} placeholder="2026.07.25" className="mt-1.5 text-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced JSON (collapsed) */}
                <details className="pt-2 border-t border-border/50 group">
                  <summary className="cursor-pointer text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition">
                    {t("sectionDrawer.advanced", "Advanced")}
                  </summary>
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">JSON Config</Label>
                      <textarea
                        value={JSON.stringify(form.config ?? {}, null, 2)}
                        onChange={(e) => {
                          try {
                            handleChange("config", JSON.parse(e.target.value));
                          } catch {}
                        }}
                        rows={4}
                        className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">JSON Styles</Label>
                      <textarea
                        value={JSON.stringify(form.styles ?? {}, null, 2)}
                        onChange={(e) => {
                          try {
                            handleChange("styles", JSON.parse(e.target.value));
                          } catch {}
                        }}
                        rows={4}
                        className="w-full mt-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      />
                    </div>
                  </div>
                </details>

                {/* Danger Zone */}
                {!isNew && (
                  <div className="pt-2 border-t border-red-200/50 dark:border-red-800/30">
                    <button
                      type="button"
                      onClick={() => setShowDangerZone(!showDangerZone)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
                        {t("sectionDrawer.dangerZone", "Danger Zone")}
                      </span>
                      <ChevronDown className={`size-4 text-red-400 transition-transform ${showDangerZone ? "rotate-180" : ""}`} />
                    </button>
                    {showDangerZone && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDuplicate(section)}
                          className="gap-1.5"
                        >
                          <Copy className="size-3.5" /> {t("sectionDrawer.duplicate", "Duplicate")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(section)}
                          disabled={section.locked}
                          className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                        >
                          <Trash2 className="size-3.5" /> {t("sectionDrawer.delete", "Delete")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with Save/Cancel */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border bg-muted/30">
            <div className="flex items-center gap-3 text-xs text-muted-foreground min-w-0">
              {isDirty && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-[10px] font-medium shrink-0">
                  {t("sectionDrawer.unsavedChanges", "Unsaved")}
                </span>
              )}
              {saving && (
                <span className="inline-flex items-center gap-1 text-primary shrink-0">
                  <span className="inline-block animate-spin size-3 border-2 border-primary border-t-transparent rounded-full" />
                  {t("sectionDrawer.saving", "Saving...")}
                </span>
              )}
              {!isNew && (
                <span className="truncate">
                  {t("sectionDrawer.footerInfo", "Order")} {form.order ?? 0} &bull; {form.type ?? "hero"} &bull; {form.visible ? t("sectionDrawer.visible", "Visible") : t("sectionDrawer.hidden", "Hidden")}
                </span>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={onClose}>
                {t("sectionDrawer.cancel", "Cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleClose}
                disabled={saving}
                className="gap-1.5"
              >
                {saving ? (
                  <span className="inline-block animate-spin size-3 border-2 border-primary-foreground border-t-transparent rounded-full" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {t("sectionDrawer.saveClose", "Save & Close")}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
