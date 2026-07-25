"use client";

import * as React from "react";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const plans = [
  { name: "marketing.planFree", priceMonthly: 0, priceYearly: 0, features: ["1 workspace", "3 projects", "Basic AI models", "Community support"] },
  { name: "marketing.planStarter", priceMonthly: 19, priceYearly: 15, features: ["3 workspaces", "Unlimited projects", "All AI models", "Priority email support", "Billing & invoicing"] },
  { name: "marketing.planPro", priceMonthly: 49, priceYearly: 39, features: ["10 workspaces", "Team permissions", "Advanced analytics", "Workflow automation", "Priority support", "Custom integrations"] },
  { name: "marketing.planBusiness", priceMonthly: 99, priceYearly: 79, features: ["Unlimited workspaces", "SSO / SAML", "Dedicated support", "SLA 99.9%", "Custom AI models", "Audit logs"] },
  { name: "marketing.planEnterprise", priceMonthly: null, priceYearly: null, features: ["Unlimited everything", "Dedicated infrastructure", "Custom SLA", "On-prem option", "24/7 support", "Professional services"] },
];

export default function PricingPage() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const [yearly, setYearly] = React.useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t("marketing.pricingTitle")}</h1>
        <p className="mt-4 text-muted-foreground">{t("marketing.pricingDescription")}</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border p-1">
          <button onClick={() => setYearly(false)} className={cn("rounded-full px-3 py-1 text-sm transition", !yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Monthly</button>
          <button onClick={() => setYearly(true)} className={cn("rounded-full px-3 py-1 text-sm transition", yearly ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>Yearly <Badge tone="success">{t("marketing.saveYearly")}</Badge></button>
        </div>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {plans.map((plan) => {
          const isPro = plan.name === "marketing.planPro";
          const price = yearly ? plan.priceYearly : plan.priceMonthly;
          const isFree = price === 0;
          return (
            <div key={plan.name} className={cn("rounded-3xl border border-border bg-card p-6", isPro && "relative border-primary/50 shadow-lg")}>
              {isPro && <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge tone="info">{t("marketing.mostPopular")}</Badge></div>}
              <h3 className="text-lg font-semibold">{t(plan.name)}</h3>
              <p className="mt-2 text-3xl font-semibold">{isFree ? formatCurrency(0) : formatCurrency(plan.priceMonthly ?? 0)}</p>
              <p className="text-sm text-muted-foreground">{yearly ? t("marketing.billedYearly") : t("marketing.billedMonthly")}</p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <button className={cn("mt-6 w-full rounded-lg px-3 py-2 text-sm font-medium transition", isPro ? "bg-primary text-primary-foreground hover:bg-primary/80" : "border border-border bg-background hover:bg-muted")}>
                {isFree ? t("common.getStarted") : t("marketing.contactSales")}
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-16 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Feature</th>
              {plans.map((plan) => <th key={plan.name} className="px-6 py-4 font-medium">{t(plan.name)}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {["Workspace seats", "AI models", "Support", "SLA", "SSO / SAML", "Audit logs"].map((row) => (
              <tr key={row} className="[&_td]:px-6 [&_td]:py-3">
                <td className="text-muted-foreground">{row}</td>
                {plans.map((plan, idx) => (
                  <td key={plan.name}>
                    {idx === 4 ? (
                      <Badge tone="info">Enterprise</Badge>
                    ) : (
                      <span>{idx === 0 && row === "Workspace seats" ? "1" : idx === 1 && row === "Workspace seats" ? "3" : idx === 2 && row === "Workspace seats" ? "10" : idx === 3 && row === "Workspace seats" ? "Unlimited" : idx > 2 || row !== "Support" ? "✓" : "Priority"}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-16 text-center">
        <h2 className="text-lg font-semibold">{t("marketing.faqTitle")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("marketing.faqBilling")}</p>
        <div className="mt-6 mx-auto max-w-2xl text-left space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-medium">{t("marketing.faqBillingQuestion")}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t("marketing.faqBillingAnswer")}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-medium">{t("marketing.faqSubscriptionsQuestion")}</h3>
            <p className="text-sm text-muted-foreground mt-2">{t("marketing.faqSubscriptionsAnswer")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
