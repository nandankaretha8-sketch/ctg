import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  BookOpen,
  MessageSquare,
  Send,
  Video,
  Phone,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
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

interface ChatMessage {
  _id: string;
  sender: 'user' | 'admin';
  message: string;
  timestamp: Date;
  senderName?: string;
}

interface MentorshipSubscription {
  _id: string;
  mentorshipPlan: MentorshipPlan;
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  amount: number;
  payment?: {
    amount: number;
    status: string;
  };
}

const MentorshipDashboard = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();
  
  const [plan, setPlan] = useState<MentorshipPlan | null>(null);
  const [subscription, setSubscription] = useState<MentorshipSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    console.log('MentorshipDashboard useEffect triggered:', { planId, user });
    if (planId && user) {
      fetchMentorshipData();
      fetchChatMessages();
    } else {
      console.log('Missing planId or user:', { planId, user });
      setLoading(false);
    }
  }, [planId, user]);

  const fetchMentorshipData = async () => {
    try {
      console.log('Fetching mentorship data for planId:', planId);
      console.log('API_URL:', API_URL);
      
      // Fetch mentorship plan details
      const planResponse = await fetch(`${API_URL}/mentorship-plans/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Plan response status:', planResponse.status);
      
      if (planResponse.ok) {
        const planData = await planResponse.json();
        console.log('Plan data received:', planData);
        setPlan(planData.data);
      } else {
        console.error('Failed to fetch plan data:', planResponse.status, planResponse.statusText);
      }

      // Fetch user's subscription
      console.log('Fetching user subscriptions...');
      const subscriptionResponse = await fetch(`${API_URL}/mentorship-plans/user/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Subscription response status:', subscriptionResponse.status);
      
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        console.log('Subscription data received:', subscriptionData);
        console.log('Looking for planId:', planId);
        
        // Look for any subscription to this plan (active or not)
        const userSubscription = subscriptionData.data.find((sub: any) => {
          console.log('Checking subscription:', sub.mentorshipPlan?._id, 'against planId:', planId);
          return sub.mentorshipPlan?._id === planId;
        });
        
        console.log('Found user subscription:', userSubscription);
        setSubscription(userSubscription);
      } else {
        console.error('Failed to fetch subscription data:', subscriptionResponse.status, subscriptionResponse.statusText);
      }
    } catch (error) {
      toast.error('Failed to load mentorship data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/mentorship-chat/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatMessages(data.data || []);
      }
    } catch (error) {
      // Silent error handling for chat messages
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await fetch(`${API_URL}/mentorship-chat/${planId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: newMessage.trim()
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchChatMessages(); // Refresh messages
        toast.success('Message sent successfully');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <LoadingSpinner 
          message="Loading mentorship dashboard..." 
          size="lg"
          fullScreen={true}
        />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Mentorship plan not found</div>
          <Button
            onClick={() => navigate('/mentorships')}
            className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            Browse Mentorships
          </Button>
        </div>
      </div>
    );
  }

  // If no subscription found, show a message but still allow access to the plan details
  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/mentorships')}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mentorships
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {plan.name}
                  </span>
                </h1>
                <p className="text-gray-300">Mentorship Dashboard</p>
              </div>
            </div>
          </div>

          <div className="text-center py-12">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-yellow-400 text-6xl mb-4">⏳</div>
              <h2 className="text-2xl font-bold text-white mb-4">Subscription Not Found</h2>
              <p className="text-gray-300 mb-6">
                No subscription found for this mentorship plan. If you recently made a payment, it may still be processing.
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/mentorships')}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  Browse Other Mentorships
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Refresh Page
                </Button>
              </div>
            </div>
          </div>
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
            onClick={() => navigate('/mentorships')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Back to Mentorships</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Membership Header */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-4 sm:mb-6 lg:mb-8">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl text-white">{plan.name}</CardTitle>
                  <Badge className={
                    subscription.status === 'active' 
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : subscription.status === 'expired'
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  }>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {subscription.status === 'active' ? 'Active' : subscription.status === 'expired' ? 'Expired' : 'Processing'}
                  </Badge>
                  {plan.isPopular && (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg mb-4">
                  Mentorship Dashboard
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-white font-bold text-lg sm:text-xl mb-1">
                      {formatCurrency(subscription.amount)}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Amount Paid</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-white font-bold text-lg sm:text-xl mb-1">
                      {plan.metadata.courseDuration}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Course Duration</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-white font-bold text-lg sm:text-xl mb-1">
                      {plan.metadata.maxSessionsPerMonth}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Sessions/Month</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-white font-bold text-lg sm:text-xl mb-1">
                      {Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">Days Remaining</div>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Mentor Information */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-6">
                <CardTitle className="text-white text-xl flex items-center">
                  <User className="h-6 w-6 mr-3 text-purple-400" />
                  Your Mentor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center">
                    {settings?.mentorPhoto ? (
                      <img
                        src={settings.mentorPhoto}
                        alt="Mentor"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-gray-500 to-gray-700 flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-2">
                      {plan.metadata.mentorName}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {plan.metadata.mentorExperience}
                    </p>
                    <p className="text-gray-300 text-sm mb-4">
                      {plan.metadata.mentorBio || `Experienced trader with ${plan.metadata.mentorExperience} in the markets. Specializing in ${plan.metadata.specialization.join(', ')} with a ${plan.metadata.successRate}% success rate.`}
                    </p>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <Target className="h-4 w-4 text-green-400" />
                        <span className="text-white">{plan.metadata.successRate}% Success Rate</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="text-white">{plan.currentSubscribers} Students</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-6">
                <CardTitle className="text-white text-xl flex items-center">
                  <BookOpen className="h-6 w-6 mr-3 text-purple-400" />
                  What's Included
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader className="p-6">
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <Button
                  onClick={() => setShowChat(!showChat)}
                  className="w-full relative overflow-hidden group transition-all duration-300 bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 shadow-lg hover:shadow-purple-500/25 hover:scale-105 text-white font-semibold py-3 px-6 rounded-xl border-0"
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  
                  {/* Button content */}
                  <div className="relative flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                    <span>{showChat ? 'Hide Chat' : 'Chat with Mentor'}</span>
                    <div className="ml-2 w-2 h-2 bg-white/80 rounded-full group-hover:animate-ping" />
                  </div>
                </Button>

                {/* Chat Section - Inside Quick Actions */}
                {showChat && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="h-4 w-4 text-purple-400" />
                        <span className="text-white text-sm font-medium">Chat with {plan?.metadata?.mentorName || 'Mentor'}</span>
                      </div>
                      
                      {/* Chat Messages */}
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {chatMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                message.sender === 'user'
                                  ? 'bg-gradient-to-r from-gray-500 to-gray-700 text-white'
                                  : 'bg-white/10 text-white border border-white/20'
                              }`}
                            >
                              <p>{message.message}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender === 'user' ? 'text-purple-100' : 'text-gray-400'
                              }`}>
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Send Message */}
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newMessage.trim()) {
                              sendMessage();
                            }
                          }}
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-purple-600 hover:to-pink-600 text-white"
                        >
                          {sendingMessage ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scheduled Sessions */}
            {subscription && ((subscription as any).sessionHistory?.length > 0 || (subscription as any).nextSessionDate) && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader className="p-6">
                  <CardTitle className="text-white text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-purple-400" />
                    Scheduled Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  {/* Next Session - show only if upcoming */}
                  {(subscription as any).nextSessionDate && new Date((subscription as any).nextSessionDate) > new Date() && (
                    <div className="mb-4 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">Next Session</span>
                      </div>
                      <div className="text-white text-sm font-medium">
                        {new Date((subscription as any).nextSessionDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-gray-300 text-xs">
                        {new Date((subscription as any).nextSessionDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        {(subscription as any).sessionHistory && (subscription as any).sessionHistory.length > 0 && (
                          (() => {
                            const nextSession = (subscription as any).sessionHistory
                              .filter(session => session.status === 'scheduled')
                              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
                            return nextSession && (
                              <span className="text-gray-500 ml-1">({nextSession.timezone || 'UTC'})</span>
                            );
                          })()
                        )}
                      </div>
                    </div>
                  )}

                  {/* All Scheduled Sessions - upcoming only */}
                  {(subscription as any).sessionHistory && (subscription as any).sessionHistory.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-white text-sm font-medium">Upcoming Sessions</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {(subscription as any).sessionHistory
                          .filter(session => session.status === 'scheduled' && new Date(session.date) > new Date())
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .map((session, index) => (
                            <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-white text-sm font-medium">
                                  {new Date(session.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                  {session.duration} min
                                </Badge>
                              </div>
                              <div className="text-gray-300 text-xs mb-1">
                                {new Date(session.date).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                <span className="text-gray-500 ml-1">({session.timezone || 'UTC'})</span>
                              </div>
                              {session.topic && (
                                <div className="text-gray-400 text-xs">
                                  Topic: {session.topic}
                                </div>
                              )}
                              {session.notes && (
                                <div className="text-gray-400 text-xs mt-1">
                                  {session.notes}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* No sessions message */}
                  {(
                    (!(subscription as any).sessionHistory || (subscription as any).sessionHistory.filter(s => s.status === 'scheduled' && new Date(s.date) > new Date()).length === 0)
                    && !((subscription as any).nextSessionDate && new Date((subscription as any).nextSessionDate) > new Date())
                  ) && (
                    <div className="text-center py-4">
                      <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No upcoming sessions scheduled</p>
                      <p className="text-gray-500 text-xs">Your mentor will schedule the next sessions soon</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}


          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorshipDashboard;
