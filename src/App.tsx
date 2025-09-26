import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import GlobalPageLoader from "@/components/GlobalPageLoader";
import ErrorBoundary from "@/components/ErrorBoundary";

// Import all pages directly - no dynamic imports
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import ChallengeSetup from "./pages/ChallengeSetup";
import ChallengeDetails from "./pages/ChallengeDetails";
import SignalPlans from "./pages/SignalPlans";
import SignalPlanDetails from "./pages/SignalPlanDetails";
import Chatbox from "./pages/Chatbox";
import Mentorships from "./pages/Mentorships";
import MentorshipDetails from "./pages/MentorshipDetails";
import MentorshipChatbox from "./pages/MentorshipChatbox";
import MentorshipDashboard from "./pages/MentorshipDashboard";
import PropFirmPackages from "./pages/PropFirmPackages";
import PropFirmServiceApplication from "./pages/PropFirmServiceApplication";
import PropFirmServiceStatus from "./pages/PropFirmServiceStatus";
import ManualPayment from "./pages/ManualPayment";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminPaymentVerification from "./pages/AdminPaymentVerification";
import AdminCryptoWallets from "./pages/AdminCryptoWallets";
import Support from "./pages/Support";
import AdminPanel from "./pages/AdminPanelOld";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import FAQ from "./pages/FAQ";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Contact from "./pages/Contact";

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
              <Route path="/admin" element={
                <ErrorBoundary>
                  <AdminPanel />
                </ErrorBoundary>
              } />
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
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
