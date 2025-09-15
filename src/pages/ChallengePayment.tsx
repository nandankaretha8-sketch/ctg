import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Shield, CheckCircle, AlertCircle, DollarSign, Users, Target, Lock, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Elements } from '@stripe/react-stripe-js';
import { StripeProvider, useStripe } from '@/contexts/StripeContext';
import StripePaymentForm from '@/components/StripePaymentForm';

interface Challenge {
  _id: string;
  name: string;
  type: string;
  accountSize: number;
  price: number;
  isFree: boolean;
  prizes: Array<{
    rank: number;
    prize: string;
    amount: number;
  }>;
  maxParticipants: number;
  currentParticipants: number;
  startDate: string;
  endDate: string;
  status: string;
  challengeMode: string;
  description: string;
  rules: string[];
  requirements: {
    minBalance: number;
    maxDrawdown: number;
    targetProfit: number;
  };
}

interface PaymentData {
  amount: number;
  currency: string;
  challengeId: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: string;
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
  challenge: Challenge | null;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}> = ({ paymentResponse, challenge, onSuccess, onError, onCancel }) => {
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
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your Payment</h1>
          <p className="text-gray-300">Secure payment powered by Stripe</p>
        </div>
        
        <Elements 
          stripe={stripe}
          options={{ 
            clientSecret: paymentResponse.clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#3b82f6',
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
            description={`Payment for ${challenge?.name} challenge`}
          />
        </Elements>
      </div>
    </div>
  );
};

const ChallengePayment = () => {
  const { id: challengeId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to join competitions');
      navigate('/login');
      return;
    }
    
    if (challengeId && user && user.id) {
      fetchChallenge();
    }
  }, [challengeId, user, navigate]);

  const fetchChallenge = async () => {
    if (!challengeId) {
      toast.error('Invalid competition ID');
      navigate('/challenges');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/challenges/${challengeId}`);
      const data = await response.json();
      
      if (data.success) {
        setChallenge(data.data);
        
        // Prepare payment data
        if (!user || !user.id) {
          toast.error('User not authenticated. Please login again.');
          navigate('/login');
          return;
        }

        setPaymentData({
          amount: data.data.price,
          currency: 'USD',
          challengeId: data.data._id,
          userId: user.id,
          userEmail: user.email,
          userName: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
          type: 'challenge'
        });
      } else {
        toast.error('Competition not found');
        navigate('/challenges');
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
      toast.error('Failed to load competition details');
      navigate('/challenges');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentData) {
      toast.error('Payment data not available');
      return;
    }

    if (!user || !user.id) {
      toast.error('User not authenticated. Please login again.');
      navigate('/login');
      return;
    }

    setProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
            type: 'challenge',
            challengeId: challengeId,
            paymentId: paymentResponse.paymentId,
            challengeName: challenge?.name
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

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setPaymentResponse(null);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">
          {!user ? 'Loading user data...' : 'Loading competition details...'}
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Competition not found</div>
      </div>
    );
  }

  // Show Stripe payment form if payment response is available
  if (showPaymentForm && paymentResponse) {
    return (
      <StripeProvider publishableKey={paymentResponse.publishableKey}>
        <StripePaymentWrapper
          paymentResponse={paymentResponse}
          challenge={challenge}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handleCancelPayment}
        />
      </StripeProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/challenges')}
              className="border-white/20 text-white hover:bg-white/10 self-start sm:self-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Competitions
            </Button>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Join Competition</h1>
              <p className="text-gray-300 text-sm sm:text-base">Complete your payment to join this competition</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Competition Details */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-blue-500 text-white">
                  <Target className="h-3 w-3 mr-1" />
                  {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-orange-400 border-orange-400">
                  Paid Competition
                </Badge>
              </div>
              <CardTitle className="text-white text-2xl">{challenge.name}</CardTitle>
              <CardDescription className="text-gray-300">
                {challenge.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Account Size:</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(challenge.accountSize)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Participants:</span>
                  <span className="text-white font-semibold">
                    {challenge.currentParticipants}/{challenge.maxParticipants}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white font-semibold">
                    {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                  </span>
                </div>
                
                {/* Only show target-based fields for target mode competitions */}
                {challenge.challengeMode === 'target' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Target Profit:</span>
                      <span className="text-white font-semibold">
                        {challenge.requirements.targetProfit}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Max Drawdown:</span>
                      <span className="text-white font-semibold">
                        {challenge.requirements.maxDrawdown}%
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Prizes */}
              {challenge.prizes && challenge.prizes.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Prizes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {challenge.prizes.map((prize, index) => (
                      <div key={index} className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm">
                            {prize.rank}
                          </div>
                          <span className="text-yellow-400 font-semibold text-sm">
                            Rank #{prize.rank}
                          </span>
                        </div>
                        <div className="text-white font-bold text-lg mb-1">
                          ${prize.amount.toLocaleString()}
                        </div>
                        <div className="text-gray-300 text-xs">
                          {prize.prize}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules */}
              {challenge.rules.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white font-semibold mb-3">Competition Rules</h4>
                  <ul className="space-y-2">
                    {challenge.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-orange-400" />
                <CardTitle className="text-white">Payment Details</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                Secure payment powered by Stripe
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {/* Payment Summary */}
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">Competition Fee</span>
                    <span className="text-orange-400 font-bold text-xl">
                      {formatCurrency(challenge.price)}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">
                    One-time payment to join this competition
                  </p>
                </div>

                {/* Payment Features */}
                <div className="space-y-3">
                  <h4 className="text-white font-semibold">What's Included:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Full access to competition</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm">MT5 account setup</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Performance tracking</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm">Prize eligibility</span>
                    </li>
                  </ul>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-blue-400 font-semibold mb-1">Secure Payment</h4>
                      <p className="text-gray-300 text-sm">
                        Your payment is processed securely through Stripe. 
                        We use industry-standard encryption to protect your financial information.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={processing || !user || !user.id || !paymentData}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold"
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Pay {formatCurrency(challenge.price)} with Stripe
                    </div>
                  )}
                </Button>

                {/* Refund Policy */}
                <div className="text-center">
                  <p className="text-gray-400 text-xs">
                    By proceeding, you agree to our{' '}
                    <a href="/refund-policy" className="text-blue-400 hover:underline">
                      refund policy
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChallengePayment;
