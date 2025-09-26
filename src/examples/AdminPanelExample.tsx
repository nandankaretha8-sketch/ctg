import React, { useState } from 'react';
import { useTabPageData } from '@/hooks/usePageData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

// Example: How to convert Admin Panel to tab-based loading
const AdminPanelExample = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');

  // Only load data when specific menu is active
  const { 
    data: usersData, 
    isLoading: usersLoading 
  } = useTabPageData(
    ['admin-users'],
    '/admin/users',
    activeMenu,
    'users'
  );

  const { 
    data: challengesData, 
    isLoading: challengesLoading 
  } = useTabPageData(
    ['admin-challenges'],
    '/admin/challenges',
    activeMenu,
    'challenges'
  );

  const { 
    data: signalPlansData, 
    isLoading: signalPlansLoading 
  } = useTabPageData(
    ['admin-signal-plans'],
    '/admin/signal-plans',
    activeMenu,
    'signal-plans'
  );

  const { 
    data: mentorshipPlansData, 
    isLoading: mentorshipPlansLoading 
  } = useTabPageData(
    ['admin-mentorship-plans'],
    '/admin/mentorship-plans',
    activeMenu,
    'mentorships'
  );

  const { 
    data: supportTicketsData, 
    isLoading: supportTicketsLoading 
  } = useTabPageData(
    ['admin-support-tickets'],
    '/admin/support-tickets',
    activeMenu,
    'support'
  );

  const { 
    data: leaderboardData, 
    isLoading: leaderboardLoading 
  } = useTabPageData(
    ['admin-leaderboard'],
    '/admin/leaderboard',
    activeMenu,
    'leaderboard'
  );

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'users', label: 'Users' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'signal-plans', label: 'Signal Plans' },
    { id: 'mentorships', label: 'Mentorships' },
    { id: 'support', label: 'Support' },
    { id: 'leaderboard', label: 'Leaderboard' },
  ];

  const renderMenuContent = () => {
    switch (activeMenu) {
      case 'users':
        if (usersLoading) return <LoadingSpinner message="Loading users..." />;
        return (
          <div>
            <h3>Users Management</h3>
            <p>Users loaded: {usersData?.data?.length || 0}</p>
          </div>
        );
      
      case 'challenges':
        if (challengesLoading) return <LoadingSpinner message="Loading challenges..." />;
        return (
          <div>
            <h3>Challenges Management</h3>
            <p>Challenges loaded: {challengesData?.data?.length || 0}</p>
          </div>
        );
      
      case 'signal-plans':
        if (signalPlansLoading) return <LoadingSpinner message="Loading signal plans..." />;
        return (
          <div>
            <h3>Signal Plans Management</h3>
            <p>Signal plans loaded: {signalPlansData?.data?.length || 0}</p>
          </div>
        );
      
      case 'mentorships':
        if (mentorshipPlansLoading) return <LoadingSpinner message="Loading mentorship plans..." />;
        return (
          <div>
            <h3>Mentorship Plans Management</h3>
            <p>Mentorship plans loaded: {mentorshipPlansData?.data?.length || 0}</p>
          </div>
        );
      
      case 'support':
        if (supportTicketsLoading) return <LoadingSpinner message="Loading support tickets..." />;
        return (
          <div>
            <h3>Support Tickets</h3>
            <p>Support tickets loaded: {supportTicketsData?.data?.length || 0}</p>
          </div>
        );
      
      case 'leaderboard':
        if (leaderboardLoading) return <LoadingSpinner message="Loading leaderboard..." />;
        return (
          <div>
            <h3>Leaderboard</h3>
            <p>Leaderboard entries loaded: {leaderboardData?.data?.length || 0}</p>
          </div>
        );
      
      default:
        return (
          <div>
            <h3>Admin Dashboard</h3>
            <p>Click on menu items to load specific data</p>
            <p>No API calls made until you click a menu item!</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Menu Navigation */}
      <div className="flex flex-wrap gap-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeMenu === item.id ? 'default' : 'outline'}
            onClick={() => setActiveMenu(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {/* Menu Content */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel - {menuItems.find(m => m.id === activeMenu)?.label}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderMenuContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanelExample;
