import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  Copy, 
  Users, 
  DollarSign, 
  Calendar,
  Shield,
  Zap,
  Target,
  Activity,
  Save
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface CopytradePlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  accountSize: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  maxSubscribers?: number;
  currentSubscribers: number;
  metadata: {
    copySpeed: string;
    riskLevel: string;
    maxDrawdown: number;
    minBalance: number;
    supportedBrokers: string[];
    maxPositions: number;
    copyMultiplier: number;
  };
  createdAt: string;
  updatedAt: string;
}

const CopytradePlanManager: React.FC = () => {
  const [plans, setPlans] = useState<CopytradePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CopytradePlan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    duration: 'monthly',
    accountSize: 10000,
    features: [''],
    isActive: true,
    isPopular: false,
    maxSubscribers: '',
    metadata: {
      copySpeed: 'real-time',
      riskLevel: 'medium',
      maxDrawdown: 10,
      minBalance: 100,
      supportedBrokers: ['MetaTrader 5', 'MetaTrader 4'],
      maxPositions: 10,
      copyMultiplier: 1
    }
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to access copytrade plans');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/copytrade/plans/admin/plans`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        toast.error('Failed to fetch copytrade plans');
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      } else {
        toast.error('Failed to fetch copytrade plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to fetch copytrade plans');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        features: newFeatures
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      duration: 'monthly',
      accountSize: 10000,
      features: [''],
      isActive: true,
      isPopular: false,
      maxSubscribers: '',
      metadata: {
        copySpeed: 'real-time',
        riskLevel: 'medium',
        maxDrawdown: 10,
        minBalance: 100,
        supportedBrokers: ['MetaTrader 5', 'MetaTrader 4'],
        maxPositions: 10,
        copyMultiplier: 1
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.features.some(feature => !feature.trim())) {
      toast.error('Please fill in all features or remove empty ones');
      return;
    }

    try {
      setSubmitting(true);
      const filteredFeatures = formData.features.filter(feature => feature.trim());
      
      const planData = {
        ...formData,
        features: filteredFeatures,
        maxSubscribers: formData.maxSubscribers ? parseInt(formData.maxSubscribers) : undefined
      };

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to save plan');
        return;
      }

      let response: any;
      if (editingPlan) {
        response = await fetch(`${API_BASE_URL}/api/copytrade/plans/${editingPlan._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planData)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/copytrade/plans`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(planData)
        });
      }

      if (!response.ok) {
        toast.error('Failed to save plan');
        return;
      }

      const data = await response.json();
      if (data.success) {
        toast.success(editingPlan ? 'Plan updated successfully' : 'Plan created successfully');
        setShowForm(false);
        setEditingPlan(null);
        resetForm();
        fetchPlans();
      } else {
        toast.error(response.message || 'Failed to save plan');
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plan: CopytradePlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      originalPrice: plan.originalPrice || 0,
      duration: plan.duration,
      accountSize: plan.accountSize,
      features: plan.features.length > 0 ? plan.features : [''],
      isActive: plan.isActive,
      isPopular: plan.isPopular,
      maxSubscribers: plan.maxSubscribers?.toString() || '',
      metadata: plan.metadata
    });
    setShowForm(true);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to delete plan');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/copytrade/plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        toast.error('Failed to delete plan');
        return;
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Plan deleted successfully');
        fetchPlans();
      } else {
        toast.error(data.message || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatAccountSize = (size: number) => {
    if (size >= 1000000) {
      return `$${(size / 1000000).toFixed(1)}M`;
    } else if (size >= 1000) {
      return `$${(size / 1000).toFixed(0)}K`;
    }
    return `$${size.toLocaleString()}`;
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Manage Copytrade Plans</h2>
          <p className="text-gray-400">Create and manage copytrade subscription plans</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingPlan(null);
            resetForm();
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Create/Edit Plan Form - Dropdown Style */}
      {showForm && (
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-xl">
                {editingPlan ? 'Edit Copytrade Plan' : 'Create Copytrade Plan'}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false);
                  setEditingPlan(null);
                  resetForm();
                }}
                className="text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Plan Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Professional Copytrade Plan"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe what this copytrade plan offers..."
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price" className="text-white">Price ($) *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="originalPrice" className="text-white">Original Price ($)</Label>
                      <Input
                        id="originalPrice"
                        name="originalPrice"
                        type="number"
                        step="0.01"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration" className="text-white">Duration *</Label>
                      <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                          <SelectItem value="annual">Annual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="accountSize" className="text-white">Account Size ($) *</Label>
                      <Input
                        id="accountSize"
                        name="accountSize"
                        type="number"
                        value={formData.accountSize}
                        onChange={(e) => handleInputChange('accountSize', parseFloat(e.target.value) || 0)}
                        placeholder="10000"
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="maxSubscribers" className="text-white">Max Subscribers</Label>
                    <Input
                      id="maxSubscribers"
                      name="maxSubscribers"
                      type="number"
                      value={formData.maxSubscribers}
                      onChange={(e) => handleInputChange('maxSubscribers', e.target.value)}
                      placeholder="Leave empty for unlimited"
                      className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => handleInputChange('isActive', !!checked)}
                      />
                      <Label htmlFor="isActive" className="text-white">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPopular"
                        checked={formData.isPopular}
                        onCheckedChange={(checked) => handleInputChange('isPopular', !!checked)}
                      />
                      <Label htmlFor="isPopular" className="text-white">Popular</Label>
                    </div>
                  </div>
                </div>

                {/* Right Column - Features & Metadata */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white">Features *</Label>
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            placeholder="Feature description"
                            className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFeature(index)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={addFeature}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Feature
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-white font-semibold">Trading Settings</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Copy Speed</Label>
                        <Select value={formData.metadata.copySpeed} onValueChange={(value) => handleInputChange('metadata.copySpeed', value)}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="Select speed" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="real-time">Real-time</SelectItem>
                            <SelectItem value="fast">Fast</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="slow">Slow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white">Risk Level</Label>
                        <Select value={formData.metadata.riskLevel} onValueChange={(value) => handleInputChange('metadata.riskLevel', value)}>
                          <SelectTrigger className="bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="Select risk" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxDrawdown" className="text-white">Max Drawdown (%)</Label>
                        <Input
                          id="maxDrawdown"
                          name="maxDrawdown"
                          type="number"
                          step="0.1"
                          value={formData.metadata.maxDrawdown}
                          onChange={(e) => handleInputChange('metadata.maxDrawdown', parseFloat(e.target.value) || 0)}
                          placeholder="10"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="minBalance" className="text-white">Min Balance ($)</Label>
                        <Input
                          id="minBalance"
                          name="minBalance"
                          type="number"
                          value={formData.metadata.minBalance}
                          onChange={(e) => handleInputChange('metadata.minBalance', parseFloat(e.target.value) || 0)}
                          placeholder="100"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxPositions" className="text-white">Max Positions</Label>
                        <Input
                          id="maxPositions"
                          name="maxPositions"
                          type="number"
                          value={formData.metadata.maxPositions}
                          onChange={(e) => handleInputChange('metadata.maxPositions', parseInt(e.target.value) || 0)}
                          placeholder="10"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="copyMultiplier" className="text-white">Copy Multiplier</Label>
                        <Input
                          id="copyMultiplier"
                          name="copyMultiplier"
                          type="number"
                          step="0.1"
                          value={formData.metadata.copyMultiplier}
                          onChange={(e) => handleInputChange('metadata.copyMultiplier', parseFloat(e.target.value) || 0)}
                          placeholder="1"
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlan(null);
                    resetForm();
                  }}
                  className="text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {editingPlan ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {editingPlan ? 'Update Plan' : 'Create Plan'}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan._id} className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(plan._id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                {plan.isPopular && (
                  <Badge className="bg-orange-500 text-white text-xs">
                    Popular
                  </Badge>
                )}
                <Badge className={`text-xs ${
                  plan.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-300 text-sm line-clamp-2">{plan.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-white">{formatPrice(plan.price)}</p>
                    <p className="text-gray-400 text-sm capitalize">{plan.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatAccountSize(plan.accountSize)}</p>
                    <p className="text-gray-400 text-sm">Account Size</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{plan.currentSubscribers} subscribers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    <span className="capitalize">{plan.metadata.riskLevel} Risk</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-gray-400 text-sm">Features:</p>
                  <div className="space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <p key={index} className="text-gray-300 text-sm">• {feature}</p>
                    ))}
                    {plan.features.length > 3 && (
                      <p className="text-gray-400 text-sm">+{plan.features.length - 3} more</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CopytradePlanManager;