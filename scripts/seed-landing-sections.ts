/**
 * Seed script for landing page sections
 * This populates the database with all landing page sections from the live site
 * Run with: pnpm tsx scripts/seed-landing-sections.ts
 */

import "dotenv/config";
import { db } from "@/lib/db";
import { landingSection } from "@/lib/db/schema/landing";
import { eq } from "drizzle-orm";

const LANDING_SECTIONS = [
  {
    id: "hero-section",
    sectionKey: "hero",
    type: "hero",
    title: "From intent to production",
    description: "Tamer Studio is the AI-first production operating system. Plan, generate, organize, review, and publish content without switching between tools.",
    order: 0,
    visible: true,
    config: {
      heading: "From intent to production",
      description: "Tamer Studio is the AI-first production operating system. Plan, generate, organize, review, and publish content without switching between tools.",
      ctaPrimary: "Get Started Free",
      ctaSecondary: "Sign In",
    },
  },
  {
    id: "social-proof-section",
    sectionKey: "social-proof",
    type: "custom",
    title: "Social Proof",
    description: "Trusted by creators, agencies, and businesses worldwide",
    order: 1,
    visible: true,
    config: {
      title: "Trusted by creators, agencies, and businesses worldwide",
      stats: [
        { label: "Projects", value: "10K+" },
        { label: "Teams", value: "500+" },
        { label: "Generations", value: "1M+" },
      ],
    },
  },
  {
    id: "features-section",
    sectionKey: "features",
    type: "features",
    title: "Built for modern content teams",
    description: "Everything you need to manage the full content lifecycle in one place.",
    order: 2,
    visible: true,
    config: {
      heading: "Built for modern content teams",
      description: "Everything you need to manage the full content lifecycle in one place.",
      features: [
        {
          sectionKey: "workspace",
          title: "Workspace",
          description: "Organize teams, members, and permissions across multiple workspaces.",
          icon: "boxes",
        },
        {
          sectionKey: "projects",
          title: "Projects",
          description: "Manage production projects with folders, tags, assets, and archives.",
          icon: "folder-open",
        },
        {
          sectionKey: "media",
          title: "Media",
          description: "Generate and organize images, videos, audio, and documents in one library.",
          icon: "image",
        },
        {
          sectionKey: "production",
          title: "Production",
          description: "Run production pipelines with queues, retries, logs, and progress tracking.",
          icon: "clapperboard",
        },
        {
          sectionKey: "ai",
          title: "AI Platform",
          description: "Connect providers, manage models, and compose prompts with unified playground.",
          icon: "cpu",
        },
        {
          sectionKey: "publishing",
          title: "Publishing",
          description: "Schedule and publish content to external platforms from one hub.",
          icon: "play",
        },
        {
          sectionKey: "billing",
          title: "Billing",
          description: "Manage invoices, subscriptions, and payment methods in one place.",
          icon: "credit-card",
        },
        {
          sectionKey: "analytics",
          title: "Analytics",
          description: "Track production metrics, AI usage, and team performance.",
          icon: "bar-chart-3",
        },
        {
          sectionKey: "marketplace",
          title: "Marketplace",
          description: "Discover and integrate community templates and plugins.",
          icon: "store",
        },
      ],
    },
  },
  {
    id: "ai-platform-section",
    sectionKey: "ai-platform",
    type: "custom",
    title: "AI Platform for Production Teams",
    description: "Connect any AI provider, compose prompts, automate workflows, and optimize costs — all from one interface.",
    order: 3,
    visible: true,
    config: {
      heading: "AI Platform for Production Teams",
      description: "Connect any AI provider, compose prompts, automate workflows, and optimize costs — all from one interface.",
      features: [
        {
          title: "Multi-Provider AI",
          description: "Connect OpenAI, Gemini, Claude, OpenRouter, Kilo, and more with a single API key.",
        },
        {
          title: "Prompt Library",
          description: "Save, version, and reuse prompts across projects and teams.",
        },
        {
          title: "Workflow Automation",
          description: "Build production pipelines combining AI models, applying safeguards, and routing outputs.",
        },
        {
          title: "Model Selection",
          description: "Choose the right model for each task. Compare costs, latency, and quality.",
        },
        {
          title: "Cost Optimization",
          description: "Track spending per project, set budgets, and get alerts before exceeding limits.",
        },
        {
          title: "History",
          description: "Every AI call is logged. Review, replay, and audit every generation.",
        },
      ],
    },
  },
  {
    id: "screenshots-section",
    sectionKey: "screenshots",
    type: "custom",
    title: "See Tamer Studio in Action",
    description: "From dashboard to delivery, every screen is designed for production teams.",
    order: 4,
    visible: true,
    config: {
      heading: "See Tamer Studio in Action",
      description: "From dashboard to delivery, every screen is designed for production teams.",
    },
  },
  {
    id: "realtime-stats-section",
    sectionKey: "realtime-stats",
    type: "custom",
    title: "Platform Statistics",
    description: "Real-time metrics from our production infrastructure.",
    order: 5,
    visible: true,
    config: {
      heading: "Real-time Platform Stats",
      stats: [
        { label: "Active Users", value: "5K+" },
        { label: "AI Jobs", value: "50K/day" },
        { label: "Images Generated", value: "1M+" },
        { label: "Videos Generated", value: "100K+" },
      ],
    },
  },
  {
    id: "pricing-section",
    sectionKey: "pricing",
    type: "pricing",
    title: "Pricing",
    description: "Simple and transparent pricing for every stage of your production workflow.",
    order: 6,
    visible: true,
    config: {
      heading: "Pricing",
      description: "Simple and transparent pricing for every stage of your production workflow.",
      plans: [
        {
          sectionKey: "free",
          name: "Free",
          priceMonthly: 0,
          priceYearly: 0,
          includedCreditsMonthly: 0,
          includedCreditsYearly: 0,
          description: "For individuals exploring AI production.",
          features: ["Platform access", "1 Workspace", "3 Projects", "Basic AI models", "Community support"],
        },
        {
          sectionKey: "starter",
          name: "Starter",
          priceMonthly: 29,
          priceYearly: 23,
          includedCreditsMonthly: 5000,
          includedCreditsYearly: 60000,
          description: "For creators getting serious about production.",
          features: ["Platform access", "5 Workspaces", "Unlimited projects", "All AI providers", "Priority support"],
          popular: true,
        },
        {
          sectionKey: "pro",
          name: "Pro",
          priceMonthly: 79,
          priceYearly: 63,
          includedCreditsMonthly: 25000,
          includedCreditsYearly: 300000,
          description: "For teams shipping content at scale.",
          features: ["Platform access", "20 Workspaces", "Custom domains", "Advanced analytics", "Dedicated support"],
        },
        {
          sectionKey: "business",
          name: "Business",
          priceMonthly: 199,
          priceYearly: 159,
          includedCreditsMonthly: 100000,
          includedCreditsYearly: 1200000,
          description: "For organizations that need control and compliance.",
          features: ["Platform access", "Unlimited workspaces", "SSO & SCIM", "Custom integrations", "SLA guarantee"],
        },
        {
          sectionKey: "enterprise",
          name: "Enterprise",
          priceMonthly: null,
          priceYearly: null,
          includedCreditsMonthly: -1,
          includedCreditsYearly: -1,
          description: "For large-scale deployments with dedicated infrastructure.",
          features: ["Platform access", "Dedicated infrastructure", "Custom SLA", "On-premise option", "24/7 support"],
        },
      ],
    },
  },
  {
    id: "credit-packs-section",
    sectionKey: "credit-packs",
    type: "credit-packs",
    title: "AI Credit Packages",
    description: "Need more AI? Buy Credit Packs anytime.",
    order: 7,
    visible: true,
    config: {
      heading: "AI Credit Packages",
      description: "Need more AI? Buy Credit Packs anytime.",
      packs: [
        {
          sectionKey: "starter",
          name: "Starter Pack",
          credits: 10000,
          price: 50,
          description: "Perfect for getting started",
        },
        {
          sectionKey: "pro",
          name: "Pro Pack",
          credits: 50000,
          price: 200,
          description: "For growing teams",
        },
        {
          sectionKey: "business",
          name: "Business Pack",
          credits: 200000,
          price: 700,
          description: "For large operations",
        },
      ],
    },
  },
  {
    id: "credit-calculator-section",
    sectionKey: "credit-calculator",
    type: "custom",
    title: "Credit Calculator",
    description: "Estimate your monthly credit usage and find the right plan.",
    order: 8,
    visible: true,
    config: {
      heading: "Credit Calculator",
      description: "Estimate your monthly credit usage and find the right plan.",
    },
  },
  {
    id: "credit-usage-section",
    sectionKey: "credit-usage",
    type: "credit-usage",
    title: "AI Credit Usage",
    description: "Estimated cost of credits per AI action. Actual costs may vary depending on model and parameters.",
    order: 9,
    visible: true,
    config: {
      heading: "AI Credit Usage",
      description: "Estimated cost of credits per AI action. Actual costs may vary depending on model and parameters.",
      rows: [
        {
          action: "Text generation",
          model: "Text short/chat",
          credits: 5,
          notes: "Per request",
        },
        {
          action: "Image generation",
          model: "Image standard",
          credits: 20,
          notes: "Per image",
        },
        {
          action: "Video generation",
          model: "Video short (15s)",
          credits: 100,
          notes: "Per video",
        },
        {
          action: "Audio generation",
          model: "TTS/voiceover",
          credits: 10,
          notes: "Per minute",
        },
      ],
    },
  },
  {
    id: "testimonials-section",
    sectionKey: "testimonials",
    type: "custom",
    title: "Loved by production teams",
    description: "See how teams use Tamer Studio to move from intent to production.",
    order: 10,
    visible: true,
    config: {
      heading: "Loved by production teams",
      description: "See how teams use Tamer Studio to move from intent to production.",
    },
  },
  {
    id: "faq-section",
    sectionKey: "faq",
    type: "faq",
    title: "Frequently Asked Questions",
    description: "Everything you need to know about Tamer Studio.",
    order: 11,
    visible: true,
    config: {
      heading: "Frequently Asked Questions",
      description: "Everything you need to know about Tamer Studio.",
      items: [
        {
          questionsectionKey: "faqBillingQuestion",
          answersectionKey: "faqBillingAnswer",
        },
        {
          questionsectionKey: "faqCreditsQuestion",
          answersectionKey: "faqCreditsAnswer",
        },
        {
          questionsectionKey: "faqAIModelsQuestion",
          answersectionKey: "faqAIModelsAnswer",
        },
        {
          questionsectionKey: "faqPrivacyQuestion",
          answersectionKey: "faqPrivacyAnswer",
        },
      ],
    },
  },
  {
    id: "cta-section",
    sectionKey: "cta",
    type: "cta",
    title: "Ready to Transform Your Workflow?",
    description: "Create your account and bring your team into the AI-first production environment.",
    order: 12,
    visible: true,
    config: {
      heading: "Ready to Transform Your Workflow?",
      description: "Create your account and bring your team into the AI-first production environment.",
      ctaPrimary: "Get Started Free",
      ctaSecondary: "Schedule Demo",
      note: "No credit card required. Start building today.",
    },
  },
  {
    id: "footer-section",
    sectionKey: "footer",
    type: "footer",
    title: "Footer",
    description: null,
    order: 13,
    visible: true,
    config: {
      companyName: "Tamer Studio",
      tagline: "From intent to production.",
      links: {
        product: ["Features", "Pricing", "Roadmap", "Documentation", "API", "Developers"],
        resources: ["Blog", "Community", "Discord", "GitHub"],
        company: ["About", "Careers", "Press", "Partners"],
        legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security", "Compliance"],
      },
    },
  },
];

async function seedLandingSections() {
  try {
    console.log("🌱 Starting landing sections seed...");

    for (const section of LANDING_SECTIONS) {
      // Check if section already exists
      const existing = await db.select().from(landingSection).where(eq(landingSection.sectionKey, section.sectionKey)).limit(1);

      if (existing.length > 0) {
        // Update existing section
        await db
          .update(landingSection)
          .set({
            ...section,
            updatedAt: new Date(),
          } as any)
          .where(eq(landingSection.sectionKey, section.sectionKey));
        console.log(`✓ Updated section: ${section.sectionKey}`);
      } else {
        // Insert new section
        await db.insert(landingSection).values({
          ...section,
          component: "",
          locked: false,
          styles: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        console.log(`✓ Created section: ${section.sectionKey}`);
      }
    }

    console.log("✅ Landing sections seed completed successfully!");
    console.log(`📊 Total sections: ${LANDING_SECTIONS.length}`);
  } catch (error) {
    console.error("❌ Error seeding landing sections:", error);
    process.exit(1);
  }
}

seedLandingSections();
