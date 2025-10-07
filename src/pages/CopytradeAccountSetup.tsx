import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Copy, 
  Shield,
  AlertCircle,
  CheckCircle,
  Settings,
  User,
  Phone,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { API_URL, authenticatedApiCall } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface CopytradeSubscription {
  _id: string;
  status: string;
  copytradePlan: {
    _id: string;
    name: string;
    accountSize: number;
    metadata: {
      supportedBrokers: string[];
    };
  };
  accountDetails: {
    broker?: string;
    accountId?: string;
    password?: string;
    server?: string;
    accountSize?: number;
    leverage?: number;
    currency?: string;
    accountType?: string;
  };
  contactInfo: {
    phone?: string;
    telegram?: string;
    discord?: string;
    whatsapp?: string;
    email?: string;
  };
}

const CopytradeAccountSetup = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<CopytradeSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Helper function to check subscription status
  const getSubscriptionStatus = (status: string) => {
    return status as 'setup_required' | 'pending' | 'active' | 'suspended' | 'cancelled' | 'expired';
  };

  const [formData, setFormData] = useState({
    accountDetails: {
      broker: '',
      accountId: '',
      password: '',
      server: '',
      accountSize: '',
      leverage: '',
      currency: 'USD',
      accountType: 'demo'
    },
    contactInfo: {
      phone: '',
      telegram: '',
      discord: '',
      whatsapp: '',
      email: user?.email || ''
    }
  });

  useEffect(() => {
    console.log('🔍 [CopytradeAccountSetup] useEffect triggered with id:', id);
    if (id) {
      console.log('🔍 [CopytradeAccountSetup] Calling fetchSubscription with id:', id);
      fetchSubscription(id);
    } else {
      console.error('❌ [CopytradeAccountSetup] No id provided');
    }
  }, [id]);

  const fetchSubscription = async (planId: string) => {
    console.log('🔍 [CopytradeAccountSetup] fetchSubscription called with planId:', planId);
    console.log('🔍 [CopytradeAccountSetup] user:', user);
    console.log('🔍 [CopytradeAccountSetup] token exists:', !!localStorage.getItem('token'));
    
    try {
      setLoading(true);
      
      // Try direct fetch first as fallback
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ [CopytradeAccountSetup] No token found');
        toast.error('Authentication required. Please login again.');
        navigate('/login');
        return;
      }

      console.log('🔍 [CopytradeAccountSetup] Attempting to fetch subscriptions...');
      
      // Try direct fetch first
      let response;
      try {
        const directResponse = await fetch(`${API_URL}/copytrade/subscriptions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🔍 [CopytradeAccountSetup] Direct fetch response status:', directResponse.status);
        
        if (directResponse.ok) {
          response = await directResponse.json();
          console.log('🔍 [CopytradeAccountSetup] Direct fetch success:', response);
        } else {
          console.error('❌ [CopytradeAccountSetup] Direct fetch failed:', directResponse.status, directResponse.statusText);
          throw new Error(`Direct fetch failed: ${directResponse.status}`);
        }
      } catch (directError) {
        console.log('🔍 [CopytradeAccountSetup] Direct fetch failed, trying authenticatedApiCall...');
        response = await authenticatedApiCall('/copytrade/subscriptions') as any;
        console.log('🔍 [CopytradeAccountSetup] authenticatedApiCall response:', response);
      }
      
      if (response && response.success) {
        console.log('🔍 [CopytradeAccountSetup] Response success, data:', response.data);
        console.log('🔍 [CopytradeAccountSetup] Looking for subscription with planId:', planId);
        
        // Find subscription for this specific plan
        const userSubscription = response.data.find((sub: any) => {
          const subPlanId = typeof sub.copytradePlan === 'string' 
            ? sub.copytradePlan 
            : sub.copytradePlan?._id;
          console.log('🔍 [CopytradeAccountSetup] Checking subscription:', {
            subId: sub._id,
            subPlanId,
            targetPlanId: planId,
            match: subPlanId === planId
          });
          return subPlanId === planId;
        });
        
        console.log('🔍 [CopytradeAccountSetup] Found subscription:', userSubscription);
        
        if (userSubscription) {
          setSubscription(userSubscription);
          
          // Pre-fill form with existing data if available
          if (userSubscription.accountDetails) {
            setFormData(prev => ({
              ...prev,
              accountDetails: {
                ...prev.accountDetails,
                ...userSubscription.accountDetails,
                accountSize: userSubscription.accountDetails.accountSize?.toString() || '',
                leverage: userSubscription.accountDetails.leverage?.toString() || ''
              }
            }));
          }
          
          if (userSubscription.contactInfo) {
            setFormData(prev => ({
              ...prev,
              contactInfo: {
                ...prev.contactInfo,
                ...userSubscription.contactInfo
              }
            }));
          }
        } else {
          console.error('❌ [CopytradeAccountSetup] No subscription found for plan:', planId);
          console.log('🔍 [CopytradeAccountSetup] Available subscriptions:', response.data.map((sub: any) => ({
            id: sub._id,
            planId: typeof sub.copytradePlan === 'string' ? sub.copytradePlan : sub.copytradePlan?._id,
            status: sub.status
          })));
          
          // Retry mechanism
          if (retryCount < 2) {
            console.log('🔍 [CopytradeAccountSetup] Retrying... attempt', retryCount + 1);
            setRetryCount(prev => prev + 1);
            setTimeout(() => {
              fetchSubscription(planId);
            }, 2000);
            return;
          }
          
          // Final fallback: try to get plan details and create a mock subscription
          console.log('🔍 [CopytradeAccountSetup] Attempting fallback - fetching plan details...');
          try {
            const planResponse = await fetch(`${API_URL}/copytrade/plans/${planId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (planResponse.ok) {
              const planData = await planResponse.json();
              console.log('🔍 [CopytradeAccountSetup] Plan data fetched:', planData);
              
              // Create a mock subscription for setup
              const mockSubscription = {
                _id: 'mock-' + Date.now(),
                status: 'setup_required',
                copytradePlan: {
                  _id: planId,
                  name: planData.data.name,
                  accountSize: planData.data.accountSize,
                  metadata: planData.data.metadata
                },
                accountDetails: {},
                contactInfo: {}
              };
              
              console.log('🔍 [CopytradeAccountSetup] Using mock subscription:', mockSubscription);
              setSubscription(mockSubscription);
              return;
            }
          } catch (planError) {
            console.error('❌ [CopytradeAccountSetup] Fallback plan fetch failed:', planError);
          }
          
          toast.error('No subscription found for this plan. Please ensure you are subscribed to this plan.');
          navigate('/copytrade');
        }
      } else {
        console.error('❌ [CopytradeAccountSetup] Response not successful:', response);
        toast.error('Failed to fetch subscription details');
        navigate('/copytrade');
      }
    } catch (error) {
      console.error('❌ [CopytradeAccountSetup] Error fetching subscription:', error);
      toast.error('Failed to fetch subscription details');
      navigate('/copytrade');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string, section: 'accountDetails' | 'contactInfo') => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subscription) return;

    // Validate required fields
    if (!formData.accountDetails.broker || !formData.accountDetails.accountId || 
        !formData.accountDetails.password || !formData.accountDetails.server) {
      toast.error('Please fill in all required account details');
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('🔍 [CopytradeAccountSetup] Submitting account details:', {
        subscriptionId: subscription._id,
        accountDetails: formData.accountDetails,
        contactInfo: formData.contactInfo
      });
      
      const response = await authenticatedApiCall(`/copytrade/subscriptions/${subscription._id}/account-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountDetails: {
            ...formData.accountDetails,
            accountSize: formData.accountDetails.accountSize ? parseFloat(formData.accountDetails.accountSize) : undefined,
            leverage: formData.accountDetails.leverage ? parseInt(formData.accountDetails.leverage) : undefined
          },
          contactInfo: formData.contactInfo
        })
      }) as any;

      console.log('🔍 [CopytradeAccountSetup] Response received:', response);

      if (response && response.success) {
        toast.success('Account details submitted successfully! Admin will verify your account shortly.');
        // Update local subscription state to show submitted details
        setSubscription(prev => prev ? {
          ...prev,
          accountDetails: {
            ...formData.accountDetails,
            accountSize: formData.accountDetails.accountSize ? parseFloat(formData.accountDetails.accountSize) : undefined,
            leverage: formData.accountDetails.leverage ? parseInt(formData.accountDetails.leverage) : undefined
          },
          contactInfo: formData.contactInfo,
          status: 'pending' as any,
          setupCompletedAt: new Date().toISOString()
        } : null);
        // Don't navigate away, let user see their submitted details
      } else {
        console.error('❌ [CopytradeAccountSetup] Submission failed:', response);
        toast.error(response?.message || 'Failed to submit account details');
      }
    } catch (error) {
      console.error('❌ [CopytradeAccountSetup] Error submitting account details:', error);
      toast.error('Failed to submit account details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <LoadingSpinner 
          message="Loading account setup..." 
          size="lg"
          fullScreen={true}
        />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Subscription Not Found</h2>
          <Button onClick={() => navigate('/copytrade')}>
            Back to Plans
          </Button>
        </div>
      </div>
    );
  }

  // Only show "Setup Not Required" for subscriptions that are completed or cancelled
  if (getSubscriptionStatus(subscription.status) === 'cancelled' || getSubscriptionStatus(subscription.status) === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Setup Not Available</h2>
          <p className="text-gray-300 mb-6">
            This subscription is no longer active and cannot be set up.
          </p>
          <Button onClick={() => navigate('/copytrade')}>
            Back to Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/8 transition-all duration-300">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/copytrade')}
                    className="text-white hover:text-blue-300 hover:bg-white/10"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Plans
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Settings className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                      {subscription.accountDetails && Object.keys(subscription.accountDetails).length > 0 
                        ? 'Account Setup Details' 
                        : 'Complete Your Setup'
                      }
                    </h1>
                    <p className="text-gray-300 text-lg">
                      {subscription.accountDetails && Object.keys(subscription.accountDetails).length > 0
                        ? `View and manage your account details for the ${subscription.copytradePlan.name}`
                        : `Provide your trading account details to start copying trades with the ${subscription.copytradePlan.name}`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Only show form if no account details have been submitted yet */}
            {(!subscription.accountDetails || Object.keys(subscription.accountDetails).length === 0) && (
              <form onSubmit={handleSubmit} className="space-y-8">
              {/* Trading Account Details */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/8 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <Copy className="h-6 w-6 text-blue-400" />
                    Trading Account Details
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Provide your trading account information. This will be used to copy trades to your account.
                  </CardDescription>
                </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="broker" className="text-white">Broker *</Label>
                  <Select
                    value={formData.accountDetails.broker}
                    onValueChange={(value) => handleInputChange('broker', value, 'accountDetails')}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select your broker" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscription.copytradePlan.metadata.supportedBrokers.map((broker) => (
                        <SelectItem key={broker} value={broker}>
                          {broker}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountId" className="text-white">Account ID *</Label>
                  <Input
                    id="accountId"
                    type="text"
                    value={formData.accountDetails.accountId}
                    onChange={(e) => handleInputChange('accountId', e.target.value, 'accountDetails')}
                    placeholder="Enter your account ID"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Account Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.accountDetails.password}
                    onChange={(e) => handleInputChange('password', e.target.value, 'accountDetails')}
                    placeholder="Enter your account password"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="server" className="text-white">Server *</Label>
                  <Input
                    id="server"
                    type="text"
                    value={formData.accountDetails.server}
                    onChange={(e) => handleInputChange('server', e.target.value, 'accountDetails')}
                    placeholder="Enter server name"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountSize" className="text-white">Account Size</Label>
                  <Input
                    id="accountSize"
                    type="number"
                    value={formData.accountDetails.accountSize}
                    onChange={(e) => handleInputChange('accountSize', e.target.value, 'accountDetails')}
                    placeholder="Enter account size in USD"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="leverage" className="text-white">Leverage</Label>
                  <Input
                    id="leverage"
                    type="number"
                    value={formData.accountDetails.leverage}
                    onChange={(e) => handleInputChange('leverage', e.target.value, 'accountDetails')}
                    placeholder="e.g., 100"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-white">Currency</Label>
                  <Select
                    value={formData.accountDetails.currency}
                    onValueChange={(value) => handleInputChange('currency', value, 'accountDetails')}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountType" className="text-white">Account Type</Label>
                  <Select
                    value={formData.accountDetails.accountType}
                    onValueChange={(value) => handleInputChange('accountType', value, 'accountDetails')}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="cent">Cent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

              {/* Contact Information */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/8 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <User className="h-6 w-6 text-green-400" />
                    Contact Information
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Provide your contact details for support and notifications.
                  </CardDescription>
                </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contactInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value, 'contactInfo')}
                    placeholder="your@email.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.contactInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value, 'contactInfo')}
                    placeholder="+1 (555) 123-4567"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram" className="text-white">Telegram</Label>
                  <Input
                    id="telegram"
                    type="text"
                    value={formData.contactInfo.telegram}
                    onChange={(e) => handleInputChange('telegram', e.target.value, 'contactInfo')}
                    placeholder="@username"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discord" className="text-white">Discord</Label>
                  <Input
                    id="discord"
                    type="text"
                    value={formData.contactInfo.discord}
                    onChange={(e) => handleInputChange('discord', e.target.value, 'contactInfo')}
                    placeholder="username#1234"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="whatsapp" className="text-white">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={formData.contactInfo.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value, 'contactInfo')}
                    placeholder="+1 (555) 123-4567"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

              {/* Security Notice */}
              <Card className="bg-yellow-500/10 backdrop-blur-md border-yellow-500/20 hover:bg-yellow-500/15 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-yellow-300 mb-2">Security & Privacy</h4>
                      <p className="text-yellow-200 text-sm">
                        Your account details are encrypted and stored securely. They will only be used for 
                        copytrading purposes and will never be shared with third parties. Our team will 
                        verify your account details before activating the copytrade service.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full relative overflow-hidden group transition-all duration-300 font-semibold py-4 px-6 rounded-xl border-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25 hover:scale-105 text-white"
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                  
                  <div className="relative flex items-center justify-center">
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Submit Account Details
                        <div className="ml-2 w-2 h-2 bg-white/80 rounded-full group-hover:animate-ping" />
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </form>
            )}

            {/* Message for users who have already submitted details */}
            {subscription && subscription.accountDetails && Object.keys(subscription.accountDetails).length > 0 && (
              <Card className="bg-blue-500/10 backdrop-blur-md border-blue-500/20 hover:bg-blue-500/15 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-blue-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-blue-300 mb-1">Account Details Submitted</h3>
                      <p className="text-blue-200 text-sm">
                        Your account details have been submitted successfully. You can view them below.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submitted Details Section - Show if account details have been submitted */}
            {subscription && subscription.accountDetails && Object.keys(subscription.accountDetails).length > 0 && (
              <Card className="bg-green-500/10 backdrop-blur-md border-green-500/20 hover:bg-green-500/15 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    Submitted Account Details
                  </CardTitle>
                  <CardDescription className="text-green-200">
                    Your account details have been submitted and are awaiting admin verification.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-green-300">Trading Account</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Broker:</span>
                          <span className="text-white font-medium">{subscription.accountDetails.broker}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Account ID:</span>
                          <span className="text-white font-medium">{subscription.accountDetails.accountId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Server:</span>
                          <span className="text-white font-medium">{subscription.accountDetails.server}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Account Type:</span>
                          <span className="text-white font-medium capitalize">{subscription.accountDetails.accountType || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Currency:</span>
                          <span className="text-white font-medium">{subscription.accountDetails.currency || 'N/A'}</span>
                        </div>
                        {subscription.accountDetails.accountSize && (
                          <div className="flex justify-between">
                            <span className="text-gray-300">Account Size:</span>
                            <span className="text-white font-medium">${subscription.accountDetails.accountSize.toLocaleString()}</span>
                          </div>
                        )}
                        {subscription.accountDetails.leverage && (
                          <div className="flex justify-between">
                            <span className="text-gray-300">Leverage:</span>
                            <span className="text-white font-medium">1:{subscription.accountDetails.leverage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-green-300">Contact Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Email:</span>
                          <span className="text-white font-medium">{subscription.contactInfo?.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Phone:</span>
                          <span className="text-white font-medium">{subscription.contactInfo?.phone || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Telegram:</span>
                          <span className="text-white font-medium">{subscription.contactInfo?.telegram || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Discord:</span>
                          <span className="text-white font-medium">{subscription.contactInfo?.discord || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">WhatsApp:</span>
                          <span className="text-white font-medium">{subscription.contactInfo?.whatsapp || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-green-200">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Status: {getSubscriptionStatus(subscription.status) === 'pending' ? 'Awaiting Admin Verification' : 'Verified & Active'}</span>
                    </div>
                    <p className="text-green-100 text-sm mt-2">
                      {getSubscriptionStatus(subscription.status) === 'pending' 
                        ? 'Your account details have been submitted successfully. Our admin team will verify your account and activate copytrading shortly.'
                        : 'Your account has been verified and is ready for copytrading.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Plan Info Card */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/8 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Copy className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-white">
                        {subscription.copytradePlan.name}
                      </CardTitle>
                      <p className="text-gray-400 text-sm">Copytrade Plan</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Account Size</span>
                      <span className="text-white font-semibold">
                        ${subscription.copytradePlan.accountSize?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Status</span>
                      <Badge className={
                        getSubscriptionStatus(subscription.status) === 'pending' 
                          ? 'bg-yellow-500 text-white' 
                          : getSubscriptionStatus(subscription.status) === 'active' 
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-500 text-white'
                      }>
                        {getSubscriptionStatus(subscription.status) === 'pending' 
                          ? 'Pending Verification' 
                          : getSubscriptionStatus(subscription.status) === 'active' 
                          ? 'Active'
                          : 'Setup Required'
                        }
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Copy Speed</span>
                      <span className="text-white font-semibold">
                        {((subscription.copytradePlan.metadata as any)?.copySpeed) || 'Real-time'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Max Drawdown</span>
                      <span className="text-white font-semibold">
                        {((subscription.copytradePlan.metadata as any)?.maxDrawdown) || 'N/A'}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Supported Brokers */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/8 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-lg">🏦</span>
                    Supported Brokers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-2">
                    {subscription.copytradePlan.metadata?.supportedBrokers?.map((broker, index) => (
                      <div key={index} className="flex items-center gap-2 bg-white/5 p-2 rounded-md">
                        <span className="text-lg">🏦</span>
                        <span className="text-white font-medium text-sm">{broker.toUpperCase()}</span>
                      </div>
                    )) || (
                      <div className="text-gray-400 text-sm">No brokers specified</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Setup Steps */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/8 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-400" />
                    Setup Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                      <div>
                        <p className="text-white text-sm font-medium">Fill Account Details</p>
                        <p className="text-gray-400 text-xs">Provide your trading account information</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Admin Verification</p>
                        <p className="text-gray-500 text-xs">We'll verify your account details</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                      <div>
                        <p className="text-gray-400 text-sm font-medium">Start Copying</p>
                        <p className="text-gray-500 text-xs">Begin automated trade copying</p>
                      </div>
                    </div>
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

export default CopytradeAccountSetup;
