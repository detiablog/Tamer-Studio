import { Suspense } from 'react';
import { HomepageRuntimeContent } from '@/components/homepage/HomepageRuntimeContent';
import { LandingKeyboardShortcuts } from '@/components/landing/LandingKeyboardShortcuts';
import { generatePageMetadata } from '@/core/seo';

export async function generateMetadata() {
  return generatePageMetadata({
    route: '/',
    title: 'Tamer Studio — AI-first Production Operating System',
    description: 'Tamer Studio is the AI-first production operating system for creators, agencies, and businesses.',
    keywords: ['AI production platform', 'content production', 'AI generation', 'Tamer Studio'],
    type: 'website',
    author: 'Tamer Studio',
  });
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingKeyboardShortcuts />
      <main className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <HomepageRuntimeContent />
        </Suspense>
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 animate-spin">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
