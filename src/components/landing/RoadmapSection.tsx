"use client";

import * as React from "react";
import { CheckCircle, Clock, Circle } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface RoadmapItem {
  title: string;
  description?: string;
  status?: "completed" | "in-progress" | "upcoming";
}

const statusConfig = {
  completed: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
  "in-progress": { icon: Clock, color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  upcoming: { icon: Circle, color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
};

export function RoadmapSection({ section }: SectionRendererProps) {
  const { resolve } = useLocalizationContext();
  const config = section.config as Record<string, unknown> | undefined;

  const title = resolve(config?.title as string) || section.title;
  const description = resolve(config?.description as string) || section.description;
  const items = (config?.items as RoadmapItem[]) || [];

  return (
    <section className="border-t border-border" aria-labelledby="roadmap-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center">
          {title && (
            <h2 id="roadmap-heading" className="text-3xl sm:text-4xl font-bold tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-3 text-muted-foreground">{description}</p>
          )}
        </div>

        {items.length > 0 ? (
          <div className="mt-12 relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" aria-hidden="true" />
            <div className="space-y-8">
              {items.map((item, idx) => {
                const status = item.status || "upcoming";
                const cfg = statusConfig[status];
                const Icon = cfg.icon;
                const isEven = idx % 2 === 0;

                return (
                  <div
                    key={`${item.title}-${idx}`}
                    className={`relative flex items-start gap-4 sm:gap-0 ${
                      isEven ? "sm:flex-row" : "sm:flex-row-reverse"
                    }`}
                  >
                    <div className="hidden sm:block sm:w-1/2" />
                    <div className="relative z-10 flex items-center justify-center">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${cfg.bg} border ${cfg.border}`}>
                        <Icon className={`size-4 ${cfg.color}`} />
                      </div>
                    </div>
                    <div className={`sm:w-1/2 ${isEven ? "sm:pl-8" : "sm:pr-8"}`}>
                      <div className={`rounded-xl border ${cfg.border} bg-card p-5`}>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium uppercase tracking-wider ${cfg.color}`}>
                            {status.replace("-", " ")}
                          </span>
                        </div>
                        <h3 className="mt-2 font-semibold text-foreground">{item.title}</h3>
                        {item.description && (
                          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="mt-12 text-center text-muted-foreground text-sm">
            No roadmap items configured yet.
          </p>
        )}
      </div>
    </section>
  );
}
