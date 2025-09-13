import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export type UserProfile = Tables<'users_profile'>;
export type Quiz = Tables<'quizzes'>;
export type QuizAttempt = Tables<'quiz_attempts'>;

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
}