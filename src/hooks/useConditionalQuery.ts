import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '@/lib/api';

// Hook for conditional API calls - only loads when explicitly enabled
export const useConditionalQuery = <T = any>(
  queryKey: (string | number)[],
  endpoint: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
    manualTrigger?: boolean; // New: only load when manually triggered
  }
) => {
  const queryClient = useQueryClient();

  const query = useQuery<T>({
    queryKey,
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    gcTime: options?.gcTime || 10 * 60 * 1000,
    refetchOnWindowFocus: options?.refetchOnWindowFocus || false,
    enabled: options?.enabled !== false && !options?.manualTrigger, // Don't auto-load if manual trigger
  });

  // Manual trigger function
  const triggerQuery = () => {
    if (options?.manualTrigger) {
      queryClient.fetchQuery({
        queryKey,
        queryFn: async () => {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
          });

          if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }

          return response.json();
        },
        staleTime: options?.staleTime || 5 * 60 * 1000,
      });
    }
  };

  return {
    ...query,
    triggerQuery,
  };
};

// Hook for tab-based conditional loading
export const useTabBasedQuery = <T = any>(
  queryKey: (string | number)[],
  endpoint: string,
  activeTab: string,
  requiredTab: string,
  options?: {
    staleTime?: number;
    gcTime?: number;
  }
) => {
  return useConditionalQuery<T>(queryKey, endpoint, {
    enabled: activeTab === requiredTab,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
  });
};
