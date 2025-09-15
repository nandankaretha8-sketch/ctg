import { ArrowRight, Trophy, Target, Infinity, Rocket, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  const navigate = useNavigate();

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
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
        <div className="animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Prove Your</span><br />
            <span className="text-white">Trading Skills</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join exciting competitions, track your progress, and climb the leaderboard. 
            Show the world what you're capable of.
          </p>
          
          <div className="flex justify-center items-center">
            <button
              onClick={() => navigate('/challenges')}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg px-8 py-2 rounded-lg shadow-2xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse-glow"
              style={{ 
                color: 'white !important'
              }}
            >
              <span style={{ color: 'white !important', opacity: '1 !important' }}>Start Your Competition</span>
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform inline" style={{ color: 'white !important' }} />
            </button>
          </div>
        </div>
        
        {/* Stats - Desktop Two Lines */}
        <div className="mt-16 hidden md:block animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col items-center space-y-4">
            {/* First line: Win Rewards and Skills Into Success */}
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-purple-400" style={{ filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.8))' }} />
                <span className="text-white font-semibold text-lg">Win Rewards</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-blue-400" style={{ filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))' }} />
                <span className="text-white font-semibold text-lg">Skills Into Success</span>
              </div>
            </div>
            {/* Second line: No Limits */}
            <div className="flex items-center justify-center space-x-2">
              <Infinity className="h-8 w-8 text-green-400" style={{ filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.8))' }} />
              <span className="text-white font-semibold text-lg">No Limits</span>
            </div>
          </div>
        </div>

        {/* Services Section - Desktop */}
        <div className="mt-16 mb-20 hidden md:block animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold gradient-text mb-2">Other Services</h3>
            <p className="text-gray-400 text-lg">Discover what we offer</p>
          </div>
          
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {/* Signals Service Card */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:scale-105 hover:bg-white/8 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <Rocket className="h-12 w-12 text-orange-400 transition-all duration-300" 
                        style={{ filter: 'drop-shadow(0 0 20px rgba(251, 146, 60, 0.8))' }} />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">
                Get Signals from Experts
              </h4>
              <button 
                onClick={() => navigate('/signal-plans')}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-base px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Join Now
              </button>
            </div>

            {/* Prop Firm Passing Service Card */}
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:scale-105 hover:bg-white/8 transition-all duration-300">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-green-400 transition-all duration-300" 
                             style={{ filter: 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.8))' }} />
              </div>
              <h4 className="text-xl font-bold text-white mb-4">
                Prop Firm Passing
              </h4>
              <button 
                onClick={() => navigate('/prop-firm-packages')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-base px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Join Now
              </button>
            </div>
          </div>
        </div>

        {/* Stats - Mobile Two Lines with Pulse */}
        <div className="mt-16 md:hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex flex-col items-center space-y-4 ml-4 px-4">
            {/* First line: Win Rewards and Skills Into Success */}
            <div className="flex items-center justify-between w-full max-w-sm">
              <div className="flex items-center space-x-2 animate-pulse">
                    <Trophy className="h-8 w-8 text-purple-400" style={{ filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.8))' }} />
                    <span className="text-white font-semibold text-lg">Win Rewards</span>
                  </div>
              <div className="flex items-center animate-pulse ml-2" style={{ animationDelay: '0.5s' }}>
                <Target className="h-8 w-8 text-blue-400 ml-4" style={{ filter: 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.8))' }} />
                    <span className="text-white font-semibold text-lg">Skills Into Success</span>
                  </div>
            </div>
            {/* Second line: No Limits */}
            <div className="flex items-center justify-center space-x-2 animate-pulse" style={{ animationDelay: '1s' }}>
                    <Infinity className="h-8 w-8 text-green-400" style={{ filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.8))' }} />
                    <span className="text-white font-semibold text-lg">No Limits</span>
                  </div>
                </div>
              </div>

        {/* Services Section - Mobile */}
        <div className="mt-12 mb-16 md:hidden animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex flex-col items-center space-y-4 px-4">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold gradient-text mb-2">Other Services</h3>
              <p className="text-gray-400 text-sm">Discover what we offer</p>
                  </div>
            
            {/* Two separate service cards in one line */}
            <div className="w-full max-w-sm flex gap-3">
              {/* Signals Service Card */}
              <div className="flex flex-col items-center space-y-2 p-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg flex-1 hover:bg-white/8 transition-all duration-300">
                <div className="flex justify-center">
                  <Rocket className="h-8 w-8 text-orange-400" 
                          style={{ filter: 'drop-shadow(0 0 10px rgba(251, 146, 60, 0.8))' }} />
                  </div>
                <h4 className="text-white font-semibold text-sm text-center">
                  Get Signals
                </h4>
                <button 
                  onClick={() => navigate('/signal-plans')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold text-xs px-3 py-1 rounded-md shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Join Now
                </button>
                  </div>

              {/* Prop Firm Passing Service Card */}
              <div className="flex flex-col items-center space-y-2 p-3 backdrop-blur-md bg-white/5 border border-white/10 rounded-lg flex-1 hover:bg-white/8 transition-all duration-300">
                <div className="flex justify-center">
                  <CheckCircle className="h-8 w-8 text-green-400" 
                               style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))' }} />
                </div>
                <h4 className="text-white font-semibold text-sm text-center">
                  Pass Prop firm
                </h4>
                <button 
                  onClick={() => navigate('/prop-firm-packages')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-xs px-3 py-1 rounded-md shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;