import React, { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  User, 
  Calendar,
  DollarSign,
  Hash,
  Image,
  Filter,
  Search,
  RefreshCw,
  X,
  Download,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ManualPayment {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  serviceType: string;
  serviceId: string;
  amount: number;
  currency: string;
  cryptoWallet: {
    _id: string;
    name: string;
    symbol: string;
    network: string;
  };
  transactionId: string;
  transactionHash?: string;
  screenshot: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  adminNotes?: string;
  verifiedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  verifiedAt?: string;
  createdAt: string;
  expiresAt: string;
}

interface PaymentStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const AdminPaymentVerification = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    status: 'all',
    serviceType: 'all',
    search: ''
  });
  
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null);
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState({
    status: 'approved' as 'approved' | 'rejected',
    adminNotes: ''
  });

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!user) {
      setError('Please login to access this page');
      setLoading(false);
      return;
    }
    
    if (user.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    
    fetchPayments();
    fetchStats();
  }, [filters, user]);

  const fetchPayments = async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.serviceType && filters.serviceType !== 'all') params.append('serviceType', filters.serviceType);
      
      const response = await fetch(`${API_URL}/manual-payments?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        let filteredPayments = data.data.payments || [];
        
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredPayments = filteredPayments.filter((payment: ManualPayment) =>
            payment.userId.email.toLowerCase().includes(searchTerm) ||
            payment.userId.firstName.toLowerCase().includes(searchTerm) ||
            payment.userId.lastName.toLowerCase().includes(searchTerm) ||
            payment.transactionId.toLowerCase().includes(searchTerm)
          );
        }
        
        setPayments(filteredPayments);
      } else {
        throw new Error(data.message || 'Failed to fetch payments');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch payments');
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/manual-payments/stats/statistics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data || { total: 0, pending: 0, approved: 0, rejected: 0 });
      } else {
        throw new Error(data.message || 'Failed to fetch statistics');
      }
    } catch (error) {
      // Don't show error toast for stats
    }
  };

  const handleDownloadScreenshot = (screenshotUrl: string, transactionId: string) => {
    const link = document.createElement('a');
    link.href = screenshotUrl;
    link.download = `payment-screenshot-${transactionId}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePaymentExpansion = (paymentId: string) => {
    setExpandedPayment(expandedPayment === paymentId ? null : paymentId);
    if (expandedPayment !== paymentId) {
      setSelectedPayment(payments.find(p => p._id === paymentId) || null);
    }
  };

  const handleVerifyPayment = async (paymentId: string) => {
    setProcessing(paymentId);
    
    try {
      const response = await fetch(`${API_URL}/manual-payments/${paymentId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(verificationData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Payment ${verificationData.status} successfully`);
        setSelectedPayment(null);
        setVerificationData({ status: 'approved', adminNotes: '' });
        fetchPayments();
        fetchStats();
      } else {
        throw new Error(data.message || 'Failed to verify payment');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify payment');
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-300 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
      expired: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading payments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <div className="text-red-400 text-xl mb-4">Error</div>
            <div className="text-white text-lg">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header Section */}
      <div className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Payment Verification</h1>
              <p className="text-gray-300 text-sm sm:text-base">Review and verify manual payments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm font-medium truncate">Total Payments</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-1">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-500/20 rounded-full flex-shrink-0">
                  <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm font-medium truncate">Pending</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-400 mt-1">{stats.pending}</p>
                </div>
                <div className="p-2 sm:p-3 bg-yellow-500/20 rounded-full flex-shrink-0">
                  <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm font-medium truncate">Approved</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-400 mt-1">{stats.approved}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-500/20 rounded-full flex-shrink-0">
                  <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-xs sm:text-sm font-medium truncate">Rejected</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-400 mt-1">{stats.rejected}</p>
                </div>
                <div className="p-2 sm:p-3 bg-red-500/20 rounded-full flex-shrink-0">
                  <XCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6 sm:mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-medium text-sm">Status</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-colors">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white font-medium text-sm">Service Type</Label>
                <Select value={filters.serviceType} onValueChange={(value) => setFilters(prev => ({ ...prev, serviceType: value }))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 transition-colors">
                    <SelectValue placeholder="All services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All services</SelectItem>
                    <SelectItem value="challenge">Challenge</SelectItem>
                    <SelectItem value="signal_plan">Signal Plan</SelectItem>
                    <SelectItem value="mentorship">Mentorship</SelectItem>
                    <SelectItem value="prop_firm_service">Prop Firm Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white font-medium text-sm">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by email, name, or transaction ID"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white pl-10 hover:bg-white/15 transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setFilters({ status: 'all', serviceType: 'all', search: '' });
                    fetchPayments();
                  }}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/5 backdrop-blur-md rounded-lg p-6 sm:p-8 max-w-md mx-auto border border-white/10">
              <DollarSign className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Payments Found</h3>
              <p className="text-gray-300 text-sm sm:text-base mb-6">No manual payments match your current filters</p>
              <Button
                onClick={() => {
                  setFilters({ status: 'all', serviceType: 'all', search: '' });
                  fetchPayments();
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {payments.map((payment) => (
              <Card key={payment._id} className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 bg-purple-500/20 rounded-full flex-shrink-0">
                        <User className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-white text-lg truncate">
                          {payment.userId.firstName} {payment.userId.lastName}
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-sm truncate">
                          {payment.userId.email}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {getStatusBadge(payment.status)}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePaymentExpansion(payment._id)}
                        className="text-white hover:bg-white/10 p-2"
                      >
                        {expandedPayment === payment._id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Payment Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Service</p>
                      <p className="text-white font-semibold text-sm capitalize truncate">{payment.serviceType.replace('_', ' ')}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Amount</p>
                      <p className="text-white font-bold text-sm sm:text-lg">${payment.amount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Crypto</p>
                      <p className="text-white font-medium text-sm">{payment.cryptoWallet.symbol}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-400 text-xs font-medium uppercase tracking-wide">Network</p>
                      <p className="text-white font-medium text-sm">{payment.cryptoWallet.network}</p>
                    </div>
                  </div>
                  
                  {/* Transaction Info */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-gray-400 text-sm">Transaction ID:</span>
                      <span className="text-white text-sm font-mono bg-white/10 px-2 py-1 rounded break-all">
                        {payment.transactionId.length > 20 ? `${payment.transactionId.substring(0, 20)}...` : payment.transactionId}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <span className="text-gray-400 text-sm">Submitted:</span>
                      <span className="text-white text-sm">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/10" />
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePaymentExpansion(payment._id)}
                      className="flex-1 border-white/20 text-white hover:bg-white/10 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {expandedPayment === payment._id ? 'Hide Details' : 'View Details'}
                    </Button>
                    
                    {payment.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setVerificationData({ status: 'approved', adminNotes: '' });
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Quick Approve
                      </Button>
                    )}
                  </div>
                </CardContent>

                {/* Expanded Payment Details */}
                {expandedPayment === payment._id && (
                  <div className="border-t border-white/10">
                    <CardContent className="p-6 space-y-6">
                      {/* User Information */}
                      <div className="space-y-3">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          <User className="h-4 w-4" />
                          User Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Name:</span>
                            <p className="text-white">{payment.userId.firstName} {payment.userId.lastName}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Email:</span>
                            <p className="text-white break-all">{payment.userId.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="bg-white/10" />
                      
                      {/* Payment Information */}
                      <div className="space-y-3">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Payment Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Service:</span>
                            <p className="text-white capitalize">{payment.serviceType.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Amount:</span>
                            <p className="text-white font-semibold">${payment.amount}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Crypto Wallet:</span>
                            <p className="text-white">{payment.cryptoWallet.name} ({payment.cryptoWallet.symbol})</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Network:</span>
                            <p className="text-white">{payment.cryptoWallet.network}</p>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="bg-white/10" />
                      
                      {/* Transaction Details */}
                      <div className="space-y-3">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          Transaction Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-400">Transaction ID:</span>
                            <p className="text-white font-mono break-all bg-white/5 p-2 rounded text-xs">{payment.transactionId}</p>
                          </div>
                          {payment.transactionHash && (
                            <div>
                              <span className="text-gray-400">Transaction Hash:</span>
                              <p className="text-white font-mono break-all bg-white/5 p-2 rounded text-xs">{payment.transactionHash}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Separator className="bg-white/10" />
                      
                      {/* Payment Screenshot */}
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <h3 className="text-white font-semibold flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            Payment Screenshot
                          </h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadScreenshot(payment.screenshot, payment.transactionId)}
                            className="border-white/20 text-white hover:bg-white/10 transition-colors w-full sm:w-auto"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        <div className="border border-white/20 rounded-lg overflow-hidden">
                          <img
                            src={payment.screenshot}
                            alt="Payment screenshot"
                            className="w-full h-auto max-h-64 object-contain"
                          />
                        </div>
                      </div>
                      
                      {/* Verification Form for Pending Payments */}
                      {payment.status === 'pending' && (
                        <>
                          <Separator className="bg-white/10" />
                          
                          <div className="space-y-4">
                            <h3 className="text-white font-semibold">Verification</h3>
                            
                            <div className="space-y-2">
                              <Label className="text-white">Decision</Label>
                              <Select
                                value={verificationData.status}
                                onValueChange={(value: 'approved' | 'rejected') => 
                                  setVerificationData(prev => ({ ...prev, status: value }))
                                }
                              >
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="approved">Approve</SelectItem>
                                  <SelectItem value="rejected">Reject</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-white">Admin Notes</Label>
                              <Textarea
                                value={verificationData.adminNotes}
                                onChange={(e) => setVerificationData(prev => ({ ...prev, adminNotes: e.target.value }))}
                                placeholder="Add notes about this verification..."
                                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                                rows={3}
                              />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleVerifyPayment(payment._id)}
                                disabled={processing === payment._id}
                                className={`flex-1 ${
                                  verificationData.status === 'approved'
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950 text-white'
                                    : 'bg-gradient-to-r from-red-600 to-red-900 hover:from-red-700 hover:to-red-950 text-white'
                                }`}
                              >
                                {processing === payment._id ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : verificationData.status === 'approved' ? (
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                ) : (
                                  <XCircle className="h-4 w-4 mr-2" />
                                )}
                                {verificationData.status === 'approved' ? 'Approve Payment' : 'Reject Payment'}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentVerification;