import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3, TrendingUp, Users, DollarSign, Trophy, Calendar, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL, authenticatedApiCall } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalChallenges: number;
    activeChallenges: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
  };
  userGrowth: Array<{
    date: string;
    users: number;
    newUsers: number;
  }>;
  revenueData: Array<{
    date: string;
    revenue: number;
    challenges: number;
    subscriptions: number;
  }>;
  topPerformers: Array<{
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    totalProfit: number;
    winRate: number;
    totalTrades: number;
  }>;
  challengeStats: Array<{
    challenge: {
      title: string;
      accountSize: number;
    };
    participants: number;
    completionRate: number;
    averageProfit: number;
  }>;
}

const Analytics = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await authenticatedApiCall(`/admin/analytics?range=${timeRange}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
      } else {
        setError('Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Error fetching analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await authenticatedApiCall(`/admin/analytics/export?range=${timeRange}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to export data');
      }
    } catch (err) {
      setError('Error exporting data');
      console.error('Error exporting data:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <LoadingSpinner message="Loading analytics..." size="lg" fullScreen={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Analytics</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Data Available</h2>
          <p className="text-gray-400 mb-4">No analytics data found for the selected time range.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <BarChart3 className="h-8 w-8 text-purple-400 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
                <p className="text-gray-400">Platform performance and user insights</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button
                variant="outline"
                onClick={fetchAnalytics}
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={exportData}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{analyticsData.overview.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-400">+{analyticsData.overview.activeUsers} active</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${analyticsData.overview.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-400">+${analyticsData.overview.monthlyRevenue.toLocaleString()} this month</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Challenges</p>
                  <p className="text-2xl font-bold text-white">{analyticsData.overview.totalChallenges}</p>
                  <p className="text-xs text-blue-400">{analyticsData.overview.activeChallenges} active</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Subscriptions</p>
                  <p className="text-2xl font-bold text-white">{analyticsData.overview.totalSubscriptions}</p>
                  <p className="text-xs text-purple-400">{analyticsData.overview.activeSubscriptions} active</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performers */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Top Performers
            </CardTitle>
            <CardDescription className="text-gray-400">
              Users with the highest trading performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topPerformers.map((performer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">
                        {performer.user.firstName} {performer.user.lastName}
                      </h3>
                      <p className="text-gray-400 text-sm">{performer.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="text-gray-400">Profit</p>
                      <p className="text-white font-medium">${performer.totalProfit.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">Win Rate</p>
                      <p className="text-white font-medium">{performer.winRate.toFixed(1)}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400">Trades</p>
                      <p className="text-white font-medium">{performer.totalTrades}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Challenge Statistics */}
        <Card className="bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Challenge Statistics
            </CardTitle>
            <CardDescription className="text-gray-400">
              Performance metrics for each challenge
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.challengeStats.map((challenge, index) => (
                <div
                  key={index}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{challenge.challenge.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      ${challenge.challenge.accountSize.toLocaleString()} Account
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{challenge.participants}</p>
                      <p className="text-sm text-gray-400">Participants</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{challenge.completionRate.toFixed(1)}%</p>
                      <p className="text-sm text-gray-400">Completion Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">${challenge.averageProfit.toFixed(2)}</p>
                      <p className="text-sm text-gray-400">Avg Profit</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
