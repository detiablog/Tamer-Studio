"use client";

import * as React from "react";
import { projectStore } from "@/features/project/project.store";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";

export function ProjectDetail({ id }: { id: string }) {
  const [p, setP] = React.useState(() => projectStore.get(id));

  if (!p) return <div className="p-6">Project not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 rounded bg-muted flex items-center justify-center text-2xl">{p.thumbnail ? <Image src={p.thumbnail} alt={p.name} width={320} height={320} className="object-cover w-full h-full" /> : p.name.charAt(0)}</div>
        <div>
          <h1 className="text-2xl font-bold">{p.name}</h1>
          <p className="text-sm text-muted-foreground">{p.description}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge tone={p.status === "Published" ? "success" : p.status === "In Production" ? "warning" : "muted"}>{p.status}</Badge>
            <div className="text-sm text-muted-foreground">Updated {new Date(p.updatedAt).toLocaleString()}</div>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={()=>{ projectStore.update(id, { favorite: !p.favorite }); setP(projectStore.get(id)); }}>Favorite</Button>
          <Button variant="destructive" onClick={()=>{ projectStore.archive(id); setP(projectStore.get(id)); }}>Archive</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="col-span-2 space-y-4">
          <div className="border rounded p-4 bg-card">
            <h3 className="font-semibold">Overview</h3>
            <p className="text-sm text-muted-foreground mt-2">This is a placeholder overview for the project. In future sprints this will surface assets, production jobs, publishing status and AI-driven summaries.</p>
          </div>

          <div className="border rounded p-4 bg-card">
            <h3 className="font-semibold">Activity Timeline</h3>
            <div className="text-sm text-muted-foreground mt-2">No recent activity.</div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="border rounded p-4 bg-card">
            <h4 className="font-semibold">Members</h4>
            <div className="text-sm text-muted-foreground mt-2">{p.members && p.members.length ? p.members.map(m => <div key={m.id}><div className="font-medium">{m.name}</div><div className="text-sm text-muted-foreground">{m.role}</div></div>) : <div>No members</div>}</div>
          </div>

          <div className="border rounded p-4 bg-card">
            <h4 className="font-semibold">Metadata</h4>
            <div className="text-sm text-muted-foreground mt-2">Created: {new Date(p.createdAt).toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Last activity: {p.lastActivity ?? "—"}</div>
            <div className="text-sm text-muted-foreground">Visibility: {p.visibility}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
