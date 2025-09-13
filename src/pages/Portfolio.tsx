import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TradingStore } from '@/lib/store';
import { User, formatCurrency, formatPercentage, blackScholes } from '@/lib/trading';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, X, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Portfolio() {
  const [user, setUser] = useState<User>(TradingStore.getUser());

  useEffect(() => {
    const interval = setInterval(() => {
      // Update portfolio values with simulated market movements
      const updatedUser = TradingStore.getUser();
      
      // Simulate price changes for open positions
      updatedUser.portfolio.positions.forEach(position => {
        if (position.status === 'open') {
          // Simulate current option value with random price movement
          const mockCurrentPrice = 150 + (Math.random() - 0.5) * 20; // Mock stock price
          const timeDecay = Math.max(0, new Date(position.expiry).getTime() - Date.now()) / (365 * 24 * 60 * 60 * 1000);
          
          position.currentValue = blackScholes({
            stockPrice: mockCurrentPrice,
            strikePrice: position.strike,
            timeToExpiry: timeDecay,
            riskFreeRate: 0.05,
            volatility: 0.25,
            optionType: position.optionType
          });
          
          position.pnl = (position.currentValue - position.premiumPaid) * position.contracts * 100;
        }
      });

      // Update portfolio totals
      const totalPnL = updatedUser.portfolio.positions.reduce((sum, pos) => sum + pos.pnl, 0);
      updatedUser.portfolio.totalPnL = totalPnL;
      updatedUser.portfolio.totalValue = updatedUser.portfolio.cashBalance + 
        updatedUser.portfolio.positions
          .filter(p => p.status === 'open')
          .reduce((sum, pos) => sum + pos.currentValue * pos.contracts * 100, 0);

      TradingStore.saveUser(updatedUser);
      setUser(updatedUser);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const closePosition = (positionId: string) => {
    const position = user.portfolio.positions.find(p => p.id === positionId);
    if (position) {
      const updatedUser = TradingStore.closePosition(positionId, position.currentValue);
      setUser(updatedUser);
      
      toast({
        title: "Position Closed",
        description: `Closed ${position.symbol} ${position.strike} ${position.optionType.toUpperCase()} for ${formatCurrency(position.currentValue * position.contracts * 100)}`,
      });
    }
  };

  const openPositions = user.portfolio.positions.filter(p => p.status === 'open');
  const closedPositions = user.portfolio.positions.filter(p => p.status === 'closed');

  // Prepare chart data
  const performanceData = user.portfolio.positions
    .filter(p => p.status === 'closed')
    .map(position => ({
      name: `${position.symbol} ${position.strike} ${position.optionType.toUpperCase()}`,
      pnl: position.pnl,
      returns: (position.pnl / (position.premiumPaid * position.contracts * 100)) * 100
    }));

  const allocationData = openPositions.map(position => ({
    name: `${position.symbol} ${position.strike} ${position.optionType.toUpperCase()}`,
    value: position.currentValue * position.contracts * 100,
    contracts: position.contracts
  }));

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--profit))', 'hsl(var(--warning))', 'hsl(var(--loss))'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Portfolio
          </h1>
          <p className="text-muted-foreground">Track your trading performance and positions</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(user.portfolio.totalValue)}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(user.portfolio.cashBalance)}</div>
            <p className="text-xs text-muted-foreground">Available for trading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openPositions.length}</div>
            <p className="text-xs text-muted-foreground">Active contracts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {user.portfolio.totalPnL >= 0 ? (
              <TrendingUp className="h-4 w-4 text-profit" />
            ) : (
              <TrendingDown className="h-4 w-4 text-loss" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${user.portfolio.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatCurrency(user.portfolio.totalPnL)}
            </div>
            <p className={`text-xs ${user.portfolio.totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
              {formatPercentage((user.portfolio.totalPnL / 10000) * 100)} overall
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {closedPositions.length > 0 
                ? Math.round((closedPositions.filter(p => p.pnl > 0).length / closedPositions.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {closedPositions.filter(p => p.pnl > 0).length} of {closedPositions.length} trades
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {performanceData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Trade Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'P&L']}
                  />
                  <Bar dataKey="pnl" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {allocationData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Position Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Open Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          {openPositions.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No open positions. Start trading to build your portfolio!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {openPositions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{position.symbol} {position.strike} {position.optionType.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {position.contracts} contracts • Expires {position.expiry}
                      </p>
                    </div>
                    <Badge variant={position.optionType === 'call' ? 'default' : 'secondary'}>
                      {position.optionType}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Premium Paid</p>
                      <p className="font-medium">{formatCurrency(position.premiumPaid)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Current Value</p>
                      <p className="font-medium">{formatCurrency(position.currentValue)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">P&L</p>
                      <p className={`font-medium ${position.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(position.pnl)}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => closePosition(position.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Close
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Closed Positions */}
      {closedPositions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trading History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {closedPositions.slice(-10).reverse().map((position) => (
                <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{position.symbol} {position.strike} {position.optionType.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">
                        {position.contracts} contracts • Closed
                      </p>
                    </div>
                    <Badge variant="outline">Closed</Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Entry</p>
                      <p className="font-medium">{formatCurrency(position.premiumPaid)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Exit</p>
                      <p className="font-medium">{formatCurrency(position.currentValue)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Final P&L</p>
                      <p className={`font-bold ${position.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {formatCurrency(position.pnl)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}