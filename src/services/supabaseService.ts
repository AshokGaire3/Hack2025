import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type UserProfile = Tables<'users_profile'>;
export type Quiz = Tables<'quizzes'>;
export type QuizAttempt = Tables<'quiz_attempts'>;

// Strategy Analyzer Types (for when tables are created)
export interface StrategyScenario {
  id: number;
  title: string;
  content: string;
  correct_strategy: string;
  difficulty: string;
  created_at?: string;
}

export interface StrategyAttempt {
  id?: string;
  user_id: string;
  scenario_id: number;
  user_input: string;
  predicted_strategy: string;
  correct_strategy: string;
  is_correct: boolean;
  attempt_number: number;
  xp_earned: number;
  created_at?: string;
}

export class SupabaseService {
  // User Profile Methods
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  }

  static async createUserProfile(profile: Partial<UserProfile> & { id: string }) {
    const { data, error } = await supabase
      .from('users_profile')
      .insert(profile)
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
    return data;
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('users_profile')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
    return data;
  }

  static async updateUserXP(userId: string, xpGained: number) {
    // First get current profile
    const profile = await this.getUserProfile(userId);
    if (!profile) throw new Error('User profile not found');

    const newTotalXP = (profile.total_xp || 0) + xpGained;
    const newLevel = Math.floor(newTotalXP / 100) + 1;

    return this.updateUserProfile(userId, {
      total_xp: newTotalXP,
      level: newLevel
    });
  }

  // Quiz Methods
  static async getQuizzes(): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .order('id');

    if (error) {
      console.error('Error fetching quizzes:', error);
      return [];
    }
    return data;
  }

  static async getQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz attempts:', error);
      return [];
    }
    return data;
  }

  static async submitQuizAttempt(
    userId: string,
    quizId: string,
    answers: Record<string, any>,
    score: number,
    maxScore: number,
    passed: boolean
  ) {
    const percentage = (score / maxScore) * 100;

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        answers,
        score,
        max_score: maxScore,
        percentage,
        passed
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }

    return data;
  }

  // Leaderboard Methods
  static async getLeaderboard(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .order('total_xp', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    return data;
  }

  // User Progress Methods
  static async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .from('user_progress_summary')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok
      console.error('Error fetching user progress:', error);
    }
    return data;
  }

  // Strategy Analyzer Methods
  
  // Get user's strategy attempts for a specific scenario
  static async getStrategyAttempts(userId: string, scenarioId?: number): Promise<StrategyAttempt[]> {
    try {
      let query = supabase
        .from('strategy_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (scenarioId) {
        query = query.eq('scenario_id', scenarioId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching strategy attempts:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Strategy attempts table may not exist yet:', error);
      return [];
    }
  }

  // Submit a strategy attempt
  static async submitStrategyAttempt(attempt: Omit<StrategyAttempt, 'id' | 'created_at'>): Promise<StrategyAttempt | null> {
    try {
      const { data, error } = await supabase
        .from('strategy_attempts')
        .insert(attempt)
        .select()
        .single();

      if (error) {
        console.error('Error submitting strategy attempt:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Strategy attempts table may not exist yet:', error);
      return null;
    }
  }

  // Get user's completed scenarios
  static async getCompletedScenarios(userId: string): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from('strategy_attempts')
        .select('scenario_id')
        .eq('user_id', userId)
        .eq('is_correct', true);

      if (error) {
        console.error('Error fetching completed scenarios:', error);
        return [];
      }
      return data?.map(row => row.scenario_id) || [];
    } catch (error) {
      console.error('Strategy attempts table may not exist yet:', error);
      return [];
    }
  }

  // Get user's attempt count for a specific scenario
  static async getScenarioAttemptCount(userId: string, scenarioId: number): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('strategy_attempts')
        .select('id')
        .eq('user_id', userId)
        .eq('scenario_id', scenarioId);

      if (error) {
        console.error('Error fetching scenario attempt count:', error);
        return 0;
      }
      return data?.length || 0;
    } catch (error) {
      console.error('Strategy attempts table may not exist yet:', error);
      return 0;
    }
  }

  // Initialize strategy scenarios (run once to populate the database)
  static async initializeStrategyScenarios(): Promise<void> {
    const scenarios: Omit<StrategyScenario, 'created_at'>[] = [
      {
        id: 1,
        title: "🚀 Anticipation of a New Product Launch",
        content: "A company called 'Techtron' is rumored to unveil a groundbreaking product next month. You expect the stock price to rise significantly. How would you invest?",
        correct_strategy: "BULLISH",
        difficulty: "beginner"
      },
      {
        id: 2,
        title: "📉 Rising Competition Threat",
        content: "You currently own 100 shares of 'EnergySolutions' purchased at $50 each. A strong new competitor is entering the market, and you worry the stock might fall. How would you protect your investment?",
        correct_strategy: "HEDGING",
        difficulty: "intermediate"
      },
      {
        id: 3,
        title: "💥 Uncertainty Around Earnings Report",
        content: "'BioHealth' is about to release its quarterly earnings. The results could send the stock sharply up or down. You are not sure about the direction, but you expect extreme volatility. What strategy would you use?",
        correct_strategy: "VOLATILITY",
        difficulty: "advanced"
      },
      {
        id: 4,
        title: "🌍 Geopolitical Tensions",
        content: "Rising geopolitical tensions in Eastern Europe are causing market uncertainty. You hold no positions yet, but expect sudden downward moves in the overall market index. How would you position yourself with options?",
        correct_strategy: "BEARISH",
        difficulty: "intermediate"
      },
      {
        id: 5,
        title: "💡 Merger Rumor Buzz",
        content: "News outlets are speculating that 'RetailOne' may merge with a larger competitor. If the deal goes through, the stock may skyrocket; if not, it could crash. How would you take advantage of this rumor using options?",
        correct_strategy: "VOLATILITY",
        difficulty: "advanced"
      },
      {
        id: 6,
        title: "📊 Interest Rate Announcement",
        content: "The Federal Reserve is about to announce its decision on interest rates. Markets often react strongly to such news, but it is unclear whether the rates will rise or fall. How would you use options to prepare?",
        correct_strategy: "VOLATILITY",
        difficulty: "advanced"
      },
      {
        id: 7,
        title: "🎮 Gaming Stock Hype",
        content: "'PixelPlay', a gaming company, is launching its long-awaited blockbuster game this week. You believe the hype could push the stock up temporarily, but you are unsure about its long-term success. What's your play?",
        correct_strategy: "BULLISH",
        difficulty: "beginner"
      },
      {
        id: 8,
        title: "🛢️ Oil Price Shock",
        content: "Due to sudden supply chain disruptions, oil prices are swinging wildly. You are considering taking a position in 'GlobalOil' but are unsure whether prices will stabilize or continue to fluctuate. How would you trade options here?",
        correct_strategy: "VOLATILITY",
        difficulty: "advanced"
      },
      {
        id: 9,
        title: "📦 Tech Stock Overvaluation?",
        content: "'CloudNet' stock has doubled in the past 6 months. Analysts are split: some say it's still undervalued, others warn of a bubble. You are cautious but want to explore opportunities with limited downside risk. What's your strategy?",
        correct_strategy: "HEDGING",
        difficulty: "intermediate"
      }
    ];

    try {
      const { error } = await supabase
        .from('strategy_scenarios')
        .upsert(scenarios, { onConflict: 'id' });

      if (error) {
        console.error('Error initializing strategy scenarios:', error);
      } else {
        console.log('Strategy scenarios initialized successfully');
      }
    } catch (error) {
      console.error('Strategy scenarios table may not exist yet:', error);
    }
  }
}