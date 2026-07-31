"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface PartnerLogo {
  url: string;
  alt: string;
}

export function PartnerLogos({ section }: SectionRendererProps) {
  const { resolve } = useLocalizationContext();
  const config = section.config as Record<string, unknown> | undefined;

  const title = resolve(config?.title as string) || section.title;
  const description = resolve(config?.description as string) || section.description;
  const logos = (config?.logos as PartnerLogo[]) || [];

  return (
    <section className="border-t border-border" aria-labelledby="partners-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        {title && (
          <h2 id="partners-heading" className="text-center text-3xl sm:text-4xl font-bold tracking-tight">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-3 text-center text-muted-foreground">{description}</p>
        )}

        {logos.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center">
            {logos.map((logo, idx) => (
              <div
                key={`${logo.alt}-${idx}`}
                className="flex items-center justify-center h-16 w-full opacity-60 hover:opacity-100 transition grayscale hover:grayscale-0"
              >
                <img
                  src={logo.url}
                  alt={logo.alt}
                  className="max-h-12 max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : section.media && section.media.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 items-center justify-items-center">
            {section.media.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-center h-16 w-full opacity-60 hover:opacity-100 transition grayscale hover:grayscale-0"
              >
                <img
                  src={m.url}
                  alt=""
                  className="max-h-12 max-w-full object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-muted-foreground text-sm">
            No partner logos configured yet.
          </p>
        )}
      </div>
    </section>
  );
}
