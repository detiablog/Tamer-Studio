"use client";

import * as React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";

const packs = [
  {
    key: "marketing.creditPackSmall",
    credits: 5000,
    price: 29,
    href: "/register",
  },
  {
    key: "marketing.creditPackMedium",
    credits: 25000,
    price: 99,
    href: "/register",
  },
  {
    key: "marketing.creditPackLarge",
    credits: 100000,
    price: 299,
    href: "/register",
  },
  {
    key: "marketing.creditPackCustom",
    credits: -1,
    price: -1,
    href: "/contact",
  },
];

export function CreditPacks() {
  const { t } = useLocalizationContext();

  return (
    <section className="border-t border-border" id="credit-packs" aria-labelledby="credit-packs-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="credit-packs-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("marketing.creditPackTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("marketing.creditPackDescription")}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {packs.map((pack) => (
            <div
              key={pack.key}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/10"
            >
              <div className="flex items-center gap-2">
                <Zap className="size-5 text-primary" />
                <h3 className="text-base font-semibold">{t(pack.key)}</h3>
              </div>

              <div className="mt-4">
                {pack.credits > 0 ? (
                  <p className="text-3xl font-semibold">
                    {pack.credits.toLocaleString("en-US")}
                  </p>
                ) : (
                  <p className="text-3xl font-semibold">{t("marketing.contactSales")}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {pack.credits > 0 ? t("marketing.credits") : ""}
                </p>
              </div>

              <p className="mt-2 text-lg font-semibold">
                {pack.price > 0 ? `$${pack.price}` : ""}
              </p>

              <Link
                href={pack.href as any}
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
