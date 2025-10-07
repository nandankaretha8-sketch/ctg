import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  User,
  Phone,
  MessageCircle,
  Settings,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api';

interface CopytradeSubscription {
  _id: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  duration: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  copytradePlan: {
    _id: string;
    name: string;
    price: number;
    duration: string;
    accountSize: number;
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
  adminNotes: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  setupCompletedAt?: string;
  performance: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    totalProfit: number;
    totalLoss: number;
    maxDrawdown: number;
    winRate: number;
    lastUpdated?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const CopytradeSubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState<CopytradeSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<CopytradeSubscription | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [adminNotes, setAdminNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to access subscriptions');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/copytrade/subscriptions/admin/subscriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        toast.error('Failed to fetch subscriptions');
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setSubscriptions(data.data);
      } else {
        toast.error('Failed to fetch subscriptions');
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (subscriptionId: string, isApproved: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to verify subscription');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/copytrade/subscriptions/admin/subscriptions/${subscriptionId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isApproved,
          adminNotes: adminNotes.trim() || undefined
        })
      });

      if (!response.ok) {
        toast.error('Failed to verify subscription');
        return;
      }

      const data = await response.json();
      if (data.success) {
        toast.success(`Subscription ${isApproved ? 'verified' : 'rejected'} successfully`);
        setShowDetails(false);
        setSelectedSubscription(null);
        setAdminNotes('');
        fetchSubscriptions();
      } else {
        toast.error(data.message || 'Failed to verify subscription');
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
      toast.error('Failed to verify subscription');
    }
  };

  const handleSuspend = async (subscriptionId: string) => {
    const reason = prompt('Enter suspension reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to suspend subscription');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/copytrade/subscriptions/admin/subscriptions/${subscriptionId}/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        toast.error('Failed to suspend subscription');
        return;
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Subscription suspended successfully');
        fetchSubscriptions();
      } else {
        toast.error(data.message || 'Failed to suspend subscription');
      }
    } catch (error) {
      console.error('Error suspending subscription:', error);
      toast.error('Failed to suspend subscription');
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to cancel subscription');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/copytrade/subscriptions/admin/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        toast.error('Failed to cancel subscription');
        return;
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Subscription cancelled successfully');
        fetchSubscriptions();
      } else {
        toast.error(data.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'setup_required':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'suspended':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'setup_required':
        return 'bg-blue-100 text-blue-800';
      case 'suspended':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatAccountSize = (size: number) => {
    if (size >= 1000000) {
      return `$${(size / 1000000).toFixed(1)}M`;
    } else if (size >= 1000) {
      return `$${(size / 1000).toFixed(0)}K`;
    }
    return `$${size}`;
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.copytradePlan.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Copytrade Subscriptions</h2>
        <p className="text-gray-400">Manage user subscriptions and account details</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by user name, email, or plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="setup_required">Setup Required</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-4">
        {filteredSubscriptions.map((subscription) => (
          <Card key={subscription._id} className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(subscription.status)}
                    <h3 className="text-lg font-semibold text-white">
                      {subscription.user.firstName} {subscription.user.lastName}
                    </h3>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Plan:</span>
                      <div className="text-white font-medium">{subscription.copytradePlan.name}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Amount:</span>
                      <div className="text-white font-medium">{formatPrice(subscription.amount)}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <div className="text-white font-medium capitalize">{subscription.duration}</div>
                    </div>
                  </div>

                  {subscription.accountDetails.broker && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-400">Trading Account:</span>
                      <div className="text-white">
                        {subscription.accountDetails.broker} - {subscription.accountDetails.accountId}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 text-sm text-gray-400">
                    Created: {new Date(subscription.createdAt).toLocaleDateString()}
                    {subscription.setupCompletedAt && (
                      <span className="ml-4">
                        Setup: {new Date(subscription.setupCompletedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedSubscription(subscription);
                      setShowDetails(true);
                      setAdminNotes(subscription.adminNotes || '');
                      setShowPassword(false);
                    }}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  
                  {subscription.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleVerify(subscription._id, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerify(subscription._id, false)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {subscription.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSuspend(subscription._id)}
                      className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                    >
                      Suspend
                    </Button>
                  )}
                  
                  {['active', 'suspended'].includes(subscription.status) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancel(subscription._id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubscriptions.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Subscriptions Found</h3>
          <p className="text-gray-400">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No copytrade subscriptions have been created yet.'
            }
          </p>
        </div>
      )}

      {/* Subscription Details Modal */}
      {showDetails && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-white/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">
                  Subscription Details - {selectedSubscription.user.firstName} {selectedSubscription.user.lastName}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedSubscription(null);
                    setAdminNotes('');
                  }}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Information */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">User Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Name</Label>
                    <div className="text-white">
                      {selectedSubscription.user.firstName} {selectedSubscription.user.lastName}
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Email</Label>
                    <div className="text-white">{selectedSubscription.user.email}</div>
                  </div>
                </div>
              </div>

              {/* Plan Information */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Plan Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-400">Plan Name</Label>
                    <div className="text-white">{selectedSubscription.copytradePlan.name}</div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Amount</Label>
                    <div className="text-white">{formatPrice(selectedSubscription.amount)}</div>
                  </div>
                  <div>
                    <Label className="text-gray-400">Duration</Label>
                    <div className="text-white capitalize">{selectedSubscription.duration}</div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              {selectedSubscription.accountDetails.broker && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Trading Account Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400">Broker</Label>
                      <div className="text-white">{selectedSubscription.accountDetails.broker}</div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Account ID</Label>
                      <div className="text-white font-mono">{selectedSubscription.accountDetails.accountId}</div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Password</Label>
                      <div className="flex items-center gap-2">
                        <div className="text-white font-mono flex-1">
                          {showPassword ? selectedSubscription.accountDetails.password : '••••••••'}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-white p-1 h-auto"
                            title={showPassword ? 'Hide password' : 'Show password'}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {showPassword && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedSubscription.accountDetails.password || '');
                                toast.success('Password copied to clipboard');
                              }}
                              className="text-gray-400 hover:text-white p-1 h-auto"
                              title="Copy password"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Server</Label>
                      <div className="text-white">{selectedSubscription.accountDetails.server}</div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Account Type</Label>
                      <div className="text-white capitalize">{selectedSubscription.accountDetails.accountType}</div>
                    </div>
                    {selectedSubscription.accountDetails.accountSize && (
                      <div>
                        <Label className="text-gray-400">Account Size</Label>
                        <div className="text-white">{formatAccountSize(selectedSubscription.accountDetails.accountSize)}</div>
                      </div>
                    )}
                    {selectedSubscription.accountDetails.leverage && (
                      <div>
                        <Label className="text-gray-400">Leverage</Label>
                        <div className="text-white">{selectedSubscription.accountDetails.leverage}:1</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              {(selectedSubscription.contactInfo.phone || selectedSubscription.contactInfo.telegram || 
                selectedSubscription.contactInfo.discord || selectedSubscription.contactInfo.whatsapp) && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedSubscription.contactInfo.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-white">{selectedSubscription.contactInfo.phone}</span>
                      </div>
                    )}
                    {selectedSubscription.contactInfo.telegram && (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-white">{selectedSubscription.contactInfo.telegram}</span>
                      </div>
                    )}
                    {selectedSubscription.contactInfo.discord && (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-white">{selectedSubscription.contactInfo.discord}</span>
                      </div>
                    )}
                    {selectedSubscription.contactInfo.whatsapp && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-white">{selectedSubscription.contactInfo.whatsapp}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Performance Data */}
              {selectedSubscription.performance.totalTrades > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Performance Data</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-gray-400">Total Trades</Label>
                      <div className="text-white text-xl font-bold">{selectedSubscription.performance.totalTrades}</div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Win Rate</Label>
                      <div className="text-white text-xl font-bold">{selectedSubscription.performance.winRate.toFixed(1)}%</div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Total Profit</Label>
                      <div className="text-white text-xl font-bold">{formatPrice(selectedSubscription.performance.totalProfit)}</div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Max Drawdown</Label>
                      <div className="text-white text-xl font-bold">{formatPrice(selectedSubscription.performance.maxDrawdown)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Actions */}
              {selectedSubscription.status === 'pending' && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Admin Actions</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="adminNotes" className="text-white">Admin Notes</Label>
                      <Textarea
                        id="adminNotes"
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about this subscription..."
                        className="bg-white/10 border-white/20 text-white mt-1"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleVerify(selectedSubscription._id, true)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Subscription
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleVerify(selectedSubscription._id, false)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Subscription
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CopytradeSubscriptionManager;
