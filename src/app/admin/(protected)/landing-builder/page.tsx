"use client";

import * as React from "react";
import useSWR from "swr";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { SectionDrawer } from "./_components/SectionDrawer";
import { SectionList, type LandingSection } from "./_components/SectionList";
import { AddSectionDialog } from "./_components/AddSectionDialog";
import { useLocalizationContext } from "@/providers/localization";
import { toast } from "sonner";
import { RefreshCw, Eye, Plus } from "lucide-react";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

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

export default function AdminLandingBuilderPage() {
  const { t: _t } = useLocalizationContext();
  const { data, error, isLoading, mutate } = useSWR("/api/landing/sections", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 0,
  });

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingSection, setEditingSection] = React.useState<LandingSection | null>(null);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const sections: LandingSection[] = React.useMemo(() => {
    if (data?.success && Array.isArray(data.data)) {
      return data.data.map((s: Record<string, unknown>) => ({
        id: String(s.id),
        sectionKey: String(s.sectionKey),
        title: String(s.title),
        description: s.description as string | null,
        component: String(s.component ?? ""),
        type: String(s.type),
        visible: Boolean(s.visible),
        locked: Boolean(s.locked),
        order: Number(s.order),
        config: (s.config ?? {}) as Record<string, unknown>,
        styles: (s.styles ?? {}) as Record<string, unknown>,
        media: Array.isArray(s.media) ? s.media.map((m: Record<string, unknown>) => ({
          id: String(m.id),
          url: String(m.url),
          alt: String(m.alt ?? ""),
          type: String(m.type),
          order: Number(m.order),
        })) : [],
      }));
    }
    return [];
  }, [data]);

  const openCreateDialog = () => {
    setEditingSection(null);
    setAddDialogOpen(true);
  };

  const openEditDrawer = (section: LandingSection) => {
    setEditingSection(section);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingSection(null);
  };

  const handleSave = async (_section: LandingSection) => {
    closeEditor();
    await mutate();
  };

  const handleDelete = async (section: LandingSection) => {
    try {
      const response = await fetch(`/api/landing/sections/${encodeURIComponent(section.sectionKey)}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to delete section");
        return;
      }

      toast.success("Section deleted", {
        action: {
          label: "Undo",
          onClick: () => handleUndoDelete(section),
        },
      });
      await mutate();
    } catch {
      toast.error("Error deleting section");
    }
  };

  const handleUndoDelete = async (section: LandingSection) => {
    try {
      const response = await fetch("/api/landing/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey: section.sectionKey,
          title: section.title,
          description: section.description,
          component: section.component,
          type: section.type,
          visible: section.visible,
          locked: section.locked,
          order: section.order,
          config: section.config,
          styles: section.styles,
          media: section.media,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Section restored");
        await mutate();
      } else {
        toast.error(result.error || "Failed to restore section");
      }
    } catch {
      toast.error("Error restoring section");
    }
  };

  const handleToggleVisibility = async (section: LandingSection) => {
    try {
      const response = await fetch(`/api/landing/sections/${encodeURIComponent(section.sectionKey)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !section.visible }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to update visibility");
        return;
      }

      toast.success(section.visible ? "Section hidden" : "Section is now visible");
      await mutate();
    } catch {
      toast.error("Error updating visibility");
    }
  };

  const handleToggleLock = async (section: LandingSection) => {
    try {
      const response = await fetch(`/api/landing/sections/${encodeURIComponent(section.sectionKey)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locked: !section.locked }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to update lock state");
        return;
      }

      toast.success(section.locked ? "Section unlocked" : "Section locked");
      await mutate();
    } catch {
      toast.error("Error updating lock state");
    }
  };

  const handleDuplicate = async (section: LandingSection) => {
    try {
      const response = await fetch(`/api/landing/sections/${encodeURIComponent(section.sectionKey)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newSectionKey: `${section.sectionKey}-copy-${Date.now()}`,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to duplicate section");
        return;
      }

      toast.success("Section duplicated");
      await mutate();
    } catch {
      toast.error("Error duplicating section");
    }
  };

  const handleReorder = async (reordered: { sectionKey: string; order: number }[]) => {
    try {
      const response = await fetch("/api/landing/sections/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: reordered }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error || "Failed to reorder sections");
        await mutate();
        return;
      }

      toast.success("Sections reordered");
      await mutate();
    } catch {
      toast.error("Error reordering sections");
      await mutate();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.sectionKey === active.id);
    const newIndex = sections.findIndex((s) => s.sectionKey === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, idx) => ({
      sectionKey: s.sectionKey,
      order: idx,
    }));
    handleReorder(reordered);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await mutate();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Landing Builder" }]} />

      <DashboardCard>
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 rounded-lg p-6">
          <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Landing Page Builder</h1>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
              Manage and customize landing page sections. Drag to reorder, click to edit. All changes save automatically.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("/?preview=true", "_blank")}
              className="whitespace-nowrap"
            >
              <Eye className="mr-2 size-4" />
              Live Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 size-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-primary to-primary/80 whitespace-nowrap"
            >
              <Plus className="mr-2 size-4" />
              New Section
            </Button>
          </div>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard>
        {error && (
          <div
            className={`mb-4 rounded-lg border p-4 text-sm font-medium ${
              error.message?.toLowerCase().includes("not found") || error.message?.toLowerCase().includes("migration")
                ? "border-amber-200/50 bg-amber-50/50 text-amber-700"
                : "border-red-200/50 bg-red-50/50 text-red-700"
            }`}
          >
            {error.message?.toLowerCase().includes("not found") || error.message?.toLowerCase().includes("migration")
              ? "Landing CMS tables are missing. Run: pnpm db:migrate"
              : error.message || "Database connection failed."}
          </div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map((s) => s.sectionKey)}
            strategy={verticalListSortingStrategy}
          >
            <SectionList
              sections={sections}
              loading={isLoading}
              onAdd={openCreateDialog}
              onEdit={openEditDrawer}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
              onToggleLock={handleToggleLock}
              onReorder={handleReorder}
              onRefresh={handleRefresh}
            />
          </SortableContext>
        </DndContext>
      </DashboardCard>

      <SectionDrawer
        open={editorOpen}
        section={editingSection}
        onClose={closeEditor}
        onSave={handleSave}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
      />

      <AddSectionDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onCreated={({ key, title }) => {
          const newSection: LandingSection = {
            id: crypto.randomUUID(),
            sectionKey: key,
            title,
            description: null,
            component: key,
            type: key,
            visible: true,
            locked: false,
            order: sections.length,
            config: {},
            styles: {},
            media: [],
          };
          setEditingSection(newSection);
          setEditorOpen(true);
        }}
      />
    </div>
  );
}
