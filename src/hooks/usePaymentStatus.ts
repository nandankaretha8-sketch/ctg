import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

export interface PaymentStatus {
  status: 'none' | 'pending' | 'verified' | 'failed';
  paymentId?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
  submittedAt?: string;
  verifiedAt?: string;
}

export const usePaymentStatus = (serviceType: string, serviceId: string) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'none' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setPaymentStatus({ status: 'none' });
          return;
        }

        const response = await fetch(`${API_URL}/manual-payments/status/${serviceType}/${serviceId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success) {
          setPaymentStatus(data.data);
        } else {
          setPaymentStatus({ status: 'none' });
        }
      } catch (error) {
        // Error handling:'Error checking payment status:', error);
        setError('Failed to check payment status');
        setPaymentStatus({ status: 'none' });
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [serviceType, serviceId]);

  const refreshPaymentStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/manual-payments/status/${serviceType}/${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setPaymentStatus(data.data);
      }
    } catch (error) {
      // Error handling:'Error refreshing payment status:', error);
    }
  };

  return {
    paymentStatus,
    loading,
    error,
    refreshPaymentStatus
  };
};