import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronDown,
  ChevronUp,
  DollarSign,
  Target,
  Activity,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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

const CopytradePlans = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [plans, setPlans] = useState<CopytradePlan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, { status: string; loading: boolean }>>({});

  useEffect(() => {
    fetchCopytradePlans();
    if (user) {
      fetchUserSubscriptions();
    }
  }, [user]);

  // Fallback: try to fetch subscriptions on mount regardless of user state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && userSubscriptions.length === 0) {
      fetchUserSubscriptionsDirect();
    }
  }, []);

  useEffect(() => {
    if (plans.length > 0 && user && user.token) {
      checkAllPaymentStatuses();
    }
  }, [plans, user]);

  useEffect(() => {
    const hasPending = Object.values(paymentStatuses).some(s => s.status === 'pending');
    if (hasPending) {
      const id = setInterval(() => checkAllPaymentStatuses(), 15000);
      return () => clearInterval(id);
    }
  }, [paymentStatuses]);

  const checkAllPaymentStatuses = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const newStatuses: Record<string, { status: string; loading: boolean }> = { ...paymentStatuses };
    for (const plan of plans) {
      newStatuses[plan._id] = { status: newStatuses[plan._id]?.status || 'loading', loading: true };
    }
    setPaymentStatuses({ ...newStatuses });

    await Promise.all(plans.map(async (plan) => {
      try {
        const res = await fetch(`${API_URL}/manual-payments/status/copytrade/${plan._id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
          newStatuses[plan._id] = { status: data.data?.status || 'none', loading: false };
        } else {
          newStatuses[plan._id] = { status: 'none', loading: false };
        }
      } catch (error) {
        newStatuses[plan._id] = { status: 'none', loading: false };
      }
    }));

    setPaymentStatuses({ ...newStatuses });
  };

  const fetchCopytradePlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/copytrade/plans`);
      const data = await response.json();

      if (data.success) {
        setPlans(data.data);
      } else {
        toast.error('Failed to fetch copytrade plans');
      }
    } catch (error) {
      console.error('Error fetching copytrade plans:', error);
      toast.error('Failed to fetch copytrade plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscriptions = async () => {
    if (!user) return;
    
    try {
      const response = await authenticatedApiCall('/copytrade/subscriptions') as any;
      
      if (response.success) {
        setUserSubscriptions(response.data);
      } else {
        // Try direct fetch as fallback
        await fetchUserSubscriptionsDirect();
      }
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      // Try direct fetch as fallback
      await fetchUserSubscriptionsDirect();
    }
  };

  const fetchUserSubscriptionsDirect = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

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
      }
    } catch (error) {
      console.error('Direct fetch error:', error);
    }
  };

  const toggleDescription = (planId: string) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedDescriptions(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  const isUserSubscribed = (planId: string) => {
    if (userSubscriptions.length === 0) {
      return false;
    }
    
    return userSubscriptions.some(sub => {
      const subPlanId = typeof sub.copytradePlan === 'string' ? sub.copytradePlan : (sub.copytradePlan as any)?._id || (sub.copytradePlan as any)?.id;
      const planMatch = subPlanId === planId;
      const statusMatch = sub.status === 'active' || sub.status === 'setup_required';
      const dateMatch = sub.endDate ? new Date(sub.endDate) > new Date() : false;
      
      return planMatch && statusMatch && dateMatch;
    });
  };

  const handlePlanAction = (plan: CopytradePlan) => {
    if (!user) {
      toast.error('Please login to access copytrade plans');
      navigate('/login');
      return;
    }

    // If payment is under verification, do not allow subscribe
    const status = paymentStatuses[plan._id]?.status;
    if (status === 'pending') {
      toast.info('Your payment is under verification. You will get access after approval.');
      return;
    }

    if (isUserSubscribed(plan._id)) {
      // User is subscribed, go to copytrade account setup
      navigate(`/copytrade/setup/${plan._id}`);
    } else {
      // User is not subscribed, redirect to plan details
      navigate(`/copytrade/${plan._id}`);
    }
  };

  const calculateDiscountPercentage = (originalPrice: number, currentPrice: number) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBrokerIcon = (broker: string) => {
    switch (broker.toLowerCase()) {
      case 'mt4':
        return '📊';
      case 'mt5':
        return '📈';
      case 'c-trader':
        return '💹';
      case 'ninjatrader':
        return '🥷';
      default:
        return '🏦';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <LoadingSpinner 
          message="Loading copytrade plans..." 
          size="lg"
          fullScreen={true}
        />
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
            onClick={() => navigate('/')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4">
            <Copy className="h-12 w-12 text-purple-500" 
                  style={{ filter: 'drop-shadow(0 0 20px rgba(147, 51, 234, 0.8))' }} />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Copytrade Plans
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto">
            Connect your trading accounts and copy successful traders automatically. Choose the plan that fits your trading style and risk tolerance.
          </p>
        </div>

        {/* Copytrade Plans Grid */}
        {plans.length > 0 ? (
          <div className={`${plans.length === 2 ? 'flex flex-col md:flex-row justify-center items-center' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-8 sm:gap-10`}>
            {plans.map((plan) => (
              <Card 
                key={plan._id} 
                className={`bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/8 transition-all duration-300 h-full flex flex-col ${
                  plan.isPopular ? 'ring-2 ring-orange-500/50' : ''
                }`}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
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
                  
                  {plan.description && (
                    <>
                      {expandedDescriptions.has(plan._id) ? (
                        <CardDescription className="text-gray-300 text-sm sm:text-base">
                          {plan.description}
                        </CardDescription>
                      ) : (
                        <div className="flex items-center justify-between">
                          <CardDescription className="text-gray-300 text-sm sm:text-base">
                            {plan.description.length > 100 
                              ? `${plan.description.substring(0, 100)}...` 
                              : plan.description
                            }
                          </CardDescription>
                          {plan.description.length > 100 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleDescription(plan._id)}
                              className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 p-1 h-auto"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {expandedDescriptions.has(plan._id) && plan.description.length > 100 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDescription(plan._id)}
                          className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 p-1 h-auto mt-2 self-start"
                        >
                          <ChevronUp className="h-4 w-4 mr-1" />
                          Show Less
                        </Button>
                      )}
                    </>
                  )}
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Badge className={`${getRiskLevelColor(plan.metadata.riskLevel)} text-white text-xs`}>
                      {plan.metadata.riskLevel.toUpperCase()} RISK
                    </Badge>
                    <Badge variant="outline" className="text-green-400 border-green-400 text-xs">
                      {plan.metadata.copySpeed} Copy Speed
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 sm:p-6 pt-0 flex flex-col flex-grow">
                  {/* Pricing */}
                  <div className="text-center mb-6">
                    {plan.originalPrice && plan.originalPrice > plan.price ? (
                      <div className="mb-2">
                        <div className="text-lg sm:text-xl text-gray-400 line-through">
                          {formatCurrency(plan.originalPrice)}
                        </div>
                        <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                          {formatCurrency(plan.price)}
                        </div>
                        <Badge className="bg-red-500 text-white text-xs">
                          {calculateDiscountPercentage(plan.originalPrice, plan.price)}% OFF
                        </Badge>
                      </div>
                    ) : (
                      <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                        {formatCurrency(plan.price)}
                      </div>
                    )}
                    <div className="text-gray-400 text-sm sm:text-base">
                      {getDurationLabel(plan.duration)}
                    </div>
                    {getDurationDiscount(plan.duration) && !plan.originalPrice && (
                      <Badge className="bg-green-500 text-white text-xs mt-2">
                        {getDurationDiscount(plan.duration)}
                      </Badge>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Supported Brokers */}
                  <div className="mb-6">
                    <div className="text-gray-400 text-xs sm:text-sm mb-2">Supported Brokers:</div>
                    <div className="flex flex-wrap gap-2">
                      {plan.metadata.supportedBrokers.map((broker, index) => (
                        <Badge key={index} variant="outline" className="text-gray-300 border-gray-500 text-xs">
                          {getBrokerIcon(broker)} {broker.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Plan Stats */}
                  <div className="flex justify-center mb-6 text-center">
                    <div>
                      <div className="text-white font-semibold text-sm sm:text-base">
                        {formatCurrency(plan.accountSize)} Account
                      </div>
                      <div className="text-gray-400 text-xs">Minimum Balance</div>
                    </div>
                  </div>

                  {/* Subscribe/Setup Button */}
                  <Button
                    onClick={() => handlePlanAction(plan)}
                    disabled={paymentStatuses[plan._id]?.status === 'pending'}
                    className={`w-full font-semibold text-white mt-auto ${
                      isUserSubscribed(plan._id)
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        : paymentStatuses[plan._id]?.status === 'pending'
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                    }`}
                  >
                    {paymentStatuses[plan._id]?.loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Checking...
                      </div>
                    ) : paymentStatuses[plan._id]?.status === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Under Verification
                      </div>
                    ) : isUserSubscribed(plan._id) ? (
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Setup Account
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Copy className="h-4 w-4" />
                        Subscribe Now
                      </div>
                    )}
                  </Button>

                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Copy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Plans Available</h3>
            <p className="text-gray-400">Check back later for available copytrade plans.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CopytradePlans;