import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ServiceGrid from "@/components/ServiceGrid";
import { API_URL } from "@/lib/api";
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
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
  
  // State management
  const [userChallenges, setUserChallenges] = useState<Challenge[]>([]);
  const [signalSubscriptions, setSignalSubscriptions] = useState<UserSubscription[]>([]);
  const [mentorshipSubscriptions, setMentorshipSubscriptions] = useState<UserSubscription[]>([]);
  const [propFirmServices, setPropFirmServices] = useState<PropFirmServiceData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      await Promise.allSettled([
        fetchUserChallenges(),
        fetchSignalSubscriptions(),
        fetchMentorshipSubscriptions(),
        fetchPropFirmServices()
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/challenges/user/my-challenges`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserChallenges(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    }
  };

  const fetchSignalSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/signal-plans/user/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSignalSubscriptions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching signal subscriptions:', error);
    }
  };

  const fetchMentorshipSubscriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/mentorship-plans/user/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMentorshipSubscriptions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching mentorship subscriptions:', error);
    }
  };

  const fetchPropFirmServices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/prop-firm-services/my-services`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPropFirmServices(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching prop firm services:', error);
    }
  };

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Error boundary fallback
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your dashboard</h2>
          <Button onClick={() => navigate('/login')} className="bg-gradient-to-r from-purple-600 to-pink-600">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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

        {/* Service Grid */}
        <ServiceGrid />

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

export default Dashboard;
