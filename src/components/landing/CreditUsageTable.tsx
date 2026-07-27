"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface Row {
  action: string;
  model: string;
  credits: number | string;
  note: string;
}

export function CreditUsageTable({ section }: SectionRendererProps) {
  const { t, resolve } = useLocalizationContext();

  const heading = resolve(section.config.heading as string) || section.title || t("marketing.creditUsageTitle");
  const description = resolve(section.config.description as string) || section.description || t("marketing.creditUsageDescription");
  const rows = (section.config.rows as Row[]) || [];

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-border">
          <table className={cn("w-full text-left text-sm")}>
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">{t("marketing.creditUsageAction")}</th>
                <th className="px-6 py-4 font-medium">{t("marketing.creditUsageModel")}</th>
                <th className="px-6 py-4 font-medium">{t("marketing.creditUsageCost")}</th>
                <th className="px-6 py-4 font-medium">{t("marketing.creditUsageNotes")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, idx) => (
                <tr
                  key={String(row.action || '') + idx}
                  className="transition hover:bg-muted/30"
                >
                  <td className="px-6 py-3">{row.action}</td>
                  <td className="px-6 py-3 text-muted-foreground">{row.model}</td>
                  <td className="px-6 py-3">{row.credits}</td>
                  <td className="px-6 py-3 text-muted-foreground">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
