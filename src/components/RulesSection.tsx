import { Target, Shield, Clock, DollarSign } from "lucide-react";

const rules = [
  {
    icon: Target,
    title: "Profit Target",
    description: "Achieve 10% profit on your initial balance to qualify for payout",
    highlight: "10% Target",
  },
  {
    icon: Shield,
    title: "Maximum Drawdown",
    description: "Don't exceed 5% daily loss or 10% total drawdown from initial balance",
    highlight: "5% Daily | 10% Total",
  },
  {
    icon: Clock,
    title: "Trading Period",
    description: "Complete the challenge within 30 days of starting your account",
    highlight: "30 Days",
  },
  {
    icon: DollarSign,
    title: "Minimum Trading Days",
    description: "Trade on at least 5 different days during the challenge period",
    highlight: "5 Days Minimum",
  },
];

const RulesSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Challenge Rules</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Clear, fair rules designed to identify skilled traders
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rules.map((rule, index) => (
            <div 
              key={index}
              className="glass-card p-6 text-center group hover:scale-105 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4 flex justify-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                  <rule.icon className="h-7 w-7 text-white" />
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-white mb-2">
                {rule.title}
              </h3>
              
              <div className="gradient-text font-bold text-xl mb-3">
                {rule.highlight}
              </div>
              
              <p className="text-gray-400 text-sm leading-relaxed">
                {rule.description}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 glass-card p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-3">
            Additional Information
          </h3>
          <p className="text-gray-400 leading-relaxed max-w-3xl mx-auto">
            All trades are monitored in real-time. News trading and weekend gap trading are allowed. 
            Expert Advisors (EAs) are permitted. Hedging and scalping strategies are welcome.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RulesSection;