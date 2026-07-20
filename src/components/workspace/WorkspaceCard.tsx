"use client";

import * as React from "react";
import Link from "next/link";
import type { Workspace } from "@/features/workspace/workspace.store";
import { Button } from "@/components/ui/button";

export function WorkspaceCard({ ws, onDelete, onEdit }: { ws: Workspace; onDelete?: (id: string) => void; onEdit?: (id: string) => void }) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">{ws.avatar ?? ws.name.split(" ").map((s) => s[0]).join("").slice(0,2)}</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{ws.name}</h3>
          <p className="text-sm text-muted-foreground">{ws.description}</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{(ws.members?.length ?? 0)} members</span>
            <span>-</span>
            <span>Owner: {ws.owner ?? "-"}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link href={`/workspace/${ws.id}`} className="text-sm">
            <Button variant="ghost">Open</Button>
          </Link>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit?.(ws.id)}>Edit</Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete?.(ws.id)}>Delete</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
