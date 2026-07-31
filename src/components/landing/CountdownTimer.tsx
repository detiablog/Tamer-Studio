"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: string): TimeLeft | null {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export function CountdownTimer({ section }: SectionRendererProps) {
  const { resolve } = useLocalizationContext();
  const config = section.config as Record<string, unknown> | undefined;

  const title = resolve(config?.title as string) || section.title;
  const targetDate = (config?.targetDate as string) || "";
  const description = resolve(config?.description as string) || section.description;

  const [timeLeft, setTimeLeft] = React.useState<TimeLeft | null>(() =>
    targetDate ? getTimeLeft(targetDate) : null
  );

  React.useEffect(() => {
    if (!targetDate) return;
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate || !timeLeft) return null;

  const blocks = [
    { value: timeLeft.days, label: resolve(config?.daysLabel as string) || "Days" },
    { value: timeLeft.hours, label: resolve(config?.hoursLabel as string) || "Hours" },
    { value: timeLeft.minutes, label: resolve(config?.minutesLabel as string) || "Min" },
    { value: timeLeft.seconds, label: resolve(config?.secondsLabel as string) || "Sec" },
  ];

  return (
    <section className="border-t border-border" aria-labelledby="countdown-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 text-center">
        {title && (
          <h2 id="countdown-heading" className="text-3xl sm:text-4xl font-bold tracking-tight">
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-3 text-muted-foreground">{description}</p>
        )}
        <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4">
          {blocks.map((block) => (
            <div
              key={block.label}
              className="flex flex-col items-center rounded-xl border border-border bg-card px-4 py-3 sm:px-6 sm:py-4 min-w-[70px] sm:min-w-[90px]"
            >
              <span className="text-3xl sm:text-5xl font-bold tabular-nums tracking-tight">
                {String(block.value).padStart(2, "0")}
              </span>
              <span className="mt-1 text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
                {block.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
