import React from 'react';
import { Rocket } from 'lucide-react';

interface InlineLoaderProps {
  message?: string;
  className?: string;
}

const InlineLoader: React.FC<InlineLoaderProps> = ({ 
  message = "Loading...", 
  className = ""
}) => {
  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      <div className="relative">
        <div className="w-4 h-4 text-purple-400 animate-spin">
          <Rocket className="w-full h-full" />
        </div>
        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
      </div>
      <span className="text-gray-400 text-sm">{message}</span>
    </div>
  );
};

export default InlineLoader;
