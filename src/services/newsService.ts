// News service for fetching options trading related news

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category: 'options' | 'market' | 'earnings' | 'analysis';
  relevanceScore: number;
}

// Mock news data - In a real app, this would come from a news API
const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Options Activity Surges as S&P 500 Hits New Highs',
    summary: 'Call options volume increased 40% as major indices reach record levels, with tech stocks leading the charge.',
    url: '#',
    source: 'MarketWatch',
    publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    category: 'options',
    relevanceScore: 95
  },
  {
    id: '2',
    title: 'NVIDIA Earnings: Options Traders Bet Big on Volatility',
    summary: 'Implied volatility spikes to 80% ahead of NVDA earnings, with unusual activity in $500 calls.',
    url: '#',
    source: 'Bloomberg',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    category: 'earnings',
    relevanceScore: 92
  },
  {
    id: '3',
    title: 'Fed Decision Impact: Put Options See Heavy Demand',
    summary: 'Traders hedge portfolios with SPY put options as Federal Reserve meeting approaches.',
    url: '#',
    source: 'CNBC',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    category: 'market',
    relevanceScore: 88
  },
  {
    id: '4',
    title: 'Options Expiration Week: What Traders Need to Know',
    summary: 'Monthly options expiration brings increased volatility and volume across major indices.',
    url: '#',
    source: 'TheStreet',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    category: 'analysis',
    relevanceScore: 85
  },
  {
    id: '5',
    title: 'Tesla Options Flow Shows Bullish Sentiment',
    summary: 'Large call option purchases in TSLA suggest institutional optimism ahead of delivery numbers.',
    url: '#',
    source: 'Benzinga',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    category: 'options',
    relevanceScore: 82
  },
  {
    id: '6',
    title: 'Crypto Options Market Sees Record Volume',
    summary: 'Bitcoin and Ethereum options reach all-time high trading volumes as institutional interest grows.',
    url: '#',
    source: 'CoinDesk',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), // 10 hours ago
    category: 'options',
    relevanceScore: 78
  },
  {
    id: '7',
    title: 'VIX Options Signal Market Uncertainty',
    summary: 'Volatility index options show mixed signals as traders prepare for potential market swings.',
    url: '#',
    source: 'Yahoo Finance',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    category: 'market',
    relevanceScore: 75
  },
  {
    id: '8',
    title: 'Earnings Season Options Strategies That Work',
    summary: 'Professional traders share their go-to strategies for navigating earnings announcements.',
    url: '#',
    source: 'Investopedia',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 hours ago
    category: 'analysis',
    relevanceScore: 72
  },
  {
    id: '9',
    title: 'Unusual Options Activity: Tech Sector Alert',
    summary: 'Abnormal call option volume detected in major tech stocks suggests potential catalysts ahead.',
    url: '#',
    source: 'MarketWatch',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(), // 16 hours ago
    category: 'options',
    relevanceScore: 70
  },
  {
    id: '10',
    title: 'Options Education: Understanding Greeks in Volatile Markets',
    summary: 'Master delta, gamma, theta, and vega to improve your options trading during market uncertainty.',
    url: '#',
    source: 'Options Industry Council',
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    category: 'analysis',
    relevanceScore: 68
  }
];

export class NewsService {
  // Get top news items, sorted by relevance and recency
  static async getTopNews(limit: number = 10): Promise<NewsItem[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return MOCK_NEWS
      .sort((a, b) => {
        // Sort by relevance score first, then by publish date
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      })
      .slice(0, limit);
  }

  // Get news by category
  static async getNewsByCategory(category: NewsItem['category'], limit: number = 5): Promise<NewsItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return MOCK_NEWS
      .filter(item => item.category === category)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  // Get recent news (last 24 hours)
  static async getRecentNews(limit: number = 10): Promise<NewsItem[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    return MOCK_NEWS
      .filter(item => new Date(item.publishedAt).getTime() > twentyFourHoursAgo)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  // Format time ago string
  static getTimeAgo(publishedAt: string): string {
    const now = Date.now();
    const published = new Date(publishedAt).getTime();
    const diffMs = now - published;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  }

  // Get category color for UI
  static getCategoryColor(category: NewsItem['category']): string {
    switch (category) {
      case 'options': return 'bg-blue-100 text-blue-800';
      case 'market': return 'bg-green-100 text-green-800';
      case 'earnings': return 'bg-purple-100 text-purple-800';
      case 'analysis': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
