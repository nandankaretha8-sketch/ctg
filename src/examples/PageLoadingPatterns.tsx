import React, { useState } from 'react';
import { usePageData, useTabPageData, useManualPageData, useActionPageData } from '@/hooks/usePageData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

// ========================================
// PATTERN 1: TAB-BASED LOADING
// ========================================
const TabBasedPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Only load when specific tab is active
  const { 
    data: challengesData, 
    isLoading: challengesLoading 
  } = useTabPageData(
    ['challenges'],
    '/challenges',
    activeTab,
    'challenges'
  );

  const { 
    data: signalsData, 
    isLoading: signalsLoading 
  } = useTabPageData(
    ['signals'],
    '/signal-plans',
    activeTab,
    'signals'
  );

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={activeTab === 'challenges' ? 'default' : 'outline'}
          onClick={() => setActiveTab('challenges')}
        >
          Challenges
        </Button>
        <Button 
          variant={activeTab === 'signals' ? 'default' : 'outline'}
          onClick={() => setActiveTab('signals')}
        >
          Signals
        </Button>
      </div>

      {activeTab === 'challenges' && (
        <Card>
          <CardHeader>
            <CardTitle>Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            {challengesLoading ? (
              <LoadingSpinner message="Loading challenges..." />
            ) : (
              <p>Challenges loaded: {challengesData?.data?.length || 0}</p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'signals' && (
        <Card>
          <CardHeader>
            <CardTitle>Signals</CardTitle>
          </CardHeader>
          <CardContent>
            {signalsLoading ? (
              <LoadingSpinner message="Loading signals..." />
            ) : (
              <p>Signals loaded: {signalsData?.data?.length || 0}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ========================================
// PATTERN 2: MANUAL LOADING
// ========================================
const ManualLoadingPage = () => {
  const { 
    data: challengesData, 
    isLoading: challengesLoading,
    triggerLoad: loadChallenges,
    hasLoaded: challengesLoaded
  } = useManualPageData(
    ['challenges'],
    '/challenges'
  );

  const { 
    data: signalsData, 
    isLoading: signalsLoading,
    triggerLoad: loadSignals,
    hasLoaded: signalsLoaded
  } = useManualPageData(
    ['signals'],
    '/signal-plans'
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={loadChallenges} 
            disabled={challengesLoading}
            className="mb-4"
          >
            {challengesLoading ? 'Loading...' : 'Load Challenges'}
          </Button>
          
          {challengesLoaded && (
            <p>Challenges loaded: {challengesData?.data?.length || 0}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={loadSignals} 
            disabled={signalsLoading}
            className="mb-4"
          >
            {signalsLoading ? 'Loading...' : 'Load Signals'}
          </Button>
          
          {signalsLoaded && (
            <p>Signals loaded: {signalsData?.data?.length || 0}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ========================================
// PATTERN 3: ACTION-BASED LOADING
// ========================================
const ActionBasedPage = () => {
  const [showChallenges, setShowChallenges] = useState(false);
  const [showSignals, setShowSignals] = useState(false);

  // Only load when user clicks "Show Challenges"
  const { 
    data: challengesData, 
    isLoading: challengesLoading 
  } = useActionPageData(
    ['challenges'],
    '/challenges',
    showChallenges
  );

  // Only load when user clicks "Show Signals"
  const { 
    data: signalsData, 
    isLoading: signalsLoading 
  } = useActionPageData(
    ['signals'],
    '/signal-plans',
    showSignals
  );

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button onClick={() => setShowChallenges(!showChallenges)}>
          {showChallenges ? 'Hide' : 'Show'} Challenges
        </Button>
        <Button onClick={() => setShowSignals(!showSignals)}>
          {showSignals ? 'Hide' : 'Show'} Signals
        </Button>
      </div>

      {showChallenges && (
        <Card>
          <CardHeader>
            <CardTitle>Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            {challengesLoading ? (
              <LoadingSpinner message="Loading challenges..." />
            ) : (
              <p>Challenges loaded: {challengesData?.data?.length || 0}</p>
            )}
          </CardContent>
        </Card>
      )}

      {showSignals && (
        <Card>
          <CardHeader>
            <CardTitle>Signals</CardTitle>
          </CardHeader>
          <CardContent>
            {signalsLoading ? (
              <LoadingSpinner message="Loading signals..." />
            ) : (
              <p>Signals loaded: {signalsData?.data?.length || 0}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ========================================
// PATTERN 4: PROGRESSIVE LOADING
// ========================================
const ProgressiveLoadingPage = () => {
  const [loadStep, setLoadStep] = useState(0);

  // Load data progressively based on user interaction
  const { 
    data: challengesData, 
    isLoading: challengesLoading 
  } = useActionPageData(
    ['challenges'],
    '/challenges',
    loadStep >= 1
  );

  const { 
    data: signalsData, 
    isLoading: signalsLoading 
  } = useActionPageData(
    ['signals'],
    '/signal-plans',
    loadStep >= 2
  );

  const { 
    data: mentorshipsData, 
    isLoading: mentorshipsLoading 
  } = useActionPageData(
    ['mentorships'],
    '/mentorship-plans',
    loadStep >= 3
  );

  const nextStep = () => {
    setLoadStep(prev => prev + 1);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Progressive Loading</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Step {loadStep} of 3</p>
          <Button onClick={nextStep} disabled={loadStep >= 3}>
            Load Next Section
          </Button>
        </CardContent>
      </Card>

      {loadStep >= 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            {challengesLoading ? (
              <LoadingSpinner message="Loading challenges..." />
            ) : (
              <p>Challenges loaded: {challengesData?.data?.length || 0}</p>
            )}
          </CardContent>
        </Card>
      )}

      {loadStep >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Signals</CardTitle>
          </CardHeader>
          <CardContent>
            {signalsLoading ? (
              <LoadingSpinner message="Loading signals..." />
            ) : (
              <p>Signals loaded: {signalsData?.data?.length || 0}</p>
            )}
          </CardContent>
        </Card>
      )}

      {loadStep >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Mentorships</CardTitle>
          </CardHeader>
          <CardContent>
            {mentorshipsLoading ? (
              <LoadingSpinner message="Loading mentorships..." />
            ) : (
              <p>Mentorships loaded: {mentorshipsData?.data?.length || 0}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================
const PageLoadingPatterns = () => {
  const [activePattern, setActivePattern] = useState('tab');

  const patterns = [
    { id: 'tab', label: 'Tab-Based Loading', component: TabBasedPage },
    { id: 'manual', label: 'Manual Loading', component: ManualLoadingPage },
    { id: 'action', label: 'Action-Based Loading', component: ActionBasedPage },
    { id: 'progressive', label: 'Progressive Loading', component: ProgressiveLoadingPage },
  ];

  const ActiveComponent = patterns.find(p => p.id === activePattern)?.component || TabBasedPage;

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        {patterns.map((pattern) => (
          <Button
            key={pattern.id}
            variant={activePattern === pattern.id ? 'default' : 'outline'}
            onClick={() => setActivePattern(pattern.id)}
          >
            {pattern.label}
          </Button>
        ))}
      </div>

      <ActiveComponent />
    </div>
  );
};

export default PageLoadingPatterns;
