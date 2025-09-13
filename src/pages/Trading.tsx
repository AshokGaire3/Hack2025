import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TradingStore } from '@/lib/store';
import { 
  blackScholes, 
  calculateGreeks, 
  generatePayoffChart, 
  formatCurrency, 
  formatPercentage,
  generateMockPrices,
  User,
  OptionParams,
  Position
} from '@/lib/trading';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Calculator, TrendingUp, Activity, Zap, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const STOCKS = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'SPY'];

export default function Trading() {
  const [user, setUser] = useState<User>(TradingStore.getUser());
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stockPrice, setStockPrice] = useState(150.00);
  const [optionParams, setOptionParams] = useState<OptionParams>({
    stockPrice: 150.00,
    strikePrice: 150.00,
    timeToExpiry: 0.25, // 3 months
    riskFreeRate: 0.05,
    volatility: 0.25, // Default volatility since user can't change it
    optionType: 'call'
  });
  
  // Add state for expiration date
  const [expirationDate, setExpirationDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3); // Default to 3 months from now
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  });
  const [contracts, setContracts] = useState(1);
  const [stockHistory] = useState(() => generateMockPrices(selectedStock));

  useEffect(() => {
    setOptionParams(prev => ({ ...prev, stockPrice }));
  }, [stockPrice]);

  // Initialize timeToExpiry based on default expiration date
  useEffect(() => {
    const today = new Date();
    const expiry = new Date(expirationDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysToExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const yearsToExpiry = daysToExpiry / 365.25;
    
    setOptionParams(prev => ({ 
      ...prev, 
      timeToExpiry: Math.max(yearsToExpiry, 0.001)
    }));
  }, []); // Run only once on mount

  useEffect(() => {
    // Simulate live price updates
    const interval = setInterval(() => {
      setStockPrice(prev => {
        const change = (Math.random() - 0.5) * 0.02; // ±1% random walk
        return Number((prev * (1 + change)).toFixed(2));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const optionPrice = blackScholes(optionParams);
  const greeks = calculateGreeks(optionParams);
  const payoffData = generatePayoffChart(optionParams);
  
  const totalCost = optionPrice * contracts * 100; // Options are per 100 shares
  const canAfford = totalCost <= user.balance;

  const handleTrade = () => {
    if (!canAfford) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${formatCurrency(totalCost)} but only have ${formatCurrency(user.balance)}`,
        variant: "destructive"
      });
      return;
    }

    const position: Position = {
      id: Date.now().toString(),
      symbol: selectedStock,
      optionType: optionParams.optionType,
      strike: optionParams.strikePrice,
      expiry: new Date(Date.now() + optionParams.timeToExpiry * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      contracts,
      premiumPaid: optionPrice,
      currentValue: optionPrice,
      pnl: 0,
      openedAt: new Date(),
      status: 'open'
    };

    const updatedUser = TradingStore.addPosition(position);
    setUser(updatedUser);

    // Award XP for trading
    TradingStore.updateUserXP(50);

    toast({
      title: "Trade Executed!",
      description: `Bought ${contracts} contracts of ${selectedStock} ${optionParams.strikePrice} ${optionParams.optionType.toUpperCase()} for ${formatCurrency(totalCost)}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Options Trading Simulator
          </h1>
          <p className="text-muted-foreground">Practice options trading with real-time pricing</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Available Balance</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(user.balance)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trading Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Option Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="stock">Underlying Stock</Label>
              <Select value={selectedStock} onValueChange={setSelectedStock}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STOCKS.map(stock => (
                    <SelectItem key={stock} value={stock}>{stock}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current-price">Current Price</Label>
                <div className="relative">
                  <Input
                    id="current-price"
                    type="number"
                    step="0.01"
                    value={stockPrice}
                    readOnly
                    className="bg-muted ticker-up"
                  />
                  <Activity className="absolute right-3 top-3 h-4 w-4 text-profit" />
                </div>
              </div>

              <div>
                <Label htmlFor="strike">Strike Price</Label>
                <Input
                  id="strike"
                  type="number"
                  step="0.01"
                  value={optionParams.strikePrice}
                  onChange={(e) => setOptionParams(prev => ({ 
                    ...prev, 
                    strikePrice: Number(e.target.value) 
                  }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="option-type">Option Type</Label>
              <Select 
                value={optionParams.optionType} 
                onValueChange={(value: 'call' | 'put') => 
                  setOptionParams(prev => ({ ...prev, optionType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call Option</SelectItem>
                  <SelectItem value="put">Put Option</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expiry">Expiration Date</Label>
              <Input
                id="expiry"
                type="date"
                value={expirationDate}
                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                onChange={(e) => {
                  setExpirationDate(e.target.value);
                  // Calculate time to expiry in years
                  const today = new Date();
                  const expiry = new Date(e.target.value);
                  const timeDiff = expiry.getTime() - today.getTime();
                  const daysToExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
                  const yearsToExpiry = daysToExpiry / 365.25;
                  
                  setOptionParams(prev => ({ 
                    ...prev, 
                    timeToExpiry: Math.max(yearsToExpiry, 0.001) // Minimum 1 day
                  }));
                }}
              />
            </div>

            <div>
              <Label htmlFor="contracts">Number of Contracts</Label>
              <Input
                id="contracts"
                type="number"
                min="1"
                value={contracts}
                onChange={(e) => setContracts(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Option Price:</span>
                <span className="font-bold text-primary">{formatCurrency(optionPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Cost:</span>
                <span className="font-bold">{formatCurrency(totalCost)}</span>
              </div>
              {!canAfford && (
                <div className="flex items-center text-loss text-sm">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Insufficient funds
                </div>
              )}
            </div>

            <Button 
              onClick={handleTrade} 
              disabled={!canAfford}
              className="w-full"
              size="lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Execute Trade
            </Button>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle>{selectedStock} Price History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={stockHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Price']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payoff Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Option Payoff Diagram</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={payoffData}>
                  <defs>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--profit))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--profit))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--loss))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--loss))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="stockPrice" 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'intrinsicValue' ? 'Intrinsic Value' : 'Option Value'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="intrinsicValue" 
                    stroke="hsl(var(--profit))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorProfit)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="optionValue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Greeks */}
      <Card>
        <CardHeader>
          <CardTitle>Option Greeks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Delta</p>
              <p className="text-2xl font-bold text-primary">{greeks.delta.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">Price sensitivity</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Gamma</p>
              <p className="text-2xl font-bold text-accent">{greeks.gamma.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">Delta change rate</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Theta</p>
              <p className="text-2xl font-bold text-loss">{greeks.theta.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">Time decay</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Vega</p>
              <p className="text-2xl font-bold text-warning">{greeks.vega.toFixed(3)}</p>
              <p className="text-xs text-muted-foreground">Volatility sensitivity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}