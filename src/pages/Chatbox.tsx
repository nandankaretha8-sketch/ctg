import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MessageSquare, 
  Users, 
  Bell, 
  BellOff,
  Pin,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Shield,
  AlertTriangle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

import { API_URL } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Chatbox {
  _id: string;
  name: string;
  description: string;
  signalPlan: {
    _id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
  };
  subscribers: Array<{
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      username: string;
    };
    joinedAt: string;
    isActive: boolean;
  }>;
  messages: Array<{
    _id: string;
    sender: {
      _id: string;
      firstName: string;
      lastName: string;
      username: string;
      role: string;
    };
    senderType: 'admin' | 'user';
    content: string;
    messageType: 'signal' | 'announcement' | 'general';
    signalData?: {
      symbol: string;
      action: 'BUY' | 'SELL';
      entryPrice: number;
      stopLoss: number;
      takeProfit: number;
      timeframe: string;
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    };
    isPinned: boolean;
    createdAt: string;
  }>;
  subscriberCount: number;
  viewCount: number;
  settings: {
    allowUserMessages: boolean;
    autoDeleteMessages: boolean;
    messageRetentionDays: number;
  };
}

const Chatbox = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [chatbox, setChatbox] = useState<Chatbox | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (planId) {
      fetchChatbox();
    }
  }, [planId]);

  useEffect(() => {
    if (chatbox) {
      fetchMessages();
    }
  }, [chatbox]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatbox = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/chatboxes/plan/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChatbox(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch chatbox');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to access chatbox');
      }
    } catch (error: any) {
      // Silent error handling for chatbox
      setError(error.message);
      
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchChatbox();
        }, 2000 * (retryCount + 1));
      } else {
        toast.error('Failed to access chatbox. Please check your subscription.');
        navigate('/signal-plans');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!planId || loadingMessages) return;
    
    try {
      setLoadingMessages(true);
      const response = await fetch(`${API_URL}/chatboxes/plan/${planId}/messages?page=${page}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const newMessages = Array.isArray(data.data) ? data.data : [];
          
          if (page === 1) {
            setMessages(newMessages);
          } else {
            setMessages(prev => [...newMessages, ...prev]);
          }
          
          setHasMore(data.pagination?.hasMore || false);
        } else {
          throw new Error(data.message || 'Failed to fetch messages');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch messages');
      }
    } catch (error: any) {
      // Silent error handling for messages
      toast.error('Failed to fetch messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loadingMessages) {
      setPage(prev => prev + 1);
    }
  };

  const refreshMessages = () => {
    setPage(1);
    setHasMore(true);
    fetchMessages();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getSignalIcon = (action: 'BUY' | 'SELL') => {
    return action === 'BUY' ? (
      <TrendingUp className="h-4 w-4 text-green-400" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-400" />
    );
  };

  const getRiskColor = (riskLevel: 'LOW' | 'MEDIUM' | 'HIGH') => {
    switch (riskLevel) {
      case 'LOW':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <LoadingSpinner 
          message="Loading signal chat..." 
          size="lg"
          fullScreen={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Chatbox Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <Button
              onClick={fetchChatbox}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => navigate('/signal-plans')}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Back to Signal Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!chatbox) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Chatbox Not Found</h2>
          <p className="text-gray-300 mb-6">This chatbox doesn't exist or you don't have access to it.</p>
          <Button
            onClick={() => navigate('/signal-plans')}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Back to Signal Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/signal-plans')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Signal Plans
          </Button>
          
          <Button
            variant="outline"
            onClick={refreshMessages}
            disabled={loadingMessages}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingMessages ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chatbox Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6">
              <CardHeader className="p-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {chatbox.name}
                </CardTitle>
                <CardDescription className="text-gray-300">
                  {chatbox.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Plan:</span>
                    <span className="text-white font-medium">{chatbox.signalPlan.name}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Subscribers:</span>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="text-white font-medium">{chatbox.subscriberCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Views:</span>
                    <span className="text-white font-medium">{chatbox.viewCount}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-medium">{chatbox.signalPlan.duration}</span>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-green-400">
                      <Shield className="h-4 w-4" />
                      <span className="text-sm">Secure Signal Channel</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 h-[600px] flex flex-col">
              <CardHeader className="p-4 border-b border-white/10">
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Live Signals & Updates
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-4 space-y-4">
                  {hasMore && (
                    <div className="text-center">
                      <Button
                        variant="ghost"
                        onClick={loadMoreMessages}
                        disabled={loadingMessages}
                        className="text-gray-400 hover:text-white"
                      >
                        {loadingMessages ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          'Load More Messages'
                        )}
                      </Button>
                    </div>
                  )}

                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
                      <p className="text-gray-400">Send your first signal to start the conversation.</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isAdmin = message.senderType === 'admin';
                      const isSignal = message.messageType === 'signal';
                      const showDate = index === 0 || 
                        formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);

                      return (
                        <div key={message._id}>
                          {showDate && (
                            <div className="text-center my-4">
                              <Badge variant="outline" className="text-gray-400 border-gray-500">
                                {formatDate(message.createdAt)}
                              </Badge>
                            </div>
                          )}

                          <div className={`flex gap-3 ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                            {isAdmin && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">A</span>
                              </div>
                            )}
                            
                            <div className={`max-w-[70%] ${isAdmin ? '' : 'order-first'}`}>
                              {isAdmin && (
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-orange-400 text-sm font-medium">
                                    {message.sender?.firstName} {message.sender?.lastName}
                                  </span>
                                  {message.isPinned && (
                                    <Pin className="h-3 w-3 text-yellow-400" />
                                  )}
                                </div>
                              )}

                              <div className={`rounded-lg p-3 ${
                                isAdmin 
                                  ? 'bg-white/10 border border-white/20' 
                                  : 'bg-blue-500/20 border border-blue-500/30'
                              }`}>
                                {isSignal && message.signalData ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      {getSignalIcon(message.signalData.action)}
                                      <span className="text-white font-semibold">
                                        {message.signalData.symbol}
                                      </span>
                                      <Badge className={getRiskColor(message.signalData.riskLevel)}>
                                        {message.signalData.riskLevel}
                                      </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Action:</span>
                                        <span className={`font-medium ${
                                          message.signalData.action === 'BUY' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                          {message.signalData.action}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Entry:</span>
                                        <span className="text-white">${message.signalData.entryPrice}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Stop Loss:</span>
                                        <span className="text-red-400">${message.signalData.stopLoss}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Take Profit:</span>
                                        <span className="text-green-400">${message.signalData.takeProfit}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                      <Clock className="h-3 w-3" />
                                      <span>{message.signalData.timeframe}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-white whitespace-pre-wrap">{message.content}</p>
                                )}
                              </div>

                              <div className={`text-xs text-gray-400 mt-1 ${isAdmin ? 'text-left' : 'text-right'}`}>
                                {formatTime(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;