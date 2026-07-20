"use client";

import * as React from "react";
import Link from "next/link";
import { projectStore, type Project, type ProjectStatus } from "./project.store";
import { ProjectCard } from "@/components/project/ProjectCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

export function ProjectList() {
  const [items, setItems] = React.useState<Project[]>(() => projectStore.getAll());
  const [view, setView] = React.useState<"grid" | "table">("grid");
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<ProjectStatus | "All">("All");
  const [page, setPage] = React.useState(1);
  const pageSize = 9;

  React.useEffect(() => { setItems(projectStore.getAll()); }, []);

  const statusOptions: (ProjectStatus | "All")[] = ["All","Draft","Planning","In Production","Review","Published","Archived"];

  const filtered = items.filter(p => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !(p.tags || []).some(t=>t.toLowerCase().includes(query.toLowerCase()))) return false;
    return true;
  });

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page-1)*pageSize, page*pageSize);

  const openCreate = () => {
    const name = prompt("Project name");
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    projectStore.create({ name, slug, description: "", status: "Draft", owner: "You", tags: [] });
    setItems(projectStore.getAll());
    toast.success("Project created");
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete project?")) return;
    projectStore.delete(id);
    setItems(projectStore.getAll());
    toast.success("Project deleted");
  };

  const handleDuplicate = (id: string) => {
    projectStore.duplicate(id);
    setItems(projectStore.getAll());
    toast.success("Project duplicated");
  };

  const handleToggleFav = (id: string) => {
    projectStore.toggleFavorite(id);
    setItems(projectStore.getAll());
  };

  const handleArchive = (id: string) => {
    projectStore.archive(id);
    setItems(projectStore.getAll());
    toast.success("Project archived");
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Input placeholder="Search projects or tags" value={query} onChange={(e)=>{ setQuery(e.target.value); setPage(1); }} aria-label="Search projects or tags" />
        <select value={statusFilter} onChange={(e)=>{ setStatusFilter(e.target.value as unknown as ProjectStatus | "All"); setPage(1); }} className="rounded border p-2 bg-input">
          {statusOptions.map(s=> <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" onClick={()=>setView(v=> v==="grid"?"table":"grid")}>{view === "grid" ? "Table" : "Grid"}</Button>
          <Button onClick={openCreate}>New Project</Button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paged.map(p=> <ProjectCard key={p.id} p={p} onDelete={handleDelete} onDuplicate={handleDuplicate} onToggleFav={handleToggleFav} onArchive={handleArchive} onEdit={()=>{ const name = prompt("Rename project", p.name); if (name) { projectStore.update(p.id, { name }); setItems(projectStore.getAll()); } }} />)}
        </div>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="w-full text-left">
            <thead className="bg-muted"><tr><th className="p-3">Name</th><th className="p-3">Status</th><th className="p-3">Tags</th><th className="p-3">Owner</th><th className="p-3">Actions</th></tr></thead>
            <tbody>
              {paged.map(p=> (
                <tr key={p.id} className="border-t">
                  <td className="p-3"><Link href={`/projects/${p.id}`}><strong>{p.name}</strong></Link><div className="text-sm text-muted-foreground">{p.description}</div></td>
                  <td className="p-3"><Badge tone={p.status === "Published" ? "success" : p.status === "In Production" ? "warning" : "muted"}>{p.status}</Badge></td>
                  <td className="p-3">{p.tags?.slice(0,3).map(t=> <span key={t} className="text-sm text-muted-foreground">#{t} </span>)}</td>
                  <td className="p-3">{p.owner}</td>
                  <td className="p-3 flex gap-2"><Button size="sm" variant="outline" onClick={()=>{ projectStore.duplicate(p.id); setItems(projectStore.getAll()); }}>Duplicate</Button><Button size="sm" variant="destructive" onClick={()=>handleDelete(p.id)}>Delete</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Page {page} / {pages}</div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>Prev</Button>
          <Button variant="ghost" onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages}>Next</Button>
        </div>
      </div>
    </div>
  );
}
