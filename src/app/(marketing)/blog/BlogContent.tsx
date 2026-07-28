"use client";

import * as React from "react";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";

const posts = [
  {
    slug: "introducing-tamer-studio",
    title: "Introducing Tamer Studio",
    excerpt: "Learn how Tamer Studio is redefining AI-native production for creators and teams.",
    date: "2026-07-20",
    author: "Tamer Team",
    content: "Tamer Studio is an AI-first production operating system. Plan, generate, organize, review, and publish content without switching between tools.",
  },
  {
    slug: "ai-workflows-at-scale",
    title: "AI Workflows at Scale",
    excerpt: "How to build production pipelines that chain AI models, apply guardrails, and route outputs.",
    date: "2026-07-15",
    author: "Sarah Chen",
    content: "Building production workflows with AI requires careful orchestration. In this post we walk through best practices for chaining models, applying guardrails, and routing outputs at scale.",
  },
  {
    slug: "cost-optimization-tips",
    title: "Cost Optimization Tips",
    excerpt: "Track spend per project, set budgets, and get alerts before you exceed limits.",
    date: "2026-07-10",
    author: "Rudi Hartono",
    content: "Managing AI costs is critical for sustainable production. This guide covers project-level budgets, real-time spend tracking, and alerting strategies.",
  },
  {
    slug: "multi-provider-ai",
    title: "Multi-Provider AI",
    excerpt: "Connect OpenAI, Gemini, Claude, OpenRouter, and Kilo with a single API key.",
    date: "2026-07-05",
    author: "Tamer Team",
    content: "With Tamer Studio you can connect any major AI provider through a unified interface. Switch providers and models with zero code changes.",
  },
  {
    slug: "versioning-prompts-models",
    title: "Versioning Prompts and Models",
    excerpt: "Version your prompts and models. Roll back to any previous state with confidence.",
    date: "2026-07-01",
    author: "Aisha Putri",
    content: "Prompt and model versioning ensures reproducibility. Every change is tracked, auditable, and reversible in one click.",
  },
  {
    slug: "community-gallery",
    title: "Community Gallery",
    excerpt: "Discover templates, plugins, and workflows built by the Tamer Studio community.",
    date: "2026-06-28",
    author: "Tamer Team",
    content: "The marketplace is growing fast. Here are the top community-built templates and plugins to power your next production cycle.",
  },
];

export function BlogContent() {
  const { t, locale } = useLocalizationContext();
  const dateLocale = locale === "id" ? "id-ID" : "en-US";

  return (
    <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("marketing.blogTitle")}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("marketing.blogDescription")}</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}` as any} className="group">
              <div className="rounded-2xl border border-border bg-card p-6 transition hover:border-foreground/20">
                <h3 className="font-semibold group-hover:underline">{post.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  <span suppressHydrationWarning>{new Date(post.date).toLocaleDateString(dateLocale)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
