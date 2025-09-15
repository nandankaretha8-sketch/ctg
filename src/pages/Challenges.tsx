import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, Trophy, Users, Clock, DollarSign, Target, CheckCircle, Calendar, UserCheck, Home, ArrowLeft, Eye, FileText, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  const [sortBy, setSortBy] = useState('all');
  const [showRules, setShowRules] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
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
      setLoading(true);
      // Fetch all challenges (active, upcoming, completed)
      const response = await fetch(`http://localhost:5000/api/challenges?status=active,upcoming,completed`);
      const data = await response.json();
      
      if (data.success) {
        setChallenges(data.data);
      } else {
        toast.error('Failed to fetch challenges');
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChallenges = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/challenges/user/my-challenges', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setUserChallenges(data.data);
      }
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    }
  };

  const handleJoinChallenge = (challengeId: string, isFree: boolean, status: string) => {
    if (!user) {
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

    // Allow joining both upcoming and active challenges
    if (isFree) {
      // Direct redirect to account setup for free challenges
      navigate(`/challenges/${challengeId}/setup`);
    } else {
      // Redirect to payment page for paid challenges
      navigate(`/challenges/${challengeId}/payment`);
    }
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
      console.error('Error formatting date:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading competitions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Trading Competitions
            </span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join exciting trading competitions, test your skills, and win amazing prizes
          </p>
        </div>


        {/* Sorting Options */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <Button
            variant={sortBy === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('all')}
            className={`${
              sortBy === 'all' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white' 
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
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white' 
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
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white' 
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

        {/* Challenges Grid */}
        {getFilteredChallenges().length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {sortBy === 'joined' ? 'No Joined Competitions' : 'No Competitions Available'}
            </h3>
            <p className="text-gray-400">
              {sortBy === 'joined' 
                ? 'You haven\'t joined any competitions yet. Browse and join some exciting trading competitions!' 
                : 'Check back later for new trading competitions!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredChallenges().map((challenge) => {
              const challengeStatus = getChallengeStatus(challenge.startDate, challenge.endDate, challenge.status);
              const userHasJoined = hasUserJoined(challenge._id);
              
              return (
              <Card key={challenge._id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={`${getTypeColor(challenge.type)} text-white`}>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(challenge.type)}
                          {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                        </div>
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${
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
                      {userHasJoined && (
                        <Badge 
                          variant="outline" 
                          className="text-orange-400 border-orange-400"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Joined
                        </Badge>
                      )}
                    </div>
                    {challenge.price === 0 ? (
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        Free
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-400 border-orange-400">
                        {formatCurrency(challenge.price)}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white text-xl">{challenge.name}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {challenge.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {/* Challenge Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Account Size:</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(challenge.accountSize)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Participants:</span>
                      <span className="text-white font-semibold">
                        {challenge.currentParticipants}/{challenge.maxParticipants}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white font-semibold">
                        {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                      </span>
                    </div>
                    
                    {challenge.challengeMode === 'target' ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Target Profit:</span>
                        <span className="text-white font-semibold">
                          {challenge.requirements.targetProfit}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Competition Mode:</span>
                        <span className="text-white font-semibold">
                          Rank Based
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Prizes */}
                  {challenge.prizes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Prizes
                      </h4>
                      <div className="space-y-1">
                        {challenge.prizes
                          .sort((a, b) => {
                            // Sort by rank order (individual ranks first, then bulk prizes)
                            const aRank = a.rank || 0;
                            const bRank = b.rank || 0;
                            return aRank - bRank;
                          })
                          .slice(0, 3)
                          .map((prize, index) => {
                            // Check if it's a bulk prize
                            const isBulk = prize.isBulk || (prize.rankStart && prize.rankEnd) || (prize.prize && /ranks?\s+\d+-\d+/i.test(prize.prize));
                            
                            if (isBulk) {
                              // Extract rank range from description if not explicitly set
                              const rankMatch = prize.prize?.match(/ranks?\s+(\d+)-(\d+)/i);
                              const startRank = prize.rankStart || (rankMatch ? parseInt(rankMatch[1]) : prize.rank);
                              const endRank = prize.rankEnd || (rankMatch ? parseInt(rankMatch[2]) : prize.rank);
                              
                              return (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">
                                    Ranks {startRank}-{endRank}:
                                  </span>
                                  <span className="text-white font-semibold">
                                    {formatCurrency(prize.amount)}
                                  </span>
                                </div>
                              );
                            } else {
                              return (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-400">
                                    Rank #{prize.rank}:
                                  </span>
                                  <span className="text-white font-semibold">
                                    {formatCurrency(prize.amount)}
                                  </span>
                                </div>
                              );
                            }
                          })}
                        {challenge.prizes.length > 3 && (
                          <div className="text-xs text-gray-400">
                            +{challenge.prizes.length - 3} more prizes
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Join Button */}
                  <Button
                    onClick={() => userHasJoined ? handleViewChallenge(challenge._id) : handleJoinChallenge(challenge._id, challenge.price === 0, challengeStatus)}
                    disabled={!userHasJoined && (challenge.currentParticipants >= challenge.maxParticipants || challengeStatus === 'completed' || challengeStatus === 'cancelled')}
                    className={`w-full ${
                      userHasJoined
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                        : challengeStatus === 'completed' || challengeStatus === 'cancelled'
                        ? 'bg-gray-600 hover:bg-gray-600 cursor-not-allowed'
                        : challenge.price === 0
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                    } text-white font-semibold`}
                  >
                    {userHasJoined ? (
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </div>
                    ) : challenge.currentParticipants >= challenge.maxParticipants ? (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Challenge Full
                      </div>
                    ) : challengeStatus === 'upcoming' ? (
                      challenge.price === 0 ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Join Upcoming
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Join for {formatCurrency(challenge.price)}
                        </div>
                      )
                    ) : challengeStatus === 'active' ? (
                      challenge.price === 0 ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Join Now
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Join for {formatCurrency(challenge.price)}
                        </div>
                      )
                    ) : challengeStatus === 'completed' ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Completed
                      </div>
                    ) : challengeStatus === 'cancelled' ? (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Cancelled
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Not Available
                      </div>
                    )}
                  </Button>

                  {/* Rules Button */}
                  {challenge.rules && challenge.rules.length > 0 && (
                    <Button
                      onClick={() => handleShowRules(challenge)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 border-white/20 text-white hover:bg-white/10"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Rules
                    </Button>
                  )}
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Rules Popup Modal */}
      {showRules && selectedChallenge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                Challenge Rules
              </h3>
              <Button
                onClick={handleCloseRules}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="mb-3">
                <h4 className="text-white font-medium mb-1">{selectedChallenge.name}</h4>
                <p className="text-gray-400 text-sm">{selectedChallenge.description}</p>
              </div>
              <div className="space-y-2">
                <h5 className="text-white font-medium text-sm">Rules:</h5>
                <ul className="space-y-2">
                  {selectedChallenge.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-300 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-white/10">
              <Button
                onClick={handleCloseRules}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challenges;
