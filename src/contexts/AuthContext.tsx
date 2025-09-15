import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import webPushService from '../services/webPushService';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
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
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
        
        // Initialize web push notifications for existing token
        if (webPushService.isSupported()) {
          setTimeout(async () => {
            try {
              await webPushService.initialize();
              console.log('✅ Push notifications initialized successfully');
            } catch (error) {
              console.log('ℹ️ Push notifications will be available when user grants permission');
            }
          }, 100);
        }
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { token: authToken, data: userData } = data;
        setToken(authToken);
        setUser(userData);
        localStorage.setItem('token', authToken);
        
        // Initialize web push notifications after successful login
        if (webPushService.isSupported()) {
          setTimeout(async () => {
            try {
              await webPushService.initialize();
              console.log('✅ Push notifications initialized successfully');
            } catch (error) {
              console.log('ℹ️ Push notifications will be available when user grants permission');
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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
        setUser(newUserData);
        localStorage.setItem('token', authToken);
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    
    // Unregister web push subscription
    webPushService.unregisterSubscription();
  };

  // OTP Functions
  const sendForgotPasswordOTP = async (email: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password-otp`, {
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
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
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
      const response = await fetch(`${API_BASE_URL}/auth/reset-password-otp`, {
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
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
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

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    sendForgotPasswordOTP,
    verifyOTP,
    resetPasswordWithOTP,
    resendOTP,
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
