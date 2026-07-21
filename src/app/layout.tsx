import "./globals.css";
import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { config } from "@/core/config";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const SITE_URL = config.app.url;

export const metadata = {
  title: {
    default: "Tamer Studio",
    template: "%s | Tamer Studio",
  },
  description: "Tamer Studio — AI-first production platform for creators. Manage projects, media, production, and publishing in one place.",
  keywords: ["AI", "Studio", "Projects", "Media", "Production", "Publishing"],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Tamer Studio",
    description: "Tamer Studio — AI-first production platform for creators. Manage projects, media, production, and publishing in one place.",
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
    description: "Tamer Studio — AI-first production platform for creators. Manage projects, media, production, and publishing in one place.",
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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
