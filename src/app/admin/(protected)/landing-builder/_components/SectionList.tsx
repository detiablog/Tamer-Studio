"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { GripVertical, ArrowUp, ArrowDown, Eye, EyeOff, Edit3, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export type SectionRow = {
  id: string;
  key: string;
  type: string;
  title: string;
  subtitle: string | null;
  isVisible: boolean;
  order: number;
  media: Array<{
    id: string;
    url: string;
    type: string;
    order: number;
  }>;
};

type SectionListProps = {
  sections: SectionRow[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (section: SectionRow) => void;
  onDelete: (section: SectionRow) => void;
  onToggleVisibility: (section: SectionRow) => void;
  onReorder: (section: SectionRow, direction: "up" | "down") => void;
  onRefresh: () => void;
};

export function SectionList({
  sections,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onToggleVisibility,
  onReorder,
  onRefresh,
}: SectionListProps) {
  const sorted = React.useMemo(
    () => [...sections].sort((a, b) => a.order - b.order || a.key.localeCompare(b.key)),
    [sections]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {sorted.length} section{sorted.length !== 1 ? "s" : ""}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
          <Button size="sm" onClick={onAdd}>
            <Plus className="mr-2 size-4" />
            Add Section
          </Button>
        </div>
      </div>

      {loading && sorted.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Loading sections...
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No sections yet. Create your first landing section.
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((section, index) => (
            <div
              key={section.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="text-muted-foreground cursor-grab" aria-hidden="true">
                <GripVertical className="size-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm truncate">{section.title || section.key}</span>
                  <code className="text-[11px] bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground">
                    {section.key}
                  </code>
                  <Badge tone={section.isVisible ? "success" : "muted"}>
                    {section.type}
                  </Badge>
                  {!section.isVisible && (
                    <span className="text-[10px] text-muted-foreground">(hidden)</span>
                  )}
                </div>
                {section.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{section.subtitle}</p>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {section.media?.length ?? 0} media · order {section.order}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={index === 0}
                  onClick={() => onReorder(section, "up")}
                  aria-label="Move up"
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={index === sorted.length - 1}
                  onClick={() => onReorder(section, "down")}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => onToggleVisibility(section)}
                  aria-label={section.isVisible ? "Hide section" : "Show section"}
                >
                  {section.isVisible ? (
                    <Eye className="size-4 text-green-600" />
                  ) : (
                    <EyeOff className="size-4 text-muted-foreground" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => onEdit(section)}
                  aria-label="Edit section"
                >
                  <Edit3 className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(section)}
                  aria-label="Delete section"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
