import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuthenticatedQuery } from "@/hooks/useApiQuery";
import { 
  BarChart3, 
  Trophy, 
  Target, 
  TrendingUp, 
  ArrowLeft, 
  ArrowRight,
  Users,
  MessageSquare,
  Rocket,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  HelpCircle,
  Mail,
  Phone,
  ExternalLink,
  Activity,
  Star,
  Zap,
  Bell,
  BellOff
} from "@/components/icons";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import webPushService from "@/services/webPushService";

// Interfaces
interface Challenge {
  _id: string;
  name: string;
  description: string;
  entryFee: number;
  prizePool: number;
  startDate: string;
  endDate: string;
  status: string;
  isFree: boolean;
}

interface SignalPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

interface MentorshipPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  metadata: {
    mentorName: string;
    mentorExperience: string;
  };
}

interface PropFirmService {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

interface UserSubscription {
  _id: string;
  status: string;
  startDate: string;
  endDate: string;
  plan: SignalPlan | MentorshipPlan | PropFirmService;
}

interface PropFirmServiceData {
  _id: string;
  status: string;
  startDate: string;
  endDate: string;
  package: {
    _id: string;
    name: string;
    price: number;
    features: string[];
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use React Query for data fetching with optimized caching
  const { 
    data: challengesData, 
    isLoading: challengesLoading, 
    error: challengesError 
  } = useAuthenticatedQuery<{ data: Challenge[] }>(
    ['user-challenges'],
    '/challenges/user/my-challenges',
    { 
      enabled: !!user,
      staleTime: 10 * 1000, // 10 seconds for ultra-fast updates
      gcTime: 2 * 60 * 1000, // 2 minutes cache
    }
  );

  const { 
    data: signalData, 
    isLoading: signalLoading, 
    error: signalError 
  } = useAuthenticatedQuery<{ data: UserSubscription[] }>(
    ['signal-subscriptions'],
    '/signal-plans/user/subscriptions',
    { 
      enabled: !!user,
      staleTime: 5 * 1000, // 5 seconds for ultra-fast updates
      gcTime: 1 * 60 * 1000, // 1 minute cache
    }
  );

  const { 
    data: mentorshipData, 
    isLoading: mentorshipLoading, 
    error: mentorshipError 
  } = useAuthenticatedQuery<{ data: UserSubscription[] }>(
    ['mentorship-subscriptions'],
    '/mentorship-plans/user/subscriptions',
    { 
      enabled: !!user,
      staleTime: 5 * 1000, // 5 seconds for ultra-fast updates
      gcTime: 1 * 60 * 1000, // 1 minute cache
    }
  );

  const { 
    data: propFirmData, 
    isLoading: propFirmLoading, 
    error: propFirmError 
  } = useAuthenticatedQuery<{ data: PropFirmServiceData[] }>(
    ['prop-firm-services'],
    '/prop-firm-services/my-services',
    { 
      enabled: !!user,
      staleTime: 10 * 1000, // 10 seconds for ultra-fast updates
      gcTime: 2 * 60 * 1000, // 2 minutes cache
    }
  );

  // Extract data from API responses
  const userChallenges = (challengesData as any)?.data || [];
  const signalSubscriptions = (signalData as any)?.data || [];
  const mentorshipSubscriptions = (mentorshipData as any)?.data || [];
  const propFirmServices = (propFirmData as any)?.data || [];

  // Check if any data is still loading
  const loading = challengesLoading || signalLoading || mentorshipLoading || propFirmLoading;

  // Handle errors
  useEffect(() => {
    if (challengesError || signalError || mentorshipError || propFirmError) {
      toast.error('Failed to load dashboard data');
    }
  }, [challengesError, signalError, mentorshipError, propFirmError]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'completed':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <LoadingSpinner 
          message="Loading your dashboard..." 
          size="lg"
          fullScreen={true}
        />
      </div>
    );
  }

  // Error boundary fallback
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your dashboard</h2>
          <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-purple-600 to-purple-900">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
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
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Welcome back, {user?.firstName || user?.username}!
            </span>
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-3xl mx-auto">
            Track your trading progress and manage all your services
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-4 text-center">
              <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{userChallenges.length}</div>
              <div className="text-xs text-gray-400">Competitions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-4 text-center">
              <Rocket className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{signalSubscriptions.length}</div>
              <div className="text-xs text-gray-400">Signal Plans</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{mentorshipSubscriptions.length}</div>
              <div className="text-xs text-gray-400">Mentorships</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{propFirmServices.length}</div>
              <div className="text-xs text-gray-400">Prop Services</div>
            </CardContent>
          </Card>
        </div>

        {/* Push Notification Status */}
        <PushNotificationStatus />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* My Competitions */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl flex items-center">
                    <Trophy className="h-6 w-6 mr-3 text-purple-400" />
                    My Competitions
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/challenges')}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {userChallenges.length > 0 ? (
                  <div className="space-y-4">
                    {userChallenges.slice(0, 3).map((challenge) => (
                      <div key={challenge._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{challenge.name}</h4>
                          <p className="text-gray-400 text-sm">{formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</p>
                        </div>
                        <Badge className={getStatusColor(challenge.status)}>
                          {challenge.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No competitions joined yet</p>
                    <Button
                      onClick={() => navigate('/challenges')}
                      className="bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950"
                    >
                      Join Competition
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Signal Plans */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl flex items-center">
                    <Rocket className="h-6 w-6 mr-3 text-purple-500" />
                    Signal Plans
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/signal-plans')}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {signalSubscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {signalSubscriptions.slice(0, 3).map((subscription) => (
                      <div key={subscription._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{(subscription.plan as SignalPlan)?.name || 'Unknown Plan'}</h4>
                          <p className="text-gray-400 text-sm">Expires: {formatDate(subscription.endDate)}</p>
                        </div>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Rocket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No signal plans subscribed</p>
                    <Button
                      onClick={() => navigate('/signal-plans')}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    >
                      Get Signals
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Mentorship Plans */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl flex items-center">
                    <Users className="h-6 w-6 mr-3 text-blue-400" />
                    Mentorship Plans
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/mentorships')}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {mentorshipSubscriptions.length > 0 ? (
                  <div className="space-y-4">
                    {mentorshipSubscriptions.slice(0, 3).map((subscription) => (
                      <div key={subscription._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{(subscription.plan as MentorshipPlan)?.name || 'Unknown Plan'}</h4>
                          <p className="text-gray-400 text-sm">Mentor: {(subscription.plan as MentorshipPlan)?.metadata?.mentorName || 'Unknown'}</p>
                        </div>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No mentorship plans joined</p>
                    <Button
                      onClick={() => navigate('/mentorships')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Find Mentor
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prop Firm Services */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl flex items-center">
                    <CheckCircle className="h-6 w-6 mr-3 text-green-400" />
                    Prop Firm Services
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/prop-firm-packages')}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {propFirmServices.length > 0 ? (
                  <div className="space-y-4">
                    {propFirmServices.slice(0, 3).map((service) => (
                      <div key={service._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{service.package?.name || 'Unknown Service'}</h4>
                          <p className="text-gray-400 text-sm">Expires: {formatDate(service.endDate)}</p>
                        </div>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No prop firm services</p>
                    <Button
                      onClick={() => navigate('/prop-firm-packages')}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Get Funded
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* Support Section */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mt-8">
          <CardHeader className="p-6">
            <CardTitle className="text-white text-xl flex items-center">
              <HelpCircle className="h-6 w-6 mr-3 text-yellow-400" />
              Need Help?
            </CardTitle>
            <CardDescription className="text-gray-300">
              Get support from our team or contact us directly
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/support')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 h-auto p-4"
              >
                <div className="text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                  <div className="font-medium">Support Center</div>
                  <div className="text-sm text-gray-400">Submit a ticket</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open('mailto:support@ctg.com', '_blank')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 h-auto p-4"
              >
                <div className="text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-green-400" />
                  <div className="font-medium">Email Support</div>
                  <div className="text-sm text-gray-400">support@ctg.com</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open('tel:+1234567890', '_blank')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 h-auto p-4"
              >
                <div className="text-center">
                  <Phone className="h-8 w-8 mx-auto mb-2 text-purple-400" />
                  <div className="font-medium">Call Us</div>
                  <div className="text-sm text-gray-400">+1 (234) 567-890</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Push Notification Status Component
const PushNotificationStatus = () => {
  const [notificationStatus, setNotificationStatus] = useState<'granted' | 'denied' | 'default'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check notification permission status
    if ('Notification' in window) {
      const permission = Notification.permission;
      setNotificationStatus(permission);
    }

    // Check if user is subscribed
    const checkSubscription = async () => {
      try {
        if (webPushService.isSupported()) {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        }
      } catch (error) {
        // Silent error handling for subscription check
      }
    };

    checkSubscription();
  }, []);

  const handleResubscribe = async () => {
    setIsLoading(true);
    try {
      await webPushService.resubscribe();
      setIsSubscribed(true);
      setNotificationStatus('granted');
      toast.success('Push notifications resubscribed successfully!');
    } catch (error) {
      toast.error('Failed to resubscribe to push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      
      if (permission === 'granted') {
        await webPushService.subscribeToPush();
        setIsSubscribed(true);
        toast.success('Push notifications enabled successfully!');
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      toast.error('Failed to enable push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      const userToken = localStorage.getItem('token');
      if (!userToken) {
        toast.error('Please login first');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'API_URL'}/notifications/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Test notification sent!');
      } else {
        toast.error('Failed to send test notification');
      }
    } catch (error) {
      toast.error('Error sending test notification');
    }
  };

  if (!webPushService.isSupported()) {
    return null; // Don't show if not supported
  }

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {notificationStatus === 'granted' && isSubscribed ? (
              <Bell className="h-6 w-6 text-green-400" />
            ) : (
              <BellOff className="h-6 w-6 text-yellow-400" />
            )}
            <div>
              <h3 className="text-white font-medium">
                Push Notifications
              </h3>
              <p className="text-gray-400 text-sm">
                {notificationStatus === 'granted' && isSubscribed 
                  ? 'You will receive trading alerts and updates'
                  : 'Enable to receive important trading notifications'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {notificationStatus === 'granted' && isSubscribed ? (
              <>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Active
                </Badge>
                <Button
                  onClick={handleTestNotification}
                  size="sm"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Test
                </Button>
              </>
            ) : (
              <Button
                onClick={notificationStatus === 'granted' ? handleResubscribe : handleEnableNotifications}
                disabled={isLoading}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : notificationStatus === 'granted' ? (
                  'Resubscribe'
                ) : (
                  'Enable'
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
