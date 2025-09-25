import { Shield, Lock, Eye } from "lucide-react";

const trustFeatures = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your data is protected with 256-bit SSL encryption and multi-factor authentication",
    stepNumber: "01"
  },
  {
    icon: Lock,
    title: "Encrypted Storage",
    description: "All investor login credentials are stored using military-grade encryption",
    stepNumber: "02"
  },
  {
    icon: Eye,
    title: "Transparent Monitoring",
    description: "Real-time trade monitoring with publicly verifiable results and statistics",
    stepNumber: "03"
  },
];

const AdminTrustSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Trust & Transparency
            </span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Your security and fair play are our top priorities. Every aspect is designed with transparency in mind.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {trustFeatures.map((feature, index) => (
            <div key={index}>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 h-full transition-all duration-300 hover:bg-white/10 hover:border-white/20 group">
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    {feature.stepNumber}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-500 to-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
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

export default AdminTrustSection;