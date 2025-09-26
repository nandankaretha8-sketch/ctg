import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Trophy, Users, Clock, DollarSign, Target, CheckCircle, Calendar, UserCheck, Home, ArrowLeft, Eye, FileText, X, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePaymentStatus } from '@/hooks/usePaymentStatus';
import { useManualQuery } from '@/hooks/useManualQuery';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

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

const Challenges = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('all');
  const [showRules, setShowRules] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, { status: string; loading: boolean }>>({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchChallenges();
    if (user) {
      fetchUserChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_URL}/challenges?status=active,upcoming,completed`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.data || []);
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to fetch challenges: ${response.status} ${errorText}`);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError('Failed to load challenges. Please check your connection and try again.');
      toast.error('Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      const response = await fetch(`${API_URL}/challenges/user/my-challenges`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserChallenges(data.data || []);
      }
    } catch (error) {
      // Silent error handling for user challenges
    }
  };


  // Check payment statuses when challenges are loaded
  useEffect(() => {
    if (challenges.length > 0 && user && user.token) {
      checkAllPaymentStatuses();
    }
    // Removed toast messages for non-logged-in users to avoid unwanted notifications
  }, [challenges, user]);

  // Refresh payment statuses periodically when any are pending
  useEffect(() => {
    const hasPendingPayments = Object.values(paymentStatuses).some(status => status.status === 'pending');
    
    if (hasPendingPayments) {
      const interval = setInterval(() => {
        checkAllPaymentStatuses();
      }, 15000); // Refresh every 15 seconds

      return () => clearInterval(interval);
    }
  }, [paymentStatuses]);

  // Refresh payment statuses when page becomes visible (user returns from payment page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && user.token && challenges.length > 0) {
        checkAllPaymentStatuses();
      }
    };

    const handleFocus = () => {
      if (user && user.token && challenges.length > 0) {
        checkAllPaymentStatuses();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, challenges]);


  const handleJoinChallenge = (challengeId: string, isFree: boolean, status: string) => {
    if (!user || !user.token) {
      toast.error('Please login to join challenges');
      navigate('/login');
      return;
    }

    if (status === 'completed') {
      toast.error('This challenge has already ended.');
      return;
    }

    if (status === 'cancelled') {
      toast.error('This challenge has been cancelled.');
      return;
    }

    // Find the challenge data
    const challenge = challenges.find(c => c._id === challengeId);
    if (!challenge) {
      toast.error('Challenge not found');
      return;
    }

    // Allow joining both upcoming and active challenges
    // New flow: always go to challenge details → Account tab (to collect MT5 first)
    navigate(`/challenges/${challengeId}`, { state: { openTab: 'account' } });
  };

  const handleViewChallenge = (challengeId: string) => {
    navigate(`/challenges/${challengeId}`);
  };

  const handleShowRules = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setShowRules(true);
  };

  const handleCloseRules = () => {
    setShowRules(false);
    setSelectedChallenge(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'swing':
        return <Target className="h-5 w-5" />;
      case 'scalp':
      case 'scalping':
        return <Rocket className="h-5 w-5" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'upcoming':
        return 'bg-yellow-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      case 'pending':
        return 'bg-orange-500 text-white';
      case 'expired':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
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

  // Helper function to determine challenge status based on dates
  const getChallengeStatus = (startDate: string, endDate: string, status: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Use UTC dates for comparison to avoid timezone issues
    const nowUTC = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const startUTC = new Date(start.getTime() + (start.getTimezoneOffset() * 60000));
    const endUTC = new Date(end.getTime() + (end.getTimezoneOffset() * 60000));
    
    if (status === 'cancelled') return 'cancelled';
    if (nowUTC < startUTC) return 'upcoming';
    if (nowUTC >= startUTC && nowUTC <= endUTC) return 'active';
    if (nowUTC > endUTC) return 'completed';
    return status;
  };

  // Check if user has joined a challenge
  const hasUserJoined = (challengeId: string) => {
    return userChallenges.some(challenge => challenge._id === challengeId);
  };

  // Check payment status for a specific challenge
  const checkPaymentStatus = async (challengeId: string) => {
    if (!user || !challengeId) {
      return;
    }

    // Check if user has a valid token
    if (!user.token) {
      return;
    }

    try {
      setPaymentStatuses(prev => ({
        ...prev,
        [challengeId]: { status: 'none', loading: true }
      }));

      const response = await fetch(`${API_URL}/manual-payments/status/challenge/${challengeId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setPaymentStatuses(prev => ({
          ...prev,
          [challengeId]: { status: data.data.status, loading: false }
        }));
      } else {
        // Handle authentication errors
        if (response.status === 401) {
          toast.error('Authentication failed. Please log in again to check payment status.');
          setPaymentStatuses(prev => ({
            ...prev,
            [challengeId]: { status: 'none', loading: false }
          }));
        } else {
          setPaymentStatuses(prev => ({
            ...prev,
            [challengeId]: { status: 'none', loading: false }
          }));
        }
      }
    } catch (error) {
      setPaymentStatuses(prev => ({
        ...prev,
        [challengeId]: { status: 'none', loading: false }
      }));
    }
  };

  // Check payment status for all challenges
  const checkAllPaymentStatuses = async () => {
    if (!user || challenges.length === 0) {
      return;
    }

    // Check if user has a valid token
    if (!user.token) {
      return;
    }

    const paidChallenges = challenges.filter(challenge => challenge.price > 0);
    
    for (const challenge of paidChallenges) {
      await checkPaymentStatus(challenge._id);
    }
  };

  // Get button text and styling based on payment status
  const getButtonContent = (challenge: Challenge, userHasJoined: boolean, challengeStatus: string) => {
    const paymentStatus = paymentStatuses[challenge._id];
    
    if (userHasJoined) {
      return {
        text: 'View Details',
        icon: <Eye className="h-4 w-4" />,
        className: 'bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950'
      };
    }

    if (challenge.currentParticipants >= challenge.maxParticipants) {
      return {
        text: 'Challenge Full',
        icon: <Users className="h-4 w-4" />,
        className: 'bg-gray-600 hover:bg-gray-600 cursor-not-allowed'
      };
    }

    if (challengeStatus === 'completed' || challengeStatus === 'cancelled') {
      return {
        text: challengeStatus === 'completed' ? 'Completed' : 'Cancelled',
        icon: challengeStatus === 'completed' ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />,
        className: 'bg-gray-600 hover:bg-gray-600 cursor-not-allowed'
      };
    }

    // Check payment status for paid challenges
    if (challenge.price > 0) {
      // If user is not authenticated, show login prompt
      if (!user || !user.token) {
        return {
          text: 'Login to Join',
          icon: <DollarSign className="h-4 w-4" />,
          className: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
        };
      }
      
      // If payment status is undefined (not checked yet), show loading or default join button
      if (paymentStatus === undefined) {
        if (challengeStatus === 'upcoming') {
          return {
            text: `Join for ${formatCurrency(challenge.price)}`,
            icon: <DollarSign className="h-4 w-4" />,
            className: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
          };
        } else if (challengeStatus === 'active') {
          return {
            text: `Join for ${formatCurrency(challenge.price)}`,
            icon: <DollarSign className="h-4 w-4" />,
            className: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
          };
        }
      }
      
      // If payment status exists, check the actual status
      if (paymentStatus) {
        switch (paymentStatus.status) {
          case 'pending':
            return {
              text: 'Payment Under Verification',
              icon: <Clock className="h-4 w-4" />,
              className: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
            };
          case 'verified':
            return {
              text: 'Setup MT5 Account',
              icon: <CheckCircle className="h-4 w-4" />,
              className: 'bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950'
            };
          case 'failed':
            return {
              text: 'Retry Payment',
              icon: <DollarSign className="h-4 w-4" />,
              className: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
            };
          case 'none':
          default:
            // No payment or payment status is 'none'
            if (challengeStatus === 'upcoming') {
              return {
                text: `Join for ${formatCurrency(challenge.price)}`,
                icon: <DollarSign className="h-4 w-4" />,
                className: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
              };
            } else if (challengeStatus === 'active') {
              return {
                text: `Join for ${formatCurrency(challenge.price)}`,
                icon: <DollarSign className="h-4 w-4" />,
                className: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
              };
            }
        }
      }
    }

    // Free challenges
    if (challenge.price === 0) {
      if (challengeStatus === 'upcoming') {
        return {
          text: 'Join Upcoming',
          icon: <Calendar className="h-4 w-4" />,
          className: 'bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950'
        };
      } else if (challengeStatus === 'active') {
        return {
          text: 'Join Now',
          icon: <CheckCircle className="h-4 w-4" />,
          className: 'bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950'
        };
      }
    }

    // Default fallback
    return {
      text: 'Not Available',
      icon: <Clock className="h-4 w-4" />,
      className: 'bg-gray-600 hover:bg-gray-600 cursor-not-allowed'
    };
  };

  // Get filtered challenges based on sort selection
  const getFilteredChallenges = () => {
    // Filter by sort selection
    switch (sortBy) {
      case 'upcoming':
        return challenges.filter(challenge => 
          getChallengeStatus(challenge.startDate, challenge.endDate, challenge.status) === 'upcoming'
        );
      case 'active':
        return challenges.filter(challenge => 
          getChallengeStatus(challenge.startDate, challenge.endDate, challenge.status) === 'active'
        );
      case 'completed':
        return challenges.filter(challenge => 
          getChallengeStatus(challenge.startDate, challenge.endDate, challenge.status) === 'completed'
        );
      case 'joined':
        return challenges.filter(challenge => 
          hasUserJoined(challenge._id)
        );
      default:
        // For "All Challenges", sort by status: upcoming first, then active, then completed
        return challenges.sort((a, b) => {
          const statusA = getChallengeStatus(a.startDate, a.endDate, a.status);
          const statusB = getChallengeStatus(b.startDate, b.endDate, b.status);
          
          // Define order: upcoming (0), active (1), completed (2)
          const statusOrder = { 'upcoming': 0, 'active': 1, 'completed': 2 };
          const orderA = statusOrder[statusA] ?? 3;
          const orderB = statusOrder[statusB] ?? 3;
          
          return orderA - orderB;
        });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <LoadingSpinner message="Loading competitions..." size="lg" fullScreen={true} />
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
          <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Trading Tournaments
            </span>
          </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join exciting trading tournaments, test your skills, and win amazing prizes
          </p>
        </div>


        {/* Sorting Options */}
        {challenges.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <Button
            variant={sortBy === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('all')}
            className={`${
              sortBy === 'all' 
                ? 'bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white' 
                : 'border-white/20 text-gray-300 hover:bg-white/10'
            }`}
          >
            All Competitions
          </Button>
          <Button
            variant={sortBy === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('upcoming')}
            className={`${
              sortBy === 'upcoming' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white' 
                : 'border-white/20 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Upcoming
          </Button>
          <Button
            variant={sortBy === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('active')}
            className={`${
              sortBy === 'active' 
                ? 'bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white' 
                : 'border-white/20 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Rocket className="h-4 w-4 mr-2" />
            Active
          </Button>
          <Button
            variant={sortBy === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('completed')}
            className={`${
              sortBy === 'completed' 
                ? 'bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white' 
                : 'border-white/20 text-gray-300 hover:bg-white/10'
            }`}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </Button>
          {user && (
            <Button
              variant={sortBy === 'joined' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('joined')}
              className={`${
                sortBy === 'joined' 
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' 
                  : 'border-white/20 text-gray-300 hover:bg-white/10'
              }`}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              You Joined
            </Button>
          )}
          </div>
        )}

        {/* Challenges Grid - Only show when data is loaded */}
        {getFilteredChallenges().length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No challenges found</h3>
                <p className="text-gray-300">Try adjusting your filter or check back later for new competitions</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredChallenges().map((challenge) => {
                  const challengeStatus = getChallengeStatus(challenge.startDate, challenge.endDate, challenge.status);
                  const userHasJoined = hasUserJoined(challenge._id);
                  const buttonContent = getButtonContent(challenge, userHasJoined, challengeStatus);
                  const paymentStatus = paymentStatuses[challenge._id];

                  return (
                    <Card key={challenge._id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                      <CardHeader className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${getTypeColor(challenge.type)}`}>
                              {getTypeIcon(challenge.type)}
                            </div>
                            <div>
                              <CardTitle className="text-white text-lg group-hover:text-purple-300 transition-colors">{challenge.name}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`${getTypeColor(challenge.type)} text-white`}>
                                  {challenge.type}
                                </Badge>
                                <Badge className={getStatusColor(challengeStatus)}>
                                  {challengeStatus}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShowRules(challenge)}
                            className="text-gray-400 hover:text-white"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <CardDescription className="text-gray-300 text-sm">
                          {challenge.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="p-6 pt-0">
                        <div className="space-y-4">
                          {/* Prize Information */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-white/5 rounded-lg">
                              <div className="text-2xl font-bold text-white">
                                {formatCurrency(challenge.accountSize)}
                              </div>
                              <div className="text-xs text-gray-400">Account Size</div>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-lg">
                              <div className="text-2xl font-bold text-white">
                                {challenge.prizes.length > 0 ? formatCurrency(challenge.prizes[0].amount) : 'N/A'}
                              </div>
                              <div className="text-xs text-gray-400">Top Prize</div>
                            </div>
                          </div>

                          {/* Challenge Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Entry Fee:</span>
                              <span className="text-white font-medium">
                                {challenge.isFree ? 'Free' : formatCurrency(challenge.price)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Participants:</span>
                              <span className="text-white font-medium">
                                {challenge.currentParticipants}/{challenge.maxParticipants}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400">Duration:</span>
                              <span className="text-white font-medium">
                                {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                              </span>
                            </div>
                          </div>

                          {/* Payment Status */}
                          {paymentStatus && paymentStatus.status !== 'none' && (
                            <div className="text-center">
                              <Badge className={getStatusColor(paymentStatus.status)}>
                                Payment: {paymentStatus.status}
                              </Badge>
                            </div>
                          )}

                          {/* Action Button */}
                          <Button
                            onClick={() => {
                              if (userHasJoined) {
                                handleViewChallenge(challenge._id);
                              } else {
                                handleJoinChallenge(challenge._id, challenge.isFree, challengeStatus);
                              }
                            }}
                            disabled={buttonContent.text === 'Challenge Full' || buttonContent.text === 'Not Available'}
                            className={`w-full relative overflow-hidden group transition-all duration-300 ${buttonContent.className}`}
                          >
                            {/* Animated background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                            
                            {/* Button content */}
                            <div className="relative flex items-center justify-center">
                              {buttonContent.icon}
                              {buttonContent.text}
                            </div>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
      </div>

      {/* Rules Popup Modal */}
      {showRules && selectedChallenge && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl shadow-purple-500/20">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-white font-semibold text-xl flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <FileText className="h-5 w-5 text-purple-400" />
                </div>
                Tournament Rules
              </h3>
              <Button
                onClick={handleCloseRules}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 hover:text-purple-300 transition-colors duration-300"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-4">
                {selectedChallenge.rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-300">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="text-gray-300 text-sm leading-relaxed">
                      {rule}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;
