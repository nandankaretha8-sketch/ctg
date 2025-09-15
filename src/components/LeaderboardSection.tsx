import { Trophy, TrendingUp, Award } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Alex Thompson", profit: "+$45,250", percentage: "+18.5%", country: "🇺🇸" },
  { rank: 2, name: "Maria Rodriguez", profit: "+$42,180", percentage: "+16.8%", country: "🇪🇸" },
  { rank: 3, name: "James Chen", profit: "+$38,920", percentage: "+15.2%", country: "🇸🇬" },
  { rank: 4, name: "Sarah Johnson", profit: "+$35,760", percentage: "+14.1%", country: "🇨🇦" },
  { rank: 5, name: "Ahmed Hassan", profit: "+$33,450", percentage: "+13.6%", country: "🇦🇪" },
  { rank: 6, name: "Lisa Wang", profit: "+$31,280", percentage: "+12.9%", country: "🇭🇰" },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-400" />;
    case 2:
      return <Award className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-gray-400">#{rank}</span>;
  }
};

const LeaderboardSection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Live Leaderboard</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See how you rank against top traders from around the world
          </p>
        </div>
        
        <div className="glass-card p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Top Performers
            </h3>
            <div className="text-sm text-gray-400">
              Last updated: 2 minutes ago
            </div>
          </div>
          
          <div className="space-y-4">
            {leaderboardData.map((trader, index) => (
              <div 
                key={trader.rank}
                className={`
                  leaderboard-glow rank-${trader.rank <= 3 ? trader.rank : 'default'}
                  flex items-center justify-between p-4 rounded-lg
                  transition-all duration-300 hover:scale-[1.02]
                  ${trader.rank <= 3 ? 'glass-card' : 'bg-muted/30 hover:bg-muted/50'}
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10">
                    {getRankIcon(trader.rank)}
                  </div>
                  
                  <div>
                    <div className="font-semibold text-white flex items-center gap-2">
                      {trader.name}
                      <span className="text-lg">{trader.country}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-green-400 text-lg">
                    {trader.profit}
                  </div>
                  <div className="text-sm text-gray-400">
                    {trader.percentage}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Want to see your name here? <span className="gradient-text font-semibold">Join the challenge today!</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;