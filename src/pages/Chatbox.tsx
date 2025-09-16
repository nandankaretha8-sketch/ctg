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
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
      const response = await fetch(`http://localhost:5000/api/chatboxes/plan/${planId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatbox(data.data);
        setMessages(data.data.messages || []);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to access chatbox');
        navigate('/signal-plans');
      }
    } catch (error) {
      console.error('Error fetching chatbox:', error);
      toast.error('Failed to access chatbox');
      navigate('/signal-plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!chatbox || loadingMessages) return;
    
    setLoadingMessages(true);
    try {
      const response = await fetch(`http://localhost:5000/api/chatboxes/${chatbox._id}/messages?page=${page}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setMessages(data.data.messages);
        } else {
          setMessages(prev => [...data.data.messages, ...prev]);
        }
        setHasMore(data.data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loadingMessages) {
      setPage(prev => prev + 1);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading chatbox...</div>
      </div>
    );
  }

  if (!chatbox) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Chatbox not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
                    <span className="text-gray-400">Total Views:</span>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      <span className="text-white font-medium">{chatbox.subscriberCount}</span>
                    </div>
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
                        {loadingMessages ? 'Loading...' : 'Load More Messages'}
                      </Button>
                    </div>
                  )}

                  {messages.map((message, index) => {
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
                                  {message.sender.firstName} {message.sender.lastName}
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
                  })}
                  
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
