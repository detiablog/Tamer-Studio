"use client";

import * as React from "react";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";

export default function SupportPage() {
  const { t } = useLocalizationContext();

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("marketing.supportTitle")}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("marketing.supportDescription")}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">{t("marketing.supportContactUs")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">support@tamer.studio</p>
            <p className="text-xs text-muted-foreground mt-1">{t("marketing.supportResponseTime")}: 24h</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">{t("marketing.supportFaq")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("marketing.supportFaqDesc", "Browse frequently asked questions about billing, credits, and AI models.")}</p>
            <Link href="/pricing" className="text-sm text-primary hover:underline mt-2 inline-block">{t("marketing.supportDocs")}</Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">{t("marketing.supportDocs")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("marketing.supportDocsDesc", "Guides for workspace setup, projects, AI providers, and publishing.")}</p>
            <Link href="/docs" className="text-sm text-primary hover:underline mt-2 inline-block">{t("marketing.menuDocumentation")}</Link>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">{t("marketing.supportCommunity")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("marketing.supportCommunityDesc", "Join the conversation, share workflows, and get help from other creators.")}</p>
            <div className="mt-2 text-sm text-primary">Discord</div>
          </div>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">{t("marketing.supportResponseTime")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("marketing.contactSupportHours")}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-semibold">{t("marketing.supportAvailability")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("marketing.supportAvailabilityDesc", "Support is available Monday to Friday, 9am to 6pm ICT. Enterprise plans receive priority support.")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
