import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { marketDataService, StockQuote, HistoricalPrice } from '@/services/marketDataService';
import { 
  generateOptionChain, 
  calculateOptionPnL, 
  generatePayoffDiagram,
  formatCurrency, 
  formatPercentage,
  OptionContract,
  PortfolioPosition,
  TradeOrder,
  getDaysToExpiry,
  getTimeToExpiry
} from '@/lib/optionsCalculator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Calculator, TrendingUp, Activity, Zap, AlertTriangle, Clock, DollarSign, Target, Percent, RefreshCw, Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function Trading() {
  const { user } = useAuth();
  
  // Market Data State
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [stockQuote, setStockQuote] = useState<StockQuote | null>(null);
  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPrice[]>([]);
  const [optionChain, setOptionChain] = useState<OptionContract[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Trading State
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
  const [cashBalance, setCashBalance] = useState(100000); // Start with $100k virtual money
  const [selectedOption, setSelectedOption] = useState<OptionContract | null>(null);
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [contracts, setContracts] = useState(1);
  const [orders, setOrders] = useState<TradeOrder[]>([]);

  // Chart State
  const [activeTab, setActiveTab] = useState('quote');
  const [payoffData, setPayoffData] = useState<any[]>([]);
  
  // Expiration Date Filter
  const [selectedExpirations, setSelectedExpirations] = useState<string[]>([]);

  // Load market data on component mount and symbol change
  useEffect(() => {
    loadMarketData();
    
    // Set up real-time updates every 30 seconds during market hours
    const interval = setInterval(() => {
      if (marketDataService.isMarketOpen()) {
        loadMarketData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedSymbol]);

  // Update payoff diagram when portfolio changes
  useEffect(() => {
    if (portfolio.length > 0 && stockQuote) {
      const data = generatePayoffDiagram(portfolio, stockQuote.price);
      setPayoffData(data);
    }
  }, [portfolio, stockQuote]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      // Load stock quote
      const quote = await marketDataService.getStockQuote(selectedSymbol);
      setStockQuote(quote);

      if (quote) {
        // Load historical prices
        const historical = await marketDataService.getHistoricalPrices(selectedSymbol, 30);
        setHistoricalPrices(historical);

        // Calculate implied volatility from historical data
        const impliedVol = marketDataService.calculateImpliedVolatility(historical);

        // Generate option chain
        const options = generateOptionChain(selectedSymbol, quote.price, impliedVol);
        setOptionChain(options);

        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error loading market data:', error);
      toast({
        title: "Data Loading Error",
        description: "Failed to load market data. Using fallback data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const executeOrder = (option: OptionContract, action: 'buy' | 'sell', numContracts: number) => {
    const totalCost = option.premium * numContracts * 100; // Options are sold in contracts of 100

    if (action === 'buy' && totalCost > cashBalance) {
      toast({
        title: "Insufficient Funds",
        description: `You need ${formatCurrency(totalCost)} but only have ${formatCurrency(cashBalance)}`,
        variant: "destructive"
      });
      return;
    }

    // Create the order
    const order: TradeOrder = {
      id: Date.now().toString(),
      userId: user?.id || 'demo',
      symbol: option.symbol,
      action,
      optionType: option.type,
      strike: option.strike,
      expiration: option.expiration,
      contracts: numContracts,
      premium: option.premium,
      totalCost,
      timestamp: new Date().toISOString(),
      status: 'filled'
    };

    // Update portfolio
    const existingPosition = portfolio.find(p => 
      p.symbol === option.symbol && 
      p.type === option.type && 
      p.strike === option.strike && 
      p.expiration === option.expiration
    );

    if (existingPosition) {
      // Update existing position
      const updatedPortfolio = portfolio.map(p => {
        if (p.id === existingPosition.id) {
          const newContracts = action === 'buy' 
            ? p.contracts + numContracts 
            : p.contracts - numContracts;
          
          if (newContracts <= 0) {
            return null; // Will be filtered out
          }

          const newAvgCost = action === 'buy'
            ? (p.avgCost * p.contracts + option.premium * numContracts) / newContracts
            : p.avgCost;

          return {
            ...p,
            contracts: newContracts,
            avgCost: newAvgCost,
            currentValue: option.premium,
            pnl: (option.premium - newAvgCost) * newContracts * 100,
            pnlPercent: ((option.premium - newAvgCost) / newAvgCost) * 100,
            daysToExpiry: getDaysToExpiry(option.expiration)
          };
        }
        return p;
      }).filter(Boolean) as PortfolioPosition[];

      setPortfolio(updatedPortfolio);
    } else if (action === 'buy') {
      // Create new position
      const newPosition: PortfolioPosition = {
        id: Date.now().toString(),
        symbol: option.symbol,
        type: option.type,
        strike: option.strike,
        expiration: option.expiration,
        contracts: numContracts,
        avgCost: option.premium,
        currentValue: option.premium,
        pnl: 0,
        pnlPercent: 0,
        delta: option.delta,
        theta: option.theta,
        daysToExpiry: getDaysToExpiry(option.expiration)
      };

      setPortfolio([...portfolio, newPosition]);
    }

    // Update cash balance
    const cashChange = action === 'buy' ? -totalCost : totalCost;
    setCashBalance(prev => prev + cashChange);

    // Add order to history
    setOrders([order, ...orders]);

    // Show success message
    toast({
      title: "Order Executed",
      description: `${action.toUpperCase()} ${numContracts} ${option.symbol} ${formatCurrency(option.strike)} ${option.type.toUpperCase()} for ${formatCurrency(totalCost)}`,
    });
  };

  const formatChartData = (prices: HistoricalPrice[]) => {
    return prices.map(price => ({
      date: price.date,
      price: price.close,
      volume: price.volume
    }));
  };

  const getAllExpirationDates = () => {
    const expirations = [...new Set(optionChain.map(option => option.expiration))];
    return expirations.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  };

  const getOptionsByExpiration = () => {
    const grouped = optionChain.reduce((acc, option) => {
      if (!acc[option.expiration]) {
        acc[option.expiration] = { calls: [], puts: [] };
      }
      if (option.type === 'call') {
        acc[option.expiration].calls.push(option);
      } else {
        acc[option.expiration].puts.push(option);
      }
      return acc;
    }, {} as { [key: string]: { calls: OptionContract[], puts: OptionContract[] } });

    // Sort by expiration date and filter by selected expirations
    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    
    // If no specific expirations are selected, show all
    if (selectedExpirations.length === 0) {
      return sortedEntries;
    }
    
    // Filter to only show selected expirations
    return sortedEntries.filter(([expiration]) => selectedExpirations.includes(expiration));
  };

  const getTotalPortfolioValue = () => {
    const positionsValue = portfolio.reduce((sum, position) => {
      return sum + (position.currentValue * position.contracts * 100);
    }, 0);
    return cashBalance + positionsValue;
  };

  const getTotalPnL = () => {
    return portfolio.reduce((sum, position) => sum + position.pnl, 0);
  };

  if (!stockQuote) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Options Trading Simulator</h1>
          <p className="text-muted-foreground">Trade options with real market data</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={marketDataService.isMarketOpen() ? "default" : "secondary"}>
            {marketDataService.isMarketOpen() ? "Market Open" : "Market Closed"}
          </Badge>
          <Button onClick={loadMarketData} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Cash Balance</p>
                <div className="text-2xl font-bold">{formatCurrency(cashBalance)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <div className="text-2xl font-bold">{formatCurrency(getTotalPortfolioValue())}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                <div className={`text-2xl font-bold ${getTotalPnL() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(getTotalPnL())}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium text-muted-foreground">Positions</p>
                <div className="text-2xl font-bold">{portfolio.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Market Data & Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Stock Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {marketDataService.getPopularSymbols().map(symbol => (
                      <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">{formatCurrency(stockQuote.price)}</span>
                    <Badge variant={stockQuote.change >= 0 ? "default" : "destructive"}>
                      {stockQuote.change >= 0 ? '+' : ''}{formatCurrency(stockQuote.change)} 
                      ({formatPercentage(stockQuote.changePercent)})
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quote">Price Chart</TabsTrigger>
              <TabsTrigger value="payoff">Payoff Diagram</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            </TabsList>

            <TabsContent value="quote">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedSymbol} Price History (30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={formatChartData(historicalPrices)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number) => [formatCurrency(value), 'Price']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payoff">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Payoff Diagram</CardTitle>
                </CardHeader>
                <CardContent>
                  {payoffData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={payoffData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="stockPrice"
                          tickFormatter={(value) => formatCurrency(value)}
                        />
                        <YAxis tickFormatter={(value) => formatCurrency(value)} />
                        <Tooltip 
                          labelFormatter={(value) => `Stock Price: ${formatCurrency(value)}`}
                          formatter={(value: number, name: string) => [formatCurrency(value), name]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="pnl" 
                          stroke="#2563eb" 
                          strokeWidth={2}
                          name="Total P&L"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="intrinsic" 
                          stroke="#16a34a" 
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          name="Intrinsic Value"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">No positions to display</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="portfolio">
              <Card>
                <CardHeader>
                  <CardTitle>Current Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  {portfolio.length > 0 ? (
                    <div className="space-y-4">
                      {portfolio.map((position) => (
                        <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">
                              {position.symbol} {formatCurrency(position.strike)} {position.type.toUpperCase()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Exp: {position.expiration} • {position.contracts} contracts
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-medium ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(position.pnl)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {position.daysToExpiry} days left
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">No positions yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Option Chain & Trading */}
        <div className="space-y-6">
          {/* Trading Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Place Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Action</Label>
                  <Select value={tradeAction} onValueChange={(value: 'buy' | 'sell') => setTradeAction(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Contracts</Label>
                  <Input 
                    type="number" 
                    value={contracts} 
                    onChange={(e) => setContracts(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
              </div>

              {selectedOption && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="font-medium mb-2">
                    {selectedOption.symbol} {formatCurrency(selectedOption.strike)} {selectedOption.type.toUpperCase()}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Premium: {formatCurrency(selectedOption.premium)}</div>
                    <div>Delta: {selectedOption.delta.toFixed(3)}</div>
                    <div>Days: {getDaysToExpiry(selectedOption.expiration)}</div>
                    <div>IV: {formatPercentage(selectedOption.impliedVolatility)}</div>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <div className="font-medium">
                      Total Cost: {formatCurrency(selectedOption.premium * contracts * 100)}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => executeOrder(selectedOption, tradeAction, contracts)}
                    className="w-full mt-4"
                    disabled={tradeAction === 'buy' && selectedOption.premium * contracts * 100 > cashBalance}
                  >
                    {tradeAction.toUpperCase()} {contracts} Contract{contracts !== 1 ? 's' : ''}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Option Chain */}
          <Card>
            <CardHeader>
              <CardTitle>Option Chain</CardTitle>
              <div className="mt-4">
                <Label>Filter by Expiration Date</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button
                    variant={selectedExpirations.length === 0 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedExpirations([])}
                  >
                    All Dates
                  </Button>
                  {getAllExpirationDates().map((expiration) => (
                    <Button
                      key={expiration}
                      variant={selectedExpirations.includes(expiration) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (selectedExpirations.includes(expiration)) {
                          setSelectedExpirations(prev => prev.filter(exp => exp !== expiration));
                        } else {
                          setSelectedExpirations(prev => [...prev, expiration]);
                        }
                      }}
                    >
                      {new Date(expiration).toLocaleDateString()} ({getDaysToExpiry(expiration)}d)
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {getOptionsByExpiration().map(([expiration, options]) => (
                  <div key={expiration}>
                    <h4 className="font-medium mb-2">
                      {new Date(expiration).toLocaleDateString()} ({getDaysToExpiry(expiration)} days)
                    </h4>
                    
                    <div className="space-y-1">
                      {/* Calls */}
                      <div className="text-xs text-muted-foreground mb-1">CALLS</div>
                      {options.calls.slice(0, 5).map((option) => (
                        <div 
                          key={option.id}
                          className={`flex items-center justify-between p-2 text-sm border rounded cursor-pointer hover:bg-muted/50 ${
                            selectedOption?.id === option.id ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => setSelectedOption(option)}
                        >
                          <div>
                            <span className="font-medium">{formatCurrency(option.strike)}</span>
                            <span className="ml-2 text-green-600">C</span>
                          </div>
                          <div>{formatCurrency(option.premium)}</div>
                        </div>
                      ))}
                      
                      {/* Puts */}
                      <div className="text-xs text-muted-foreground mb-1 mt-2">PUTS</div>
                      {options.puts.slice(0, 5).map((option) => (
                        <div 
                          key={option.id}
                          className={`flex items-center justify-between p-2 text-sm border rounded cursor-pointer hover:bg-muted/50 ${
                            selectedOption?.id === option.id ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => setSelectedOption(option)}
                        >
                          <div>
                            <span className="font-medium">{formatCurrency(option.strike)}</span>
                            <span className="ml-2 text-red-600">P</span>
                          </div>
                          <div>{formatCurrency(option.premium)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
