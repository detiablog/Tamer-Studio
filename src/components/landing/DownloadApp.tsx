"use client";

import * as React from "react";
import { Download, QrCode } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface StoreBadge {
  label: string;
  url: string;
  image: string;
}

export function DownloadApp({ section }: SectionRendererProps) {
  const { resolve } = useLocalizationContext();
  const config = section.config as Record<string, unknown> | undefined;

  const title = resolve(config?.title as string) || section.title;
  const description = resolve(config?.description as string) || section.description;
  const badges = (config?.badges as StoreBadge[]) || [];
  const qrCode = (config?.qrCode as string) || "";
  const qrLabel = resolve(config?.qrLabel as string) || "Scan to download";

  return (
    <section className="border-t border-border" aria-labelledby="download-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
              <Download className="size-6 text-primary" />
            </div>
            {title && (
              <h2 id="download-heading" className="text-3xl sm:text-4xl font-bold tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-3 text-muted-foreground max-w-lg mx-auto lg:mx-0">{description}</p>
            )}
            {badges.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                {badges.map((badge, idx) => (
                  <a
                    key={`${badge.label}-${idx}`}
                    href={badge.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:border-foreground/20 hover:bg-muted"
                  >
                    {badge.image ? (
                      <img src={badge.image} alt={badge.label} className="h-5 w-auto" />
                    ) : (
                      <span>{badge.label}</span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {qrCode && (
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="rounded-2xl border border-border bg-card p-4">
                <img src={qrCode} alt="QR Code" className="h-40 w-40 object-contain" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <QrCode className="size-3.5" />
                <span>{qrLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
