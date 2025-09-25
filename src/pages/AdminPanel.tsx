import React, { Suspense, lazy, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Users, Trophy, BarChart3, Shield, Home, Menu, X, DollarSign, Bell, Target, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy load admin components for better performance
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard'));
const UserManagement = lazy(() => import('@/components/admin/UserManagement'));
const ChallengeManagement = lazy(() => import('@/components/admin/ChallengeManagement'));
const SettingsPanel = lazy(() => import('@/components/SettingsPanel'));
const AdminPaymentVerification = lazy(() => import('./AdminPaymentVerification'));
const AdminCryptoWallets = lazy(() => import('./AdminCryptoWallets'));

type AdminSection = 'dashboard' | 'users' | 'challenges' | 'analytics' | 'settings' | 'payments' | 'crypto' | 'signals' | 'notifications';

const AdminPanel = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-400 mb-4">You need admin privileges to access this page.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'blue' },
    { id: 'users', label: 'Users', icon: Users, color: 'green' },
    { id: 'challenges', label: 'Challenges', icon: Trophy, color: 'yellow' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'purple' },
    { id: 'payments', label: 'Payments', icon: DollarSign, color: 'green' },
    { id: 'crypto', label: 'Crypto Wallets', icon: Globe, color: 'orange' },
    { id: 'signals', label: 'Signals', icon: Target, color: 'red' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'blue' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'gray' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard onNavigate={setActiveSection} />;
      case 'users':
        return <UserManagement />;
      case 'challenges':
        return <ChallengeManagement />;
      case 'payments':
        return <AdminPaymentVerification />;
      case 'crypto':
        return <AdminCryptoWallets />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
              <p className="text-gray-400 mb-4">This section is under development.</p>
              <Button onClick={() => setActiveSection('dashboard')}>Back to Dashboard</Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/5 backdrop-blur-md border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/5 backdrop-blur-md border-r border-white/10 transition-transform duration-300 ease-in-out`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="h-8 w-8 text-purple-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                <p className="text-sm text-gray-400">Welcome, {user.firstName}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => {
                      setActiveSection(item.id as AdminSection);
                      setSidebarOpen(false);
                    }}
                    className={`w-full justify-start ${
                      isActive 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
              <LoadingSpinner message="Loading admin section..." size="lg" fullScreen={true} />
            </div>
          }>
            {renderContent()}
          </Suspense>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
