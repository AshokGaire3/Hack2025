import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TradingStore } from '@/lib/store';
import { User, formatCurrency, formatPercentage } from '@/lib/trading';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Award, Zap } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState<User>(TradingStore.getUser());
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

  const xpProgress = (user.xp % 1000) / 1000 * 100;
  const nextLevelXp = user.level * 1000;

  useEffect(() => {
    const interval = setInterval(() => {
      setUser(TradingStore.getUser());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Trading Dashboard
          </h1>
          <p className="text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Level {user.level}</p>
            <p className="text-2xl font-bold text-accent">{user.xp.toLocaleString()} XP</p>
          </div>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent p-1">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <Award className="w-8 h-8 text-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <Card className="glow-trading">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress to Level {user.level + 1}</span>
            <span className="text-sm text-muted-foreground">{user.xp % 1000} / 1000 XP</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(user.balance)}</div>
            <p className="text-xs text-profit flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.1% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.portfolio.positions.filter(p => p.status === 'open').length}</div>
            <p className="text-xs text-muted-foreground">Currently open trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-profit" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-profit">{formatCurrency(user.portfolio.totalPnL)}</div>
            <p className="text-xs text-profit">
              {formatPercentage((user.portfolio.totalPnL / 10000) * 100)} overall
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{user.level}</div>
            <p className="text-xs text-muted-foreground">{1000 - (user.xp % 1000)} XP to next level</p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={portfolioHistory}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Positions</CardTitle>
        </CardHeader>
        <CardContent>
          {user.portfolio.positions.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No positions yet. Start trading to see your portfolio!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {user.portfolio.positions.slice(-3).map((position) => (
                <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{position.symbol} {position.strike} {position.optionType.toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">{position.contracts} contracts • {position.expiry}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${position.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {formatCurrency(position.pnl)}
                    </p>
                    <p className="text-sm text-muted-foreground">{position.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}