"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";

interface Row {
  actionKey: string;
  model: string;
  cost: number | string;
  note: string;
}

const rows: Row[] = [
  { actionKey: "creditUsageTextSmall", model: "GPT-4o", cost: 1, note: "Per message" },
  { actionKey: "creditUsageTextMedium", model: "GPT-4o", cost: 3, note: "Per generation" },
  { actionKey: "creditUsageImageStandard", model: "DALL-E 3", cost: 5, note: "Per image" },
  { actionKey: "creditUsageImageHD", model: "DALL-E 3", cost: 10, note: "Per image" },
  { actionKey: "creditUsageVideoShort", model: "Runway", cost: 50, note: "Per video" },
  { actionKey: "creditUsageVideoLong", model: "Runway", cost: 150, note: "Per video" },
  { actionKey: "creditUsageAudioTTS", model: "ElevenLabs", cost: 10, note: "Per minute" },
  { actionKey: "creditUsageAudioMusic", model: "MusicGen", cost: 15, note: "Per track" },
  { actionKey: "creditUsageCustom", model: "Any", cost: "Varies", note: "Per API call" },
  { actionKey: "creditUsageBatch", model: "Any", cost: "Varies", note: "Per batch" },
];

export function CreditUsageTable() {
  const { t } = useLocalizationContext();

  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("marketing.creditUsageTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("marketing.creditUsageDescription")}
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
              {rows.map((row) => (
                <tr
                  key={row.actionKey}
                  className="transition hover:bg-muted/30"
                >
                  <td className="px-6 py-3">{t(`marketing.${row.actionKey}`)}</td>
                  <td className="px-6 py-3 text-muted-foreground">{row.model}</td>
                  <td className="px-6 py-3">{row.cost}</td>
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
