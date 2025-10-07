import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, ArrowLeft, Home, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentSuccessData {
  serviceData: {
    id: string;
    name: string;
    price: number;
    type: string;
  };
  paymentData: {
    paymentId: string;
    status: string;
    transactionId: string;
    amount: number;
    currency: string;
  };
}

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState<PaymentSuccessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.paymentData) {
      setPaymentData(location.state.paymentData);
      setLoading(false);
    } else {
      // If no payment data, redirect to dashboard
      navigate('/dashboard');
    }
  }, [location.state, navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-8 w-8 text-yellow-500" />;
      case 'verified':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <Clock className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'verified':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your payment is under verification. You will receive access as soon as it gets verified.';
      case 'verified':
        return 'Your payment has been verified! You now have access to the service.';
      case 'failed':
        return 'Your payment verification failed. Please contact support for assistance.';
      default:
        return 'Your payment is under verification. You will receive access as soon as it gets verified.';
    }
  };

  const handlePrimaryAction = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">No payment data found</div>
      </div>
    );
  }

  const { serviceData, paymentData: payment } = paymentData;

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {payment.status === 'verified' ? 'Payment Confirmed' : payment.status === 'failed' ? 'Payment Failed' : 'Payment Under Verification'}
          </h1>
          <p className="text-gray-300">Your payment details have been received</p>
        </div>

        {/* Main Card */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon(payment.status)}
                </div>
            <CardTitle className="text-white text-2xl">
              {payment.status === 'verified' ? 'Payment Verified!' : 'Payment Under Review'}
            </CardTitle>
                <CardDescription className="text-gray-300">
              {getStatusMessage(payment.status)}
                </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="bg-white/5 rounded-lg p-4 space-y-3">
              <h3 className="text-white font-semibold">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                        <span className="text-gray-400">Service:</span>
                  <p className="text-white font-medium">{serviceData.name}</p>
                      </div>
                <div>
                        <span className="text-gray-400">Amount:</span>
                  <p className="text-white font-medium">${payment.amount} {payment.currency}</p>
                </div>
                <div>
                  <span className="text-gray-400">Transaction ID:</span>
                  <p className="text-white font-mono text-xs">{payment.transactionId}</p>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                  </div>
                  </div>
                  </div>

            {/* Status Message */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {getStatusIcon(payment.status)}
                <div>
                  <h4 className="text-white font-semibold mb-2">
                    {payment.status === 'verified' ? 'Access Granted' : 'What happens next?'}
                  </h4>
                  <p className="text-gray-300 text-sm">
                    {payment.status === 'verified' 
                      ? 'You can now access your service.'
                      : 'Our team will verify your payment within 24 hours. You will receive an email notification once verified.'
                    }
                  </p>
                  </div>
              </div>
            </div>

            {/* Primary Action */}
            <div className="flex">
              <Button
                onClick={handlePrimaryAction}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Go to Home
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Need help? Contact our support team for assistance.
              </p>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;