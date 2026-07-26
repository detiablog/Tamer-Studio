"use client";

import * as React from "react";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";
import { useLandingData } from "@/hooks/use-landing-data";
import { cn } from "@/lib/utils";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

export function CampaignBanner({ section }: SectionRendererProps) {
  const { t } = useLocalizationContext();
  const { campaign } = useLandingData();
  const config = section.config as Record<string, unknown> | undefined;

  const heading = (config?.heading as string) || section.title || t("marketing.campaignTitle", "Special Offer");
  const description = (config?.description as string) || section.description || t("marketing.campaignDescription", "Limited time deal");
  const badge = (config?.badge as string) || (campaign?.badge as string) || t("marketing.campaignBadge", "Campaign");
  const ctaText = (config?.ctaText as string) || (campaign?.ctaText as string) || t("marketing.campaignCta", "Claim Now");
  const ctaHref = (config?.ctaHref as string) || (campaign?.ctaHref as string) || "/register";
  const countdownEnd = (config?.countdownEnd as string) || (campaign?.countdownEnd as string) || "";
  const discount = (config?.discount as number) || (campaign?.discount as number) || 0;
  const visible = config?.visible !== false;

  if (!visible) return null;

  return (
    <section className="border-t border-border" id="campaign" aria-labelledby="campaign-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 py-8 sm:px-10 sm:py-10">
          <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-5" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-3">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                {badge}
              </div>
              <h2 id="campaign-heading" className="text-2xl sm:text-3xl font-bold tracking-tight">
                {heading}
              </h2>
              <p className="mt-2 text-muted-foreground leading-relaxed">{description}</p>
              {discount > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  {t("marketing.discount", "Save")} {discount}%
                </div>
              )}
              {countdownEnd && (
                <Countdown endTime={countdownEnd} />
              )}
            </div>
            <div className="shrink-0">
              <Link
                href={ctaHref}
                className={cn(
                  "inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:shadow-lg hover:scale-105 duration-200 group"
                )}
              >
                {ctaText}
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Countdown({ endTime }: { endTime: string }) {
  const [remaining, setRemaining] = React.useState<string>("");

  React.useEffect(() => {
    const update = () => {
      const target = new Date(endTime).getTime();
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setRemaining(t("marketing.campaignEnded", "Offer ended"));
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime, t]);

  return (
    <div className="mt-3 text-xs text-muted-foreground">
      {t("marketing.campaignExpires", "Offer ends in")} {remaining}
    </div>
  );
}

function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}