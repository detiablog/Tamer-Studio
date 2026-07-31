"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

export function AnnouncementBar({ section }: SectionRendererProps) {
  const { resolve } = useLocalizationContext();
  const config = section.config as Record<string, unknown> | undefined;

  const title = resolve(config?.title as string) || section.title;
  const link = (config?.link as string) || "";
  const bgColor = (config?.bgColor as string) || "bg-primary/10";
  const textColor = (config?.textColor as string) || "text-primary";
  const defaultVisible = config?.visible !== false;

  const [visible, setVisible] = React.useState(defaultVisible);

  if (!visible || !title) return null;

  return (
    <div className={`${bgColor} ${textColor}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-2.5 flex items-center justify-center gap-2 text-sm font-medium">
        {link ? (
          <a href={link} className="hover:underline">
            {title}
          </a>
        ) : (
          <span>{title}</span>
        )}
        <button
          onClick={() => setVisible(false)}
          className="ml-2 rounded-full p-0.5 hover:bg-foreground/10 transition"
          aria-label="Dismiss"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
