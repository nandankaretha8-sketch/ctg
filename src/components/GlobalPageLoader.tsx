import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';

const GlobalPageLoader: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const location = useLocation();

  useEffect(() => {
    // Don't show loading on auth pages and home page
    if (location.pathname === '/' || 
        location.pathname === '/login' || 
        location.pathname === '/register' || 
        location.pathname === '/forgot-password' ||
        location.pathname === '/verify-otp' ||
        location.pathname === '/reset-password') {
      setIsLoading(false);
      return;
    }
    
    // Show loading on route change
    setIsLoading(true);
    
    // Set different messages based on the route
    const getLoadingMessage = (pathname: string) => {
      // Mentorship related routes
      if (pathname.includes('/mentorship-dashboard')) return 'Loading mentorship dashboard...';
      if (pathname.includes('/mentorship-chatbox')) return 'Loading mentorship chat...';
      if (pathname.includes('/mentorships')) return 'Loading mentorship plans...';
      
      // Signal related routes
      if (pathname.includes('/signal-plans')) return 'Loading signal plans...';
      if (pathname.includes('/chatbox/plan')) return 'Loading signal chat...';
      
      // Challenge related routes
      if (pathname.includes('/challenges/') && pathname.includes('/setup')) return 'Loading challenge setup...';
      if (pathname.includes('/challenges/')) return 'Loading challenge details...';
      if (pathname.includes('/challenges')) return 'Loading challenges...';
      
      // Prop firm related routes
      if (pathname.includes('/prop-firm-services/') && pathname.includes('/apply')) return 'Loading application form...';
      if (pathname.includes('/prop-firm-services/') && pathname.includes('/status')) return 'Loading service status...';
      if (pathname.includes('/prop-firm-services')) return 'Loading prop firm services...';
      if (pathname.includes('/prop-firm-packages')) return 'Loading prop firm packages...';
      
      // Payment related routes
      if (pathname.includes('/payment/')) return 'Loading payment form...';
      if (pathname.includes('/payment-success')) return 'Processing payment success...';
      
      // Admin related routes
      if (pathname.includes('/admin/payment-verification')) return 'Loading payment verification...';
      if (pathname.includes('/admin/crypto-wallets')) return 'Loading crypto wallets...';
      if (pathname.includes('/admin')) return 'Loading admin panel...';
      
      // Other routes
      if (pathname.includes('/dashboard')) return 'Loading your dashboard...';
      if (pathname.includes('/support')) return 'Loading support...';
      if (pathname.includes('/profile')) return 'Loading profile...';
      if (pathname.includes('/settings')) return 'Loading settings...';
      if (pathname.includes('/chat')) return 'Loading chat...';
      if (pathname.includes('/community')) return 'Loading community...';
      if (pathname.includes('/tournaments')) return 'Loading tournaments...';
      return 'Loading page...';
    };

    setLoadingMessage(getLoadingMessage(location.pathname));

    // Hide loading after a short delay to show the animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800); // Show for 800ms to see the beautiful animation

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <LoadingSpinner 
        message={loadingMessage}
        size="lg"
        className="min-h-screen"
      />
    </div>
  );
};

export default GlobalPageLoader;