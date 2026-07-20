import * as React from "react";

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border bg-muted/20 p-6 text-center">
      <div>
        <h4 className="text-lg font-semibold">{title}</h4>
        {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
      </div>
    </div>
  );
}
