import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { Features } from "@/components/landing/Features";
import { AIPlatform } from "@/components/landing/AIPlatform";
import { Screenshots } from "@/components/landing/Screenshots";
import { RealtimeStats } from "@/components/landing/RealtimeStats";
import { PricingSection } from "@/components/landing/PricingSection";
import { CreditPacks } from "@/components/landing/CreditPacks";
import { CreditCalculator } from "@/components/landing/CreditCalculator";
import { CreditUsageTable } from "@/components/landing/CreditUsageTable";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";
import { LandingKeyboardShortcuts } from "@/components/landing/LandingKeyboardShortcuts";

export const metadata = {
  title: {
    default: "Tamer Studio — AI-first Production Operating System",
    template: "%s | Tamer Studio",
  },
  description:
    "Tamer Studio is the AI-first production operating system for creators, agencies, and businesses. Plan, generate, organize, review, and publish content without switching between tools.",
  keywords: [
    "AI production platform",
    "content production",
    "AI generation",
    "media library",
    "production pipeline",
    "publishing platform",
    "multi-provider AI",
    "workspace management",
    "Tamer Studio",
  ],
  authors: [{ name: "Tamer Studio" }],
  creator: "Tamer Studio",
  openGraph: {
    title: "Tamer Studio — AI-first Production Operating System",
    description:
      "Plan, generate, organize, review, and publish content with the AI-first production operating system.",
    url: "https://tamer.studio",
    siteName: "Tamer Studio",
    images: [
      {
        url: "https://tamer.studio/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Tamer Studio",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tamer Studio — AI-first Production Operating System",
    description:
      "Plan, generate, organize, review, and publish content with the AI-first production operating system.",
    images: ["https://tamer.studio/og-image.svg"],
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: "https://tamer.studio",
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingKeyboardShortcuts />
      <Header />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <Features />
        <AIPlatform />
        <Screenshots />
        <RealtimeStats />
        <PricingSection />
        <CreditPacks />
        <CreditCalculator />
        <CreditUsageTable />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
