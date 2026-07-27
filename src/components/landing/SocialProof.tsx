"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

function AnimatedCounter({ target, suffix, display }: { target: number; suffix: string; display?: string }) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const hasAnimated = React.useRef(false);

  React.useEffect(() => {
    if (display) {
      setCount(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const start = performance.now();

          function animate(now: number) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [target, display]);

  const formatted = display || count.toLocaleString("en-US") + suffix;

  return <div ref={ref}>{formatted}</div>;
}

export function SocialProof({ section }: SectionRendererProps) {
  const { t, resolve } = useLocalizationContext();

  const title = resolve(section.config.title as string) || section.title || t("marketing.socialProofTitle");
  const stats = (section.config.stats as Array<{ label: string; value: number | string; suffix?: string; display?: string }>) || [];

  return (
    <section className="border-t border-border" aria-labelledby="social-proof-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <h2
          id="social-proof-heading"
          className="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {title}
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={String(stat.label || '') + idx}
              className="rounded-2xl border border-border bg-card p-6 text-center transition hover:border-foreground/10"
            >
              <div className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {typeof stat.value === "number" ? (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix || ""} display={stat.display} />
                ) : (
                  stat.value
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
