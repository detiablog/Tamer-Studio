"use client";

import * as React from "react";
import Link from "next/link";
import { useLocalizationContext } from "@/providers/localization";
import { cn } from "@/lib/utils";

const posts = [
  {
    slug: "introducing-tamer-studio",
    title: "Introducing Tamer Studio",
    excerpt: "Learn how Tamer Studio is redefining AI-native production for creators and teams.",
    date: "2026-07-20",
    author: "Tamer Team",
    content: "Tamer Studio is an AI-first production operating system. Plan, generate, organize, review, and publish content without switching between tools. We built this platform because the current generation of AI tools is fragmented and disconnected from real production workflows. Tamer Studio bridges that gap by putting production first.",
    related: ["ai-workflows-at-scale", "cost-optimization-tips"],
  },
  {
    slug: "ai-workflows-at-scale",
    title: "AI Workflows at Scale",
    excerpt: "How to build production pipelines that chain AI models, apply guardrails, and route outputs.",
    date: "2026-07-15",
    author: "Sarah Chen",
    content: "Building production workflows with AI requires careful orchestration. In this post we walk through best practices for chaining models, applying guardrails, and routing outputs at scale.",
    related: ["multi-provider-ai", "introducing-tamer-studio"],
  },
  {
    slug: "cost-optimization-tips",
    title: "Cost Optimization Tips",
    excerpt: "Track spend per project, set budgets, and get alerts before you exceed limits.",
    date: "2026-07-10",
    author: "Rudi Hartono",
    content: "Managing AI costs is critical for sustainable production. This guide covers project-level budgets, real-time spend tracking, and alerting strategies.",
    related: ["versioning-prompts-models", "ai-workflows-at-scale"],
  },
  {
    slug: "multi-provider-ai",
    title: "Multi-Provider AI",
    excerpt: "Connect OpenAI, Gemini, Claude, OpenRouter, and Kilo with a single API key.",
    date: "2026-07-05",
    author: "Tamer Team",
    content: "With Tamer Studio you can connect any major AI provider through a unified interface. Switch providers and models with zero code changes.",
    related: ["versioning-prompts-models", "introducing-tamer-studio"],
  },
  {
    slug: "versioning-prompts-models",
    title: "Versioning Prompts and Models",
    excerpt: "Version your prompts and models. Roll back to any previous state with confidence.",
    date: "2026-07-01",
    author: "Aisha Putri",
    content: "Prompt and model versioning ensures reproducibility. Every change is tracked, auditable, and reversible in one click.",
    related: ["multi-provider-ai", "community-gallery"],
  },
  {
    slug: "community-gallery",
    title: "Community Gallery",
    excerpt: "Discover templates, plugins, and workflows built by the Tamer Studio community.",
    date: "2026-06-28",
    author: "Tamer Team",
    content: "The marketplace is growing fast. Here are the top community-built templates and plugins to power your next production cycle.",
    related: ["multi-provider-ai", "versioning-prompts-models"],
  },
];

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t, locale } = useLocalizationContext();
  const resolvedParams = React.use(params);
  const post = posts.find((p) => p.slug === resolvedParams.slug);
  const dateLocale = locale === "id" ? "id-ID" : "en-US";

  if (!post) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="text-2xl font-semibold">Post not found</h1>
        <Link href={"/blog" as any} className="text-primary hover:underline">{t("marketing.blogBackToBlog")}</Link>
      </div>
    );
  }

  const related = posts.filter((p) => post.related.includes(p.slug));

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <Link href={"/blog" as any} className="text-sm text-muted-foreground hover:text-foreground">{t("marketing.blogBackToBlog")}</Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
      <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
        <span suppressHydrationWarning>{t("marketing.blogPublishedOn")} {new Date(post.date).toLocaleDateString(dateLocale)}</span>
        <span>•</span>
        <span>{t("marketing.blogByAuthor")} {post.author}</span>
      </div>
      <div className="mt-8 space-y-4 leading-7 text-muted-foreground">
        {post.content.split("\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
      {related.length > 0 && (
        <div className="mt-16 border-t pt-8">
          <h2 className="text-lg font-semibold">{t("marketing.learnMore")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}` as any} className="rounded-xl border border-border bg-card p-4 hover:border-foreground/20">
                <h3 className="font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
