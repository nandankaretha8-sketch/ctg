import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Trophy, BarChart3, DollarSign, TrendingUp, Clock, CheckCircle, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL, authenticatedApiCall } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalChallenges: number;
  activeChallenges: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
}

interface AdminDashboardProps {
  onNavigate?: (section: string) => void;
}

const AdminDashboard = ({ onNavigate }: AdminDashboardProps) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await authenticatedApiCall('/admin/stats', {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data.data);
        } else {
          setError('Failed to fetch admin statistics');
        }
      } catch (err) {
        setError('Error fetching admin statistics');
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <LoadingSpinner message="Loading admin dashboard..." size="lg" fullScreen={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user?.firstName}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <div className="mt-2">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  {stats?.activeUsers || 0} Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Challenges</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalChallenges || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-yellow-400" />
              </div>
              <div className="mt-2">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {stats?.activeChallenges || 0} Active
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${stats?.totalRevenue?.toLocaleString() || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-400" />
              </div>
              <div className="mt-2">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  ${stats?.monthlyRevenue?.toLocaleString() || 0} This Month
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Subscriptions</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalSubscriptions || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-400" />
              </div>
              <div className="mt-2">
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  {stats?.activeSubscriptions || 0} Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                Analytics
              </CardTitle>
              <CardDescription className="text-gray-400">
                View detailed analytics and reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => onNavigate?.('analytics')}
              >
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-400" />
                User Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage users and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => onNavigate?.('users')}
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2 text-purple-400" />
                Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Configure system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => onNavigate?.('settings')}
              >
                Open Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
