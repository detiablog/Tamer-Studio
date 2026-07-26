"use client";

import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQ({ section }: SectionRendererProps) {
  const { t } = useLocalizationContext();
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const heading = (section.config.heading as string) || section.title || t("marketing.faqTitle");
  const description = (section.config.description as string) || section.description || t("marketing.faqDescription");
  const items = (section.config.items as FAQItem[]) || [];

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="border-t border-border" id="faq" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center">
          <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 space-y-3">
            {[
              { q: "marketing.faqBillingQuestion", aKey: "marketing.faqBillingAnswer" },
              { q: "marketing.faqCreditsQuestion", aKey: "marketing.faqCreditsAnswer" },
              { q: "marketing.faqAIModelsQuestion", aKey: "marketing.faqAIModelsAnswer" },
              { q: "marketing.faqPrivacyQuestion", aKey: "marketing.faqPrivacyAnswer" },
              { q: "marketing.faqSecurityQuestion", aKey: "marketing.faqSecurityAnswer" },
              { q: "marketing.faqSubscriptionsQuestion", aKey: "marketing.faqSubscriptionsAnswer" },
            ].map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.q + idx}
                  className="rounded-2xl border border-border bg-card transition hover:border-foreground/10"
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-medium">{t(item.q)}</span>
                    <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/60 text-foreground transition-transform">
                      {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                    </span>
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="px-6 pb-4">
                      <p className="text-sm text-muted-foreground leading-6">{t(item.aKey)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 space-y-3">
            {items.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={String(item.question || '') + index}
                  className="rounded-2xl border border-border bg-card transition hover:border-foreground/10"
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="flex w-full items-center justify-between px-6 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-medium">{item.question}</span>
                    <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/60 text-foreground transition-transform">
                      {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                    </span>
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-in-out",
                      isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="px-6 pb-4">
                      <p className="text-sm text-muted-foreground leading-6">{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
