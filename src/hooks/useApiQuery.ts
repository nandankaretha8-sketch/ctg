import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '@/lib/api';

// Custom hook for GET requests with caching
export const useApiQuery = <T = any>(
  queryKey: (string | number)[],
  endpoint: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
  }
) => {
  return useQuery<T>({
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
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes default
    gcTime: options?.gcTime || 10 * 60 * 1000, // 10 minutes default
    refetchOnWindowFocus: options?.refetchOnWindowFocus || false,
    enabled: options?.enabled !== false,
  });
};

// Custom hook for authenticated GET requests
export const useAuthenticatedQuery = <T = any>(
  queryKey: (string | number)[],
  endpoint: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    gcTime?: number;
  }
) => {
  return useApiQuery<T>(queryKey, endpoint, {
    ...options,
    enabled: options?.enabled !== false && !!localStorage.getItem('token'),
  });
};

// Custom hook for mutations (POST, PUT, DELETE)
export const useApiMutation = <TData = any, TVariables = any>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: (string | number)[][];
  }
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(variables),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
      
      // Invalidate related queries to refresh data
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
    },
    onError: options?.onError,
  });
};

// Helper function to invalidate multiple queries
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return (queryKeys: (string | number)[][]) => {
    queryKeys.forEach(queryKey => {
      queryClient.invalidateQueries({ queryKey });
    });
  };
};
