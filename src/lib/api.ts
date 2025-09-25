// API utility functions for environment-based configuration

const getApiBaseUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.trim();
  }
  
  // Fallback to production backend URL
  return 'https://ctg-server-5x6s4jqe4-nandankarethas-projects.vercel.app';
};

const getApiUrl = (): string => {
  // Check for full API URL first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.trim();
  }
  
  // Construct from base URL
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api`;
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = getApiUrl();


// Get CSRF token (always fetch fresh token)
const getCSRFToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${API_URL}/csrf-token`, {
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      return data.csrfToken;
    }
  } catch (error) {
    // Silent error handling for CSRF token
  }
  return null;
};

// Helper function to make API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  // Add CSRF token for state-changing requests
  if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
    const token = await getCSRFToken();
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'X-CSRF-Token': token,
      };
    }
  }

  try {
    // Merge options properly to preserve body and other properties
    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      }
    };
    
    console.log('Making API call:', { url, method: finalOptions.method, body: finalOptions.body });
    
    const response = await fetch(url, finalOptions);
    
    // Response status check
    
    return response;
  } catch (error) {
    throw error;
  }
};

// Helper function for authenticated API calls
export const authenticatedApiCall = async (endpoint: string, options: RequestInit = {}) => {
  // Skip CSRF protection for challenges (temporarily disabled)
  if (endpoint.includes('/challenges')) {
    // Try to get token from localStorage first (fallback for compatibility)
    const token = localStorage.getItem('token');
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Add Authorization header if token exists (fallback for compatibility)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Direct API call without CSRF protection for challenges
    return apiCall(endpoint, {
      ...options,
      headers,
      credentials: 'include',
    });
  }

  // For other endpoints, use the original CSRF-protected logic
  const token = localStorage.getItem('token');
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Add Authorization header if token exists (fallback for compatibility)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Cookies will be sent automatically by the browser for primary authentication
  const response = await apiCall(endpoint, {
    ...options,
    headers,
    credentials: 'include', // Include cookies in requests
  });

  // If we get a 403 error, it might be a CSRF token issue, so retry once with fresh token
  if (response.status === 403 && options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) {
    console.log('CSRF token might be expired, retrying with fresh token...');
    
    // Get fresh CSRF token and retry
    const freshToken = await getCSRFToken();
    if (freshToken) {
      const retryHeaders = {
        ...headers,
        'X-CSRF-Token': freshToken,
      };
      
      return apiCall(endpoint, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      });
    }
  }

  return response;
};

export default {
  API_BASE_URL,
  API_URL,
  apiCall,
  authenticatedApiCall,
};