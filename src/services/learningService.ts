// Learning platform service for structured financial education

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  xpReward: number;
  prerequisites: string[]; // lesson IDs that must be completed first
  category: string;
  order: number;
  videoUrl?: string;
  quiz?: {
    questions: QuizQuestion[];
  };
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LearningProgress {
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  timeSpent: number; // in minutes
  quizScore?: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  lessons: string[]; // lesson IDs in order
  estimatedTime: number; // total minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Comprehensive learning content
const LEARNING_LESSONS: Lesson[] = [
  // BASICS - STOCKS
  {
    id: 'stocks-101',
    title: 'What is a Stock?',
    description: 'Learn the fundamental concept of stocks and how they represent ownership in companies.',
    content: `What is a Stock?

A stock represents a share of ownership in a company. When you buy stock, you become a shareholder and own a piece of that business.

Key Concepts:

1. Ownership
• Each share represents a fractional ownership of the company
• If a company has 1,000 shares and you own 10, you own 1% of the company

2. Stock Price
• The price investors are willing to pay for one share
• Changes based on supply and demand
• Reflects the company's perceived value and future prospects

3. Market Capitalization
• Total value of all company shares
• Market Cap = Share Price × Number of Shares Outstanding

Why Do Companies Issue Stock?

1. Raise Capital: Get money to grow the business
2. Go Public: Allow early investors and employees to sell their shares
3. Currency for Acquisitions: Use stock to buy other companies

Types of Stock:

Common Stock
• Voting rights in company decisions
• Potential dividends
• Last to be paid if company goes bankrupt

Preferred Stock
• Fixed dividend payments
• Priority over common stock for dividends
• Usually no voting rights

Stock Exchanges
• NYSE: New York Stock Exchange
• NASDAQ: Electronic exchange for tech companies
• Other exchanges: Regional and international markets

Example:
If Apple (AAPL) trades at $150 per share and has 16 billion shares outstanding:
• Market Cap = $150 × 16 billion = $2.4 trillion
• Buying 100 shares costs $15,000
• You own 0.00000625% of Apple
    `,
    duration: 15,
    difficulty: 'beginner',
    xpReward: 10,
    prerequisites: [],
    category: 'Stocks Fundamentals',
    order: 1,
    quiz: {
      questions: [
        {
          id: 'q1',
          question: 'What does owning stock in a company mean?',
          options: [
            'You are lending money to the company',
            'You own a piece of the company',
            'You are an employee of the company',
            'You control the company completely'
          ],
          correctAnswer: 1,
          explanation: 'Owning stock means you have a fractional ownership stake in the company.'
        },
        {
          id: 'q2',
          question: 'What determines a stock\'s price?',
          options: [
            'The government sets the price',
            'The company CEO decides',
            'Supply and demand from investors',
            'It\'s always the same price'
          ],
          correctAnswer: 2,
          explanation: 'Stock prices are determined by supply and demand - how many people want to buy vs. sell at any given price.'
        }
      ]
    }
  },

  {
    id: 'stock-markets',
    title: 'How Stock Markets Work',
    description: 'Understand how stock exchanges operate and how trades are executed.',
    content: `How Stock Markets Work

Stock markets are organized exchanges where buyers and sellers trade shares of publicly-traded companies.

Market Participants:

1. Individual Investors
• Retail investors like you and me
• Buy and sell through brokers
• Usually smaller trade sizes

2. Institutional Investors
• Mutual funds, pension funds, insurance companies
• Large trade volumes
• Professional money managers

3. Market Makers
• Provide liquidity by always being ready to buy or sell
• Profit from the bid-ask spread
• Help ensure smooth trading

How Trades Work:

Bid and Ask
• Bid: Highest price buyers are willing to pay
• Ask: Lowest price sellers will accept
• Spread: Difference between bid and ask

Order Types:
1. Market Order: Buy/sell immediately at current price
2. Limit Order: Buy/sell only at specific price or better
3. Stop Order: Trigger market order when price hits level

Trading Hours:
• Regular Hours: 9:30 AM - 4:00 PM ET
• Pre-Market: 4:00 AM - 9:30 AM ET
• After-Hours: 4:00 PM - 8:00 PM ET

Market Indices:
• S&P 500: Top 500 US companies
• Dow Jones: 30 large industrial companies
• NASDAQ: Tech-heavy index

Example Trade:
You want to buy 100 shares of Tesla (TSLA):
• Current bid: $249.50, ask: $250.00
• You place market order → executed at $250.00
• Total cost: $25,000 + commission
    `,
    duration: 20,
    difficulty: 'beginner',
    xpReward: 10,
    prerequisites: ['stocks-101'],
    category: 'Stocks Fundamentals',
    order: 2
  },

  // OPTIONS BASICS
  {
    id: 'options-101',
    title: 'Options Basics (Foundation)',
    description: 'Learn the fundamentals of options trading with simple, clear explanations.',
    content: `What is an Option?

A contract giving the right (not obligation) to buy (Call) or sell (Put) an asset at a fixed price before expiration.

Key Terms:

Strike Price: The agreed price in the contract.

Premium: Price paid to buy the option.

Expiration Date: When the option expires.

In the Money (ITM): Option has intrinsic value.

Out of the Money (OTM): Option has no intrinsic value.

Option Types:

Call Option: Right to buy at strike price. (Bullish)

Put Option: Right to sell at strike price. (Bearish)

Core Concepts:

Time Decay (Theta): Options lose value as expiration nears.

Volatility (Vega): Higher volatility = higher option premiums.

Delta: Measures sensitivity of option to stock price change.

Simple Strategies:

Covered Call: Sell a call on stock you already own → earn premium.

Cash-Secured Put: Sell a put while holding enough cash to buy the stock → get paid to wait.

Protective Put: Buy a put while holding stock → acts like insurance.

Pro Tips for Beginners:

• Start with paper trading (practice accounts).
• Stick to liquid stocks/ETFs (tight bid-ask spreads).
• Focus on risk management (never risk more than you can lose).
• Learn one strategy deeply before moving to advanced spreads.
    `,
    duration: 25,
    difficulty: 'beginner',
    xpReward: 10,
    prerequisites: ['stocks-101', 'stock-markets'],
    category: 'Options Fundamentals',
    order: 3,
    quiz: {
      questions: [
        {
          id: 'q1',
          question: 'What does a call option give you the right to do?',
          options: [
            'Sell a stock at the strike price',
            'Buy a stock at the strike price', 
            'Own the stock permanently',
            'Set the stock price'
          ],
          correctAnswer: 1,
          explanation: 'A call option gives you the right to BUY a stock at the strike price.'
        },
        {
          id: 'q2',
          question: 'What happens to options as they get closer to expiration?',
          options: [
            'They gain value automatically',
            'They lose value due to time decay',
            'Their value stays the same',
            'They become more expensive'
          ],
          correctAnswer: 1,
          explanation: 'Options lose value as expiration approaches due to time decay (theta).'
        }
      ]
    }
  },

  {
    id: 'options-pricing',
    title: 'How Options are Priced',
    description: 'Learn the factors that determine option prices and intrinsic vs. time value.',
    content: `How Options are Priced

Option prices are determined by several key factors. Understanding these helps you make better trading decisions.

Components of Option Price:

Intrinsic Value
• The value if you exercised the option right now
• Call: Max(Stock Price - Strike Price, 0)
• Put: Max(Strike Price - Stock Price, 0)

Time Value (Extrinsic Value)
• Premium above intrinsic value
• Time Value = Option Price - Intrinsic Value
• Decreases as expiration approaches

Factors Affecting Option Prices:

1. Stock Price Movement
• Calls: Increase when stock goes up
• Puts: Increase when stock goes down

2. Time to Expiration
• More time = higher premium
• Options lose value as expiration approaches
• Time decay accelerates near expiration

3. Volatility
• Higher volatility = higher premiums
• Reflects uncertainty about future price moves
• Implied volatility vs. historical volatility

4. Interest Rates
• Higher rates slightly increase call premiums
• Minor factor for most retail trading

5. Dividends
• Upcoming dividends affect option prices
• Calls decrease, puts increase before ex-dividend

Examples:

AAPL Stock at $150

Call Example: $155 Call with 30 days to expiration, $3 premium
• Intrinsic Value: Max($150 - $155, 0) = $0
• Time Value: $3 - $0 = $3

Put Example: $145 Put with 30 days to expiration, $2 premium
• Intrinsic Value: Max($145 - $150, 0) = $0
• Time Value: $2 - $0 = $2

If AAPL moves to $160:

Call: Now worth at least $5 intrinsic + time value
Put: Still $0 intrinsic, less time value

In-the-Money vs. Out-of-the-Money:

Calls:
• ITM: Stock price > strike price
• OTM: Stock price < strike price
• ATM: Stock price = strike price

Puts:
• ITM: Stock price < strike price
• OTM: Stock price > strike price
• ATM: Stock price = strike price

Key Takeaway:
Options are "wasting assets" - they lose value over time. The closer to expiration, the faster they decay!
    `,
    duration: 30,
    difficulty: 'intermediate',
    xpReward: 10,
    prerequisites: ['options-101'],
    category: 'Options Fundamentals',
    order: 4
  },

  // ADVANCED CONCEPTS
  {
    id: 'options-greeks',
    title: 'The Greeks: Risk Measures',
    description: 'Master Delta, Gamma, Theta, Vega, and Rho to understand option risk.',
    content: `The Greeks: Option Risk Measures

The Greeks are mathematical measures that help you understand how option prices change with different factors.

Delta:

Measures: Price sensitivity to stock movement
Range: -1 to +1

Call Delta:
• Range: 0 to +1
• $1 stock increase → Delta × $1 option increase
• Example: Delta 0.5 means 50¢ option gain per $1 stock gain

Put Delta:
• Range: -1 to 0
• Negative because puts gain when stock falls
• Example: Delta -0.3 means 30¢ put gain per $1 stock drop

Delta Examples:
• Deep ITM Call: Delta ≈ 1.0 (moves almost 1:1 with stock)
• ATM Call: Delta ≈ 0.5 (moves 50¢ per $1 stock move)
• Deep OTM Call: Delta ≈ 0.1 (barely moves)

Gamma:

Measures: How fast Delta changes
Important for: Risk management

• High Gamma = Delta changes quickly
• ATM options have highest Gamma
• Gamma increases as expiration approaches

Theta:

Measures: Time decay per day
Always negative for long options

Key Points:
• Shows daily premium loss from time passage
• Accelerates as expiration approaches
• ATM options have highest Theta

Example:
• Theta = -0.05 means option loses 5¢ per day
• 30-day option with Theta -0.05 loses $1.50 over 30 days

Vega:

Measures: Sensitivity to volatility changes
Important for: Earnings plays, market uncertainty

• Higher volatility = higher premiums
• ATM options have highest Vega
• Longer-dated options more sensitive to volatility

Example:
• Vega = 0.10 means 10¢ gain per 1% volatility increase
• If implied volatility rises from 20% to 25%, option gains 50¢

Rho:

Measures: Sensitivity to interest rate changes
Least important for most retail traders

• Calls have positive Rho
• Puts have negative Rho
• More important for longer-dated options

Practical Application:

AAPL $150 Call, 30 days to expiration:
• Premium: $5.00
• Delta: 0.60 (gains 60¢ per $1 AAPL increase)
• Gamma: 0.03 (Delta increases by 0.03 per $1 move)
• Theta: -0.08 (loses 8¢ per day)
• Vega: 0.15 (gains 15¢ per 1% volatility increase)

If AAPL moves from $150 to $152:
• Option gains: 0.60 × $2 = $1.20
• New Delta: 0.60 + (0.03 × 2) = 0.66

Strategy Tips:
1. Buy high Delta for directional plays
2. Sell high Theta to profit from time decay
3. Buy high Vega before earnings/events
4. Monitor Gamma for position sizing
    `,
    duration: 35,
    difficulty: 'advanced',
    xpReward: 10,
    prerequisites: ['options-pricing'],
    category: 'Advanced Options',
    order: 5
  },

  // STRATEGIES
  {
    id: 'basic-strategies',
    title: 'Basic Options Strategies',
    description: 'Learn fundamental options strategies: long calls, puts, and covered calls.',
    content: `Basic Options Strategies

Master these fundamental strategies before moving to complex multi-leg trades.

1. Long Call (Bullish)

When to use: You expect the stock to rise significantly
Max Profit: Unlimited
Max Loss: Premium paid

Example:
• AAPL at $150
• Buy $155 Call for $2 premium
• Breakeven: $155 + $2 = $157
• Profit if AAPL > $157
• Loss if AAPL < $157

Profit/Loss at Expiration:
• AAPL at $160: Profit = $160 - $155 - $2 = $3 per share
• AAPL at $150: Loss = -$2 per share (premium)

2. Long Put (Bearish)

When to use: You expect the stock to fall significantly
Max Profit: Strike price - premium (if stock goes to $0)
Max Loss: Premium paid

Example:
• AAPL at $150
• Buy $145 Put for $3 premium
• Breakeven: $145 - $3 = $142
• Profit if AAPL < $142
• Loss if AAPL > $142

3. Covered Call (Income)

When to use: You own stock and want extra income
Max Profit: Premium + (Strike - Stock Price)
Max Loss: Stock can fall to zero

Example:
• Own 100 AAPL shares at $150
• Sell $155 Call for $2 premium
• Income: $200 premium immediately
• Risk: Stock called away if AAPL > $155

Scenarios:
• AAPL at $160: Stock called away at $155, keep $2 premium
• AAPL at $150: Keep stock and $2 premium
• AAPL at $140: Keep stock, premium helps offset loss

4. Cash-Secured Put (Income)

When to use: You want to buy stock at lower price
Requirement: Cash equal to 100 shares × strike price
Income: Premium collected upfront

Example:
• AAPL at $150
• Sell $145 Put for $3 premium
• Cash required: $14,500
• Income: $300 premium

Scenarios:
• AAPL above $145: Keep premium, not assigned
• AAPL below $145: Buy 100 shares at $145, keep premium

Strategy Selection Guide:

Market Outlook:
• Bullish: Long Call, Cash-Secured Put
• Bearish: Long Put
• Neutral/Income: Covered Call

Risk Tolerance:
• Limited Risk: Long Call/Put (risk = premium)
• Stock Risk: Covered Call, Cash-Secured Put

Time Horizon:
• Short-term: ATM options
• Long-term: ITM options for less time decay

Common Mistakes:
1. Buying OTM options: Low probability of profit
2. Holding to expiration: Time decay accelerates
3. Not having exit plan: Know when to take profits/losses
4. Ignoring liquidity: Trade options with tight bid-ask spreads

Risk Management:
• Never risk more than you can afford to lose
• Consider position size (don't put all money in one trade)
• Have exit strategy before entering trade
• Understand assignment risk for short options
    `,
    duration: 40,
    difficulty: 'intermediate',
    xpReward: 10,
    prerequisites: ['options-greeks'],
    category: 'Options Strategies',
    order: 6
  }
];

// Learning paths that group related lessons
const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'complete-beginner',
    title: 'Complete Beginner Path',
    description: 'Start from absolute zero and build a solid foundation in stocks and options.',
    lessons: ['stocks-101', 'stock-markets', 'options-101', 'options-pricing', 'basic-strategies'],
    estimatedTime: 130,
    difficulty: 'beginner'
  },
  {
    id: 'options-mastery',
    title: 'Options Mastery Path', 
    description: 'Deep dive into options trading from basics to advanced strategies.',
    lessons: ['options-101', 'options-pricing', 'options-greeks', 'basic-strategies'],
    estimatedTime: 130,
    difficulty: 'intermediate'
  }
];

export class LearningService {
  // Get all lessons
  static getLessons(): Lesson[] {
    return LEARNING_LESSONS.sort((a, b) => a.order - b.order);
  }

  // Get lesson by ID
  static getLesson(id: string): Lesson | undefined {
    return LEARNING_LESSONS.find(lesson => lesson.id === id);
  }

  // Get lessons by category
  static getLessonsByCategory(category: string): Lesson[] {
    return LEARNING_LESSONS
      .filter(lesson => lesson.category === category)
      .sort((a, b) => a.order - b.order);
  }

  // Get all categories
  static getCategories(): string[] {
    const categories = [...new Set(LEARNING_LESSONS.map(lesson => lesson.category))];
    return categories;
  }

  // Get learning paths
  static getLearningPaths(): LearningPath[] {
    return LEARNING_PATHS;
  }

  // Get learning path by ID
  static getLearningPath(id: string): LearningPath | undefined {
    return LEARNING_PATHS.find(path => path.id === id);
  }

  // Check if lesson prerequisites are met
  static arePrerequisitesMet(lessonId: string, completedLessons: string[]): boolean {
    const lesson = this.getLesson(lessonId);
    if (!lesson) return false;
    
    return lesson.prerequisites.every(prereq => completedLessons.includes(prereq));
  }

  // Get next recommended lesson
  static getNextLesson(completedLessons: string[]): Lesson | undefined {
    return LEARNING_LESSONS
      .filter(lesson => !completedLessons.includes(lesson.id))
      .find(lesson => this.arePrerequisitesMet(lesson.id, completedLessons));
  }

  // Calculate progress for a learning path
  static getPathProgress(pathId: string, completedLessons: string[]): {
    completed: number;
    total: number;
    percentage: number;
  } {
    const path = this.getLearningPath(pathId);
    if (!path) return { completed: 0, total: 0, percentage: 0 };

    const completed = path.lessons.filter(lessonId => 
      completedLessons.includes(lessonId)
    ).length;

    return {
      completed,
      total: path.lessons.length,
      percentage: Math.round((completed / path.lessons.length) * 100)
    };
  }

  // Get difficulty color for UI
  static getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  // Format duration
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
}
