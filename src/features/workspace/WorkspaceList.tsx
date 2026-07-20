"use client";

import * as React from "react";
import { workspaceStore, type Workspace } from "./workspace.store";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Minimal Dialog fallback; create inline if Dialog component doesn't exist
interface SimpleModalProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
}
function SimpleModal({ open, onClose, children, title }: SimpleModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-popover p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function WorkspaceList() {
  const [items, setItems] = React.useState<Workspace[]>(() => {
    try { return workspaceStore.getAll(); } catch { return []; }
  });
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 6;

  const [creating, setCreating] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({ name: "", description: "" });

  React.useEffect(() => {
    setItems(workspaceStore.getAll());
  }, []);

  const filtered = items.filter((w) => w.name.toLowerCase().includes(query.toLowerCase()) || (w.description ?? "").toLowerCase().includes(query.toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => { setForm({ name: "", description: "" }); setCreating(true); };
  const openEdit = (id: string) => { const ws = workspaceStore.get(id); if (!ws) return; setEditingId(id); setForm({ name: ws.name, description: ws.description ?? "" }); };

  const handleCreate = () => {
    if (!form.name.trim()) return toast.error("Please provide a workspace name");
    workspaceStore.create({ name: form.name.trim(), description: form.description.trim(), owner: "You" });
    setItems(workspaceStore.getAll());
    setCreating(false);
    toast.success("Workspace created");
  };

  const handleUpdate = () => {
    if (!editingId) return;
    workspaceStore.update(editingId, { name: form.name.trim(), description: form.description.trim() });
    setItems(workspaceStore.getAll());
    setEditingId(null);
    toast.success("Workspace updated");
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this workspace? This action cannot be undone.")) return;
    workspaceStore.delete(id);
    setItems(workspaceStore.getAll());
    toast.success("Workspace deleted");
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Input placeholder="Search workspaces" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
        <Button onClick={openCreate}>New Workspace</Button>
        <a href="/workspace" className="ml-auto text-sm text-muted-foreground">Manage workspaces</a>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {paged.length ? paged.map((w) => <WorkspaceCard key={w.id} ws={w} onDelete={handleDelete} onEdit={openEdit} />) : (
          <div className="py-12 text-center text-muted-foreground">No workspaces found</div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Page {page} / {pages}</div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <Button variant="ghost" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>Next</Button>
        </div>
      </div>

      <SimpleModal open={creating} onClose={() => setCreating(false)} title="Create Workspace">
        <div className="space-y-3">
          <div>
            <label className="block text-sm">Name</label>
            <input className="w-full rounded border p-2" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm">Description</label>
            <textarea className="w-full rounded border p-2" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </SimpleModal>

      <SimpleModal open={!!editingId} onClose={() => setEditingId(null)} title="Edit Workspace">
        <div className="space-y-3">
          <div>
            <label className="block text-sm">Name</label>
            <input className="w-full rounded border p-2" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm">Description</label>
            <textarea className="w-full rounded border p-2" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
            <Button onClick={handleUpdate}>Save</Button>
          </div>
        </div>
      </SimpleModal>
    </>
  );
}
