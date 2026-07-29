import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getSEORuntime } from "./seo-runtime";

function resolveLocale(): string {
  try {
    // This is sync-safe in Next.js server components
    return "en";
  } catch {
    return "en";
  }
}

export async function generatePageMetadata(input: {
  route: string;
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  breadcrumbs?: Array<{ label: string; href: string }>;
  schema?: Array<{ type: string; data: Record<string, unknown> }>;
  locale?: string;
}): Promise<Metadata> {
  const seoRuntime = getSEORuntime();
  const locale = input.locale || "en";

  try {
    const resolved = await seoRuntime.resolvePage({
      route: input.route,
      locale,
      image: input.image,
      type: input.type,
      keywords: input.keywords,
      author: input.author,
      publishedTime: input.publishedTime,
      modifiedTime: input.modifiedTime,
      noindex: input.noindex,
      breadcrumbs: input.breadcrumbs,
      schema: input.schema as any,
    });

    return {
      title: resolved.metadata.title,
      description: resolved.metadata.description,
      keywords: resolved.metadata.keywords,
      authors: [{ name: resolved.metadata.author }],
      creator: resolved.metadata.publisher,
      openGraph: {
        title: resolved.openGraph.title,
        description: resolved.openGraph.description,
        type: resolved.openGraph.type as "website" | "article",
        url: resolved.openGraph.url,
        siteName: resolved.openGraph.siteName,
        images: resolved.openGraph.images,
        locale: resolved.openGraph.locale,
      },
      twitter: {
        card: resolved.twitter.card,
        title: resolved.twitter.title,
        description: resolved.twitter.description,
        images: resolved.twitter.images,
      },
      robots: {
        index: resolved.robots.index,
        follow: resolved.robots.follow,
      },
      alternates: {
        canonical: resolved.canonical.canonical,
        languages: resolved.hreflang.reduce<Record<string, string>>((acc, h) => {
          acc[h.hreflang] = h.href;
          return acc;
        }, {}),
      },
    };
  } catch {
    return {
      title: input.title || "Tamer Studio",
      description: input.description || "Tamer Studio is an AI-first production operating system.",
      robots: { index: true, follow: true },
    };
  }
}
