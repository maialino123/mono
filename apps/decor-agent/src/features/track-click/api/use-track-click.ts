"use client";

import { useCallback } from 'react';

interface TrackClickParams {
  slug: string;
  source?: 'landing' | 'review';
}

export function useTrackClick() {
  const trackClick = useCallback(async ({ slug, source = 'landing' }: TrackClickParams) => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          source,
          referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
          timestamp: Date.now(),
        }),
      });
    } catch (error) {
      // Silent fail - don't block user navigation
      console.error('Track click failed:', error);
    }
  }, []);

  return { trackClick };
}
