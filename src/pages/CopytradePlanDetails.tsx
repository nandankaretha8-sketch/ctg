import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  Star,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Zap,
  DollarSign,
  Target,
  Activity,
  Settings,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { toast } from 'sonner';
import { API_URL, authenticatedApiCall } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface CopytradePlan {
  _id: string;
  name: string;
  description: string;
  originalPrice?: number;
  price: number;
  duration: string;
  accountSize: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  maxSubscribers: number | null;
  currentSubscribers: number;
  metadata: {
    copySpeed: string;
    riskLevel: string;
    maxDrawdown: number;
    minBalance: number;
    supportedBrokers: string[];
    maxPositions: number;
    copyMultiplier: number;
  };
}

interface UserSubscription {
  _id: string;
  copytradePlan: string;
  status: string;
  endDate: string;
}

const CopytradePlanDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { paymentStatus, loading: paymentLoading } = usePaymentStatus('copytrade', id || '');
  const [plan, setPlan] = useState<CopytradePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPlanDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchUserSubscriptions();
    }
  }, [user]);

  // Retry subscription fetch when user becomes available after error
  useEffect(() => {
    if (user && subscriptionError && !subscriptionLoading) {
      const retryTimer = setTimeout(() => {
        fetchUserSubscriptions();
      }, 2000); // Retry after 2 seconds
      
      return () => clearTimeout(retryTimer);
    }
  }, [user, subscriptionError, subscriptionLoading]);

  const fetchPlanDetails = async (planId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/copytrade/plans/${planId}`);
      const data = await response.json();

      if (data.success) {
        setPlan(data.data);
      } else {
        toast.error('Failed to fetch plan details');
        navigate('/copytrade');
      }
    } catch (error) {
      console.error('Error fetching plan details:', error);
      toast.error('Failed to fetch plan details');
      navigate('/copytrade');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscriptions = async () => {
    if (!user) return;
    
    setSubscriptionLoading(true);
    setSubscriptionError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping subscription fetch');
        setSubscriptionLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/copytrade/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserSubscriptions(data.data);
        }
      } else if (response.status === 401) {
        // Token is invalid, clear it
        localStorage.removeItem('token');
        console.log('Token expired, cleared from localStorage');
        setSubscriptionError('Authentication expired. Please login again.');
      } else {
        setSubscriptionError('Failed to fetch subscription status');
      }
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      setSubscriptionError('Network error while fetching subscription status');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const isUserSubscribed = (planId: string) => {
    return userSubscriptions.some(sub => {
      const planMatch = sub.copytradePlan === planId;
      const statusMatch = sub.status === 'active' || sub.status === 'setup_required';
      const dateMatch = sub.endDate ? new Date(sub.endDate) > new Date() : false;
      return planMatch && statusMatch && dateMatch;
    });
  };

  const handleSubscribe = () => {
    if (!user) {
      toast.error('Please login to subscribe to copytrade plans');
      navigate('/login');
      return;
    }

    if (!plan) return;

    // If there's a subscription error, retry fetching subscriptions
    if (subscriptionError) {
      fetchUserSubscriptions();
      return;
    }

    // Check if user is already subscribed
    if (isUserSubscribed(plan._id)) {
      navigate('/dashboard');
      return;
    }

    // If payment is verified, redirect to dashboard
    if (paymentStatus.status === 'verified') {
      navigate('/dashboard');
      return;
    }

    // If payment is pending, show message
    if (paymentStatus.status === 'pending') {
      toast.info('Your payment is under verification. Please wait for admin approval.');
      return;
    }

    // If payment failed, allow retry
    if (paymentStatus.status === 'failed') {
      toast.info('Your previous payment failed. You can submit a new payment.');
    }
    
    navigate(`/payment/copytrade/${id}`, {
      state: {
        serviceData: {
          id: id,
          name: plan.name,
          price: plan.price,
          type: 'copytrade'
        }
      }
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatAccountSize = (size: number) => {
    if (size >= 1000000) {
      return `$${(size / 1000000).toFixed(1)}M`;
    } else if (size >= 1000) {
      return `$${(size / 1000).toFixed(0)}K`;
    }
    return `$${size}`;
  };

  const getDurationText = (duration: string) => {
    const durationMap: { [key: string]: string } = {
      'monthly': 'per month',
      'quarterly': 'per quarter',
      'semi-annual': 'per 6 months',
      'annual': 'per year'
    };
    return durationMap[duration] || duration;
  };

  const formatCopySpeed = (copySpeed: string) => {
    return copySpeed.replace(/^real-time/i, 'Real-time');
  };

  const getButtonText = () => {
    if (paymentLoading || subscriptionLoading) return 'Loading...';
    
    // Check if user is already subscribed
    if (plan && isUserSubscribed(plan._id)) {
      return 'Access Dashboard';
    }
    
    // If there's a subscription error, show retry option
    if (subscriptionError) {
      return 'Retry';
    }
    
    switch (paymentStatus.status) {
      case 'verified':
        return 'Access Dashboard';
      case 'pending':
        return 'Payment Under Verification';
      case 'failed':
        return 'Retry Payment';
      default:
        return 'Subscribe Now';
    }
  };

  const getButtonIcon = () => {
    // Check if user is already subscribed
    if (plan && isUserSubscribed(plan._id)) {
      return <CheckCircle className="h-5 w-5 mr-2" />;
    }
    
    switch (paymentStatus.status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 mr-2" />;
      case 'pending':
        return <Clock className="h-5 w-5 mr-2" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 mr-2" />;
      default:
        return <Copy className="h-5 w-5 mr-2" />;
    }
  };

  const getButtonClass = () => {
    const baseClass = "w-full relative overflow-hidden group transition-all duration-300 font-semibold py-4 px-6 rounded-xl border-0";
    
    // Check if user is already subscribed
    if (plan && isUserSubscribed(plan._id)) {
      return `${baseClass} bg-gradient-to-r from-green-600 to-green-900 hover:from-green-700 hover:to-green-950 shadow-lg hover:shadow-green-500/25 text-white`;
    }
    
    switch (paymentStatus.status) {
      case 'verified':
        return `${baseClass} bg-gradient-to-r from-green-600 to-green-900 hover:from-green-700 hover:to-green-950 shadow-lg hover:shadow-green-500/25 text-white`;
      case 'pending':
        return `${baseClass} bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-yellow-500/25 text-white cursor-not-allowed`;
      case 'failed':
        return `${baseClass} bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-red-500/25 text-white`;
      default:
        return `${baseClass} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 hover:scale-105 text-white`;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <LoadingSpinner 
          message="Loading copytrade plan details..." 
          size="lg"
          fullScreen={true}
        />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Plan Not Found</h2>
          <Button onClick={() => navigate('/copytrade')}>
            Back to Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/copytrade')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back to Plans</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Plan Details */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6">
              <CardHeader className="p-4 sm:p-6 text-center">
                <div className="mb-4">
                  <div className="flex justify-center mb-3">
                    <Copy className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="mb-3">
                    <CardTitle className="text-white text-xl sm:text-2xl mb-2">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-sm sm:text-base">
                      {getDurationText(plan.duration)} Copytrade Plan
                    </CardDescription>
                  </div>
                  {plan.isPopular && (
                    <div className="flex justify-center mb-3">
                      <Badge className="bg-orange-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  <Badge className={`${getRiskLevelColor(plan.metadata.riskLevel)} text-white text-xs`}>
                    {plan.metadata.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                    {formatCopySpeed(plan.metadata.copySpeed)} Copy Speed
                  </Badge>
                  <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
                    {formatAccountSize(plan.accountSize)} Account
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="mb-6 px-2">
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed text-center sm:text-left">
                    {plan.description}
                  </p>
                </div>

                {/* Supported Brokers */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Supported Brokers</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {plan.metadata.supportedBrokers.map((broker, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white/5 p-2 rounded-md">
                        <span className="text-lg">🏦</span>
                        <span className="text-white font-medium text-sm">{broker.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">What's Included</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-white font-bold text-lg sm:text-xl">
                      {formatCopySpeed(plan.metadata.copySpeed)}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Copy Speed</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-white font-bold text-lg sm:text-xl">
                      {plan.metadata.maxDrawdown}%
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Max Drawdown</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-lg sm:text-xl">
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-bold text-lg">1</span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Subscribe</h3>
                    <p className="text-gray-400 text-sm">Choose your plan and complete payment</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-bold text-lg">2</span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Connect Account</h3>
                    <p className="text-gray-400 text-sm">Provide your trading account details for setup</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 font-bold text-lg">3</span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Start Copying</h3>
                    <p className="text-gray-400 text-sm">Automatically copy successful trades and grow your portfolio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Card */}
          <div className="lg:col-span-1">
            <Card className={`bg-white/5 backdrop-blur-md border-white/10 sticky top-6 ${
              plan.isPopular ? 'ring-2 ring-orange-500/50' : ''
            }`}>
              <CardHeader className="p-4 sm:p-6 text-center">
                {plan.isPopular && (
                  <Badge className="bg-orange-500 text-white mb-4 w-fit mx-auto">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}
                
                {plan.originalPrice && plan.originalPrice > plan.price ? (
                  <div className="mb-2">
                    <div className="text-lg sm:text-xl text-gray-400 line-through mb-1">
                      {formatPrice(plan.originalPrice)}
                    </div>
                    <CardTitle className="text-white text-2xl sm:text-3xl mb-2">
                      {formatPrice(plan.price)}
                    </CardTitle>
                    <Badge className="bg-red-500 text-white text-sm mb-2 w-fit mx-auto">
                      {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}% OFF
                    </Badge>
                  </div>
                ) : (
                  <CardTitle className="text-white text-2xl sm:text-3xl mb-2">
                    {formatPrice(plan.price)}
                  </CardTitle>
                )}
                
                <CardDescription className="text-gray-300 text-base sm:text-lg">
                  {getDurationText(plan.duration)}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300 text-sm sm:text-base">
                      {formatAccountSize(plan.accountSize)} account size
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300 text-sm sm:text-base">
                      {plan.metadata.supportedBrokers.length} supported brokers
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300 text-sm sm:text-base">
                      Real-time trade copying
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300 text-sm sm:text-base">
                      Expert support
                    </span>
                  </div>
                </div>

                {/* Error message for subscription status */}
                {subscriptionError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{subscriptionError}</span>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSubscribe}
                  className={getButtonClass()}
                  disabled={paymentLoading || subscriptionLoading}
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  
                  <div className="relative flex items-center justify-center">
                    {getButtonIcon()}
                    <span>{getButtonText()}</span>
                    {paymentStatus.status !== 'pending' && paymentStatus.status !== 'verified' && !subscriptionError && (
                      <div className="ml-2 w-2 h-2 bg-white/80 rounded-full group-hover:animate-ping" />
                    )}
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopytradePlanDetails;
