import React, { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, AddressElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
  description?: string;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  clientSecret,
  amount,
  currency,
  onSuccess,
  onError,
  onCancel,
  description
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [hasAttemptedPayment, setHasAttemptedPayment] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    if (!clientSecret) {
      return;
    }

    // Only check payment status if user has attempted payment
    if (hasAttemptedPayment) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case 'succeeded':
            setMessage('Payment succeeded!');
            setIsComplete(true);
            break;
          case 'processing':
            setMessage('Your payment is processing.');
            break;
          case 'requires_payment_method':
            setMessage('Your payment was not successful, please try again.');
            break;
          default:
            setMessage('Something went wrong.');
            break;
        }
      });
    }
  }, [stripe, clientSecret, hasAttemptedPayment]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setHasAttemptedPayment(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setMessage(error.message || 'An unexpected error occurred.');
        } else {
          setMessage('An unexpected error occurred.');
        }
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment succeeded!');
        setIsComplete(true);
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setMessage('An unexpected error occurred.');
      onError('Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-blue-500" />
          <CardTitle>Payment Details</CardTitle>
        </div>
        <CardDescription>
          {description || 'Complete your payment securely'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Element */}
          <div className="space-y-4">
            <PaymentElement 
              options={{
                layout: 'tabs'
              }}
              onChange={(event) => {
                setIsComplete(event.complete);
              }}
            />
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Amount:
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(amount, currency)}
              </span>
            </div>
          </div>

          {/* Error/Success Messages */}
          {message && (
            <Alert className={isComplete ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {isComplete ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={isComplete ? 'text-green-800' : 'text-red-800'}>
                  {message}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Initial guidance message */}
          {!message && !hasAttemptedPayment && (
            <Alert className="border-blue-200 bg-blue-50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Please enter your card details above to complete the payment.
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              disabled={!stripe || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                `Pay ${formatCurrency(amount, currency)}`
              )}
            </Button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
