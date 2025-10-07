import { API_URL } from '@/lib/api';

/**
 * Helper function to make authenticated API calls
 * @param endpoint - API endpoint (without /api prefix)
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export const authenticatedFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  return fetch(`${API_URL}${endpoint}`, defaultOptions);
};

/**
 * Helper function to make public API calls (no auth required)
 * @param endpoint - API endpoint (without /api prefix)
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export const publicFetch = async (endpoint: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  return fetch(`${API_URL}${endpoint}`, defaultOptions);
};

/**
 * Helper function to handle API responses with error handling
 * @param response - Fetch response
 * @returns Promise<any>
 */
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Helper function to make authenticated API calls with automatic error handling
 * @param endpoint - API endpoint (without /api prefix)
 * @param options - Fetch options
 * @returns Promise<any>
 */
export const authenticatedApiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await authenticatedFetch(endpoint, options);
  return handleApiResponse(response);
};

/**
 * Helper function to make public API calls with automatic error handling
 * @param endpoint - API endpoint (without /api prefix)
 * @param options - Fetch options
 * @returns Promise<any>
 */
export const publicApiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await publicFetch(endpoint, options);
  return handleApiResponse(response);
};