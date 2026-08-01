"use client";

import * as React from "react";
import useSWR from "swr";
import { useRouter, useParams } from "next/navigation";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArrowLeft, Loader, Settings, Image as ImageIcon, Video, GitBranch, Share2, FileText, Clock, Activity, Edit, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLocalizationContext } from "@/providers/localization";

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`API error: ${r.status}`);
      return r.json();
    })
    .catch((error) => {
      throw error;
    });

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  tags: string[];
  description: string;
  color: string;
  creditsUsed: number;
  storageUsed: number;
  createdAt: string;
  updatedAt: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

type TabKey = "overview" | "assets" | "images" | "videos" | "workflows" | "publishing" | "notes" | "timeline" | "activity" | "settings";

const TABS: { key: TabKey; icon: React.ReactNode }[] = [
  { key: "overview", icon: <FileText className="size-4" /> },
  { key: "assets", icon: <FileText className="size-4" /> },
  { key: "images", icon: <ImageIcon className="size-4" /> },
  { key: "videos", icon: <Video className="size-4" /> },
  { key: "workflows", icon: <GitBranch className="size-4" /> },
  { key: "publishing", icon: <Share2 className="size-4" /> },
  { key: "notes", icon: <FileText className="size-4" /> },
  { key: "timeline", icon: <Clock className="size-4" /> },
  { key: "activity", icon: <Activity className="size-4" /> },
  { key: "settings", icon: <Settings className="size-4" /> },
];

const STATUS_COLORS: Record<string, "success" | "warning" | "muted" | "info"> = {
  active: "success",
  draft: "muted",
  in_progress: "warning",
  completed: "info",
};

const PROJECT_TYPES = ["Content", "Marketing", "Production", "Research", "Design", "Video"];

export function ProjectDetailPageClient() {
  const { t } = useLocalizationContext();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data, error, isLoading, mutate } = useSWR(id ? `/api/projects/${id}` : null, fetcher);
  const { data: notesData, mutate: mutateNotes } = useSWR(id ? `/api/projects/${id}/notes` : null, fetcher);

  const [activeTab, setActiveTab] = React.useState<TabKey>("overview");
  const [editingSettings, setEditingSettings] = React.useState(false);
  const [settingsForm, setSettingsForm] = React.useState({ name: "", description: "", type: "", tags: "", color: "" });
  const [noteTitle, setNoteTitle] = React.useState("");
  const [noteContent, setNoteContent] = React.useState("");
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);

  const project = data?.data as Project | undefined;
  const notes = (notesData?.data ?? []) as Note[];

  React.useEffect(() => {
    if (project) {
      setSettingsForm({
        name: project.name || "",
        description: project.description || "",
        type: project.type || "",
        tags: (project.tags || []).join(", "),
        color: project.color || "",
      });
    }
  }, [project]);

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: settingsForm.name,
          description: settingsForm.description,
          type: settingsForm.type,
          tags: settingsForm.tags.split(",").map((s) => s.trim()).filter(Boolean),
          color: settingsForm.color,
        }),
      });
      if (!response.ok) {
        toast.error(t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("common.success", "Success"));
      setEditingSettings(false);
      mutate();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleCreateNote = async () => {
    if (!noteTitle.trim()) return;
    try {
      const response = await fetch(`/api/projects/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: noteTitle, content: noteContent }),
      });
      if (!response.ok) {
        toast.error(t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("common.success", "Success"));
      setNoteTitle("");
      setNoteContent("");
      mutateNotes();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/projects/${id}/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: noteTitle, content: noteContent }),
      });
      if (!response.ok) {
        toast.error(t("common.genericError", "Something went wrong"));
        return;
      }
      toast.success(t("common.success", "Success"));
      setEditingNoteId(null);
      setNoteTitle("");
      setNoteContent("");
      mutateNotes();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await fetch(`/api/projects/${id}/notes/${noteId}`, { method: "DELETE" });
      toast.success(t("common.success", "Success"));
      mutateNotes();
    } catch {
      toast.error(t("common.genericError", "Something went wrong"));
    }
  };

  const renderTabContent = () => {
    if (activeTab === "overview") {
      return (
        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardCard title={t("projectStudio.overview", "Overview")}>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">{t("projectStudio.projectName", "Project Name")}</label>
                <p className="text-sm font-medium">{project?.name}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t("projectStudio.projectType", "Project Type")}</label>
                <p className="text-sm font-medium">{project?.type}</p>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t("projectStudio.projectStatus", "Status")}</label>
                <Badge tone={STATUS_COLORS[project?.status || ""] || "muted"}>{project?.status}</Badge>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t("projectStudio.projectDescription", "Description")}</label>
                <p className="text-sm">{project?.description || "—"}</p>
              </div>
            </div>
          </DashboardCard>
          <div className="space-y-6">
            <DashboardCard title={t("projectStudio.creditsUsed", "Credits Used")}>
              <p className="text-2xl font-semibold">{project?.creditsUsed || 0}</p>
              <p className="text-xs text-muted-foreground">{t("projectStudio.creditsUsed", "Credits Used")}</p>
            </DashboardCard>
            <DashboardCard title={t("projectStudio.storageUsed", "Storage Used")}>
              <p className="text-2xl font-semibold">{project?.storageUsed || 0} MB</p>
              <p className="text-xs text-muted-foreground">{t("projectStudio.storageUsed", "Storage Used")}</p>
            </DashboardCard>
          </div>
        </div>
      );
    }

    if (activeTab === "settings") {
      return (
        <DashboardCard title={t("projectStudio.settings", "Settings")}>
          <div className="space-y-4 max-w-lg">
            <div>
              <label className="text-sm font-medium mb-1 block">{t("projectStudio.projectName", "Project Name")}</label>
              <Input value={settingsForm.name} onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} disabled={!editingSettings} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("projectStudio.projectDescription", "Description")}</label>
              <Input value={settingsForm.description} onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })} disabled={!editingSettings} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("projectStudio.projectType", "Project Type")}</label>
              <select value={settingsForm.type} onChange={(e) => setSettingsForm({ ...settingsForm, type: e.target.value })} disabled={!editingSettings} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t("projectStudio.projectTags", "Tags")}</label>
              <Input value={settingsForm.tags} onChange={(e) => setSettingsForm({ ...settingsForm, tags: e.target.value })} disabled={!editingSettings} placeholder="tag1, tag2, tag3" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Color</label>
              <Input type="color" value={settingsForm.color || "#3b82f6"} onChange={(e) => setSettingsForm({ ...settingsForm, color: e.target.value })} disabled={!editingSettings} className="h-10 w-20 p-1" />
            </div>
            <div className="flex gap-2">
              {editingSettings ? (
                <>
                  <Button variant="outline" onClick={() => setEditingSettings(false)}>{t("common.cancel", "Cancel")}</Button>
                  <Button onClick={handleSaveSettings}><Save className="mr-2 size-4" />{t("projectStudio.save", "Save")}</Button>
                </>
              ) : (
                <Button onClick={() => setEditingSettings(true)}><Edit className="mr-2 size-4" />{t("projectStudio.editProject", "Edit Project")}</Button>
              )}
            </div>
          </div>
        </DashboardCard>
      );
    }

    if (activeTab === "notes") {
      return (
        <div className="space-y-6">
          <DashboardCard title={t("projectStudio.addNote", "Add Note")}>
            <div className="space-y-3">
              <Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder={t("projectStudio.noteTitle", "Note Title")} />
              <Input value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder={t("projectStudio.noteContent", "Content")} />
              <Button size="sm" onClick={editingNoteId ? () => handleUpdateNote(editingNoteId) : handleCreateNote}>
                {editingNoteId ? t("projectStudio.save", "Save") : t("projectStudio.addNote", "Add Note")}
              </Button>
            </div>
          </DashboardCard>
          <DashboardCard title={t("projectStudio.notes", "Notes")}>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">{t("projectStudio.noNotes", "No notes yet")}</p>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{note.title}</p>
                        <p className="text-xs text-muted-foreground">{note.content}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => { setEditingNoteId(note.id); setNoteTitle(note.title); setNoteContent(note.content); }}>
                          <Edit className="size-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => handleDeleteNote(note.id)}>
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(note.updatedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      );
    }

    if (activeTab === "timeline") {
      return (
        <DashboardCard title={t("projectStudio.timeline", "Timeline")}>
          <p className="text-sm text-muted-foreground text-center py-6">{t("projectStudio.noTimeline", "No timeline events")}</p>
        </DashboardCard>
      );
    }

    if (activeTab === "activity") {
      return (
        <DashboardCard title={t("projectStudio.activity", "Activity")}>
          <p className="text-sm text-muted-foreground text-center py-6">{t("projectStudio.noActivity", "No recent activity")}</p>
        </DashboardCard>
      );
    }

    const tabTitles: Record<string, string> = {
      assets: t("projectStudio.assets", "Assets"),
      images: t("projectStudio.images", "Images"),
      videos: t("projectStudio.videos", "Videos"),
      workflows: t("projectStudio.workflows", "Workflows"),
      publishing: t("projectStudio.publishing", "Publishing"),
    };

    return (
      <DashboardCard title={tabTitles[activeTab] || activeTab}>
        <p className="text-sm text-muted-foreground text-center py-6">{t("common.noData", "No data available")}</p>
      </DashboardCard>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="size-6 animate-spin text-muted-foreground" />
        <p className="ml-2 text-muted-foreground">{t("common.loading", "Loading...")}</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        {t("projects.detailComingSoon", "Project detail coming soon.")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push("/projects" as any)}>
          <ArrowLeft className="mr-2 size-4" />
          {t("common.back", "Back")}
        </Button>
        <PageHeader
          title={project.name}
          description={project.description || project.type}
          actions={
            <Badge tone={STATUS_COLORS[project.status] || "muted"}>{project.status}</Badge>
          }
        />
      </div>

      <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.key ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {t(`projectStudio.${tab.key}`, tab.key.charAt(0).toUpperCase() + tab.key.slice(1))}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
}