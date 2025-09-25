import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { API_URL } from '@/lib/api';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Clock, 
  Loader2, 
  Search,
  Filter,
  ChevronRight,
  MessageCircle,
  User,
  Calendar,
  Zap,
  ChevronDown
} from 'lucide-react';

interface SignalPlan {
  _id: string;
  name: string;
  currentSubscribers: number;
  description?: string;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  content: string;
  messageType: string;
  isSignal: boolean;
  createdAt: string;
  signalData?: {
    symbol: string;
    action: string;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    timeframe: string;
    riskLevel: string;
  };
}

const SignalManager = () => {
  const [signalPlans, setSignalPlans] = useState<SignalPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SignalPlan | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    message: '',
    isScheduled: false,
    scheduledTime: ''
  });
  const [sendingSignal, setSendingSignal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  const API_BASE_URL = API_URL;

  useEffect(() => {
    fetchSignalPlans();
  }, []);

  useEffect(() => {
    if (selectedPlan && selectedPlan._id) {
      fetchMessages(selectedPlan._id);
    }
  }, [selectedPlan?._id]);

  const fetchSignalPlans = async () => {
    setLoadingPlans(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        toast.error('Please login to access signal plans');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/signal-plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        setError(`Failed to fetch signal plans: ${response.status}`);
        // Error handling:'Failed to fetch signal plans:', response.status, response.statusText);
        toast.error('Failed to load signal plans');
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setSignalPlans(data.data || []);
        // Auto-select first plan if available
        if (data.data && data.data.length > 0) {
          setSelectedPlan(data.data[0]);
        }
      } else {
        setError(data.message || 'Failed to load signal plans');
        toast.error(data.message || 'Failed to load signal plans');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      // Error handling:'Error fetching signal plans:', error);
      toast.error('Failed to load signal plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchMessages = async (planId: string) => {
    setLoadingMessages(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Error handling:'No authentication token found');
        setMessages([]);
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/chatboxes/plan/${planId}/messages?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        // Error handling:'Failed to fetch messages:', response.status, response.statusText);
        setMessages([]);
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        // Ensure we always set an array
        const messagesData = data.data;
        if (Array.isArray(messagesData)) {
          setMessages(messagesData);
        } else {
          // Warning:'Messages data is not an array:', messagesData);
          setMessages([]);
        }
      } else {
        // Error handling:'Failed to fetch messages:', data.message);
        setMessages([]);
      }
    } catch (error) {
      // Error handling:'Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isScheduled: checked }));
  };

  const handleSendSignal = async () => {
    if (!selectedPlan) {
      toast.error('Please select a signal plan.');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Signal message cannot be empty.');
      return;
    }
    if (formData.isScheduled && !formData.scheduledTime) {
      toast.error('Please set a scheduled time for the signal.');
      return;
    }

    setSendingSignal(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/chatboxes/plan/${selectedPlan._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: formData.message,
          isSignal: true,
          isScheduled: formData.isScheduled,
          scheduledTime: formData.isScheduled ? formData.scheduledTime : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Signal sent successfully!');
        setFormData({
          message: '',
          isScheduled: false,
          scheduledTime: ''
        });
        // Refresh messages
        fetchMessages(selectedPlan._id);
      } else {
        toast.error(data.message || 'Failed to send signal');
      }
    } catch (error) {
      // Error handling:'Error sending signal:', error);
      toast.error('Failed to send signal');
    } finally {
      setSendingSignal(false);
    }
  };

  const filteredPlans = signalPlans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg">
        <div className="text-center text-white">
          <h3 className="text-xl font-semibold mb-2">Error Loading Signal Manager</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              fetchSignalPlans();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] lg:h-[600px] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-lg overflow-hidden max-w-full mx-auto">
      {/* Mobile Layout */}
      <div className="lg:hidden h-full flex flex-col max-w-sm mx-auto">
        {/* Mobile Header with Dropdown */}
        <div className="p-3 border-b border-white/10 bg-white/5 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
              className="w-full flex items-center justify-between p-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                <div className="text-left min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">
                    {selectedPlan ? selectedPlan.name : 'Select Signal Plan'}
                  </div>
                  {selectedPlan && (
                    <div className="text-xs text-gray-300 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {selectedPlan.currentSubscribers} subs
                    </div>
                  )}
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform flex-shrink-0 ${isMobileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isMobileDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                <div className="p-1">
                  {loadingPlans ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                      <span className="ml-2 text-gray-300 text-xs">Loading...</span>
                    </div>
                  ) : filteredPlans.length === 0 ? (
                    <div className="text-center py-3 text-gray-400 text-xs">
                      No signal plans found
                    </div>
                  ) : (
                    filteredPlans.map(plan => (
                      <button
                        key={plan._id}
                        onClick={() => {
                          setSelectedPlan(plan);
                          setIsMobileDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg transition-all duration-200 ${
                          selectedPlan?._id === plan._id
                            ? 'bg-blue-500/20 border border-blue-500/30'
                            : 'bg-white/5 hover:bg-white/10 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate text-xs">{plan.name}</h3>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs px-1 py-0">
                                <Users className="h-2 w-2 mr-1" />
                                {plan.currentSubscribers}
                              </Badge>
                              {plan.currentSubscribers > 0 && (
                                <Badge variant="outline" className="border-blue-500/30 text-blue-300 text-xs px-1 py-0">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Chat Area */}
        <div className="flex-1 flex flex-col relative">
          {selectedPlan ? (
            <>
              {/* Chat Header */}
              <div className="p-2 border-b border-white/10 bg-white/5 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs px-2 py-1">
                      <Zap className="h-3 w-3 mr-1" />
                      Live
                    </Badge>
                    <span className="text-xs text-gray-300 flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {messages.length} msgs
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Area - with bottom padding for fixed input */}
              <div className="flex-1 p-3 pb-32 overflow-y-auto">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                    <span className="ml-2 text-gray-300">Loading messages...</span>
                  </div>
                ) : !Array.isArray(messages) || messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">Send your first signal to start the conversation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(messages) && messages.map(message => (
                      <div key={message._id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.isSignal 
                              ? 'bg-blue-500/20 border border-blue-500/30' 
                              : 'bg-gray-500/20 border border-gray-500/30'
                          }`}>
                            {message.isSignal ? (
                              <Zap className="h-4 w-4 text-blue-400" />
                            ) : (
                              <User className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white text-sm">
                              {message.sender.firstName} {message.sender.lastName}
                            </span>
                            {message.isSignal && (
                              <Badge variant="outline" className="border-blue-500/30 text-blue-300 text-xs">
                                Signal
                              </Badge>
                            )}
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatMessageTime(message.createdAt)}
                            </span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-gray-200 whitespace-pre-wrap text-sm">{message.content}</p>
                            {message.signalData && (
                              <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div><span className="text-gray-400">Symbol:</span> <span className="text-white font-medium">{message.signalData.symbol}</span></div>
                                  <div><span className="text-gray-400">Action:</span> <span className={`font-medium ${message.signalData.action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{message.signalData.action}</span></div>
                                  <div><span className="text-gray-400">Entry:</span> <span className="text-white">{message.signalData.entryPrice}</span></div>
                                  <div><span className="text-gray-400">Stop Loss:</span> <span className="text-red-300">{message.signalData.stopLoss}</span></div>
                                  <div><span className="text-gray-400">Take Profit:</span> <span className="text-green-300">{message.signalData.takeProfit}</span></div>
                                  <div><span className="text-gray-400">Risk:</span> <span className="text-yellow-300">{message.signalData.riskLevel}</span></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fixed Message Input at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 bg-white/5 backdrop-blur-md">
                <div className="space-y-2">
                  {/* Schedule Toggle - Always Visible */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isScheduled"
                        checked={formData.isScheduled}
                        onCheckedChange={handleCheckboxChange}
                        className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="isScheduled" className="text-gray-300 flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3" /> Schedule
                      </Label>
                    </div>
                    {formData.isScheduled && (
                      <div className="text-xs text-blue-300">
                        {formData.scheduledTime ? new Date(formData.scheduledTime).toLocaleString() : 'Set time'}
                      </div>
                    )}
                  </div>

                  {/* Schedule Time Input - Show when scheduled */}
                  {formData.isScheduled && (
                    <Input
                      name="scheduledTime"
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/20 text-white text-xs w-full"
                      placeholder="Scheduled Time (UTC)"
                    />
                  )}

                  {/* Message Input and Send Button */}
                  <div className="flex gap-2">
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Type signal message..."
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[60px] max-h-[100px] resize-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendSignal();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendSignal}
                      disabled={sendingSignal || !formData.message.trim()}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-3 py-2 min-h-[60px] flex-shrink-0"
                    >
                      {sendingSignal ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">Select a Signal Plan</h3>
                <p className="text-sm">Choose a signal plan from the dropdown above</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout - Unchanged */}
      <div className="hidden lg:flex h-full">
        {/* Sidebar - Signal Plans */}
        <div className="w-80 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-400" />
              Signal Plans
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Plans List */}
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-2">
            {loadingPlans ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-300">Loading plans...</span>
              </div>
            ) : filteredPlans.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No signal plans found</p>
              </div>
            ) : (
              filteredPlans.map(plan => (
                <div
                  key={plan._id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPlan?._id === plan._id
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{plan.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                          <Users className="h-3 w-3 mr-1" />
                          {plan.currentSubscribers}
                        </Badge>
                        {plan.currentSubscribers > 0 && (
                          <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                      selectedPlan?._id === plan._id ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>
              ))
            )}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedPlan ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedPlan.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-300 flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {selectedPlan.currentSubscribers} subscribers
                      </span>
                      <span className="text-sm text-gray-300 flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {messages.length} messages
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <Zap className="h-3 w-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                    <span className="ml-2 text-gray-300">Loading messages...</span>
                  </div>
                ) : !Array.isArray(messages) || messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">Send your first signal to start the conversation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(messages) && messages.map(message => (
                      <div key={message._id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.isSignal 
                              ? 'bg-blue-500/20 border border-blue-500/30' 
                              : 'bg-gray-500/20 border border-gray-500/30'
                          }`}>
                            {message.isSignal ? (
                              <Zap className="h-4 w-4 text-blue-400" />
                            ) : (
                              <User className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">
                              {message.sender.firstName} {message.sender.lastName}
                            </span>
                            {message.isSignal && (
                              <Badge variant="outline" className="border-blue-500/30 text-blue-300 text-xs">
                                Signal
                              </Badge>
                            )}
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatMessageTime(message.createdAt)}
                            </span>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <p className="text-gray-200 whitespace-pre-wrap">{message.content}</p>
                            {message.signalData && (
                              <div className="mt-3 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div><span className="text-gray-400">Symbol:</span> <span className="text-white font-medium">{message.signalData.symbol}</span></div>
                                  <div><span className="text-gray-400">Action:</span> <span className={`font-medium ${message.signalData.action === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{message.signalData.action}</span></div>
                                  <div><span className="text-gray-400">Entry:</span> <span className="text-white">{message.signalData.entryPrice}</span></div>
                                  <div><span className="text-gray-400">Stop Loss:</span> <span className="text-red-300">{message.signalData.stopLoss}</span></div>
                                  <div><span className="text-gray-400">Take Profit:</span> <span className="text-green-300">{message.signalData.takeProfit}</span></div>
                                  <div><span className="text-gray-400">Risk:</span> <span className="text-yellow-300">{message.signalData.riskLevel}</span></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isScheduled"
                      checked={formData.isScheduled}
                      onCheckedChange={handleCheckboxChange}
                      className="border-white/30 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                    />
                    <Label htmlFor="isScheduled" className="text-gray-300 flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" /> Schedule Signal
                    </Label>
                  </div>

                  {formData.isScheduled && (
                    <Input
                      name="scheduledTime"
                      type="datetime-local"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Scheduled Time (UTC)"
                    />
                  )}

                  <div className="flex gap-3">
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Type your signal message here..."
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[80px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendSignal();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendSignal}
                      disabled={sendingSignal || !formData.message.trim()}
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-6"
                    >
                      {sendingSignal ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">Select a Signal Plan</h3>
                <p>Choose a signal plan from the sidebar to start managing signals</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignalManager;