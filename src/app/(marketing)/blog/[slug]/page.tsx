import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generatePageMetadata } from "@/core/seo";
import { BlogPostContent } from "./BlogPostContent";

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return generatePageMetadata({
    route: `/blog/${slug}`,
    title: post.title,
    description: post.excerpt,
    keywords: ["Tamer Studio", "blog", post.title],
    type: "article",
    author: post.author,
    publishedTime: post.date,
    breadcrumbs: [
      { label: "Home", href: "/" },
      { label: "Blog", href: "/blog" },
      { label: post.title, href: `/blog/${slug}` },
    ],
    schema: [
      {
        type: "Article",
        data: {
          title: post.title,
          description: post.excerpt,
          author: post.author,
          datePublished: post.date,
        },
      },
    ],
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return <BlogPostContent post={post} />;
}
