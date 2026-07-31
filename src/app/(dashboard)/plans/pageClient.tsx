"use client";

import * as React from "react";
import useSWR from "swr";
import { useLocalizationContext } from "@/providers/localization";
import { useCurrencyContext } from "@/providers/currency";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Check, X, Loader, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`API error: ${r.status}`);
    return r.json();
  });

interface PricingItem {
  id: string;
  name: string;
  code: string;
  category: string;
  basePrice: number;
  salePrice?: number;
  currency: string;
  status: string;
  description?: string;
  features?: string[];
  credits?: number;
  popular?: boolean;
}

export default function PricingDashboardClient() {
  const { t } = useLocalizationContext();
  const { formatCurrency } = useCurrencyContext();
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">("monthly");

  const { data, isLoading } = useSWR("/api/admin/pricing?status=active", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    dedupingInterval: 5000,
  });

  const items: PricingItem[] = React.useMemo(() => {
    if (data?.success) {
      const arr = Array.isArray(data.data) ? data.data : data.data?.data && Array.isArray(data.data.data) ? data.data.data : [];
      return arr.filter((i: PricingItem) => i.status === "active");
    }
    return [];
  }, [data]);

  const subscriptionPlans = React.useMemo(
    () => items.filter((i) => i.category === "subscription"),
    [items]
  );

  const creditPackages = React.useMemo(
    () => items.filter((i) => i.category === "credit_package" || i.category === "ai_credits"),
    [items]
  );

  const getPrice = (item: PricingItem) => {
    const base = item.salePrice && item.salePrice > 0 ? item.salePrice : item.basePrice;
    if (billingCycle === "yearly" && item.category === "subscription") {
      return base * 10;
    }
    return base;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">{t("pricing.title", "Plans & Pricing")}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">{t("pricing.description", "Choose the plan that works best for you")}</p>
        {subscriptionPlans.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant={billingCycle === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingCycle("monthly")}
            >
              {t("billing.monthly", "Monthly")}
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingCycle("yearly")}
            >
              {t("billing.yearly", "Yearly")}
            </Button>
          </div>
        )}
      </div>

      {subscriptionPlans.length > 0 && (
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptionPlans.map((plan) => {
              const price = getPrice(plan);
              const isPopular = plan.popular || plan.code?.includes("creator");
              return (
                <Card key={plan.id} className={isPopular ? "ring-2 ring-primary relative" : ""}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge tone="info">
                        <Star className="size-3" />
                        {t("pricing.mostPopular", "Most Popular")}
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.description && <CardDescription>{plan.description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">
                        {price === 0 ? t("pricing.free", "Free") : formatCurrency(price)}
                      </span>
                      {price > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {billingCycle === "yearly" ? t("pricing.perYear", "/year") : t("pricing.perMonth", "/month")}
                        </span>
                      )}
                    </div>
                    {plan.credits != null && plan.credits > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {plan.credits.toLocaleString()} {t("pricing.credits", "credits")}
                      </p>
                    )}
                    {plan.features && plan.features.length > 0 && (
                      <div className="space-y-2 pt-2">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <Check className="size-4 text-green-600 shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant={isPopular ? "default" : "outline"}>
                      {t("pricing.currentPlan") ? t("common.select", "Select") : t("common.select", "Select")}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {creditPackages.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="size-5 text-primary" />
            <h2 className="text-2xl font-bold">{t("pricing.credits", "credits")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {creditPackages.map((pkg) => {
              const price = pkg.salePrice && pkg.salePrice > 0 ? pkg.salePrice : pkg.basePrice;
              return (
                <Card key={pkg.id} className="hover:ring-1 hover:ring-primary/50 transition-all">
                  <CardContent className="pt-6 space-y-3">
                    <h3 className="font-semibold">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{pkg.description}</p>
                    )}
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{formatCurrency(price)}</span>
                    </div>
                    {pkg.credits != null && (
                      <p className="text-sm text-muted-foreground">
                        {pkg.credits.toLocaleString()} {t("pricing.credits", "credits")}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline" size="sm">
                      {t("common.select", "Select")}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {subscriptionPlans.length === 0 && creditPackages.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>{t("pricing.noPlans", "No pricing plans available at the moment.")}</p>
        </div>
      )}
    </div>
  );
}
