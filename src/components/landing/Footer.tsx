"use client";

import * as React from "react";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";
import { ArrowRight } from "lucide-react";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

function toFooterLink(item: string | { label: string; href?: string; external?: boolean }, idx: number): FooterLink {
  if (typeof item === "string") {
    const href = `#${item.toLowerCase().replace(/\s+/g, "-")}`;
    return { label: item, href };
  }
  return {
    label: item.label,
    href: item.href || `#link-${idx}`,
    external: item.external,
  };
}

const DEFAULT_LINKS = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Roadmap", href: "/roadmap" },
    { label: "Documentation", href: "/docs" },
    { label: "API", href: "/docs" },
    { label: "Developers", href: "/docs" },
  ],
  resources: [
    { label: "Blog", href: "#" },
    { label: "Community", href: "#" },
    { label: "Discord", href: "https://discord.gg/tamerstudio", external: true },
    { label: "GitHub", href: "https://github.com/tamerstudio", external: true },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Partners", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Cookie Policy", href: "#" },
    { label: "Security", href: "#" },
    { label: "Compliance", href: "#" },
  ],
};

export function Footer({ section }: SectionRendererProps) {
  const { t } = useLocalizationContext();

  const companyName = (section.config.companyName as string) || section.title || "Tamer Studio";
  const tagline = (section.config.tagline as string) || t("footerTagline", "Tamer Studio. From intent to production.");
  const rawLinks = (section.config.links as Record<string, unknown>) || {};
  const links = {
    product: rawLinks.product ? (rawLinks.product as unknown[]).map(toFooterLink) : DEFAULT_LINKS.product,
    resources: rawLinks.resources ? (rawLinks.resources as unknown[]).map(toFooterLink) : DEFAULT_LINKS.resources,
    company: rawLinks.company ? (rawLinks.company as unknown[]).map(toFooterLink) : DEFAULT_LINKS.company,
    legal: rawLinks.legal ? (rawLinks.legal as unknown[]).map(toFooterLink) : DEFAULT_LINKS.legal,
  };

  const socialLinks = ((section.config.socialLinks as Array<{ label: string; href: string; ariaLabel?: string }>) || []);
  const contactEmail = (section.config.contactEmail as string) || "support@tamer.studio";
  const supportHref = (section.config.supportHref as string) || "/support";
  const version = (section.config.version as string) || "1.0.0";
  const build = (section.config.build as string) || "2026.07.25";

  const renderLink = (link: FooterLink) => {
    if (link.external) {
      return (
        <a key={link.label + link.href} href={link.href} target="_blank" rel="noopener noreferrer"
          className="text-sm text-muted-foreground transition hover:text-primary">
          {link.label}
        </a>
      );
    }
    return (
      <Link key={link.label + link.href} href={link.href as any}
        className="text-sm text-muted-foreground transition hover:text-primary">
        {link.label}
      </Link>
    );
  };

  return (
    <footer className="border-t border-border bg-background" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5 mb-12">
          {/* Logo + tagline */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-md">
                <span className="text-sm font-bold">TS</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">{companyName}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
              {tagline}
            </p>
            {socialLinks.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                {socialLinks.map((social, sidx) => (
                  <a key={social.label + sidx} href={social.href} target="_blank" rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                    aria-label={social.ariaLabel || social.label}>
                    {social.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">{t("marketing.footerProduct", "Product")}</h3>
            <ul className="space-y-2.5">
              {links.product.map((link) => (
                <li key={String(link.label) + link.href}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">{t("marketing.footerResources", "Resources")}</h3>
            <ul className="space-y-2.5">
              {links.resources.map((link) => (
                <li key={String(link.label) + link.href}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">{t("marketing.footerCompany", "Company")}</h3>
            <ul className="space-y-2.5">
              {links.company.map((link) => (
                <li key={String(link.label) + link.href}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4">{t("marketing.footerLegal", "Legal")}</h3>
            <ul className="space-y-2.5 mb-6">
              {links.legal.map((link) => (
                <li key={String(link.label) + link.href}>{renderLink(link)}</li>
              ))}
            </ul>
            <h3 className="text-sm font-bold text-foreground mb-4">{t("marketing.footerContact", "Contact")}</h3>
            <ul className="space-y-2.5">
              <li>
                <a href={`mailto:${contactEmail}`} className="text-sm text-muted-foreground transition hover:text-primary">
                  {contactEmail}
                </a>
              </li>
              <li>
                <Link href={supportHref as any} className="text-sm text-muted-foreground transition hover:text-primary">
                  {t("marketing.footerContactSupport", "Support")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {companyName}. {t("marketing.footerAllRightsReserved", "All rights reserved.")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("marketing.footerPoweredBy", "Powered by Tamer Studio")} &bull; {t("marketing.footerVersion", "Version")} {version} &bull; {t("marketing.footerBuild", "Build")} {build}
          </p>
        </div>
      </div>
    </footer>
  );
}
