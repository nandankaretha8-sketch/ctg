import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL, authenticatedApiCall } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

const ChallengeManagement = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(false);
  const [challengeStatusFilter, setChallengeStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      setChallengesLoading(true);
      const response = await authenticatedApiCall('/admin/challenges', {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setChallenges(data.data || []);
      } else {
        console.error('Failed to fetch challenges');
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
    } finally {
      setChallengesLoading(false);
    }
  };

  const getChallengeStatus = (startDate: string, endDate: string, status: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (status === 'cancelled') return 'cancelled';
    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getFilteredChallenges = () => {
    if (challengeStatusFilter === 'all') return challenges;
    return challenges.filter(challenge => {
      const status = getChallengeStatus(challenge.startDate, challenge.endDate, challenge.status);
      return status === challengeStatusFilter;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleEditChallenge = (challenge: any) => {
    console.log('Edit challenge:', challenge);
    // Implement edit challenge functionality
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;
    
    try {
      const response = await authenticatedApiCall(`/admin/challenges/${challengeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setChallenges(challenges.filter(c => c._id !== challengeId));
      } else {
        console.error('Failed to delete challenge');
      }
    } catch (err) {
      console.error('Error deleting challenge:', err);
    }
  };

  const getGlassCardClasses = (additionalClasses = '') => {
    return `bg-white/5 backdrop-blur-md border-white/10 ${additionalClasses}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Challenges Management</h2>
          <p className="text-gray-300">Manage your trading challenges</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-purple-700 hover:to-pink-700 text-white text-sm px-3"
        >
          Add New
        </Button>
      </div>
      
      {/* Challenge Status Filter Dropdown */}
      <div className="mb-6">
        <Select value={challengeStatusFilter} onValueChange={setChallengeStatusFilter}>
          <SelectTrigger className="w-full md:w-64 bg-white/10 backdrop-blur-md border-white/20 text-white">
            <SelectValue placeholder="Filter challenges..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/20">
            <SelectItem value="all" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                All Challenges
              </div>
            </SelectItem>
            <SelectItem value="upcoming" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                Upcoming
              </div>
            </SelectItem>
            <SelectItem value="active" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                Active
              </div>
            </SelectItem>
            <SelectItem value="completed" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                Completed
              </div>
            </SelectItem>
            <SelectItem value="cancelled" className="text-white hover:bg-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                Cancelled
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Challenge Content */}
      <div className="mt-6">
        {challengesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className={getGlassCardClasses()}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-600 rounded mb-4"></div>
                    <div className="h-3 bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-600 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : getFilteredChallenges().length === 0 ? (
          <Card className={getGlassCardClasses()}>
            <CardContent className="p-12 text-center">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                {challengeStatusFilter === 'all' ? 'No Challenges Yet' : `No ${challengeStatusFilter.charAt(0).toUpperCase() + challengeStatusFilter.slice(1)} Challenges`}
              </h3>
              <p className="text-gray-400 mb-6">
                {challengeStatusFilter === 'all' 
                  ? 'Create your first trading challenge to get started'
                  : `No challenges found with ${challengeStatusFilter} status`
                }
              </p>
              {challengeStatusFilter === 'all' && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  Create First
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredChallenges().map((challenge) => {
              const status = getChallengeStatus(challenge.startDate, challenge.endDate, challenge.status);
              return (
                <Card key={challenge._id} className={`${getGlassCardClasses('hover:bg-white/10 transition-all duration-300')}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">{challenge.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(status)}/20 text-${getStatusBadgeColor(status).split('-')[1]}-400`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                            {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white hover:bg-white/10"
                          onClick={() => handleEditChallenge(challenge)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDeleteChallenge(challenge._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{challenge.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Account Size:</span>
                        <span className="text-white font-semibold">${challenge.accountSize.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Entry Price:</span>
                        <span className="text-white font-semibold">
                          {challenge.price === 0 ? 'Free' : `$${challenge.price}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Participants:</span>
                        <span className="text-white font-semibold">
                          {challenge.currentParticipants}/{challenge.maxParticipants}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white font-semibold">
                          {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeManagement;
