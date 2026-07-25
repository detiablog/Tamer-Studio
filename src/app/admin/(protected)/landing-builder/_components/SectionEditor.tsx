"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";
import { toast } from "sonner";

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

export function SectionEditor({ open, section, saving, onClose, onSave }: SectionEditorProps) {
  const isNew = !section?.key;
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
              <Label htmlFor="section-type">Type</Label>
              <select
                id="section-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="hero">Hero</option>
                <option value="features">Features</option>
                <option value="pricing">Pricing</option>
                <option value="testimonials">Testimonials</option>
                <option value="cta">Call to Action</option>
                <option value="footer">Footer</option>
                <option value="custom">Custom</option>
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
