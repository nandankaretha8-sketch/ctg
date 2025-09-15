import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Trophy, Target, TrendingUp, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, hsl(230 35% 8%) 0%, hsl(250 45% 12%) 50%, hsl(230 35% 8%) 100%)' }}>
      {/* Header */}
      <div className="w-full p-6 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Welcome back, {user?.firstName || user?.username}!
            </h1>
            <p className="text-gray-300 text-lg">
              Track your trading progress and manage your competitions
            </p>
          </div>
          <Link to="/">
            <Button variant="hero" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-glass-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Competitions
              </CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {user?.tradingStats?.totalChallenges || 0}
              </div>
              <p className="text-xs text-gray-400">
                Competitions participated
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Completed
              </CardTitle>
              <Trophy className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {user?.tradingStats?.completedChallenges || 0}
              </div>
              <p className="text-xs text-gray-400">
                Successfully completed
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Total Profit
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${user?.tradingStats?.totalProfit?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-gray-400">
                Total earnings
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass-border/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Win Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {user?.tradingStats?.winRate || 0}%
              </div>
              <p className="text-xs text-gray-400">
                Success rate
              </p>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
