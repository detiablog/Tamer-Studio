"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/features/project/project.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";

type ProjectCardProps = {
  p: Project;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onToggleFav?: (id: string) => void;
  onArchive?: (id: string) => void;
};

export function ProjectCard({ p, onDelete, onEdit, onDuplicate: _onDuplicate, onToggleFav: _onToggleFav, onArchive: _onArchive }: ProjectCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="h-40 bg-muted flex items-center justify-center">{p.thumbnail ? <Image src={p.thumbnail} alt={p.name} width={1200} height={320} className="object-cover w-full h-40" /> : <div className="text-xl">{p.name.charAt(0)}</div>}</div>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="text-sm text-muted-foreground">{p.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge tone={p.status === "Published" ? "success" : p.status === "In Production" ? "warning" : "muted"}>{p.status}</Badge>

              {p.tags?.slice(0,3).map(t => <span key={t} className="text-xs text-muted-foreground">#{t}</span>)}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link href={`/projects/${p.id}`}>
              <Button variant="ghost">Open</Button>
            </Link>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => onEdit?.(p.id)}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => onDelete?.(p.id)}>Delete</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

