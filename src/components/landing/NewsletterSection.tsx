"use client";

import * as React from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

export function NewsletterSection({ section }: SectionRendererProps) {
  const { resolve } = useLocalizationContext();
  const config = section.config as Record<string, unknown> | undefined;

  const title = resolve(config?.title as string) || section.title;
  const description = resolve(config?.description as string) || section.description;
  const buttonText = resolve(config?.buttonText as string) || "Subscribe";
  const placeholderText = resolve(config?.placeholderText as string) || "Enter your email";
  const successMessage = resolve(config?.successMessage as string) || "Thanks for subscribing!";

  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/landing/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        const data = await res.json();
        setErrorMsg(data.error?.message || "Subscription failed");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Network error");
      setStatus("error");
    }
  };

  return (
    <section className="border-t border-border" aria-labelledby="newsletter-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-xl text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
            <Mail className="size-6 text-primary" />
          </div>
          {title && (
            <h2 id="newsletter-heading" className="text-3xl sm:text-4xl font-bold tracking-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-3 text-muted-foreground">{description}</p>
          )}

          {status === "success" ? (
            <div className="mt-8 inline-flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-6 py-3 text-green-600 dark:text-green-400">
              <CheckCircle className="size-5" />
              <span className="font-medium">{successMessage}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholderText}
                required
                className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:shadow-lg hover:scale-105 duration-200 disabled:opacity-50"
              >
                {status === "loading" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  buttonText
                )}
              </button>
            </form>
          )}

          {status === "error" && errorMsg && (
            <p className="mt-3 text-sm text-destructive">{errorMsg}</p>
          )}
        </div>
      </div>
    </section>
  );
}
