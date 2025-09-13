import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { SupabaseService } from '@/services/supabaseService';
import { getCurrentLevelProgress } from '@/lib/trading';
import { formatCurrency, formatPercentage } from '@/lib/trading';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import WelcomeToLearning from '@/components/WelcomeToLearning';

export default function Dashboard() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [portfolioHistory] = useState(() => {
    // Generate mock portfolio history
    const data = [];
    let value = 10000;
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      value += (Math.random() - 0.5) * 200;
      data.push({
        date: date.toLocaleDateString(),
        value: Math.round(value),
        pnl: value - 10000
      });
    }
    return data;
  });

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from Supabase first
      let profile = await SupabaseService.getUserProfile(user.id);
      
      // If profile doesn't exist, try to create it
      if (!profile) {
        console.log('Creating new user profile...');
        try {
          await SupabaseService.createUserProfile({
            id: user.id,
            username: user.email?.split('@')[0] || 'User',
            balance: 10000,
            total_xp: 0,
            level: 1
          });
          profile = await SupabaseService.getUserProfile(user.id);
        } catch (createError) {
          console.error('Error creating profile:', createError);
          // Fallback to local profile
          profile = {
            id: user.id,
            username: user.email?.split('@')[0] || 'User',
            balance: 10000,
            total_xp: 0,
            level: 1,
            created_at: new Date().toISOString()
          };
        }
      }
      
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Fallback to local profile if database fails
      const fallbackProfile = {
        id: user.id,
        username: user.email?.split('@')[0] || 'User',
        balance: 10000,
        total_xp: 0,
        level: 1,
        created_at: new Date().toISOString()
      };
      setUserProfile(fallbackProfile);
      console.log('Using fallback profile due to database error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => loadUserProfile()}>Try Again</Button>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">Unable to load profile data.</p>
        <Button onClick={() => loadUserProfile()}>Retry</Button>
      </div>
    );
  }

  const levelProgress = getCurrentLevelProgress(userProfile.total_xp || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Trading Dashboard
        </h1>
        <p className="text-muted-foreground mb-4">Welcome back, {userProfile.username}</p>
        <div className="text-sm text-muted-foreground">
          Level {userProfile.level || 1} • {(userProfile.total_xp || 0).toLocaleString()} XP
        </div>
      </div>

      {/* XP Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Level Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span>Level {(userProfile.level || 1) + 1}</span>
            <span className="text-muted-foreground">{levelProgress.current} / {levelProgress.required} XP</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full"
              style={{ width: `${levelProgress.progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(userProfile.balance || 10000)}</div>
            <p className="text-xs text-muted-foreground">+2.1% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Currently open trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(0)} overall
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProfile.level || 1}</div>
            <p className="text-xs text-muted-foreground">{levelProgress.required - levelProgress.current} XP to next level</p>
          </CardContent>
        </Card>
      </div>

      {/* Welcome to Learning - Show for new users */}
      {(userProfile?.level || 1) <= 3 && (
        <WelcomeToLearning userLevel={userProfile?.level || 1} />
      )}

      {/* Portfolio Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={portfolioHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No positions yet. Start trading to see your portfolio!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}