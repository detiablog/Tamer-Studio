import { Suspense } from 'react';
import { LandingPageContent } from '@/components/landing/LandingPageContent';
import { LandingKeyboardShortcuts } from '@/components/landing/LandingKeyboardShortcuts';

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
        <p className="text-muted-foreground">Loading landing page...</p>
      </div>
    </div>
  );
}
