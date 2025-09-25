import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import webPushService from '../services/webPushService';
import { API_URL, API_BASE_URL } from '@/lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  token?: string;
  tradingStats: {
    totalChallenges: number;
    completedChallenges: number;
    totalProfit: number;
    winRate: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  // OTP functions
  sendForgotPasswordOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resetPasswordWithOTP: (email: string, otp: string, newPassword: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  // Registration OTP functions
  sendRegistrationOTP: (userData: RegisterData) => Promise<void>;
  verifyRegistrationOTP: (userData: RegisterData & { otp: string }) => Promise<void>;
  resendRegistrationOTP: (userData: Omit<RegisterData, 'password'>) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First try with localStorage token (most reliable for persistence)
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          
          // Quick JWT validation to avoid unnecessary API calls
          try {
            const tokenParts = storedToken.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const currentTime = Math.floor(Date.now() / 1000);
              
              if (payload.exp && payload.exp < currentTime) {
                localStorage.removeItem('token');
                setIsLoading(false);
                setIsInitialized(true);
                return;
              }
            }
          } catch (tokenError) {
            localStorage.removeItem('token');
            setIsLoading(false);
            setIsInitialized(true);
            return;
          }
          
          // Set a timeout to prevent long loading
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          );
          
          const authPromise = fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          try {
            const response = await Promise.race([authPromise, timeoutPromise]) as Response;
            
            if (response.ok) {
              const data = await response.json();
              setUser(data.data);
              setIsLoading(false);
              setIsInitialized(true);
              return;
            } else {
              localStorage.removeItem('token');
            }
          } catch (timeoutError) {
            // Continue to fallback
          }
        }

        // Fallback: try with cookies only (with timeout)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        const cookiePromise = fetch(`${API_URL}/auth/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        try {
          const response = await Promise.race([cookiePromise, timeoutPromise]) as Response;
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.data);
            setIsLoading(false);
            setIsInitialized(true);
            return;
          }
        } catch (timeoutError) {
          // Cookie authentication timeout
        }

        // No valid authentication found
        setIsLoading(false);
        setIsInitialized(true);
      } catch (error) {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuthStatus();
  }, []);

  const fetchUserProfileWithCookies = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        // Don't set token since we're using cookies
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({ ...data.data, token: authToken });
        
        // Initialize web push notifications for existing token
        if (webPushService.isSupported()) {
          setTimeout(async () => {
            try {
              await webPushService.initialize();
            } catch (error) {
              // Push notifications will be available when user grants permission
            }
          }, 100);
        }
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token: authToken, data: userData } = data;
        setToken(authToken);
        setUser({ ...userData, token: authToken });
        // Store token in localStorage as fallback for compatibility
        localStorage.setItem('token', authToken);
        
        // Initialize web push notifications after successful login
        if (webPushService.isSupported()) {
          setTimeout(async () => {
            try {
              await webPushService.initialize();
            } catch (error) {
              // Push notifications will be available when user grants permission
            }
          }, 100);
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        const { token: authToken, data: newUserData } = data;
        setToken(authToken);
        setUser({ ...newUserData, token: authToken });
        localStorage.setItem('token', authToken);
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to clear server-side cookies
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      // Silent error handling for logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      
      // Unregister web push subscription
      webPushService.unregisterSubscription();
    }
  };

  // OTP Functions
  const sendForgotPasswordOTP = async (email: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'OTP verification failed');
    }
  };

  const resetPasswordWithOTP = async (email: string, otp: string, newPassword: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  };

  const resendOTP = async (email: string): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend OTP');
    }
  };

  // Registration OTP functions
  const sendRegistrationOTP = async (userData: RegisterData): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/send-registration-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send verification code');
    }
  };

  const verifyRegistrationOTP = async (userData: RegisterData & { otp: string }): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-registration-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration verification failed');
      }

      // Set token and user data
      setToken(data.token);
      setUser({ ...data.user, token: data.token });
      localStorage.setItem('token', data.token);
    } catch (error: any) {
      throw new Error(error.message || 'Registration verification failed');
    }
  };

  const resendRegistrationOTP = async (userData: Omit<RegisterData, 'password'>): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/auth/resend-registration-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification code');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification code');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading: isLoading || !isInitialized,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    sendForgotPasswordOTP,
    verifyOTP,
    resetPasswordWithOTP,
    resendOTP,
    sendRegistrationOTP,
    verifyRegistrationOTP,
    resendRegistrationOTP,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};