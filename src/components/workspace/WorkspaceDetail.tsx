"use client";

import * as React from "react";
import { workspaceStore } from "@/features/workspace/workspace.store";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function WorkspaceDetail({ id }: { id: string }) {
  const [ws] = React.useState(() => workspaceStore.get(id));
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("Delete workspace?")) return;
    workspaceStore.delete(id);
    // navigate back
    router.push("/workspace");
  };

  if (!ws) return <div className="p-6">Workspace not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-xl font-semibold">{ws.avatar ?? ws.name.split(" ").map(s=>s[0]).join("").slice(0,2)}</div>
        <div>
          <h2 className="text-2xl font-bold">{ws.name}</h2>
          <p className="text-sm text-muted-foreground">{ws.description}</p>
          <div className="text-sm text-muted-foreground mt-2">Owner: {ws.owner ?? "—"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <section className="border rounded-lg p-4 bg-card">
            <h3 className="font-semibold">Members</h3>
            <div className="mt-3 space-y-2">
              {ws.members && ws.members.length ? ws.members.map(m => (
                <div key={m.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-sm text-muted-foreground">{m.role} • {m.email}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">Joined: {new Date().toLocaleDateString()}</div>
                </div>
              )) : (
                <div className="text-sm text-muted-foreground">No members yet</div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-3">
          <div className="border rounded-lg p-4 bg-card">
            <div className="text-sm text-muted-foreground">Created</div>
            <div className="font-medium">{new Date(ws.createdAt).toLocaleString()}</div>
          </div>

          <div className="border rounded-lg p-4 bg-card">
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="font-medium">{ws.status}</div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/workspace/${id}/edit`)}>Edit</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
