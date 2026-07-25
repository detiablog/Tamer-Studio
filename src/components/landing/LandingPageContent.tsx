'use client';

import React from 'react';
import { useLandingSections } from '@/hooks/use-landing-sections';
import { renderLandingSections } from '@/lib/landing-section-renderer';
import { Header } from '@/components/landing/Header';
import { ElegantLoader } from '@/components/ui/ElegantLoader';

export function LandingPageContent() {
  const { sections, loading, error } = useLandingSections();

  if (loading) {
    return <ElegantLoader />;
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <p className="text-lg font-semibold text-destructive">Unable to load landing page</p>
            <p className="text-sm text-muted-foreground">
              Please check your connection and try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {sections.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-3">
              <p className="text-lg font-semibold text-muted-foreground">No sections published yet</p>
              <p className="text-sm text-muted-foreground">
                Check back soon for updates.
              </p>
            </div>
          </div>
        ) : (
          renderLandingSections(sections)
        )}
      </main>
    </div>
  );
}
