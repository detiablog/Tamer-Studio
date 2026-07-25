"use client";

import * as React from "react";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLocalizationContext();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navigation = [
    { label: t("marketing.menuProduct"), href: "#", children: [
      { label: t("marketing.sectionWorkspace"), href: "/features" },
      { label: t("marketing.sectionProjects"), href: "/features" },
      { label: t("marketing.sectionMedia"), href: "/features" },
      { label: t("marketing.sectionProduction"), href: "/features" },
      { label: t("marketing.sectionPublishing"), href: "/features" },
    ]},
    { label: t("marketing.menuSolutions"), href: "/features" },
    { label: t("marketing.menuPricing"), href: "/pricing" },
    { label: t("marketing.menuResources"), href: "#", children: [
      { label: t("marketing.menuDocumentation"), href: "/docs" },
      { label: t("marketing.menuBlog"), href: "/blog" },
      { label: t("marketing.menuRoadmap"), href: "/roadmap" },
      { label: t("marketing.menuCommunity"), href: "#" },
    ]},
    { label: t("marketing.menuRoadmap"), href: "/roadmap" },
    { label: t("marketing.menuCommunity"), href: "#" },
    { label: t("marketing.menuContact"), href: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className={cn("sticky top-0 z-50 transition-colors", scrolled ? "border-b bg-background/90 backdrop-blur" : "")}>
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">TS</div>
            Tamer Studio
          </Link>
          <nav className="hidden items-center gap-6 text-sm lg:flex">
            {navigation.map((item) => (
                  <Link key={item.label} href={item.href as any} className="text-muted-foreground hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">{t("marketing.menuSignIn")}</Link>
            <Link href="/register" className="inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80">{t("marketing.menuGetStarted")}</Link>
          </div>
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </button>
        </div>
        {mobileOpen && (
          <div className="border-t lg:hidden">
            <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{t("marketing.mobileMenu")}</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex flex-col gap-3 text-sm">
                {navigation.map((item) => (
              <Link key={item.label} href={item.href as any} className="text-muted-foreground hover:text-foreground">
                    {item.label}
                  </Link>
                ))}
                <Link href="/login" className="text-muted-foreground hover:text-foreground">{t("marketing.menuSignIn")}</Link>
                <Link href="/register" className="inline-flex w-fit items-center rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/80">{t("marketing.menuGetStarted")}</Link>
              </div>
            </div>
          </div>
        )}
      </header>
      <main>{children}</main>
      <footer className="border-t mt-20">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">TS</div>
                Tamer Studio
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">{t("marketing.footerTagline")}</p>
              <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-foreground">{t("marketing.footerDiscord")}</Link>
                <Link href="#" className="hover:text-foreground">{t("marketing.footerGithub")}</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold">{t("marketing.footerProduct")}</h4>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href={"/features" as any} className="hover:text-foreground">{t("marketing.footerFeatures")}</Link>
                <Link href={"/pricing" as any} className="hover:text-foreground">{t("marketing.footerPricing")}</Link>
                <Link href={"/roadmap" as any} className="hover:text-foreground">{t("marketing.footerRoadmap")}</Link>
                <Link href={"/docs" as any} className="hover:text-foreground">{t("marketing.footerDocumentation")}</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold">{t("marketing.footerResources")}</h4>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href={"/blog" as any} className="hover:text-foreground">{t("marketing.footerBlog")}</Link>
                <Link href={"/docs" as any} className="hover:text-foreground">{t("marketing.footerApi")}</Link>
                <Link href={"/roadmap" as any} className="hover:text-foreground">{t("marketing.footerRoadmap")}</Link>
                <Link href={"/support" as any} className="hover:text-foreground">{t("common.support")}</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold">{t("marketing.footerCompany")}</h4>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href={"/about" as any} className="hover:text-foreground">{t("marketing.footerAbout")}</Link>
                <Link href={"/careers" as any} className="hover:text-foreground">{t("marketing.footerCareers")}</Link>
                <Link href={"/contact" as any} className="hover:text-foreground">{t("marketing.footerContact")}</Link>
              </div>
              <h4 className="mt-6 text-sm font-semibold">{t("marketing.footerLegal")}</h4>
              <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/legal/privacy" className="hover:text-foreground">{t("marketing.footerPrivacyPolicy")}</Link>
                <Link href="/legal/terms" className="hover:text-foreground">{t("marketing.footerTermsOfService")}</Link>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">© 2026 Tamer Studio. {t("marketing.footerAllRightsReserved")}</p>
            <p className="text-xs text-muted-foreground">{t("marketing.footerVersion")} 1.0.0 • {t("marketing.footerBuild")} 2026.07.25</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
