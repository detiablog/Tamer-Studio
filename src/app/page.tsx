import { Suspense } from 'react';
import { HomepageRuntimeContent } from '@/components/homepage/HomepageRuntimeContent';
import { LandingKeyboardShortcuts } from '@/components/landing/LandingKeyboardShortcuts';
import { getSEORuntime } from '@/core/seo';

export async function generateMetadata() {
  const seoRuntime = getSEORuntime();

  try {
    const resolved = await seoRuntime.resolvePage({
      route: '/',
      title: 'Tamer Studio — AI-first Production Operating System',
      description: 'Tamer Studio is the AI-first production operating system for creators, agencies, and businesses.',
      keywords: ['AI production platform', 'content production', 'AI generation', 'Tamer Studio'],
      type: 'website',
      author: 'Tamer Studio',
    });

    return {
      title: {
        default: resolved.metadata.title,
        template: `%s | Tamer Studio`,
      },
      description: resolved.metadata.description,
      keywords: resolved.metadata.keywords,
      authors: [{ name: resolved.metadata.author }],
      creator: resolved.metadata.publisher,
      openGraph: {
        title: resolved.openGraph.title,
        description: resolved.openGraph.description,
        type: resolved.openGraph.type as 'website',
        url: resolved.openGraph.url,
        siteName: resolved.openGraph.siteName,
        images: resolved.openGraph.images,
        locale: resolved.openGraph.locale,
      },
      twitter: {
        card: resolved.twitter.card,
        title: resolved.twitter.title,
        description: resolved.twitter.description,
        images: resolved.twitter.images,
      },
      robots: {
        index: resolved.robots.index,
        follow: resolved.robots.follow,
      },
      alternates: {
        canonical: resolved.canonical.canonical,
        languages: resolved.hreflang.reduce<Record<string, string>>((acc, h) => {
          acc[h.hreflang] = h.href;
          return acc;
        }, {}),
      },
    };
  } catch {
    return {
      title: {
        default: 'Tamer Studio — AI-first Production Operating System',
        template: '%s | Tamer Studio',
      },
      description: 'Tamer Studio is the AI-first production operating system for creators, agencies, and businesses.',
      robots: { index: true, follow: true },
    };
  }
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
