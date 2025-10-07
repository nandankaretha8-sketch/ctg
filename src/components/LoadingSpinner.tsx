import React from 'react';
import { Rocket, TrendingUp } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  size = 'md',
  className = "",
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[200px]'} ${className}`}>
      {/* Main Loading Container */}
      <div className="relative">
        {/* Rocket Container */}
        <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
          {/* Pulsing Background Circle */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
          
          {/* Weight Indicator Pulsing Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border border-purple-400/20 animate-pulse"></div>
          
          {/* Rocket Icon */}
          <div className="relative z-10 transform transition-transform duration-1000 ease-in-out animate-bounce">
            <Rocket className={`${sizeClasses[size]} text-purple-400 drop-shadow-lg`} />
          </div>
          
          {/* Weight Indicator Dots */}
          <div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg">
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute -top-4 -left-4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
        <div className="absolute -top-2 -right-6 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-200"></div>
        <div className="absolute -bottom-3 -right-3 w-1 h-1 bg-cyan-400 rounded-full animate-bounce delay-300"></div>
      </div>
      
      {/* Loading Text */}
      <div className="mt-6 text-center">
        <p className={`${textSizeClasses[size]} text-white font-medium mb-2`}>
          {message}
        </p>
        
        {/* Progress Dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
      
      {/* Weight Indicator Bar */}
      <div className="mt-4 w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse">
          <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping opacity-75"></div>
        </div>
      </div>
      
      {/* Trading Theme Elements */}
      <div className="mt-4 flex items-center space-x-2 text-gray-400">
        <TrendingUp className="w-4 h-4 animate-pulse" />
        <span className="text-xs">Preparing your trading experience...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner;