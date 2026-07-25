"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";

const stats = [
  { key: "marketing.statProjects", suffix: "+", value: 10000 },
  { key: "marketing.statTeams", suffix: "+", value: 500 },
  { key: "marketing.statGenerations", suffix: "+", value: 1000000, display: "1M+" },
  { key: "marketing.statAvailability", suffix: "", value: 99.9, display: "99.9%" },
];

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

export function SocialProof() {
  const { t } = useLocalizationContext();

  return (
    <section className="border-t border-border" aria-labelledby="social-proof-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <h2
          id="social-proof-heading"
          className="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          {t("marketing.socialProofTitle")}
        </h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className="rounded-2xl border border-border bg-card p-6 text-center transition hover:border-foreground/10"
            >
              <div className="text-3xl font-semibold tracking-tight sm:text-4xl">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} display={stat.display} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{t(stat.key)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
