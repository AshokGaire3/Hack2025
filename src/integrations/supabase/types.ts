export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      daily_streaks: {
        Row: {
          activity_count: number | null
          exp_earned: number | null
          id: string
          streak_date: string
          user_id: string
        }
        Insert: {
          activity_count?: number | null
          exp_earned?: number | null
          id?: string
          streak_date: string
          user_id: string
        }
        Update: {
          activity_count?: number | null
          exp_earned?: number | null
          id?: string
          streak_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "daily_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "daily_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      experience_logs: {
        Row: {
          activity_type: string
          exp_gained: number
          id: string
          metadata: Json | null
          timestamp: string | null
          total_exp_after: number
          user_id: string
        }
        Insert: {
          activity_type: string
          exp_gained: number
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          total_exp_after: number
          user_id: string
        }
        Update: {
          activity_type?: string
          exp_gained?: number
          id?: string
          metadata?: Json | null
          timestamp?: string | null
          total_exp_after?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experience_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "experience_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "experience_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      learning_progress: {
        Row: {
          completed_at: string | null
          content_id: string
          content_type: string
          id: string
          last_accessed: string | null
          progress_percentage: number | null
          status: string | null
          time_spent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          content_id: string
          content_type: string
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          status?: string | null
          time_spent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          content_id?: string
          content_type?: string
          id?: string
          last_accessed?: string | null
          progress_percentage?: number | null
          status?: string | null
          time_spent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "learning_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "learning_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json
          attempt_number: number | null
          completed_at: string | null
          id: string
          max_score: number
          passed: boolean | null
          percentage: number
          quiz_id: string
          score: number
          time_taken: number | null
          user_id: string
        }
        Insert: {
          answers: Json
          attempt_number?: number | null
          completed_at?: string | null
          id?: string
          max_score: number
          passed?: boolean | null
          percentage: number
          quiz_id: string
          score: number
          time_taken?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          attempt_number?: number | null
          completed_at?: string | null
          id?: string
          max_score?: number
          passed?: boolean | null
          percentage?: number
          quiz_id?: string
          score?: number
          time_taken?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      quizzes: {
        Row: {
          choices: Json
          correct_choice: number
          created_at: string | null
          difficulty: string
          id: number
          question: string
          xp_reward: number
        }
        Insert: {
          choices: Json
          correct_choice: number
          created_at?: string | null
          difficulty: string
          id?: number
          question: string
          xp_reward?: number
        }
        Update: {
          choices?: Json
          correct_choice?: number
          created_at?: string | null
          difficulty?: string
          id?: number
          question?: string
          xp_reward?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_description: string | null
          achievement_id: string
          achievement_name: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_description?: string | null
          achievement_id: string
          achievement_name: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_description?: string | null
          achievement_id?: string
          achievement_name?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "leaderboard"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_statistics"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          badges: Json | null
          completed_quizzes: string[] | null
          created_at: string | null
          email: string | null
          id: string
          last_active: string | null
          learning_streak: number | null
          level: number | null
          total_exp: number | null
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          badges?: Json | null
          completed_quizzes?: string[] | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_active?: string | null
          learning_streak?: number | null
          level?: number | null
          total_exp?: number | null
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          badges?: Json | null
          completed_quizzes?: string[] | null
          created_at?: string | null
          email?: string | null
          id?: string
          last_active?: string | null
          learning_streak?: number | null
          level?: number | null
          total_exp?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      user_quiz_progress: {
        Row: {
          attempts: number | null
          best_score: number | null
          earned_xp: number | null
          id: number
          last_attempted: string | null
          quiz_id: number
          user_id: string
        }
        Insert: {
          attempts?: number | null
          best_score?: number | null
          earned_xp?: number | null
          id?: number
          last_attempted?: string | null
          quiz_id: number
          user_id: string
        }
        Update: {
          attempts?: number | null
          best_score?: number | null
          earned_xp?: number | null
          id?: number
          last_attempted?: string | null
          quiz_id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_progress_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_statistics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_progress_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_progress_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_quiz_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      users_profile: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          level: number | null
          total_xp: number | null
          username: string
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          level?: number | null
          total_xp?: number | null
          username: string
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          level?: number | null
          total_xp?: number | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard: {
        Row: {
          badges: Json | null
          last_active: string | null
          learning_streak: number | null
          level: number | null
          rank: number | null
          total_exp: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      quiz_statistics: {
        Row: {
          avg_attempts_per_user: number | null
          difficulty: string | null
          id: number | null
          question: string | null
          success_rate: number | null
          successful_attempts: number | null
          total_attempts: number | null
          xp_reward: number | null
        }
        Relationships: []
      }
      user_progress_summary: {
        Row: {
          avg_score: number | null
          balance: number | null
          id: string | null
          last_quiz_attempt: string | null
          level: number | null
          quizzes_attempted: number | null
          quizzes_completed: number | null
          total_xp: number | null
          username: string | null
          xp_from_quizzes: number | null
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          badges_count: number | null
          completed_quizzes_count: number | null
          last_active: string | null
          learning_streak: number | null
          level: number | null
          passed_quiz_attempts: number | null
          quiz_success_rate: number | null
          total_activities: number | null
          total_exp: number | null
          total_quiz_attempts: number | null
          total_quizzes_attempted: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_user_level: {
        Args: { xp: number }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
