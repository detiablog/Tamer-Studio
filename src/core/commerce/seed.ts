import {
  findAllPlans,
  findAllBillingOptions,
  createPlan,
  createBillingOption,
  createPricing,
  findPricingByPlanId,
} from "./commerce.repository";
import type { CommercePlan, CommerceBillingOption } from "./commerce.types";

let seedPromise: Promise<{
  plans: CommercePlan[];
  billingOptions: CommerceBillingOption[];
  pricingCount: number;
}> | null = null;

const PLAN_SEEDS: Omit<CommercePlan, "id">[] = [
  {
    slug: "lite",
    name: "Lite",
    description: "Get started with AI-powered design tools",
    tier: 1,
    features: ["Basic AI generation", "5 storage", "3 projects", "1 workspace"],
    storageLimitMb: 500,
    projectLimit: 3,
    workspaceLimit: 1,
    aiCapabilities: ["basic_generation"],
    permissions: ["create_project", "export_designs"],
    isActive: true,
    displayOrder: 1,
    badge: null,
  },
  {
    slug: "creator",
    name: "Creator",
    description: "For creators who need more power and flexibility",
    tier: 2,
    features: [
      "Advanced AI generation",
      "20 storage",
      "15 projects",
      "5 workspaces",
      "Priority support",
    ],
    storageLimitMb: 20000,
    projectLimit: 15,
    workspaceLimit: 5,
    aiCapabilities: ["basic_generation", "advanced_generation", "image_editing"],
    permissions: [
      "create_project",
      "export_designs",
      "use_advanced_ai",
      "create_workspaces",
    ],
    isActive: true,
    displayOrder: 2,
    badge: "Popular",
  },
  {
    slug: "pro",
    name: "Pro",
    description: "For professionals and teams with unlimited needs",
    tier: 3,
    features: [
      "Unlimited AI generation",
      "100 storage",
      "Unlimited projects",
      "Unlimited workspaces",
      "Priority support",
      "Custom branding",
    ],
    storageLimitMb: 100000,
    projectLimit: 999999,
    workspaceLimit: 999999,
    aiCapabilities: [
      "basic_generation",
      "advanced_generation",
      "image_editing",
      "video_generation",
      "api_access",
    ],
    permissions: [
      "create_project",
      "export_designs",
      "use_advanced_ai",
      "create_workspaces",
      "api_access",
      "custom_branding",
    ],
    isActive: true,
    displayOrder: 3,
    badge: "Best Value",
  },
];

const BILLING_SEEDS: Omit<CommerceBillingOption, "id">[] = [
  {
    slug: "monthly",
    name: "Monthly",
    description: "Billed every month",
    frequency: "monthly",
    renewalBehavior: "auto",
    isActive: true,
    displayOrder: 1,
  },
  {
    slug: "yearly",
    name: "Yearly",
    description: "Billed once a year — save up to 20%",
    frequency: "yearly",
    renewalBehavior: "auto",
    isActive: true,
    displayOrder: 2,
  },
  {
    slug: "one-time",
    name: "One-Time",
    description: "Pay once, use credits as you go",
    frequency: "one_time",
    renewalBehavior: "none",
    isActive: true,
    displayOrder: 3,
  },
];

const PRICING_SEEDS: Array<{
  planSlug: string;
  billingSlug: string;
  price: number;
  creditsIncluded: number;
}> = [
  { planSlug: "lite", billingSlug: "monthly", price: 9.99, creditsIncluded: 500 },
  { planSlug: "lite", billingSlug: "yearly", price: 99.99, creditsIncluded: 500 },
  { planSlug: "creator", billingSlug: "monthly", price: 29.99, creditsIncluded: 3000 },
  { planSlug: "creator", billingSlug: "yearly", price: 299.99, creditsIncluded: 3000 },
  { planSlug: "pro", billingSlug: "monthly", price: 79.99, creditsIncluded: 10000 },
  { planSlug: "pro", billingSlug: "yearly", price: 799.99, creditsIncluded: 10000 },
];

export async function seedCommerce(): Promise<{
  plans: CommercePlan[];
  billingOptions: CommerceBillingOption[];
  pricingCount: number;
}> {
  let existingPlans = await findAllPlans();
  let existingBillingOptions = await findAllBillingOptions();

  if (existingPlans.length === 0) {
    for (const planSeed of PLAN_SEEDS) {
      await createPlan(planSeed);
    }
    existingPlans = await findAllPlans();
  }

  if (existingBillingOptions.length === 0) {
    for (const billingSeed of BILLING_SEEDS) {
      await createBillingOption(billingSeed);
    }
    existingBillingOptions = await findAllBillingOptions();
  }

  const planMap = new Map(existingPlans.map((p) => [p.slug, p]));
  const billingMap = new Map(existingBillingOptions.map((b) => [b.slug, b]));

  let pricingCount = 0;
  for (const pricingSeed of PRICING_SEEDS) {
    const plan = planMap.get(pricingSeed.planSlug);
    const billing = billingMap.get(pricingSeed.billingSlug);
    if (!plan || !billing) continue;

    const existingPricings = await findPricingByPlanId(plan.id);
    const alreadyExists = existingPricings.some(
      (p) => p.billingOptionId === billing.id
    );
    if (!alreadyExists) {
      await createPricing({
        planId: plan.id,
        billingOptionId: billing.id,
        price: pricingSeed.price,
        creditsIncluded: pricingSeed.creditsIncluded,
        currency: "USD",
        isActive: true,
      });
      pricingCount++;
    }
  }

  return {
    plans: existingPlans,
    billingOptions: existingBillingOptions,
    pricingCount,
  };
}

export async function ensureSeeded(): Promise<void> {
  if (seedPromise) {
    await seedPromise;
    return;
  }
  seedPromise = seedCommerce().catch((err) => {
    seedPromise = null;
    throw err;
  });
  await seedPromise;
}
