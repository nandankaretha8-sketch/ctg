import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const NotificationsSection = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleContactSupport = () => {
    if (isAuthenticated) {
      navigate('/support');
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center max-w-md w-full">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-500 to-gray-700 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-4">
              24/7 Support
            </h3>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              Get answers to your questions within minutes, not hours. Our expert team is always ready to help.
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white">Average Response Time</span>
                <span className="text-purple-400 font-bold">&lt; 1 hour</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-white">Customer Satisfaction</span>
                <span className="text-purple-400 font-bold">100%</span>
              </div>
            </div>
            
            <button
              onClick={handleContactSupport}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-900 text-white font-bold px-8 py-3 rounded-lg hover:from-purple-700 hover:to-purple-950 transition-all duration-300"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotificationsSection;