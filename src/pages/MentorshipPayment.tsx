import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle, 
  Star,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Zap,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  User,
  Award,
  BookOpen,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Elements } from '@stripe/react-stripe-js';
import { StripeProvider, useStripe } from '@/contexts/StripeContext';
import StripePaymentForm from '@/components/StripePaymentForm';

interface MentorshipPlan {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: string;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  maxSubscribers: number | null;
  currentSubscribers: number;
  metadata: {
    sessionFrequency: string;
    courseDuration: string;
    maxSessionsPerMonth: number;
    mentorExperience: string;
    specialization: string[];
    successRate: number;
    languages: string[];
    mentorName: string;
    mentorBio: string;
  };
}

interface PaymentResponse {
  paymentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  publishableKey: string;
}

// Stripe Payment Wrapper Component
const StripePaymentWrapper: React.FC<{
  paymentResponse: PaymentResponse;
  plan: MentorshipPlan | null;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}> = ({ paymentResponse, plan, onSuccess, onError, onCancel }) => {
  const { stripe } = useStripe();

  if (!stripe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-white text-xl">Loading Stripe...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your Subscription</h1>
          <p className="text-gray-300">{plan?.name} • {plan?.metadata.mentorName}</p>
        </div>
        
        <Elements 
          stripe={stripe}
          options={{ 
            clientSecret: paymentResponse.clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#8b5cf6',
                colorBackground: '#1e1b4b',
                colorText: '#ffffff',
                colorDanger: '#ef4444',
                fontFamily: 'Inter, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
              }
            }
          }}
        >
          <StripePaymentForm
            clientSecret={paymentResponse.clientSecret}
            amount={paymentResponse.amount / 100}
            currency={paymentResponse.currency}
            onSuccess={onSuccess}
            onError={onError}
            onCancel={onCancel}
            description={`Payment for ${plan?.name} mentorship`}
          />
        </Elements>
      </div>
    </div>
  );
};

const MentorshipPayment = () => {
  const { id: planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [plan, setPlan] = useState<MentorshipPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to subscribe to mentorship plans');
      navigate('/login');
      return;
    }

    if (planId) {
      fetchMentorshipPlan();
    }
  }, [planId, user, navigate]);

  const fetchMentorshipPlan = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/mentorship-plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlan(data.data);
      } else {
        toast.error('Failed to fetch mentorship plan details');
        navigate('/mentorships');
      }
    } catch (error) {
      console.error('Error fetching mentorship plan:', error);
      toast.error('Failed to fetch mentorship plan details');
      navigate('/mentorships');
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
      case 'monthly': return 'per month';
      case 'quarterly': return 'per quarter';
      case 'semi-annual': return 'per 6 months';
      case 'annual': return 'per year';
      default: return 'per month';
    }
  };

  const handlePayment = async () => {
    if (!plan || !user) return;

    setProcessing(true);
    try {
      const paymentData = {
        amount: plan.price * 100, // Convert to cents
        currency: 'USD',
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        type: 'mentorship',
        planId: plan._id
      };

      const response = await fetch('http://localhost:5000/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      
      if (data.success) {
        setPaymentResponse(data.data);
        setShowPaymentForm(true);
      } else {
        toast.error(data.message || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Complete the payment on the backend to activate subscription
      const response = await fetch(`http://localhost:5000/api/payments/${paymentResponse?.paymentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Payment successful! Welcome to your mentorship program.');
        navigate('/payment-success', { 
          state: { 
            type: 'mentorship',
            planId: plan?._id,
            planName: plan?.name,
            mentorName: plan?.metadata.mentorName,
            amount: plan?.price
          }
        });
      } else {
        toast.error('Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Error completing payment:', error);
      toast.error('Payment verification failed. Please contact support.');
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setPaymentResponse(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading mentorship plan...</div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Mentorship plan not found</div>
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
          onCancel={handleCancelPayment}
        />
      </StripeProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/mentorships/${planId}`)}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Plan
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Complete Your Subscription
                </h1>
                <p className="text-gray-300 mt-1">
                  {plan.name} • {plan.metadata.mentorName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Summary */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-xl sm:text-2xl">
                  Mentorship Plan Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-6">
                  {/* Plan Details */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{plan.name}</h3>
                      <p className="text-gray-300 text-sm mb-2">
                        Mentor: {plan.metadata.mentorName} • {plan.metadata.mentorExperience}
                      </p>
                      <p className="text-gray-400 text-sm">{plan.description}</p>
                    </div>
                  </div>

                  {/* Plan Features */}
                  <div>
                    <h4 className="text-white font-medium mb-3">What's Included:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Plan Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                      <p className="text-white font-semibold text-sm">{plan.metadata.courseDuration}</p>
                      <p className="text-gray-400 text-xs">Course Duration</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-400 mx-auto mb-1" />
                      <p className="text-white font-semibold text-sm">{plan.metadata.maxSessionsPerMonth}</p>
                      <p className="text-gray-400 text-xs">Per Month</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <Target className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                      <p className="text-white font-semibold text-sm">{plan.metadata.successRate}%</p>
                      <p className="text-gray-400 text-xs">Success Rate</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <Users className="h-5 w-5 text-orange-400 mx-auto mb-1" />
                      <p className="text-white font-semibold text-sm">{plan.currentSubscribers}</p>
                      <p className="text-gray-400 text-xs">Students</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card className="bg-white/5 backdrop-blur-md border-white/10 sticky top-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-xl sm:text-2xl flex items-center">
                  <CreditCard className="h-6 w-6 mr-3 text-purple-400" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-4">
                  {/* Plan Price */}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Mentorship Plan</span>
                    <span className="text-white font-semibold">
                      {formatCurrency(plan.price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-gray-400 capitalize">{plan.duration}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Billing</span>
                    <span className="text-gray-400">{getDurationLabel(plan.duration)}</span>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold text-lg">Total</span>
                      <span className="text-white font-bold text-xl">
                        {formatCurrency(plan.price)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <Button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 mt-6"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay {formatCurrency(plan.price)}
                      </>
                    )}
                  </Button>

                  {/* Security Notice */}
                  <div className="text-center mt-4">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                      <Shield className="h-4 w-4" />
                      <span>Secure payment powered by Stripe</span>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorshipPayment;
