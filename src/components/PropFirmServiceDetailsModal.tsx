import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Building2, 
  CreditCard, 
  Calendar, 
  Phone, 
  Mail, 
  Shield, 
  CheckCircle,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  Edit,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

import { API_URL } from '@/lib/api';
interface PropFirmServiceDetails {
  _id: string;
  status: 'pending' | 'active' | 'suspended' | 'completed' | 'cancelled' | 'failed';
  propFirmDetails: {
    firmName: string;
    accountId: string;
    accountPassword: string; // Required for admin to trade on behalf of users
    accountSize: number;
    accountType: string;
    challengePhase: string;
    startDate: string;
    rules: {
      maxDailyLoss: number;
      maxTotalLoss: number;
      profitTarget: number;
      tradingDays: number; // -1 represents unlimited days
      maxPositions?: number;
      allowedInstruments?: string[];
      restrictedInstruments?: string[];
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
    profitFactor: number;
    lastUpdated: string;
  };
  riskManagement: {
    dailyLossLimit: number;
    totalLossLimit: number;
    emergencyStop: boolean;
    lastRiskCheck: string;
  };
  communication: {
    lastReportSent?: string;
    reportFrequency: string;
    preferredContactMethod: string;
    notes: Array<{
      message: string;
      addedBy: {
        _id: string;
        firstName: string;
        lastName: string;
      };
      timestamp: string;
    }>;
  };
  metadata: {
    applicationData: {
      preferredRiskLevel: string;
      communicationPreference: string;
      emergencyContact: string;
      specialInstructions: string;
    };
    verificationStatus: 'pending' | 'verified' | 'failed';
    verificationNotes?: string;
    specialInstructions?: string;
    tags: string[];
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  package: {
    _id: string;
    name: string;
    price: number;
    features: string[];
  };
  payment: {
    _id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    createdAt: string;
  };
  assignedManager?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PropFirmServiceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string | null;
}

const PropFirmServiceDetailsModal: React.FC<PropFirmServiceDetailsModalProps> = ({
  isOpen,
  onClose,
  serviceId
}) => {
  const [service, setService] = useState<PropFirmServiceDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: 'pending',
    verificationStatus: '',
    verificationNotes: '',
    specialInstructions: '',
    assignedManager: '',
    reportFrequency: '',
    preferredContactMethod: ''
  });
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (isOpen && serviceId) {
      fetchServiceDetails();
    }
  }, [isOpen, serviceId]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/prop-firm-services/${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setService(data.data);
        setEditData({
          status: data.data.status,
          verificationStatus: data.data.metadata.verificationStatus,
          verificationNotes: data.data.metadata.verificationNotes || '',
          specialInstructions: data.data.metadata.specialInstructions || '',
          assignedManager: data.data.assignedManager?._id || '',
          reportFrequency: data.data.communication.reportFrequency,
          preferredContactMethod: data.data.communication.preferredContactMethod
        });
      } else {
        toast.error('Failed to fetch service details');
      }
    } catch (error) {
      // Error handling:'Error fetching service details:', error);
      toast.error('Error fetching service details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/prop-firm-services/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editData.status,
          'metadata.verificationStatus': editData.verificationStatus,
          'metadata.verificationNotes': editData.verificationNotes,
          'metadata.specialInstructions': editData.specialInstructions,
          assignedManager: editData.assignedManager || null,
          'communication.reportFrequency': editData.reportFrequency,
          'communication.preferredContactMethod': editData.preferredContactMethod
        })
      });

      if (response.ok) {
        toast.success('Service updated successfully');
        setIsEditing(false);
        fetchServiceDetails(); // Refresh data
      } else {
        toast.error('Failed to update service');
      }
    } catch (error) {
      // Error handling:'Error updating service:', error);
      toast.error('Error updating service');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/prop-firm-services/${serviceId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: newNote
        })
      });

      if (response.ok) {
        toast.success('Note added successfully');
        setNewNote('');
        fetchServiceDetails(); // Refresh data
      } else {
        toast.error('Failed to add note');
      }
    } catch (error) {
      // Error handling:'Error adding note:', error);
      toast.error('Error adding note');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/5 backdrop-blur-md border-white/10">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-2 text-white">Loading service details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!service) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/5 backdrop-blur-md border-white/10">
          <div className="flex items-center justify-center py-8">
            <span className="text-white">Service not found</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white/5 backdrop-blur-md border-white/10">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              Service Details - {service.propFirmDetails.firmName}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(service.status)}>
                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
              </Badge>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="application" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Application Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Information */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-white">{service.user.firstName} {service.user.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{service.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">User ID:</span>
                    <span className="text-white font-mono text-sm">{service.user._id}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Prop Firm Details */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Prop Firm Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Firm:</span>
                    <span className="text-white">{service.propFirmDetails.firmName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account ID:</span>
                    <span className="text-white font-mono">{service.propFirmDetails.accountId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Password:</span>
                    <span className="text-white font-mono bg-gray-700 px-2 py-1 rounded text-sm">
                      {service.propFirmDetails.accountPassword}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Size:</span>
                    <span className="text-white">{formatCurrency(service.propFirmDetails.accountSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Type:</span>
                    <span className="text-white">{service.propFirmDetails.accountType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Challenge Phase:</span>
                    <span className="text-white">{service.propFirmDetails.challengePhase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Start Date:</span>
                    <span className="text-white">{formatDate(service.propFirmDetails.startDate)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Package Information */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Package Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Package:</span>
                    <span className="text-white">{service.package.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-white">{formatCurrency(service.package.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Status:</span>
                    <Badge className={service.payment.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                      {service.payment.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount Paid:</span>
                    <span className="text-white">{formatCurrency(service.payment.amount)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Service Status */}
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Service Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    {isEditing ? (
                      <Select value={editData.status} onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="w-32 bg-white/10 border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(service.status)}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Verification:</span>
                    {isEditing ? (
                      <Select value={editData.verificationStatus} onValueChange={(value) => setEditData(prev => ({ ...prev, verificationStatus: value }))}>
                        <SelectTrigger className="w-32 bg-white/10 border-white/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={getStatusColor(service.metadata.verificationStatus)}>
                        {service.metadata.verificationStatus}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white">{formatDate(service.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-white">{formatDate(service.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="application" className="space-y-4">
            <Card className="bg-white/5 backdrop-blur-md border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Application Data</CardTitle>
                <CardDescription className="text-gray-400">
                  Information submitted by the user during application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Preferred Risk Level:</span>
                      <span className="text-white">{service.metadata.applicationData.preferredRiskLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Communication Preference:</span>
                      <span className="text-white">{service.metadata.applicationData.communicationPreference}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Emergency Contact:</span>
                      <span className="text-white">{service.metadata.applicationData.emergencyContact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Special Instructions:</span>
                      <span className="text-white">{service.metadata.applicationData.specialInstructions || 'None'}</span>
                    </div>
                  </div>
                </div>

                {/* Trading Rules */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-3">Trading Rules</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Daily Loss:</span>
                        <span className="text-white">{service.propFirmDetails.rules.maxDailyLoss}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Max Total Loss:</span>
                        <span className="text-white">{service.propFirmDetails.rules.maxTotalLoss}%</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Profit Target:</span>
                        <span className="text-white">{service.propFirmDetails.rules.profitTarget}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Trading Days:</span>
                        <span className="text-white">
                          {service.propFirmDetails.rules.tradingDays === -1 ? 'Unlimited' : `${service.propFirmDetails.rules.tradingDays} days`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Notes */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-3">Verification Notes</h4>
                  {isEditing ? (
                    <Textarea
                      value={editData.verificationNotes}
                      onChange={(e) => setEditData(prev => ({ ...prev, verificationNotes: e.target.value }))}
                      placeholder="Add verification notes..."
                      className="bg-white/10 border-white/20 text-white"
                    />
                  ) : (
                    <p className="text-gray-300">{service.metadata.verificationNotes || 'No verification notes'}</p>
                  )}
                </div>

                {/* Special Instructions */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <h4 className="text-lg font-semibold text-white mb-3">Special Instructions</h4>
                  {isEditing ? (
                    <Textarea
                      value={editData.specialInstructions}
                      onChange={(e) => setEditData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                      placeholder="Add special instructions..."
                      className="bg-white/10 border-white/20 text-white"
                    />
                  ) : (
                    <p className="text-gray-300">{service.metadata.specialInstructions || 'No special instructions'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PropFirmServiceDetailsModal;