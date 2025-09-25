import { CreditCard, Link2, Trophy, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    title: "Register & Pay",
    description: "Create your account and choose your competition package. Quick and secure payment processing.",
    stepNumber: "01"
  },
  {
    icon: Link2,
    title: "Connect Your MT5 Account",
    description: "Link your MetaTrader 5 investor account safely. We use encrypted storage for maximum security.",
    stepNumber: "02"
  },
  {
    icon: Trophy,
    title: "Compete & Track Progress",
    description: "Start trading, track your performance in real-time, and compete to win prizes.",
    stepNumber: "03"
  },
];

const StepsSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
              How It Works
            </span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Get started in three simple steps and begin your journey to trading success
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 h-full transition-all duration-300 hover:bg-white/10 hover:border-white/20 group">
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text">
                    {step.stepNumber}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;