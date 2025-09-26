import React, { useState } from 'react';
import { useActionPageData } from '@/hooks/usePageData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

// Example: How to convert ChallengeDetails to action-based loading
const ChallengeDetailsExample = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  // Only load when specific tab is active
  const { 
    data: challengeData, 
    isLoading: challengeLoading 
  } = useActionPageData(
    ['challenge-details'],
    '/challenges/123', // Replace with actual challenge ID
    activeTab === 'overview'
  );

  // Only load when user clicks "Show Leaderboard"
  const { 
    data: leaderboardData, 
    isLoading: leaderboardLoading 
  } = useActionPageData(
    ['challenge-leaderboard'],
    '/challenges/123/leaderboard',
    showLeaderboard
  );

  // Only load when user clicks "Show Account"
  const { 
    data: accountData, 
    isLoading: accountLoading 
  } = useActionPageData(
    ['challenge-account'],
    '/challenges/123/account',
    showAccount
  );

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'leaderboard', label: 'Leaderboard' },
    { id: 'account', label: 'Account' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        if (challengeLoading) return <LoadingSpinner message="Loading challenge details..." />;
        return (
          <div>
            <h3>Challenge Overview</h3>
            <p>Challenge loaded: {challengeData?.data?.name || 'Loading...'}</p>
          </div>
        );
      
      case 'leaderboard':
        return (
          <div>
            <Button 
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="mb-4"
            >
              {showLeaderboard ? 'Hide' : 'Show'} Leaderboard
            </Button>
            
            {showLeaderboard && (
              <div>
                {leaderboardLoading ? (
                  <LoadingSpinner message="Loading leaderboard..." />
                ) : (
                  <p>Leaderboard entries loaded: {leaderboardData?.data?.length || 0}</p>
                )}
              </div>
            )}
          </div>
        );
      
      case 'account':
        return (
          <div>
            <Button 
              onClick={() => setShowAccount(!showAccount)}
              className="mb-4"
            >
              {showAccount ? 'Hide' : 'Show'} Account Details
            </Button>
            
            {showAccount && (
              <div>
                {accountLoading ? (
                  <LoadingSpinner message="Loading account details..." />
                ) : (
                  <p>Account details loaded: {accountData?.data?.accountId || 'Loading...'}</p>
                )}
              </div>
            )}
          </div>
        );
      
      default:
        return <div>Select a tab to view content</div>;
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
          <CardTitle>Challenge Details - {tabs.find(t => t.id === activeTab)?.label}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderTabContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengeDetailsExample;
