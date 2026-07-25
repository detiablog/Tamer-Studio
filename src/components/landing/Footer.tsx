"use client";

import * as React from "react";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";
import { ArrowRight } from "lucide-react";

const productLinks = [
  { key: "marketing.footerFeatures", href: "#features" },
  { key: "marketing.footerPricing", href: "#pricing" },
  { key: "marketing.footerRoadmap", href: "/roadmap" },
  { key: "marketing.footerDocumentation", href: "/docs" },
  { key: "marketing.footerApi", href: "/docs" },
  { key: "marketing.footerDevelopers", href: "/docs" },
];

const resourcesLinks = [
  { key: "marketing.footerBlog", href: "/blog" },
  { key: "marketing.footerCommunity", href: "/blog" },
  { key: "marketing.footerDiscord", href: "https://discord.gg/tamerstudio", external: true },
  { key: "marketing.footerGithub", href: "https://github.com/tamerstudio", external: true },
];

const companyLinks = [
  { key: "marketing.footerAbout", href: "/about" },
  { key: "marketing.footerCareers", href: "/careers" },
  { key: "marketing.footerPress", href: "/about" },
  { key: "marketing.footerPartners", href: "/about" },
];

const legalLinks = [
  { key: "marketing.footerPrivacyPolicy", href: "/legal/privacy" },
  { key: "marketing.footerTermsOfService", href: "/legal/terms" },
  { key: "marketing.footerCookiePolicy", href: "/legal/privacy" },
  { key: "marketing.footerSecurity", href: "/about" },
  { key: "marketing.footerCompliance", href: "/about" },
];

export function Footer() {
  const { t } = useLocalizationContext();

  const renderLink = (link: { key: string; href: string; external?: boolean }) => {
    const label = t(link.key);
    if (link.external) {
      return (
        <a
          key={link.key}
          href={link.href as any}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted-foreground transition hover:text-primary group inline-flex items-center gap-1"
        >
          {label}
          <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
        </a>
      );
    }
    return (
      <Link 
        key={link.key} 
        href={link.href as any} 
        className="text-sm text-muted-foreground transition hover:text-primary group inline-flex items-center gap-1"
      >
        {label}
        <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
      </Link>
    );
  };

  return (
    <footer className="border-t border-border bg-gradient-to-b from-background to-muted/20" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-md">
                <span className="text-sm font-bold">TS</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">Tamer Studio</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("marketing.footerTagline")}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://discord.gg/tamerstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                aria-label="Discord"
              >
                <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                  <path d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515.075.075 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 4.18 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.96 19.96 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.062.062 0 0 0-.031-.03zM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
              <a
                href="https://github.com/tamerstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">{t("marketing.footerProduct")}</h3>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.key}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">{t("marketing.footerResources")}</h3>
            <ul className="space-y-2.5">
              {resourcesLinks.map((link) => (
                <li key={link.key}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">{t("marketing.footerCompany")}</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.key}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">{t("marketing.footerLegal")}</h3>
            <ul className="space-y-2.5 mb-6">
              {legalLinks.map((link) => (
                <li key={link.key}>{renderLink(link)}</li>
              ))}
            </ul>

            <h3 className="text-sm font-bold text-foreground mb-4">{t("marketing.footerContact")}</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:support@tamer.studio" className="text-sm text-muted-foreground transition hover:text-primary group inline-flex items-center gap-1">
                  {t("marketing.footerContactEmail")}
                  <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </a>
              </li>
              <li>
                <Link href={"/support" as any} className="text-sm text-muted-foreground transition hover:text-primary group inline-flex items-center gap-1">
                  {t("marketing.footerContactSupport")}
                  <ArrowRight className="size-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Tamer Studio. {t("marketing.footerAllRightsReserved")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("marketing.footerPoweredBy")} • {t("marketing.footerVersion")} 1.0.0 • {t("marketing.footerBuild")} 2026.07.25
          </p>
        </div>
      </div>
    </footer>
  );
}
