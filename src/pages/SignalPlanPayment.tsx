import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Rocket, 
  CheckCircle, 
  Star,
  DollarSign,
  Calendar,
  Shield,
  CreditCard,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Elements } from '@stripe/react-stripe-js';
import { StripeProvider, useStripe } from '@/contexts/StripeContext';
import StripePaymentForm from '@/components/StripePaymentForm';

interface SignalPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  maxSubscribers: number | null;
  currentSubscribers: number;
  metadata: {
    signalFrequency: string;
    signalTypes: string[];
    riskLevel: string;
    successRate: number;
  };
}

const SignalPlanPayment = () => {
  const { id: planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<SignalPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<any>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (planId) {
      fetchSignalPlan();
    }
  }, [planId]);

  const fetchSignalPlan = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/signal-plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlan(data.data);
      } else {
        toast.error('Failed to fetch signal plan details');
        navigate('/signal-plans');
      }
    } catch (error) {
      console.error('Error fetching signal plan:', error);
      toast.error('Failed to fetch signal plan details');
      navigate('/signal-plans');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getDurationLabel = (duration: string) => {
    switch (duration) {
      case 'monthly':
        return 'Monthly';
      case 'quarterly':
        return 'Quarterly';
      case 'semi-annual':
        return 'Semi-Annual';
      case 'annual':
        return 'Annual';
      default:
        return duration;
    }
  };

  const getDurationDiscount = (duration: string) => {
    switch (duration) {
      case 'quarterly':
        return 'Save 10%';
      case 'semi-annual':
        return 'Save 20%';
      case 'annual':
        return 'Save 30%';
      default:
        return null;
    }
  };

  const handlePayment = async () => {
    if (!user || !user.id || !user.email) {
      toast.error('Please login to subscribe to signal plans');
      navigate('/login');
      return;
    }

    if (!plan) {
      toast.error('Plan not found');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`http://localhost:5000/api/signal-plans/${planId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({})
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentResponse(data.data);
        setShowPaymentForm(true);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to create payment');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (!paymentResponse) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/payments/${paymentResponse.paymentId}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Payment completed successfully!');
        navigate('/payment/success', {
          state: {
            type: 'signal_plan',
            planId: planId,
            paymentId: paymentResponse.paymentId,
            planName: plan?.name,
            subscription: data.data.subscription
          }
        });
      } else {
        toast.error(data.message || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    }
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error('Payment failed. Please try again.');
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setPaymentResponse(null);
  };

  // Stripe Payment Wrapper Component
  const StripePaymentWrapper: React.FC<{
    paymentResponse: any;
    plan: SignalPlan | null;
    onSuccess: (paymentIntentId: string) => void;
    onError: (error: any) => void;
    onCancel: () => void;
  }> = ({ paymentResponse, plan, onSuccess, onError, onCancel }) => {
    const { stripe, loading, error } = useStripe();
    
    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading payment form...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">Error loading payment form: {error}</p>
            <Button onClick={onCancel} className="bg-red-600 hover:bg-red-700">
              Go Back
            </Button>
          </div>
        </div>
      );
    }

    if (!stripe) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 text-lg mb-4">Failed to initialize payment system</p>
            <Button onClick={onCancel} className="bg-red-600 hover:bg-red-700">
              Go Back
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Complete Your Subscription</h1>
            <p className="text-gray-300">Secure payment powered by Stripe</p>
          </div>
          
          <Elements 
            stripe={stripe} 
            options={{ 
              clientSecret: paymentResponse.clientSecret,
              appearance: {
                theme: 'night',
                variables: {
                  colorPrimary: '#f97316',
                  colorBackground: '#1e293b',
                  colorText: '#ffffff',
                  colorDanger: '#ef4444',
                  fontFamily: 'system-ui, sans-serif',
                  spacingUnit: '4px',
                  borderRadius: '8px',
                }
              }
            }}
          >
            <StripePaymentForm
              clientSecret={paymentResponse.clientSecret}
              amount={paymentResponse.amount}
              currency={paymentResponse.currency}
              onSuccess={onSuccess}
              onError={onError}
              onCancel={onCancel}
              description={`Subscription for ${plan?.name} signal plan`}
            />
          </Elements>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-white text-lg sm:text-xl text-center">Loading payment details...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-white text-lg sm:text-xl text-center">Signal plan not found</div>
      </div>
    );
  }

  // Show Stripe payment form if payment response is available
  if (showPaymentForm && paymentResponse) {
    return (
      <StripeProvider publishableKey={paymentResponse.publishableKey}>
        <StripePaymentWrapper
          paymentResponse={paymentResponse}
          plan={plan}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      </StripeProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/signal-plans/${planId}`)}
            className="text-white hover:bg-white/10 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back to Plan</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center mb-4">
              <CreditCard className="h-12 w-12 text-orange-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Complete Your Subscription
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Secure payment processing powered by Stripe. Your subscription will be activated immediately after payment.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Plan Summary */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Rocket className="h-6 w-6 text-orange-400" />
                  <CardTitle className="text-white text-lg sm:text-xl">
                    {plan.name}
                  </CardTitle>
                  {plan.isPopular && (
                    <Badge className="bg-orange-500 text-white text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                
                <CardDescription className="text-gray-300 text-sm sm:text-base">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0">
                {/* Plan Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-medium">{getDurationLabel(plan.duration)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Signal Frequency:</span>
                    <span className="text-white font-medium">{plan.metadata.signalFrequency}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Success Rate:</span>
                    <span className="text-white font-medium">{plan.metadata.successRate}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Risk Level:</span>
                    <Badge className="bg-yellow-500 text-white text-xs">
                      {plan.metadata.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">What's Included:</h3>
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signal Types */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Signal Types:</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.metadata.signalTypes.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-gray-300 border-gray-500 text-xs">
                        {type.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-lg sm:text-xl flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0">
                {/* Pricing Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Plan Price:</span>
                    <span className="text-white font-medium">{formatCurrency(plan.price)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-medium">{getDurationLabel(plan.duration)}</span>
                  </div>
                  
                  {getDurationDiscount(plan.duration) && (
                    <div className="flex items-center justify-between">
                      <span className="text-green-400">Discount:</span>
                      <Badge className="bg-green-500 text-white text-xs">
                        {getDurationDiscount(plan.duration)}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold text-lg">Total:</span>
                      <span className="text-white font-bold text-xl">{formatCurrency(plan.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Button or Stripe Form */}
                {showPaymentForm && paymentResponse ? (
                  <StripePaymentWrapper
                    paymentResponse={paymentResponse}
                    plan={plan}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onCancel={handlePaymentCancel}
                  />
                ) : (
                  <>
                    <Button
                      onClick={handlePayment}
                      disabled={processing || !user}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-base sm:text-lg py-3 mb-4"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-5 w-5 mr-2" />
                          Pay {formatCurrency(plan.price)}
                        </>
                      )}
                    </Button>

                    {/* Security Notice */}
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Shield className="h-4 w-4 text-green-400" />
                      <span className="text-green-400 text-xs sm:text-sm">
                        Secure payment processing by Stripe
                      </span>
                    </div>
                  </>
                )}

                {/* Terms */}
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-xs sm:text-sm">
                    By subscribing, you agree to our Terms of Service and Privacy Policy.
                    You can cancel your subscription anytime.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-400 text-sm">256-bit SSL encryption protects your payment information</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Instant Access</h3>
              <p className="text-gray-400 text-sm">Your subscription activates immediately after payment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalPlanPayment;
