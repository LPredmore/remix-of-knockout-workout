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
      exercise_favorites: {
        Row: {
          created_at: string
          exercise_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_favorites_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          created_by: string | null
          equipment: Database["public"]["Enums"]["equipment_enum"]
          id: string
          is_curated: boolean
          muscle_group: Database["public"]["Enums"]["muscle_group_enum"]
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          equipment: Database["public"]["Enums"]["equipment_enum"]
          id?: string
          is_curated?: boolean
          muscle_group: Database["public"]["Enums"]["muscle_group_enum"]
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          equipment?: Database["public"]["Enums"]["equipment_enum"]
          id?: string
          is_curated?: boolean
          muscle_group?: Database["public"]["Enums"]["muscle_group_enum"]
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_routine_id: string | null
          created_at: string
          onboarding_completed_at: string | null
          rep_max: number
          rep_min: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active_routine_id?: string | null
          created_at?: string
          onboarding_completed_at?: string | null
          rep_max?: number
          rep_min?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active_routine_id?: string | null
          created_at?: string
          onboarding_completed_at?: string | null
          rep_max?: number
          rep_min?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_active_routine_fk"
            columns: ["active_routine_id"]
            isOneToOne: false
            referencedRelation: "user_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      session_sets: {
        Row: {
          created_at: string
          id: string
          reps: number
          session_id: string
          set_number: number
          updated_at: string
          weight_lbs: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          reps: number
          session_id: string
          set_number: number
          updated_at?: string
          weight_lbs?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          reps?: number
          session_id?: string
          set_number?: number
          updated_at?: string
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_sets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          exercise_id: string
          first_set_metric: number | null
          first_set_reps: number | null
          first_set_weight_lbs: number | null
          id: string
          planned_sets: number
          started_at: string
          status: Database["public"]["Enums"]["session_status_enum"]
          target_rep_max: number
          target_rep_min: number
          total_reps: number | null
          total_volume: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          exercise_id: string
          first_set_metric?: number | null
          first_set_reps?: number | null
          first_set_weight_lbs?: number | null
          id?: string
          planned_sets: number
          started_at?: string
          status?: Database["public"]["Enums"]["session_status_enum"]
          target_rep_max: number
          target_rep_min: number
          total_reps?: number | null
          total_volume?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          exercise_id?: string
          first_set_metric?: number | null
          first_set_reps?: number | null
          first_set_weight_lbs?: number | null
          id?: string
          planned_sets?: number
          started_at?: string
          status?: Database["public"]["Enums"]["session_status_enum"]
          target_rep_max?: number
          target_rep_min?: number
          total_reps?: number | null
          total_volume?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_routine_days: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          muscle_group: Database["public"]["Enums"]["muscle_group_enum"]
          planned_sets: number
          sort_order: number
          stock_routine_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          muscle_group: Database["public"]["Enums"]["muscle_group_enum"]
          planned_sets: number
          sort_order: number
          stock_routine_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          muscle_group?: Database["public"]["Enums"]["muscle_group_enum"]
          planned_sets?: number
          sort_order?: number
          stock_routine_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_routine_days_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_routine_days_stock_routine_id_fkey"
            columns: ["stock_routine_id"]
            isOneToOne: false
            referencedRelation: "stock_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_routines: {
        Row: {
          created_at: string
          equipment: Database["public"]["Enums"]["equipment_enum"]
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          equipment: Database["public"]["Enums"]["equipment_enum"]
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          equipment?: Database["public"]["Enums"]["equipment_enum"]
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_routine_days: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          muscle_group: Database["public"]["Enums"]["muscle_group_enum"]
          planned_sets: number
          routine_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          muscle_group: Database["public"]["Enums"]["muscle_group_enum"]
          planned_sets: number
          routine_id: string
          sort_order: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          muscle_group?: Database["public"]["Enums"]["muscle_group_enum"]
          planned_sets?: number
          routine_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_routine_days_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_routine_days_routine_id_fkey"
            columns: ["routine_id"]
            isOneToOne: false
            referencedRelation: "user_routines"
            referencedColumns: ["id"]
          },
        ]
      }
      user_routines: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_onboarding: {
        Args: {
          selected_equipment: Database["public"]["Enums"]["equipment_enum"][]
        }
        Returns: string[]
      }
      recompute_session_aggregates: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      equipment_enum:
        | "BodyWeight"
        | "Dumbbells"
        | "Barbells"
        | "Cable"
        | "Bands"
        | "Kettlebell"
      muscle_group_enum:
        | "Chest"
        | "Back"
        | "Abs"
        | "Shoulders"
        | "Biceps"
        | "Triceps"
        | "Legs"
        | "Calves"
      session_status_enum: "in_progress" | "completed"
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
    Enums: {
      equipment_enum: [
        "BodyWeight",
        "Dumbbells",
        "Barbells",
        "Cable",
        "Bands",
        "Kettlebell",
      ],
      muscle_group_enum: [
        "Chest",
        "Back",
        "Abs",
        "Shoulders",
        "Biceps",
        "Triceps",
        "Legs",
        "Calves",
      ],
      session_status_enum: ["in_progress", "completed"],
    },
  },
} as const
