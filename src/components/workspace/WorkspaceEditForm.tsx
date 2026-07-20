"use client";

import * as React from "react";
import { workspaceStore } from "@/features/workspace/workspace.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function WorkspaceEditForm({ id }: { id: string }) {
  const ws = workspaceStore.get(id);
  const router = useRouter();
  const [name, setName] = React.useState(ws?.name ?? "");
  const [description, setDescription] = React.useState(ws?.description ?? "");

  if (!ws) {
    return (
      <div className="rounded-3xl border border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
        Workspace not found.
      </div>
    );
  }

  const handleSave = () => {
    if (!name.trim()) return;
    workspaceStore.update(ws.id, { name: name.trim(), description: description.trim() });
    router.push(`/workspace/${ws.id}`);
  };

  return (
    <div className="max-w-xl space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave}>Save changes</Button>
        <Button variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}
