import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, AlertCircle, Rocket } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | 'error'>('success');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    // Check if we have state data from navigation
    if (location.state) {
      setPaymentData(location.state);
      setPaymentStatus('success');
      if (location.state.type === 'signal_plan') {
        toast.success('Payment successful! Your signal plan subscription is now active.');
      } else if (location.state.type === 'mentorship') {
        toast.success('Payment successful! Welcome to your mentorship program.');
      } else if (location.state.type === 'prop_firm_service') {
        toast.success('Payment successful! Your prop firm service application has been submitted.');
      } else {
        const challengeName = location.state.challengeName || 'challenge';
        toast.success(`Payment successful! You can now complete your MT5 setup for ${challengeName}.`);
      }
      setLoading(false);
      return;
    }

    // Fallback to URL parameters for backward compatibility
    const payment = searchParams.get('payment');
    const orderId = searchParams.get('order_id');
    const challengeId = searchParams.get('challenge_id');
    const planId = searchParams.get('plan_id');
    
    if (payment === 'success' && orderId) {
      setPaymentStatus('success');
      if (planId) {
        toast.success('Payment successful! Your signal plan subscription is now active.');
      } else {
        toast.success('Payment successful! You can now complete your MT5 setup.');
      }
    } else if (payment === 'cancelled') {
      setPaymentStatus('cancelled');
      toast.error('Payment was cancelled');
    } else {
      setPaymentStatus('error');
      toast.error('Payment verification failed');
    }
    
    setLoading(false);
  }, [searchParams, location.state]);

  const handleContinue = () => {
    // Check if we have state data
    if (paymentData) {
      if (paymentData.type === 'signal_plan') {
        // Redirect to chatbox for signal plan
        const planId = paymentData.planId || searchParams.get('plan_id');
        if (planId) {
          navigate(`/chatbox/plan/${planId}`);
        } else {
          navigate('/signal-plans');
        }
      } else if (paymentData.type === 'mentorship') {
        // Redirect to mentorship dashboard for mentorship plan
        const planId = paymentData.planId || searchParams.get('plan_id');
        if (planId) {
          navigate(`/mentorship-dashboard/${planId}`);
        } else {
          navigate('/mentorships');
        }
      } else if (paymentData.type === 'prop_firm_service') {
        // Redirect to prop firm service status page
        if (paymentData.applicationId) {
          navigate(`/prop-firm-services/${paymentData.applicationId}/status`);
        } else {
          navigate('/prop-firm-services');
        }
      } else {
        // For challenge payments, redirect to setup page
        const challengeId = paymentData.challengeId || searchParams.get('challenge_id');
        if (challengeId) {
          navigate(`/challenges/${challengeId}/setup`);
        } else {
          navigate('/challenges');
        }
      }
      return;
    }

    // Fallback to URL parameters
    const challengeId = searchParams.get('challenge_id');
    const planId = searchParams.get('plan_id');
    const type = searchParams.get('type');
    
    if (type === 'mentorship' && planId) {
      navigate(`/mentorship-dashboard/${planId}`);
    } else if (type === 'prop_firm_service') {
      navigate('/prop-firm-services');
    } else if (planId) {
      navigate(`/chatbox/plan/${planId}`);
    } else if (challengeId) {
      navigate(`/challenges/${challengeId}/setup`);
    } else {
      navigate('/challenges');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Verifying payment...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white/5 backdrop-blur-md border-white/10 max-w-md mx-auto">
          <CardHeader className="text-center">
            {paymentStatus === 'success' ? (
              <>
                <div className="mx-auto mb-4 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <CardTitle className="text-white text-2xl">Payment Successful!</CardTitle>
                <CardDescription className="text-gray-300">
                  {paymentData?.type === 'signal_plan' || searchParams.get('plan_id')
                    ? 'Your signal plan subscription has been activated successfully. You will start receiving trading signals immediately.'
                    : paymentData?.type === 'mentorship'
                    ? 'Your mentorship subscription has been activated successfully. You can now access your mentorship program.'
                    : paymentData?.type === 'prop_firm_service'
                    ? 'Your prop firm service application has been submitted successfully. Our team will review your application and get back to you soon.'
                    : `Your payment has been processed successfully. You can now complete your MT5 account setup to join ${paymentData?.challengeName || 'the challenge'}.`
                  }
                </CardDescription>
                
                {/* Prop Firm Service Details */}
                {paymentData?.type === 'prop_firm_service' && (
                  <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Rocket className="h-6 w-6 text-orange-400" />
                      <h3 className="text-white font-semibold">Application Details</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Service:</span>
                        <span className="text-white">{paymentData.packageName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount Paid:</span>
                        <span className="text-white">${paymentData.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-yellow-400">Pending Review</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Next Steps:</span>
                        <span className="text-white">Admin Review</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Signal Plan Subscription Details */}
                {paymentData?.type === 'signal_plan' && paymentData?.subscription && (
                  <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Rocket className="h-6 w-6 text-orange-400" />
                      <h3 className="text-white font-semibold">Subscription Details</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Plan:</span>
                        <span className="text-white">{paymentData.subscription.signalPlan?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white capitalize">{paymentData.subscription.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white">${paymentData.subscription.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400 capitalize">{paymentData.subscription.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Expires:</span>
                        <span className="text-white">
                          {new Date(paymentData.subscription.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : paymentStatus === 'cancelled' ? (
              <>
                <div className="mx-auto mb-4 w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-orange-400" />
                </div>
                <CardTitle className="text-white text-2xl">Payment Cancelled</CardTitle>
                <CardDescription className="text-gray-300">
                  Your payment was cancelled. You can try again or return to the challenges page.
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <CardTitle className="text-white text-2xl">Payment Error</CardTitle>
                <CardDescription className="text-gray-300">
                  There was an issue processing your payment. Please try again or contact support.
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent className="space-y-4">
            {paymentStatus === 'success' ? (
              <div className="space-y-3">
                {paymentData?.type === 'signal_plan' || searchParams.get('plan_id') ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-green-400 font-semibold mb-2">What's Next:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Join the exclusive signal plan chatbox</li>
                      <li>• Receive real-time trading signals from experts</li>
                      <li>• Get push notifications for new signals</li>
                      <li>• Execute trades based on professional analysis</li>
                    </ul>
                  </div>
                ) : paymentData?.type === 'prop_firm_service' ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-green-400 font-semibold mb-2">What's Next:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Your application is under review by our team</li>
                      <li>• We'll verify your prop firm account details</li>
                      <li>• You'll receive updates on your application status</li>
                      <li>• Trading will begin once approved</li>
                    </ul>
                  </div>
                ) : paymentData?.type === 'mentorship' ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-green-400 font-semibold mb-2">What's Next:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Access your mentorship dashboard</li>
                      <li>• Connect with your mentor via chat</li>
                      <li>• Schedule your first session</li>
                      <li>• Start your learning journey</li>
                    </ul>
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-green-400 font-semibold mb-2">Next Steps:</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Complete your MT5 account setup</li>
                      <li>• Provide your trading account credentials</li>
                      <li>• Start trading when the challenge begins</li>
                    </ul>
                  </div>
                )}
                
                <Button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {paymentData?.type === 'signal_plan' || searchParams.get('plan_id') 
                        ? 'Join Signal Chatbox' 
                        : paymentData?.type === 'mentorship'
                        ? 'Go to Mentorship Dashboard'
                        : paymentData?.type === 'prop_firm_service'
                        ? 'Go to Dashboard'
                        : 'Complete MT5 Setup'
                      }
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/challenges')}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                >
                  Return to Challenges
                </Button>
                
                {paymentStatus === 'cancelled' && (
                  <Button
                    onClick={() => window.history.back()}
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Try Payment Again
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
