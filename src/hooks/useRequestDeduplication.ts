import { useRef } from 'react';

// Request deduplication hook to prevent duplicate API calls
export const useRequestDeduplication = () => {
  const pendingRequests = useRef<Map<string, Promise<any>>>(new Map());

  const deduplicateRequest = <T>(
    key: string,
    requestFn: () => Promise<T>
  ): Promise<T> => {
    // If request is already pending, return the existing promise
    if (pendingRequests.current.has(key)) {
      return pendingRequests.current.get(key)!;
    }

    // Create new request and store it
    const request = requestFn().finally(() => {
      // Remove from pending requests when done
      pendingRequests.current.delete(key);
    });

    pendingRequests.current.set(key, request);
    return request;
  };

  return { deduplicateRequest };
};
