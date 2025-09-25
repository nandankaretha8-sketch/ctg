import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  Award,
  BookOpen,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import { API_URL } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
interface MentorshipPlan {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: string;
  pricingType: string;
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

interface UserSubscription {
  _id: string;
  mentorshipPlan: string | {
    _id: string;
    name: string;
    description?: string;
    price: number;
    duration: string;
    pricingType: string;
    metadata: any;
  };
  status: string;
}

const Mentorships = () => {
  let user, authLoading;
  try {
    const auth = useAuth();
    user = auth.user;
    authLoading = auth.isLoading;
  } catch (error) {
    console.error('Error accessing auth context:', error);
    user = null;
    authLoading = false;
  }
  
  const navigate = useNavigate();
  
  const [plans, setPlans] = useState<MentorshipPlan[]>([]);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMentorshipPlans();
    if (user) {
      fetchUserSubscriptions();
    }
  }, [user]);

  const fetchMentorshipPlans = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/mentorship-plans`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.data || []);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch mentorship plans: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching mentorship plans:', error);
      setError('Failed to load mentorship plans. Please check your connection and try again.');
      toast.error('Failed to fetch mentorship plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscriptions = async () => {
    try {
      const response = await fetch(`${API_URL}/mentorship-plans/user/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserSubscriptions(data.data || []);
      }
    } catch (error) {
      // Silent error handling for user subscriptions
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getDurationLabel = (duration: string, pricingType: string) => {
    // If it's a one-time payment, show validity period instead of payment frequency
    if (pricingType === 'one-time') {
      switch (duration) {
        case 'monthly': return 'valid for 1 month';
        case 'quarterly': return 'valid for 3 months';
        case 'semi-annual': return 'valid for 6 months';
        case 'annual': return 'valid for 1 year';
        default: return 'valid for 1 month';
      }
    }
    
    // For recurring payments, show payment frequency
    switch (pricingType) {
      case 'monthly': return 'per month';
      case 'quarterly': return 'per quarter';
      case 'semi-annual': return 'per 6 months';
      case 'annual': return 'per year';
      default: return 'per month';
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

  const isUserSubscribed = (planId: string) => {
    const isSubscribed = userSubscriptions.some(sub => {
      // Handle both string ID and populated object cases
      const mentorshipPlanId = typeof sub.mentorshipPlan === 'string' 
        ? sub.mentorshipPlan 
        : sub.mentorshipPlan?._id;
      return mentorshipPlanId === planId && sub.status === 'active';
    });
    return isSubscribed;
  };

  const handleSubscribe = (plan: MentorshipPlan) => {
    if (!user) {
      toast.error('Please login to subscribe to mentorship plans');
      navigate('/login');
      return;
    }

    if (isUserSubscribed(plan._id)) {
      navigate(`/mentorship-dashboard/${plan._id}`);
      return;
    }

    navigate(`/mentorships/${plan._id}`);
  };

  // Show loading state while auth is loading or data is fetching
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <LoadingSpinner 
          message={authLoading ? "Loading..." : "Loading mentorship plans..."} 
          size="lg"
          fullScreen={true}
        />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          
          <h2 className="text-xl font-semibold text-white mb-2">
            Unable to Load Mentorship Plans
          </h2>
          
          <p className="text-gray-400 mb-6">
            {error}
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchMentorshipPlans();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
              Mentorship Programs
            </span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Learn from expert traders and accelerate your trading journey
          </p>
        </div>


        {/* Mentorship Plans Grid */}
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan._id} 
                className={`bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer group ${
                  plan.isPopular ? 'ring-2 ring-orange-500/50 hover:ring-orange-500/70' : ''
                }`}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-white text-lg sm:text-xl group-hover:text-purple-300 transition-colors">
                      {plan.name}
                    </CardTitle>
                    {plan.isPopular && (
                      <Badge className="bg-orange-500 text-white text-xs">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-0">
                  {/* Mentor Info */}
                  <div className="mb-4 p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-purple-400" />
                      <span className="text-white font-medium text-sm">
                        {plan.metadata.mentorName}
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs">
                      {plan.metadata.mentorExperience} • {plan.metadata.successRate}% Success Rate
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-white text-3xl font-bold">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {getDurationLabel(plan.duration, plan.pricingType)}
                      </span>
                    </div>
                  </div>

                  {/* Plan Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-white/5 rounded">
                      <Clock className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                      <p className="text-white text-xs font-medium">{plan.metadata.courseDuration}</p>
                      <p className="text-gray-400 text-xs">Course Duration</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <Calendar className="h-4 w-4 text-green-400 mx-auto mb-1" />
                      <p className="text-white text-xs font-medium">{plan.metadata.maxSessionsPerMonth}</p>
                      <p className="text-gray-400 text-xs">Per Month</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-purple-400" />
                      What's Included
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>


                  {/* Subscriber Count */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center space-x-1 text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{plan.currentSubscribers} subscribers</span>
                    </div>
                    {plan.maxSubscribers && (
                      <span className="text-gray-400">
                        {plan.maxSubscribers - plan.currentSubscribers} spots left
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    className={`w-full relative overflow-hidden group transition-all duration-300 ${
                      isUserSubscribed(plan._id)
                        ? 'bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 shadow-lg hover:shadow-purple-500/25'
                        : 'bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 shadow-lg hover:shadow-purple-500/25 hover:scale-105'
                    } text-white font-semibold py-4 px-6 rounded-xl border-0`}
                  >
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    
                    {/* Button content */}
                    <div className="relative flex items-center justify-center">
                      {isUserSubscribed(plan._id) ? (
                        <>
                          <User className="h-5 w-5 mr-2" />
                          <span>View Details</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                          <span>Subscribe Now</span>
                          <div className="ml-2 w-2 h-2 bg-white/80 rounded-full group-hover:animate-ping" />
                        </>
                      )}
                    </div>
                  </Button>
                </CardContent>
                
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Mentorship Plans Available</h3>
            <p className="text-gray-400">
              Check back soon for new mentorship opportunities.
            </p>
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Expert Guidance</h3>
            <p className="text-gray-400 text-sm">
              Learn from experienced traders with proven track records
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Personalized Learning</h3>
            <p className="text-gray-400 text-sm">
              Get 1-on-1 sessions tailored to your trading goals
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Proven Results</h3>
            <p className="text-gray-400 text-sm">
              Join thousands of successful traders who learned with us
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MentorshipsWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <Mentorships />
    </ErrorBoundary>
  );
};

export default MentorshipsWithErrorBoundary;
