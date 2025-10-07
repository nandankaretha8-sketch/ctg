import React from 'react';
import { Brain, Calendar, Shield, Target, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

const TradingPsychologySection = () => {

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header with Title Above Brain */}
        <div className="text-center mb-16 relative">
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `floatUp ${3 + Math.random() * 4}s infinite linear`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Title Above Brain */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            <span style={{
              background: 'linear-gradient(135deg, #ffffff, #6b7280)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Master Trading Psychology
            </span>
          </h2>

          {/* Enhanced Brain Visual */}
          <div className="relative inline-block">
            {/* Multi-layer Glow Effects */}
            <div className="absolute inset-0 rounded-full animate-pulse-glow">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-gold-500/30 blur-xl animate-pulse"></div>
            </div>
            <div className="absolute inset-0 rounded-full">
              <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-yellow-500/20 blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
            
            {/* Main Brain Container */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 rounded-full flex items-center justify-center transform animate-breathe hover:scale-110 transition-transform duration-300 cursor-pointer">
              {/* Neural Network Overlay */}
              <div className="absolute inset-0 rounded-full">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Neural Pathways */}
                  <path
                    d="M20,30 Q50,20 80,30 Q50,40 20,30"
                    stroke="url(#neuralGradient)"
                    strokeWidth="0.5"
                    fill="none"
                    className="animate-neural-pulse"
                  />
                  <path
                    d="M30,50 Q50,45 70,50 Q50,55 30,50"
                    stroke="url(#neuralGradient)"
                    strokeWidth="0.5"
                    fill="none"
                    className="animate-neural-pulse"
                    style={{ animationDelay: '0.5s' }}
                  />
                  <path
                    d="M25,70 Q50,65 75,70 Q50,75 25,70"
                    stroke="url(#neuralGradient)"
                    strokeWidth="0.5"
                    fill="none"
                    className="animate-neural-pulse"
                    style={{ animationDelay: '1s' }}
                  />
                  
                  {/* Neural Nodes */}
                  <circle cx="20" cy="30" r="2" fill="url(#goldGradient)" className="animate-pulse" />
                  <circle cx="80" cy="30" r="2" fill="url(#goldGradient)" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <circle cx="30" cy="50" r="2" fill="url(#goldGradient)" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
                  <circle cx="70" cy="50" r="2" fill="url(#goldGradient)" className="animate-pulse" style={{ animationDelay: '0.9s' }} />
                  <circle cx="25" cy="70" r="2" fill="url(#goldGradient)" className="animate-pulse" style={{ animationDelay: '1.2s' }} />
                  <circle cx="75" cy="70" r="2" fill="url(#goldGradient)" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <radialGradient id="goldGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Central Brain Icon */}
              <Brain className="w-12 h-12 md:w-16 md:h-16 text-white drop-shadow-lg" />
              
              {/* Floating Wealth Symbols */}
              <div className="absolute inset-0">
                <DollarSign className="absolute w-4 h-4 text-yellow-400 animate-float-wealth" style={{ top: '10%', left: '20%', animationDelay: '0s' }} />
                <TrendingUp className="absolute w-4 h-4 text-green-400 animate-float-wealth" style={{ top: '20%', right: '15%', animationDelay: '1s' }} />
                <Sparkles className="absolute w-4 h-4 text-blue-400 animate-float-wealth" style={{ bottom: '15%', left: '15%', animationDelay: '2s' }} />
                <DollarSign className="absolute w-4 h-4 text-yellow-400 animate-float-wealth" style={{ bottom: '25%', right: '20%', animationDelay: '3s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Single Unified Card with Enhanced Effects */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
          {/* Enhanced Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-2xl group-hover:from-purple-500/10 group-hover:via-pink-500/10 group-hover:to-blue-500/10 transition-all duration-500" />
          
          {/* Subtle Glow Effect */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 blur-xl"></div>
          </div>
          
          <div className="relative z-10">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Main Content */}
              <div className="space-y-6">
                <p className="text-gray-300 text-lg leading-relaxed">
                  The biggest challenge in trading isn't the market it's the mind. Fear, impulsive decisions, and stress can sabotage even the best strategies. Our <span className="text-white font-semibold">1-on-1 Trading Therapy sessions</span> are designed to help you conquer the psychological battles of the market. As a medical doctor, I bring a unique understanding of human behavior and discipline to help you build a mindset that leads to consistent, confident trading.
                </p>
              </div>

              {/* Right Side - Features & Credentials */}
              <div className="space-y-6">
                {/* Main Feature */}
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-purple-900 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">1-on-1 Trading Therapy</h3>
                    <p className="text-gray-300 text-sm">
                      Personalized psychological support tailored to your trading challenges and goals.
                    </p>
                  </div>
                </div>

                {/* Feature Benefits */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">Overcome Fear</div>
                    <div className="text-xs text-gray-400">Build confidence</div>
                  </div>
                  
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-gradient-to-r from-green-500 to-green-700 flex items-center justify-center">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">Stay Disciplined</div>
                    <div className="text-xs text-gray-400">Consistent mindset</div>
                  </div>
                </div>

                {/* Doctor Credentials */}
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-purple-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">MD</span>
                    </div>
                    <div>
                      <div className="text-white font-semibold">Medical Doctor</div>
                      <div className="text-gray-400 text-sm">Human behavior expertise</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TradingPsychologySection;
