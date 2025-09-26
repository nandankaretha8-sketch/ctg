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
      console.log('🔍 [DEBUG] usePaymentStatus - checkPaymentStatus called');
      console.log('🔍 [DEBUG] serviceType:', serviceType);
      console.log('🔍 [DEBUG] serviceId:', serviceId);
      console.log('🔍 [DEBUG] serviceId type:', typeof serviceId);
      console.log('🔍 [DEBUG] serviceId length:', serviceId?.length);
      console.log('🔍 [DEBUG] serviceId isEmpty:', !serviceId || serviceId.trim() === '');
      
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          console.log('🔍 [DEBUG] No token found, setting status to none');
          setPaymentStatus({ status: 'none' });
          return;
        }

        // Don't make API call if serviceId is empty or undefined
        if (!serviceId || serviceId.trim() === '') {
          console.log('🔍 [DEBUG] ⚠️ SKIPPING API call - serviceId is empty or undefined');
          setPaymentStatus({ status: 'none' });
          setLoading(false);
          return;
        }

        const url = `${API_URL}/manual-payments/status/${serviceType}/${serviceId}`;
        console.log('🔍 [DEBUG] Making API call to:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('🔍 [DEBUG] API response status:', response.status);
        console.log('🔍 [DEBUG] API response ok:', response.ok);

        const data = await response.json();
        console.log('🔍 [DEBUG] API response data:', data);

        if (data.success) {
          setPaymentStatus(data.data);
        } else {
          setPaymentStatus({ status: 'none' });
        }
      } catch (error) {
        console.error('🔍 [DEBUG] Error checking payment status:', error);
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
