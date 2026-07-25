"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { SectionEditor, type SectionFormData } from "./_components/SectionEditor";
import { SectionList, type SectionRow } from "./_components/SectionList";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    let message = `API error: ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }
  return response.json();
};

type ApiSection = SectionRow & {
  id: string;
  key: string;
  type: string;
  title: string;
  subtitle: string | null;
  isVisible: boolean;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export default function AdminLandingBuilderPage() {
  const { t } = useLocalizationContext();
  const { data, error, isLoading, mutate } = useSWR("/api/landing/sections", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 0,
  });

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingSection, setEditingSection] = React.useState<SectionRow | null>(null);
  const [saving, setSaving] = React.useState(false);

  const sections: SectionRow[] = React.useMemo(() => {
    if (data?.success && Array.isArray(data.data)) {
      return data.data.map((s: ApiSection) => ({
        id: s.id,
        key: s.key,
        type: s.type,
        title: s.title,
        subtitle: s.subtitle,
        isVisible: s.isVisible,
        order: s.order,
        media: Array.isArray(s.media) ? s.media : [],
      }));
    }
    return [];
  }, [data]);

  const isUsingMockData = !data && error;

  const errorMessage = React.useMemo(() => {
    if (!error) return null;
    if (typeof error === "object" && "error" in error) {
      return (error as { error?: string }).error || null;
    }
    if (error instanceof Error) return error.message;
    return String(error);
  }, [error]);

  const isMissingTable = errorMessage?.toLowerCase().includes("not found") || errorMessage?.toLowerCase().includes("migration");

  const openCreateModal = () => {
    setEditingSection(null);
    setEditorOpen(true);
  };

  const openEditModal = (section: SectionRow) => {
    setEditingSection(section);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingSection(null);
  };

  const handleSave = async (form: SectionFormData) => {
    setSaving(true);
    try {
      const isNew = !editingSection;
      const method = isNew ? "POST" : "PATCH";
      const url = isNew ? "/api/landing/sections" : `/api/landing/sections/${encodeURIComponent(form.key)}`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || (isNew ? "Failed to create section" : "Failed to update section"));
        return;
      }

      toast.success(isNew ? "Section created" : "Section updated");
      closeEditor();
      mutate();
    } catch {
      toast.error("Error saving section");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (section: SectionRow) => {
    const confirmed = confirm(`Hide section "${section.title || section.key}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/landing/sections/${encodeURIComponent(section.key)}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to delete section");
        return;
      }

      toast.success("Section hidden");
      mutate();
    } catch {
      toast.error("Error deleting section");
    }
  };

  const handleToggleVisibility = async (section: SectionRow) => {
    try {
      const response = await fetch(`/api/landing/sections/${encodeURIComponent(section.key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !section.isVisible }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to update visibility");
        return;
      }

      toast.success(section.isVisible ? "Section hidden" : "Section visible");
      mutate();
    } catch {
      toast.error("Error updating visibility");
    }
  };

  const handleReorder = async (section: SectionRow, direction: "up" | "down") => {
    const currentOrder = section.order;
    const targetOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;

    try {
      const response = await fetch(`/api/landing/sections/${encodeURIComponent(section.key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: targetOrder }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to reorder section");
        return;
      }

      mutate();
    } catch {
      toast.error("Error reordering section");
    }
  };

  const initialEditorData = editingSection
    ? {
        key: editingSection.key,
        type: editingSection.type,
        title: editingSection.title,
        subtitle: editingSection.subtitle ?? "",
        content: {},
        isVisible: editingSection.isVisible,
        order: editingSection.order,
      }
    : null;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Landing Builder" }]} />

      <DashboardCard>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Landing Builder</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage landing page sections, content, and visibility
          </p>
        </div>

        {isUsingMockData && (
          <div className={`mb-4 rounded-lg border p-3 text-xs ${
            isMissingTable
              ? "border-amber-200/50 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300"
              : "border-red-200/50 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300"
          }`}>
            {isMissingTable
              ? "Landing CMS tables are missing. Run: pnpm db:migrate"
              : errorMessage || "Database connection failed. Please check your connection and try again."}
          </div>
        )}

        <SectionList
          sections={sections}
          loading={isLoading}
          onAdd={openCreateModal}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onToggleVisibility={handleToggleVisibility}
          onReorder={handleReorder}
          onRefresh={() => mutate()}
        />
      </DashboardCard>

      <SectionEditor
        open={editorOpen}
        section={initialEditorData}
        saving={saving}
        onClose={closeEditor}
        onSave={handleSave}
      />
    </div>
  );
}
