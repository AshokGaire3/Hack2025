// Local storage-based state management for the trading simulator

import { User, Portfolio, Position, calculateLevel } from './trading';

const STORAGE_KEYS = {
  USER: 'trading_sim_user',
  PORTFOLIO: 'trading_sim_portfolio',
  POSITIONS: 'trading_sim_positions',
  LEADERBOARD: 'trading_sim_leaderboard'
};

// Initialize default user
const DEFAULT_USER: User = {
  id: '1',
  name: 'Trader',
  email: 'trader@example.com',
  xp: 0,
  level: 1,
  balance: 10000,
  portfolio: {
    cashBalance: 10000,
    totalValue: 10000,
    positions: [],
    totalPnL: 0,
    dayPnL: 0
  }
};

export class TradingStore {
  static getUser(): User {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : DEFAULT_USER;
  }

  static saveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static updateUserXP(xp: number): User {
    const user = this.getUser();
    user.xp += xp;
    user.level = calculateLevel(user.xp);
    this.saveUser(user);
    return user;
  }

  static updateBalance(amount: number): User {
    const user = this.getUser();
    user.balance += amount;
    user.portfolio.cashBalance = user.balance;
    this.saveUser(user);
    return user;
  }

  static addPosition(position: Position): User {
    const user = this.getUser();
    user.portfolio.positions.push(position);
    user.balance -= position.premiumPaid * position.contracts * 100; // Options are per 100 shares
    user.portfolio.cashBalance = user.balance;
    this.saveUser(user);
    return user;
  }

  static closePosition(positionId: string, closingPrice: number): User {
    const user = this.getUser();
    const position = user.portfolio.positions.find(p => p.id === positionId);
    
    if (position && position.status === 'open') {
      position.status = 'closed';
      position.currentValue = closingPrice;
      position.pnl = (closingPrice - position.premiumPaid) * position.contracts * 100;
      
      // Add proceeds to balance
      user.balance += closingPrice * position.contracts * 100;
      user.portfolio.cashBalance = user.balance;
      
      // Award XP based on profit
      if (position.pnl > 0) {
        user.xp += Math.floor(position.pnl / 10); // 1 XP per $10 profit
        user.level = calculateLevel(user.xp);
      }
    }
    
    this.saveUser(user);
    return user;
  }

  static getLeaderboard(): Array<{name: string; xp: number; level: number; balance: number}> {
    const stored = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    const leaderboard = stored ? JSON.parse(stored) : [];
    
    // Add current user if not in leaderboard
    const currentUser = this.getUser();
    const userInLeaderboard = leaderboard.find((u: any) => u.name === currentUser.name);
    
    if (!userInLeaderboard) {
      leaderboard.push({
        name: currentUser.name,
        xp: currentUser.xp,
        level: currentUser.level,
        balance: currentUser.balance
      });
    } else {
      // Update current user's stats
      userInLeaderboard.xp = currentUser.xp;
      userInLeaderboard.level = currentUser.level;
      userInLeaderboard.balance = currentUser.balance;
    }
    
    // Add some mock competitors if leaderboard is too small
    if (leaderboard.length < 10) {
      const mockTraders = [
        { name: "WallStreetWolf", xp: 1500, level: 16, balance: 25000 },
        { name: "OptionGuru", xp: 1200, level: 13, balance: 22000 },
        { name: "ThetaGang", xp: 1000, level: 11, balance: 18000 },
        { name: "VolTrader", xp: 850, level: 9, balance: 16000 },
        { name: "DerivativeDealer", xp: 700, level: 8, balance: 14000 },
        { name: "StrikeKing", xp: 600, level: 7, balance: 13000 },
        { name: "PremiumHunter", xp: 500, level: 6, balance: 12000 },
        { name: "CallPutMaster", xp: 400, level: 5, balance: 11000 },
        { name: "GreekGoddess", xp: 300, level: 4, balance: 10500 }
      ];
      
      mockTraders.forEach(trader => {
        if (!leaderboard.find((u: any) => u.name === trader.name)) {
          leaderboard.push(trader);
        }
      });
    }
    
    // Sort by XP and save
    leaderboard.sort((a: any, b: any) => b.xp - a.xp);
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
    
    return leaderboard.slice(0, 20);
  }

  static reset(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// Quiz data
export interface Quiz {
  id: string;
  question: string;
  choices: string[];
  correctChoice: number;
  explanation: string;
  xpReward: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const QUIZ_DATA: Quiz[] = [
  {
    id: '1',
    question: 'What happens to a call option when the underlying stock price increases?',
    choices: [
      'The option value decreases',
      'The option value increases',
      'The option value stays the same',
      'The option expires worthless'
    ],
    correctChoice: 1,
    explanation: 'Call options give the right to buy at the strike price, so they become more valuable as the stock price rises.',
    xpReward: 100,
    difficulty: 'beginner'
  },
  {
    id: '2',
    question: 'What is "time decay" in options trading?',
    choices: [
      'The reduction in option value due to passage of time',
      'The increase in volatility over time',
      'The change in strike price',
      'The dividend payment schedule'
    ],
    correctChoice: 0,
    explanation: 'Time decay (theta) represents how an option loses value as it approaches expiration, all else being equal.',
    xpReward: 150,
    difficulty: 'intermediate'
  },
  {
    id: '3',
    question: 'Which Greek measures an option\'s sensitivity to changes in volatility?',
    choices: ['Delta', 'Gamma', 'Theta', 'Vega'],
    correctChoice: 3,
    explanation: 'Vega measures how much an option\'s price changes for a 1% change in implied volatility.',
    xpReward: 200,
    difficulty: 'advanced'
  },
  {
    id: '4',
    question: 'When is a call option "in the money"?',
    choices: [
      'When the stock price is below the strike price',
      'When the stock price equals the strike price',
      'When the stock price is above the strike price',
      'When the option has high volume'
    ],
    correctChoice: 2,
    explanation: 'A call option is in the money when the current stock price is above the strike price.',
    xpReward: 100,
    difficulty: 'beginner'
  },
  {
    id: '5',
    question: 'What is the maximum loss for a long call option?',
    choices: [
      'Unlimited',
      'The strike price',
      'The premium paid',
      'The stock price'
    ],
    correctChoice: 2,
    explanation: 'The maximum loss for buying a call option is limited to the premium you paid for the option.',
    xpReward: 125,
    difficulty: 'beginner'
  }
];

export class QuizStore {
  static getCompletedQuizzes(): string[] {
    const stored = localStorage.getItem('completed_quizzes');
    return stored ? JSON.parse(stored) : [];
  }

  static markQuizCompleted(quizId: string): void {
    const completed = this.getCompletedQuizzes();
    if (!completed.includes(quizId)) {
      completed.push(quizId);
      localStorage.setItem('completed_quizzes', JSON.stringify(completed));
    }
  }

  static getNextQuiz(): Quiz | null {
    const completed = this.getCompletedQuizzes();
    const available = QUIZ_DATA.filter(quiz => !completed.includes(quiz.id));
    return available.length > 0 ? available[0] : null;
  }
}