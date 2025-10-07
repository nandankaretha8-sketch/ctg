import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shield, CheckCircle, AlertCircle, DollarSign, Users, Target, Trophy, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { authenticatedApiCall, publicApiCall } from '@/utils/apiHelpers';

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
  challengeMode: string;
  description: string;
  rules: string[];
  requirements: {
    minBalance: number;
    maxDrawdown: number;
    targetProfit: number;
  };
}

const ChallengeSetup = () => {
  const { id: challengeId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userParticipation, setUserParticipation] = useState<any>(null);
  const [formData, setFormData] = useState({
    mt5AccountId: '',
    mt5Password: '',
    mt5Server: ''
  });

  useEffect(() => {
    if (!user) {
      toast.error('Please login to join competitions');
      navigate('/login');
      return;
    }
    
    if (challengeId) {
      fetchChallenge();
    }
  }, [challengeId, user, navigate]);

  // Initialize form data when userParticipation changes
  useEffect(() => {
    if (userParticipation && userParticipation.accountId) {
      setFormData({
        mt5AccountId: userParticipation.accountId || '',
        mt5Password: userParticipation.password || '',
        mt5Server: userParticipation.server || ''
      });
    }
  }, [userParticipation]);

  const fetchChallenge = async () => {
    if (!challengeId) {
      toast.error('Invalid competition ID');
      navigate('/challenges');
      return;
    }

    try {
      const data = await publicApiCall(`/challenges/${challengeId}`);
      
      if (data.success) {
        setChallenge(data.data);
        // Check user's participation status
        await checkUserParticipation();
      } else {
        toast.error('Competition not found');
        navigate('/challenges');
      }
    } catch (error) {
      toast.error('Failed to load competition details');
      navigate('/challenges');
    } finally {
      setLoading(false);
    }
  };

  const checkUserParticipation = async () => {
    if (!challengeId || !user) return;

    try {
      const data = await authenticatedApiCall(`/challenges/${challengeId}/account`);
      if (data.success) {
        setUserParticipation(data.account);
      }
      // If user is not a participant, userParticipation remains null
    } catch (error) {
      // User is not a participant, which is fine
    }
  };

  const getCompetitionBadge = () => {
    if (!challenge) return { text: '', variant: 'outline' as const, className: '' };

    // If user is already a participant with MT5 setup completed, show "Joined"
    if (userParticipation && userParticipation.accountId) {
      return {
        text: 'Joined',
        variant: 'outline' as const,
        className: 'text-green-400 border-green-400'
      };
    }

    // If user has joined but not completed MT5 setup, show "Payment Complete"
    if (userParticipation && !userParticipation.accountId) {
      return {
        text: 'Payment Complete',
        variant: 'outline' as const,
        className: 'text-blue-400 border-blue-400'
      };
    }

    // If challenge is free, show "Free Competition"
    if (challenge.isFree) {
      return {
        text: 'Free Competition',
        variant: 'outline' as const,
        className: 'text-green-400 border-green-400'
      };
    }

    // If challenge is paid, show "Paid Competition"
    return {
      text: 'Paid Competition',
      variant: 'outline' as const,
      className: 'text-blue-400 border-blue-400'
    };
  };

  // Check if user has completed MT5 setup
  const hasCompletedMT5Setup = userParticipation && userParticipation.accountId;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mt5AccountId || !formData.mt5Password || !formData.mt5Server) {
      toast.error('Please fill in all MT5 account details');
      return;
    }

    // Show confirmation dialog instead of directly submitting
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    setSubmitting(true);
    
    try {
      const data = await authenticatedApiCall(`/challenges/${challengeId}/join`, {
        method: 'POST',
        body: JSON.stringify({
          mt5Account: {
            id: formData.mt5AccountId,
            password: formData.mt5Password,
            server: formData.mt5Server
          }
        })
      });
      
      if (data.success) {
        toast.success('Successfully joined the competition!');
        // Refresh user participation status
        await checkUserParticipation();
        // Navigate to challenges after a short delay
        setTimeout(() => {
          navigate('/challenges');
        }, 1500);
      } else {
        toast.error(data.message || 'Failed to join competition');
      }
    } catch (error) {
      toast.error('Failed to join competition');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelSubmit = () => {
    setShowConfirmation(false);
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
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading competition details...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Competition not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/challenges')}
              className="border-white/20 text-white hover:bg-white/10 self-start sm:self-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Competitions
            </Button>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Join Competition</h1>
              <p className="text-gray-300 text-sm sm:text-base">Complete your MT5 account setup</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Competition Details */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className="bg-blue-500 text-white">
                  <Target className="h-3 w-3 mr-1" />
                  {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                </Badge>
                <Badge variant={getCompetitionBadge().variant} className={getCompetitionBadge().className}>
                  {getCompetitionBadge().text}
                </Badge>
              </div>
              <CardTitle className="text-white text-2xl">{challenge.name}</CardTitle>
              <CardDescription className="text-gray-300">
                {challenge.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Account Size:</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(challenge.accountSize)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Participants:</span>
                  <span className="text-white font-semibold">
                    {challenge.currentParticipants}/{challenge.maxParticipants}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white font-semibold">
                    {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                  </span>
                </div>
                
                {/* Only show target-based fields for target mode competitions */}
                {challenge.challengeMode === 'target' && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Target Profit:</span>
                      <span className="text-white font-semibold">
                        {challenge.requirements.targetProfit}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Max Drawdown:</span>
                      <span className="text-white font-semibold">
                        {challenge.requirements.maxDrawdown}%
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Prizes */}
              {challenge.prizes && challenge.prizes.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Prizes
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            <div key={index} className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm">
                                  {prize.rank}
                                </div>
                                <span className="text-yellow-400 font-semibold text-sm">
                                  Ranks {startRank}-{endRank}
                                </span>
                              </div>
                              <div className="text-white font-bold text-lg mb-1">
                                ${prize.amount.toLocaleString()}
                              </div>
                              <div className="text-gray-300 text-xs">
                                {prize.prize}
                              </div>
                            </div>
                          );
                        } else {
                          // Individual prize
                          return (
                            <div key={index} className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm">
                                  {prize.rank}
                                </div>
                                <span className="text-yellow-400 font-semibold text-sm">
                                  Rank #{prize.rank}
                                </span>
                              </div>
                              <div className="text-white font-bold text-lg mb-1">
                                ${prize.amount.toLocaleString()}
                              </div>
                              <div className="text-gray-300 text-xs">
                                {prize.prize}
                              </div>
                            </div>
                          );
                        }
                      })}
                  </div>
                </div>
              )}

              {/* Rules */}
              {challenge.rules.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white font-semibold mb-3">Competition Rules</h4>
                  <ul className="space-y-2">
                    {challenge.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* MT5 Account Setup Form */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-white">MT5 Account Setup</CardTitle>
              </div>
              <CardDescription className="text-gray-300">
                {hasCompletedMT5Setup 
                  ? "You have already joined this competition. Your MT5 account details are shown below."
                  : userParticipation
                    ? "Complete your MT5 account setup to join this competition"
                    : "Provide your MT5 investor account details to join this competition"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="mt5AccountId" className="text-white">
                    MT5 Account ID
                  </Label>
                  <Input
                    id="mt5AccountId"
                    name="mt5AccountId"
                    type="text"
                    placeholder="Enter your MT5 account ID"
                    value={hasCompletedMT5Setup ? userParticipation.accountId : formData.mt5AccountId}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    disabled={hasCompletedMT5Setup}
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
                      value={hasCompletedMT5Setup ? userParticipation.password : formData.mt5Password}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
                      disabled={hasCompletedMT5Setup}
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
                    value={hasCompletedMT5Setup ? userParticipation.server : formData.mt5Server}
                    onChange={handleInputChange}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    disabled={hasCompletedMT5Setup}
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
                    <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-orange-400 font-semibold mb-1">Account Balance Requirement</h4>
                      <p className="text-gray-300 text-sm">
                        Your MT5 account balance must match the competition account size of <span className="text-orange-400 font-semibold">{formatCurrency(challenge.accountSize)}</span>. 
                        If your starting balance is different, your participation will be automatically marked as failed.
                      </p>
                    </div>
                  </div>
                </div>

                {hasCompletedMT5Setup ? (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <div>
                          <h4 className="text-green-400 font-semibold">Already Joined</h4>
                          <p className="text-gray-300 text-sm">
                            You have successfully joined this competition. Your participation status is: <span className="text-green-400 font-semibold">{userParticipation.status}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => navigate('/challenges')}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white font-semibold py-3 text-base sm:text-sm"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Competitions
                      </div>
                    </Button>
                  </div>
                ) : userParticipation ? (
                  <div className="space-y-4">
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
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white font-semibold py-3 text-base sm:text-sm"
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Joining Competition...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Complete Setup & Join
                        </div>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white font-semibold py-3 text-base sm:text-sm"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Joining Competition...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Join Competition
                      </div>
                    )}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white/95 backdrop-blur-md border-white/20 max-w-md w-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500/20">
                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                  </div>
                  <CardTitle className="text-gray-900 text-xl">
                    Verify Your Account Information
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-600">
                  Please ensure your MT5 account details are accurate before proceeding.
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Warning Message */}
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-orange-800 font-semibold mb-1">
                          Important: Verify Your Account Details
                        </h4>
                        <p className="text-orange-700 text-sm">
                          Incorrect account information will result in automatic failure of your competition participation. 
                          Please double-check that your MT5 account ID, password, and server details are correct.
                        </p>
                        <p className="text-orange-700 text-sm mt-2 font-semibold">
                          ⚠️ Your account balance must be exactly {formatCurrency(challenge.accountSize)} or your participation will be marked as failed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Details Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-gray-900 font-semibold mb-3">Your Account Details:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Account ID:</span>
                        <span className="text-gray-900 font-mono">{formData.mt5AccountId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Server:</span>
                        <span className="text-gray-900 font-mono">{formData.mt5Server}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Password:</span>
                        <span className="text-gray-900 font-mono">••••••••</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleCancelSubmit}
                      variant="outline"
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmSubmit}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white font-semibold"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Yes, Join Competition
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeSetup;
