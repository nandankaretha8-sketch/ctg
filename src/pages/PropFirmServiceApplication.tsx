import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Check, AlertCircle, CreditCard, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

import { API_URL } from '@/lib/api';
interface PropFirmPackage {
  _id: string;
  name: string;
  description: string;
  serviceFee: number;
  pricingType: string;
  features: string[];
  requirements: {
    minAccountSize: number;
    supportedPropFirms: string[];
    recommendedPropFirms: Array<{
      name: string;
      priority: string;
      isRecommended: boolean;
      description: string;
    }>;
    maxDrawdown: number;
    profitTarget: number;
  };
}

const PropFirmServiceApplication = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [packageData, setPackageData] = useState<PropFirmPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Prop Firm Details
    firmName: '',
    customFirmName: '',
    accountId: '',
    accountPassword: '',
    server: '',
    challengePhase: '',
    maxDailyLoss: '',
    maxTotalLoss: '',
    profitTarget: '',
    tradingDays: '',
    
    // Personal Details
    preferredRiskLevel: '',
    communicationPreference: '',
    emergencyContact: '',
    specialInstructions: '',
    
    // Agreement
    agreementAccepted: false
  });

  useEffect(() => {
    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  const fetchPackage = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/prop-firm-packages/${packageId}`);
      
      if (response.ok) {
        const data = await response.json();
        setPackageData(data.data);
      } else {
        throw new Error('Failed to fetch package');
      }
    } catch (error) {
      // Error handling:'Error fetching package:', error);
      toast.error('Failed to load package details');
      navigate('/prop-firm-packages');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    const required = ['accountId', 'accountPassword', 'server'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    // Check if custom firm name is required
    if (formData.firmName === 'custom' && !formData.customFirmName) {
      toast.error('Please enter your prop firm name');
      return false;
    }
    
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`);
      return false;
    }

    // Only validate supported firms if not custom
    if (formData.firmName && formData.firmName !== 'custom' && packageData && 
        !packageData.requirements.supportedPropFirms.includes(formData.firmName) &&
        !packageData.requirements.recommendedPropFirms?.some(f => f.name === formData.firmName)) {
      toast.error(`Prop firm ${formData.firmName} is not supported for this package`);
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    const required = ['preferredRiskLevel', 'communicationPreference'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.agreementAccepted) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please log in to continue');
        navigate('/login');
        return;
      }

      const propFirmDetails = {
        firmName: formData.firmName === 'custom' ? formData.customFirmName : formData.firmName,
        accountId: formData.accountId,
        accountPassword: formData.accountPassword,
        server: formData.server,
        accountSize: packageData?.requirements?.minAccountSize || 10000, // Use package minimum or default
        accountType: 'challenge', // Default to challenge type
        challengePhase: formData.challengePhase || 'N/A',
        rules: {
          maxDailyLoss: parseFloat(formData.maxDailyLoss),
          maxTotalLoss: parseFloat(formData.maxTotalLoss),
          profitTarget: parseFloat(formData.profitTarget),
          tradingDays: formData.tradingDays === '-1' ? -1 : parseInt(formData.tradingDays)
        }
      };

      const personalDetails = {
        preferredRiskLevel: formData.preferredRiskLevel,
        communicationPreference: formData.communicationPreference,
        emergencyContact: formData.emergencyContact,
        specialInstructions: formData.specialInstructions
      };

      const response = await fetch(`${API_URL}/prop-firm-services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId,
          propFirmDetails,
          personalDetails
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.data.isFree) {
          // Free package - show success immediately
          toast.success(data.message);
          navigate('/prop-firm-services');
        } else {
          // Paid package - redirect to manual payment page
          navigate(`/payment/prop_firm_service/${packageId}`, {
            state: {
              serviceData: {
                id: packageId,
                name: packageData.name,
                price: packageData.price,
                type: 'prop_firm_service'
              },
              applicationData: {
                propFirmDetails,
                personalDetails,
                applicationId: data.data.applicationId
              }
            }
          });
        }
      } else {
        const errorData = await response.json();
        
        // Check if it's a payment gateway configuration error
        if (errorData.message && errorData.message.toLowerCase().includes('payment')) {
          toast.error('Payment gateway not configured. Please contact support.');
        } else {
          throw new Error(errorData.message || 'Failed to submit application');
        }
      }
    } catch (error) {
      // Error handling:'Error submitting application:', error);
      
      // Check if it's a network error or payment gateway-related error
      if (error.message && error.message.toLowerCase().includes('payment')) {
        toast.error('Payment gateway not configured. Please contact support.');
      } else if (error.message && error.message.includes('Failed to fetch')) {
        toast.error('Unable to connect to server. Please check your connection.');
      } else {
        toast.error(error.message || 'Failed to submit application');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading package details...</div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Package not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Packages Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/prop-firm-packages')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packages
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Apply for {packageData.name}
            </span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Complete the application form to get started with our prop firm management service
          </p>
        </div>

        <div className="max-w-4xl mx-auto">

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-600 text-gray-300'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-orange-500' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Application Form */}
            <div className="lg:col-span-2">
              <Card className="glass-card border-glass-border/30">
                <CardHeader>
                  <CardTitle className="text-white">
                    {currentStep === 1 && 'Prop Firm Account Details'}
                    {currentStep === 2 && 'Personal Information'}
                    {currentStep === 3 && 'Review & Payment'}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {currentStep === 1 && 'Provide your prop firm account information'}
                    {currentStep === 2 && 'Tell us about your trading experience and preferences'}
                    {currentStep === 3 && 'Review your application and proceed to payment'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1: Prop Firm Details */}
                  {currentStep === 1 && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firmName" className="text-white">Prop Firm Name</Label>
                          <Select value={formData.firmName} onValueChange={(value) => handleInputChange('firmName', value)}>
                            <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select or enter your prop firm" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-gray-700">
                              {/* Recommended firms with priority */}
                              {packageData.requirements.recommendedPropFirms && packageData.requirements.recommendedPropFirms.length > 0 && (
                                <>
                                  <div className="px-2 py-1 text-xs text-gray-400 border-b border-gray-600">
                                    Recommended Prop Firms
                                  </div>
                                  {packageData.requirements.recommendedPropFirms
                                    .sort((a, b) => {
                                      const priorityOrder = { high: 3, medium: 2, low: 1 };
                                      return priorityOrder[b.priority] - priorityOrder[a.priority];
                                    })
                                    .map((firm) => (
                                    <SelectItem key={firm.name} value={firm.name}>
                                      <div className="flex items-center gap-2">
                                        <span>{firm.name}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                                          firm.priority === 'high' ? 'bg-green-600 text-white' :
                                          firm.priority === 'medium' ? 'bg-yellow-600 text-white' :
                                          'bg-gray-600 text-white'
                                        }`}>
                                          {firm.priority}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                  <div className="px-2 py-1 text-xs text-gray-400 border-b border-gray-600">
                                    Other Supported Firms
                                  </div>
                                </>
                              )}
                              {/* Other supported firms */}
                              {packageData.requirements.supportedPropFirms.map((firm) => (
                                <SelectItem key={firm} value={firm}>{firm}</SelectItem>
                              ))}
                              <SelectItem value="custom">Other (Enter custom firm name)</SelectItem>
                            </SelectContent>
                          </Select>
                          {formData.firmName === 'custom' && (
                            <Input
                              id="customFirmName"
                              value={formData.customFirmName || ''}
                              onChange={(e) => handleInputChange('customFirmName', e.target.value)}
                              className="mt-2 bg-white/10 border-white/20 text-white"
                              placeholder="Enter your prop firm name"
                            />
                          )}
                        </div>

                        <div>
                          <Label htmlFor="accountId" className="text-white">Account ID *</Label>
                          <Input
                            id="accountId"
                            value={formData.accountId}
                            onChange={(e) => handleInputChange('accountId', e.target.value)}
                            className="mt-2 bg-white/10 border-white/20 text-white"
                            placeholder="Enter your account ID"
                          />
                        </div>

                        <div>
                          <Label htmlFor="accountPassword" className="text-white">Account Password *</Label>
                          <div className="relative mt-2">
                            <Input
                              id="accountPassword"
                              type={showPassword ? "text" : "password"}
                              value={formData.accountPassword}
                              onChange={(e) => handleInputChange('accountPassword', e.target.value)}
                              className="bg-white/10 border-white/20 text-white pr-10"
                              placeholder="Enter your account password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="server" className="text-white">Server *</Label>
                          <Input
                            id="server"
                            type="text"
                            value={formData.server}
                            onChange={(e) => handleInputChange('server', e.target.value)}
                            className="mt-2 bg-white/10 border-white/20 text-white"
                            placeholder="e.g., mt4.ftmo.com:443"
                          />
                        </div>

                        <div>
                          <Label htmlFor="challengePhase" className="text-white">Challenge Phase</Label>
                          <Select value={formData.challengePhase} onValueChange={(value) => handleInputChange('challengePhase', value)}>
                            <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select phase" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-gray-700">
                              <SelectItem value="Phase 1">Phase 1</SelectItem>
                              <SelectItem value="Phase 2">Phase 2</SelectItem>
                              <SelectItem value="Live">Live</SelectItem>
                              <SelectItem value="N/A">N/A</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="maxDailyLoss" className="text-white">Max Daily Loss (%)</Label>
                          <Input
                            id="maxDailyLoss"
                            type="number"
                            value={formData.maxDailyLoss}
                            onChange={(e) => handleInputChange('maxDailyLoss', e.target.value)}
                            className="mt-2 bg-white/10 border-white/20 text-white"
                            placeholder="e.g., 5"
                          />
                        </div>

                        <div>
                          <Label htmlFor="maxTotalLoss" className="text-white">Max Total Loss (%)</Label>
                          <Input
                            id="maxTotalLoss"
                            type="number"
                            value={formData.maxTotalLoss}
                            onChange={(e) => handleInputChange('maxTotalLoss', e.target.value)}
                            className="mt-2 bg-white/10 border-white/20 text-white"
                            placeholder="e.g., 10"
                          />
                        </div>

                        <div>
                          <Label htmlFor="profitTarget" className="text-white">Profit Target (%)</Label>
                          <Input
                            id="profitTarget"
                            type="number"
                            value={formData.profitTarget}
                            onChange={(e) => handleInputChange('profitTarget', e.target.value)}
                            className="mt-2 bg-white/10 border-white/20 text-white"
                            placeholder="e.g., 8"
                          />
                        </div>

                        <div>
                          <Label htmlFor="tradingDays" className="text-white">Trading Days</Label>
                          <div className="mt-2 space-y-2">
                            <Input
                              id="tradingDays"
                              type="number"
                              value={formData.tradingDays === '-1' ? '' : formData.tradingDays}
                              onChange={(e) => handleInputChange('tradingDays', e.target.value)}
                              className="bg-white/10 border-white/20 text-white"
                              placeholder="e.g., 30"
                              min="1"
                              disabled={formData.tradingDays === '-1'}
                            />
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="unlimitedTradingDays"
                                checked={formData.tradingDays === '-1'}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleInputChange('tradingDays', '-1');
                                  } else {
                                    handleInputChange('tradingDays', '30');
                                  }
                                }}
                                className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                              />
                              <Label htmlFor="unlimitedTradingDays" className="text-white text-sm">
                                Unlimited trading days
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2: Personal Details */}
                  {currentStep === 2 && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="preferredRiskLevel" className="text-white">Preferred Risk Level *</Label>
                          <Select value={formData.preferredRiskLevel} onValueChange={(value) => handleInputChange('preferredRiskLevel', value)}>
                            <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select risk level" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-gray-700">
                              <SelectItem value="Conservative">Conservative</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="Aggressive">Aggressive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="communicationPreference" className="text-white">Communication Preference *</Label>
                          <Select value={formData.communicationPreference} onValueChange={(value) => handleInputChange('communicationPreference', value)}>
                            <SelectTrigger className="mt-2 bg-white/10 border-white/20 text-white">
                              <SelectValue placeholder="Select preference" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 text-white border-gray-700">
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="in-app">In-App Messages</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="emergencyContact" className="text-white">Emergency Contact</Label>
                          <Input
                            id="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                            className="mt-2 bg-white/10 border-white/20 text-white"
                            placeholder="Phone number or email"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="specialInstructions" className="text-white">Special Instructions</Label>
                        <Textarea
                          id="specialInstructions"
                          value={formData.specialInstructions}
                          onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                          className="mt-2 bg-white/10 border-white/20 text-white"
                          placeholder="Any special requirements or instructions..."
                          rows={4}
                        />
                      </div>
                    </>
                  )}

                  {/* Step 3: Review & Payment */}
                  {currentStep === 3 && (
                    <>
                      <div className="space-y-6">
                        <div className="bg-white/5 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-3">Package Summary</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Package:</span>
                              <span className="text-white">{packageData.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Service Fee:</span>
                              <span className="text-white">${packageData.serviceFee}</span>
                            </div>
                            <div className="flex justify-between font-semibold border-t border-white/10 pt-2">
                              <span className="text-white">Total:</span>
                              <span className="text-white">${packageData.serviceFee}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-3">Account Details</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Prop Firm:</span>
                              <span className="text-white">
                                {formData.firmName === 'custom' ? formData.customFirmName : formData.firmName}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Account ID:</span>
                              <span className="text-white">{formData.accountId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Server:</span>
                              <span className="text-white">{formData.server}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Challenge Phase:</span>
                              <span className="text-white capitalize">{formData.challengePhase || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4">
                          <h3 className="text-white font-semibold mb-3">Trading Rules</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Max Daily Loss:</span>
                              <span className="text-white">{formData.maxDailyLoss}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Max Total Loss:</span>
                              <span className="text-white">{formData.maxTotalLoss}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Profit Target:</span>
                              <span className="text-white">{formData.profitTarget}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Trading Days:</span>
                              <span className="text-white">
                                {formData.tradingDays === '-1' ? 'Unlimited' : `${formData.tradingDays} days`}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id="agreement"
                            checked={formData.agreementAccepted}
                            onChange={(e) => handleInputChange('agreementAccepted', e.target.checked)}
                            className="mt-1"
                          />
                          <label htmlFor="agreement" className="text-gray-300 text-sm">
                            I agree to the terms and conditions and understand that my prop firm account credentials will be securely stored and used for account management purposes.
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 1}
                      className="border-glass-border/30 text-foreground hover:bg-glass/20"
                    >
                      Previous
                    </Button>

                    {currentStep < 3 ? (
                      <Button
                        onClick={handleNext}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={submitting || !formData.agreementAccepted}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                      >
                        {submitting ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Package Info Sidebar */}
            <div className="lg:col-span-1">
              <Card className="glass-card border-glass-border/30 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-white">{packageData.name}</CardTitle>
                  <CardDescription className="text-gray-300">
                    {packageData.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Features</h4>
                      <div className="space-y-2">
                        {packageData.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">Requirements</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Min Account Size:</span>
                          <span className="text-white">${packageData.requirements.minAccountSize.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Drawdown:</span>
                          <span className="text-white">{packageData.requirements.maxDrawdown}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Profit Target:</span>
                          <span className="text-white">{packageData.requirements.profitTarget}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">Total Cost:</span>
                        <span className="text-white text-xl font-bold">
                          ${packageData.serviceFee}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <CreditCard className="h-4 w-4" />
                        <span>Secure payment processing</span>
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

export default PropFirmServiceApplication;
