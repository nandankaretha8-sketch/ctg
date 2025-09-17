// API utility functions for environment-based configuration

const getApiBaseUrl = (): string => {
  // In production (Vercel), use the environment variable
  // In development, fallback to localhost
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
};

const getApiUrl = (): string => {
  // Use the full API URL with /api prefix
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();
export const API_URL = getApiUrl();

// Helper function to make API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  return fetch(url, { ...defaultOptions, ...options });
};

// Helper function for authenticated API calls
export const authenticatedApiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  return apiCall(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};

export default {
  API_BASE_URL,
  API_URL,
  apiCall,
  authenticatedApiCall,
};
