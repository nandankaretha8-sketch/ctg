import React from 'react';
import { Rocket } from 'lucide-react';

interface PageLoaderProps {
  className?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ className = "" }) => {
  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        {/* Simple Rocket Animation */}
        <div className="relative">
          <div className="w-8 h-8 text-purple-400 animate-bounce">
            <Rocket className="w-full h-full" />
          </div>
          {/* Simple pulsing dot */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        
        {/* Simple loading text */}
        <p className="text-white text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
};

export default PageLoader;
