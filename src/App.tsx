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
import ScrollToTop from "@/components/ScrollToTop";


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
const CopytradePlans = lazy(() => import("./pages/CopytradePlans"));
const CopytradePlanDetails = lazy(() => import("./pages/CopytradePlanDetails"));
const CopytradeAccountSetup = lazy(() => import("./pages/CopytradeAccountSetup"));
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
      staleTime: 2 * 60 * 1000, // 2 minutes (reduced for faster updates)
      gcTime: 5 * 60 * 1000, // 5 minutes (reduced for better memory usage)
      retry: 1, // Reduced retries for faster failure handling
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount if data exists
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
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
            <ScrollToTop />
            <GlobalPageLoader />
            <Suspense fallback={
              <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
                <LoadingSpinner message="Loading page..." size="lg" fullScreen={true} />
              </div>
            }>
              <Routes>
              <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
              <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
              <Route path="/register" element={<ErrorBoundary><Register /></ErrorBoundary>} />
              <Route path="/forgot-password" element={<ErrorBoundary><ForgotPassword /></ErrorBoundary>} />
              <Route path="/verify-otp" element={<ErrorBoundary><VerifyOTP /></ErrorBoundary>} />
              <Route path="/reset-password" element={<ErrorBoundary><ResetPassword /></ErrorBoundary>} />
              <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
              <Route path="/challenges" element={<ErrorBoundary><Challenges /></ErrorBoundary>} />
              <Route path="/challenges/:id" element={<ErrorBoundary><ChallengeDetails /></ErrorBoundary>} />
              <Route path="/challenges/:id/setup" element={<ErrorBoundary><ChallengeSetup /></ErrorBoundary>} />
              <Route path="/signal-plans" element={<ErrorBoundary><SignalPlans /></ErrorBoundary>} />
              <Route path="/signal-plans/:id" element={<ErrorBoundary><SignalPlanDetails /></ErrorBoundary>} />
              <Route path="/chatbox/plan/:planId" element={<ErrorBoundary><Chatbox /></ErrorBoundary>} />
              <Route path="/mentorships" element={<ErrorBoundary><Mentorships /></ErrorBoundary>} />
              <Route path="/mentorships/:id" element={<ErrorBoundary><MentorshipDetails /></ErrorBoundary>} />
              <Route path="/mentorship-dashboard/:planId" element={
                <ErrorBoundary>
                  <MentorshipDashboard />
                </ErrorBoundary>
              } />
              <Route path="/mentorship-chatbox/:planId" element={<ErrorBoundary><MentorshipChatbox /></ErrorBoundary>} />
              <Route path="/prop-firm-packages" element={<ErrorBoundary><PropFirmPackages /></ErrorBoundary>} />
              <Route path="/prop-firm-services/:packageId/apply" element={<ErrorBoundary><PropFirmServiceApplication /></ErrorBoundary>} />
              <Route path="/prop-firm-services/:serviceId/status" element={<ErrorBoundary><PropFirmServiceStatus /></ErrorBoundary>} />
              <Route path="/prop-firm-services" element={<ErrorBoundary><PropFirmPackages /></ErrorBoundary>} />
              <Route path="/copytrade" element={<ErrorBoundary><CopytradePlans /></ErrorBoundary>} />
              <Route path="/copytrade/:id" element={<ErrorBoundary><CopytradePlanDetails /></ErrorBoundary>} />
              <Route path="/copytrade/setup/:id" element={<ErrorBoundary><CopytradeAccountSetup /></ErrorBoundary>} />
              <Route path="/payment/:serviceType/:serviceId" element={<ErrorBoundary><ManualPayment /></ErrorBoundary>} />
              <Route path="/payment-success" element={<ErrorBoundary><PaymentSuccess /></ErrorBoundary>} />
              <Route path="/admin/payment-verification" element={<ErrorBoundary><AdminPaymentVerification /></ErrorBoundary>} />
              <Route path="/admin/crypto-wallets" element={<ErrorBoundary><AdminCryptoWallets /></ErrorBoundary>} />
              <Route path="/support" element={<ErrorBoundary><Support /></ErrorBoundary>} />
              <Route path="/admin" element={<ErrorBoundary><AdminPanel /></ErrorBoundary>} />
              <Route path="/privacy" element={<ErrorBoundary><PrivacyPolicy /></ErrorBoundary>} />
              <Route path="/privacy-policy" element={<ErrorBoundary><PrivacyPolicy /></ErrorBoundary>} />
              <Route path="/refund-policy" element={<ErrorBoundary><RefundPolicy /></ErrorBoundary>} />
              <Route path="/faq" element={<ErrorBoundary><FAQ /></ErrorBoundary>} />
              <Route path="/terms" element={<ErrorBoundary><TermsOfService /></ErrorBoundary>} />
              <Route path="/terms-of-service" element={<ErrorBoundary><TermsOfService /></ErrorBoundary>} />
              <Route path="/cookies" element={<ErrorBoundary><CookiePolicy /></ErrorBoundary>} />
              <Route path="/cookie-policy" element={<ErrorBoundary><CookiePolicy /></ErrorBoundary>} />
              <Route path="/contact" element={<ErrorBoundary><Contact /></ErrorBoundary>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;