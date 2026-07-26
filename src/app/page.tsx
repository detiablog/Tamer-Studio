import { Suspense } from 'react';
import { LandingPageContent } from '@/components/landing/LandingPageContent';
import { LandingKeyboardShortcuts } from '@/components/landing/LandingKeyboardShortcuts';
import { getLocalizationService } from '@/lib/localization';
import { regionService } from '@/core/localization/region.service';

export async function generateMetadata() {
  const service = getLocalizationService();
  const locale = service.getLocale();

  try {
    const [seoRes, detectRes] = await Promise.all([
      fetch(new URL('/api/landing/seo', process.env.VERCEL_URL || 'http://localhost:3000'), {
        headers: {
          'accept-language': locale,
        },
        cache: 'no-store',
      }).catch(() => null),
      fetch(new URL('/api/localization/detect', process.env.VERCEL_URL || 'http://localhost:3000'), {
        cache: 'no-store',
      }).catch(() => null),
    ]);

    let seoData = null;
    let detectData = null;

    if (seoRes?.ok) {
      seoData = await seoRes.json();
    }
    if (detectRes?.ok) {
      detectData = await detectRes.json();
    }

    const title = seoData?.data?.title || 'Tamer Studio — AI-first Production Operating System';
    const description = seoData?.data?.description || 'Tamer Studio is the AI-first production operating system for creators, agencies, and businesses.';
    const keywords = seoData?.data?.keywords || ['AI production platform', 'content production', 'AI generation', 'Tamer Studio'];
    const image = seoData?.data?.image || 'https://tamer.studio/og-image.svg';
    const url = seoData?.data?.url || 'https://tamer.studio';
    const hreflangs = seoData?.data?.hreflangs || [];
    const ogLocale = seoData?.data?.locale || 'en_US';

    return {
      title: {
        default: title,
        template: `%s | Tamer Studio`,
      },
      description,
      keywords,
      authors: [{ name: 'Tamer Studio' }],
      creator: 'Tamer Studio',
      openGraph: {
        title,
        description,
        type: 'website',
        url,
        siteName: 'Tamer Studio',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: ogLocale,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      robots: { index: true, follow: true },
      alternates: {
        canonical: url,
        languages: hreflangs.reduce<Record<string, string>>((acc, h: { hreflang: string; href: string }) => {
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
          <LandingPageContent />
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
