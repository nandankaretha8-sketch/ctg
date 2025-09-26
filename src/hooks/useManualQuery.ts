import { useState, useCallback } from 'react';
import { useConditionalQuery } from './useConditionalQuery';

// Hook for manual API loading - only loads when user explicitly triggers
export const useManualQuery = <T = any>(
  queryKey: (string | number)[],
  endpoint: string,
  options?: {
    staleTime?: number;
    gcTime?: number;
  }
) => {
  const [hasTriggered, setHasTriggered] = useState(false);

  const query = useConditionalQuery<T>(queryKey, endpoint, {
    enabled: hasTriggered, // Only enabled after manual trigger
    manualTrigger: true,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
  });

  const triggerQuery = useCallback(() => {
    setHasTriggered(true);
    if (query.triggerQuery) {
      query.triggerQuery();
    }
  }, [query.triggerQuery]);

  const resetQuery = useCallback(() => {
    setHasTriggered(false);
  }, []);

  return {
    ...query,
    triggerQuery,
    resetQuery,
    hasTriggered,
  };
};

// Alias for useManualPageData to maintain compatibility
export const useManualPageData = useManualQuery;
