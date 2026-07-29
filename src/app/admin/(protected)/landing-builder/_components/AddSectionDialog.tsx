"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";

const AVAILABLE_SECTIONS = [
  { key: "hero", label: "Hero", description: "Main hero section with CTA", icon: "🚀" },
  { key: "features", label: "Features", description: "Feature showcase grid", icon: "⭐" },
  { key: "ai-platform", label: "AI Platform", description: "AI capabilities overview", icon: "🤖" },
  { key: "screenshots", label: "Screenshots", description: "Product screenshots carousel", icon: "📸" },
  { key: "realtime-stats", label: "Statistics", description: "Real-time stats counter", icon: "📈" },
  { key: "pricing", label: "Pricing", description: "Pricing plans table", icon: "💰" },
  { key: "credit-packs", label: "Credit Packs", description: "Credit packages", icon: "📦" },
  { key: "credit-calculator", label: "Credit Calculator", description: "Credit cost estimator", icon: "🧮" },
  { key: "credit-usage", label: "Credit Usage", description: "Credit usage tracking", icon: "📊" },
  { key: "testimonials", label: "Testimonials", description: "Customer testimonials", icon: "💬" },
  { key: "faq", label: "FAQ", description: "Frequently asked questions", icon: "❓" },
  { key: "cta", label: "Call to Action", description: "Final call to action", icon: "🎯" },
  { key: "footer", label: "Footer", description: "Site footer", icon: "📄" },
  { key: "custom-html", label: "Custom HTML", description: "Embed custom HTML", icon: "🔧" },
  { key: "custom-section", label: "Custom Section", description: "Empty custom section", icon: "📝" },
];

type AddSectionDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (section: { key: string; title: string }) => void;
  adminToken: string | null;
};

export function AddSectionDialog({ open, onClose, onCreated, adminToken }: AddSectionDialogProps) {
  const { t } = useLocalizationContext();
  const [selected, setSelected] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState("");
  const [key, setKey] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setSelected(null);
      setTitle("");
      setKey("");
    }
  }, [open]);

   const handleCreate = async () => {
    if (!selected) return;
    const sectionKey = key.trim() || selected;
    const sectionTitle = title.trim() || selected;

    setSaving(true);
    try {
      const authHeaders: Record<string, string> = { "Content-Type": "application/json" };
      if (adminToken) authHeaders["Authorization"] = `Bearer ${adminToken}`;

      const response = await fetch("/api/landing/sections", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          sectionKey,
          title: sectionTitle,
          component: selected,
          type: selected,
          visible: true,
          locked: false,
          config: {},
          styles: {},
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(typeof result.error === "string" ? result.error : (result.error?.message || t("addSectionDialog.failedCreate", "Failed to create section")));
        return;
      }

      toast.success(t("addSectionDialog.success", "Section created successfully"));
      onCreated({ key: result.data.sectionKey, title: result.data.title });
      onClose();
    } catch {
      toast.error(t("addSectionDialog.errorCreate", "Error creating section"));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">{t("addSectionDialog.title", "Add New Section")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("addSectionDialog.description", "Choose a block type and configure its settings")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-lg p-2 hover:bg-muted transition"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selected ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVAILABLE_SECTIONS.map((section) => (
                <button
                  key={section.key}
                  onClick={() => {
                    setSelected(section.key);
                    setTitle(section.label);
                    if (!key) setKey(section.key);
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5 transition text-center"
                >
                  <span className="text-3xl">{section.icon}</span>
                  <span className="font-semibold text-sm">{section.label}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {section.description}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-2xl">
                  {AVAILABLE_SECTIONS.find((s) => s.key === selected)?.icon}
                </span>
                <div>
                  <p className="font-semibold text-sm">
                    {AVAILABLE_SECTIONS.find((s) => s.key === selected)?.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {AVAILABLE_SECTIONS.find((s) => s.key === selected)?.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="section-title">Title</Label>
                  <Input
                    id="section-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Section title"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="section-key">Section Key</Label>
                  <Input
                    id="section-key"
                    value={key}
                    onChange={(e) => setKey(e.target.value.replace(/\s+/g, "-").toLowerCase())}
                    placeholder={selected}
                    className="mt-1.5 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Unique identifier for this section
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

          {selected && (
            <div className="flex gap-2 p-4 border-t border-border bg-muted/20">
              <Button
                variant="outline"
                onClick={() => setSelected(null)}
                className="flex-1"
              >
                {t("addSectionDialog.back", "Back")}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={saving || !title.trim()}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                {saving ? t("addSectionDialog.creating", "Creating...") : t("addSectionDialog.createSection", "Create Section")}
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}
