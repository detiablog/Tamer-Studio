"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import type { ProductionJob } from "@/features/production/production.store";

const statusTone: Record<string, "success" | "warning" | "info" | "muted"> = {
  Completed: "success",
  Running: "info",
  Queued: "muted",
  Preparing: "info",
  Waiting: "warning",
  Failed: "warning",
  Cancelled: "muted",
  Draft: "muted",
};

export function ProductionCard({
  job,
  onRetry,
  onCancel,
  onDuplicate,
}: {
  job: ProductionJob;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge tone={statusTone[job.status] ?? "muted"}>{job.status}</Badge>
            <Badge tone="info">{job.workflowType}</Badge>
          </div>
          <CardTitle>{job.name}</CardTitle>
          <CardDescription>{job.workflowName}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Project</div>
          <div className="font-medium">{job.project}</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Workspace</div>
          <div className="font-medium">{job.workspace}</div>
        </div>
        <div className="rounded-full bg-muted/60 h-2 overflow-hidden">
          <div className="h-2 rounded-full bg-primary" style={{ width: `${job.progress}%` }} />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{job.currentStep}</span>
          <span>{job.progress}%</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Link href={`/production/${job.id}`} className="flex-1">
          <Button variant="outline" className="w-full">Details</Button>
        </Link>
        {job.status === "Failed" ? (
          <Button size="sm" onClick={() => onRetry?.(job.id)}>Retry</Button>
        ) : null}
        {job.status !== "Completed" && job.status !== "Cancelled" ? (
          <Button size="sm" variant="destructive" onClick={() => onCancel?.(job.id)}>Cancel</Button>
        ) : null}
        <Button size="sm" variant="ghost" onClick={() => onDuplicate?.(job.id)}>Duplicate</Button>
      </CardFooter>
    </Card>
  );
}
