import * as React from "react";

export function Skeleton({
  className = "h-4 w-full rounded-md bg-muted/40",
}: {
  className?: string;
}) {
  return <div className={className} aria-hidden />;
}
