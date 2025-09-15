import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  CheckCircle, 
  Star,
  TrendingUp,
  Shield,
  Clock,
  Users,
  Zap,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  User,
  Award,
  BookOpen,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Elements } from '@stripe/react-stripe-js';
import { StripeProvider, useStripe } from '@/contexts/StripeContext';
import StripePaymentForm from '@/components/StripePaymentForm';

interface PropFirmPackage {
  _id: string;
  name: string;
  description: string;
  serviceFee: number;
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  requirements: {
    minAccountSize: number;
    maxDrawdown: number;
    profitTarget: number;
  };
}

interface PaymentResponse {
  paymentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  publishableKey: string;
}

// Stripe Payment Wrapper Component
const StripePaymentWrapper: React.FC<{
  paymentResponse: PaymentResponse;
  packageData: PropFirmPackage | null;
  applicationData: any;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}> = ({ paymentResponse, packageData, applicationData, onSuccess, onError, onCancel }) => {
  const { stripe } = useStripe();

  if (!stripe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-white text-xl">Loading Stripe...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your Payment</h1>
          <p className="text-gray-300">{packageData?.name} • Prop Firm Service</p>
        </div>
        
        <Elements 
          stripe={stripe}
          options={{ 
            clientSecret: paymentResponse.clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#f97316',
                colorBackground: '#1e1b4b',
                colorText: '#ffffff',
                colorDanger: '#ef4444',
                fontFamily: 'Inter, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '8px',
              }
            }
          }}
        >
          <StripePaymentForm
            clientSecret={paymentResponse.clientSecret}
            amount={paymentResponse.amount / 100}
            currency={paymentResponse.currency}
            onSuccess={onSuccess}
            onError={onError}
            onCancel={onCancel}
            description={`Payment for ${packageData?.name} prop firm service`}
          />
        </Elements>
      </div>
    </div>
  );
};

const PropFirmServicePayment = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [packageData, setPackageData] = useState<PropFirmPackage | null>(null);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentResponse, setPaymentResponse] = useState<PaymentResponse | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to complete your application');
      navigate('/login');
      return;
    }

    if (packageId) {
      fetchPackage();
      // Get application data from location state
      if (location.state?.applicationData) {
        setApplicationData(location.state.applicationData);
      }
    }
  }, [packageId, user, navigate, location.state]);

  const fetchPackage = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/prop-firm-packages/${packageId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPackageData(data.data);
      } else {
        toast.error('Failed to fetch package details');
        navigate('/prop-firm-packages');
      }
    } catch (error) {
      console.error('Error fetching package:', error);
      toast.error('Failed to fetch package details');
      navigate('/prop-firm-packages');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handlePayment = async () => {
    if (!packageData || !user || !applicationData) return;

    setProcessing(true);
    try {
      const paymentData = {
        amount: packageData.serviceFee * 100, // Convert to cents
        currency: 'USD',
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName} ${user.lastName}`,
        type: 'prop_firm_service',
        packageId: packageData._id,
        applicationId: applicationData.applicationId
      };

      console.log('Creating payment with data:', paymentData);

      const response = await fetch('http://localhost:5000/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();
      console.log('Payment creation response:', data);
      
      if (data.success) {
        setPaymentResponse(data.data);
        setShowPaymentForm(true);
      } else {
        toast.error(data.message || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    toast.success('Payment successful! Your prop firm service application has been submitted.');
    navigate('/payment-success', { 
      state: { 
        type: 'prop_firm_service',
        packageName: packageData?.name,
        amount: packageData?.serviceFee
      }
    });
  };

  const handlePaymentError = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
    setPaymentResponse(null);
    navigate(`/prop-firm-services/${packageId}/apply`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading package details...</div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Package not found</div>
      </div>
    );
  }

  // Show Stripe payment form if payment response is available
  if (showPaymentForm && paymentResponse) {
    return (
      <StripeProvider publishableKey={paymentResponse.publishableKey}>
        <StripePaymentWrapper
          paymentResponse={paymentResponse}
          packageData={packageData}
          applicationData={applicationData}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handleCancelPayment}
        />
      </StripeProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate(`/prop-firm-services/${packageId}/apply`)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Application
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Complete Your Payment
              </span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Secure payment for your prop firm service application
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Package Summary */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6">
              <CardHeader>
                <CardTitle className="text-white text-xl">Package Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Package:</span>
                    <span className="text-white font-semibold">{packageData.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Service Fee:</span>
                    <span className="text-white font-semibold">{formatCurrency(packageData.serviceFee)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-lg">Total:</span>
                      <span className="text-white font-bold text-xl">{formatCurrency(packageData.serviceFee)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Details */}
            {applicationData && (
              <Card className="bg-white/5 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Application Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Prop Firm:</span>
                      <span className="text-white">{applicationData.propFirmDetails?.firmName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Account ID:</span>
                      <span className="text-white">{applicationData.propFirmDetails?.accountId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Server:</span>
                      <span className="text-white">{applicationData.propFirmDetails?.server}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Challenge Phase:</span>
                      <span className="text-white">{applicationData.propFirmDetails?.challengePhase}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 sticky top-6">
              <CardHeader>
                <CardTitle className="text-white text-xl">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Service:</span>
                    <span className="text-white">{packageData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Amount:</span>
                    <span className="text-white">{formatCurrency(packageData.serviceFee)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-bold text-lg">Total:</span>
                      <span className="text-white font-bold text-xl">{formatCurrency(packageData.serviceFee)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-3 mt-6"
                  >
                    {processing ? 'Processing...' : `Pay ${formatCurrency(packageData.serviceFee)}`}
                  </Button>

                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                      <Shield className="h-4 w-4" />
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
  );
};

export default PropFirmServicePayment;
