import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { SupabaseService } from '@/services/supabaseService';
import { formatCurrency } from '@/lib/trading';
import { Trophy, Medal, Award, Crown, TrendingUp, Star, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load leaderboard data
      const leaderboardData = await SupabaseService.getLeaderboard();
      
      if (leaderboardData && leaderboardData.length > 0) {
        setLeaderboard(leaderboardData);
      } else {
        // Fallback to mock data if no real data
        setLeaderboard(getMockLeaderboard());
      }

      // Load current user profile
      if (user) {
        try {
          const profile = await SupabaseService.getUserProfile(user.id);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Create fallback profile
            setUserProfile({
              id: user.id,
              username: user.email?.split('@')[0] || 'Anonymous',
              total_xp: 0,
              level: 1,
              balance: 10000
            });
          }
        } catch (profileError) {
          console.error('Error loading user profile:', profileError);
          setUserProfile({
            id: user.id,
            username: user.email?.split('@')[0] || 'Anonymous',
            total_xp: 0,
            level: 1,
            balance: 10000
          });
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setError('Failed to load leaderboard data');
      // Use fallback data
      setLeaderboard(getMockLeaderboard());
    } finally {
      setLoading(false);
    }
  };

  const getMockLeaderboard = () => [
    { id: '1', name: 'TradeMaster Pro', xp: 15000, level: 150, balance: 125000 },
    { id: '2', name: 'OptionWizard', xp: 12500, level: 125, balance: 118000 },
    { id: '3', name: 'BullMarket King', xp: 11000, level: 110, balance: 112000 },
    { id: '4', name: 'VolatilityHunter', xp: 9500, level: 95, balance: 108000 },
    { id: '5', name: 'DeltaGamma', xp: 8800, level: 88, balance: 105000 },
    { id: '6', name: 'StrikePrice', xp: 7600, level: 76, balance: 102000 },
    { id: '7', name: 'CallPutMaster', xp: 6900, level: 69, balance: 98000 },
    { id: '8', name: 'GreekGuru', xp: 6200, level: 62, balance: 95000 },
    { id: '9', name: 'ThetaDecay', xp: 5500, level: 55, balance: 92000 },
    { id: '10', name: 'IronCondor', xp: 4800, level: 48, balance: 88000 }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <Trophy className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 2: return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
      case 3: return 'bg-amber-600/20 text-amber-600 border-amber-600/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const currentUserRank = user && leaderboard.length > 0 
    ? leaderboard.findIndex(profile => profile.id === user.id) + 1 
    : 0;

  if (loading && leaderboard.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Loading Leaderboard</h2>
          <p className="text-muted-foreground">Fetching the latest rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">See how you stack up against other traders</p>
        </div>
        <div className="flex items-center space-x-4">
          {error && (
            <div className="flex items-center text-destructive">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Using offline data</span>
            </div>
          )}
          <Button onClick={loadData} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Your Rank</p>
            <p className="text-2xl font-bold text-accent">
              #{currentUserRank || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Your Stats */}
      <Card className="glow-trading">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2 text-accent" />
            Your Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-2xl font-bold text-primary">#{currentUserRank || 'N/A'}</p>
              </div>
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">XP</p>
                <p className="text-2xl font-bold text-accent">{userProfile.total_xp?.toLocaleString() || '0'}</p>
              </div>
              <div className="text-center p-4 bg-profit/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold text-profit">{userProfile.level || 1}</p>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className="text-2xl font-bold text-warning">{formatCurrency(userProfile.balance || 10000)}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <div className="text-center">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading your stats...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaderboard.slice(0, 3).map((topUser, index) => {
              const rank = index + 1;
              return (
                <div key={topUser.id || topUser.name} className={`text-center p-6 rounded-lg border-2 ${
                  rank === 1 ? 'border-yellow-400/50 bg-yellow-400/5' :
                  rank === 2 ? 'border-gray-400/50 bg-gray-400/5' :
                  'border-amber-600/50 bg-amber-600/5'
                }`}>
                  <div className="flex justify-center mb-4">
                    {getRankIcon(rank)}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{topUser.name || topUser.username || 'Anonymous'}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <Badge className={getRankBadge(rank)}>
                        Rank #{rank}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Level {topUser.level}</p>
                    <p className="text-lg font-bold text-accent">{(topUser.xp || topUser.total_xp || 0).toLocaleString()} XP</p>
                    <p className="text-sm font-medium">{formatCurrency(topUser.balance || 10000)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>All Traders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((leaderboardUser, index) => {
              const rank = index + 1;
              const isCurrentUser = user && leaderboardUser.id === user.id;
              
              return (
                <div 
                  key={leaderboardUser.id || leaderboardUser.name} 
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    isCurrentUser 
                      ? 'border-primary bg-primary/5 glow-trading' 
                      : 'border-border hover:bg-secondary/20'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10">
                      {rank <= 3 ? (
                        getRankIcon(rank)
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className={`font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                          {leaderboardUser.name || leaderboardUser.username || 'Anonymous'}
                        </h3>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Level {leaderboardUser.level} Trader</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">XP</p>
                      <p className="font-bold text-accent">{(leaderboardUser.xp || leaderboardUser.total_xp || 0).toLocaleString()}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="font-bold">{formatCurrency(leaderboardUser.balance || 10000)}</p>
                    </div>
                    
                    <div className="flex items-center">
                      {(leaderboardUser.balance || 10000) > 10000 ? (
                        <TrendingUp className="h-5 w-5 text-profit" />
                      ) : (
                        <div className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Highest XP</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="text-2xl font-bold text-accent">
              {Math.max(...leaderboard.map(u => u.xp || u.total_xp || 0)).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              by {leaderboard.find(u => (u.xp || u.total_xp || 0) === Math.max(...leaderboard.map(user => user.xp || user.total_xp || 0)))?.name || 'Anonymous'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Highest Balance</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Star className="h-8 w-8 text-profit mx-auto mb-2" />
            <p className="text-2xl font-bold text-profit">
              {formatCurrency(Math.max(...leaderboard.map(u => u.balance || 10000)))}
            </p>
            <p className="text-sm text-muted-foreground">
              by {leaderboard.find(u => (u.balance || 10000) === Math.max(...leaderboard.map(user => user.balance || 10000)))?.name || 'Anonymous'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Active Traders</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Award className="h-8 w-8 text-warning mx-auto mb-2" />
            <p className="text-2xl font-bold text-warning">{leaderboard.length}</p>
            <p className="text-sm text-muted-foreground">Total participants</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}