import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BarChart3, LogIn, Rocket, LogOut, User, Shield, FileText, HelpCircle, Scale, Mail, Settings } from "@/components/icons";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import LogoutConfirmationDialog from "./LogoutConfirmationDialog";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    navigate('/login');
  };

  const handleLogoutDialogClose = () => {
    setShowLogoutDialog(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md">
      <div className="glass-card rounded-b-2xl">
        <div className="flex items-center justify-between px-2 sm:px-4 md:px-6 py-3 sm:py-4">
          {/* Left side - Hamburger + Logo + Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 -ml-1 sm:-ml-2 md:ml-0">
            {/* Hamburger Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:text-white hover:bg-glass-border/20"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>

            {/* Logo */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt={settings.siteName || "CTG"} 
                  className="h-8 w-8 rounded-full object-cover sm:h-10 sm:w-10"
                />
              ) : (
                <img 
                  src="/icon.jpeg" 
                  alt={settings.siteName || "CTG"} 
                  className="h-8 w-8 rounded-full object-cover sm:h-10 sm:w-10"
                />
              )}
              <span 
                className="text-sm sm:text-base md:text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #ffffff, #6b7280)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {settings.siteName || "ctg academy"}
              </span>
            </div>
          </div>

          {/* Right side - Navigation Buttons */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {isAuthenticated ? (
              <>
                <Button
                  variant="glass"
                  size="sm"
                  className="hidden sm:flex items-center space-x-2"
                  onClick={() => navigate('/dashboard')}
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
                
                
                {/* Mobile Dashboard Icon */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden text-foreground hover:text-white hover:bg-transparent"
                  title="Dashboard"
                  onClick={() => navigate('/dashboard')}
                >
                  <BarChart3 className="h-5 w-5" />
                </Button>

                {/* Desktop Profile Section */}
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-foreground font-medium">
                    {user?.firstName || user?.username}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:text-white hover:bg-glass-border/20"
                  onClick={handleLogoutClick}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="glass"
                  size="sm"
                  className="hidden sm:flex items-center space-x-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
                
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground hover:text-white hover:bg-glass-border/20 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                </Link>
                
                <Link to="/register">
                  <button
                    className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-600 to-purple-900 text-white font-bold rounded-lg shadow-2xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-pulse-glow"
                    style={{ 
                      color: 'white !important'
                    }}
                  >
                    <Rocket className="h-4 w-4 mr-2" style={{ color: 'white !important' }} />
                    <span style={{ color: 'white !important', opacity: '1 !important' }}>Start</span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="px-6 pb-4 border-t border-glass-border/30 mt-4 pt-4">
            <div className="flex flex-col space-y-3">
              <Link to="/privacy-policy" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-foreground hover:text-white w-full"
                >
                  <Shield className="h-4 w-4 mr-3" />
                  Privacy Policy
                </Button>
              </Link>
              
              <Link to="/refund-policy" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-foreground hover:text-white w-full"
                >
                  <FileText className="h-4 w-4 mr-3" />
                  Refund Policy
                </Button>
              </Link>
              
              <Link to="/faq" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-foreground hover:text-white w-full"
                >
                  <HelpCircle className="h-4 w-4 mr-3" />
                  FAQ
                </Button>
              </Link>
              
              <Link to="/terms-of-service" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-foreground hover:text-white w-full"
                >
                  <Scale className="h-4 w-4 mr-3" />
                  Terms of Service
                </Button>
              </Link>
              
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start text-foreground hover:text-white w-full"
                >
                  <Mail className="h-4 w-4 mr-3" />
                  Contact Us
                </Button>
              </Link>
              
              
              {isAuthenticated && (
                <>
                  <div className="border-t border-glass-border/30 pt-3 mt-3">
                    <div className="flex items-center space-x-3 py-3 px-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-foreground font-medium">
                        {user?.firstName || user?.username}
                      </span>
                    </div>
                    
                    {/* Admin Panel Link */}
                    {user?.role === 'admin' && (
                      <div className="mt-3">
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start text-foreground hover:text-white w-full"
                          >
                            <Settings className="h-4 w-4 mr-3" />
                            Admin Panel
                          </Button>
                        </Link>
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start text-foreground hover:text-white w-full"
                      onClick={() => {
                        handleLogoutClick();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Logout Confirmation Dialog */}
      <LogoutConfirmationDialog
        isOpen={showLogoutDialog}
        onClose={handleLogoutDialogClose}
        onConfirm={handleLogoutConfirm}
      />
    </header>
  );
};

export default Header;