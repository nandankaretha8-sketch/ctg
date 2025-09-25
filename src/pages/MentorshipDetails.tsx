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
  ChevronDown,
  ChevronUp,
  User,
  Award,
  BookOpen,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';

import { API_URL } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
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

const MentorshipDetails = () => {
  const { id: planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { paymentStatus, loading: paymentLoading } = usePaymentStatus('mentorship', planId || '');
  
  const [plan, setPlan] = useState<MentorshipPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (planId) {
      fetchMentorshipPlan();
      checkSubscription();
    }
  }, [planId, user]);

  const fetchMentorshipPlan = async () => {
    try {
      const response = await fetch(`${API_URL}/mentorship-plans/${planId}`, {
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
      toast.error('Failed to fetch mentorship plan details');
      navigate('/mentorships');
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_URL}/mentorship-plans/user/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const subscription = data.data.find((sub: any) => sub.mentorshipPlan === planId);
        setIsSubscribed(subscription && subscription.status === 'active');
      }
    } catch (error) {
      // Silent error handling for subscription check
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
      // Handle duration strings that might contain numbers and text
      const durationLower = duration.toLowerCase();
      
      if (durationLower.includes('month')) {
        // Extract number from duration string (e.g., "2 months" -> "2")
        const match = duration.match(/(\d+)/);
        const number = match ? match[1] : '1';
        return `valid for ${number} month${number !== '1' ? 's' : ''}`;
      } else if (durationLower.includes('year')) {
        // Extract number from duration string (e.g., "1 year" -> "1")
        const match = duration.match(/(\d+)/);
        const number = match ? match[1] : '1';
        return `valid for ${number} year${number !== '1' ? 's' : ''}`;
      } else if (durationLower.includes('quarter')) {
        return 'valid for 3 months';
      } else if (durationLower.includes('semi') || durationLower.includes('6')) {
        return 'valid for 6 months';
      } else {
        // Fallback: try to extract any number and assume months
        const match = duration.match(/(\d+)/);
        if (match) {
          const number = match[1];
          return `valid for ${number} month${number !== '1' ? 's' : ''}`;
        }
        return 'valid for 1 month';
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

  const handleSubscribe = () => {
    if (!user) {
      toast.error('Please login to subscribe to mentorship plans');
      navigate('/login');
      return;
    }

    // If payment is verified or user is subscribed, redirect to chatbox
    if (paymentStatus.status === 'verified' || isSubscribed) {
      navigate(`/mentorship-chatbox/${planId}`);
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

    navigate(`/payment/mentorship/${planId}`, {
      state: {
        serviceData: {
          id: planId,
          name: plan.name,
          price: plan.price,
          type: 'mentorship'
        }
      }
    });
  };

  const getButtonText = () => {
    if (paymentLoading) return 'Loading...';
    
    if (isSubscribed || paymentStatus.status === 'verified') {
      return 'Access Chatbox';
    }
    
    switch (paymentStatus.status) {
      case 'pending':
        return 'Payment Under Verification';
      case 'failed':
        return 'Retry Payment';
      default:
        return 'Subscribe Now';
    }
  };

  const getButtonIcon = () => {
    if (isSubscribed || paymentStatus.status === 'verified') {
      return <MessageSquare className="h-4 w-4 mr-2" />;
    }
    
    switch (paymentStatus.status) {
      case 'pending':
        return <Clock className="h-4 w-4 mr-2" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 mr-2" />;
      default:
        return <Zap className="h-4 w-4 mr-2" />;
    }
  };

  const getButtonClass = () => {
    const baseClass = "w-full relative overflow-hidden group transition-all duration-300 font-semibold py-4 px-6 rounded-xl border-0 mb-4";
    
    if (isSubscribed || paymentStatus.status === 'verified') {
      return `${baseClass} bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 shadow-lg hover:shadow-purple-500/25 text-white`;
    }
    
    switch (paymentStatus.status) {
      case 'pending':
        return `${baseClass} bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-yellow-500/25 text-white cursor-not-allowed`;
      case 'failed':
        return `${baseClass} bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-red-500/25 text-white`;
      default:
        return `${baseClass} bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 shadow-lg hover:shadow-purple-500/25 hover:scale-105 text-white`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <LoadingSpinner 
          message="Loading mentorship plan details..." 
          size="lg"
          fullScreen={true}
        />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Mentorship plan not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Mentorships Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/mentorships')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Mentorships
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {plan.name}
            </span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Learn from {plan.metadata.mentorName} • {plan.metadata.mentorExperience}
          </p>
          {plan.isPopular && (
            <div className="mt-4">
              <Badge className="bg-orange-500 text-white">
                <Star className="h-3 w-3 mr-1" />
                Popular Choice
              </Badge>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Plan Overview */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-xl sm:text-2xl">
                  About This Mentorship
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-gray-300 text-lg leading-relaxed mb-6">
                  {plan.description}
                </p>
                
                {/* Mentor Bio */}
                <div className="bg-white/5 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-semibold mb-2 flex items-center">
                    <User className="h-5 w-5 mr-2 text-purple-400" />
                    About {plan.metadata.mentorName}
                  </h3>
                  <p className="text-gray-300 text-sm">
                    {plan.metadata.mentorBio || `Experienced trader with ${plan.metadata.mentorExperience} in the markets. Specializing in ${plan.metadata.specialization.join(', ')} with a ${plan.metadata.successRate}% success rate.`}
                  </p>
                </div>

                {/* Plan Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-white font-semibold">{plan.metadata.courseDuration}</p>
                    <p className="text-gray-400 text-xs">Course Duration</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <p className="text-white font-semibold">{plan.metadata.maxSessionsPerMonth}</p>
                    <p className="text-gray-400 text-xs">Sessions/Month</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-white font-semibold">{plan.metadata.successRate}%</p>
                    <p className="text-gray-400 text-xs">Success Rate</p>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <Users className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                    <p className="text-white font-semibold">{plan.currentSubscribers}</p>
                    <p className="text-gray-400 text-xs">Students</p>
                  </div>
                </div>

                {/* Specialization */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Specialization</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.metadata.specialization.map((spec, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-3">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.metadata.languages.map((lang, index) => (
                      <Badge key={index} variant="outline" className="border-white/20 text-white">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-xl sm:text-2xl flex items-center">
                  <BookOpen className="h-6 w-6 mr-3 text-purple-400" />
                  What's Included
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-xl sm:text-2xl">
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-purple-400 font-bold text-lg">1</span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Subscribe</h3>
                    <p className="text-gray-400 text-sm">Choose your plan and complete payment</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-purple-400 font-bold text-lg">2</span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Connect</h3>
                    <p className="text-gray-400 text-sm">Access the mentorship chatbox and schedule sessions</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <span className="text-purple-400 font-bold text-lg">3</span>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-2">Learn</h3>
                    <p className="text-gray-400 text-sm">Get personalized guidance and improve your trading</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10 sticky top-6">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-xl sm:text-2xl">
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center space-x-2">
                    <span className="text-white text-4xl font-bold">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-gray-400 text-lg">
                      {getDurationLabel(plan.duration, 'one-time')}
                    </span>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Course Duration</span>
                    <span className="text-white">{plan.metadata.courseDuration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Sessions per Month</span>
                    <span className="text-white">{plan.metadata.maxSessionsPerMonth}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Frequency</span>
                    <span className="text-white">{plan.metadata.sessionFrequency}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Current Students</span>
                    <span className="text-white">{plan.currentSubscribers}</span>
                  </div>
                  {plan.maxSubscribers && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Spots Available</span>
                      <span className="text-white">{plan.maxSubscribers - plan.currentSubscribers}</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleSubscribe}
                  className={getButtonClass()}
                  disabled={paymentLoading}
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  
                  {/* Button content */}
                  <div className="relative flex items-center justify-center">
                    {getButtonIcon()}
                    <span>{getButtonText()}</span>
                    {!isSubscribed && paymentStatus.status !== 'pending' && paymentStatus.status !== 'failed' && (
                      <div className="ml-2 w-2 h-2 bg-white/80 rounded-full group-hover:animate-ping" />
                    )}
                  </div>
                </Button>

              </CardContent>
            </Card>

            {/* Mentor Info */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10 sticky top-[600px] lg:top-[500px] xl:top-[450px]">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-purple-400" />
                  Your Mentor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center mx-auto mb-4">
                    {settings?.mentorPhoto ? (
                      <img
                        src={settings.mentorPhoto}
                        alt="Mentor"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-600 to-purple-900 flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {plan.metadata.mentorName}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {plan.metadata.mentorExperience}
                  </p>
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Target className="h-4 w-4 text-green-400" />
                      <span className="text-white">{plan.metadata.successRate}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="text-white">{plan.currentSubscribers}</span>
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

export default MentorshipDetails;
