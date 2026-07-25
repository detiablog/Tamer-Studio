"use client";

import * as React from "react";
import Link from "next/link";
import { Calculator } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface Action {
  key: string;
  label?: string;
  credits: number;
}

export function CreditCalculator({ section }: SectionRendererProps) {
  const { t } = useLocalizationContext();

  const heading = (section.config.heading as string) || section.title || t("marketing.creditCalculatorTitle");
  const description = (section.config.description as string) || section.description || t("marketing.creditCalculatorDescription");
  const actions = (section.config.actions as Action[]) || [];

  const [values, setValues] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(actions.map((a) => [a.key, 0]))
  );
  const [calculated, setCalculated] = React.useState(false);

  const totalCredits = actions.reduce(
    (sum, action) => sum + (values[action.key] ?? 0) * action.credits,
    0
  );

  let recommended = "Free or Starter";
  if (totalCredits > 100000) {
    recommended = "Business or Enterprise";
  } else if (totalCredits > 25000) {
    recommended = "Pro or Business";
  } else if (totalCredits > 5000) {
    recommended = "Starter or Pro";
  }

  const set = (key: string, value: number) => {
    setValues((prev) => ({ ...prev, [key]: Math.max(0, value) }));
    setCalculated(false);
  };

  const handleCalculate = () => {
    setCalculated(true);
  };

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Calculator className="size-5 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {actions.map((action) => (
            <div
              key={action.key}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex-1">
                <label className="text-sm font-medium">
                  {action.label || t(`marketing.${action.key}`)}
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  {action.credits} {t("marketing.credits")} /{" "}
                  {t("marketing.creditCalculatorActions").toLowerCase()}
                </p>
              </div>
              <input
                type="number"
                min="0"
                value={values[action.key] || ""}
                onChange={(e) =>
                  set(action.key, parseInt(e.target.value || "0", 10))
                }
                className={cn(
                  "w-24 rounded-lg border border-border bg-background px-3 py-2 text-right text-sm",
                  "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                )}
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleCalculate}
            className="inline-flex items-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            {t("marketing.creditCalculatorCalculate")}
          </button>
        </div>

        {calculated && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("marketing.creditCalculatorEstimate")}
                </p>
                <p className="text-2xl font-semibold">{recommended}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {t("marketing.creditCalculatorUsage")}
                </p>
                <p className="text-2xl font-semibold">
                  {totalCredits.toLocaleString("en-US")} {t("marketing.credits")}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
              >
                {t("marketing.buyNow")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
