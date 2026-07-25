"use client";

import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";

interface FAQItem {
  categoryKey: string;
  questionKey: string;
  answerKey: string;
}

const faqItems: FAQItem[] = [
  { categoryKey: "marketing.faqBilling", questionKey: "marketing.faqBillingQuestion", answerKey: "marketing.faqBillingAnswer" },
  { categoryKey: "marketing.faqCredits", questionKey: "marketing.faqCreditsQuestion", answerKey: "marketing.faqCreditsAnswer" },
  { categoryKey: "marketing.faqAIModels", questionKey: "marketing.faqAIModelsQuestion", answerKey: "marketing.faqAIModelsAnswer" },
  { categoryKey: "marketing.faqPrivacy", questionKey: "marketing.faqPrivacyQuestion", answerKey: "marketing.faqPrivacyAnswer" },
  { categoryKey: "marketing.faqSecurity", questionKey: "marketing.faqSecurityQuestion", answerKey: "marketing.faqSecurityAnswer" },
  { categoryKey: "marketing.faqSubscriptions", questionKey: "marketing.faqSubscriptionsQuestion", answerKey: "marketing.faqSubscriptionsAnswer" },
];

export function FAQ() {
  const { t } = useLocalizationContext();
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="border-t border-border" id="faq" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center">
          <h2 id="faq-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("marketing.faqTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("marketing.faqDescription")}</p>
        </div>

        <div className="mt-10 space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.questionKey}
                className="rounded-2xl border border-border bg-card transition hover:border-foreground/10"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium">{t(item.questionKey)}</span>
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
                    <p className="text-sm text-muted-foreground leading-6">{t(item.answerKey)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
