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
  TrendingUp,
  Shield,
  Clock,
  Users,
  Zap,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SignalPlan {
  _id: string;
  name: string;
  description?: string;
  originalPrice?: number;
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

const SignalPlanDetails = () => {
  const { id: planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [plan, setPlan] = useState<SignalPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

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

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const calculateDiscountPercentage = (originalPrice: number, currentPrice: number) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
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

  const getSignalTypeIcon = (type: string) => {
    switch (type) {
      case 'forex':
        return '💱';
      case 'crypto':
        return '₿';
      case 'stocks':
        return '📈';
      case 'indices':
        return '📊';
      case 'commodities':
        return '🥇';
      default:
        return '📈';
    }
  };

  const handleSubscribe = () => {
    if (!user) {
      toast.error('Please login to subscribe to signal plans');
      navigate('/login');
      return;
    }
    
    navigate(`/signal-plans/${planId}/payment`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-white text-lg sm:text-xl text-center">Loading signal plan details...</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/signal-plans')}
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
                    <Rocket className="h-8 w-8 text-orange-400" />
                  </div>
                  <div className="mb-3">
                    <CardTitle className="text-white text-xl sm:text-2xl mb-2">
                      {plan.name}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-sm sm:text-base">
                      {getDurationLabel(plan.duration)} Signal Plan
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
                
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Badge className={`${getRiskLevelColor(plan.metadata.riskLevel)} text-white`}>
                    {plan.metadata.riskLevel.toUpperCase()} RISK
                  </Badge>
                  <Badge variant="outline" className="text-green-400 border-green-400">
                    {plan.metadata.successRate}% Success Rate
                  </Badge>
                  <Badge variant="outline" className="text-blue-400 border-blue-400">
                    {plan.metadata.signalFrequency} Signals
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0">
                {plan.description && (
                  <div className="mb-6">
                    {isDescriptionExpanded ? (
                      <p className="text-gray-300 text-base sm:text-lg">
                        {plan.description}
                      </p>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-gray-300 text-base sm:text-lg flex-1">
                          {plan.description.length > 150 
                            ? `${plan.description.substring(0, 150)}...` 
                            : plan.description
                          }
                        </p>
                        {plan.description.length > 150 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleDescription}
                            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 p-2 h-auto flex-shrink-0"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {isDescriptionExpanded && plan.description.length > 150 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleDescription}
                        className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 p-2 h-auto mt-3"
                      >
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Show Less
                      </Button>
                    )}
                  </div>
                )}

                {/* Signal Types */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Signal Types</h3>
                  <div className="flex flex-wrap gap-3">
                    {plan.metadata.signalTypes.map((type, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white/5 p-3 rounded-lg">
                        <span className="text-2xl">{getSignalTypeIcon(type)}</span>
                        <span className="text-white font-medium">{type.toUpperCase()}</span>
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-white font-bold text-lg sm:text-xl">
                      {plan.metadata.successRate}%
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Success Rate</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-white font-bold text-lg sm:text-xl">
                      {plan.metadata.signalFrequency}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Signal Frequency</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-white font-bold text-lg sm:text-xl">
                      {plan.metadata.riskLevel.toUpperCase()}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Risk Level</div>
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
                      <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span className="text-orange-400 font-bold text-lg">1</span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Subscribe</h3>
                    <p className="text-gray-400 text-sm">Choose your plan and complete payment</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span className="text-orange-400 font-bold text-lg">2</span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Receive Signals</h3>
                    <p className="text-gray-400 text-sm">Get real-time trading signals via email and notifications</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span className="text-orange-400 font-bold text-lg">3</span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Trade & Profit</h3>
                    <p className="text-gray-400 text-sm">Execute trades based on expert analysis and grow your portfolio</p>
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
                      {formatCurrency(plan.originalPrice)}
                    </div>
                    <CardTitle className="text-white text-2xl sm:text-3xl mb-2">
                      {formatCurrency(plan.price)}
                    </CardTitle>
                    <Badge className="bg-red-500 text-white text-sm mb-2 w-fit mx-auto">
                      {calculateDiscountPercentage(plan.originalPrice, plan.price)}% OFF
                    </Badge>
                  </div>
                ) : (
                  <CardTitle className="text-white text-2xl sm:text-3xl mb-2">
                    {formatCurrency(plan.price)}
                  </CardTitle>
                )}
                
                <CardDescription className="text-gray-300 text-base sm:text-lg">
                  {getDurationLabel(plan.duration)}
                </CardDescription>
                
                {getDurationDiscount(plan.duration) && !plan.originalPrice && (
                  <Badge className="bg-green-500 text-white text-sm mt-2 w-fit mx-auto">
                    {getDurationDiscount(plan.duration)}
                  </Badge>
                )}
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300 text-sm sm:text-base">
                      {plan.metadata.signalFrequency} trading signals
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300 text-sm sm:text-base">
                      {plan.metadata.signalTypes.length} market types
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300 text-sm sm:text-base">
                      Real-time notifications
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300 text-sm sm:text-base">
                      Expert support
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSubscribe}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-base sm:text-lg py-3"
                >
                  <Rocket className="h-5 w-5 mr-2" />
                  Subscribe Now
                </Button>


              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignalPlanDetails;
