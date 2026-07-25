"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";

function Dropdown({ label, items, isOpen, onToggle, align = "left" }: {
  label: string;
  items: { label: string; href: string }[];
  isOpen: boolean;
  onToggle: () => void;
  align?: "left" | "right";
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-primary"
        aria-expanded={isOpen}
      >
        {label}
        <ChevronDown className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-2 w-48 rounded-xl border border-border bg-popover p-1 shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-200",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href as any}
              className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Landing-page specific translations (isolated from global translations)
const LANDING_PAGE_TRANSLATIONS = {
  getStartedButton: "Get Started Free",
  signInButton: "Sign In",
} as const;

export function Header() {
  const { t } = useLocalizationContext();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [resourcesOpen, setResourcesOpen] = React.useState(false);
  const [productOpen, setProductOpen] = React.useState(false);

  const navRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
        setProductOpen(false);
      }
    }
    if (resourcesOpen || productOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [resourcesOpen, productOpen]);

  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setMobileOpen(false);
    }
  };

  const resourcesItems = [
    { label: t("marketing.menuBlog"), href: "/blog" },
    { label: t("marketing.menuDocumentation"), href: "/docs" },
    { label: t("marketing.menuRoadmap"), href: "/roadmap" },
    { label: t("marketing.menuCommunity"), href: "/blog" },
  ];

  const productItems = [
    { label: "Features", href: "#features" },
    { label: t("marketing.menuPricing"), href: "#pricing" },
    { label: "AI Platform", href: "#ai-platform" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 transition hover:opacity-80" aria-label="Tamer Studio home">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-md">
                <span className="text-sm font-bold">TS</span>
              </div>
              <span className="hidden sm:inline text-lg font-semibold tracking-tight">Tamer Studio</span>
            </Link>

            <nav ref={navRef} className="hidden md:flex items-center gap-6" aria-label="Main">
              <Dropdown
                label={t("marketing.menuProduct")}
                items={productItems}
                isOpen={productOpen}
                onToggle={() => { setProductOpen((p) => !p); setResourcesOpen(false); }}
              />
              <Dropdown
                label={t("marketing.menuResources")}
                items={resourcesItems}
                isOpen={resourcesOpen}
                onToggle={() => { setResourcesOpen((p) => !p); setProductOpen(false); }}
                align="right"
              />
              <button
                type="button"
                onClick={() => scrollTo("pricing")}
                className="text-sm font-medium text-muted-foreground transition hover:text-primary"
                title="Press P"
              >
                {t("marketing.menuPricing")}
              </button>
              <button
                type="button"
                onClick={() => scrollTo("contact")}
                className="text-sm font-medium text-muted-foreground transition hover:text-primary"
                title="Press C"
              >
                {t("marketing.menuContact")}
              </button>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted-foreground transition hover:text-primary">
              {t("marketing.menuSignIn")}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary/80 px-4 py-2 text-sm font-medium text-primary-foreground transition hover:shadow-lg hover:scale-105 duration-200"
            >
              {LANDING_PAGE_TRANSLATIONS.getStartedButton}
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? t("marketing.mobileClose") : t("marketing.mobileMenu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t border-border bg-background animate-in fade-in slide-in-from-top-2 duration-200"
          suppressHydrationWarning
        >
          <nav className="mx-auto max-w-7xl px-4 py-4 space-y-1" aria-label="Mobile">
            {productItems.map((item) => (
              <Link
                key={item.label}
                href={item.href as any}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {resourcesItems.map((item) => (
              <Link
                key={item.label}
                href={item.href as any}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {t("marketing.menuSignIn")}
            </Link>
            <Link
              href="/register"
              className="block rounded-lg px-3 py-2 text-sm font-medium bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center transition hover:shadow-lg"
              onClick={() => setMobileOpen(false)}
            >
              {LANDING_PAGE_TRANSLATIONS.getStartedButton}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
