"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { HomepageSectionDefinition, HomepageContext, HomepageResolutionResult } from "@/core/homepage";

interface UseHomepageState {
  sections: HomepageSectionDefinition[];
  metadata: Record<string, unknown> | null;
  seo: HomepageResolutionResult["seo"] | null;
  navigation: HomepageResolutionResult["navigation"] | null;
  localization: HomepageResolutionResult["localization"] | null;
  performance: Record<string, unknown> | null;
  loading: boolean;
  error: Error | null;
  resolvedAt: string | null;
}

interface UseHomepageReturn extends UseHomepageState {
  refetch: () => Promise<void>;
  resolvePreview: (options: {
    mode: "published" | "draft" | "responsive" | "locale";
    locale?: string;
    device?: "desktop" | "tablet" | "mobile";
    version?: number;
  }) => Promise<void>;
}

export function useHomepage(context?: Partial<HomepageContext>): UseHomepageReturn {
  const [state, setState] = useState<UseHomepageState>({
    sections: [],
    metadata: null,
    seo: null,
    navigation: null,
    localization: null,
    performance: null,
    loading: true,
    error: null,
    resolvedAt: null,
  });

  const fetchHomepage = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams();
      if (context?.locale) params.set("locale", context.locale);
      if (context?.device) params.set("device", context.device);
      if (context?.currency) params.set("currency", context.currency);

      const response = await fetch(`/api/homepage?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch homepage: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setState({
          sections: data.data.sections || [],
          metadata: data.data.metadata || null,
          seo: data.data.seo || null,
          navigation: data.data.navigation || null,
          localization: data.data.localization || null,
          performance: data.data.performance || null,
          loading: false,
          error: null,
          resolvedAt: data.data.resolvedAt || null,
        });
      } else {
        throw new Error(data.error || "Invalid response format");
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err : new Error("Unknown error"),
      }));
    }
  }, [context?.locale, context?.device, context?.currency]);

  useEffect(() => {
    fetchHomepage();
  }, [fetchHomepage]);

  const resolvePreview = useCallback(
    async (options: {
      mode: "published" | "draft" | "responsive" | "locale";
      locale?: string;
      device?: "desktop" | "tablet" | "mobile";
      version?: number;
    }) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await fetch("/api/homepage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            options,
            context: {
              locale: options.locale || context?.locale || "en",
              device: options.device || context?.device || "desktop",
              isPreview: true,
              previewMode: options.mode,
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to resolve preview: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setState({
            sections: data.data.sections || [],
            metadata: data.data.metadata || null,
            seo: data.data.seo || null,
            navigation: data.data.navigation || null,
            localization: data.data.localization || null,
            performance: null,
            loading: false,
            error: null,
            resolvedAt: data.data.resolvedAt || null,
          });
        } else {
          throw new Error(data.error || "Invalid preview response");
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err : new Error("Unknown error"),
        }));
      }
    },
    [context]
  );

  return {
    ...state,
    refetch: fetchHomepage,
    resolvePreview,
  };
}
