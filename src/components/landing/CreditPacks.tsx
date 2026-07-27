import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";
import { cn } from "@/lib/utils";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface Pack {
  name: string;
  credits: number;
  price: number | string;
  description?: string;
  href?: string;
}

export function CreditPacks({ section }: SectionRendererProps) {
  const { t, resolve } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();

  const heading = resolve(section.config.heading as string) || section.title || t("marketing.creditPackTitle");
  const description = resolve(section.config.description as string) || section.description || t("marketing.creditPackDescription");
  const packs = (section.config.packs as Pack[]) || [];

  return (
    <section className="border-t border-border" id="credit-packs" aria-labelledby="credit-packs-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="credit-packs-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-3 text-muted-foreground">{description}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packs.map((pack, idx) => (
            <div
              key={String(pack.name || '') + idx}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/10"
            >
              <div className="flex items-center gap-2">
                <span className="size-5 text-primary flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </span>
                <h3 className="text-base font-semibold">{pack.name}</h3>
              </div>

              <div className="mt-4">
                {pack.credits > 0 ? (
                  <>
                    <p className="text-3xl font-semibold">
                      {formatCurrency(pack.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pack.credits} {t("marketing.credits")}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-semibold">{t("marketing.contactSales")}</p>
                    <p className="text-sm text-muted-foreground"></p>
                  </>
                )}
              </div>

              <Link
                href={(pack.href || "/register") as any}
                className="mt-auto inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition border border-border bg-background hover:bg-muted"
              >
                {t("marketing.buyNow")}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
