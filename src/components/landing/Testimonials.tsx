"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export function Testimonials({ section }: SectionRendererProps) {
  const { t } = useLocalizationContext();

  const heading = (section.config.heading as string) || section.title || t("marketing.testimonialsTitle");
  const description = (section.config.description as string) || section.description || "";
  const testimonials = (section.config.testimonials as Testimonial[]) || [];

  return (
    <section className="border-t border-border" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="testimonials-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={String(testimonial.author || '') + index}
              className="rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/10"
            >
              <blockquote className="text-sm text-muted-foreground leading-6">
                "{testimonial.quote}"
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60 text-sm font-semibold text-foreground">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
