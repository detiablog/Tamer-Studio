"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";

interface Plan {
  key: string;
  priceMonthly: string;
  priceYearly: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    key: "marketing.planFree",
    priceMonthly: "$0",
    priceYearly: "$0",
    description: "For individuals exploring AI production.",
    features: ["1 Workspace", "3 Projects", "Basic AI models", "Community support"],
    cta: "marketing.getStarted",
    href: "/register",
  },
  {
    key: "marketing.planStarter",
    priceMonthly: "$29",
    priceYearly: "$23",
    description: "For creators getting serious about production.",
    features: ["5 Workspaces", "Unlimited projects", "All AI providers", "Priority support"],
    cta: "marketing.getStarted",
    href: "/register",
    popular: true,
  },
  {
    key: "marketing.planPro",
    priceMonthly: "$79",
    priceYearly: "$63",
    description: "For teams shipping content at scale.",
    features: ["20 Workspaces", "Custom domains", "Advanced analytics", "Dedicated support"],
    cta: "marketing.getStarted",
    href: "/register",
  },
  {
    key: "marketing.planBusiness",
    priceMonthly: "$199",
    priceYearly: "$159",
    description: "For organizations that need control and compliance.",
    features: ["Unlimited workspaces", "SSO & SCIM", "Custom integrations", "SLA guarantee"],
    cta: "marketing.contactSales",
    href: "/contact",
  },
  {
    key: "marketing.planEnterprise",
    priceMonthly: "Custom",
    priceYearly: "Custom",
    description: "For large-scale deployments with dedicated infrastructure.",
    features: ["Dedicated infrastructure", "Custom SLA", "On-premise option", "24/7 support"],
    cta: "marketing.contactSales",
    href: "/contact",
  },
];

export function PricingSection() {
  const { t } = useLocalizationContext();
  const [yearly, setYearly] = React.useState(false);

  return (
    <section className="border-t border-border" id="pricing" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="pricing-heading" className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("marketing.pricingTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("marketing.pricingDescription")}</p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition",
                !yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("marketing.monthly")}
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition",
                yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t("marketing.yearly")}
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {t("marketing.saveYearly")}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {plans.map((plan) => {
            const price = yearly ? plan.priceYearly : plan.priceMonthly;
            return (
              <div
                key={plan.key}
                className={cn(
                  "relative rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/10",
                  plan.popular && "ring-2 ring-primary"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    {t("marketing.mostPopular")}
                  </span>
                )}
                <h3 className="text-base font-semibold">{t(plan.key)}</h3>
                <p className="mt-1 text-2xl font-semibold">{price}</p>
                <p className="text-xs text-muted-foreground">{yearly ? t("marketing.billedYearly") : t("marketing.billedMonthly")}</p>
                <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="size-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href as any}
                  className={cn(
                    "mt-6 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition",
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/80"
                      : "border border-border bg-background hover:bg-muted"
                  )}
                >
                  {t(plan.cta)}
                  {plan.cta === "marketing.getStarted" && <ArrowRight className="ml-2 size-4" />}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
