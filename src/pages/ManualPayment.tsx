import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, QrCode, Upload, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface CryptoWallet {
  _id: string;
  name: string;
  symbol: string;
  network: string;
  address: string;
  qrCode?: string;
}

interface ServiceData {
  id: string;
  name: string;
  price: number;
  type: 'challenge' | 'signal_plan' | 'mentorship' | 'prop_firm_service' | 'copytrade';
}

const ManualPayment = () => {
  const { serviceType, serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [cryptoWallets, setCryptoWallets] = useState<CryptoWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [serviceData, setServiceData] = useState<ServiceData | null>(
    location.state?.serviceData || null
  );
  const [loading, setLoading] = useState(!location.state?.serviceData);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    transactionId: '',
    transactionHash: '',
    screenshot: null as File | null
  });

  useEffect(() => {
    fetchCryptoWallets();
    // Only fetch service data if we don't have it from navigation state
    if (!location.state?.serviceData) {
      fetchServiceData();
    }
  }, [serviceType, serviceId]);

  const fetchServiceData = async () => {
    if (!serviceType || !serviceId) return;
    
    try {
      let response;
      switch (serviceType) {
        case 'challenge':
          response = await fetch(`${API_URL}/challenges/${serviceId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          break;
        case 'signal_plan':
          response = await fetch(`${API_URL}/signal-plans/${serviceId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          break;
        case 'mentorship':
          response = await fetch(`${API_URL}/mentorship-plans/${serviceId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          break;
        case 'prop_firm_service':
          // For prop firm, fetch package to get price/name
          response = await fetch(`${API_URL}/prop-firm-packages/${serviceId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          break;
        case 'copytrade':
          response = await fetch(`${API_URL}/copytrade/plans/${serviceId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          break;
        default:
          throw new Error('Invalid service type');
      }
      
      const data = await response.json();
      
      if (data.success) {
        const service = data.data;
        // Map amount per type (prop firm uses serviceFee)
        const amount = serviceType === 'prop_firm_service' ? (service.serviceFee || service.price || 0) : (service.price || 0);
        setServiceData({
          id: service._id,
          name: service.name,
          price: amount,
          type: serviceType
        });
      } else {
        toast.error('Failed to load service data');
      }
    } catch (error) {
      toast.error('Failed to load service data');
    }
  };

  const fetchCryptoWallets = async () => {
    try {
      const response = await fetch(`${API_URL}/crypto-wallets`);
      const data = await response.json();
      
      if (data.success) {
        setCryptoWallets(data.data);
      } else {
        toast.error('Failed to load crypto wallets');
      }
    } catch (error) {
      toast.error('Failed to load crypto wallets');
    } finally {
      // Only set loading to false if we're not fetching service data
      if (location.state?.serviceData) {
        setLoading(false);
      }
    }
  };

  const handleWalletSelect = (walletId: string) => {
    const wallet = cryptoWallets.find(w => w._id === walletId);
    setSelectedWallet(wallet || null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, screenshot: file }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Address copied to clipboard');
  };

  const handleSubmit = async () => {
    if (!selectedWallet || !formData.transactionId || !formData.screenshot) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      // Upload screenshot first
      const formDataUpload = new FormData();
      formDataUpload.append('screenshot', formData.screenshot);

      const uploadResponse = await fetch(`${API_URL}/upload/screenshot`, {
        method: 'POST',
        body: formDataUpload,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const uploadData = await uploadResponse.json();
      
      if (!uploadData.success) {
        throw new Error(uploadData.message || 'Failed to upload screenshot');
      }

      // Submit payment
      const paymentData = {
        serviceType,
        serviceId,
        amount: serviceData?.price || 0,
        cryptoWalletId: selectedWallet._id,
        transactionId: formData.transactionId,
        transactionHash: formData.transactionHash,
        screenshot: uploadData.data.url
      };

      const response = await fetch(`${API_URL}/manual-payments/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment submitted successfully! Please wait for admin verification.');
        navigate('/payment-success', {
          state: {
            paymentData: {
              serviceData,
              paymentData: {
                paymentId: data.data.paymentId,
                status: 'pending',
                transactionId: formData.transactionId,
                amount: serviceData?.price || 0,
                currency: 'USD'
              }
            }
          }
        });
      } else {
        throw new Error(data.message || 'Failed to submit payment');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading payment options...</div>
      </div>
    );
  }

  if (!serviceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-xl">Service data not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-white mb-2">Manual Payment</h1>
          <p className="text-gray-300">Complete your payment using cryptocurrency</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Details */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Service:</span>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                  {serviceData.name}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Type:</span>
                <span className="text-white capitalize">{serviceData.type.replace('_', ' ')}</span>
              </div>
              
              <Separator className="bg-white/10" />
              
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-300">Amount:</span>
                <span className="text-white font-bold">${serviceData.price?.toFixed ? serviceData.price.toFixed(2) : serviceData.price}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Payment Information</CardTitle>
              <CardDescription className="text-gray-300">
                Select a crypto wallet and provide payment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Crypto Wallet Selection */}
              <div className="space-y-2">
                <Label htmlFor="wallet" className="text-white">Select Crypto Wallet *</Label>
                <Select onValueChange={handleWalletSelect}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Choose a crypto wallet" />
                  </SelectTrigger>
                  <SelectContent>
                    {cryptoWallets.map((wallet) => (
                      <SelectItem key={wallet._id} value={wallet._id}>
                        {wallet.name} ({wallet.symbol}) - {wallet.network}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-center">
                  <span className="text-gray-400 text-sm">Can't find your coin? </span>
                  <a 
                    href="/support" 
                    className="text-purple-400 hover:text-purple-300 underline font-medium text-sm transition-colors"
                  >
                    Contact Support
                  </a>
                </div>
              </div>

              {/* Selected Wallet Details */}
              {selectedWallet && (
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Wallet:</span>
                        <span className="text-white font-medium">
                          {selectedWallet.name} ({selectedWallet.symbol})
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">Network:</span>
                        <span className="text-white">{selectedWallet.network}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-gray-300">Wallet Address:</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={selectedWallet.address}
                            readOnly
                            className="bg-white/10 border-white/20 text-white text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(selectedWallet.address)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {selectedWallet.qrCode && (
                        <div className="text-center">
                          <img
                            src={selectedWallet.qrCode}
                            alt="QR Code"
                            className="w-32 h-32 mx-auto border border-white/20 rounded"
                          />
                          <p className="text-gray-400 text-sm mt-2">Scan to get wallet address</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transaction Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionId" className="text-white">Transaction ID *</Label>
                  <Input
                    id="transactionId"
                    value={formData.transactionId}
                    onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                    placeholder="Enter transaction ID from your wallet"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionHash" className="text-white">Transaction Hash (Optional)</Label>
                  <Input
                    id="transactionHash"
                    value={formData.transactionHash}
                    onChange={(e) => setFormData(prev => ({ ...prev, transactionHash: e.target.value }))}
                    placeholder="Enter transaction hash if available"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshot" className="text-white">Payment Screenshot *</Label>
                  <div className="relative">
                    <label htmlFor="screenshot" className="flex items-center justify-center w-full h-12 bg-white/10 border border-white/20 rounded-md cursor-pointer hover:bg-white/15 transition-colors">
                      <div className="flex items-center gap-2 text-white text-sm font-medium">
                        <Upload className="h-4 w-4" />
                        Choose file
                      </div>
                    </label>
                    <Input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  {formData.screenshot && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      {formData.screenshot.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions */}
              <Alert className="bg-blue-500/10 border-blue-500/20">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-300">
                  <strong>Instructions:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Send the exact amount to the selected wallet address</li>
                    <li>Take a screenshot of your transaction</li>
                    <li>Enter the transaction ID from your wallet</li>
                    <li>Submit the form and wait for admin verification</li>
                  </ol>
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!selectedWallet || !formData.transactionId || !formData.screenshot || submitting}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
              >
                {submitting ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManualPayment;