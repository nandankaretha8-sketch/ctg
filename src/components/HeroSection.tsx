import { ArrowRight, Trophy, Target, Infinity, Rocket, CheckCircle, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  const services = [
    {
      id: 'competitions',
      title: 'Trading Competitions',
      subtitle: 'Prove Your Trading Skills',
      description: 'Join exciting competitions, track your progress, and climb the leaderboard. Show the world what you\'re capable of.',
      icon: Trophy,
      color: 'from-purple-600 to-purple-900',
      iconColor: 'text-purple-400',
      route: '/challenges',
      ctaText: 'Start Your Competition',
      stats: 'Win Rewards'
    },
    {
      id: 'signals',
      title: 'Expert Trading Signals',
      subtitle: 'Get Signals from Professionals',
      description: 'Receive high-quality trading signals from experienced traders. Follow proven strategies and maximize your profits.',
      icon: Rocket,
      color: 'from-purple-600 to-purple-900',
      iconColor: 'text-orange-400',
      route: '/signal-plans',
      ctaText: 'Get Signals Now',
      stats: 'Expert Analysis'
    },
    {
      id: 'mentorships',
      title: 'Trading Mentorships',
      subtitle: 'Learn from the Best',
      description: 'Get personalized guidance from professional traders. Learn advanced strategies and accelerate your trading journey.',
      icon: Users,
      color: 'from-purple-600 to-purple-900',
      iconColor: 'text-blue-400',
      route: '/mentorships',
      ctaText: 'Start Learning',
      stats: 'Personal Growth'
    },
    {
      id: 'prop-firms',
      title: 'Prop Firm Services',
      subtitle: 'Pass Prop Firm Challenges',
      description: 'Get professional support to pass prop firm challenges. We help you manage your account to meet their requirements.',
      icon: CheckCircle,
      color: 'from-purple-600 to-purple-900',
      iconColor: 'text-green-400',
      route: '/prop-firm-packages',
      ctaText: 'Pass Challenge',
      stats: 'Account Management'
    }
  ];

  // Auto-rotate tabs every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % services.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [services.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden particles pt-24">
      {/* Vignette Background */}
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Strong Vignette Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/85" />
      
      {/* Additional Edge Darkening */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 pt-16 md:pt-20 lg:pt-24">
        <div className="animate-fade-in-up">
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Master Trading</span><br />
            <span className="text-white">With CTG</span>
          </h1>
          
          {/* Service Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {services.map((service, index) => (
                <button
                  key={service.id}
                  onClick={() => setActiveTab(index)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === index
                      ? `bg-gradient-to-r ${service.color} text-white shadow-lg`
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {service.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Service Content */}
          <div className="relative min-h-[400px] md:min-h-[350px]">
            <div 
              key={activeTab}
              className="absolute inset-0 animate-fade-in-up"
              style={{
                animation: 'fadeInUp 0.6s ease-out'
              }}
            >
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
                  {services[activeTab].subtitle}
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                  {services[activeTab].description}
                </p>
              </div>
              
              <div className="flex justify-center items-center mb-8 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
                <button
                  onClick={() => navigate(services[activeTab].route)}
                  className={`group bg-gradient-to-r ${services[activeTab].color} text-white font-bold text-lg px-8 py-3 rounded-lg shadow-2xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse-glow`}
                  style={{ 
                    color: 'white !important'
                  }}
                >
                  <span style={{ color: 'white !important', opacity: '1 !important' }}>
                    {services[activeTab].ctaText}
                  </span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform inline" style={{ color: 'white !important' }} />
                </button>
              </div>

              {/* Service Icon and Stats */}
              <div className="flex justify-center items-center space-x-4 mb-8 md:mb-12 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center space-x-2">
                  {(() => {
                    const IconComponent = services[activeTab].icon;
                    return <IconComponent className={`h-8 w-8 ${services[activeTab].iconColor}`} style={{ filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.8))' }} />;
                  })()}
                  <span className="text-white font-semibold text-lg">{services[activeTab].stats}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;