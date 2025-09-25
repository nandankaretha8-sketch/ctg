import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 px-4 particles">
      <div className="max-w-4xl mx-auto text-center">
        {/* Aurora background effect */}
        <div className="absolute inset-0 aurora-bg opacity-30 rounded-3xl" />
        
        <div className="relative z-10 glass-card p-12 md:p-16">
          <div className="mb-8">
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              Rated 4.9/5 by over 10,000 traders
            </p>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="text-white">Ready to Join the</span><br />
            <span className="gradient-text">Challenge?</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Start your trading journey today and prove you have what it takes to compete with the best traders in the world.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              className="group bg-gradient-to-r from-purple-600 to-purple-900 text-white font-bold text-xl px-12 py-2 rounded-lg shadow-2xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse-glow"
              style={{ 
                color: 'white !important'
              }}
            >
              <span style={{ color: 'white !important', opacity: '1 !important' }}>Start Now</span>
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform inline" style={{ color: 'white !important' }} />
            </button>
            
            <Button variant="glass" size="lg" className="text-lg px-8 py-6">
              Learn More
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-glass-border/30">
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text mb-1">30 Day</div>
              <div className="text-gray-400 text-sm">Money Back Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text mb-1">24/7</div>
              <div className="text-gray-400 text-sm">Customer Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold gradient-text mb-1">Instant</div>
              <div className="text-gray-400 text-sm">Account Activation</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;