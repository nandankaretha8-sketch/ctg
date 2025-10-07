import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Rocket, 
  Trophy, 
  CheckCircle, 
  BookOpen, 
  Copy, 
  MessageCircle, 
  HeadphonesIcon,
  X
} from '@/components/icons';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const ServiceGrid = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [footerSettings, setFooterSettings] = useState<any>(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonService, setComingSoonService] = useState<string>('');

  // Time-based greeting logic
  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    
    if (currentHour >= 6 && currentHour < 12) {
      return "Good morning";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good afternoon";
    } else if (currentHour >= 18 && currentHour < 22) {
      return "Good evening";
    } else {
      return "Good night";
    }
  };

  // Get user display name with fallback
  const getUserDisplayName = () => {
    if (user?.firstName) {
      return user.firstName;
    } else if (user?.username) {
      return user.username;
    }
    return "Trader";
  };

  // Fetch footer settings to get Telegram URL
  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/footer-settings`);
        const data = await response.json();
        
        if (data.success) {
          setFooterSettings(data.data);
        }
      } catch (error) {
        // Silent error handling for footer settings
      }
    };

    fetchFooterSettings();
  }, []);

  const services = [
    {
      id: 'mentorships',
      title: 'Trade like Tino',
      subtitle: 'Mentorship',
      description: 'Learn from expert mentors',
      icon: Users,
      color: 'from-indigo-500 to-purple-500',
      iconColor: 'text-indigo-300',
      route: '/mentorships',
      isActive: true
    },
    {
      id: 'signals',
      title: 'Signals',
      subtitle: 'Premium trading signals',
      description: 'Get expert trading signals',
      icon: Rocket,
      color: 'from-indigo-500 to-purple-500',
      iconColor: 'text-indigo-300',
      route: '/signal-plans',
      isActive: true
    },
    {
      id: 'tournaments',
      title: 'Tournaments',
      subtitle: 'Win $500',
      description: 'Join trading competitions',
      icon: Trophy,
      color: 'from-indigo-500 to-purple-500',
      iconColor: 'text-indigo-300',
      route: '/challenges',
      isActive: true
    },
    {
      id: 'prop-firms',
      title: 'Get Funded',
      subtitle: 'We pass your propfirm',
      description: 'Pass prop firm challenges',
      icon: CheckCircle,
      color: 'from-indigo-500 to-purple-500',
      iconColor: 'text-indigo-300',
      route: '/prop-firm-packages',
      isActive: true
    },
    {
      id: 'courses',
      title: 'Materials',
      subtitle: 'Traders therapy',
      description: 'Learn trading strategies',
      icon: BookOpen,
      color: 'from-indigo-500 to-purple-500',
      iconColor: 'text-indigo-300',
      route: '/courses',
      isActive: false // Keep card but not connected yet
    },
    {
      id: 'copytrade',
      title: 'Copytrade',
      subtitle: 'Connect your accounts',
      description: 'Copy successful traders',
      icon: Copy,
      color: 'from-indigo-500 to-purple-500',
      iconColor: 'text-indigo-300',
      route: '/copytrade',
      isActive: true // Now active
    },
    {
      id: 'community',
      title: 'Free Trading Community',
      subtitle: 'Join our community',
      description: 'Connect with traders',
      icon: MessageCircle,
      color: 'from-indigo-500 to-purple-500',
      iconColor: 'text-indigo-300',
      route: '/community',
      isActive: true // Now active - redirects to Telegram
    },
    {
      id: 'support',
      title: 'Support',
      subtitle: 'Get in touch',
      description: 'Contact our support team',
      icon: HeadphonesIcon,
      color: 'from-gray-500 to-slate-500',
      iconColor: 'text-gray-300',
      route: '/support',
      isActive: true
    }
  ];

  const handleServiceClick = (service: typeof services[0]) => {
    if (service.id === 'community') {
      // Special handling for Free Trading Community
      const telegramUrl = footerSettings?.socialMedia?.telegram;
      if (telegramUrl) {
        window.open(telegramUrl, '_blank');
      } else {
        setComingSoonService('Telegram community link is not configured yet. Please contact support.');
        setShowComingSoonModal(true);
      }
    } else if (service.isActive) {
      navigate(service.route);
    } else {
      // For inactive services, show a coming soon message
      setComingSoonService(service.title);
      setShowComingSoonModal(true);
    }
  };

  return (
    <section id="services" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">
        {/* Personalized Greeting for Logged-in Users */}
        {user && (
          <div className="text-center mb-8 animate-fade-in-up">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-300 mb-2">
              {getTimeBasedGreeting()}, <span className="text-white font-bold">{getUserDisplayName()}</span>!
            </h2>
            <p className="text-sm md:text-base text-gray-400">
              Ready to improve your journey?
            </p>
          </div>
        )}

        {/* Hero Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span style={{
              background: 'linear-gradient(135deg, #ffffff, #6b7280)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>CTG: Your Path To Consistent Trading</span>
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-base md:text-lg text-gray-300 mb-6 leading-relaxed">
              My mission is to give you the education I wish I had as a beginner trader - cutting through the noise to deliver a <span className="text-white font-semibold">SIMPLIFIED</span>, powerful approach to trading. At CTG Academy, we're not about quick wins; we're about building a disciplined, sustainable skill for life.
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              Explore Our Programs
            </h2>
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {services.map((service) => {
          const IconComponent = service.icon;
          return (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service)}
              className={`
                group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-6
                transition-all duration-300 cursor-pointer hover:scale-105 hover:bg-white/10
                ${service.isActive ? 'hover:border-white/20' : 'opacity-75 hover:opacity-90'}
                min-h-[120px] md:min-h-[140px] flex flex-col items-center justify-center text-center
              `}
            >
              {/* Icon */}
              <div className={`
                w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3 md:mb-4
                bg-gradient-to-r ${service.color} shadow-lg group-hover:shadow-xl transition-all duration-300
                relative overflow-hidden
              `}>
                <IconComponent className={`h-6 w-6 md:h-8 md:w-8 ${service.iconColor} drop-shadow-lg filter brightness-110`} style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3)) brightness(1.2)' }} />
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Title */}
              <h3 className="text-white font-bold text-sm md:text-base mb-1 md:mb-2 leading-tight">
                {service.title}
              </h3>

              {/* Subtitle */}
              <p className="text-gray-300 text-xs md:text-sm leading-tight">
                {service.subtitle}
              </p>

              {/* Coming Soon Badge for Inactive Services */}
              {!service.isActive && (
                <div className="absolute top-2 right-2">
                  <span className="bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded-full border border-yellow-500/30">
                    Soon
                  </span>
                </div>
              )}

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          );
        })}
        </div>

        {/* Coming Soon Modal */}
        {showComingSoonModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl" />
              
              {/* Content */}
              <div className="relative z-10 text-center">
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-purple-600 to-purple-900 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-4">
                  {comingSoonService === 'Telegram community link is not configured yet. Please contact support.' 
                    ? 'Community Not Available' 
                    : `${comingSoonService} is Coming Soon!`}
                </h3>
                
                {/* Message */}
                <p className="text-gray-300 mb-8 leading-relaxed">
                  {comingSoonService === 'Telegram community link is not configured yet. Please contact support.'
                    ? 'The Telegram community link is not configured yet. Please contact support for assistance.'
                    : 'We\'re working hard to bring you this amazing feature. Stay tuned for updates and be the first to know when it\'s ready!'}
                </p>
                
                {/* Buttons */}
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowComingSoonModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-900 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-950 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                  >
                    Got it!
                  </button>
                  
                  {comingSoonService !== 'Telegram community link is not configured yet. Please contact support.' && (
                    <button
                      onClick={() => {
                        setShowComingSoonModal(false);
                        // You can add notification signup logic here
                      }}
                      className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300"
                    >
                      Notify Me
                    </button>
                  )}
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={() => setShowComingSoonModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default ServiceGrid;