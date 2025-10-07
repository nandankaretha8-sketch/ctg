import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BottomCTASection = () => {
  const navigate = useNavigate();

  const handleBookSession = () => {
    navigate('/mentorships');
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 relative overflow-hidden">
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 rounded-2xl" />
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Ready to Transform Your Trading Psychology?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Book a 1-on-1 Trading Therapy session with Dr. Esther.T. Makaripe and start your journey to consistent, confident trading.
            </p>
            
            {/* CTA Button */}
            <button 
              onClick={handleBookSession}
              className="group bg-gradient-to-r from-purple-600 to-purple-900 text-white font-bold text-lg px-12 py-4 rounded-xl shadow-2xl hover:shadow-purple-500/25 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <span>Book A Session</span>
              <Calendar className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            {/* Additional Info */}
            <p className="text-gray-400 text-sm mt-6">
              Join hundreds of traders who have already transformed their mindset
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BottomCTASection;
