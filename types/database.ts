export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          full_name: string | null
          is_paid: boolean
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          full_name?: string | null
          is_paid?: boolean
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          full_name?: string | null
          is_paid?: boolean
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      games: {
        Row: {
          id: string
          home_team: string
          away_team: string
          home_flag: string
          away_flag: string
          match_date: string
          stage: string
          group_name: string | null
          home_score: number | null
          away_score: number | null
          is_finished: boolean
          api_fixture_id: number | null
          created_at: string
        }
        Insert: {
          id?: string
          home_team: string
          away_team: string
          home_flag: string
          away_flag: string
          match_date: string
          stage: string
          group_name?: string | null
          home_score?: number | null
          away_score?: number | null
          is_finished?: boolean
          api_fixture_id?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          home_team?: string
          away_team?: string
          home_flag?: string
          away_flag?: string
          match_date?: string
          stage?: string
          group_name?: string | null
          home_score?: number | null
          away_score?: number | null
          is_finished?: boolean
          api_fixture_id?: number | null
          created_at?: string
        }
        Relationships: []
      }
      predictions: {
        Row: {
          id: string
          user_id: string
          game_id: string
          predicted_home_score: number
          predicted_away_score: number
          points_earned: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          predicted_home_score: number
          predicted_away_score: number
          points_earned?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          predicted_home_score?: number
          predicted_away_score?: number
          points_earned?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "predictions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      ranking_view: {
        Row: {
          user_id: string
          username: string
          avatar_url: string | null
          total_points: number
          total_predictions: number
          exact_scores: number
          exact_scores_hosts: number
          exact_scores_brazil: number
          correct_predictions: number
          position: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Functions: {
      calculate_game_points: {
        Args: { p_game_id: string }
        Returns: number
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      slugify_username: {
        Args: { raw_email: string }
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
