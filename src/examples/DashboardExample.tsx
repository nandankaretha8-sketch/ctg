import React, { useState } from 'react';
import { useTabPageData } from '@/hooks/usePageData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

// Example: How to convert Dashboard to tab-based loading
const DashboardExample = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Only load data when specific tab is active
  const { 
    data: challengesData, 
    isLoading: challengesLoading 
  } = useTabPageData(
    ['user-challenges'],
    '/challenges/user/my-challenges',
    activeTab,
    'challenges'
  );

  const { 
    data: signalData, 
    isLoading: signalLoading 
  } = useTabPageData(
    ['signal-subscriptions'],
    '/signal-plans/user/subscriptions',
    activeTab,
    'signals'
  );

  const { 
    data: mentorshipData, 
    isLoading: mentorshipLoading 
  } = useTabPageData(
    ['mentorship-subscriptions'],
    '/mentorship-plans/user/subscriptions',
    activeTab,
    'mentorships'
  );

  const { 
    data: propFirmData, 
    isLoading: propFirmLoading 
  } = useTabPageData(
    ['prop-firm-services'],
    '/prop-firm-services/my-services',
    activeTab,
    'prop-firms'
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'challenges', label: 'Challenges' },
    { id: 'signals', label: 'Signals' },
    { id: 'mentorships', label: 'Mentorships' },
    { id: 'prop-firms', label: 'Prop Firms' },
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
      
      case 'prop-firms':
        if (propFirmLoading) return <LoadingSpinner message="Loading prop firms..." />;
        return (
          <div>
            <h3>Your Prop Firm Services</h3>
            <p>Prop firm services loaded: {propFirmData?.data?.length || 0}</p>
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
            variant={activeTab === tab.id ? 'default' : 'outline'}
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

export default DashboardExample;
