"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { CompactLoader } from "@/components/ui/ElegantLoader";
import { useLocalizationContext } from "@/providers/localization";

export type LandingSection = {
  id: string;
  sectionKey: string;
  title: string;
  description: string | null;
  component: string;
  type: string;
  visible: boolean;
  locked: boolean;
  order: number;
  config: Record<string, unknown>;
  styles: Record<string, unknown>;
  media: Array<{
    id: string;
    url: string;
    alt: string;
    type: string;
    order: number;
  }>;
};

type SectionListProps = {
  sections: LandingSection[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (section: LandingSection) => void;
  onDelete: (section: LandingSection) => void;
  onToggleVisibility: (section: LandingSection) => void;
  onToggleLock: (section: LandingSection) => void;
  onReorder: (sections: { sectionKey: string; order: number }[]) => void;
  onRefresh: () => void;
};

const TYPE_BADGE_TONE: Record<string, "default" | "success" | "warning" | "info" | "muted" | "purple"> = {
  "pricing": "info",
  "credit-packs": "success",
  "credit-usage": "warning",
  "faq": "purple",
  "hero": "default",
  "features": "default",
  "cta": "default",
  "footer": "default",
  "custom-html": "muted",
  "custom-section": "muted",
  "testimonials": "default",
  "ai-platform": "success",
  "screenshots": "info",
  "realtime-stats": "warning",
};

const TYPE_ICONS: Record<string, string> = {
  "pricing": "💰",
  "credit-packs": "📦",
  "credit-usage": "📊",
  "faq": "❓",
  "hero": "🚀",
  "features": "⭐",
  "cta": "🎯",
  "footer": "📄",
  "custom-html": "🔧",
  "custom-section": "📝",
  "testimonials": "💬",
  "ai-platform": "🤖",
  "screenshots": "📸",
  "realtime-stats": "📈",
};

export function SectionList({
  sections,
  loading,
  onAdd,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleLock,
  onReorder,
  onRefresh,
}: SectionListProps) {
  const { t } = useLocalizationContext();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterVisible, setFilterVisible] = React.useState<string>("all");
  const [filterLocked, setFilterLocked] = React.useState<string>("all");
  const [undoStack, setUndoStack] = React.useState<Array<{ section: LandingSection; timeout: ReturnType<typeof setTimeout> }>>([]);

  React.useEffect(() => {
    return () => {
      undoStack.forEach((item) => clearTimeout(item.timeout));
    };
  }, []);

  const handleDeleteWithUndo = async (section: LandingSection) => {
    if (section.locked) {
      toast.error(t("landingBuilder.cannotDeleteLocked", "Cannot delete a locked section"));
      return;
    }

    onDelete(section);

    const timeout = setTimeout(() => {
      setUndoStack((prev) => prev.filter((item) => item.section.id !== section.id));
    }, 5000);

    setUndoStack((prev) => [...prev, { section, timeout }]);
  };

  const handleUndo = (section: LandingSection) => {
    toast.success(`Restored "${section.title || section.sectionKey}"`);
    setUndoStack((prev) => prev.filter((item) => item.section.id !== section.id));
    onRefresh();
  };

  const filteredSections = React.useMemo(() => {
    let result = sections;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.sectionKey.toLowerCase().includes(query) ||
          s.type.toLowerCase().includes(query)
      );
    }

    if (filterVisible !== "all") {
      result = result.filter((s) => s.visible === (filterVisible === "true"));
    }

    if (filterLocked !== "all") {
      result = result.filter((s) => s.locked === (filterLocked === "true"));
    }

    return result;
  }, [sections, searchQuery, filterVisible, filterLocked]);

  const stats = React.useMemo(() => ({
    total: sections.length,
    visible: sections.filter((s) => s.visible).length,
    hidden: sections.filter((s) => !s.visible).length,
    locked: sections.filter((s) => s.locked).length,
    custom: sections.filter((s) => ["custom-html", "custom-section"].includes(s.type)).length,
  }), [sections]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground font-medium">
              {t("sectionList.ofSections", "{0} of {1} sections").replace("{0}", String(filteredSections.length)).replace("{1}", String(sections.length))}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Refresh
            </Button>
            <Button size="sm" onClick={onAdd} className="bg-gradient-to-r from-primary to-primary/80">
              Add Section
            </Button>
          </div>
        </div>

        {sections.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label={t("sectionList.total", "Total")} value={stats.total} icon="📊" />
            <StatCard label={t("sectionList.visible", "Visible")} value={stats.visible} icon="👁️" color="text-green-600" />
            <StatCard label={t("sectionList.hidden", "Hidden")} value={stats.hidden} icon="🙈" color="text-amber-600" />
            <StatCard label={t("sectionList.locked", "Locked")} value={stats.locked} icon="🔒" color="text-red-600" />
            <StatCard label={t("sectionList.custom", "Custom")} value={stats.custom} icon="🔧" color="text-purple-600" />
            <StatCard label={t("sectionList.system", "System")} value={stats.total - stats.custom} icon="⚙️" color="text-blue-600" />
          </div>
        )}

        {sections.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
               <input
                 type="text"
                 placeholder={t("sectionList.searchPlaceholder", "Search sections...")}
                 value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={filterVisible}
              onChange={(e) => setFilterVisible(e.target.value)}
              className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">{t("sectionList.allVisibility", "All Visibility")}</option>
              <option value="true">Visible</option>
              <option value="false">Hidden</option>
            </select>
            <select
              value={filterLocked}
              onChange={(e) => setFilterLocked(e.target.value)}
              className="rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">{t("sectionList.allLockState", "All Lock State")}</option>
              <option value="true">Locked</option>
              <option value="false">Unlocked</option>
            </select>
          </div>
        )}
      </div>

      {loading && sections.length === 0 ? (
        <div className="flex items-center justify-center py-32">
          <CompactLoader />
        </div>
      ) : filteredSections.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted/50">
            <PlusIcon />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              {sections.length === 0 ? t("sectionList.noSections", "No sections yet") : t("sectionList.noMatchingSections", "No matching sections")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {sections.length === 0
                ? t("sectionList.firstSection", "Create your first landing page section")
                : t("sectionList.tryAdjusting", "Try adjusting your search or filters")}
            </p>
          </div>
          {sections.length === 0 && (
            <Button onClick={onAdd} className="mt-4 bg-gradient-to-r from-primary to-primary/80">
              {t("sectionList.createFirstSection", "Create First Section")}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredSections.map((section, index) => (
            <SortableSectionRow
              key={section.sectionKey}
              section={section}
              index={index}
              totalCount={filteredSections.length}
              onEdit={onEdit}
              onDelete={handleDeleteWithUndo}
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
              onMoveUp={() => {
                if (index === 0) return;
                const newSections = sections.map((s, i) => ({
                  sectionKey: s.sectionKey,
                  order: i === index - 1 ? section.order : i === index ? sections[index - 1].order : s.order,
                }));
                onReorder(newSections);
              }}
              onMoveDown={() => {
                if (index === filteredSections.length - 1) return;
                const newSections = sections.map((s, i) => ({
                  sectionKey: s.sectionKey,
                  order: i === index + 1 ? section.order : i === index ? sections[index + 1].order : s.order,
                }));
                onReorder(newSections);
              }}
              t={t}
            />
          ))}
          {undoStack.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50">
              <span className="text-sm text-amber-700 dark:text-amber-300">
                {t("sectionList.deletedUndo", "Section deleted. Undo within 5 seconds.")}
              </span>
              {undoStack.map((item) => (
                <button
                  key={item.section.id}
                  onClick={() => handleUndo(item.section)}
                  className="text-sm font-semibold text-amber-800 dark:text-amber-200 underline hover:no-underline"
                >
                  {t("sectionList.undo", "Undo")}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={`text-lg font-bold ${color || ""}`}>{value}</p>
      </div>
    </div>
  );
}

function SortableSectionRow({
  section,
  index,
  totalCount,
  onEdit,
  onDelete,
  onToggleVisibility,
  onToggleLock,
  onMoveUp,
  onMoveDown,
  t,
}: {
  section: LandingSection;
  index: number;
  totalCount: number;
  onEdit: (s: LandingSection) => void;
  onDelete: (s: LandingSection) => void;
  onToggleVisibility: (s: LandingSection) => void;
  onToggleLock: (s: LandingSection) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  t: (key: string, fallback?: string) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.sectionKey, disabled: section.locked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-center gap-3 rounded-lg p-4 transition-all duration-200
        border-2 border-border bg-card
        hover:border-primary/50 hover:bg-muted/30 hover:shadow-md
        ${isDragging ? "shadow-lg border-primary" : ""}
        ${section.locked ? "opacity-90" : ""}
      `}
    >
      <div
        className="text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        aria-hidden="true"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </div>

      <div className="text-2xl flex-shrink-0">
        {TYPE_ICONS[section.type] || "📌"}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm truncate text-foreground">
            {section.title || section.sectionKey}
          </span>
          <code className="text-[11px] bg-muted/60 px-2 py-1 rounded text-muted-foreground font-mono truncate">
            {section.sectionKey}
          </code>
          <Badge tone={TYPE_BADGE_TONE[section.type] ?? "default"}>
            {section.type}
          </Badge>
          {!section.visible && (
            <span className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded font-medium">
              Hidden
            </span>
          )}
          {section.locked && (
            <span className="text-xs text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded font-medium">
              Locked
            </span>
          )}
        </div>
        {section.description && (
          <p className="text-xs text-muted-foreground mt-1.5 truncate line-clamp-1">
            {section.description}
          </p>
        )}
        <div className="text-xs text-muted-foreground mt-1.5 flex gap-3">
          <span>{section.media?.length ?? 0} media</span>
          <span>•</span>
          <span>Order: {section.order}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          className="size-8 hover:bg-muted"
          disabled={index === 0}
          onClick={onMoveUp}
          aria-label={t("sectionList.moveUp", "Move up")}
          title={t("sectionList.moveUp", "Move up")}
        >
          <ArrowUp className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="size-8 hover:bg-muted"
          disabled={index === totalCount - 1}
          onClick={onMoveDown}
          aria-label={t("sectionList.moveDown", "Move down")}
          title={t("sectionList.moveDown", "Move down")}
        >
          <ArrowDown className="size-4" />
        </Button>

        <div className="w-px h-5 bg-border" />

        <Button
          variant="ghost"
          size="sm"
          className="size-8 hover:bg-muted"
          onClick={() => onToggleLock(section)}
          aria-label={section.locked ? t("sectionList.unlockSection", "Unlock section") : t("sectionList.lockSection", "Lock section")}
          title={section.locked ? t("sectionList.unlockSection", "Unlock") : t("sectionList.lockSection", "Lock")}
        >
          {section.locked ? (
            <LockIcon />
          ) : (
            <UnlockIcon />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="size-8 hover:bg-muted"
          onClick={() => onToggleVisibility(section)}
          aria-label={section.visible ? t("sectionList.hideSection", "Hide section") : t("sectionList.showSection", "Show section")}
          title={section.visible ? t("sectionList.hideSection", "Hide") : t("sectionList.showSection", "Show")}
        >
          {section.visible ? (
            <EyeIcon />
          ) : (
            <EyeOffIcon />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="size-8 hover:bg-muted"
          onClick={() => onEdit(section)}
          aria-label={t("sectionList.editSection", "Edit section")}
          title={t("sectionList.editSection", "Edit")}
        >
          <EditIcon />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(section)}
          aria-label={t("sectionList.deleteSection", "Delete section")}
          title={t("sectionList.deleteSection", "Delete")}
          disabled={section.locked}
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function UnlockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
