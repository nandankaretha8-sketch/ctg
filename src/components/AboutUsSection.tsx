import React from 'react';
import { ArrowRight } from 'lucide-react';

const AboutUsSection = () => {
  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span style={{
              background: 'linear-gradient(135deg, #ffffff, #6b7280)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              About Us
            </span>
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative group">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src="/about.jpeg" 
                alt="Dr. Esther.T. Makaripe - Founder of CTG Traders Group"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
          </div>

          {/* Text Content */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 relative overflow-hidden">
              {/* Background gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-2xl" />
              
              <div className="relative z-10">
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  I am <span className="text-white font-semibold">Dr. Esther.T. Makaripe</span>, and I founded "CTG Traders Group" to transform the way people learn to trade. With over 5 years of dedicated experience and a background in medicine, I bring an unparalleled level of discipline and analytical rigor to the forex market. My goal is to equip you with practical, professional strategies and the crucial skill of risk management, so you can trade with confidence and clarity.
                </p>
                
                {/* CTA Button */}
                <div className="flex justify-center lg:justify-start">
                  <button 
                    onClick={scrollToServices}
                    className="group bg-gradient-to-r from-purple-600 to-purple-900 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
                  >
                    <span>Start Your Journey</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Credentials/Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">5+</div>
                <div className="text-gray-400 text-sm">Years Experience</div>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">MD</div>
                <div className="text-gray-400 text-sm">Medical Background</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
