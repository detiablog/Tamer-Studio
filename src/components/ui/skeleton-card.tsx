import { cn } from "@/lib/utils";

function SkeletonCard({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("rounded-xl border p-6 space-y-4", className)}>
      <div className="h-4 w-1/3 rounded-md bg-muted animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className={cn("h-3 rounded-md bg-muted animate-pulse", i === lines - 1 ? "w-2/3" : "w-full")} />
        ))}
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border overflow-hidden">
      <div className="h-10 bg-muted/50 border-b flex items-center px-4 gap-4">
        {Array.from({ length: cols }).map((_, i) => <div key={i} className="h-3 flex-1 rounded bg-muted animate-pulse" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="h-12 border-b last:border-0 flex items-center px-4 gap-4">
          {Array.from({ length: cols }).map((_, c) => <div key={c} className="h-3 flex-1 rounded bg-muted/60 animate-pulse" />)}
        </div>
      ))}
    </div>
  );
}

function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border p-6 space-y-2">
          <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          <div className="h-8 w-1/3 rounded bg-muted animate-pulse" />
          <div className="h-2 w-1/4 rounded bg-muted/60 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export { SkeletonCard, SkeletonTable, SkeletonStatCards };
