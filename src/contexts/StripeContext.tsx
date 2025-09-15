import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';

interface StripeContextType {
  stripe: Stripe | null;
  loading: boolean;
  error: string | null;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

interface StripeProviderProps {
  children: React.ReactNode;
  publishableKey?: string;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ 
  children, 
  publishableKey 
}) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStripe = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!publishableKey) {
          throw new Error('Stripe publishable key is required');
        }

        const stripeInstance = await loadStripe(publishableKey);
        setStripe(stripeInstance);
      } catch (err) {
        console.error('Error initializing Stripe:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Stripe');
      } finally {
        setLoading(false);
      }
    };

    initializeStripe();
  }, [publishableKey]);

  const value: StripeContextType = {
    stripe,
    loading,
    error
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};

export const useStripe = (): StripeContextType => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};
