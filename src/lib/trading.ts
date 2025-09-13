// Trading utilities and Black-Scholes pricing engine

export interface OptionParams {
  stockPrice: number;
  strikePrice: number;
  timeToExpiry: number; // in years
  riskFreeRate: number;
  volatility: number;
  optionType: 'call' | 'put';
}

export interface Position {
  id: string;
  symbol: string;
  optionType: 'call' | 'put';
  strike: number;
  expiry: string;
  contracts: number;
  premiumPaid: number;
  currentValue: number;
  pnl: number;
  openedAt: Date;
  status: 'open' | 'closed';
}

export interface Portfolio {
  cashBalance: number;
  totalValue: number;
  positions: Position[];
  totalPnL: number;
  dayPnL: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  xp: number;
  level: number;
  balance: number;
  portfolio: Portfolio;
}

// Black-Scholes pricing model
export function normalCDF(x: number): number {
  // Approximation of the cumulative standard normal distribution
  const a1 =  0.31938153;
  const a2 = -0.356563782;
  const a3 =  1.781477937;
  const a4 = -1.821255978;
  const a5 =  1.330274429;
  
  const k = 1 / (1 + 0.2316419 * Math.abs(x));
  const cdf = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * x * x) * 
              (a1 * k + a2 * k * k + a3 * k * k * k + a4 * k * k * k * k + a5 * k * k * k * k * k);
  
  return x >= 0 ? cdf : 1 - cdf;
}

export function blackScholes(params: OptionParams): number {
  const { stockPrice, strikePrice, timeToExpiry, riskFreeRate, volatility, optionType } = params;
  
  if (timeToExpiry <= 0) return Math.max(optionType === 'call' ? stockPrice - strikePrice : strikePrice - stockPrice, 0);
  
  const d1 = (Math.log(stockPrice / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / 
             (volatility * Math.sqrt(timeToExpiry));
  const d2 = d1 - volatility * Math.sqrt(timeToExpiry);
  
  if (optionType === 'call') {
    return stockPrice * normalCDF(d1) - strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2);
  } else {
    return strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2) - stockPrice * normalCDF(-d1);
  }
}

export function calculateGreeks(params: OptionParams) {
  const { stockPrice, strikePrice, timeToExpiry, riskFreeRate, volatility, optionType } = params;
  
  if (timeToExpiry <= 0) return { delta: 0, gamma: 0, theta: 0, vega: 0 };
  
  const d1 = (Math.log(stockPrice / strikePrice) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiry) / 
             (volatility * Math.sqrt(timeToExpiry));
  const d2 = d1 - volatility * Math.sqrt(timeToExpiry);
  
  // Delta
  const delta = optionType === 'call' ? normalCDF(d1) : normalCDF(d1) - 1;
  
  // Gamma
  const gamma = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * d1 * d1) / 
                (stockPrice * volatility * Math.sqrt(timeToExpiry));
  
  // Theta (per day)
  const theta = optionType === 'call' 
    ? (-(stockPrice * (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * d1 * d1) * volatility) / (2 * Math.sqrt(timeToExpiry)) - 
       riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(d2)) / 365
    : (-(stockPrice * (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * d1 * d1) * volatility) / (2 * Math.sqrt(timeToExpiry)) + 
       riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToExpiry) * normalCDF(-d2)) / 365;
  
  // Vega (per 1% change in volatility)
  const vega = stockPrice * Math.sqrt(timeToExpiry) * (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * d1 * d1) / 100;
  
  return { delta, gamma, theta, vega };
}

export function generatePayoffChart(params: OptionParams, priceRange: number[] = []) {
  const { strikePrice, optionType } = params;
  
  if (priceRange.length === 0) {
    const min = strikePrice * 0.7;
    const max = strikePrice * 1.3;
    priceRange = Array.from({ length: 50 }, (_, i) => min + (max - min) * i / 49);
  }
  
  return priceRange.map(price => {
    const intrinsicValue = optionType === 'call' 
      ? Math.max(price - strikePrice, 0)
      : Math.max(strikePrice - price, 0);
    
    const currentPrice = blackScholes({ ...params, stockPrice: price });
    
    return {
      stockPrice: price,
      intrinsicValue,
      optionValue: currentPrice,
      profitLoss: intrinsicValue - params.stockPrice // Simplified P&L
    };
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
}

// Mock stock price generator
export function generateMockPrices(symbol: string, days: number = 30): Array<{ date: string; price: number; volume: number }> {
  const basePrice = 100 + Math.random() * 400; // $100-500 range
  const data = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    // Random walk with slight upward bias
    const change = (Math.random() - 0.48) * 0.05; // -2.5% to +2.5% daily moves
    currentPrice *= (1 + change);
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Number(currentPrice.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000
    });
  }
  
  return data;
}

// Progressive level calculation
// Level 1: 500 XP, Level 2: 1000 XP, Level 3: 1500 XP, etc.
export function calculateLevel(xp: number): number {
  if (xp < 500) return 1;
  return Math.floor(xp / 500) + 1;
}

export function getXpForNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);
  return currentLevel * 500;
}

export function getXpRequiredForLevel(level: number): number {
  return level * 500;
}

export function getCurrentLevelProgress(xp: number): { current: number, required: number, progress: number } {
  const level = calculateLevel(xp);
  const currentLevelXp = (level - 1) * 500;
  const nextLevelXp = level * 500;
  const progressInLevel = xp - currentLevelXp;
  const requiredForLevel = nextLevelXp - currentLevelXp;
  
  return {
    current: progressInLevel,
    required: requiredForLevel,
    progress: Math.round((progressInLevel / requiredForLevel) * 100)
  };
}