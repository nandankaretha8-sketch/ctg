import { useState, useEffect, useCallback } from 'react';
import { useConditionalQuery } from './useConditionalQuery';

// Universal hook for page-based conditional loading
export const usePageData = <T = any>(
  queryKey: (string | number)[],
  endpoint: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    autoLoad?: boolean; // Whether to load automatically on mount
    manualTrigger?: boolean; // Whether to require manual trigger
  }
) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(options?.autoLoad !== false);

  const query = useConditionalQuery<T>(queryKey, endpoint, {
    enabled: shouldLoad && (options?.enabled !== false),
    manualTrigger: options?.manualTrigger,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
  });

  const triggerLoad = useCallback(() => {
    setShouldLoad(true);
    setHasLoaded(true);
    if (options?.manualTrigger) {
      query.triggerQuery();
    }
  }, [query.triggerQuery, options?.manualTrigger]);

  const resetLoad = useCallback(() => {
    setShouldLoad(false);
    setHasLoaded(false);
  }, []);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (options?.autoLoad !== false && !options?.manualTrigger) {
      setShouldLoad(true);
      setHasLoaded(true);
    }
  }, [options?.autoLoad, options?.manualTrigger]);

  return {
    ...query,
    triggerLoad,
    resetLoad,
    hasLoaded,
    shouldLoad,
  };
};

// Hook for tab-based page loading
export const useTabPageData = <T = any>(
  queryKey: (string | number)[],
  endpoint: string,
  activeTab: string,
  requiredTab: string,
  options?: {
    staleTime?: number;
    gcTime?: number;
  }
) => {
  return usePageData<T>(queryKey, endpoint, {
    enabled: activeTab === requiredTab,
    autoLoad: false, // Don't auto-load
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
  });
};

// Hook for manual page loading
export const useManualPageData = <T = any>(
  queryKey: (string | number)[],
  endpoint: string,
  options?: {
    staleTime?: number;
    gcTime?: number;
  }
) => {
  return usePageData<T>(queryKey, endpoint, {
    autoLoad: false,
    manualTrigger: true,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
  });
};

// Hook for conditional page loading based on user action
export const useActionPageData = <T = any>(
  queryKey: (string | number)[],
  endpoint: string,
  triggerCondition: boolean,
  options?: {
    staleTime?: number;
    gcTime?: number;
  }
) => {
  return usePageData<T>(queryKey, endpoint, {
    enabled: triggerCondition,
    autoLoad: false,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
  });
};
