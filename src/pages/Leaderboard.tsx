import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TradingStore } from '@/lib/store';
import { formatCurrency } from '@/lib/trading';
import { Trophy, Medal, Award, Crown, TrendingUp, Star } from 'lucide-react';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState(TradingStore.getLeaderboard());
  const [currentUser] = useState(TradingStore.getUser());

  useEffect(() => {
    const interval = setInterval(() => {
      setLeaderboard(TradingStore.getLeaderboard());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const currentUserRank = leaderboard.findIndex(user => user.name === currentUser.name) + 1;

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
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Your Rank</p>
          <p className="text-2xl font-bold text-accent">#{currentUserRank}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Rank</p>
              <p className="text-2xl font-bold text-primary">#{currentUserRank}</p>
            </div>
            <div className="text-center p-4 bg-accent/10 rounded-lg">
              <p className="text-sm text-muted-foreground">XP</p>
              <p className="text-2xl font-bold text-accent">{currentUser.xp.toLocaleString()}</p>
            </div>
            <div className="text-center p-4 bg-profit/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Level</p>
              <p className="text-2xl font-bold text-profit">{currentUser.level}</p>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold text-warning">{formatCurrency(currentUser.balance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaderboard.slice(0, 3).map((user, index) => {
              const rank = index + 1;
              return (
                <div key={user.name} className={`text-center p-6 rounded-lg border-2 ${
                  rank === 1 ? 'border-yellow-400/50 bg-yellow-400/5' :
                  rank === 2 ? 'border-gray-400/50 bg-gray-400/5' :
                  'border-amber-600/50 bg-amber-600/5'
                }`}>
                  <div className="flex justify-center mb-4">
                    {getRankIcon(rank)}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{user.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-center">
                      <Badge className={getRankBadge(rank)}>
                        Rank #{rank}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Level {user.level}</p>
                    <p className="text-lg font-bold text-accent">{user.xp.toLocaleString()} XP</p>
                    <p className="text-sm font-medium">{formatCurrency(user.balance)}</p>
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
            {leaderboard.map((user, index) => {
              const rank = index + 1;
              const isCurrentUser = user.name === currentUser.name;
              
              return (
                <div 
                  key={user.name} 
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
                          {user.name}
                        </h3>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Level {user.level} Trader</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">XP</p>
                      <p className="font-bold text-accent">{user.xp.toLocaleString()}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Balance</p>
                      <p className="font-bold">{formatCurrency(user.balance)}</p>
                    </div>
                    
                    <div className="flex items-center">
                      {user.balance > 10000 ? (
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
            <p className="text-2xl font-bold text-accent">{Math.max(...leaderboard.map(u => u.xp)).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              by {leaderboard.find(u => u.xp === Math.max(...leaderboard.map(user => user.xp)))?.name}
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
              {formatCurrency(Math.max(...leaderboard.map(u => u.balance)))}
            </p>
            <p className="text-sm text-muted-foreground">
              by {leaderboard.find(u => u.balance === Math.max(...leaderboard.map(user => user.balance)))?.name}
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