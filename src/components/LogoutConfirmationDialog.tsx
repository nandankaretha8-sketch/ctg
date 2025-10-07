import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xl"
      onClick={handleOverlayClick}
      style={{ paddingTop: '60px', paddingBottom: '60px' }}
    >
      <div 
        className="glass-card border-glass-border/50 shadow-2xl backdrop-blur-xl max-w-md sm:max-w-lg mx-4 p-8 rounded-2xl transform scale-100"
        style={{ 
          marginTop: '400px',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div 
            className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(249, 115, 22, 0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              boxShadow: '0 8px 32px rgba(249, 115, 22, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <LogOut className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-white text-center">
            Confirm Logout
          </h2>
          <p className="text-gray-300 text-center leading-relaxed mt-2">
            Are you sure you want to log out? You'll need to sign in again to access your account and all your data.
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-medium transition-all duration-200 hover:text-white"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="w-full sm:w-auto px-6 py-3 text-white border-0 rounded-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-medium transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.8), rgba(239, 68, 68, 0.8))',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              boxShadow: '0 8px 32px rgba(249, 115, 22, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationDialog;
