"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";

interface Testimonial {
  quoteKey: string;
  author: string;
  role: string;
  company: string;
}

const testimonials: Testimonial[] = [
  {
    quoteKey: "marketing.testimonialsDescription",
    author: "Sarah Chen",
    role: "Head of Content",
    company: "Studio North",
  },
  {
    quoteKey: "marketing.socialProofTitle",
    author: "Marcus Rivera",
    role: "Creative Director",
    company: "Atlas Agency",
  },
  {
    quoteKey: "marketing.faqDescription",
    author: "Aiko Tanaka",
    role: "CTO",
    company: "Pixel Foundry",
  },
];

export function Testimonials() {
  const { t } = useLocalizationContext();

  return (
    <section className="border-t border-border" id="testimonials" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="testimonials-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("marketing.testimonialsTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("marketing.testimonialsDescription")}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/10"
            >
              <blockquote className="text-sm text-muted-foreground leading-6">
                "{t(testimonial.quoteKey)}"
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
