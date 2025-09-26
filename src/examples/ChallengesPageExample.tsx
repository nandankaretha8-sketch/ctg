import React, { useState } from 'react';
import { useManualPageData } from '@/hooks/usePageData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/LoadingSpinner';

// Example: How to convert Challenges page to manual loading
const ChallengesPageExample = () => {
  const [showUserChallenges, setShowUserChallenges] = useState(false);

  // Only load when user clicks "Load Challenges"
  const { 
    data: challengesData, 
    isLoading: challengesLoading,
    triggerLoad: loadChallenges,
    hasLoaded: challengesLoaded
  } = useManualPageData(
    ['challenges'],
    '/challenges?status=active,upcoming,completed'
  );

  // Only load when user clicks "Load My Challenges"
  const { 
    data: userChallengesData, 
    isLoading: userChallengesLoading,
    triggerLoad: loadUserChallenges,
    hasLoaded: userChallengesLoaded
  } = useManualPageData(
    ['user-challenges'],
    '/challenges/user/my-challenges'
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>All Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={loadChallenges} 
            disabled={challengesLoading}
            className="mb-4"
          >
            {challengesLoading ? 'Loading...' : 'Load All Challenges'}
          </Button>
          
          {challengesLoaded && (
            <div>
              <p>Challenges loaded: {challengesData?.data?.length || 0}</p>
              {/* Render challenges here */}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={loadUserChallenges} 
            disabled={userChallengesLoading}
            className="mb-4"
          >
            {userChallengesLoading ? 'Loading...' : 'Load My Challenges'}
          </Button>
          
          {userChallengesLoaded && (
            <div>
              <p>My challenges loaded: {userChallengesData?.data?.length || 0}</p>
              {/* Render user challenges here */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChallengesPageExample;
