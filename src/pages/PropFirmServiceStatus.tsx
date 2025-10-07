import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  User, 
  Settings,
  ArrowLeft,
  Send,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

import { API_URL } from '@/lib/api';
interface PropFirmService {
  _id: string;
  status: 'pending' | 'active' | 'suspended' | 'completed' | 'cancelled' | 'failed';
  amount: number;
  endDate: string;
  propFirmDetails: {
    firmName: string;
    accountId: string;
    accountSize: number;
    accountType: string;
    challengePhase: string;
    startDate: string;
    rules: {
      maxDailyLoss: number;
      maxTotalLoss: number;
      profitTarget: number;
      tradingDays: number;
    };
  };
  performance: {
    initialBalance: number;
    currentBalance: number;
    totalProfit: number;
    totalLoss: number;
    drawdown: number;
    tradesCount: number;
    winRate: number;
  };
  metadata: {
    applicationData?: {
      preferredRiskLevel: string;
      communicationPreference: string;
      emergencyContact: string;
      specialInstructions: string;
    };
    verificationStatus: 'pending' | 'verified' | 'failed';
  };
  package: {
    _id: string;
    name: string;
    price: number;
    features: string[];
  };
  payment: {
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  };
  createdAt: string;
}

interface ChatMessage {
  _id: string;
  message: string;
  sender: 'user' | 'admin';
  timestamp: string;
  senderName: string;
}

const PropFirmServiceStatus = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { user } = useAuth();
  const [service, setService] = useState<PropFirmService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (serviceId && user) {
      fetchServiceDetails();
      fetchChatMessages();
    }
  }, [serviceId, user]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/prop-firm-services/${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch service details');
      }

      const data = await response.json();
      setService(data.data);
    } catch (error) {
      // Error handling:'Error fetching service:', error);
      setError((error as Error).message);
      toast.error('Failed to load service details');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/prop-firm-services/${serviceId}/chat`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      }
    } catch (error) {
      // Error handling:'Error fetching chat messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/prop-firm-services/${serviceId}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
        throw new Error('Failed to send message');
      }
    } catch (error) {
      // Error handling:'Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'suspended':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      suspended: "destructive",
      failed: "destructive",
      completed: "outline",
      cancelled: "secondary"
    };

    return (
      <Badge variant={variants[status] || "secondary"} className="capitalize">
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl">Loading service details...</div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 text-xl mb-4">Error Loading Service</div>
          <div className="text-gray-400 mb-6">{error || 'Service not found'}</div>
          <Button 
            onClick={() => navigate('/prop-firm-services')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2"
          >
            Back to Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => navigate('/prop-firm-services')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
            <h1 className="text-3xl font-bold text-white mb-2">Service Status</h1>
            <p className="text-gray-400">Track your prop firm service application and communicate with our team</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Service Card */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <CardTitle className="text-white">{service.package.name}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {service.propFirmDetails.firmName} • {formatCurrency(service.amount)}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(service.status)}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Details */}
                    <div className="space-y-3">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Account Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Prop Firm:</span>
                          <span className="text-white">{service.propFirmDetails.firmName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Account ID:</span>
                          <span className="text-white font-mono text-xs">{service.propFirmDetails.accountId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Account Size:</span>
                          <span className="text-white">{formatCurrency(service.propFirmDetails.accountSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white capitalize">{service.propFirmDetails.accountType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Phase:</span>
                          <span className="text-white">{service.propFirmDetails.challengePhase}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Start Date:</span>
                          <span className="text-white">{formatDate(service.propFirmDetails.startDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="space-y-3">
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Application Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Risk Level:</span>
                          <span className="text-white capitalize">{service.metadata.applicationData?.preferredRiskLevel || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Communication:</span>
                          <span className="text-white capitalize">{service.metadata.applicationData?.communicationPreference || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Emergency Contact:</span>
                          <span className="text-white">{service.metadata.applicationData?.emergencyContact || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Verification:</span>
                          <Badge variant={
                            service.metadata.verificationStatus === 'verified' ? 'default' :
                            service.metadata.verificationStatus === 'pending' ? 'secondary' : 'destructive'
                          }>
                            {service.metadata.verificationStatus}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Applied:</span>
                          <span className="text-white">{formatDate(service.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {service.metadata.applicationData?.specialInstructions && (
                    <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                      <h4 className="text-white font-semibold mb-2">Special Instructions</h4>
                      <p className="text-gray-300 text-sm">{service.metadata.applicationData.specialInstructions}</p>
                    </div>
                  )}

                  {/* Status Message */}
                  <div className={`mt-6 p-4 rounded-lg border ${
                    service.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20' :
                    service.status === 'active' ? 'bg-green-500/10 border-green-500/20' :
                    service.status === 'suspended' ? 'bg-red-500/10 border-red-500/20' :
                    'bg-gray-500/10 border-gray-500/20'
                  }`}>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <h4 className={`font-semibold ${
                          service.status === 'pending' ? 'text-yellow-400' :
                          service.status === 'active' ? 'text-green-400' :
                          service.status === 'suspended' ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {service.status === 'pending' ? 'Application Under Review' :
                           service.status === 'active' ? 'Service Active' :
                           service.status === 'suspended' ? 'Service Suspended' :
                           'Service Status'}
                        </h4>
                        <p className="text-gray-300 text-sm mt-1">
                          {service.status === 'pending' ? 'Your application is being reviewed by our team. We\'ll get back to you within 24-48 hours.' :
                           service.status === 'active' ? 'Your service is active and our team is managing your account.' :
                           service.status === 'suspended' ? 'Your service has been suspended. Please contact support for more information.' :
                           'Please contact support for more information.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chat Section */}
            <div className="space-y-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Chat with Admin
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Communicate with our support team about your service
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Messages */}
                  <div className="h-96 overflow-y-auto space-y-3 mb-4 p-3 bg-black/20 rounded-lg">
                    {messages.length === 0 ? (
                      <div className="text-center text-gray-400 py-8">
                        No messages yet. Start a conversation!
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs p-3 rounded-lg ${
                              message.sender === 'user'
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/10 text-white'
                            }`}
                          >
                            <div className="text-sm">{message.message}</div>
                            <div className={`text-xs mt-1 ${
                              message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                            }`}>
                              {message.senderName} • {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropFirmServiceStatus;