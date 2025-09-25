import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

interface SafeTooltipProviderProps {
  children: React.ReactNode;
}

const SafeTooltipProvider: React.FC<SafeTooltipProviderProps> = ({ children }) => {
  try {
    return (
      <TooltipProvider>
        {children}
      </TooltipProvider>
    );
  } catch (error) {
    console.warn('TooltipProvider error, rendering without tooltips:', error);
    return <>{children}</>;
  }
};

export default SafeTooltipProvider;
