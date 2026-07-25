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
import Script from "next/script";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const SITE_URL = config.app.url;

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
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <LocalizationProvider>
            <CurrencyProvider>
              <HtmlLangUpdater />
              <Script
                id="json-ld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
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
                  }),
                }}
              />
              {children}
              <Toaster />
            </CurrencyProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
