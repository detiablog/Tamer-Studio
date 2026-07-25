'use client';

import React from 'react';
import type { LandingSection } from '@/hooks/use-landing-sections';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { AIPlatform } from '@/components/landing/AIPlatform';
import { Screenshots } from '@/components/landing/Screenshots';
import { RealtimeStats } from '@/components/landing/RealtimeStats';
import { PricingSection } from '@/components/landing/PricingSection';
import { CreditPacks } from '@/components/landing/CreditPacks';
import { CreditCalculator } from '@/components/landing/CreditCalculator';
import { CreditUsageTable } from '@/components/landing/CreditUsageTable';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { SocialProof } from '@/components/landing/SocialProof';

const SECTION_COMPONENTS: Record<string, React.ComponentType<Record<string, unknown>>> = {
  hero: Hero,
  features: Features,
  'ai-platform': AIPlatform,
  screenshots: Screenshots,
  'realtime-stats': RealtimeStats,
  pricing: PricingSection,
  'credit-packs': CreditPacks,
  'credit-calculator': CreditCalculator,
  'credit-usage': CreditUsageTable,
  testimonials: Testimonials,
  faq: FAQ,
  cta: CTASection,
  footer: Footer,
  'social-proof': SocialProof,
};

export function getSectionComponent(key: string): React.ComponentType<Record<string, unknown>> | null {
  return SECTION_COMPONENTS[key] || null;
}

export function getAvailableSectionTypes(): string[] {
  return Object.keys(SECTION_COMPONENTS);
}

export function CustomSection({ section }: { section: LandingSection }) {
  const key = section.sectionKey;
  return React.createElement(
    'section',
    {
      className: 'border-t border-border',
      id: key,
      'aria-labelledby': `${key}-heading`,
    },
    React.createElement(
      'div',
      { className: 'mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20' },
      React.createElement('div', { className: 'space-y-4' },
        section.title &&
          React.createElement(
            'h2',
            { id: `${key}-heading`, className: 'text-3xl sm:text-4xl font-bold tracking-tight' },
            section.title
          ),
        section.description &&
          React.createElement(
            'p',
            { className: 'text-lg text-muted-foreground' },
            section.description
          ),
        section.config &&
          React.createElement(
            'pre',
            { className: 'bg-muted p-4 rounded-lg overflow-auto text-xs' },
            JSON.stringify(section.config, null, 2)
          )
      )
    )
  );
}

export function renderLandingSection(section: LandingSection): React.ReactNode {
  const Component = SECTION_COMPONENTS[section.sectionKey];

  if (!Component) {
    return React.createElement(CustomSection, { key: section.id, section });
  }

  return React.createElement(Component, { key: section.id });
}

export function renderLandingSections(sections: LandingSection[]): React.ReactNode[] {
  return sections.map((section) => renderLandingSection(section));
}
