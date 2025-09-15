import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Challenges from "./pages/Challenges";
import ChallengeSetup from "./pages/ChallengeSetup";
import ChallengePayment from "./pages/ChallengePayment";
import ChallengeDetails from "./pages/ChallengeDetails";
import PaymentSuccess from "./pages/PaymentSuccess";
import SignalPlans from "./pages/SignalPlans";
import SignalPlanDetails from "./pages/SignalPlanDetails";
import SignalPlanPayment from "./pages/SignalPlanPayment";
import Chatbox from "./pages/Chatbox";
import Mentorships from "./pages/Mentorships";
import MentorshipDetails from "./pages/MentorshipDetails";
import MentorshipPayment from "./pages/MentorshipPayment";
import MentorshipChatbox from "./pages/MentorshipChatbox";
import MentorshipDashboard from "./pages/MentorshipDashboard";
import PropFirmPackages from "./pages/PropFirmPackages";
import PropFirmServiceApplication from "./pages/PropFirmServiceApplication";
import PropFirmServicePayment from "./pages/PropFirmServicePayment";
import PropFirmServiceStatus from "./pages/PropFirmServiceStatus";
import Support from "./pages/Support";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import FAQ from "./pages/FAQ";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SettingsProvider>
        <AuthProvider>
          <BrowserRouter>
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
            <Route path="/challenges/:id/payment" element={<ChallengePayment />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/signal-plans" element={<SignalPlans />} />
            <Route path="/signal-plans/:id" element={<SignalPlanDetails />} />
            <Route path="/signal-plans/:id/payment" element={<SignalPlanPayment />} />
            <Route path="/chatbox/plan/:planId" element={<Chatbox />} />
            <Route path="/mentorships" element={<Mentorships />} />
            <Route path="/mentorships/:id" element={<MentorshipDetails />} />
            <Route path="/mentorships/:id/payment" element={<MentorshipPayment />} />
            <Route path="/mentorship-dashboard/:planId" element={<MentorshipDashboard />} />
            <Route path="/mentorship-chatbox/:planId" element={<MentorshipChatbox />} />
            <Route path="/prop-firm-packages" element={<PropFirmPackages />} />
            <Route path="/prop-firm-services/:packageId/apply" element={<PropFirmServiceApplication />} />
            <Route path="/prop-firm-services/:packageId/payment" element={<PropFirmServicePayment />} />
            <Route path="/prop-firm-services/:serviceId/status" element={<PropFirmServiceStatus />} />
            <Route path="/prop-firm-services" element={<PropFirmPackages />} />
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
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
