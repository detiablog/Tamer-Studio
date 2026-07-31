"use client";

import * as React from "react";
import { ArrowRight, Clock, User } from "lucide-react";
import { useLocalizationContext } from "@/providers/localization";
import type { SectionRendererProps } from "@/lib/landing-section-renderer";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: string | null;
  coverImage: string | null;
  category: string | null;
  readTime: number;
  publishedAt: string | null;
}

export function BlogPreview({ section }: SectionRendererProps) {
  const { resolve } = useLocalizationContext();
  const config = section.config as Record<string, unknown> | undefined;

  const title = resolve(config?.title as string) || section.title;
  const description = resolve(config?.description as string) || section.description;
  const viewAllText = resolve(config?.viewAllText as string) || "View All Posts";
  const viewAllLink = (config?.viewAllLink as string) || "/blog";
  const limit = (config?.limit as number) || 3;

  const [posts, setPosts] = React.useState<BlogPost[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch(`/api/landing/blog?limit=${limit}&status=published`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setPosts(data.data.slice(0, limit));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <section className="border-t border-border" aria-labelledby="blog-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            {title && (
              <h2 id="blog-heading" className="text-3xl sm:text-4xl font-bold tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
          </div>
          <a
            href={viewAllLink}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline shrink-0"
          >
            {viewAllText}
            <ArrowRight className="size-4" />
          </a>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No posts available yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <a
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/10 transition"
              >
                {post.coverImage ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}
                <div className="p-5">
                  {post.category && (
                    <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary mb-2">
                      {post.category}
                    </span>
                  )}
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    {post.author && (
                      <span className="inline-flex items-center gap-1">
                        <User className="size-3" />
                        {post.author}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {post.readTime} min read
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
