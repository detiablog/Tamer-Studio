import "./globals.css";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { LocalizationProvider } from "@/providers/localization";
import { CurrencyProvider } from "@/providers/currency";
import { HtmlLangUpdater } from "@/components/providers/HtmlLangUpdater";
import { config } from "@/core/config";
import { getSEORuntime } from "@/core/seo";
import { bootstrapNavigation } from "@/core/navigation";
import { initializeEventHub } from "@/core/events/event-hub";
import Script from "next/script";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { MobileNav } from "@/components/ui/MobileNav";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const SITE_URL = config.app.url;
const seoRuntime = getSEORuntime();
bootstrapNavigation();
initializeEventHub();

const orgSchema = seoRuntime.getSchemaRuntime().resolveOrganization({
  name: "Tamer Studio",
  url: SITE_URL,
  description: "Tamer Studio is an AI-first production operating system. Plan, generate, organize, review, and publish content without switching between tools.",
  logo: new URL("/favicon.svg", SITE_URL).toString(),
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@tamer.studio",
    contactType: "customer support",
    availableLanguage: ["English", "Bahasa Indonesia"],
  },
});

export const metadata = {
  title: {
    default: "Tamer Studio",
    template: "%s | Tamer Studio",
  },
  description: "Tamer Studio is an AI-first production operating system. Plan, generate, organize, review, and publish content without switching between tools.",
  keywords: ["AI", "Studio", "Projects", "Media", "Production", "Publishing", "AI-native", "workflow", "automation"],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Tamer Studio",
    description: "Tamer Studio is an AI-first production operating system. Plan, generate, organize, review, and publish content without switching between tools.",
    url: SITE_URL,
    siteName: "Tamer Studio",
    images: [
      {
        url: new URL("/og-image.svg", SITE_URL).toString(),
        width: 1200,
        height: 630,
        alt: "Tamer Studio",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tamer Studio",
    description: "Tamer Studio is an AI-first production operating system. Plan, generate, organize, review, and publish content without switching between tools.",
    images: [new URL("/og-image.svg", SITE_URL).toString()],
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(SITE_URL),
  other: {
    "theme-color": "#6366f1",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Tamer Studio",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6366f1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
          <ThemeProvider>
            <LocalizationProvider>
              <CurrencyProvider>
                <HtmlLangUpdater />
                <Script
                  id="json-ld"
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify(orgSchema),
                  }}
                />
                <Script
                  id="sw-register"
                  strategy="afterInteractive"
                  dangerouslySetInnerHTML={{
                    __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js'); }); }`,
                  }}
                />
                {children}
                <MobileNav />
                <PWAInstallPrompt />
                <Toaster />
              </CurrencyProvider>
            </LocalizationProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
