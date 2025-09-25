import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import GlobalPageLoader from "@/components/GlobalPageLoader";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorBoundary from "@/components/ErrorBoundary";


// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Challenges = lazy(() => import("./pages/Challenges"));
const ChallengeSetup = lazy(() => import("./pages/ChallengeSetup"));
const ChallengeDetails = lazy(() => import("./pages/ChallengeDetails"));
const SignalPlans = lazy(() => import("./pages/SignalPlans"));
const SignalPlanDetails = lazy(() => import("./pages/SignalPlanDetails"));
const Chatbox = lazy(() => import("./pages/Chatbox"));
const Mentorships = lazy(() => import("./pages/Mentorships"));
const MentorshipDetails = lazy(() => import("./pages/MentorshipDetails"));
const MentorshipChatbox = lazy(() => import("./pages/MentorshipChatbox"));
const MentorshipDashboard = lazy(() => import("./pages/MentorshipDashboard"));
const PropFirmPackages = lazy(() => import("./pages/PropFirmPackages"));
const PropFirmServiceApplication = lazy(() => import("./pages/PropFirmServiceApplication"));
const PropFirmServiceStatus = lazy(() => import("./pages/PropFirmServiceStatus"));
const ManualPayment = lazy(() => import("./pages/ManualPayment"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const AdminPaymentVerification = lazy(() => import("./pages/AdminPaymentVerification"));
const AdminCryptoWallets = lazy(() => import("./pages/AdminCryptoWallets"));
const Support = lazy(() => import("./pages/Support"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const FAQ = lazy(() => import("./pages/FAQ"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Contact = lazy(() => import("./pages/Contact"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 1000, // 15 seconds for ultra-fast updates
      gcTime: 1 * 60 * 1000, // 1 minute cache time for better memory usage
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors, only retry on network errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 1; // Reduced retries for faster failure handling
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      // Add request deduplication
      refetchInterval: false,
      refetchIntervalInBackground: false,
      // Add network mode for better performance
      networkMode: 'online',
    },
    mutations: {
      retry: 0, // No retries for mutations for faster response
      // Add optimistic updates for better UX
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SettingsProvider>
        <AuthProvider>
          <BrowserRouter>
            <GlobalPageLoader />
            <Suspense fallback={
              <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
                <LoadingSpinner message="Loading page..." size="lg" fullScreen={true} />
              </div>
            }>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/challenges/:id" element={<ChallengeDetails />} />
              <Route path="/challenges/:id/setup" element={<ChallengeSetup />} />
              <Route path="/signal-plans" element={<SignalPlans />} />
              <Route path="/signal-plans/:id" element={<SignalPlanDetails />} />
              <Route path="/chatbox/plan/:planId" element={<Chatbox />} />
              <Route path="/mentorships" element={<Mentorships />} />
              <Route path="/mentorships/:id" element={<MentorshipDetails />} />
              <Route path="/mentorship-dashboard/:planId" element={
                <ErrorBoundary>
                  <MentorshipDashboard />
                </ErrorBoundary>
              } />
              <Route path="/mentorship-chatbox/:planId" element={<MentorshipChatbox />} />
              <Route path="/prop-firm-packages" element={<PropFirmPackages />} />
              <Route path="/prop-firm-services/:packageId/apply" element={<PropFirmServiceApplication />} />
              <Route path="/prop-firm-services/:serviceId/status" element={<PropFirmServiceStatus />} />
              <Route path="/prop-firm-services" element={<PropFirmPackages />} />
              <Route path="/payment/:serviceType/:serviceId" element={<ManualPayment />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/admin/payment-verification" element={<AdminPaymentVerification />} />
              <Route path="/admin/crypto-wallets" element={<AdminCryptoWallets />} />
              <Route path="/support" element={<Support />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/contact" element={<Contact />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
