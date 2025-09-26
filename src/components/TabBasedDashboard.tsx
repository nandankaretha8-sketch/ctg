import React, { useState } from 'react';
import { useTabBasedQuery } from '@/hooks/useConditionalQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

// Example of how to implement tab-based loading
const TabBasedDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Only load data when specific tab is active
  const { 
    data: challengesData, 
    isLoading: challengesLoading 
  } = useTabBasedQuery(
    ['user-challenges'],
    '/challenges/user/my-challenges',
    activeTab,
    'challenges', // Only load when challenges tab is active
    { 
      staleTime: 10 * 1000,
      gcTime: 2 * 60 * 1000,
    }
  );

  const { 
    data: signalData, 
    isLoading: signalLoading 
  } = useTabBasedQuery(
    ['signal-subscriptions'],
    '/signal-plans/user/subscriptions',
    activeTab,
    'signals', // Only load when signals tab is active
    { 
      staleTime: 5 * 1000,
      gcTime: 1 * 60 * 1000,
    }
  );

  const { 
    data: mentorshipData, 
    isLoading: mentorshipLoading 
  } = useTabBasedQuery(
    ['mentorship-subscriptions'],
    '/mentorship-plans/user/subscriptions',
    activeTab,
    'mentorships', // Only load when mentorships tab is active
    { 
      staleTime: 5 * 1000,
      gcTime: 1 * 60 * 1000,
    }
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'signals', label: 'Signals' },
    { id: 'mentorships', label: 'Mentorships' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'challenges':
        if (challengesLoading) return <LoadingSpinner message="Loading challenges..." />;
        return (
          <div>
            <h3>Your Challenges</h3>
            <p>Challenges loaded: {challengesData?.data?.length || 0}</p>
          </div>
        );
      
      case 'signals':
        if (signalLoading) return <LoadingSpinner message="Loading signals..." />;
        return (
          <div>
            <h3>Your Signal Plans</h3>
            <p>Signal plans loaded: {signalData?.data?.length || 0}</p>
          </div>
        );
      
      case 'mentorships':
        if (mentorshipLoading) return <LoadingSpinner message="Loading mentorships..." />;
        return (
          <div>
            <h3>Your Mentorships</h3>
            <p>Mentorships loaded: {mentorshipData?.data?.length || 0}</p>
          </div>
        );
      
      default:
        return (
          <div>
            <h3>Dashboard Overview</h3>
            <p>Click on tabs to load specific data</p>
            <p>No API calls made until you click a tab!</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Content</CardTitle>
        </CardHeader>
        <CardContent>
          {renderTabContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default TabBasedDashboard;
