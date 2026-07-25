import { useState, useEffect, useCallback } from 'react';

export type LandingSection = {
  id: string;
  sectionKey: string;
  title: string;
  description: string | null;
  component: string;
  type: string;
  visible: boolean;
  locked: boolean;
  order: number;
  config: Record<string, unknown>;
  styles: Record<string, unknown>;
  createdAt: Date | string;
  updatedAt: Date | string;
  media?: Array<{
    id: string;
    url: string;
    type: string;
    order: number;
  }>;
};

type UseLandingSectionsState = {
  sections: LandingSection[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export function useLandingSections(): UseLandingSectionsState {
  const [sections, setSections] = useState<LandingSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/landing/sections', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch landing sections: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        const visible = data.data.filter((s: LandingSection) => s.visible);
        setSections(visible);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return {
    sections,
    loading,
    error,
    refetch: fetchSections,
  };
}
