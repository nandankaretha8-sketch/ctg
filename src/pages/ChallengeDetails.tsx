import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Trophy, 
  Users, 
  Clock, 
  DollarSign, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Eye,
  BarChart3,
  Activity,
  Award,
  Calendar,
  User,
  Settings,
  Shield,
  CheckCircle,
  AlertCircle,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { toast } from 'sonner';
import { API_URL } from '@/lib/api';

interface Challenge {
  _id: string;
  name: string;
  type: string;
  accountSize: number;
  price: number;
  isFree: boolean;
  prizes: Array<{
    rank?: number;
    rankStart?: number;
    rankEnd?: number;
    prize: string;
    amount: number;
    isBulk: boolean;
  }>;
  maxParticipants: number;
  currentParticipants: number;
  startDate: string;
  endDate: string;
  status: string;
  description: string;
  rules: string[];
  requirements: {
    minBalance: number;
    maxDrawdown: number;
    targetProfit: number;
  };
  challengeMode: string;
  isActive: boolean;
  isFull: boolean;
}

interface MT5Account {
  id: string;
  accountId: number;
  server: string;
  password: string;
  challengeId: string;
  challengeName: string;
  joinedAt: string;
  status: string;
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  accountId: number;
  balance: number;
  equity: number;
  profit: number;
  profitPercent: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  positions: Array<{
    symbol: string;
    volume: number;
    price: number;
    profit: number;
  }>;
  updatedAt: string;
}

const ChallengeDetails = () => {
  const { id: challengeId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { paymentStatus, loading: paymentLoading, refreshPaymentStatus } = usePaymentStatus('challenge', challengeId || '');
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [mt5Account, setMt5Account] = useState<MT5Account | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'account'>('overview');
  const [userParticipation, setUserParticipation] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    mt5AccountId: '',
    mt5Password: '',
    mt5Server: ''
  });

  useEffect(() => {
    if (challengeId) {
      fetchChallengeDetails();
      fetchUserMT5Account();
      fetchLeaderboard();
      // If routed with intent to open account tab first
      const navState = (window.history.state && (window.history.state as any).usr) || undefined;
      if (navState && navState.openTab === 'account') {
        setActiveTab('account');
      }
    }
  }, [challengeId]);

  // Refresh payment status periodically when it's pending
  useEffect(() => {
    if (paymentStatus.status === 'pending') {
      const interval = setInterval(() => {
        refreshPaymentStatus();
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [paymentStatus.status, refreshPaymentStatus]);

  const fetchChallengeDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/challenges/${challengeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChallenge(data.data || data.challenge);
      } else {
        toast.error('Failed to fetch competition details');
        navigate('/challenges');
      }
    } catch (error) {
      // Error handling:'Error fetching challenge:', error);
      toast.error('Failed to fetch competition details');
      navigate('/challenges');
    }
  };

  const fetchUserMT5Account = async () => {
    try {
      const response = await fetch(`${API_URL}/challenges/${challengeId}/account`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMt5Account(data.account);
        setUserParticipation(data.account);
      } else {
        // User is not a participant, check if they have pending_setup status
        setUserParticipation(null);
      }
    } catch (error) {
      // Error handling:'Error fetching MT5 account:', error);
      setUserParticipation(null);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/leaderboard?challengeId=${challengeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        
        // Find user's rank
        if (data.leaderboard && Array.isArray(data.leaderboard)) {
          const userEntry = data.leaderboard.find((entry: LeaderboardEntry) => entry.userId === user?.id);
          if (userEntry) {
            const rank = data.leaderboard.indexOf(userEntry) + 1;
            setUserRank(rank);
          }
        }
      }
    } catch (error) {
      // Error handling:'Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
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
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMT5Setup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mt5AccountId || !formData.mt5Password || !formData.mt5Server) {
      toast.error('Please fill in all MT5 account details');
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mt5Account: {
            id: formData.mt5AccountId,
            password: formData.mt5Password,
            server: formData.mt5Server
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.data?.requiresPayment) {
          toast.success('MT5 details saved. Proceed to payment.');
          navigate(`/payment/challenge/${challengeId}`, {
            state: {
              serviceData: {
                id: challengeId,
                name: challenge?.name,
                price: challenge?.price,
                type: 'challenge'
              }
            }
          });
        } else {
          toast.success('Successfully completed MT5 setup and joined challenge!');
          await fetchUserMT5Account();
          setActiveTab('account');
        }
      } else {
        toast.error(data.message || 'Failed to complete MT5 setup');
      }
    } catch (error) {
      // Error handling:'Error completing MT5 setup:', error);
      toast.error('Failed to complete MT5 setup');
    } finally {
      setSubmitting(false);
    }
  };

  // Show MT5 setup form when:
  // - user hasn't joined yet (no account fetched), or
  // - user is joined but pending_setup / pending_payment and no MT5 set
  const hasPendingSetup = (
    !mt5Account ||
    (userParticipation &&
      (userParticipation.status === 'pending_setup' || userParticipation.status === 'pending_payment') &&
      !userParticipation.accountId)
  );

  const handleJoinChallenge = () => {
    if (!user) {
      toast.error('Please login to join challenges');
      navigate('/login');
      return;
    }

    // If challenge is free, go directly to MT5 setup
    if (challenge.isFree) {
      // For free challenges, create a pending_setup participation
      setUserParticipation({ status: 'pending_setup' });
      setActiveTab('account');
      return;
    }

    // If payment is verified, redirect to MT5 setup
    if (paymentStatus.status === 'verified') {
      setActiveTab('account');
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
    
    navigate(`/payment/challenge/${challengeId}`, {
      state: {
        serviceData: {
          id: challengeId,
          name: challenge.name,
          price: challenge.price,
          type: 'challenge'
        }
      }
    });
  };

  const getJoinButtonText = () => {
    if (paymentLoading) return 'Loading...';
    
    if (userParticipation) {
      if (hasPendingSetup) return 'Complete MT5 Setup';
      if (mt5Account) return 'View Performance';
      return 'Setup MT5 Account';
    }

    if (challenge.isFree) {
      return 'Join Competition';
    }
    
    switch (paymentStatus.status) {
      case 'verified':
        return 'Setup MT5 Account';
      case 'pending':
        return 'Payment Under Verification';
      case 'failed':
        return 'Retry Payment';
      default:
        return 'Join Competition';
    }
  };

  const getJoinButtonIcon = () => {
    if (userParticipation) {
      if (hasPendingSetup) return <Settings className="h-4 w-4 mr-2" />;
      if (mt5Account) return <BarChart3 className="h-4 w-4 mr-2" />;
      return <Settings className="h-4 w-4 mr-2" />;
    }

    if (challenge.isFree) {
      return <Trophy className="h-4 w-4 mr-2" />;
    }
    
    switch (paymentStatus.status) {
      case 'verified':
        return <Settings className="h-4 w-4 mr-2" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-2" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 mr-2" />;
      default:
        return <Trophy className="h-4 w-4 mr-2" />;
    }
  };

  const getJoinButtonClass = () => {
    const baseClass = "w-full font-semibold text-base py-3";
    
    if (userParticipation) {
      if (hasPendingSetup) return `${baseClass} bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white`;
      if (mt5Account) return `${baseClass} bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white`;
      return `${baseClass} bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white`;
    }

    if (challenge.isFree) {
      return `${baseClass} bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white`;
    }
    
    switch (paymentStatus.status) {
      case 'verified':
        return `${baseClass} bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white`;
      case 'pending':
        return `${baseClass} bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white`;
      case 'failed':
        return `${baseClass} bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white`;
      default:
        return `${baseClass} bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white`;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'swing':
        return <Target className="h-5 w-5" />;
      case 'scalp':
      case 'scalping':
        return <Activity className="h-5 w-5" />;
      case 'day-trading':
        return <Clock className="h-5 w-5" />;
      default:
        return <Trophy className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'swing':
        return 'bg-blue-500';
      case 'scalp':
      case 'scalping':
        return 'bg-orange-500';
      case 'day-trading':
        return 'bg-green-500';
      default:
        return 'bg-purple-500';
    }
  };

  const getChallengeStatus = (startDate: string, endDate: string, status: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (status === 'cancelled') return 'cancelled';
    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="text-white text-lg sm:text-xl text-center">Loading competition details...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">
        <div className="text-white text-lg sm:text-xl text-center">Challenge not found</div>
      </div>
    );
  }

  const challengeStatus = getChallengeStatus(challenge.startDate, challenge.endDate, challenge.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/challenges')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back to Challenges</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Challenge Header */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-4 sm:mb-6 lg:mb-8">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-white mb-2">{challenge.name}</CardTitle>
                <CardDescription className="text-gray-300 text-sm sm:text-base lg:text-lg mb-4">
                  {challenge.description}
                </CardDescription>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                  <Badge className={`${getTypeColor(challenge.type)} text-white text-xs sm:text-sm`}>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(challenge.type)}
                      <span className="hidden sm:inline">{challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}</span>
                      <span className="sm:hidden">{challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1).substring(0, 3)}</span>
                    </div>
                  </Badge>
                  
                  <Badge 
                    variant="outline" 
                    className={`text-xs sm:text-sm ${
                      challengeStatus === 'active' 
                        ? 'text-green-400 border-green-400' 
                        : challengeStatus === 'upcoming'
                        ? 'text-blue-400 border-blue-400'
                        : challengeStatus === 'completed'
                        ? 'text-gray-400 border-gray-400'
                        : 'text-gray-400 border-gray-400'
                    }`}
                  >
                    {challengeStatus.charAt(0).toUpperCase() + challengeStatus.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <div className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {formatCurrency(challenge.accountSize)}
                </div>
                <div className="text-gray-400 text-xs sm:text-sm mb-4">Account Size</div>
                
                {/* Main Action Button */}
                {challengeStatus === 'active' && (
                  <Button
                    onClick={handleJoinChallenge}
                    className={getJoinButtonClass()}
                    disabled={paymentLoading}
                  >
                    {getJoinButtonIcon()}
                    {getJoinButtonText()}
                  </Button>
                )}
                
                {challengeStatus === 'upcoming' && (
                  <Button
                    disabled
                    className="w-full bg-gray-600 text-gray-300 font-semibold text-base py-3"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Competition Starts Soon
                  </Button>
                )}
                
                {challengeStatus === 'completed' && (
                  <Button
                    disabled
                    className="w-full bg-gray-600 text-gray-300 font-semibold text-base py-3"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Competition Ended
                  </Button>
                )}
                
                {/* Price Display for Paid Challenges */}
                {!challenge.isFree && challengeStatus === 'active' && (
                  <div className="mt-2 text-center">
                    <span className="text-gray-400 text-sm">Entry Fee: </span>
                    <span className="text-white font-semibold">{formatCurrency(challenge.price)}</span>
                  </div>
                )}

                {/* Payment Status Messages */}
                {!challenge.isFree && challengeStatus === 'active' && (
                  <>
                    {paymentStatus.status === 'pending' && (
                      <div className="mt-3 text-center">
                        <p className="text-yellow-400 text-sm">
                          Your payment is under verification. You will gain access shortly.
                        </p>
                      </div>
                    )}
                    {paymentStatus.status === 'failed' && (
                      <div className="mt-3 text-center">
                        <p className="text-red-400 text-sm">
                          Your last payment failed. Please retry or contact support.
                        </p>
                      </div>
                    )}
                    {paymentStatus.status === 'verified' && !userParticipation && (
                      <div className="mt-3 text-center">
                        <p className="text-green-400 text-sm">
                          Payment verified! You can now set up your MT5 account.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
            className="text-white text-sm sm:text-base flex-1 sm:flex-none"
          >
            <Eye className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Overview</span>
          </Button>
          <Button
            variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('leaderboard')}
            className="text-white text-sm sm:text-base flex-1 sm:flex-none"
          >
            <Trophy className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Leaderboard</span>
            <span className="sm:hidden">Rankings</span>
          </Button>
          <Button
            variant={activeTab === 'account' ? 'default' : 'outline'}
            onClick={() => setActiveTab('account')}
            className={`text-white text-sm sm:text-base flex-1 sm:flex-none relative ${
              hasPendingSetup ? 'border-orange-400 text-orange-400' : ''
            }`}
          >
            <Settings className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">MT5 Account</span>
            <span className="sm:hidden">Account</span>
            {hasPendingSetup && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
            )}
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Challenge Info */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  Competition Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-400 text-sm sm:text-base">Duration:</span>
                  <span className="text-white text-sm sm:text-base">
                    {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-400 text-sm sm:text-base">Participants:</span>
                  <span className="text-white text-sm sm:text-base">
                    {challenge.currentParticipants}/{challenge.maxParticipants}
                  </span>
                </div>
                
                {/* Only show target-based fields for target mode challenges */}
                {challenge.challengeMode === 'target' && (
                  <>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-gray-400 text-sm sm:text-base">Target Profit:</span>
                      <span className="text-white text-sm sm:text-base">{challenge.requirements.targetProfit}%</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                      <span className="text-gray-400 text-sm sm:text-base">Max Drawdown:</span>
                      <span className="text-white text-sm sm:text-base">{challenge.requirements.maxDrawdown}%</span>
                    </div>
                  </>
                )}
                
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                  <span className="text-gray-400 text-sm sm:text-base">Mode:</span>
                  <span className="text-white text-sm sm:text-base">{challenge.challengeMode}</span>
                </div>
              </CardContent>
            </Card>

            {/* User Stats */}
            {mt5Account && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    Your Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  {userRank ? (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-400 text-sm sm:text-base">Current Rank:</span>
                        <span className="text-white font-bold text-sm sm:text-base">#{userRank}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-400 text-sm sm:text-base">Account ID:</span>
                        <span className="text-white text-sm sm:text-base">{mt5Account.accountId}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                        <span className="text-gray-400 text-sm sm:text-base">Joined:</span>
                        <span className="text-white text-sm sm:text-base">{formatDate(mt5Account.joinedAt)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-4 text-sm sm:text-base">
                      No performance data available yet
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Prizes Section */}
            {challenge.prizes && challenge.prizes.length > 0 && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10 lg:col-span-2">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                    Prizes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {challenge.prizes
                      .sort((a, b) => {
                        // Sort by rank order (individual ranks first, then bulk prizes)
                        const aRank = a.rank || 0;
                        const bRank = b.rank || 0;
                        return aRank - bRank;
                      })
                      .map((prize, index) => {
                        // Check if it's a bulk prize
                        const isBulk = prize.isBulk || (prize.rankStart && prize.rankEnd) || (prize.prize && /ranks?\s+\d+-\d+/i.test(prize.prize));
                        
                        if (isBulk) {
                          // Extract rank range from description if not explicitly set
                          const rankMatch = prize.prize?.match(/ranks?\s+(\d+)-(\d+)/i);
                          const startRank = prize.rankStart || (rankMatch ? parseInt(rankMatch[1]) : prize.rank);
                          const endRank = prize.rankEnd || (rankMatch ? parseInt(rankMatch[2]) : prize.rank);
                          
                          return (
                            <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm sm:text-base">
                                  {prize.rank}
                                </div>
                                <span className="text-yellow-400 font-semibold text-sm sm:text-base">
                                  Ranks {startRank}-{endRank}
                                </span>
                              </div>
                              <div className="text-white font-bold text-lg sm:text-xl mb-1">
                                {formatCurrency(prize.amount)}
                              </div>
                              <div className="text-gray-300 text-xs sm:text-sm">
                                {prize.prize}
                              </div>
                            </div>
                          );
                        } else {
                          // Individual prize
                          return (
                            <div key={index} className="p-3 sm:p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm sm:text-base">
                                  {prize.rank}
                                </div>
                                <span className="text-yellow-400 font-semibold text-sm sm:text-base">
                                  Rank #{prize.rank}
                                </span>
                              </div>
                              <div className="text-white font-bold text-lg sm:text-xl mb-1">
                                {formatCurrency(prize.amount)}
                              </div>
                              <div className="text-gray-300 text-xs sm:text-sm">
                                {prize.prize}
                              </div>
                            </div>
                          );
                        }
                      })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {leaderboard.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.userId}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg gap-3 sm:gap-0 ${
                        entry.userId === user?.id 
                          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30' 
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-sm sm:text-base">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-semibold text-sm sm:text-base truncate">
                            {entry.firstName} {entry.lastName}
                          </div>
                          <div className="text-gray-400 text-xs sm:text-sm">@{entry.username}</div>
                        </div>
                      </div>
                      
                      <div className="text-left sm:text-right">
                        <div className={`text-base sm:text-lg font-bold ${
                          entry.profitPercent >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {entry.profitPercent >= 0 ? '+' : ''}{entry.profitPercent.toFixed(2)}%
                        </div>
                        <div className="text-gray-400 text-xs sm:text-sm">
                          {formatCurrency(entry.equity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">
                  No leaderboard data available yet
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'account' && (
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                MT5 Account Details
              </CardTitle>
              <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs sm:text-sm">
                <span className="text-blue-400 font-medium">Note:</span>
                <span className="text-gray-300 ml-1">The password shown below is your investor password, used only for monitoring your account performance. Use your master password to login and trade.</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {hasPendingSetup ? (
                <div className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-400" />
                      <div>
                        <h4 className="text-blue-400 font-semibold">Payment Complete</h4>
                        <p className="text-gray-300 text-sm">
                          Your payment has been processed successfully. Please complete your MT5 account setup below to join the competition.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleMT5Setup} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="mt5AccountId" className="text-white">
                        MT5 Account ID
                      </Label>
                      <Input
                        id="mt5AccountId"
                        name="mt5AccountId"
                        type="text"
                        placeholder="Enter your MT5 account ID"
                        value={formData.mt5AccountId}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mt5Password" className="text-white">
                        MT5 Investor Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="mt5Password"
                          name="mt5Password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your MT5 investor password"
                          value={formData.mt5Password}
                          onChange={handleInputChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">
                        Use your investor password, not the master password
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mt5Server" className="text-white">
                        MT5 Server
                      </Label>
                      <Input
                        id="mt5Server"
                        name="mt5Server"
                        type="text"
                        placeholder="e.g., MetaQuotes-Demo, YourBroker-Live"
                        value={formData.mt5Server}
                        onChange={handleInputChange}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        required
                      />
                    </div>

                    {/* Security Notice */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-blue-400 font-semibold mb-1">Security Notice</h4>
                          <p className="text-gray-300 text-sm">
                            Your MT5 credentials are encrypted and stored securely. We only use investor passwords 
                            which have read-only access to your account for monitoring purposes.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Account Balance Warning */}
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-orange-400 font-semibold mb-1">Account Balance Requirement</h4>
                          <p className="text-gray-300 text-sm">
                            Your MT5 account balance must match the competition account size of <span className="text-orange-400 font-semibold">{formatCurrency(challenge?.accountSize || 0)}</span>. 
                            If your starting balance is different, your participation will be automatically marked as failed.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 text-base sm:text-sm"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Completing Setup...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Complete Setup & Join
                        </div>
                      )}
                    </Button>
                  </form>
                </div>
              ) : mt5Account ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-gray-400 text-xs sm:text-sm block mb-1">Account ID</label>
                      <div className="text-white font-mono bg-black/20 p-2 sm:p-3 rounded text-sm sm:text-base break-all">
                        {mt5Account.accountId}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs sm:text-sm block mb-1">Server</label>
                      <div className="text-white font-mono bg-black/20 p-2 sm:p-3 rounded text-sm sm:text-base break-all">
                        {mt5Account.server}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-gray-400 text-xs sm:text-sm block mb-1">Password</label>
                      <div className="text-white font-mono bg-black/20 p-2 sm:p-3 rounded text-sm sm:text-base break-all">
                        {mt5Account.password}
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs sm:text-sm block mb-1">Status</label>
                      <div className="text-white font-mono bg-black/20 p-2 sm:p-3 rounded text-sm sm:text-base">
                        {mt5Account.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-blue-400 font-semibold mb-2 text-sm sm:text-base">How It Works:</div>
                    <ol className="text-gray-300 text-xs sm:text-sm space-y-1 list-decimal list-inside">
                      <li>Download and install MetaTrader5 terminal on your device</li>
                      <li>Login to your MT5 account using your master password (not the investor password shown above)</li>
                      <li>Start trading according to the challenge rules and requirements</li>
                      <li>We monitor your account using the investor password for performance tracking</li>
                      <li>Your trading performance will be automatically tracked and updated</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-6 sm:py-8 text-sm sm:text-base">
                  No MT5 account found for this challenge
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChallengeDetails;
