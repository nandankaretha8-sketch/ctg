import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Rocket, 
  Trophy, 
  CheckCircle, 
  BookOpen, 
  Copy, 
  MessageCircle, 
  HeadphonesIcon 
} from 'lucide-react';

const ServiceGrid = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 'mentorships',
      title: 'Trade like Tino',
      subtitle: 'Mentorship',
      description: 'Learn from expert mentors',
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-300',
      route: '/mentorships',
      isActive: true
    },
    {
      id: 'signals',
      title: 'Signals',
      subtitle: 'Premium trading signals',
      description: 'Get expert trading signals',
      icon: Rocket,
      color: 'from-orange-500 to-red-500',
      iconColor: 'text-orange-300',
      route: '/signal-plans',
      isActive: true
    },
    {
      id: 'tournaments',
      title: 'Tournaments',
      subtitle: 'Win $500',
      description: 'Join trading competitions',
      icon: Trophy,
      color: 'from-purple-600 to-pink-600',
      iconColor: 'text-purple-300',
      route: '/challenges',
      isActive: true
    },
    {
      id: 'prop-firms',
      title: 'Get Funded',
      subtitle: 'We pass your propfirm',
      description: 'Pass prop firm challenges',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      iconColor: 'text-green-300',
      route: '/prop-firm-packages',
      isActive: true
    },
    {
      id: 'courses',
      title: 'Courses',
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
      color: 'from-teal-500 to-cyan-500',
      iconColor: 'text-teal-300',
      route: '/copytrade',
      isActive: false // Keep card but not connected yet
    },
    {
      id: 'community',
      title: 'Free Trading Community',
      subtitle: 'Join our community',
      description: 'Connect with traders',
      icon: MessageCircle,
      color: 'from-pink-500 to-rose-500',
      iconColor: 'text-pink-300',
      route: '/community',
      isActive: false // Keep card but not connected yet
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
    if (service.isActive) {
      navigate(service.route);
    } else {
      // For inactive services, show a coming soon message
      alert(`${service.title} is coming soon! Stay tuned for updates.`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/85" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">
        {/* Hero Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Master Trading</span><br />
            <span className="text-white">With Our Platform</span>
          </h1>
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

      </div>
    </section>
  );
};

export default ServiceGrid;
